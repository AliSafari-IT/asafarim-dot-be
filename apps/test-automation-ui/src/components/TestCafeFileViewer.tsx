import { useState, useEffect } from 'react';
import { api } from '../config/api';
import { isProduction } from '@asafarim/shared-ui-react';
import './TestCafeFileViewer.css';

const API_BASE = isProduction ? 'https://testora.asafarim.be' : 'http://testora.asafarim.local:5106';

interface TestCafeFileViewerProps {
  testSuiteId: string;
  testSuiteName: string;
  onClose: () => void;
}

export function TestCafeFileViewer({ testSuiteId, testSuiteName, onClose }: TestCafeFileViewerProps) {
  const [fileContent, setFileContent] = useState<string>('');
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadTestCafeFile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/test-suites/${testSuiteId}/testcafe-file`);
      setFileContent(response.data.fileContent);
      setGeneratedAt(response.data.generatedAt);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No TestCafe file has been generated yet. Click "Generate" to create one.');
      } else {
        setError('Failed to load TestCafe file');
      }
      console.error('Failed to load TestCafe file:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTestCafeFile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/api/test-suites/${testSuiteId}/generate-testcafe`);
      setFileContent(response.data.fileContent);
      setGeneratedAt(response.data.generatedAt);
    } catch (err) {
      setError('Failed to generate TestCafe file');
      console.error('Failed to generate TestCafe file:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([fileContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testSuiteName.replace(/\s+/g, '_')}.test.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      // Try the modern clipboard API first
      await navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback to older method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = fileContent;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy:', err, fallbackErr);
        alert('Failed to copy to clipboard. Please select and copy manually.');
      }
    }
  };

  const runTest = async () => {
    try {
      setRunning(true);
      setError(null);
      
      // Step 1: Fetch test suite details to get fixture and functional requirement
      const suiteResponse = await fetch(`${API_BASE}/api/test-suites/${testSuiteId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include'
      });

      if (!suiteResponse.ok) {
        throw new Error(`Failed to fetch test suite: ${suiteResponse.statusText}`);
      }

      const suite = await suiteResponse.json();
      console.log('📦 Test suite data:', suite);
      console.log('🔍 Fixture:', suite.fixture);
      console.log('🎯 FunctionalRequirementId:', suite.fixture?.functionalRequirementId);
      
      // Step 2: Create a test run in TestAutomation API to get a runId
      const createRunResponse = await fetch(`${API_BASE}/api/test-execution/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          runName: `${testSuiteName} - ${new Date().toLocaleString()}`,
          functionalRequirementId: suite.fixture?.functionalRequirementId || null,
          testSuiteIds: [testSuiteId],
          environment: 'development',
          browser: 'chrome'
        })
      });

      if (!createRunResponse.ok) {
        throw new Error(`Failed to create test run: ${createRunResponse.statusText}`);
      }

      const { id: runId } = await createRunResponse.json();
      
      // Step 2: Call the TestRunner API with the runId
      const response = await fetch('http://localhost:4000/run-generated-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-runner-api-key-2024'
        },
        body: JSON.stringify({
          testSuiteId,
          fileContent,
          browser: 'chrome',
          runId // Pass the runId from TestAutomation API
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setError(null);
      alert(`✅ Test run started! Run ID: ${runId}`);
    } catch (err: any) {
      setError(`Failed to run test: ${err.message}`);
      console.error('Failed to run test:', err);
    } finally {
      setRunning(false);
    }
  };

  // Load file on mount
  useEffect(() => {
    loadTestCafeFile();
  }, []);

  return (
    <div className="testcafe-viewer-overlay">
      <div className="testcafe-viewer-modal">
        <div className="testcafe-viewer-header">
          <h3>TestCafe File: {testSuiteName}</h3>
          <button className="button button-secondary" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="testcafe-viewer-actions">
          <button
            className="button button-primary"
            onClick={generateTestCafeFile}
            disabled={loading}
          >
            {loading ? 'Generating...' : '🔄 Regenerate File'}
          </button>
          {fileContent && (
            <>
              <button 
                className="button button-primary" 
                onClick={runTest}
                disabled={running}
              >
                {running ? 'Running...' : '▶️ Run Test'}
              </button>
              <button className="button button-secondary" onClick={downloadFile}>
                📥 Download
              </button>
              <button className="button button-secondary" onClick={copyToClipboard}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </>
          )}
          {generatedAt && (
            <span className="generated-timestamp">
              Generated: {new Date(generatedAt).toLocaleString()}
            </span>
          )}
        </div>

        {error && <div className="testcafe-viewer-error">{error}</div>}

        {loading && <div className="testcafe-viewer-loading">Loading...</div>}

        {fileContent && !loading && (
          <div className="testcafe-viewer-content">
            <pre>
              <code>{fileContent}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
