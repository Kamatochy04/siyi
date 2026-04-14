import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, 'dist')
const distIndex = join(distDir, 'index.html')

console.log(`[server] dist directory: ${distDir}`)

const app = new Hono()

// Serve static files from dist
app.use('*', serveStatic({ root: distDir }))

// SPA fallback — serve index.html for any unmatched route
app.use('*', serveStatic({ path: distIndex }))

const port = Number.parseInt(process.env.PORT || '8080', 10)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[server] listening on http://0.0.0.0:${info.port}`)
})