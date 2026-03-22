import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { imagetools } from 'vite-imagetools'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET

export default defineConfig({
  plugins: [
    react(),
    imagetools()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: apiProxyTarget ? {
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: apiProxyTarget.startsWith('https://'),
      }
    }
  } : undefined,
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'animations': ['framer-motion'],
        },
      },
    },
  },
})
