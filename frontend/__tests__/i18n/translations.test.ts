/**
 * Property 16: All UI translation keys have non-empty values in every locale
 *
 * For any translation key used in the application's UI message files, both
 * messages/en.json and messages/es.json should contain a non-empty string
 * value for that key. No key present in the English file should be absent
 * from the Spanish file.
 *
 * Validates: Requirements 6.4
 * Feature: jiayi-tools-website, Property 16: All UI translation keys have non-empty values in every locale
 */

import * as fc from 'fast-check';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';

describe('Property 16: All UI translation keys have non-empty values in every locale', () => {
  /**
   * Recursively flattens a nested translation object into a flat key-value map.
   * { nav: { home: "Home" } } → { "nav.home": "Home" }
   */
  function flattenKeys(
    obj: Record<string, any>,
    prefix = '',
  ): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, flattenKeys(value, fullKey));
      } else if (typeof value === 'string') {
        result[fullKey] = value;
      }
    }
    return result;
  }

  const enFlat = flattenKeys(enMessages);
  const esFlat = flattenKeys(esMessages);
  const allEnKeys = Object.keys(enFlat);

  it('should have all en keys present in es with non-empty values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allEnKeys),
        (key) => {
          const esValue = esFlat[key];
          return (
            esValue !== undefined &&
            typeof esValue === 'string' &&
            esValue.trim().length > 0
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should have all en keys non-empty', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allEnKeys),
        (key) => {
          const enValue = enFlat[key];
          return (
            enValue !== undefined &&
            typeof enValue === 'string' &&
            enValue.trim().length > 0
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should not have keys in es that are missing in en (keys must be symmetric)', () => {
    const allEsKeys = Object.keys(esFlat);
    const extraKeys = allEsKeys.filter((k) => !allEnKeys.includes(k));
    expect(extraKeys).toEqual([]);
  });

  it('should not have keys in en that are missing in es', () => {
    const allEsKeys = Object.keys(esFlat);
    const missingKeys = allEnKeys.filter((k) => !allEsKeys.includes(k));
    expect(missingKeys).toEqual([]);
  });

  // Concrete examples
  it('should have nav.home in both locales', () => {
    expect(enFlat['nav.home']).toBe('Home');
    expect(esFlat['nav.home']).toBe('Inicio');
  });

  it('should have form.submit in both locales', () => {
    expect(enFlat['form.submit']).toBeTruthy();
    expect(esFlat['form.submit']).toBeTruthy();
  });

  it('should have all validation keys in both locales', () => {
    const validationKeys = allEnKeys.filter((k) => k.startsWith('validation.'));
    for (const key of validationKeys) {
      expect(enFlat[key]).toBeTruthy();
      expect(esFlat[key]).toBeTruthy();
    }
  });
});
