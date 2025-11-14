import { useState, useEffect } from 'react';
import { TestStep } from './TestCasesPage';

interface StepsEditorProps {
  steps: TestStep[];
  onChange: (steps: TestStep[]) => void;
}

const StepsEditor: React.FC<StepsEditorProps> = ({ steps, onChange }) => {

  const [localSteps, setLocalSteps] = useState<TestStep[]>(steps);

  useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

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
          <div key={index} className="step-item" style={{
            marginBottom: '1rem',
            padding: '1rem',
            border: '1px solid var(--color-border)',
            borderRadius: '4px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '0.875rem'
                }}>
                  Action *
                </label>
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
                <label style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '0.875rem'
                }}>
                  Description
                </label>
                <input
                  type="text"
                  value={step.description || ''}
                  onChange={(e) => updateStep(index, 'description', e.target.value)}
                  placeholder="e.g., Click login button"
                  className="form-control" />
              </div>
            </div>

            {(step.action !== 'wait' && step.action !== 'navigate' && step.action !== 'screenshot' && step.action !== 'presskey') && (
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '0.875rem'
                }}>
                  Selector {step.action !== 'navigate' && '*'}
                </label>
                <input
                  type="text"
                  value={step.selector || ''}
                  onChange={(e) => updateStep(index, 'selector', e.target.value)}
                  placeholder="e.g., #loginButton, .submit-btn"
                  className="form-control" />
              </div>
            )}

            {(step.action === 'type' || step.action === 'navigate' || step.action === 'wait' ||
              step.action === 'select' || step.action === 'presskey' || step.action === 'screenshot') && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.25rem',
                    fontSize: '0.875rem'
                  }}>
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
                    placeholder={step.action === 'type' ? 'e.g., username@example.com' :
                      step.action === 'navigate' ? 'e.g., https://example.com' :
                        step.action === 'wait' ? 'e.g., 1000' :
                          step.action === 'select' ? 'e.g., Option 1' :
                            step.action === 'presskey' ? 'e.g., enter, tab, esc' :
                              'e.g., login-page'}
                    className="form-control" />
                </div>
              )}

            {step.action === 'expect' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.25rem',
                    fontSize: '0.875rem'
                  }}>
                    Assertion Type
                  </label>
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
                  <label style={{
                    display: 'block',
                    marginBottom: '0.25rem',
                    fontSize: '0.875rem'
                  }}>
                    Expected Value
                  </label>
                  <input
                    type="text"
                    value={step.assertionValue || ''}
                    onChange={(e) => updateStep(index, 'assertionValue', e.target.value)}
                    placeholder="Expected text or count"
                    className="form-control" />
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
        style={{ marginTop: '0.5rem' }}
      >
        ➕ Add Step
      </button>
    </div>
  );
};

export default StepsEditor;
