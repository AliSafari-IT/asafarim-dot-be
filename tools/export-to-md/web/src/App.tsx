import { useState } from 'react';
import type { ExportOptions } from '@asafarim/md-exporter';
import { runExport, downloadMarkdown } from './api';
import './styles.css';

export default function App() {
    const [targetPath, setTargetPath] = useState('');
    const [filter, setFilter] = useState<ExportOptions['filter']>('all');
    const [pattern, setPattern] = useState('');
    const [exclude, setExclude] = useState('node_modules,.git,dist');
    const [maxSize, setMaxSize] = useState(5);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleExport = async () => {
        if (!targetPath.trim()) {
            setError('Please enter a target path');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const options: ExportOptions = {
                targetPath,
                filter,
                pattern: filter === 'glob' ? pattern : undefined,
                exclude: exclude.split(',').map(s => s.trim()),
                maxSize,
            };

            const response = await runExport(options);
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!result?.outputPath) return;

        try {
            const filename = result.outputPath.split('\\').pop() || 'export.md';
            const blob = await downloadMarkdown(filename);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Download failed');
        }
    };

    const handleCopy = () => {
        if (!result?.outputPath) return;

        navigator.clipboard.writeText(result.outputPath);
    };

    return (
        <div className="container">
            <h1>md-exporter Demo</h1>

            <div className="form-group">
                <label>Target Path:</label>
                <input
                    type="text"
                    value={targetPath}
                    onChange={(e) => setTargetPath(e.target.value)}
                    placeholder="e.g., D:\my-project\src or ./src"
                />
            </div>

            <div className="form-group">
                <label>Filter:</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                    <option value="all">All Files</option>
                    <option value="tsx">TypeScript/React</option>
                    <option value="css">CSS</option>
                    <option value="md">Markdown</option>
                    <option value="json">JSON</option>
                    <option value="glob">Custom Glob</option>
                </select>
            </div>

            {filter === 'glob' && (
                <div className="form-group">
                    <label>Glob Pattern:</label>
                    <input
                        type="text"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        placeholder="e.g., **/*.{ts,tsx,js}"
                    />
                </div>
            )}

            <div className="form-group">
                <label>Exclude Directories:</label>
                <input
                    type="text"
                    value={exclude}
                    onChange={(e) => setExclude(e.target.value)}
                    placeholder="Comma-separated"
                />
            </div>

            <div className="form-group">
                <label>Max File Size (MB):</label>
                <input
                    type="number"
                    value={maxSize}
                    onChange={(e) => setMaxSize(Number(e.target.value))}
                    min="1"
                />
            </div>

            <button onClick={handleExport} disabled={loading} className="export-button">
                {loading ? 'Exporting...' : 'Export'}
            </button>

            {error && <div className="error">{error}</div>}

            {result && (
                <div className="result">
                    <h2>Export Complete</h2>
                    <p><strong>Output:</strong> {result.outputPath}</p>
                    <p><strong>Files Included:</strong> {result.report?.included}</p>
                    <p><strong>Bytes Written:</strong> {result.report?.bytesWritten}</p>
                    <div className="action-buttons">
                        <button onClick={handleDownload} className="download-button">Download Markdown</button>
                        <button onClick={handleCopy} className="copy-button">Copy Markdown</button>
                    </div>
                </div>
            )}
        </div>
    );
}
