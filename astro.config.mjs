import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// Mode SSG pur (section 10 de la note stratégique).
// Aucun adaptateur nécessaire : la sortie est un dossier dist/ statique,
// déployé tel quel sur Cloudflare Pages.
export default defineConfig({
  site: 'https://lasource.dev',
  output: 'static',
  adapter: cloudflare(),
});