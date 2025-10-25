/* Pjuskeby Guardrails:
   - Ingen placeholders. Ingen ubrukte exports.
   - Følg koblinger.json for datakilder og relasjoner.
   - All skriving til DB/FS logges i donetoday.json.
   - Ved AI-generering: aldri publiser direkte; legg i drafts/.
   - Ved valideringsfeil: returner 422, ikke "tøm felt".
*/

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [mdx()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  server: {
    port: 4000,
    host: true,
  },
  site: 'https://pjuskeby.org',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
  build: {
    // Code splitting for better performance
    split: true,
    assets: '_astro'
  },
  vite: {
    build: {
      // Enable code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['lodash-es', 'date-fns']
          }
        }
      },
      // Optimize assets
      assetsInlineLimit: 0, // Don't inline assets for better caching
      cssCodeSplit: true
    },
    // CDN configuration for assets
    define: {
      __CDN_URL__: JSON.stringify(process.env.CDN_URL || 'https://pjuskeby.org')
    }
  }
});
