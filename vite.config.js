import fs from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { imagetools } from 'vite-imagetools'
import { generateProjectMedia } from './scripts/generate-project-media.mjs'
import {
  GENERATED_JSON_PATH,
  PORTFOLIO_ROOT_DIR,
  WORKBOOK_PATH,
  buildWorkbookAssetPreviewState,
  syncPortfolioContent,
} from './scripts/lib/portfolio-content-workbook.mjs'

const workbookPollIntervalMs = 900
const workbookSyncRetryDelayMs = 800
const workbookSyncMaxRetries = 3
const devContentStatusPath = '/__dev/content-status'
const devAssetPreviewPath = '/__dev/asset-preview'
const devAssetSourcePath = '/__dev/asset-source'
const devAssetResolvedPath = '/__dev/asset-resolved'
const noStoreHeaderValue = 'no-store, no-cache, must-revalidate'
const mimeTypesByExtension = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml'],
  ['.gif', 'image/gif'],
  ['.mp4', 'video/mp4'],
  ['.mov', 'video/quicktime'],
  ['.webm', 'video/webm'],
  ['.ico', 'image/x-icon'],
])

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function getFileMtimeMs(targetPath) {
  try {
    const stats = await fs.promises.stat(targetPath)
    return stats.mtimeMs
  } catch {
    return 0
  }
}

async function readGeneratedContent() {
  const raw = await fs.promises.readFile(GENERATED_JSON_PATH, 'utf8')
  return JSON.parse(raw)
}

function setNoStoreHeaders(res) {
  res.setHeader('Cache-Control', noStoreHeaderValue)
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
}

