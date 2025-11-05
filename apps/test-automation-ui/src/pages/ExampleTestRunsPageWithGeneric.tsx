// ExampleTestRunsPageWithGeneric.tsx - Example using GenericCrudPage for Test Runs
import { GenericCrudPage } from './GenericCrudPage';
import { ColumnDefinition } from '../components/GenericTable';
import { FormFieldDefinition } from '../components/GenericForm';
import './TestSuitesPage.css';

interface TestRun {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  createdAt: string;
  updatedAt: string;
}

export default function ExampleTestRunsPageWithGeneric() {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-badge active';
      case 'running':
        return 'status-badge status-running';
      case 'failed':
        return 'status-badge inactive';
      default:
        return 'status-badge';
    }
  };

  // Define table columns
  const columns: ColumnDefinition<TestRun>[] = [
    {
      header: 'Name',
      field: 'name',
    },
    {
      header: 'Status',
      align: 'center',
      render: (item) => (
        <span className={getStatusBadgeClass(item.status)}>
          {item.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Started At',
      render: (item) => formatDate(item.startedAt),
    },
    {
      header: 'Duration',
      align: 'center',
      render: (item) => formatDuration(item.duration),
    },
    {
      header: 'Total',
      align: 'center',
      field: 'totalTests',
    },
    {
      header: 'Passed',
      align: 'center',
      render: (item) => (
        <span style={{ color: 'var(--color-success)' }}>{item.passedTests}</span>
      ),
    },
    {
      header: 'Failed',
      align: 'center',
      render: (item) => (
        <span style={{ color: 'var(--color-error)' }}>{item.failedTests}</span>
      ),
    },
    {
      header: 'Skipped',
      align: 'center',
      field: 'skippedTests',
    },
  ];

  // Define form fields
  const formFields: FormFieldDefinition<TestRun>[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'running', label: 'Running' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
      ],
    },
    {
      name: 'totalTests',
      label: 'Total Tests',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'passedTests',
      label: 'Passed Tests',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'failedTests',
      label: 'Failed Tests',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'skippedTests',
      label: 'Skipped Tests',
      type: 'number',
      required: true,
      min: 0,
    },
  ];

  return (
    <GenericCrudPage<TestRun>
      title="Test Runs"
      apiEndpoint="/api/test-runs"
      getItemId={(item) => item.id}
      columns={columns}
      formFields={formFields}
      getInitialFormData={() => ({
        id: '',
        name: '',
        status: 'pending',
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        createdAt: '',
        updatedAt: '',
      })}
      tableClassName="test-suites-table"
      formClassName="test-suites-form"
      emptyMessage="No test runs found"
      createButtonLabel="+ New Test Run"
      editFormTitle="Edit Test Run"
      createFormTitle="Create Test Run"
    />
  );
}
