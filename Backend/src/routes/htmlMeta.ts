import express, { Request, Response } from 'express';
import { ListingService } from '../services/listingService';
import { AdminProviderService } from '../services/adminProviderService';

const router = express.Router();
const listingService = new ListingService();
const providerService = new AdminProviderService();

// Base frontend URL (update to your actual frontend deployment)
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ujenzi-link.com';

/**
 * GET /html-meta/listings/:id
 * Returns index.html with injected metadata for a specific listing
 */
router.get('/listings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch listing from database
    const listing = await listingService.getListingById(id);

    if (!listing || listing.status !== 'active') {
      return res.status(404).send('Listing not found');
    }

    const metadata = generateListingMetadata(listing);

    // Fetch index.html from frontend
    const indexHtmlResponse = await fetch(`${FRONTEND_URL}/index.html`);
    let html = await indexHtmlResponse.text();

    // Inject metadata
    html = injectMetadata(html, metadata);

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch (error) {
    console.error('Error generating listing HTML:', error);
    res.status(500).send('Error generating page');
  }
});

/**
 * GET /html-meta/providers/:id
 * Returns index.html with injected metadata for a specific provider
 */
router.get('/providers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch provider from database
    const provider = await providerService.getProviderById(id);

    if (!provider || provider.status !== 'active') {
      return res.status(404).send('Provider not found');
    }

    const metadata = generateProviderMetadata(provider);

    // Fetch index.html from frontend
    const indexHtmlResponse = await fetch(`${FRONTEND_URL}/index.html`);
    let html = await indexHtmlResponse.text();

    // Inject metadata
    html = injectMetadata(html, metadata);

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch (error) {
    console.error('Error generating provider HTML:', error);
    res.status(500).send('Error generating page');
  }
});

function generateListingMetadata(listing: any) {
  const title = `${listing.title} in ${listing.location.region} | Ujenzi Link`;
  const description = listing.description
    ? listing.description.substring(0, 160)
    : `View ${listing.title} from ${listing.providerName}. Available in ${listing.location.region}, Tanzania. Direct supplier pricing.`;
  const imageUrl = listing.images?.[0] || 'https://ujenzi-link.com/og-image.jpg';
  const canonicalUrl = `https://ujenzi-link.com/listings/${listing.id}`;

  return {
    title,
    description,
    imageUrl,
    canonicalUrl,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description,
      image: listing.images?.[0],
      category: listing.category,
      ...(listing.price && listing.price > 0 && {
        offers: {
          '@type': 'Offer',
          price: listing.price,
          priceCurrency: listing.currency || 'TZS',
          availability: listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: listing.providerName,
          },
        },
      }),
    },
  };
}

function generateProviderMetadata(provider: any) {
  const title = `${provider.fullName || provider.name} - ${provider.businessName} | Ujenzi Link`;
  const description = provider.bio
    ? provider.bio.substring(0, 160)
    : `View ${provider.businessName}, a ${provider.providerType} in ${provider.location?.region || 'Tanzania'}.`;
  const imageUrl = provider.logo || 'https://ujenzi-link.com/og-image.jpg';
  const canonicalUrl = `https://ujenzi-link.com/providers/${provider.id}`;

  return {
    title,
    description,
    imageUrl,
    canonicalUrl,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': provider.providerType === 'Contractor' || provider.providerType === 'Consultant' ? 'LocalBusiness' : 'Organization',
      name: provider.fullName || provider.name,
      legalName: provider.businessName,
      description: provider.bio,
      url: 'https://ujenzi-link.com',
      logo: provider.logo,
      telephone: provider.phone,
      email: provider.email,
      address: {
        '@type': 'PostalAddress',
        addressLocality: provider.location?.district,
        addressRegion: provider.location?.region,
        addressCountry: provider.location?.country || 'Tanzania',
      },
      ...(provider.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: provider.rating,
          reviewCount: provider.reviewsCount,
        },
      }),
    },
  };
}

function injectMetadata(html: string, metadata: any) {
  const { title, description, imageUrl, canonicalUrl, jsonLd } = metadata;

  // Replace title
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description" content=".*?"\/>/,
    `<meta name="description" content="${description}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href=".*?"\/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:title" content=".*?"\/>/,
    `<meta property="og:title" content="${title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?"\/>/,
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?"\/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta property="og:image" content=".*?"\/>/,
    `<meta property="og:image" content="${imageUrl}" />`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content=".*?"\/>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?"\/>/,
    `<meta name="twitter:description" content="${description}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content=".*?"\/>/,
    `<meta name="twitter:image" content="${imageUrl}" />`
  );

  // Inject JSON-LD before closing head
  const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  html = html.replace('</head>', `${jsonLdScript}\n  </head>`);

  return html;
}

export default router;
