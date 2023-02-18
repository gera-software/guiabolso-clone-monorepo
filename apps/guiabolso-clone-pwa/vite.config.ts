import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import { VitePWA } from 'vite-plugin-pwa'

import fs from 'fs'

const packageJson = fs.readFileSync('./package.json')
// @ts-ignore
const version = JSON.parse(packageJson).version || 0

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteCommonjs(), 
    vue(),
    VitePWA({ 
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'vite.svg'],
      manifest: {
        name: 'Guiabolso Clone',
        short_name: 'Guiabolso',
        description: 'Clone do App Guiabolso porque o original foi descontinuado',
        theme_color: "#250048",
        background_color: "#250048",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          // {
          //   src: 'android-chrome-512x512.png',
          //   sizes: '512x512',
          //   type: 'image/png',
          //   purpose: 'any maskable'
          // }
        ]
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      // registerType: 'autoUpdate',
      workbox: {
        // globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        navigateFallback: 'offline.html'
      },
      devOptions: {
        enabled: true,
        type: 'module',
      }
     }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8885/.netlify/functions',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  define: {
    '__APP_VERSION__': '"' + version +  '"'
  }
})
