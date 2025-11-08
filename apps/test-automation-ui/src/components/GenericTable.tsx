import React from 'react';
import './GenericTable.css';
import { useAuth } from '@asafarim/shared-ui-react';
import { useToast } from '@asafarim/toast';

export interface ColumnDefinition<T> {
  header: string;
  field?: keyof T;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  dataTestId?: string;
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
}: GenericTableProps<T>) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();

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
      <table className={className} data-testid="generic-table">
        <thead>
          <tr data-testid="table-header-row">
            {columns.map((column, index) => (
              <th
                key={index}
                style={{
                  textAlign: column.align || 'left',
                  width: column.width,
                }}
                data-testid={column.dataTestId || `table-header-${index}`}
              >
                {column.header}
              </th>
            ))}
            {showActions && onEdit && onDelete && (
              <th style={{ textAlign: 'right' }} data-testid="table-header-actions">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody data-testid="table-body">
          {data.map((item) => (
            <tr key={getItemId(item)} data-testid={`table-row-${getItemId(item)}`}>
              {columns.map((column, index) => (
                <td
                  key={index}
                  style={{
                    textAlign: column.align || 'left',
                  }}
                  data-testid={`table-cell-${getItemId(item)}-${index}`}
                >
                  {renderCell(item, column)}
                </td>
              ))}
              {showActions && onEdit && onDelete && (
                <td style={{ textAlign: 'right' }} data-testid={`table-actions-${getItemId(item)}`}>
                  <div className="actions">
                    {customActions && customActions(item)}
                    <button
                      className="button button-secondary"
                      onClick={() => {
                        if (!isAuthenticated && !authLoading) {
                          toast.error("You must be authenticated to edit items.");
                          return;
                        }
                        onEdit(item);}}
                      data-testid={`edit-button-${getItemId(item)}`}
                    >
                      {editLabel}
                    </button>
                    <button
                      className="button button-danger"
                      onClick={() => onDelete(item)}
                      data-testid={`delete-button-${getItemId(item)}`}
                    >
                      {deleteLabel}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
