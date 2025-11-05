// TestSuitesPageRefactored.tsx - Refactored version using GenericCrudPage
import { useEffect, useState } from 'react';
import { GenericCrudPage } from './GenericCrudPage';
import { ColumnDefinition } from '../components/GenericTable';
import { FormFieldDefinition } from '../components/GenericForm';
import { api } from '../config/api';

interface TestSuite {
  id: string;
  fixtureId: string;
  name: string;
  description?: string;
  executionOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Fixture {
  id: string;
  name: string;
}

export default function TestSuitesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);

  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    try {
      const response = await api.get('/api/fixtures');
      setFixtures(response.data);
    } catch (error) {
      console.error('Failed to load fixtures:', error);
    }
  };

  const getFixtureName = (fixtureId: string) => {
    return fixtures.find((f) => f.id === fixtureId)?.name || 'Unknown';
  };

  // Define table columns
  const columns: ColumnDefinition<TestSuite>[] = [
    {
      header: 'Name',
      field: 'name',
    },
    {
      header: 'Fixture',
      render: (item) => getFixtureName(item.fixtureId),
    },
    {
      header: 'Description',
      field: 'description',
    },
    {
      header: 'Execution Order',
      align: 'center',
      field: 'executionOrder',
    },
    {
      header: 'Active',
      align: 'center',
      render: (item) => (
        <span className={`test-suites-status ${item.isActive ? 'test-suites-status-active' : 'test-suites-status-inactive'}`}>
          {item.isActive ? '✓' : '✗'}
        </span>
      ),
    },
  ];

  // Define form fields
  const formFields: FormFieldDefinition<TestSuite>[] = [
    {
      name: 'fixtureId',
      label: 'Fixture',
      type: 'select',
      required: true,
      options: fixtures.map((f) => ({ value: f.id, label: f.name })),
    },
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
      name: 'executionOrder',
      label: 'Execution Order',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
    },
  ];

  return (
    <GenericCrudPage<TestSuite>
      title="Test Suites"
      apiEndpoint="/api/test-suites"
      getItemId={(item) => item.id}
      columns={columns}
      formFields={formFields}
      getInitialFormData={() => ({
        id: '',
        fixtureId: '',
        name: '',
        description: '',
        executionOrder: 0,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      })}
      // tableClassName="test-suites-table"
      // formClassName="test-suites-form"
      emptyMessage="No test suites found"
      createButtonLabel="+ New Test Suite"
      editFormTitle="Edit Test Suite"
      createFormTitle="Create Test Suite"
    />
  );
}