function getRequestUrl(req) {
  return new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`)
}

function resolveExistingPublicAssetPath(publicPath) {
  const normalizedPath = String(publicPath || '').trim()
  if (!normalizedPath) return ''
  const relativePublicPath = normalizedPath.replace(/^\/+/, '')
  return path.join(PORTFOLIO_ROOT_DIR, 'public', relativePublicPath)
}

function resolveImportLocalSourcePath(sourceValue) {
  const normalizedPath = String(sourceValue || '').trim()
  if (!normalizedPath) return ''
  return path.isAbsolute(normalizedPath)
    ? normalizedPath
    : path.resolve(PORTFOLIO_ROOT_DIR, normalizedPath)
}

function getAssetLocalSourcePath(asset) {
  if (!asset) return ''
  if (asset.mode === 'import_local') {
    return resolveImportLocalSourcePath(asset.sourceValue)
  }
  if (asset.mode === 'existing_public') {
    return resolveExistingPublicAssetPath(asset.sourceValue || asset.targetPublicPath || asset.resolvedUrl)
  }
  if (asset.mode === 'external_url') {
    return ''
  }
  return ''
}

function getAssetLocalResolvedPath(asset) {
  if (!asset) return ''
  if (asset.mode === 'external_url') return ''
  return resolveExistingPublicAssetPath(asset.resolvedUrl)
}

async function streamLocalFile(res, filePath) {
  const resolvedPath = path.resolve(filePath)
  const extension = path.extname(resolvedPath).toLowerCase()
  const contentType = mimeTypesByExtension.get(extension) || 'application/octet-stream'
  const fileBuffer = await fs.promises.readFile(resolvedPath)
  setNoStoreHeaders(res)
  res.statusCode = 200
  res.setHeader('Content-Type', contentType)
  res.end(fileBuffer)
}

async function syncRuntimeOnly(attempt = 0) {
  try {
    await syncPortfolioContent({ writeWorkbookOutput: false })
    await generateProjectMedia()
    return true
  } catch (error) {
    if (attempt < workbookSyncMaxRetries) {
      await sleep(workbookSyncRetryDelayMs)
      return syncRuntimeOnly(attempt + 1)
    }

    throw error
  }
}

function portfolioWorkbookDevPlugin() {
  let server
  let disposed = false
  let refreshInFlight = false
  let refreshQueued = false
  let lastWorkbookSignature = null
  let previewStateCache = null

  const getWorkbookSignature = () => {
    try {
      const stats = fs.statSync(WORKBOOK_PATH)
      return `${stats.size}:${stats.mtimeMs}`
    } catch {
      return null
    }
  }

  const clearPreviewStateCache = () => {
    previewStateCache = null
  }

  const loadPreviewState = async () => {
    const signature = getWorkbookSignature()
    if (previewStateCache?.signature === signature) {
      return previewStateCache
    }

    const state = await buildWorkbookAssetPreviewState(WORKBOOK_PATH)
    previewStateCache = {
      signature,
      ...state,
    }
    return previewStateCache
  }

  const ensureRuntimeCurrent = async () => {
    const workbookMtimeMs = await getFileMtimeMs(WORKBOOK_PATH)
    const runtimeBeforeMtimeMs = await getFileMtimeMs(GENERATED_JSON_PATH)
    let refreshed = false

    if (workbookMtimeMs > runtimeBeforeMtimeMs) {
      await syncRuntimeOnly()
      clearPreviewStateCache()
      refreshed = true
      lastWorkbookSignature = getWorkbookSignature()
    }

    return {
      refreshed,
      workbookMtimeMs,
      runtimeMtimeMs: await getFileMtimeMs(GENERATED_JSON_PATH),
    }
  }

  const getAssetRequestState = async (req) => {
    await ensureRuntimeCurrent()
    const requestUrl = getRequestUrl(req)
    const assetId = requestUrl.searchParams.get('assetId')?.trim()

    if (!assetId) {
      return { requestUrl, assetId: '', asset: null, previewState: null }
    }

    const previewState = await loadPreviewState()
    const asset = previewState.resolvedAssets.find((entry) => entry.assetId === assetId) ?? null

    return {
      requestUrl,
      assetId,
      asset,
      previewState,
    }
  }

  const refreshRuntimeFromWorkbook = async (trigger, attempt = 0) => {
    try {
      await syncRuntimeOnly(attempt)
      clearPreviewStateCache()
      server.ws.send({ type: 'full-reload', path: '*' })
      console.log(`[vite] workbook refresh complete (${trigger})`)
      return true
    } catch (error) {
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

      viteServer.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(devContentStatusPath)
          && !req.url?.startsWith(devAssetPreviewPath)
          && !req.url?.startsWith(devAssetSourcePath)
          && !req.url?.startsWith(devAssetResolvedPath)
        ) {
          next()
          return
        }

        try {
          if (req.url?.startsWith(devContentStatusPath)) {
            const runtimeStatus = await ensureRuntimeCurrent()
            const runtimeContent = await readGeneratedContent()

            setNoStoreHeaders(res)
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({
              refreshed: runtimeStatus.refreshed,
              workbookMtimeMs: runtimeStatus.workbookMtimeMs,
              runtimeMtimeMs: runtimeStatus.runtimeMtimeMs,
              generatedAt: runtimeContent.generatedAt,
              featuredTestimonials: runtimeContent.runtime?.profile?.about?.testimonials?.length ?? 0,
            }))
            return
          }

          const { assetId, asset, previewState } = await getAssetRequestState(req)

          if (!assetId || !asset) {
            setNoStoreHeaders(res)
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({
              message: 'ASSET_NOT_FOUND',
              assetId: assetId || null,
            }))
            return
          }

          if (req.url?.startsWith(devAssetPreviewPath)) {
            const preview = previewState?.previewIndex?.get(assetId)
            if (!preview?.previewPath) {
              setNoStoreHeaders(res)
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({
                message: 'ASSET_PREVIEW_NOT_FOUND',
                assetId,
              }))
              return
            }

            await streamLocalFile(res, preview.previewPath)
            return
          }

          if (req.url?.startsWith(devAssetSourcePath)) {
            if (asset.mode === 'external_url') {
              setNoStoreHeaders(res)
              res.statusCode = 302
              res.setHeader('Location', asset.sourceValue)
              res.end()
              return
            }

            const sourcePath = getAssetLocalSourcePath(asset)
            if (!sourcePath || !fs.existsSync(sourcePath)) {
              setNoStoreHeaders(res)
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({
                message: 'ASSET_SOURCE_NOT_FOUND',
                assetId,
                sourcePath: sourcePath || null,
              }))
              return
            }

            await streamLocalFile(res, sourcePath)
            return
          }

          if (req.url?.startsWith(devAssetResolvedPath)) {
            if (asset.mode === 'external_url') {
              setNoStoreHeaders(res)
              res.statusCode = 302
              res.setHeader('Location', asset.resolvedUrl)
              res.end()
              return
            }

            const resolvedPath = getAssetLocalResolvedPath(asset)
            if (!resolvedPath || !fs.existsSync(resolvedPath)) {
              setNoStoreHeaders(res)
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({
                message: 'ASSET_RESOLVED_NOT_FOUND',
                assetId,
                resolvedPath: resolvedPath || null,
              }))
              return
            }

            await streamLocalFile(res, resolvedPath)
            return
          }
        } catch (error) {
          setNoStoreHeaders(res)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({
            message: 'DEV_WORKBOOK_ROUTE_ERROR',
            details: error instanceof Error ? error.message : String(error),
          }))
        }
      })

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
