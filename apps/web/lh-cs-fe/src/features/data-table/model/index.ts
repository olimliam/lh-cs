export interface DataTableColumn<T = Record<string, unknown>> {
  id: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
  accessor?: keyof T | string;
}

export interface DataTableFilter {
  id: string;
  value: unknown;
  operator?:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte';
}

export interface DataTableSort {
  id: string;
  direction: 'asc' | 'desc';
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: DataTablePagination;
  sorting?: DataTableSort;
  filters?: DataTableFilter[];
  searchable?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSort?: (sort: DataTableSort) => void;
  onFilter?: (filters: DataTableFilter[]) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearch?: (query: string) => void;
  onRowSelect?: (selectedRows: string[]) => void;
  onRowClick?: (row: T) => void;
  actions?: DataTableAction<T>[];
}

export interface DataTableAction<T = Record<string, unknown>> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  visible?: (row: T) => boolean;
}
