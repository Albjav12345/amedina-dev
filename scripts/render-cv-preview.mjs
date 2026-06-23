import fs from 'node:fs/promises';
import path from 'node:path';
import { buildCvArtifacts } from '../api/lib/cv-pdf.js';

const rootDir = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(rootDir, 'src', 'data', 'cv', 'published.json');
const outputDir = path.join(rootDir, 'tmp', 'pdfs', 'cv-studio');
const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
const { html, pdf } = await buildCvArtifacts(data);

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'preview.html'), html);
await fs.writeFile(path.join(outputDir, 'preview.pdf'), pdf);
console.log(`[cv-preview] ${path.join(outputDir, 'preview.pdf')}`);
