import React, { useState, useEffect, useMemo, ChangeEvent, useCallback } from 'react';
import {
    FiSearch, FiList, FiGrid, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi'; // Using react-icons
import { TbArrowsSort, TbSortDescending, TbSortAscending } from "react-icons/tb";

import { useDataFetching } from '../../hooks/useDataFetching';
import { DataViewXProps, DataItem, ColumnDefinition, Theme } from '../../types';
import styles from './DataViewX.module.css';

// Default Empty State Component
const DefaultEmptyState = () => (
    <div className={styles.empty}>No data available.</div>
);

// Helper to format column headers (e.g., 'createdAt' -> 'Created At')
const formatHeader = (key: string): string => {
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise(resolve => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => resolve(func(...args)), waitFor);
        });
}

// Helper to get nested property value (dot notation)
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function DataViewX<T extends DataItem>({
    display = 'list',
    getApi,
    token,
    emptyStateComponent = <DefaultEmptyState />,
    itemsPerPageOptions = [10, 25, 50, 100],
    initialItemsPerPage = 10,
    transformResponse,
    dataPath,
    totalPath,
    pagePath,
    totalPagesPath,
    searchParamKey,
    pageParamKey,
    limitParamKey,
    sortParamKey,
    columns,
    theme
}: DataViewXProps<T>) {
    const [currentView, setCurrentView] = useState<'list' | 'grid'>(display);
    const [localSearchTerm, setLocalSearchTerm] = useState('');

    const {
        data,
        loading,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        sortState,
        handleSearch,
        handlePageChange,
        handleItemsPerPageChange,
        handleSort,
        setItemsPerPage
    } = useDataFetching<T>({
        getApi,
        token,
        initialItemsPerPage,
        transformResponse,
        dataPath,
        totalPath,
        pagePath,
        totalPagesPath,
        searchParamKey,
        pageParamKey,
        limitParamKey,
        sortParamKey
    });

    // Debounce the search handler
    const debouncedSearch = useCallback(debounce(handleSearch, 500), [handleSearch]);

    const handleLocalSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setLocalSearchTerm(term);
        if (term === '') {
            handleSearch('');
        }
        // No API call here for non-empty, only update local state
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch(localSearchTerm);
        }
    };

    // Use columns prop if provided, otherwise fallback to dynamic headers
    const columnDefs: ColumnDefinition<T>[] = useMemo(() => {
        if (columns && columns.length > 0) return columns;
        if (data.length === 0) return [];
        // Fallback: generate columns from data keys
        return Object.keys(data[0]).map(key => ({ key, header: formatHeader(key), sortable: true }));
    }, [columns, data]);

    const renderSortIcon = (column: string, sortable: boolean = true) => {
        if (!sortable) return null;
        if (sortState.column !== column) {
            return <TbArrowsSort className={styles.sortIcon} />;
        }
        if (sortState.direction === 'asc') {
            return <TbSortAscending className={`${styles.sortIcon} ${styles.active}`} />;
        }
        if (sortState.direction === 'desc') {
            return <TbSortDescending className={`${styles.sortIcon} ${styles.active}`} />;
        }
        return <TbArrowsSort className={styles.sortIcon} />;
    };

    const renderListView = () => (
        <table className={styles.table}>
            <thead>
                <tr>
                    {columnDefs.map(col => (
                        <th
                            key={col.key}
                            onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                            style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '14px' }}>
                                {col.header}
                                {renderSortIcon(col.key, col.sortable !== false)}
                            </span>
                        </th>
                    ))}
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={(item.id || index) as React.Key}>
                        {columnDefs.map(col => (
                            <td key={col.key}>
                                {col.render
                                    ? col.render(item)
                                    : String(getNestedValue(item, col.key) ?? '')}
                            </td>
                        ))}
                        <td>
                            <button style={{ marginRight: '5px', opacity: 0.5, cursor: 'not-allowed' }} title="Not implemented">📄</button>
                            <button style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Not implemented">⋮</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderGridView = () => (
        <div className={styles.grid}>
            {data.map((item, index) => (
                <div key={(item.id || index) as React.Key} className={styles.gridItem}>
                    {columnDefs.map(col => (
                        <div key={col.key}>
                            <strong>{col.header}:</strong>{' '}
                            {col.render
                                ? col.render(item)
                                : String(getNestedValue(item, col.key) ?? '')}
                        </div>
                    ))}
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                        <button style={{ marginRight: '5px', opacity: 0.5, cursor: 'not-allowed' }} title="Not implemented">📄</button>
                        <button style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Not implemented">⋮</button>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderPagination = () => {
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        const pageNumbers: (number | string)[] = [];
        const maxPagesToShow = 5;
        const halfMaxPages = Math.floor(maxPagesToShow / 2);
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > halfMaxPages + 1) {
                pageNumbers.push('...');
            }
            let startPage = Math.max(2, currentPage - halfMaxPages + (currentPage > totalPages - halfMaxPages ? (totalPages - currentPage - halfMaxPages + 1) : 0));
            let endPage = Math.min(totalPages - 1, currentPage + halfMaxPages - (currentPage < halfMaxPages + 1 ? (halfMaxPages - currentPage + 1) : 0));
            if (currentPage <= halfMaxPages) {
                endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
            }
            if (currentPage >= totalPages - halfMaxPages + 1) {
                startPage = Math.max(2, totalPages - maxPagesToShow + 2);
            }
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            if (currentPage < totalPages - halfMaxPages) {
                pageNumbers.push('...');
            }
            pageNumbers.push(totalPages);
        }
        return (
            <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                    Showing {startItem} to {endItem} of {totalItems} results
                </div>
                <div className={styles.paginationControls}>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        aria-label="Items per page"
                    >
                        {itemsPerPageOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        aria-label="Previous page"
                    >
                        <FiChevronLeft />
                    </button>
                    <span className={styles.pageNumbers}>
                        {pageNumbers.map((num, index) =>
                            typeof num === 'number' ? (
                                <button
                                    key={num}
                                    onClick={() => handlePageChange(num)}
                                    className={currentPage === num ? styles.active : ''}
                                    disabled={loading}
                                    aria-label={`Go to page ${num}`}
                                    aria-current={currentPage === num ? 'page' : undefined}
                                >
                                    {num}
                                </button>
                            ) : (
                                <span key={`ellipsis-${index}`} style={{ padding: '6px 10px', display: 'inline-block' }}>...</span>
                            )
                        )}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading || totalPages === 0}
                        aria-label="Next page"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>
        );
    };

    // Default theme
    const defaultTheme: Theme = {
        primary: '#2563eb',
        secondary: '#e0e7ef',
        background: '#fff',
        text: '#222',
        accent: '#f59e42',
    };
    const mergedTheme = { ...defaultTheme, ...theme };
    const themeVars = {
        '--primary': mergedTheme.primary,
        '--secondary': mergedTheme.secondary,
        '--background': mergedTheme.background,
        '--text': mergedTheme.text,
        '--accent': mergedTheme.accent,
    } as React.CSSProperties;

    return (
        <div className={styles.container} style={themeVars}>
            <div className={styles.header}>
                <div className={styles.searchContainer}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={localSearchTerm}
                        onChange={handleLocalSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        className={styles.searchInput}
                        // disabled={loading}
                        aria-label="Search data"
                    />
                </div>
                <div className={styles.viewToggle}>
                    <button
                        onClick={() => setCurrentView('list')}
                        className={currentView === 'list' ? styles.active : ''}
                        disabled={loading}
                        aria-label="Switch to list view"
                        aria-pressed={currentView === 'list'}
                    >
                        <FiList />
                    </button>
                    <button
                        onClick={() => setCurrentView('grid')}
                        className={currentView === 'grid' ? styles.active : ''}
                        disabled={loading}
                        aria-label="Switch to grid view"
                        aria-pressed={currentView === 'grid'}
                    >
                        <FiGrid />
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                {loading && <div className={styles.loading}>Loading...</div>}
                {error && <div className={styles.error}>Error: {error}</div>}
                {!loading && !error && data.length === 0 && emptyStateComponent}
                {!loading && !error && data.length > 0 && (
                    currentView === 'list' ? renderListView() : renderGridView()
                )}
            </div>

            {!loading && !error && totalItems > 0 && renderPagination()}
        </div>
    );
}

// Export DataViewX as default if it's the primary export, or named
// export default DataViewX; // Use named export for library consistency 