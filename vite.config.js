import fs from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { imagetools } from 'vite-imagetools'
import { generateProjectMedia } from './scripts/generate-project-media.mjs'
import { WORKBOOK_PATH, syncPortfolioContent } from './scripts/lib/portfolio-content-workbook.mjs'

const workbookPollIntervalMs = 900
const workbookSyncRetryDelayMs = 800
const workbookSyncMaxRetries = 3

function portfolioWorkbookDevPlugin() {
  let server
  let disposed = false
  let refreshInFlight = false
  let refreshQueued = false
  let lastWorkbookSignature = null

  const sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

  const getWorkbookSignature = () => {
    try {
      const stats = fs.statSync(WORKBOOK_PATH)
      return `${stats.size}:${stats.mtimeMs}`
    } catch {
      return null
    }
  }

  const refreshRuntimeFromWorkbook = async (trigger, attempt = 0) => {
    try {
      await syncPortfolioContent({ writeWorkbookOutput: false })
      await generateProjectMedia()
      server.ws.send({ type: 'full-reload', path: '*' })
      console.log(`[vite] workbook refresh complete (${trigger})`)
      return true
    } catch (error) {
      if (attempt < workbookSyncMaxRetries) {
        await sleep(workbookSyncRetryDelayMs)
        return refreshRuntimeFromWorkbook(trigger, attempt + 1)
      }

      console.error(`[vite] workbook refresh failed (${trigger}):`, error)
      return false
    }
  }

  const runWorkbookRefresh = async (trigger) => {
    if (disposed || !server) return

    if (refreshInFlight) {
      refreshQueued = true
      return
    }

    refreshInFlight = true

    try {
      const refreshSucceeded = await refreshRuntimeFromWorkbook(trigger)
      if (refreshSucceeded) {
        lastWorkbookSignature = getWorkbookSignature()
      }
    } finally {
      refreshInFlight = false

      if (refreshQueued && !disposed) {
        refreshQueued = false
        await runWorkbookRefresh('queued workbook change')
      }
    }
  }

  return {
    name: 'portfolio-workbook-dev-plugin',
    apply: 'serve',
    configureServer(viteServer) {
      server = viteServer
      lastWorkbookSignature = getWorkbookSignature()

      fs.watchFile(WORKBOOK_PATH, { interval: workbookPollIntervalMs }, (currentStats, previousStats) => {
        if (disposed) return

        const previousSignature = `${previousStats.size}:${previousStats.mtimeMs}`
        const currentSignature = `${currentStats.size}:${currentStats.mtimeMs}`

        if (currentSignature !== previousSignature && currentSignature !== lastWorkbookSignature) {
          lastWorkbookSignature = currentSignature
          runWorkbookRefresh('portfolio-master.xlsx save').catch((error) => {
            console.error('[vite] Unexpected workbook refresh failure:', error)
          })
        }
      })

      viteServer.httpServer?.once('close', () => {
        disposed = true
        fs.unwatchFile(WORKBOOK_PATH)
      })

      console.log(`[vite] workbook live sync enabled: ${WORKBOOK_PATH}`)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  const apiProxyTarget = env.VITE_API_PROXY_TARGET

  return {
    plugins: [
      portfolioWorkbookDevPlugin(),
      react(),
      imagetools(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: apiProxyTarget ? {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: apiProxyTarget.startsWith('https://'),
        }
      }
    } : undefined,
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'animations': ['framer-motion'],
          },
        },
      },
    },
  }
})
