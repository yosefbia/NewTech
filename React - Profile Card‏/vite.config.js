import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// standard Vite + React setup (see index.html for the entry file)
export default defineConfig({
  plugins: [react()],
})
