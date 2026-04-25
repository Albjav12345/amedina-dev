import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  WORKBOOK_PATH,
  GENERATED_JSON_PATH,
  CONTENT_README_PATH,
  initPortfolioWorkbook,
  syncPortfolioContent,
  checkPortfolioContent,
} from './lib/portfolio-content-workbook.mjs';

const __filename = fileURLToPath(import.meta.url);

async function main() {
  const args = new Set(process.argv.slice(2));

  if (args.has('--init')) {
    await initPortfolioWorkbook();
    console.log(`[content:init] workbook ready at ${WORKBOOK_PATH}`);
    console.log(`[content:init] generated runtime ready at ${GENERATED_JSON_PATH}`);
    console.log(`[content:init] editor guide ready at ${CONTENT_README_PATH}`);
    return;
  }

  if (args.has('--check')) {
    await checkPortfolioContent();
    console.log(`[content:check] workbook is valid: ${WORKBOOK_PATH}`);
    return;
  }

  await syncPortfolioContent();
  console.log(`[content:sync] synced workbook -> ${path.relative(path.dirname(__filename), GENERATED_JSON_PATH)}`);
}

main().catch((error) => {
  console.error('[content] Failed:', error);
  process.exitCode = 1;
});
