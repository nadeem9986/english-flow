import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Relative base so the app works from any subpath (e.g. a GitHub Pages project site)
// without rebuilding when the hosting path changes.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'English Flow',
        short_name: 'English Flow',
        description: 'Read aloud, listen back, and retell in your own words.',
        theme_color: '#0f1115',
        background_color: '#0f1115',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Keep the whole app available offline; recordings live in IndexedDB, not the cache.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
    }),
  ],
});
