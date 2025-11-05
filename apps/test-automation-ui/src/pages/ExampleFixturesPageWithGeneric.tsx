// ExampleFixturesPageWithGeneric.tsx - Example of using GenericCrudPage for Fixtures
import { GenericCrudPage } from './GenericCrudPage';
import { ColumnDefinition } from '../components/GenericTable';
import { FormFieldDefinition } from '../components/GenericForm';
import './FixturesPage.css';

interface Fixture {
  id: string;
  name: string;
  description?: string;
  pageUrl: string;
  setupScript?: string;
  teardownScript?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ExampleFixturesPageWithGeneric() {
  // Define table columns
  const columns: ColumnDefinition<Fixture>[] = [
    {
      header: 'Name',
      field: 'name',
    },
    {
      header: 'Description',
      field: 'description',
    },
    {
      header: 'Page URL',
      field: 'pageUrl',
    },
    {
      header: 'Active',
      align: 'center',
      render: (item) => (
        <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  // Define form fields
  const formFields: FormFieldDefinition<Fixture>[] = [
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
      rows: 2,
    },
    {
      name: 'pageUrl',
      label: 'Page URL',
      type: 'text',
      required: true,
      placeholder: 'https://example.com',
    },
    {
      name: 'setupScript',
      label: 'Setup Script',
      type: 'textarea',
      rows: 4,
      placeholder: 'JavaScript code to run before tests',
    },
    {
      name: 'teardownScript',
      label: 'Teardown Script',
      type: 'textarea',
      rows: 4,
      placeholder: 'JavaScript code to run after tests',
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
    },
  ];

  return (
    <GenericCrudPage<Fixture>
      title="Fixtures"
      apiEndpoint="/api/fixtures"
      getItemId={(item) => item.id}
      columns={columns}
      formFields={formFields}
      getInitialFormData={() => ({
        id: '',
        name: '',
        description: '',
        pageUrl: '',
        setupScript: '',
        teardownScript: '',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      })}
      tableClassName="fixtures-table"
      formClassName="fixture-form"
      emptyMessage="No fixtures found"
      createButtonLabel="+ New Fixture"
      editFormTitle="Edit Fixture"
      createFormTitle="Create Fixture"
    />
  );
}
