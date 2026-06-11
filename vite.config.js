import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base = nome do repositório, necessário pro GitHub Pages
export default defineConfig({
  plugins: [vue()],
  base: '/album-figurinhas/'
})