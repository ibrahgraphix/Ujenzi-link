import express from 'express';
import { AdminListingService } from '../services/adminListingService';
import { AdminProviderService } from '../services/adminProviderService';
import { CategoryService } from '../services/categoryService';
import { supabase } from '../config';

const router = express.Router();
const listingService = new AdminListingService();
const providerService = new AdminProviderService();
const categoryService = new CategoryService();

/**
 * GET /sitemap.xml
 * Generates XML sitemap for SEO
 * Includes static pages, active listings, approved providers, and category/region landing pages
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://ujenzi-link.com';
    const currentDate = new Date().toISOString();

    // Fetch all active listings, approved providers, categories, and regions
    const [listingsResult, providersResult, categoriesResult, regionsResult] = await Promise.all([
      listingService.getAllListings({ status: 'active' as any }),
      providerService.getAllProviders({}),
      categoryService.getAllCategories(),
      supabase.from('regions').select('name').order('name'),
    ]);

    const listings = listingsResult || [];
    const providers = providersResult || [];
    const categories = categoriesResult || [];
    const regions = regionsResult.data?.map((r: any) => r.name) || [];

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

    // Category landing pages
    categories.forEach((category: any) => {
      const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/materials/${slug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Region landing pages
    regions.forEach((region: string) => {
      const slug = region.toLowerCase().replace(/\s+/g, '-');
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/suppliers/${slug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Active listings
    // TODO: When React Router is implemented, use slug URLs instead of UUIDs
    listings.forEach((listing: any) => {
      const lastmod = listing.updated_at || listing.created_at || currentDate;
      const slug = listing.id; // Will be replaced with slug + shortId when React Router is implemented
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/listings/${slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Active providers
    // TODO: When React Router is implemented, use slug URLs instead of UUIDs
    providers.forEach((provider: any) => {
      const lastmod = provider.updated_at || provider.joined_date || currentDate;
      const slug = provider.id; // Will be replaced with slug + shortId when React Router is implemented
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/providers/${slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
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
