import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectMediaDir = path.join(rootDir, 'dist', 'assets', 'projects');

let entries = [];
try {
  entries = await fs.readdir(projectMediaDir, { withFileTypes: true });
} catch (error) {
  if (error?.code === 'ENOENT') {
    console.log('[build:media] No project media directory to prune.');
    process.exit(0);
  }
  throw error;
}

let removedBytes = 0;
let removedFiles = 0;
// Refined masters are preserved in public for future editing. Ship only their
// generated detail/preview encodes, just as with the original source films.
const refinedDir = path.join(projectMediaDir, 'refined');
const refinedEntries = await fs.readdir(refinedDir, { withFileTypes: true }).catch((error) => {
  if (error.code === 'ENOENT') return [];
  throw error;
});
for (const entry of refinedEntries) {
  if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.mp4') continue;
  const filePath = path.join(refinedDir, entry.name);
  const stats = await fs.stat(filePath);
  await fs.unlink(filePath);
  removedBytes += stats.size;
  removedFiles += 1;
}
for (const entry of entries) {
  if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.mp4') continue;
  const filePath = path.join(projectMediaDir, entry.name);
  const stats = await fs.stat(filePath);
  await fs.unlink(filePath);
  removedBytes += stats.size;
  removedFiles += 1;
}

console.log(`[build:media] Removed ${removedFiles} source videos from dist (${(removedBytes / 1024 / 1024).toFixed(1)} MB).`);
