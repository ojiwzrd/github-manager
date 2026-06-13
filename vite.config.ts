import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@uiw/react-codemirror', '@codemirror/lang-javascript', '@codemirror/lang-html', '@codemirror/lang-css', '@codemirror/lang-json', '@codemirror/lang-python', '@codemirror/lang-markdown', '@codemirror/lang-sql'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
})
