// Define your library types here

// Example API response structure (adjust based on actual API)
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: {
    list: T[];
    total: number;
    page: string | number; // API might return string or number
    totalPages: number;
  };
}

// Generic type for list items (can be refined)
export type DataItem = Record<string, any>;

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

// Props for the DataViewX component
export interface DataViewXProps<T extends DataItem> {
  display?: 'grid' | 'list';
  getApi: string; // Base API URL without query params
  token?: string;
  emptyStateComponent?: React.ReactNode;
  itemsPerPageOptions?: number[];
  initialItemsPerPage?: number;
  // Optional: Function to transform API response if it differs from expected structure
  transformResponse?: (response: any) => ApiResponse<T>;
  // Optional: Props to handle API variations
  dataPath?: string; // e.g., 'data.list' or 'results'
  totalPath?: string; // e.g., 'data.total' or 'count'
  pagePath?: string; // e.g., 'data.page' or 'currentPage'
  totalPagesPath?: string; // e.g., 'data.totalPages' or 'numPages'
  // Optional: Props to customize API query params
  searchParamKey?: string; // default 'search'
  pageParamKey?: string; // default 'page'
  limitParamKey?: string; // default 'limit'
  sortParamKey?: string; // default 'sort' (e.g., 'sort=column,direction')
} 