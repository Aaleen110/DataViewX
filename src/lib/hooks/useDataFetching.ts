import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { ApiResponse, DataItem, SortState, SortDirection } from '../types';

interface UseDataFetchingProps<T extends DataItem> {
    getApi: string;
    token?: string;
    initialItemsPerPage?: number;
    transformResponse?: (response: any) => ApiResponse<T>;
    dataPath?: string;
    totalPath?: string;
    pagePath?: string;
    totalPagesPath?: string;
    searchParamKey?: string;
    pageParamKey?: string;
    limitParamKey?: string;
    sortParamKey?: string;
}

// Helper to get nested property value
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function useDataFetching<T extends DataItem>({
    getApi,
    token,
    initialItemsPerPage = 10,
    transformResponse,
    dataPath = 'data.list',
    totalPath = 'data.total',
    pagePath = 'data.page',
    totalPagesPath = 'data.totalPages',
    searchParamKey = 'search',
    pageParamKey = 'page',
    limitParamKey = 'limit',
    sortParamKey = 'sort', // Example: sort=column,direction
}: UseDataFetchingProps<T>) {
    const [data, setData] = useState<T[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append(pageParamKey, String(currentPage));
        params.append(limitParamKey, String(itemsPerPage));
        if (searchTerm) {
            params.append(searchParamKey, searchTerm);
        }
        if (sortState.column && sortState.direction) {
            params.append(sortParamKey, `${sortState.column},${sortState.direction}`);
        }

        const url = `${getApi}?${params.toString()}`;

        const config: AxiosRequestConfig = {};
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }

        try {
            const response = await axios.get(url, config);
            const processedResponse: ApiResponse<T> = transformResponse ? transformResponse(response.data) : response.data;

            // Use path helpers to extract data
            const list = getNestedValue(processedResponse, dataPath) || [];
            const total = getNestedValue(processedResponse, totalPath) || 0;
            // const page = getNestedValue(processedResponse, pagePath) || 1;
            const totalPages = getNestedValue(processedResponse, totalPagesPath) || 0;

            setData(list);
            setTotalItems(total);
            // setCurrentPage(Number(page)); // Let the state manage the current page
            setTotalPages(totalPages);

        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(err.message || 'Failed to fetch data');
            setData([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [getApi, token, currentPage, itemsPerPage, searchTerm, sortState, transformResponse, dataPath, totalPath, pagePath, totalPagesPath, searchParamKey, pageParamKey, limitParamKey, sortParamKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Dependency array includes fetchData which includes all its own dependencies

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (num: number) => {
        setItemsPerPage(num);
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    const handleSort = (column: string) => {
        setSortState(prevState => {
            let direction: SortDirection = 'asc';
            if (prevState.column === column && prevState.direction === 'asc') {
                direction = 'desc';
            } else if (prevState.column === column && prevState.direction === 'desc') {
                // Optional: Cycle back to no sort or stay descending
                direction = null; // Cycle back to unsorted
                 column = null; // Reset column as well
            }
            return { column, direction };
        });
        setCurrentPage(1); // Reset page on sort change
    };

    return {
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
        setItemsPerPage // Expose setter if needed for dropdown
    };
} 