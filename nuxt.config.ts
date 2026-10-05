export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false, // SPA: tutto gira sul telefono
  modules: ['@vite-pwa/nuxt'],
  app: {
    head: {
      title: 'Archery Tracker',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [{ name: 'theme-color', content: '#1e2a24' }],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Archery Log',
      short_name: 'Archery',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#1e2a24',
      theme_color: '#1e2a24',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
  },
})
