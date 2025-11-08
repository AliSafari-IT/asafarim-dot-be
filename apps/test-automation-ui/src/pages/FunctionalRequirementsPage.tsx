import { GenericCrudPage } from './GenericCrudPage';
import { ColumnDefinition } from '../components/GenericTable';
import { FormFieldDefinition } from '../components/GenericForm';

interface FunctionalRequirement {
  id: string;
  name: string;
  description?: string;
  projectName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FunctionalRequirementsPage() {
  // Define table columns
  const columns: ColumnDefinition<FunctionalRequirement>[] = [
    {
      header: 'Name',
      field: 'name',
    },
    {
      header: 'Description',
      field: 'description',
    },
    {
      header: 'Project',
      field: 'projectName',
      render: (item) => item.projectName || '-',
    },
    {
      header: 'Status',
      align: 'center',
      render: (item) => (
        <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  // Define form fields
  const formFields: FormFieldDefinition<FunctionalRequirement>[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
    },
    {
      name: 'projectName',
      label: 'Project Name',
      type: 'text',
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
    },
  ];

  return (
    <GenericCrudPage<FunctionalRequirement>
      title="Functional Requirements"
      apiEndpoint="/api/functional-requirements"
      getItemId={(item) => item.id}
      columns={columns}
      formFields={formFields}
      getInitialFormData={() => ({
        id: '',
        name: '',
        description: '',
        projectName: '',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      })}
      emptyMessage="No requirements found. Create one to get started."
      createButtonLabel="+ New Requirement"
      editFormTitle="Edit Requirement"
      createFormTitle="Create Requirement"
    />
  );
}