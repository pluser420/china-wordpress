/**
 * Supported locale codes for the Jiayi Tools website.
 */
export const SUPPORTED_LOCALES = ['en', 'es'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Returns the locale extracted from a URL path prefix.
 * Paths starting with /es/ resolve to "es"; everything else resolves to "en".
 * The result is always a value within SUPPORTED_LOCALES.
 */
export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split('/')[1];
  if ((SUPPORTED_LOCALES as readonly string[]).includes(segment)) {
    return segment as Locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Switches the locale prefix in a localized path.
 * "/en/products/foo" → "/es/products/foo" (when targetLocale = "es")
 *
 * Preserves the full remainder of the path exactly.
 */
export function switchLocaleInPath(pathname: string, targetLocale: Locale): string {
  const currentLocale = getLocaleFromPath(pathname);

  if (currentLocale === targetLocale) {
    return pathname;
  }

  const prefixWithSlash = `/${currentLocale}`;
  if (pathname.startsWith(prefixWithSlash)) {
    return `/${targetLocale}${pathname.slice(prefixWithSlash.length)}`;
  }

  // No locale prefix — prepend target locale
  return `/${targetLocale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}
