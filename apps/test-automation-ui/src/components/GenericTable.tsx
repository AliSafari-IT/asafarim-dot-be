// GenericTable.tsx - Reusable table component for any model
import React from 'react';
import './GenericTable.css';

export interface ColumnDefinition<T> {
  header: string;
  field?: keyof T;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface GenericTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
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
  loading = false,
  emptyMessage = 'No items found',
  className = '',
  showActions = true,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  getItemId,
}: GenericTableProps<T>) {
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
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
    <div className="table-container">
      <table className={className}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                style={{
                  textAlign: column.align || 'left',
                  width: column.width,
                }}
              >
                {column.header}
              </th>
            ))}
            {showActions && onEdit && onDelete && (
              <th style={{ textAlign: 'right' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={getItemId(item)}>
              {columns.map((column, index) => (
                <td
                  key={index}
                  style={{
                    textAlign: column.align || 'left',
                  }}
                >
                  {renderCell(item, column)}
                </td>
              ))}
              {showActions && onEdit && onDelete && (
                <td style={{ textAlign: 'right' }}>
                  <div className="actions">
                    <button
                      className="button button-secondary"
                      onClick={() => onEdit(item)}
                    >
                      {editLabel}
                    </button>
                    <button
                      className="button button-danger"
                      onClick={() => onDelete(item)}
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
