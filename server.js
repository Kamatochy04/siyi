import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

// Redirect www hostnames to the apex domain.
app.use('*', (c, next) => {
  const host = c.req.header('host') || ''
  if (host.startsWith('www.')) {
    const nextHost = host.slice(4)
    const url = new URL(c.req.url)
    url.host = nextHost
    return c.redirect(url.toString(), 301)
  }
  return next()
})

// Serve static build output.
app.use('*', serveStatic({ root: './dist' }))

// SPA fallback to index.html when route file is missing.
app.use('*', serveStatic({ path: './dist/index.html' }))

const port = Number.parseInt(process.env.PORT || '8080', 10)
serve({ fetch: app.fetch, port })
