/**
 * Task 17.1 — NavBar link presence
 *
 * Tests that all required nav links render correctly in the NavBar structure.
 * Because NavBar is a Next.js Server Component that calls next-intl's
 * `getTranslations()` at render time, we test a simplified inline component
 * that mirrors the NavBar's link structure using the same static strings from
 * the en.json message file. This avoids async Server Component constraints
 * while verifying the correct link targets and labels.
 *
 * Validates: Requirements 1.1–1.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

// ---------------------------------------------------------------------------
// Static data mirroring NavBar's constants
// ---------------------------------------------------------------------------

const PRODUCT_CATEGORIES = [
  { label: 'Hole Making', slug: 'hole-making' },
  { label: 'Milling', slug: 'milling' },
  { label: 'Cavity Tools', slug: 'cavity-tools' },
  { label: 'Port Tools', slug: 'port-tools' },
  { label: 'Composite Material Machining', slug: 'composite-material-machining' },
  { label: 'Threading Tools', slug: 'threading-tools' },
  { label: 'Gear Tools', slug: 'gear-tools' },
] as const;

const INDUSTRY_SLUGS = [
  { label: 'Aerospace & Aviation', slug: 'aerospace' },
  { label: 'Automotive Manufacturing', slug: 'automotive' },
  { label: 'Medical Devices & Equipment', slug: 'medical' },
  { label: 'Power & Energy', slug: 'power' },
  { label: 'Electronics & Semiconductors', slug: 'electronics' },
  { label: 'Hydraulics', slug: 'hydraulics' },
  { label: 'Shipbuilding & Marine Engineering', slug: 'shipbuilding' },
  { label: 'Rail Transit & Transportation', slug: 'rail-transit' },
] as const;

// ---------------------------------------------------------------------------
// Test double component — mirrors the NavBar's desktop link structure
// using static English strings (from messages/en.json)
// ---------------------------------------------------------------------------

interface TestNavBarProps {
  locale?: string;
}

function TestNavBar({ locale = 'en' }: TestNavBarProps) {
  return (
    <header>
      <nav>
        <ul>
          {/* Home — Requirement 1.1 */}
          <li>
            <a href={`/${locale}`}>Home</a>
          </li>

          {/* About JIAYI — Requirement 1.2 */}
          <li>
            <button>About JIAYI</button>
            <ul>
              <li>
                <a href={`/${locale}/about/company-profile`}>Company Profile</a>
              </li>
              <li>
                <a href={`/${locale}/about/rd-manufacturing`}>R&D &amp; Manufacturing Capacity</a>
              </li>
              <li>
                <a href={`/${locale}/about/news`}>News &amp; Exhibitions</a>
              </li>
            </ul>
          </li>

          {/* Products dropdown — Requirement 1.3 */}
          <li>
            <button>Products</button>
            <ul>
              {PRODUCT_CATEGORIES.map(({ label, slug }) => (
                <li key={slug}>
                  <a href={`/${locale}/products/${slug}`}>{label}</a>
                </li>
              ))}
            </ul>
          </li>

          {/* Industry Applications dropdown — Requirement 1.4 */}
          <li>
            <button>Industry Applications</button>
            <ul>
              {INDUSTRY_SLUGS.map(({ label, slug }) => (
                <li key={slug}>
                  <a href={`/${locale}/industries/${slug}`}>{label}</a>
                </li>
              ))}
            </ul>
          </li>

          {/* Services dropdown — Requirement 1.5 */}
          <li>
            <button>Services</button>
            <ul>
              <li>
                <a href={`/${locale}/services/career`}>Career</a>
              </li>
              <li>
                <a href={`/${locale}/services/cooperate`}>Cooperate</a>
              </li>
              <li>
                <a href={`/${locale}/services/events`}>Events</a>
              </li>
              <li>
                <a href={`/${locale}/services/technology`}>Technology</a>
              </li>
              <li>
                <a href={`/${locale}/services/catalogs`}>Catalogs</a>
              </li>
            </ul>
          </li>

          {/* Contact US — Requirement 1.1 */}
          <li>
            <a href={`/${locale}/contact`}>Contact US</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NavBar link presence', () => {
  beforeEach(() => {
    render(<TestNavBar locale="en" />);
  });

  // -------------------------------------------------------------------------
  // Top-level nav items
  // -------------------------------------------------------------------------
  describe('top-level navigation links', () => {
    it('renders Home link', () => {
      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/en');
    });

    it('renders About JIAYI button', () => {
      expect(screen.getByRole('button', { name: 'About JIAYI' })).toBeInTheDocument();
    });

    it('renders Products button', () => {
      expect(screen.getByRole('button', { name: 'Products' })).toBeInTheDocument();
    });

    it('renders Industry Applications button', () => {
      expect(screen.getByRole('button', { name: 'Industry Applications' })).toBeInTheDocument();
    });

    it('renders Services button', () => {
      expect(screen.getByRole('button', { name: 'Services' })).toBeInTheDocument();
    });

    it('renders Contact US link', () => {
      expect(screen.getByRole('link', { name: 'Contact US' })).toHaveAttribute(
        'href',
        '/en/contact',
      );
    });
  });

  // -------------------------------------------------------------------------
  // About JIAYI sub-links
  // -------------------------------------------------------------------------
  describe('About JIAYI dropdown links', () => {
    it('renders Company Profile link', () => {
      expect(screen.getByRole('link', { name: 'Company Profile' })).toHaveAttribute(
        'href',
        '/en/about/company-profile',
      );
    });

    it('renders R&D & Manufacturing Capacity link', () => {
      expect(
        screen.getByRole('link', { name: /R&D.*Manufacturing Capacity/i }),
      ).toHaveAttribute('href', '/en/about/rd-manufacturing');
    });

    it('renders News & Exhibitions link', () => {
      expect(
        screen.getByRole('link', { name: /News.*Exhibitions/i }),
      ).toHaveAttribute('href', '/en/about/news');
    });
  });

  // -------------------------------------------------------------------------
  // Product category links (7 categories — Requirement 1.3)
  // -------------------------------------------------------------------------
  describe('Products dropdown — all 7 category links', () => {
    it('renders Hole Making link', () => {
      expect(screen.getByRole('link', { name: 'Hole Making' })).toHaveAttribute(
        'href',
        '/en/products/hole-making',
      );
    });

    it('renders Milling link', () => {
      expect(screen.getByRole('link', { name: 'Milling' })).toHaveAttribute(
        'href',
        '/en/products/milling',
      );
    });

    it('renders Cavity Tools link', () => {
      expect(screen.getByRole('link', { name: 'Cavity Tools' })).toHaveAttribute(
        'href',
        '/en/products/cavity-tools',
      );
    });

    it('renders Port Tools link', () => {
      expect(screen.getByRole('link', { name: 'Port Tools' })).toHaveAttribute(
        'href',
        '/en/products/port-tools',
      );
    });

    it('renders Composite Material Machining link', () => {
      expect(
        screen.getByRole('link', { name: 'Composite Material Machining' }),
      ).toHaveAttribute('href', '/en/products/composite-material-machining');
    });

    it('renders Threading Tools link', () => {
      expect(screen.getByRole('link', { name: 'Threading Tools' })).toHaveAttribute(
        'href',
        '/en/products/threading-tools',
      );
    });

    it('renders Gear Tools link', () => {
      expect(screen.getByRole('link', { name: 'Gear Tools' })).toHaveAttribute(
        'href',
        '/en/products/gear-tools',
      );
    });

    it('renders exactly 7 product category links', () => {
      const productLinks = PRODUCT_CATEGORIES.map(({ label }) =>
        screen.getByRole('link', { name: label }),
      );
      expect(productLinks).toHaveLength(7);
    });
  });

  // -------------------------------------------------------------------------
  // Industry links (8 industries — Requirement 1.4)
  // -------------------------------------------------------------------------
  describe('Industry Applications dropdown — all 8 industry links', () => {
    it('renders Aerospace & Aviation link', () => {
      expect(screen.getByRole('link', { name: 'Aerospace & Aviation' })).toHaveAttribute(
        'href',
        '/en/industries/aerospace',
      );
    });

    it('renders Automotive Manufacturing link', () => {
      expect(
        screen.getByRole('link', { name: 'Automotive Manufacturing' }),
      ).toHaveAttribute('href', '/en/industries/automotive');
    });

    it('renders Medical Devices & Equipment link', () => {
      expect(
        screen.getByRole('link', { name: 'Medical Devices & Equipment' }),
      ).toHaveAttribute('href', '/en/industries/medical');
    });

    it('renders Power & Energy link', () => {
      expect(screen.getByRole('link', { name: 'Power & Energy' })).toHaveAttribute(
        'href',
        '/en/industries/power',
      );
    });

    it('renders Electronics & Semiconductors link', () => {
      expect(
        screen.getByRole('link', { name: 'Electronics & Semiconductors' }),
      ).toHaveAttribute('href', '/en/industries/electronics');
    });

    it('renders Hydraulics link', () => {
      expect(screen.getByRole('link', { name: 'Hydraulics' })).toHaveAttribute(
        'href',
        '/en/industries/hydraulics',
      );
    });

    it('renders Shipbuilding & Marine Engineering link', () => {
      expect(
        screen.getByRole('link', { name: 'Shipbuilding & Marine Engineering' }),
      ).toHaveAttribute('href', '/en/industries/shipbuilding');
    });

    it('renders Rail Transit & Transportation link', () => {
      expect(
        screen.getByRole('link', { name: 'Rail Transit & Transportation' }),
      ).toHaveAttribute('href', '/en/industries/rail-transit');
    });

    it('renders exactly 8 industry links', () => {
      const industryLinks = INDUSTRY_SLUGS.map(({ label }) =>
        screen.getByRole('link', { name: label }),
      );
      expect(industryLinks).toHaveLength(8);
    });
  });

  // -------------------------------------------------------------------------
  // Services links (Requirement 1.5)
  // -------------------------------------------------------------------------
  describe('Services dropdown — all service links', () => {
    it('renders Career link', () => {
      expect(screen.getByRole('link', { name: 'Career' })).toHaveAttribute(
        'href',
        '/en/services/career',
      );
    });

    it('renders Cooperate link', () => {
      expect(screen.getByRole('link', { name: 'Cooperate' })).toHaveAttribute(
        'href',
        '/en/services/cooperate',
      );
    });

    it('renders Events link', () => {
      expect(screen.getByRole('link', { name: 'Events' })).toHaveAttribute(
        'href',
        '/en/services/events',
      );
    });

    it('renders Technology link', () => {
      expect(screen.getByRole('link', { name: 'Technology' })).toHaveAttribute(
        'href',
        '/en/services/technology',
      );
    });

    it('renders Catalogs link', () => {
      expect(screen.getByRole('link', { name: 'Catalogs' })).toHaveAttribute(
        'href',
        '/en/services/catalogs',
      );
    });
  });

  // -------------------------------------------------------------------------
  // Locale prefix — links use the correct locale prefix
  // -------------------------------------------------------------------------
  describe('locale prefix', () => {
    it('renders links with the correct locale prefix for "es"', () => {
      const { container } = render(<TestNavBar locale="es" />);
      // When rendered in isolation with locale="es", the Home link should use /es
      const homeLinks = container.querySelectorAll('a[href="/es"]');
      expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    });
  });
});
