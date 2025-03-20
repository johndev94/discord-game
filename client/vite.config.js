import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
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
    },
    hmr: {
      clientPort: 443,
    },
    allowedHosts: ["college-essence-acm-french.trycloudflare.com"], // Optional
  },
});
