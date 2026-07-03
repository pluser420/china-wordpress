/**
 * Property 15: Locale path switching preserves the page slug
 *
 * For any localized URL of the form /{localeA}/{rest}, the locale-switcher URL
 * builder should produce /{localeB}/{rest} — preserving the remainder of the
 * path exactly while replacing only the locale prefix.
 *
 * Validates: Requirements 6.3
 * Feature: jiayi-tools-website, Property 15: Locale path switching preserves the page slug
 */

import * as fc from 'fast-check';
import { switchLocaleInPath, getLocaleFromPath, SUPPORTED_LOCALES, type Locale } from '../../lib/locale';

describe('Property 15: Locale path switching preserves the page slug', () => {
  const pathSegmentArb = fc.stringMatching(/^[a-zA-Z0-9\-_]+$/);

  it('should preserve the remainder of the path when switching locale', () => {
    fc.assert(
      fc.property(
        // Source locale (either en or es)
        fc.constantFrom<Locale>('en', 'es'),
        // Target locale (either en or es)
        fc.constantFrom<Locale>('en', 'es'),
        // Arbitrary path after the locale prefix
        fc.array(pathSegmentArb, { minLength: 1, maxLength: 5 }),
        (sourceLocale, targetLocale, segments) => {
          const remainder = segments.join('/');
          const sourcePath = `/${sourceLocale}/${remainder}`;
          const result = switchLocaleInPath(sourcePath, targetLocale);

          // The result must start with the target locale prefix
          const startsWithTarget = result.startsWith(`/${targetLocale}/`);

          // The remainder after the locale prefix must be preserved
          const resultRemainder = result.slice(`/${targetLocale}/`.length);
          const remainderPreserved = resultRemainder === remainder;

          return startsWithTarget && remainderPreserved;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should only replace the locale prefix, not path segments that happen to contain a locale code', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Locale>('en', 'es'),
        fc.constantFrom<Locale>('en', 'es'),
        (sourceLocale, targetLocale) => {
          // A path where a segment contains the source locale string
          const pathWithLocaleInSegment = `/${sourceLocale}/products/${sourceLocale}-category/item`;
          const result = switchLocaleInPath(pathWithLocaleInSegment, targetLocale);

          // Only the first segment should change
          const expected = `/${targetLocale}/products/${sourceLocale}-category/item`;
          return result === expected;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return same locale path unchanged when switching to the same locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Locale>('en', 'es'),
        fc.array(pathSegmentArb, { minLength: 1, maxLength: 5 }),
        (locale, segments) => {
          const path = `/${locale}/${segments.join('/')}`;
          const result = switchLocaleInPath(path, locale);
          return result === path;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should produce a path whose locale equals targetLocale after switching', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Locale>('en', 'es'),
        fc.constantFrom<Locale>('en', 'es'),
        fc.array(pathSegmentArb, { minLength: 1, maxLength: 5 }),
        (sourceLocale, targetLocale, segments) => {
          const sourcePath = `/${sourceLocale}/${segments.join('/')}`;
          const result = switchLocaleInPath(sourcePath, targetLocale);
          return getLocaleFromPath(result) === targetLocale;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Concrete example tests
  it('should switch /en/products to /es/products', () => {
    expect(switchLocaleInPath('/en/products', 'es')).toBe('/es/products');
  });

  it('should switch /es/products/milling/carbide-mill to /en/products/milling/carbide-mill', () => {
    expect(
      switchLocaleInPath('/es/products/milling/carbide-mill', 'en'),
    ).toBe('/en/products/milling/carbide-mill');
  });

  it('should keep /en/about unchanged when targeting en', () => {
    expect(switchLocaleInPath('/en/about', 'en')).toBe('/en/about');
  });
});
