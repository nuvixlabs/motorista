import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    middlewares: [
      {
        handler(req, res, next) {
          if (req.url !== '/' && !req.url.match(/\.[a-z]+$/i)) {
            req.url = '/'
          }
          next()
        }
      }
    ]
  }
})
