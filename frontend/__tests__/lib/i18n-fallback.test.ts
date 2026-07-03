/**
 * Property 17: Translation fallback returns default locale data and logs warning
 *
 * For any call to `withLocaleFallback(null, fallbackData)` where the localized
 * data is null, the function should return the fallback data unchanged and
 * trigger exactly one warning log entry. For any call where localizedData is
 * non-null, the function should return the localized data without logging.
 *
 * Validates: Requirements 6.6
 * Feature: jiayi-tools-website, Property 17: Translation fallback returns default locale data and logs warning
 */

import * as fc from 'fast-check';
import { withLocaleFallback } from '../../lib/i18n-fallback';
import logger from '../../lib/logger';

// Mock pino logger
jest.mock('../../lib/logger', () => ({
  __esModule: true,
  default: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Property 17: Translation fallback returns default locale data and logs warning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return fallback and log warning when localizedData is null', () => {
    fc.assert(
      fc.property(
        // Arbitrary fallback data (could be strings, objects, arrays)
        fc.oneof(
          fc.string(),
          fc.record({
            name: fc.string(),
            description: fc.string(),
          }),
          fc.array(fc.string()),
        ),
        (fallback) => {
          jest.clearAllMocks();
          const result = withLocaleFallback(null, fallback);
          const warnCalled = (logger.warn as jest.Mock).mock.calls.length === 1;
          return result === fallback && warnCalled;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return fallback and log warning when localizedData is undefined', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.record({
            title: fc.string(),
          }),
        ),
        (fallback) => {
          jest.clearAllMocks();
          const result = withLocaleFallback(undefined, fallback);
          const warnCalled = (logger.warn as jest.Mock).mock.calls.length === 1;
          return result === fallback && warnCalled;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return localizedData and not log when localizedData is non-null', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (localizedData, fallback) => {
          jest.clearAllMocks();
          const result = withLocaleFallback(localizedData, fallback);
          const warnNotCalled = (logger.warn as jest.Mock).mock.calls.length === 0;
          return result === localizedData && warnNotCalled;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return localized object and not log when localizedData is an object', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string(),
          slug: fc.string(),
        }),
        fc.record({
          name: fc.string(),
          slug: fc.string(),
        }),
        (localizedData, fallback) => {
          jest.clearAllMocks();
          const result = withLocaleFallback(localizedData, fallback);
          const warnNotCalled = (logger.warn as jest.Mock).mock.calls.length === 0;
          return result === localizedData && warnNotCalled;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Concrete example tests
  it('should return fallback string when null is provided', () => {
    jest.clearAllMocks();
    const fallback = 'English Product Name';
    const result = withLocaleFallback(null, fallback);
    expect(result).toBe(fallback);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('should return localized string when it is provided', () => {
    jest.clearAllMocks();
    const localized = 'Nombre del Producto en Español';
    const fallback = 'English Product Name';
    const result = withLocaleFallback(localized, fallback);
    expect(result).toBe(localized);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should return fallback object when undefined is provided', () => {
    jest.clearAllMocks();
    const fallback = { name: 'Product', description: 'Description' };
    const result = withLocaleFallback(undefined, fallback);
    expect(result).toEqual(fallback);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('should return localized object when it is provided', () => {
    jest.clearAllMocks();
    const localized = { name: 'Producto', description: 'Descripción' };
    const fallback = { name: 'Product', description: 'Description' };
    const result = withLocaleFallback(localized, fallback);
    expect(result).toEqual(localized);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should return empty string when passed as localizedData (non-null)', () => {
    jest.clearAllMocks();
    const localized = '';
    const fallback = 'Fallback';
    const result = withLocaleFallback(localized, fallback);
    expect(result).toBe(localized);
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
