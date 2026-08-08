import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  // Port 3001 to stay clear of the other apps a course might run alongside it.
  server: { port: 3001 },
  preview: { port: 3001 },
})
