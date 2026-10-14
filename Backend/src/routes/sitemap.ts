import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * GET /sitemap.xml
 * Generates XML sitemap for SEO
 * Includes static pages only (dynamic pages will be added when database is stable)
 */
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = 'https://ujenzi-link.com';
    const currentDate = new Date().toISOString();

    // Build XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = [
      { loc: `${baseUrl}/`, lastmod: currentDate, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/listings`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/providers`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/about`, lastmod: currentDate, changefreq: 'monthly', priority: '0.7' },
      { loc: `${baseUrl}/contact`, lastmod: currentDate, changefreq: 'monthly', priority: '0.5' },
      { loc: `${baseUrl}/terms`, lastmod: currentDate, changefreq: 'monthly', priority: '0.3' },
    ];

    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${page.loc}</loc>\n`;
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    // Set cache headers (1 hour)
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
