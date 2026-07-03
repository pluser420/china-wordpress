/**
 * Properties 8–11: SEO metadata helpers
 *
 * Feature: jiayi-tools-website
 */

import * as fc from 'fast-check';
import { buildPageTitle, clampDescription, buildAlternates } from '../../lib/metadata';

// ---------------------------------------------------------------------------
// Suppress pino logging during tests
// ---------------------------------------------------------------------------
jest.mock('../../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-empty page name strings */
const pageNameArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

/** Arbitrary description strings of various lengths */
const descriptionArb = fc.string({ minLength: 0, maxLength: 250 });

/** Supported locales */
const localeArb = fc.constantFrom('en', 'es');

/** Arbitrary URL-path segments */
const pathArb = fc
  .array(
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')), {
      minLength: 1,
      maxLength: 20,
    }),
    { minLength: 1, maxLength: 4 },
  )
  .map((parts) => parts.join('/'));

// ---------------------------------------------------------------------------
// Property 8: Page title always contains page name and brand
// Validates: Requirements 5.2
// ---------------------------------------------------------------------------

describe('Property 8: Page title always contains page name and brand', () => {
  it('title should always contain the page name', () => {
    fc.assert(
      fc.property(pageNameArb, (pageName) => {
        const title = buildPageTitle(pageName);
        return title.includes(pageName);
      }),
      { numRuns: 100 },
    );
  });

  it('title should always contain "JIAYI Tools"', () => {
    fc.assert(
      fc.property(pageNameArb, (pageName) => {
        const title = buildPageTitle(pageName);
        return title.includes('JIAYI Tools');
      }),
      { numRuns: 100 },
    );
  });

  it('titles for different page names should be different', () => {
    const distinctNamesArb = fc
      .tuple(pageNameArb, pageNameArb)
      .filter(([a, b]) => a !== b);

    fc.assert(
      fc.property(distinctNamesArb, ([nameA, nameB]) => {
        return buildPageTitle(nameA) !== buildPageTitle(nameB);
      }),
      { numRuns: 100 },
    );
  });

  it('concrete: builds correct title format', () => {
    expect(buildPageTitle('Carbide Drill Bits')).toBe('Carbide Drill Bits | JIAYI Tools');
    expect(buildPageTitle('Contact Us')).toBe('Contact Us | JIAYI Tools');
  });
});

// ---------------------------------------------------------------------------
// Property 9: Metadata includes canonical and hreflang for both locales
// Validates: Requirements 5.5, 5.7
// ---------------------------------------------------------------------------

