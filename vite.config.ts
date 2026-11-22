import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset URLs relative, so the build works on GitHub Pages
// project sites (https://user.github.io/repo/) without extra configuration.
export default defineConfig({
  base: './',
  plugins: [react()],
})
