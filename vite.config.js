import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// 在ES模块中定义__dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const resolve = path.resolve

// https://vite.dev/config/
export default defineConfig({
  root: resolve(__dirname, './apps/web'),
  publicDir: resolve(__dirname, './public'),
  plugins: [react()],
  resolve: {
    alias: {
      '@alg-visual/data-view': resolve(__dirname, './packages/data-view'),
      '@alg-visual/flowchart-renderer': resolve(__dirname, './packages/flowchart-renderer'),
      '@alg-visual/simulators': resolve(__dirname, './packages/simulators')
    }
  }
})
