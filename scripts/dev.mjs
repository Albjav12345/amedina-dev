import fs from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateProjectMedia } from './generate-project-media.mjs'
import { startLocalApiServer } from './local-api-server.mjs'
import { WORKBOOK_PATH, syncPortfolioContent } from './lib/portfolio-content-workbook.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')

const apiPort = Number(process.env.LOCAL_API_PORT || 4174)
const viteHost = process.env.VITE_HOST || '127.0.0.1'
const vitePort = Number(process.env.VITE_PORT || 5173)
const proxyTarget = process.env.VITE_API_PROXY_TARGET || `http://127.0.0.1:${apiPort}`
const useExternalWorkbookWatcher = process.env.EXTERNAL_WORKBOOK_WATCHER === '1'
const workbookWatchDebounceMs = 450
const workbookSyncRetryDelayMs = 800
const workbookSyncMaxRetries = 3
const workbookPollIntervalMs = 900

let apiServer
let viteProcess
let workbookWatcher
let workbookRefreshTimer
let workbookWatchFileRegistered = false
let workbookRefreshInFlight = false
let workbookRefreshQueued = false
let shuttingDown = false
let lastWorkbookSignature = null

function exitWithCode(code = 0) {
  process.exitCode = code
}

async function closeApiServer() {
  if (!apiServer) return

  const serverToClose = apiServer
  apiServer = null

  await new Promise((resolve) => {
    serverToClose.close(() => resolve())
  })
}

function closeWorkbookWatcher() {
  if (!workbookWatcher) return
  workbookWatcher.close()
  workbookWatcher = null
}

function stopWorkbookPolling() {
  if (!workbookWatchFileRegistered) return
  fs.unwatchFile(WORKBOOK_PATH)
  workbookWatchFileRegistered = false
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getWorkbookSignature(stats) {
  if (!stats) return null
  return `${stats.size}:${stats.mtimeMs}`
}

function readWorkbookSignature() {
  try {
    return getWorkbookSignature(fs.statSync(WORKBOOK_PATH))
  } catch {
    return null
  }
}

async function refreshRuntimeFromWorkbook(trigger, attempt = 0) {
  try {
    await syncPortfolioContent({ writeWorkbookOutput: false })
    await generateProjectMedia()
    console.log(`[dev] workbook refresh complete (${trigger})`)
    return true
  } catch (error) {
    if (attempt < workbookSyncMaxRetries) {
      await sleep(workbookSyncRetryDelayMs)
      return refreshRuntimeFromWorkbook(trigger, attempt + 1)
    }

    console.error(`[dev] workbook refresh failed (${trigger}):`, error)
    return false
  }
}

async function runWorkbookRefresh(trigger) {
  if (shuttingDown) return

  if (workbookRefreshInFlight) {
    workbookRefreshQueued = true
    return
  }

  workbookRefreshInFlight = true

  try {
    await refreshRuntimeFromWorkbook(trigger)
  } finally {
    workbookRefreshInFlight = false

    if (workbookRefreshQueued && !shuttingDown) {
      workbookRefreshQueued = false
      await runWorkbookRefresh('queued workbook change')
    }
  }
}

function scheduleWorkbookRefresh(trigger) {
  if (shuttingDown) return

  clearTimeout(workbookRefreshTimer)
  workbookRefreshTimer = setTimeout(() => {
    runWorkbookRefresh(trigger).catch((error) => {
      console.error('[dev] Unexpected workbook refresh failure:', error)
    })
  }, workbookWatchDebounceMs)
}

function watchWorkbookFile() {
  const workbookDir = path.dirname(WORKBOOK_PATH)
  const workbookName = path.basename(WORKBOOK_PATH)
  const workbookLockName = `~$${workbookName}`

  lastWorkbookSignature = readWorkbookSignature()

  workbookWatcher = fs.watch(workbookDir, (eventType, fileName) => {
    if (shuttingDown) return

    const normalizedFileName = typeof fileName === 'string' ? fileName : ''
    if (normalizedFileName && normalizedFileName !== workbookName && normalizedFileName !== workbookLockName) {
      return
    }

    if (normalizedFileName === workbookLockName) {
      return
    }

    scheduleWorkbookRefresh(`${eventType || 'change'}:${normalizedFileName || workbookName}`)
  })

  workbookWatcher.on('error', (error) => {
    console.error('[dev] Workbook watcher failed:', error)
  })

  fs.watchFile(WORKBOOK_PATH, { interval: workbookPollIntervalMs }, (currentStats, previousStats) => {
    if (shuttingDown) return

    const previousSignature = getWorkbookSignature(previousStats)
    const currentSignature = getWorkbookSignature(currentStats)

    if (currentSignature && currentSignature !== previousSignature && currentSignature !== lastWorkbookSignature) {
      lastWorkbookSignature = currentSignature
      scheduleWorkbookRefresh('poll:portfolio-master.xlsx')
    }
  })

  workbookWatchFileRegistered = true
}

async function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true

  clearTimeout(workbookRefreshTimer)
  closeWorkbookWatcher()
  stopWorkbookPolling()

  if (viteProcess && !viteProcess.killed) {
    viteProcess.kill('SIGTERM')
  }

  await closeApiServer()
  exitWithCode(code)
}

try {
  const initialRefreshSucceeded = await refreshRuntimeFromWorkbook('startup')
  if (!initialRefreshSucceeded) {
    throw new Error('Initial workbook sync failed.')
  }
  lastWorkbookSignature = readWorkbookSignature()
  apiServer = await startLocalApiServer({ port: apiPort })
  if (useExternalWorkbookWatcher) {
    watchWorkbookFile()
  }
  console.log(`[local-api] running on ${proxyTarget}`)
  console.log(`[dev] frontend target: http://${viteHost}:${vitePort}`)
  console.log(`[dev] workbook live sync handled by Vite dev plugin: ${WORKBOOK_PATH}`)

  viteProcess = spawn(
    process.execPath,
    [viteBin, '--host', viteHost, '--port', String(vitePort), '--strictPort'],
    {
      cwd: rootDir,
      stdio: ['inherit', 'pipe', 'pipe'],
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: proxyTarget,
      },
    },
  )

  viteProcess.stdout?.pipe(process.stdout)
  viteProcess.stderr?.pipe(process.stderr)

  viteProcess.on('exit', async (code, signal) => {
    await closeApiServer()

    if (signal) {
      exitWithCode(1)
      return
    }

    exitWithCode(code ?? 0)
  })

  viteProcess.on('error', async (error) => {
    console.error('[dev] Failed to start Vite:', error)
    await shutdown(1)
  })
} catch (error) {
  console.error('[dev] Failed to start local development environment:', error)
  await shutdown(1)
}

process.on('SIGINT', async () => {
  await shutdown(0)
})

process.on('SIGTERM', async () => {
  await shutdown(0)
})
