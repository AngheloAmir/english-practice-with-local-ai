import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/proxy/ollama': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/ollama/, ''),
      },
      '/proxy/tts': {
        target: 'http://127.0.0.1:8880',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/tts/, ''),
      },
      '/proxy/whisper': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/whisper/, ''),
      },
    },
  },
})
