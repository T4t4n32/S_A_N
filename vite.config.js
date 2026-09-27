import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'SAN — Sistema de Asignación de Notas',
        short_name: 'SAN',
        description: 'Registro de calificaciones para docentes: notas, promedios y periodos académicos, todo guardado en el dispositivo.',
        lang: 'es',
        start_url: './',
        display: 'standalone',
        background_color: '#0a0a0f',
        theme_color: '#0a0a0f',
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Everything the app needs is either bundled or already in
        // localStorage, so a plain cache-first app shell is enough — no
        // network calls to worry about invalidating.
        globPatterns: ['**/*.{js,css,html,woff2,png,webp,svg,ico}']
      }
    })
  ],
  base: './', // Important for Electron and Capacitor to resolve assets correctly
})