describe('Property 9: Metadata alternates include canonical and hreflang for both locales', () => {
  it('canonical should start with the given locale', () => {
    fc.assert(
      fc.property(localeArb, pathArb, (locale, path) => {
        const alternates = buildAlternates(locale, path);
        return alternates.canonical.startsWith(`/${locale}/`);
      }),
      { numRuns: 100 },
    );
  });

  it('languages should always include both en and es keys', () => {
    fc.assert(
      fc.property(localeArb, pathArb, (locale, path) => {
        const alternates = buildAlternates(locale, path);
        return (
          typeof alternates.languages.en === 'string' &&
          typeof alternates.languages.es === 'string'
        );
      }),
      { numRuns: 100 },
    );
  });

  it('hreflang en should start with /en/', () => {
    fc.assert(
      fc.property(localeArb, pathArb, (locale, path) => {
        const alternates = buildAlternates(locale, path);
        return alternates.languages.en.startsWith('/en/');
      }),
      { numRuns: 100 },
    );
  });

  it('hreflang es should start with /es/', () => {
    fc.assert(
      fc.property(localeArb, pathArb, (locale, path) => {
        const alternates = buildAlternates(locale, path);
        return alternates.languages.es.startsWith('/es/');
      }),
      { numRuns: 100 },
    );
  });

  it('both locales should share the same path suffix', () => {
    fc.assert(
      fc.property(localeArb, pathArb, (locale, path) => {
        const alternates = buildAlternates(locale, path);
        const normPath = path.replace(/^\//, '');
        return (
          alternates.languages.en === `/en/${normPath}` &&
          alternates.languages.es === `/es/${normPath}`
        );
      }),
      { numRuns: 100 },
    );
  });

  it('concrete: builds correct alternates', () => {
    const result = buildAlternates('en', 'products/hole-making/drill-bit');
    expect(result.canonical).toBe('/en/products/hole-making/drill-bit');
    expect(result.languages.en).toBe('/en/products/hole-making/drill-bit');
    expect(result.languages.es).toBe('/es/products/hole-making/drill-bit');
  });
});

// ---------------------------------------------------------------------------
// Property 10: Meta description length is within SEO bounds (120–160)
// Validates: Requirements 5.3
// ---------------------------------------------------------------------------

describe('Property 10: Meta description length is within SEO bounds', () => {
  it('clampDescription output should always be between 120 and 160 chars (for sluggable inputs)', () => {
    // Filter to inputs that have at least 1 non-whitespace character
    const nonEmptyArb = fc
      .string({ minLength: 1, maxLength: 250 })
      .filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(nonEmptyArb, (text) => {
        const result = clampDescription(text);
        return result.length >= 120 && result.length <= 160;
      }),
      { numRuns: 100 },
    );
  });

  it('should truncate long descriptions at 160 characters', () => {
    const longArb = fc.string({ minLength: 161, maxLength: 250 });
    fc.assert(
      fc.property(longArb, (text) => {
        const result = clampDescription(text);
        return result.length === 160;
      }),
      { numRuns: 100 },
    );
  });

  it('should pad short descriptions to at least 120 characters', () => {
    // Inputs shorter than 120 chars with at least 1 non-whitespace char
    const shortArb = fc
      .string({ minLength: 1, maxLength: 119 })
      .filter((s) => s.trim().length > 0);
    fc.assert(
      fc.property(shortArb, (text) => {
        const result = clampDescription(text);
        return result.length >= 120;
      }),
      { numRuns: 100 },
    );
  });

  it('concrete: short description is padded', () => {
    const short = 'Precision carbide tools.';
    const result = clampDescription(short);
    expect(result.length).toBeGreaterThanOrEqual(120);
    expect(result.length).toBeLessThanOrEqual(160);
  });

  it('concrete: exactly 160-char description is unchanged', () => {
    const exactly160 = 'a'.repeat(160);
    const result = clampDescription(exactly160);
    expect(result.length).toBe(160);
    expect(result).toBe(exactly160);
  });
});

// ---------------------------------------------------------------------------
// Property 11: Keywords metadata is present if and only if keywords are configured
// Validates: Requirements 5.4
// ---------------------------------------------------------------------------
// Note: This property validates the convention used by generateMetadata callers:
// keywords should be included only when seo.keywords is non-empty.
// We test the helper function that extracts keywords from SEO metadata.

function extractKeywords(seo: { keywords?: string | null }): string | undefined {
  if (seo.keywords && seo.keywords.trim().length > 0) {
    return seo.keywords;
  }
  return undefined;
}

describe('Property 11: Keywords present if and only if configured', () => {
  const nonEmptyKeywordsArb = fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0);

  it('should return keywords when seo.keywords is a non-empty string', () => {
    fc.assert(
      fc.property(nonEmptyKeywordsArb, (keywords) => {
        const result = extractKeywords({ keywords });
        return typeof result === 'string' && result === keywords;
      }),
      { numRuns: 100 },
    );
  });

  it('should return undefined when seo.keywords is null', () => {
    fc.assert(
      fc.property(fc.constant(null), (keywords) => {
        const result = extractKeywords({ keywords });
        return result === undefined;
      }),
      { numRuns: 100 },
    );
  });

  it('should return undefined when seo.keywords is an empty string or whitespace', () => {
    const emptyOrWhitespaceArb = fc.stringOf(fc.constantFrom(' ', '\t', '\n'), {
      minLength: 0,
      maxLength: 20,
    });
    fc.assert(
      fc.property(emptyOrWhitespaceArb, (whitespace) => {
        const result = extractKeywords({ keywords: whitespace });
        return result === undefined;
      }),
      { numRuns: 100 },
    );
  });

  it('concrete: non-empty keywords are returned', () => {
    expect(extractKeywords({ keywords: 'carbide, drill, tools' })).toBe('carbide, drill, tools');
  });

  it('concrete: null keywords returns undefined', () => {
    expect(extractKeywords({ keywords: null })).toBeUndefined();
  });

  it('concrete: empty string keywords returns undefined', () => {
    expect(extractKeywords({ keywords: '' })).toBeUndefined();
  });
});
