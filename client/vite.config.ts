import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { DiscordProxy } from '@robojs/patch'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), DiscordProxy.Vite()],
  envDir: '../',
  server: {
    host: true, // <== Allow external access
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/ws' :{
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        ws: true,
      }                            
    },
    hmr: {
      clientPort: 443,
    },
    allowedHosts: [".trycloudflare.com"], // Optional
  },
})
