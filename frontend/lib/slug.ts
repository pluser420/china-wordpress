/**
 * Slug generation utilities for JIAYI Tools.
 *
 * These functions generate URL-safe slugs from human-readable strings,
 * ensuring uniqueness constraints can be checked at the application level.
 */

/**
 * Converts a product or category name into a URL-safe slug.
 *
 * Rules (applied in order):
 * 1. Lowercase everything
 * 2. Replace underscores and spaces with hyphens
 * 3. Strip characters that are not lowercase ASCII letters, digits, or hyphens
 * 4. Collapse consecutive hyphens into a single hyphen
 * 5. Trim leading and trailing hyphens
 *
 * @example
 * generateSlug('Carbide Drill Bit')  // => 'carbide-drill-bit'
 * generateSlug('5-Axis CNC (Custom)')  // => '5-axis-cnc-custom'
 * generateSlug('  --hello world--  ')  // => 'hello-world'
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Strip characters that are not alphanumeric or hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Collapse consecutive hyphens
    .replace(/-{2,}/g, '-')
    // Trim leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}
