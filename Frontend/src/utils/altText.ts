/**
 * Alt text generation utilities for accessibility and SEO
 */

/**
 * Generate alt text for listing images
 * Format: "{title} by {providerName} in {location}"
 */
export function generateListingAltText(listing: {
  title: string;
  providerName: string;
  location?: { region?: string; district?: string };
}): string {
  const location = listing.location?.district
    ? `${listing.location.district}, ${listing.location.region}`
    : listing.location?.region || 'Tanzania';
  return `${listing.title} by ${listing.providerName} in ${location}`;
}

/**
 * Generate alt text for provider logos
 * Format: "{businessName} logo - {providerType} in {location}"
 */
export function generateProviderAltText(provider: {
  businessName: string;
  providerType: string;
  location?: { region?: string; district?: string };
}): string {
  const location = provider.location?.district
    ? `${provider.location.district}, ${provider.location.region}`
    : provider.location?.region || 'Tanzania';
  return `${provider.businessName} logo - ${provider.providerType} in ${location}`;
}

/**
 * Generate alt text for category images
 * Format: "{category} materials and services"
 */
export function generateCategoryAltText(category: string): string {
  return `${category} materials and services in Tanzania`;
}
