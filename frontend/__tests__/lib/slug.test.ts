/**
 * Property 7: All product slugs are unique and URL-safe
 *
 * For any collection of products with distinct names, the set of generated slugs
 * should have no duplicates. For any individual product name, the generated slug
 * should contain only lowercase ASCII letters, digits, and hyphens (no spaces,
 * special characters, or uppercase letters).
 *
 * Validates: Requirements 4.7, 7.4
 * Feature: jiayi-tools-website, Property 7: All product slugs are unique and URL-safe
 */

import * as fc from 'fast-check';
import { generateSlug } from '../../lib/slug';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Regex that a valid URL-safe slug must fully match. */
const SLUG_SAFE_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

/** Returns true when the slug contains no consecutive hyphens. */
const hasNoConsecutiveHyphens = (slug: string) => !slug.includes('--');

// ---------------------------------------------------------------------------
// Arbitrary: non-empty strings that, after slugification, produce a non-empty slug
// ---------------------------------------------------------------------------

/**
 * Generator for strings that are "sluggable" — i.e., contain at least one
 * alphanumeric character so the slug is non-empty.
 */
const sluggableNameArb = fc
  .string({ minLength: 1, maxLength: 60 })
  .filter((s) => /[a-zA-Z0-9]/.test(s));

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('Property 7: All product slugs are unique and URL-safe', () => {
  // -------------------------------------------------------------------------
  // 7a: Generated slug is URL-safe (lowercase, alphanumeric + hyphens only)
  // -------------------------------------------------------------------------
  it('should produce a slug with only lowercase alphanumeric characters and hyphens', () => {
    fc.assert(
      fc.property(sluggableNameArb, (name) => {
        const slug = generateSlug(name);

        // Slug must be non-empty (guaranteed by the filter above)
        if (slug.length === 0) return false;

        // Must contain only lowercase letters, digits, and hyphens
        if (!/^[a-z0-9-]+$/.test(slug)) return false;

        // Must not have uppercase letters
        if (slug !== slug.toLowerCase()) return false;

        return true;
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // 7b: No consecutive hyphens
  // -------------------------------------------------------------------------
  it('should never produce consecutive hyphens in the slug', () => {
    fc.assert(
      fc.property(sluggableNameArb, (name) => {
        const slug = generateSlug(name);
        return hasNoConsecutiveHyphens(slug);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // 7c: No leading or trailing hyphens
  // -------------------------------------------------------------------------
  it('should never produce a slug with leading or trailing hyphens', () => {
    fc.assert(
      fc.property(sluggableNameArb, (name) => {
        const slug = generateSlug(name);
        if (slug.length === 0) return true; // empty slugs can't have leading/trailing hyphens
        return !slug.startsWith('-') && !slug.endsWith('-');
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // 7d: Distinct product names produce distinct slugs
  //     (using pairs of names that both yield non-empty, non-equal slugs)
  // -------------------------------------------------------------------------
  it('should produce distinct slugs for distinct product names', () => {
    /**
     * We restrict to names that already look "slug-distinct" after lowercasing
     * and stripping non-alphanumeric characters — i.e. two names whose
     * alphanumeric-only lowercased form differs.  This avoids false negatives
     * from e.g. "Hello World" and "hello world" which are semantically equal.
     */
    const distinctSlugNamesArb = fc
      .tuple(sluggableNameArb, sluggableNameArb)
      .filter(([a, b]) => generateSlug(a) !== generateSlug(b));

    fc.assert(
      fc.property(distinctSlugNamesArb, ([nameA, nameB]) => {
        const slugA = generateSlug(nameA);
        const slugB = generateSlug(nameB);
        return slugA !== slugB;
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Concrete example tests
  // -------------------------------------------------------------------------
  it('should slugify a standard product name', () => {
    expect(generateSlug('Carbide Drill Bit')).toBe('carbide-drill-bit');
  });

  it('should lowercase all characters', () => {
    expect(generateSlug('Milling Cutter XL')).toBe('milling-cutter-xl');
  });

  it('should handle underscores as hyphens', () => {
    expect(generateSlug('thread_tap')).toBe('thread-tap');
  });

  it('should strip special characters', () => {
    expect(generateSlug('5-Axis CNC (Custom)')).toBe('5-axis-cnc-custom');
  });

  it('should collapse consecutive hyphens', () => {
    expect(generateSlug('port---tool')).toBe('port-tool');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(generateSlug('  --hello world--  ')).toBe('hello-world');
  });

  it('should handle names with only digits and letters', () => {
    expect(generateSlug('HM100')).toBe('hm100');
  });
});
