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

// Definition for a single column
export interface ColumnDefinition<T extends DataItem> {
  key: string; // Key in the data object (use dot notation for nested keys e.g., 'user.name')
  header: string; // Text to display in the table header
  sortable?: boolean; // Whether this column should be sortable (defaults to true if key exists)
  render?: (item: T) => React.ReactNode; // Optional custom render function for the cell
}

// Theme type for DataViewX
export interface Theme {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  accent?: string;
  [key: string]: string | undefined;
}

// Grid fields mapping for dynamic grid rendering
export interface GridFields {
  id: string;
  title: string;
  subtitle?: string;
  body?: string;
  date?: string;
  dateInfo?: string;
}

// Props for the DataViewX component
export interface DataViewXProps<T extends DataItem> {
  display?: 'grid' | 'list';
  getApi: string; // Base API URL without query params
  token?: string;
  emptyStateComponent?: React.ReactNode;
  itemsPerPageOptions?: number[];
  initialItemsPerPage?: number;
  columns?: ColumnDefinition<T>[]; // Optional array to define columns
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
  theme?: Theme;
  gridFields?: GridFields;
} 