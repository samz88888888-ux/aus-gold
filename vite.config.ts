import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const buildStamp = new Date().toISOString().replace(/[-:.TZ]/g, '')
const appVersion = process.env.APP_VERSION ?? `${process.env.npm_package_version ?? 'dev'}-${buildStamp}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
})
