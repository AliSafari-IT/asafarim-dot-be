// ExampleTestDataSetsPageWithGeneric.tsx - Example using GenericCrudPage for Test Data Sets
import { useEffect, useState } from 'react';
import { GenericCrudPage } from './GenericCrudPage';
import { ColumnDefinition } from '../components/GenericTable';
import { FormFieldDefinition } from '../components/GenericForm';
import { api } from '../config/api';
import './TestDataSetsPage.css';

interface TestDataSet {
  id: string;
  testCaseId: string;
  name: string;
  description?: string;
  data: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TestCase {
  id: string;
  name: string;
}

export default function ExampleTestDataSetsPageWithGeneric() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  useEffect(() => {
    loadTestCases();
  }, []);

  const loadTestCases = async () => {
    try {
      const response = await api.get('/api/test-cases');
      setTestCases(response.data);
    } catch (error) {
      console.error('Failed to load test cases:', error);
    }
  };

  const getTestCaseName = (testCaseId: string) => {
    return testCases.find((tc) => tc.id === testCaseId)?.name || 'Unknown';
  };

  // Define table columns
  const columns: ColumnDefinition<TestDataSet>[] = [
    {
      header: 'Name',
      field: 'name',
    },
    {
      header: 'Test Case',
      render: (item) => getTestCaseName(item.testCaseId),
    },
    {
      header: 'Description',
      field: 'description',
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
    {
      header: 'Data',
      align: 'center',
      render: (item) => (
        <span className="json-preview" title={JSON.stringify(item.data)}>
          {JSON.stringify(item.data)}
        </span>
      ),
    },
  ];

  // Define form fields
  const formFields: FormFieldDefinition<TestDataSet>[] = [
    {
      name: 'testCaseId',
      label: 'Test Case',
      type: 'select',
      required: true,
      options: testCases.map((tc) => ({ value: tc.id, label: tc.name })),
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
      rows: 2,
    },
    {
      name: 'data',
      label: 'Data (JSON)',
      type: 'json',
      required: true,
      rows: 6,
      placeholder: '{"key": "value"}',
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
    },
  ];

  return (
    <GenericCrudPage<TestDataSet>
      title="Test Data Sets"
      apiEndpoint="/api/test-data-sets"
      getItemId={(item) => item.id}
      columns={columns}
      formFields={formFields}
      getInitialFormData={() => ({
        id: '',
        testCaseId: '',
        name: '',
        description: '',
        data: '{}',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      })}
      preparePayload={(formData) => ({
        testCaseId: formData.testCaseId,
        name: formData.name,
        description: formData.description || null,
        data: typeof formData.data === 'string' ? JSON.parse(formData.data) : formData.data,
        isActive: formData.isActive,
      })}
      onItemLoaded={(item) => ({
        ...item,
        data: JSON.stringify(item.data, null, 2),
      })}
      tableClassName="test-data-sets-table"
      formClassName="test-data-set-form"
      emptyMessage="No test data sets found"
      createButtonLabel="+ New Data Set"
      editFormTitle="Edit Test Data Set"
      createFormTitle="Create Test Data Set"
    />
  );
}
