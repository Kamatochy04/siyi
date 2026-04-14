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

// Redirect www hostnames to the apex domain.
app.use('*', (c, next) => {
  const host = c.req.header('host') || ''
  if (host.startsWith('www.')) {
    const nextHost = host.slice(4)
    const url = new URL(c.req.url)
    url.host = nextHost
    console.log(`[server] www redirect: ${c.req.url} → ${url.toString()}`)
    return c.redirect(url.toString(), 301)
  }
  return next()
})

// Serve static build output.
app.use('*', serveStatic({ root: distDir }))

// SPA fallback — serve index.html for any unmatched route.
app.use('*', serveStatic({ path: distIndex }))

const port = Number.parseInt(process.env.PORT || '8080', 10)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[server] listening on http://0.0.0.0:${info.port}`)
})

process.on('uncaughtException', (err) => {
  console.error('[server] uncaught exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandled rejection:', reason)
  process.exit(1)
})
