export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false,
  modules: ['@vite-pwa/nuxt'],
  app: {
    head: {
      title: 'Archery Log',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [{ name: 'theme-color', content: '#1e2a24' }],
      link: [{ rel: 'apple-touch-icon', href: '/icon-192.png' }],
    },
  },
  pwa: {
    registerType: 'prompt',
    manifest: {
      id: '/',
      name: 'Archery Log',
      short_name: 'Archery',
      lang: 'it',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#1e2a24',
      theme_color: '#1e2a24',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      cleanupOutdatedCaches: true,
    },
    devOptions: { enabled: false },
  },
})