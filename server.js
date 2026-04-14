import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

// Serve built static files.
app.use('*', serveStatic({ root: './dist' }))

// SPA fallback: return index.html for unmatched routes.
app.use('*', serveStatic({ path: './dist/index.html' }))

const port = Number.parseInt(process.env.PORT || '8080', 10)
serve({ fetch: app.fetch, port }, () => {
  console.log(`[server] SIAI site started on port ${port}`)
})
