import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// BASE_PATH is set by the GitHub Pages workflow (site lives under /currency-exchange-app/).
// Locally it stays "/", so dev and preview keep working at the server root.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
