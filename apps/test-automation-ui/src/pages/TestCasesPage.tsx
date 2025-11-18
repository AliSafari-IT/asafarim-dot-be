// apps/test-automation-ui/src/pages/TestCasesPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { GenericCrudPage } from './GenericCrudPage';
import { ColumnDefinition } from '../components/GenericTable';
import { FormFieldDefinition } from '../components/GenericForm';
import { api } from '../config/api';
import StepsEditor from './StepsEditor';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { truncateAtWord } from '@asafarim/helpers';
import "./TestCasesPage.css";

interface TestCase {
  id: string;
  testSuiteId: string;
  name: string;
  description?: string;
  testType: 'Steps' | 'Script';
  testTypeName: string;
  steps?: TestStep[];
  scriptText?: string;
  timeoutMs: number;
  retryCount: number;
  isActive: boolean;
  skip: boolean;
  skipReason?: string;
  only: boolean;
  meta?: any;
  pageUrl?: string;
  requestHooks?: string;
  clientScripts?: string;
  screenshotOnFail: boolean;
  videoOnFail: boolean;
  beforeTestHook?: string;
  afterTestHook?: string;
  beforeEachStepHook?: string;
  afterEachStepHook?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
  passed: boolean;
}

export interface TestStep {
  action: string;
  selector?: string;
  value?: string;
  description?: string;
  assertionType?: string;
  assertionValue?: string;
}

interface TestSuite {
  id: string;
  name: string;
  description?: string;
}

