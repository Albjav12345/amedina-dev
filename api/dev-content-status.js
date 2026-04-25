import fs from 'node:fs/promises'

import { generateProjectMedia } from '../scripts/generate-project-media.mjs'
import {
  GENERATED_JSON_PATH,
  WORKBOOK_PATH,
  syncPortfolioContent,
} from '../scripts/lib/portfolio-content-workbook.mjs'

const syncRetryDelayMs = 700
const syncMaxRetries = 3

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function getFileMtimeMs(targetPath) {
  try {
    const stats = await fs.stat(targetPath)
    return stats.mtimeMs
  } catch {
    return 0
  }
}

async function readGeneratedContent() {
  const raw = await fs.readFile(GENERATED_JSON_PATH, 'utf8')
  return JSON.parse(raw)
}

async function syncRuntimeOnly(attempt = 0) {
  try {
    await syncPortfolioContent({ writeWorkbookOutput: false })
    await generateProjectMedia()
    return true
  } catch (error) {
    if (attempt < syncMaxRetries) {
      await sleep(syncRetryDelayMs)
      return syncRuntimeOnly(attempt + 1)
    }

    throw error
  }
}

export default async function handler(_req, res) {
  const workbookMtimeMs = await getFileMtimeMs(WORKBOOK_PATH)
  const runtimeBeforeMtimeMs = await getFileMtimeMs(GENERATED_JSON_PATH)

  let refreshed = false

  if (workbookMtimeMs > runtimeBeforeMtimeMs) {
    await syncRuntimeOnly()
    refreshed = true
  }

  const runtimeContent = await readGeneratedContent()
  const runtimeAfterMtimeMs = await getFileMtimeMs(GENERATED_JSON_PATH)

  res.status(200).json({
    refreshed,
    workbookMtimeMs,
    runtimeMtimeMs: runtimeAfterMtimeMs,
    generatedAt: runtimeContent.generatedAt,
    featuredTestimonials: runtimeContent.runtime?.profile?.about?.testimonials?.length ?? 0,
  })
}
