import express from 'express';
import { runExport } from '@asafarim/md-exporter';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { ExportOptions } from '@asafarim/md-exporter';

const app = express();
const PORT = 5199;
const OUTPUT_DIR = join(process.cwd(), '.output');

app.use(express.json());

app.post('/api/run', async (req, res) => {
    try {
        const { options } = req.body as { options: ExportOptions };

        const result = await runExport({
            ...options,
            outDir: OUTPUT_DIR,
        });

        res.json({
            outputPath: result.outputMarkdownPath,
            report: result.report,
        });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

app.get('/api/download/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = join(OUTPUT_DIR, filename);

        const content = await readFile(filepath, 'utf-8');
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(content);
    } catch (error) {
        console.error('Download error:', error);
        res.status(404).json({ error: 'File not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
