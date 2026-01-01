import type { ExportOptions } from '@asafarim/md-exporter';

export interface RunExportRequest {
    options: ExportOptions;
}

export interface RunExportResponse {
    outputPath: string;
    report: any;
    content?: string;
}

export async function runExport(options: ExportOptions): Promise<RunExportResponse> {
    const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options }),
    });

    if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.json();
}

export async function downloadMarkdown(filename: string): Promise<Blob> {
    const response = await fetch(`/api/download/${filename}`);

    if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
}

export async function getMarkdownContent(filename: string): Promise<string> {
    const response = await fetch(`/api/download/${filename}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
    }

    return response.text();
}
