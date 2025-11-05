// apps/test-automation-ui/src/pages/TestCasesPage.tsx
import { useEffect, useState } from 'react';
import { GenericCrudPage } from './GenericCrudPage';
import { ColumnDefinition } from '../components/GenericTable';
import { FormFieldDefinition } from '../components/GenericForm';
import { api } from '../config/api';


interface TestCase {
  id: string;
  testSuiteId: string;
  name: string;
  description?: string;
  testType: 'Steps' | 'Script';
  steps?: TestStep[];
  scriptText?: string;
  timeoutMs: number;
  retryCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TestStep {
  name: string;
  description?: string;
}

interface TestSuite {
  id: string;
  name: string;
  description?: string;
}

export default function TestCasesPageRefactored() {
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

  // Custom component for steps management
  const StepsEditor = ({ steps, onChange }: { 
    steps: TestStep[], 
    onChange: (steps: TestStep[]) => void 
  }) => {
    const [localSteps, setLocalSteps] = useState<TestStep[]>(steps);

    const addStep = () => {
      const newSteps = [...localSteps, { name: '', description: '' }];
      setLocalSteps(newSteps);
      onChange(newSteps);
    };

    const updateStep = (index: number, field: keyof TestStep, value: string) => {
      const updatedSteps = [...localSteps];
      updatedSteps[index] = { ...updatedSteps[index], [field]: value };
      setLocalSteps(updatedSteps);
      onChange(updatedSteps);
    };

    const removeStep = (index: number) => {
      const updatedSteps = localSteps.filter((_, i) => i !== index);
      setLocalSteps(updatedSteps);
      onChange(updatedSteps);
    };

    return (
      <div className="steps-editor">
        <div className="steps-list">
          {localSteps.map((step, index) => (
            <div key={index} className="step-item">
              <input
                type="text"
                value={step.name}
                onChange={(e) => updateStep(index, 'name', e.target.value)}
                placeholder="Step name"
                className="form-control"
              />
              <input
                type="text"
                value={step.description || ''}
                onChange={(e) => updateStep(index, 'description', e.target.value)}
                placeholder="Step description"
                className="form-control"
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="button button-danger"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="button button-secondary"
        >
          + Add Step
        </button>
      </div>
    );
  };

  // Define table columns
  const columns: ColumnDefinition<TestCase>[] = [
    {
      header: 'Name',
      field: 'name',
    },
    {
      header: 'Test Suite',
      render: (item) => getSuiteName(item.testSuiteId),
    },
    {
      header: 'Type',
      field: 'testType',
      align: 'center',
    },
    {
      header: 'Active',
      align: 'center',
      render: (item) => (
        <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
          {item.isActive ? '✓' : '✗'}
        </span>
      ),
    },
  ];

  // Define form fields
  const formFields: FormFieldDefinition<TestCase>[] = [
    {
      name: 'testSuiteId',
      label: 'Test Suite',
      type: 'select',
      required: true,
      options: suites.map((s) => ({ value: s.id, label: s.name })),
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
      name: 'testType',
      label: 'Test Type',
      type: 'select',
      required: true,
      options: [
        { value: 'Steps', label: 'Steps' },
        { value: 'Script', label: 'Script' },
      ],
    },
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
    },
    {
      name: 'scriptText',
      label: 'Test Script',
      type: 'textarea',
      rows: 6,
      placeholder: 'Enter your test script here...',
      condition: (formData) => formData.testType === 'Script',
    },
    {
      name: 'timeoutMs',
      label: 'Timeout (ms)',
      type: 'number',
      required: true,
      min: 1000,
    },
    {
      name: 'retryCount',
      label: 'Retry Count',
      type: 'number',
      required: true,
      min: 0,
      max: 5,
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
    },
  ];

  // Prepare data before sending to API
  const preparePayload = (formData: TestCase) => {
    return {
      ...formData,
      // Ensure we only send steps or scriptText based on testType
      steps: formData.testType === 'Steps' ? formData.steps : null,
      scriptText: formData.testType === 'Script' ? formData.scriptText : null,
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
        steps: [],
        scriptText: '',
        timeoutMs: 30000,
        retryCount: 0,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      })}
      preparePayload={preparePayload}
      onItemLoaded={onItemLoaded}
      emptyMessage="No test cases found"
      createButtonLabel="+ New Test Case"
      editFormTitle="Edit Test Case"
      createFormTitle="Create Test Case"
    />
  );
}