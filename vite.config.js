import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    // Railway (и другие PaaS) отдают запросы с произвольным Host — иначе Vite блокирует.
    allowedHosts: true,
  },
  server: {
    allowedHosts: true,
  },
})
