/**
 * Slug utilities for SEO-friendly URLs
 * Generates readable slugs from text and extracts IDs from slug URLs
 */

/**
 * Convert text to URL-friendly slug
 * Example: "Cement Suppliers in Dar es Salaam" -> "cement-suppliers-dar-es-salaam"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 50); // Limit length
}

/**
 * Generate listing slug from title and location
 * Example: "Cement 42.5R" + "Dar es Salaam" -> "cement-42-5r-dar-es-salaam"
 */
export function generateListingSlug(title: string, region: string): string {
  const titleSlug = generateSlug(title);
  const regionSlug = generateSlug(region);
  return `${titleSlug}-${regionSlug}`;
}

/**
 * Generate provider slug from name, business name, and location
 * Example: "John Doe" + "Hardware Ltd" + "Dar es Salaam" -> "john-doe-hardware-ltd-dar-es-salaam"
 */
export function generateProviderSlug(
  fullName: string,
  businessName: string,
  region: string
): string {
  const nameSlug = generateSlug(fullName || businessName);
  const businessSlug = generateSlug(businessName);
  const regionSlug = generateSlug(region);
  return `${nameSlug}-${businessSlug}-${regionSlug}`;
}

/**
 * Extract short ID from slug URL
 * Example: "cement-suppliers-dar-es-salaam-ab12cd" -> "ab12cd"
 */
export function extractIdFromSlug(slugWithId: string): string {
  const parts = slugWithId.split('-');
  return parts[parts.length - 1] || '';
}

/**
 * Create full slug URL with short ID
 * Example: "cement-suppliers" + "ab12cd" -> "cement-suppliers-ab12cd"
 */
export function createSlugWithId(slug: string, shortId: string): string {
  const id = shortId.substring(0, 8); // Use first 8 chars of UUID
  return `${slug}-${id}`;
}

/**
 * Generate short ID from UUID (first 8 characters)
 * Example: "123e4567-e89b-12d3-a456-426614174000" -> "123e4567"
 */
export function getShortId(uuid: string): string {
  return uuid.substring(0, 8);
}

/**
 * Resolve UUID from short ID by finding a match in a list
 * This is used when routing with slug + shortId
 */
export function resolveUuidFromShortId(shortId: string, items: { id: string }[]): string | null {
  const match = items.find(item => item.id.startsWith(shortId));
  return match ? match.id : null;
}
