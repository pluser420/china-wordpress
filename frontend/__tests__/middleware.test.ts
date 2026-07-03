/**
 * Property 14: Locale middleware resolves correct locale from path prefix
 *
 * For any request path string that begins with `/es/`, the middleware locale
 * resolver should return "es". For any path beginning with `/en/` or with no
 * locale prefix, it should return "en". The resolved locale should never be a
 * value outside the supported set ["en", "es"].
 *
 * Validates: Requirements 6.1, 6.2
 * Feature: jiayi-tools-website, Property 14: Locale middleware resolves correct locale from path prefix
 */

import * as fc from 'fast-check';
import { getLocaleFromPath, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../lib/locale';

describe('Property 14: Locale middleware resolves correct locale from path prefix', () => {
  // Arbitrary for path segments (path characters excluding /)
  const pathSegmentArb = fc.stringMatching(/^[a-zA-Z0-9\-_]+$/);

  it('should return "es" for any path beginning with /es/', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary paths after /es/
        fc.array(pathSegmentArb, { minLength: 0, maxLength: 5 }),
        (segments) => {
          const suffix = segments.length > 0 ? `/${segments.join('/')}` : '';
          const pathname = `/es${suffix}`;
          const resolved = getLocaleFromPath(pathname);
          return resolved === 'es';
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return "en" for any path beginning with /en/', () => {
    fc.assert(
      fc.property(
        fc.array(pathSegmentArb, { minLength: 0, maxLength: 5 }),
        (segments) => {
          const suffix = segments.length > 0 ? `/${segments.join('/')}` : '';
          const pathname = `/en${suffix}`;
          const resolved = getLocaleFromPath(pathname);
          return resolved === 'en';
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return the default locale "en" for paths with no locale prefix', () => {
    fc.assert(
      fc.property(
        // Paths that don't start with /en or /es
        fc.array(pathSegmentArb.filter((s) => s !== 'en' && s !== 'es'), {
          minLength: 1,
          maxLength: 5,
        }),
        (segments) => {
          const pathname = `/${segments.join('/')}`;
          const resolved = getLocaleFromPath(pathname);
          return resolved === DEFAULT_LOCALE;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should always return a value within the supported locale set', () => {
    fc.assert(
      fc.property(
        // Generate a wide range of path strings
        fc.oneof(
          fc.constant('/'),
          fc.constant('/en'),
          fc.constant('/es'),
          fc.constant('/en/products'),
          fc.constant('/es/products'),
          fc.constant('/fr/products'), // unsupported locale
          fc.stringMatching(/^\/[a-z]{2}(\/[a-zA-Z0-9\-_]+)*$/),
        ),
        (pathname) => {
          const resolved = getLocaleFromPath(pathname);
          return (SUPPORTED_LOCALES as readonly string[]).includes(resolved);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return "en" for the root path "/"', () => {
    expect(getLocaleFromPath('/')).toBe('en');
  });

  it('should return "en" for empty string', () => {
    expect(getLocaleFromPath('')).toBe('en');
  });

  it('should return "es" for exactly "/es"', () => {
    expect(getLocaleFromPath('/es')).toBe('es');
  });

  it('should return "en" for exactly "/en"', () => {
    expect(getLocaleFromPath('/en')).toBe('en');
  });
});
