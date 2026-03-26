import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Base path — change to '/your-repo-name/' if deploying to GitHub Pages
  base: '/poker-session-manager/'
})
