import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const apiDir = path.join(rootDir, 'api')

function parseEnvFile(content) {
  const entries = {}

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) continue

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    entries[key] = value
  }

  return entries
}

async function loadLocalEnv() {
  const envFiles = ['.env.local', '.env']

  for (const fileName of envFiles) {
    const filePath = path.join(rootDir, fileName)

    try {
      const content = await fs.readFile(filePath, 'utf8')
      const parsed = parseEnvFile(content)
      for (const [key, value] of Object.entries(parsed)) {
        if (!(key in process.env)) {
          process.env[key] = value
        }
      }
    } catch {
      // Ignore missing env files.
    }
  }
}

async function readRequestBody(req) {
  const method = (req.method || 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD') return undefined

  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (!chunks.length) return undefined

  const raw = Buffer.concat(chunks).toString('utf8')
  const contentType = String(req.headers['content-type'] || '')

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw)
    } catch {
      return undefined
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(raw))
  }

  return raw
}

function decorateResponse(res) {
  if (typeof res.status !== 'function') {
    res.status = (code) => {
      res.statusCode = code
      return res
    }
  }

  if (typeof res.json !== 'function') {
    res.json = (payload) => {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
      }
      res.end(JSON.stringify(payload))
      return res
    }
  }

  if (typeof res.send !== 'function') {
    res.send = (payload) => {
      if (Buffer.isBuffer(payload) || typeof payload === 'string') {
        res.end(payload)
      } else {
        res.json(payload)
      }
      return res
    }
  }

  return res
}

async function resolveHandler(routePath) {
  if (!routePath || routePath.includes('..')) return null

  const handlerPath = path.join(apiDir, `${routePath}.js`)

  try {
    await fs.access(handlerPath)
  } catch {
    return null
  }

  const moduleUrl = `${pathToFileURL(handlerPath).href}?t=${Date.now()}`
  const imported = await import(moduleUrl)
  return imported?.default || null
}

export async function startLocalApiServer({ port = 4174 } = {}) {
  await loadLocalEnv()

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1')

    if (!url.pathname.startsWith('/api/')) {
      res.statusCode = 404
      res.end('Not found')
      return
    }

    if (req.method === 'OPTIONS') {
      decorateResponse(res)
      res.status(204).send('')
      return
    }

    const routePath = url.pathname.replace(/^\/api\/?/, '')
    const handler = await resolveHandler(routePath)

    if (!handler) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ message: 'LOCAL_API_ROUTE_NOT_FOUND' }))
      return
    }

    try {
      req.query = Object.fromEntries(url.searchParams.entries())
      req.body = await readRequestBody(req)
      decorateResponse(res)

      await handler(req, res)

      if (!res.writableEnded) {
        res.end()
      }
    } catch (error) {
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
      }

      res.end(JSON.stringify({
        message: 'LOCAL_API_HANDLER_ERROR',
        details: error?.message || 'Unknown local API error',
      }))
    }
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', resolve)
  })

  return server
}

if (process.argv[1] === __filename) {
  const port = Number(process.env.LOCAL_API_PORT || 4174)
  const server = await startLocalApiServer({ port })

  console.log(`[local-api] running on http://127.0.0.1:${port}`)

  const shutdown = () => {
    server.close(() => process.exit(0))
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}
