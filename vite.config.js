import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    allowedHosts: true,
  },
  server: {
    allowedHosts: true,
  },
  build: {
    // Use terser for better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // No sourcemaps in production
    sourcemap: false,
    // Raise the warning limit slightly; real savings come from splitting
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor dependencies into a separate chunk for better caching
        manualChunks: {
          aos: ['aos'],
        },
        // Content-hash filenames for long-term caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Inline small assets to reduce requests
    assetsInlineLimit: 4096,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minify CSS
    cssMinify: true,
  },
})
