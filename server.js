import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { etag } from 'hono/etag'
import { logger } from 'hono/logger'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const app = new Hono()
const PORT = Number(process.env.PORT) || 8080
const DIST_DIR = path.resolve('dist')

// ─── Logging ────────────────────────────────────────────────────────────────
app.use('*', logger())

// ─── Gzip / Brotli compression ───────────────────────────────────────────────
// compress() automatically picks brotli when the client supports it,
// falling back to gzip, then identity.
app.use('*', compress())

// ─── ETag support ────────────────────────────────────────────────────────────
app.use('*', etag())

// ─── Cache-Control headers ───────────────────────────────────────────────────
// Hashed asset files (JS/CSS/images with content-hash in filename) get a
// 1-year immutable cache.  Everything else (HTML, manifests, etc.) is
// revalidated on every request.
app.use('*', async (c, next) => {
  await next()

  const url = new URL(c.req.url)
  const pathname = url.pathname

  // Vite outputs hashed filenames like /assets/index-Bx3kP9aQ.js
  const isHashedAsset = /\/assets\/[^/]+-[a-zA-Z0-9]{8,}\.[a-z]+$/.test(pathname)

  if (isHashedAsset) {
    // Immutable: browser never re-requests until the URL changes
    c.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (pathname === '/' || pathname.endsWith('.html')) {
    // HTML: always revalidate so users get fresh content
    c.res.headers.set('Cache-Control', 'no-cache')
  } else {
    // Other static files (images, fonts, manifests): cache for 1 day, revalidate
    c.res.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  }
})

// ─── Response-size logging middleware ────────────────────────────────────────
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const contentLength = c.res.headers.get('content-length')
  const size = contentLength ? `${(Number(contentLength) / 1024).toFixed(1)} KB` : 'unknown size'
  const encoding = c.res.headers.get('content-encoding') || 'identity'
  const ms = Date.now() - start
  console.log(`  → ${c.res.status} ${c.req.path} [${encoding}] ${size} ${ms}ms`)
})

// ─── Static file serving ─────────────────────────────────────────────────────
app.use(
  '*',
  serveStatic({
    root: './dist',
  }),
)

// ─── SPA fallback: serve index.html for any unmatched route ──────────────────
app.get('*', async (c) => {
  const indexPath = path.join(DIST_DIR, 'index.html')
  try {
    const html = fs.readFileSync(indexPath, 'utf-8')
    // Generate a stable ETag from the file content
    const hash = crypto.createHash('md5').update(html).digest('hex').slice(0, 16)
    c.res = new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache',
        etag: `"${hash}"`,
      },
    })
    return c.res
  } catch {
    return c.text('Not found', 404)
  }
})

// ─── Start ───────────────────────────────────────────────────────────────────
serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`🚀 Server running on http://localhost:${info.port}`)
})
