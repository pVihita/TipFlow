import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  define: {
    // Fallback environment variables
    'import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID': JSON.stringify(
      process.env.VITE_DYNAMIC_ENVIRONMENT_ID || 'a8eacbdc-5e30-430f-b1ab-70186a62f362'
    ),
  },
  server: {
    port: 5173,
    open: true,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok.io',
      '.ngrok-free.app',
      '.netlify.app',
      '.vercel.app'
    ]
  }
})
