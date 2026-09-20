import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['ghochou.jpeg'],
      manifest: {
        name: 'Beegram',
        short_name: 'Beegram',
        description: 'A private relationship space for us.',
        theme_color: '#EDE7FA', // Mist Lavender
        background_color: '#FFF9F3', // Warm Paper
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'ghochou.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'ghochou.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'ghochou.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
