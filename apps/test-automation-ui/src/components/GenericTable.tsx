// apps/test-automation-ui/src/components/GenericTable.tsx
import React, { useState, useMemo } from 'react';
import './GenericTable.css';
import { useAuth } from '@asafarim/shared-ui-react';
import { useToast } from '@asafarim/toast';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SortIcon, SortDirection } from './SortIcon';

type SortableValue = string | number | boolean | Date | null | undefined;

export interface ColumnDefinition<T> {
  header: string;
  field?: keyof T;
  render?: (item: T, key?: keyof T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  dataTestId?: string;
  sortable?: boolean;
  sortField?: keyof T;
  inListView?: boolean;
  sortAccessor?: (item: T) => SortableValue;
}

interface GenericTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  customActions?: (item: T) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  showActions?: boolean;
  editLabel?: string;
  deleteLabel?: string;
  getItemId: (item: T) => string;
  renderExpandedRow?: (item: T) => React.ReactNode;
  expandLabel?: string;
}

export function GenericTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  customActions,
  loading = false,
  emptyMessage = 'No items found',
  className = '',
  showActions = true,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  getItemId,
  renderExpandedRow,
  expandLabel = 'View Details',
}: GenericTableProps<T>) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [sortAccessor, setSortAccessor] = useState<((item: T) => SortableValue) | undefined>(
    undefined,
  );

  const toggleRow = (itemId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleSort = (column: ColumnDefinition<T>) => {
    if (!column.sortable) return;

    const field = column.sortField || column.field;
    const accessor = column.sortAccessor;
    if (!field && !accessor) return;

    const normalizedField = (field ?? null) as keyof T | null;

    if (sortField === normalizedField && sortAccessor === accessor) {
      // Cycle through: null -> asc -> desc -> null
      if (sortDirection === null) {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortDirection(null);
        setSortField(null);
        setSortAccessor(undefined);
      }
    } else {
      setSortField(normalizedField);
      setSortDirection('asc');
      // When storing a function in React state, wrap it in an updater so React
      // doesn't treat the column's accessor as the updater itself. This causes
      // React to store the accessor function as the state value.
      setSortAccessor(() => accessor ?? undefined);
    }
  };

  const sortedData = useMemo(() => {
    if ((!sortField && !sortAccessor) || !sortDirection) return data;

    const activeAccessor = sortAccessor;

    return [...data].sort((a, b) => {
      const aValue = activeAccessor ? activeAccessor(a) : sortField ? a[sortField] : null;
      const bValue = activeAccessor ? activeAccessor(b) : sortField ? b[sortField] : null;

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Type-safe comparison
      let comparison = 0;

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      }
      // Handle strings that might be dates
      else if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          comparison = aDate.getTime() - bDate.getTime();
        } else {
          comparison = aValue.localeCompare(bValue);
        }
      }
      // Handle numbers
      else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      // Handle booleans
      else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
      }
      // Fallback to string comparison
      else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection, sortAccessor]);

  if (loading) {
    return <div className="loading" data-testid="table-loading">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="empty-state" data-testid="table-empty">{emptyMessage}</div>;
  }

  const renderCell = (item: T, column: ColumnDefinition<T>) => {
    if (column.render) {
      return column.render(item);
    }
    if (column.field) {
      const value = item[column.field];
      return value !== null && value !== undefined ? String(value) : '';
    }
    return '';
  };

  return (
    <div className="table-container" data-testid="table-container">
      <table id="generic-table" className={className + ' generic-table'} data-testid="generic-table">
        <thead>
          <tr data-testid="table-header-row">
            {columns.map((column, index) => {
              const field = column.sortField || column.field;
              const accessor = column.sortAccessor;
              const isSorted = sortField === field && sortAccessor === accessor;
              const currentSortDirection = isSorted ? sortDirection : null;

              return (
                <th
                  key={index}
                  style={{
                    textAlign: column.align || 'left',
                    width: column.width,
                    cursor: column.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  onClick={() => handleSort(column)}
                  data-testid={column.dataTestId || `table-header-${index}`}
                  title={column.sortable ? 'Click to sort' : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start' }}>
                    <span>{column.header}</span>
                    {column.sortable && <SortIcon direction={currentSortDirection} />}
                  </div>
                </th>
              );
            })}
            <th style={{ textAlign: 'right' }} data-testid="table-header-actions">
                Actions
              </th>
          </tr>
        </thead>
        <tbody data-testid="table-body">
          {sortedData.map((item) => {
            const itemId = getItemId(item);
            const isExpanded = expandedRows.has(itemId);
            
            return (
              <React.Fragment key={itemId}>
                <tr data-testid={`table-row-${itemId}`}>
                  {columns.map((column, index) => (
                    <td
                      key={index}
                      style={{
                        textAlign: column.align || 'left',
                      }}
                      data-testid={`table-cell-${itemId}-${index}`}
                      data-label={column.header}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {showActions && onEdit && onDelete && (
                    <td style={{ textAlign: 'right' }} data-testid={`table-actions-${itemId}`} data-label="Actions">
                      <div className="actions">
                        {renderExpandedRow && (
                          <button
                            className="button button-ghost"
                            onClick={() => toggleRow(itemId)}
                            data-testid={`expand-button-${itemId}`}
                            title={isExpanded ? 'Collapse' : expandLabel}
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            {isExpanded ? 'Hide' : expandLabel}
                          </button>
                        )}
                        {customActions && customActions(item)}
                        <button
                          className="button button-secondary"
                          onClick={() => {
                            if (!isAuthenticated && !authLoading) {
                              toast.error("You must be authenticated to edit items.");
                              return;
                            }
                            onEdit(item);}}
                          data-testid={`edit-button-${itemId}`}
                        >
                          {editLabel}
                        </button>
                        <button
                          className="button button-danger"
                          onClick={() => onDelete(item)}
                          data-testid={`delete-button-${itemId}`}
                        >
                          {deleteLabel}
                        </button>
                      </div>
                    </td>
                  )}
                  {
                    !showActions && (
                      <td style={{ textAlign: 'right' }} data-testid={`table-actions-${itemId}`} data-label="Actions">
                        <div className="actions">
                          {renderExpandedRow && (
                            <button
                              className="button button-ghost"
                              onClick={() => toggleRow(itemId)}
                              data-testid={`expand-button-${itemId}`}
                              title={isExpanded ? 'Collapse' : expandLabel}
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              {isExpanded ? 'Hide' : expandLabel}
                            </button>
                          )}
                          {customActions && customActions(item)}
                        </div>
                      </td>
                    )
                  }
                </tr>
                {isExpanded && renderExpandedRow && (
                  <tr data-testid={`expanded-row-${itemId}`} className="expanded-row">
                    <td colSpan={columns.length + (showActions ? 1 : 0)} className="expanded-cell">
                      {renderExpandedRow(item)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
