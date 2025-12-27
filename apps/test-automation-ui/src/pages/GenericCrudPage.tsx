// apps/test-automation-ui/src/pages/GenericCrudPage.tsx - Refactored version using GenericTable and GenericForm
import { useEffect, useState, useMemo, useRef } from "react";
import React from "react";
import { api } from "../config/api";
import { GenericTable, ColumnDefinition } from "../components/GenericTable";
import { GenericForm, FormFieldDefinition } from "../components/GenericForm";
import { GenericListView } from "../components/GenericListView";
import { useAuth } from "@asafarim/shared-ui-react";
import { useToast } from "@asafarim/toast";
import { List, Search } from "lucide-react";
import { TbGrid4X4 } from "react-icons/tb";

interface GenericCrudPageProps<T> {
  title: string;
  apiEndpoint: string;
  getItemId: (item: T) => string;
  columns: ColumnDefinition<T>[];
  formFields: FormFieldDefinition<T>[];
  getInitialFormData: () => T;
  preparePayload?: (formData: T) => any;
  onItemLoaded?: (item: T) => T;
  customActions?: (item: T) => React.ReactNode;
  autoFocusFieldName?: string;
  tableClassName?: string;
  formClassName?: string;
  emptyMessage?: string;
  createButtonLabel?: string;
  editFormTitle?: string;
  createFormTitle?: string;
  renderExpandedRow?: (item: T) => React.ReactNode;
  expandLabel?: string;
  editSuiteId?: string | null;
  focusField?: string | null;
  onEditComplete?: () => void;
  onEdit?: (item: T) => void;
}

