import type { APIRoute } from 'astro';

// Emit robots.txt at build time so the Sitemap URL always tracks SITE_URL
// instead of a hardcoded (and previously wrong) domain.
export const GET: APIRoute = ({ site }) => {
  if (!site) {
    throw new Error('Astro.site is undefined: set SITE_URL before building.');
  }
  const sitemapUrl = new URL('sitemap-index.xml', site).toString();
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