export default function TestCasesPage() {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [currentSteps, setCurrentSteps] = useState<TestStep[]>([]);

  useEffect(() => {
    loadSuites();
  }, []);

  const loadSuites = async () => {
    try {
      const response = await api.get('/api/test-suites');
      setSuites(response.data);
    } catch (error) {
      console.error('Failed to load suites:', error);
    }
  };

  const getSuiteName = (suiteId: string) => {
    return suites.find((s) => s.id === suiteId)?.name || 'Unknown';
  };

  // Define table columns
  const columns: ColumnDefinition<TestCase>[] = useMemo(() => [
    {
      header: 'Name',
      field: 'name',
      width: '30%',
      inListView: true,
      sortable: true,
    },
        {
      header: "Description",
      field: "description",
      render: (item) => truncateAtWord(item.description, 105),
      width: "25%",
      sortable: false,
    },
    {
      header: 'Test Suite',
      field: 'testSuiteId',
      sortAccessor: (item) => getSuiteName(item?.testSuiteId ?? ""),
      render: (item) => getSuiteName(item.testSuiteId) || 'Unknown',
      width: '30%',
      inListView: true,
      sortable: true,
    },
    {
      header: 'Type',
      field: 'testType',
      align: 'center',
      width: '10%',
      render: (item) => (
        <span className={"test-type-label" + (item.testType === 'Steps' ? ' steps' : ' script')} data-testid="test-case-type">
          {item.testType}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Passed',
      field: 'passed',
      sortAccessor: (item) => item.passed,
 render: (item) => (
        <span className={`status-badge ${item.passed ? 'test-cases-status-passed' : 'test-cases-status-failed'}`}
        data-testid="test-case-status"
        title={item.passed ? 'Passed' : 'Failed'}
        >
          {item.passed ? <CheckCircleIcon /> : <XCircleIcon />}
        </span>
      ),      width: '15%',
      inListView: true,
      sortable: true,
    },
    {
      header: 'Status',
      align: 'center',
      width: '10%',
      render: (item) => (
        <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}
        data-testid="test-case-status"
        title={item.isActive ? 'Active' : 'Inactive'}
        >
          {item.isActive ? <CheckCircleIcon /> : <XCircleIcon />}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Skipped',
      align: 'center',
      width: '10%',
      render: (item) => item.skip ? 'Yes' : 'No',
      sortable: true,
    },
    {
      header: 'Timeout',
      field: 'timeoutMs',
      align: 'center',
      width: '10%',
      render: (item) => `${item.timeoutMs}ms`
    }
  ], [suites]);

  // Define form fields
  const formFields: FormFieldDefinition<TestCase>[] = useMemo(() => [
    // Basic Information
    {
      name: 'testSuiteId',
      label: 'Test Suite',
      type: 'select',
      required: true,
      options: suites.map((s) => ({ value: s.id, label: s.name })),
      group: 'Basic Information'
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      group: 'Basic Information'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 2,
      group: 'Basic Information'
    },
    {
      name: 'pageUrl',
      label: 'Page URL',
      type: 'text',
      placeholder: 'https://example.com',
      group: 'Basic Information'
    },
    
    // Test Configuration
    {
      name: 'testType',
      label: 'Test Type',
      type: 'select',
      required: true,
      options: [
        { value: 'Steps', label: 'Steps' },
        { value: 'Script', label: 'Script' },
      ],
      group: 'Test Configuration'
    },
    {
      name: 'timeoutMs',
      label: 'Timeout (ms)',
      type: 'number',
      required: true,
      min: 1000,
      group: 'Test Configuration'
    },
    {
      name: 'retryCount',
      label: 'Retry Count',
      type: 'number',
      required: true,
      min: 0,
      max: 5,
      group: 'Test Configuration'
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
      group: 'Test Configuration'
    },
    {
      name: 'skip',
      label: 'Skip Test',
      type: 'checkbox',
      group: 'Test Configuration'
    },
    {
      name: 'skipReason',
      label: 'Skip Reason',
      type: 'text',
      condition: (data) => data.skip,
      group: 'Test Configuration'
    },
    {
      name: 'only',
      label: 'Run Only This Test',
      type: 'checkbox',
      group: 'Test Configuration'
    },
    {
      name: 'screenshotOnFail',
      label: 'Screenshot on Fail',
      type: 'checkbox',
      group: 'Test Configuration'
    },
    {
      name: 'videoOnFail',
      label: 'Record Video on Fail',
      type: 'checkbox',
      group: 'Test Configuration'
    },
    
    // Test Content
    {
      name: 'steps',
      label: 'Test Steps',
      type: 'text',
      render: (value, onChange) => (
        <StepsEditor 
          steps={value || []} 
          onChange={(steps) => onChange(steps)} 
        />
      ),
      condition: (formData) => formData.testType === 'Steps',
      group: 'Test Content'
    },
    {
      name: 'scriptText',
      label: 'Test Script',
      type: 'textarea',
      rows: 6,
      placeholder: 'Enter your test script here...',
      condition: (formData) => formData.testType === 'Script',
      group: 'Test Content'
    },
    
    // Hooks
    {
      name: 'beforeTestHook',
      label: 'Before Test Hook',
      type: 'textarea',
      rows: 3,
      placeholder: 'Code to run before the test starts',
      group: 'Test Hooks'
    },
    {
      name: 'afterTestHook',
      label: 'After Test Hook',
      type: 'textarea',
      rows: 3,
      placeholder: 'Code to run after the test completes',
      group: 'Test Hooks'
    },
    {
      name: 'beforeEachStepHook',
      label: 'Before Each Step Hook',
      type: 'textarea',
      rows: 3,
      placeholder: 'Code to run before each step in the test',
      group: 'Test Hooks'
    },
    {
      name: 'afterEachStepHook',
      label: 'After Each Step Hook',
      type: 'textarea',
      rows: 3,
      placeholder: 'Code to run after each step in the test',
      group: 'Test Hooks'
    },
    
    // Advanced Configuration
    {
      name: 'meta',
      label: 'Metadata (JSON)',
      type: 'textarea',
      rows: 3,
      placeholder: 'Test metadata (JSON format)',
      group: 'Advanced Configuration'
    },
    {
      name: 'requestHooks',
      label: 'Request Hooks (JSON)',
      type: 'textarea',
      rows: 3,
      placeholder: 'Request hooks for this test (JSON array)',
      group: 'Advanced Configuration'
    },
    {
      name: 'clientScripts',
      label: 'Client Scripts (JSON)',
      type: 'textarea',
      rows: 3,
      placeholder: 'Client scripts for this test (JSON array)',
      group: 'Advanced Configuration'
    }
  ], [suites]);

  // Prepare data before sending to API
  const preparePayload = (formData: TestCase) => {
    return {
      ...formData,
      // Ensure we only send steps or scriptText based on testType
      steps: formData.testType === 'Steps' ? formData.steps : null,
      scriptText: formData.testType === 'Script' ? formData.scriptText : null,
      // Ensure empty strings are converted to null
      description: formData.description || null,
      pageUrl: formData.pageUrl || null,
      skipReason: formData.skip ? formData.skipReason : null,
      beforeTestHook: formData.beforeTestHook || null,
      afterTestHook: formData.afterTestHook || null,
      beforeEachStepHook: formData.beforeEachStepHook || null,
      afterEachStepHook: formData.afterEachStepHook || null,
      meta: formData.meta ? JSON.parse(formData.meta) : null,
      requestHooks: formData.requestHooks ? JSON.parse(formData.requestHooks) : null,
      clientScripts: formData.clientScripts ? JSON.parse(formData.clientScripts) : null,
    };
  };

  // Transform data when loading for edit
  const onItemLoaded = (item: TestCase) => {
    // Store steps for the StepsEditor
    if (item.steps) {
      setCurrentSteps([...item.steps]);
    }
    return {
      ...item,
      // Ensure we have empty arrays/strings for the form
      steps: item.steps || [],
      scriptText: item.scriptText || '',
      testTypeName: item.testType === 'Script' ? 'Script' : 'Steps',
      // Convert JSON objects to strings for textareas
      meta: item.meta ? JSON.stringify(item.meta, null, 2) : '',
      requestHooks: item.requestHooks ? JSON.stringify(item.requestHooks, null, 2) : '',
      clientScripts: item.clientScripts ? JSON.stringify(item.clientScripts, null, 2) : '',
    };
  };

  return (
    <GenericCrudPage<TestCase>
      title="Test Cases"
      apiEndpoint="/api/test-cases"
      getItemId={(item) => item.id}
      columns={columns}
      formFields={formFields}
      getInitialFormData={() => ({
        id: '',
        testSuiteId: '',
        name: '',
        description: '',
        testType: 'Steps',
        testTypeName: 'Steps',
        steps: [],
        scriptText: '',
        timeoutMs: 30000,
        retryCount: 0,
        isActive: true,
        skip: false,
        skipReason: '',
        only: false,
        pageUrl: '',
        screenshotOnFail: true,
        videoOnFail: false,
        beforeTestHook: '',
        afterTestHook: '',
        beforeEachStepHook: '',
        afterEachStepHook: '',
        meta: '{}',
        requestHooks: '[]',
        clientScripts: '[]',
        createdAt: '',
        updatedAt: '',
        createdById: '',
        updatedById: '',
        passed: false,
      })}
      preparePayload={preparePayload}
      onItemLoaded={onItemLoaded}
      autoFocusFieldName="name"
      emptyMessage="No test cases found"
      createButtonLabel="+ New Test Case"
      editFormTitle="Edit Test Case"
      createFormTitle="Create Test Case"
    />
  );
}