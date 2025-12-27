import { useState, useEffect } from 'react';
import { api } from '../config/api';
import { ButtonComponent, isProduction } from '@asafarim/shared-ui-react';
import { Download, Copy, Play, RefreshCw, X } from 'lucide-react';
import './TestCafeFileViewer.css';
import { useAuth } from '@asafarim/shared-ui-react';

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
  const { isAuthenticated } = useAuth();

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
      
      // Call backend API to run the generated TestCafe file
      // The backend will handle calling the TestRunner service
      const response = await api.post(`/api/test-suites/${testSuiteId}/run-generated?browser=chrome`);
      
      const { runId } = response.data;
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
          <button className="testcafe-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="testcafe-viewer-actions">
          <div className="testcafe-actions-primary">
            <button
              className="testcafe-btn testcafe-btn-primary"
              onClick={generateTestCafeFile}
              disabled={loading}
              title="Regenerate TestCafe file"
            >
              <RefreshCw size={16} />
              <span>{loading ? 'Generating...' : 'Regenerate'}</span>
            </button>
            {fileContent && (
              <button 
                className="testcafe-btn testcafe-btn-success" 
                onClick={runTest}
                disabled={!isAuthenticated || running}
                title="Run the test"
              >
                <Play size={16} />
                <span>{running ? 'Running...' : 'Run Test'}</span>
              </button>
            )}
          </div>
          
          {fileContent && (
            <div className="testcafe-actions-secondary">
              <button 
                className="testcafe-btn-icon" 
                onClick={downloadFile}
                title="Download file"
                aria-label="Download"
              >
                <Download size={18} />
              </button>
              <button 
                className="testcafe-btn-icon" 
                onClick={copyToClipboard}
                title={copied ? 'Copied!' : 'Copy to clipboard'}
                aria-label="Copy"
              >
                <Copy size={18} />
              </button>
            </div>
          )}
          
          {generatedAt && (
            <span className="generated-timestamp">
              {new Date(generatedAt).toLocaleString()}
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
