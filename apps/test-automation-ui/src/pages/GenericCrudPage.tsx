import { useEffect, useState } from 'react';
import React from 'react';
import { api } from '../config/api';
import { GenericTable, ColumnDefinition } from '../components/GenericTable';
import { GenericForm, FormFieldDefinition } from '../components/GenericForm';

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

  tableClassName?: string;
  formClassName?: string;
  emptyMessage?: string;
  createButtonLabel?: string;
  editFormTitle?: string;
  createFormTitle?: string;
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
  tableClassName = 'generic-table',
  formClassName = 'generic-form',
  emptyMessage = 'No items found',
  createButtonLabel = '+ New Item',
  editFormTitle = 'Edit Item',
  createFormTitle = 'Create Item',
}: GenericCrudPageProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<T>(getInitialFormData());

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await api.get(apiEndpoint);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to load items:', error);
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
    } catch (error: any) {
      console.error('Failed to create:', error);
      if (error.response?.data) {
        console.error('Error details:', error.response.data);
        alert(`Failed to create: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Failed to create item. Please check your input.');
      }
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
    } catch (error: any) {
      console.error('Failed to update:', error);
      if (error.response?.data) {
        console.error('Error details:', error.response.data);
        alert(`Failed to update: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Failed to update item. Please check your input.');
      }
    }
  };

  const handleDelete = async (item: T) => {
    if (!confirm('Delete this item?')) return;
    try {
      const itemId = getItemId(item);
      await api.delete(`${apiEndpoint}/${itemId}`);
      loadItems();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete item.');
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
  };

  return (
    <div className="page-container" data-testid="crud-page">
      <div className="page-header" data-testid="crud-page-header">
        <h3 className="page-title" data-testid="crud-page-title">{title}</h3>
        <div className="page-actions">
          <button
            className="button button-primary"
            onClick={() => setCreating(true)}
            disabled={creating || editing !== null}
            data-testid="create-button"
          >
            {createButtonLabel}
          </button>
        </div>
      </div>

      {(creating || editing) && (
        <GenericForm
          fields={formFields}
          formData={formData}
          onChange={setFormData}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={cancelEdit}
          title={editing ? editFormTitle : createFormTitle}
          submitLabel={editing ? 'Update' : 'Create'}
          className={formClassName}
        />
      )}

      <GenericTable
        data={items}
        columns={columns}
        onEdit={startEdit}
        onDelete={handleDelete}
        customActions={customActions}
        loading={loading}
        emptyMessage={emptyMessage}
        className={tableClassName}
        getItemId={getItemId}
      />
    </div>
  );
}