export function GenericCrudPage<T>({
  title,
  apiEndpoint,
  getItemId,
  columns,
  formFields,
  getInitialFormData,
  preparePayload,
  onItemLoaded,
  customActions,
  autoFocusFieldName,
  tableClassName = "generic-table",
  formClassName = "generic-form",
  emptyMessage = "No items found",
  createButtonLabel = "+ New Item",
  editFormTitle = "Edit Item",
  createFormTitle = "Create Item",
  renderExpandedRow,
  expandLabel,
  editSuiteId,
  focusField,
  onEditComplete,
  onEdit,
}: GenericCrudPageProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<T>(getInitialFormData());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const extractServerMessage = (data: unknown): string | null => {
    if (!data) return null;
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.message === 'string') return record.message;
      if (record.errors) {
        const errors = record.errors as Record<string, string[] | string>;
        const messages = Object.values(errors)
          .flat()
          .map((err) => (Array.isArray(err) ? err.join(', ') : err))
          .filter(Boolean);
        if (messages.length > 0) {
          return messages.join('\n');
        }
      }
    }
    return null;
  };

  const handleApiError = (error: any, action: string) => {
    console.error(`Failed to ${action}:`, error);
    const status = error?.response?.status as number | undefined;
    let message = `Failed to ${action}. Please try again.`;

    if (status === 401) {
      message = 'You need to sign in before continuing.';
    } else if (status === 403) {
      message = `You do not have permission to ${action}. Please contact an administrator if you believe this is incorrect.`;
    } else if (status === 404) {
      message = 'The requested item could not be found.';
    } else if (status && status >= 500) {
      message = 'The server encountered an issue. Please try again later.';
    }

    const serverMessage = extractServerMessage(error?.response?.data);
    toast.error(serverMessage ? `${message} (${serverMessage})` : message);
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Scroll form into view when editing or creating
  useEffect(() => {
    if ((editing || creating) && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }, [editing, creating]);

  // Handle edit mode from query parameters
  useEffect(() => {
    if (editSuiteId && items.length > 0) {
      const itemToEdit = items.find((item) => getItemId(item) === editSuiteId);
      if (itemToEdit) {
        startEdit(itemToEdit);
      }
    }
  }, [editSuiteId, items]);

  const loadItems = async () => {
    try {
      const response = await api.get(apiEndpoint);
      setItems(response.data);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = preparePayload ? preparePayload(formData) : formData;
      await api.post(apiEndpoint, payload);
      setCreating(false);
      setFormData(getInitialFormData());
      loadItems();
      toast.success("Item created successfully.");
    } catch (error: any) {
      handleApiError(error, 'create item');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const itemId = getItemId(editing);
      const payload = preparePayload ? preparePayload(formData) : formData;
      await api.put(`${apiEndpoint}/${itemId}`, payload);
      setEditing(null);
      setFormData(getInitialFormData());
      loadItems();

      toast.success("Item updated successfully.");
      
      // Call onEditComplete callback if provided
      if (onEditComplete) {
        onEditComplete();
      }
    } catch (error: any) {
      handleApiError(error, 'update item');
    }
  };

  const handleDelete = async (item: T) => {
    if (!isAuthenticated && !authLoading) {
      toast.error("You must be authenticated to delete items.");
      return;
    }
    if (!confirm("Delete this item?")) return;
    try {
      const itemId = getItemId(item);
      await api.delete(`${apiEndpoint}/${itemId}`);
      loadItems();
      toast.success("Item deleted successfully.");
    } catch (error) {
      handleApiError(error, 'delete item');
    }
  };

  const startEdit = (item: T) => {
    setEditing(item);
    const editData = onItemLoaded ? onItemLoaded(item) : item;
    setFormData(editData);
    setCreating(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    setFormData(getInitialFormData());
    
    // Call onEditComplete callback if provided
    if (onEditComplete) {
      onEditComplete();
    }
  };

  // Filter items based on search text
  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return items;
    
    const searchLower = searchText.toLowerCase();
    return items.filter((item) => {
      // Search across all string and text-like fields
      for (const key in item) {
        const value = item[key];
        if (value !== null && value !== undefined) {
          const stringValue = String(value).toLowerCase();
          if (stringValue.includes(searchLower)) {
            return true;
          }
        }
      }
      return false;
    });
  }, [items, searchText]);

  return (
    <div className="page-container" data-testid="crud-page">
      <div className="page-header" data-testid="crud-page-header">
        <h3 className="page-title" data-testid="crud-page-title">
          {title}
        </h3>
        <div className="page-actions">
          <div className="view-toggle-buttons">
            <button
              className={`view-toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
              aria-label="Switch to grid view"
            >
              <TbGrid4X4 size={18} />
            </button>
            <button
              className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
              aria-label="Switch to list view"
            >
              <List size={18} />
            </button>
          </div>
          <button
            className="button button-primary"
            onClick={() => {
              if (!isAuthenticated && !authLoading) {
                toast.error("You must be authenticated to create items.");
                return;
              }
              setCreating(true);
            }}
            disabled={creating || editing !== null}
            data-testid="create-button"
          >
            {createButtonLabel}
          </button>
        </div>
      </div>

      {(creating || editing) && (
        <div ref={formRef}>
          <GenericForm
            key={editing ? getItemId(editing) : "create"}
            fields={formFields}
            formData={formData}
            onChange={setFormData}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={cancelEdit}
            title={editing ? editFormTitle : createFormTitle}
            submitLabel={editing ? "Update" : "Create"}
            className={formClassName}
            autoFocusFieldName={(focusField || autoFocusFieldName) as keyof T}
          />
        </div>
      )}

      {items.length > 0 && (
        <div className="generic-search-container">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
              aria-label="Search items"
            />
          </div>
          {searchText && (
            <div className="search-results-info">
              Showing {filteredItems.length} of {items.length} item{items.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {viewMode === 'grid' ? (
        <GenericTable
          data={filteredItems}
          columns={columns}
          onEdit={onEdit ? (item) => { onEdit(item); startEdit(item); } : startEdit}
          onDelete={handleDelete}
          customActions={customActions}
          loading={loading}
          emptyMessage={emptyMessage}
          className={tableClassName}
          getItemId={getItemId}
          renderExpandedRow={renderExpandedRow}
          expandLabel={expandLabel}
          showActions={isAuthenticated}
          key={title}
        />
      ) : (
        <GenericListView
          items={filteredItems}
          columns={columns.map((col, idx) => ({
            key: col.field ? String(col.field) : `col-${idx}`,
            header: col.header,
            render: col.render,
            inListView: col.inListView,
            width: col.width,
            align: col.align,
            sortable: col.sortable,
            sortAccessor: col.sortAccessor,
          }))}
          isAuthenticated={isAuthenticated}
          onView={startEdit}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      )}
    </div>
  );
}
