import {
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import type {
  DataTableColumn,
  DataTableFilter,
  DataTableProps,
} from '../model';

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  pagination,
  sorting,
  filters = [],
  searchable = true,
  selectable = false,
  selectedRows = [],
  onSort,
  onFilter,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onRowSelect,
  onRowClick,
  actions = [],
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localFilters, setLocalFilters] = useState<DataTableFilter[]>(filters);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedActionRow, setSelectedActionRow] = useState<T | null>(null);

  // 검색 필터링된 데이터
  const filteredData = useMemo(() => {
    if (!searchQuery && localFilters.length === 0) return data;

    return data.filter((row) => {
      // 검색 쿼리 필터링
      if (searchQuery) {
        const searchMatch = columns.some((column) => {
          const accessor = column.accessor as keyof T;
          const value = accessor ? row[accessor] : '';
          return String(value)
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });
        if (!searchMatch) return false;
      }

      // 컬럼 필터링
      if (localFilters.length > 0) {
        const filterMatch = localFilters.every((filter) => {
          const column = columns.find((col) => col.id === filter.id);
          if (!column) return true;

          const accessor = column.accessor as keyof T;
          const value = accessor ? row[accessor] : '';

          switch (filter.operator) {
            case 'contains':
              return String(value)
                .toLowerCase()
                .includes(String(filter.value).toLowerCase());
            case 'equals':
              return value === filter.value;
            case 'startsWith':
              return String(value)
                .toLowerCase()
                .startsWith(String(filter.value).toLowerCase());
            case 'endsWith':
              return String(value)
                .toLowerCase()
                .endsWith(String(filter.value).toLowerCase());
            default:
              return true;
          }
        });
        if (!filterMatch) return false;
      }

      return true;
    });
  }, [data, searchQuery, localFilters, columns]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSort = (columnId: string) => {
    if (!onSort) return;

    const newDirection =
      sorting?.id === columnId && sorting.direction === 'asc' ? 'desc' : 'asc';
    onSort({ id: columnId, direction: newDirection });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onRowSelect) return;

    if (event.target.checked) {
      const allIds = filteredData.map((_, index) => String(index));
      onRowSelect(allIds);
    } else {
      onRowSelect([]);
    }
  };

  const handleRowSelect = (rowId: string) => {
    if (!onRowSelect) return;

    const newSelection = selectedRows.includes(rowId)
      ? selectedRows.filter((id) => id !== rowId)
      : [...selectedRows, rowId];

    onRowSelect(newSelection);
  };

  const handleActionMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    row: T
  ) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedActionRow(row);
  };

  const handleActionMenuClose = () => {
    setActionAnchorEl(null);
    setSelectedActionRow(null);
  };

  const handleActionClick = (action: (typeof actions)[0]) => {
    if (selectedActionRow) {
      action.onClick(selectedActionRow);
    }
    handleActionMenuClose();
  };

  const renderCellValue = (column: DataTableColumn<T>, row: T) => {
    if (column.render) {
      const accessor = column.accessor as keyof T;
      const value = accessor ? row[accessor] : '';
      return column.render(value, row);
    }

    const accessor = column.accessor as keyof T;
    return accessor ? String(row[accessor]) : '';
  };

  const isSelected = selectedRows.length > 0;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < filteredData.length;
  const isAllSelected =
    selectedRows.length === filteredData.length && filteredData.length > 0;

  return (
    <Paper elevation={2}>
      {/* 테이블 툴바 */}
      <Toolbar sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 2 }}>
          {searchable && (
            <TextField
              size='small'
              placeholder='검색...'
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
              sx={{ minWidth: 200 }}
            />
          )}

          {localFilters.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {localFilters.map((filter) => (
                <Chip
                  key={filter.id}
                  label={`${filter.id}: ${filter.value}`}
                  size='small'
                  onDelete={() => {
                    const newFilters = localFilters.filter(
                      (f) => f.id !== filter.id
                    );
                    setLocalFilters(newFilters);
                    if (onFilter) onFilter(newFilters);
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isSelected && (
            <Typography variant='body2' color='text.secondary'>
              {selectedRows.length}개 선택됨
            </Typography>
          )}

          <Tooltip title='필터'>
            <IconButton size='small'>
              <FilterIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='내보내기'>
            <IconButton size='small'>
              <ExportIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* 테이블 */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding='checkbox'>
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}

              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sorting?.id === column.id}
                      direction={
                        sorting?.id === column.id ? sorting.direction : 'asc'
                      }
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}

              {actions.length > 0 && (
                <TableCell align='center' style={{ width: 60 }}>
                  작업
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                >
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', py: 3 }}
                  >
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                >
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터가 없습니다.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, index) => {
                const rowId = String(index);
                const isRowSelected = selectedRows.includes(rowId);

                return (
                  <TableRow
                    key={rowId}
                    hover
                    selected={isRowSelected}
                    onClick={() => onRowClick?.(row)}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding='checkbox'>
                        <Checkbox
                          checked={isRowSelected}
                          onChange={() => handleRowSelect(rowId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {renderCellValue(column, row)}
                      </TableCell>
                    ))}

                    {actions.length > 0 && (
                      <TableCell align='center'>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionMenuOpen(e, row);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      {pagination && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              페이지당 행 수:
            </Typography>
            <FormControl size='small' sx={{ minWidth: 80 }}>
              <Select
                value={pagination.pageSize}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant='body2' color='text.secondary'>
              총 {pagination.total}개 중{' '}
              {(pagination.page - 1) * pagination.pageSize + 1}-
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )}
              개
            </Typography>
          </Box>

          <Pagination
            count={Math.ceil(pagination.total / pagination.pageSize)}
            page={pagination.page}
            onChange={(_, page) => onPageChange?.(page)}
            color='primary'
            shape='rounded'
          />
        </Box>
      )}

      {/* 액션 메뉴 */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionMenuClose}
      >
        {actions.map((action) => {
          const isVisible = selectedActionRow
            ? (action.visible?.(selectedActionRow) ?? true)
            : true;
          const isDisabled = selectedActionRow
            ? (action.disabled?.(selectedActionRow) ?? false)
            : false;

          if (!isVisible) return null;

          return (
            <MenuItem
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={isDisabled}
            >
              {action.icon && (
                <Box sx={{ mr: 1, display: 'flex' }}>{action.icon}</Box>
              )}
              {action.label}
            </MenuItem>
          );
        })}
      </Menu>
    </Paper>
  );
}

export default DataTable;
