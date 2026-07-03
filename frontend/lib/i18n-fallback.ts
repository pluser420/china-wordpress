import logger from './logger';

/**
 * Returns localized data if available, otherwise returns the fallback (default locale) data
 * and logs a WARN.
 *
 * Used when a CMS entry has no translation for the requested locale.
 * Satisfies Requirement 6.6: render English content, log warning.
 */
export function withLocaleFallback<T>(
  localizedData: T | null | undefined,
  fallback: T,
): T {
  if (localizedData === null || localizedData === undefined) {
    logger.warn('Missing translation for locale; falling back to default locale data');
    return fallback;
  }
  return localizedData;
}
