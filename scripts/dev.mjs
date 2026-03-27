import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { startLocalApiServer } from './local-api-server.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')

const apiPort = Number(process.env.LOCAL_API_PORT || 4174)
const viteHost = process.env.VITE_HOST || '127.0.0.1'
const vitePort = Number(process.env.VITE_PORT || 5173)
const proxyTarget = process.env.VITE_API_PROXY_TARGET || `http://127.0.0.1:${apiPort}`

let apiServer
let viteProcess
let shuttingDown = false

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

async function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true

  if (viteProcess && !viteProcess.killed) {
    viteProcess.kill('SIGTERM')
  }

  await closeApiServer()
  exitWithCode(code)
}

try {
  apiServer = await startLocalApiServer({ port: apiPort })
  console.log(`[local-api] running on ${proxyTarget}`)
  console.log(`[dev] frontend target: http://${viteHost}:${vitePort}`)

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
