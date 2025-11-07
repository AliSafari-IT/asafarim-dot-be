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
      const newSteps = [...localSteps, { action: 'click', selector: '', value: '', description: '' }];
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

    const actionOptions = [
      { value: 'click', label: 'Click' },
      { value: 'type', label: 'Type Text' },
      { value: 'navigate', label: 'Navigate' },
      { value: 'wait', label: 'Wait' },
      { value: 'hover', label: 'Hover' },
      { value: 'expect', label: 'Expect/Assert' },
      { value: 'select', label: 'Select Option' },
      { value: 'presskey', label: 'Press Key' },
      { value: 'screenshot', label: 'Take Screenshot' },
    ];

    const assertionOptions = [
      { value: 'exists', label: 'Exists' },
      { value: 'visible', label: 'Visible' },
      { value: 'contains', label: 'Contains Text' },
      { value: 'eql', label: 'Equals' },
      { value: 'count', label: 'Count' },
    ];

    return (
      <div className="steps-editor">
        <div className="steps-list">
          {localSteps.map((step, index) => (
            <div key={index} className="step-item" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Action *</label>
                  <select
                    value={step.action}
                    onChange={(e) => updateStep(index, 'action', e.target.value)}
                    className="form-control"
                  >
                    {actionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Description</label>
                  <input
                    type="text"
                    value={step.description || ''}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    placeholder="e.g., Click login button"
                    className="form-control"
                  />
                </div>
              </div>
              
              {(step.action !== 'wait' && step.action !== 'navigate' && step.action !== 'screenshot' && step.action !== 'presskey') && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Selector {step.action !== 'navigate' && '*'}</label>
                  <input
                    type="text"
                    value={step.selector || ''}
                    onChange={(e) => updateStep(index, 'selector', e.target.value)}
                    placeholder="e.g., #loginButton, .submit-btn"
                    className="form-control"
                  />
                </div>
              )}
              
              {(step.action === 'type' || step.action === 'navigate' || step.action === 'wait' || step.action === 'select' || step.action === 'presskey' || step.action === 'screenshot') && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    {step.action === 'type' && 'Text to Type *'}
                    {step.action === 'navigate' && 'URL *'}
                    {step.action === 'wait' && 'Milliseconds'}
                    {step.action === 'select' && 'Option Text *'}
                    {step.action === 'presskey' && 'Key *'}
                    {step.action === 'screenshot' && 'Screenshot Name'}
                  </label>
                  <input
                    type="text"
                    value={step.value || ''}
                    onChange={(e) => updateStep(index, 'value', e.target.value)}
                    placeholder={
                      step.action === 'type' ? 'e.g., username@example.com' :
                      step.action === 'navigate' ? 'e.g., https://example.com' :
                      step.action === 'wait' ? 'e.g., 1000' :
                      step.action === 'select' ? 'e.g., Option 1' :
                      step.action === 'presskey' ? 'e.g., enter, tab, esc' :
                      'e.g., login-page'
                    }
                    className="form-control"
                  />
                </div>
              )}
              
              {step.action === 'expect' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Assertion Type</label>
                    <select
                      value={step.assertionType || 'exists'}
                      onChange={(e) => updateStep(index, 'assertionType', e.target.value)}
                      className="form-control"
                    >
                      {assertionOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Expected Value</label>
                    <input
                      type="text"
                      value={step.assertionValue || ''}
                      onChange={(e) => updateStep(index, 'assertionValue', e.target.value)}
                      placeholder="Expected text or count"
                      className="form-control"
                    />
                  </div>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="button button-danger"
                style={{ marginTop: '0.5rem' }}
              >
                🗑️ Remove Step
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="button button-primary"
        >
          ➕ Add Step
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