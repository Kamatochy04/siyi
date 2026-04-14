import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono();

// 301 redirect from www to non-www
app.use('*', (c, next) => {
  const host = c.req.header('host') || '';
  if (host.startsWith('www.')) {
    const nonWwwHost = host.slice(4);
    const url = new URL(c.req.url);
    url.host = nonWwwHost;
    return c.redirect(url.toString(), 301);
  }
  return next();
});

// Serve static files from the dist folder
app.use('*', serveStatic({ root: './dist' }));

// SPA fallback — serve index.html for unmatched routes
app.use('*', serveStatic({ path: './dist/index.html' }));

const port = parseInt(process.env.PORT || '8080', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on port ${port}`);
});
