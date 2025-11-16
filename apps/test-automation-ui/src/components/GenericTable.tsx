import React, { useState } from 'react';
import './GenericTable.css';
import { useAuth } from '@asafarim/shared-ui-react';
import { useToast } from '@asafarim/toast';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
          {data.map((item) => {
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
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {showActions && onEdit && onDelete && (
                    <td style={{ textAlign: 'right' }} data-testid={`table-actions-${itemId}`}>
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
