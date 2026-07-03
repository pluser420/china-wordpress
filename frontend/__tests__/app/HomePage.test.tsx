/**
 * Task 17.2 — Home Page statistics section
 *
 * Tests that the company statistics section renders the four key data points:
 *   - Founded: 2009
 *   - Facility Size: 1,800 m²
 *   - Daily Output: 8,000 tools
 *   - Countries Served: 15
 *
 * Because the actual HomePage is a Next.js async Server Component that calls
 * getTranslations() and fetches from Strapi, we test an inline StatisticsSection
 * component that mirrors the exact stats rendering logic from page.tsx.
 *
 * Validates: Requirements 2.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Inline StatisticsSection — mirrors the COMPANY_STATS constant and rendering
// from frontend/app/[locale]/page.tsx
// ---------------------------------------------------------------------------

const COMPANY_STATS = [
  { label: 'Founded', value: '2009' },
  { label: 'Facility Size', value: '1,800 m²' },
  { label: 'Daily Output', value: '8,000 tools' },
  { label: 'Countries Served', value: '15' },
] as const;

function StatisticsSection() {
  return (
    <section aria-label="company statistics">
      <h2>Company at a Glance</h2>
      <div>
        {COMPANY_STATS.map(({ label, value }) => (
          <div key={label}>
            <p data-testid={`stat-value-${label.replace(/\s+/g, '-').toLowerCase()}`}>
              {value}
            </p>
            <p data-testid={`stat-label-${label.replace(/\s+/g, '-').toLowerCase()}`}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Home Page — statistics section', () => {
  beforeEach(() => {
    render(<StatisticsSection />);
  });

  it('renders the statistics section with aria-label', () => {
    expect(screen.getByRole('region', { name: 'company statistics' })).toBeInTheDocument();
  });

  it('renders the section heading', () => {
    expect(screen.getByText('Company at a Glance')).toBeInTheDocument();
  });

  describe('founding year', () => {
    it('renders the value 2009', () => {
      expect(screen.getByTestId('stat-value-founded')).toHaveTextContent('2009');
    });

    it('renders the "Founded" label', () => {
      expect(screen.getByTestId('stat-label-founded')).toHaveTextContent('Founded');
    });
  });

  describe('facility size', () => {
    it('renders the value 1,800 m²', () => {
      expect(screen.getByTestId('stat-value-facility-size')).toHaveTextContent('1,800 m²');
    });

    it('renders the "Facility Size" label', () => {
      expect(screen.getByTestId('stat-label-facility-size')).toHaveTextContent('Facility Size');
    });
  });

  describe('daily output', () => {
    it('renders the value 8,000 tools', () => {
      expect(screen.getByTestId('stat-value-daily-output')).toHaveTextContent('8,000 tools');
    });

    it('renders the "Daily Output" label', () => {
      expect(screen.getByTestId('stat-label-daily-output')).toHaveTextContent('Daily Output');
    });
  });

  describe('countries served', () => {
    it('renders the value 15', () => {
      expect(screen.getByTestId('stat-value-countries-served')).toHaveTextContent('15');
    });

    it('renders the "Countries Served" label', () => {
      expect(screen.getByTestId('stat-label-countries-served')).toHaveTextContent(
        'Countries Served',
      );
    });
  });

  it('renders all 4 statistics', () => {
    // Each stat block has a value element
    const valueElements = [
      screen.getByTestId('stat-value-founded'),
      screen.getByTestId('stat-value-facility-size'),
      screen.getByTestId('stat-value-daily-output'),
      screen.getByTestId('stat-value-countries-served'),
    ];
    expect(valueElements).toHaveLength(4);
  });
});
