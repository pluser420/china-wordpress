'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/locale';

interface NavLabels {
  home: string;
  about: string;
  aboutCompanyProfile: string;
  aboutRdManufacturing: string;
  aboutNews: string;
  products: string;
  industries: string;
  services: string;
  servicesCareer: string;
  servicesCooperate: string;
  servicesEvents: string;
  servicesTechnology: string;
  servicesCatalogs: string;
  contact: string;
}

interface MobileMenuProps {
  locale: Locale;
  labels: NavLabels;
  categoryLabels: Record<string, string>;
  industryLabels: Record<string, string>;
}

export default function MobileMenu({ locale, labels, categoryLabels, industryLabels }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const close = () => {
    setIsOpen(false);
    setOpenSection(null);
  };

  const productCategorySlugs = [
    'hole-making',
    'milling',
    'cavity-tools',
    'port-tools',
    'composite-material-machining',
    'threading-tools',
    'gear-tools',
  ] as const;

  const industrySlugs = [
    'aerospace',
    'automotive',
    'medical',
    'power',
    'electronics',
    'hydraulics',
    'shipbuilding',
    'rail-transit',
  ] as const;

  return (
    <div className="lg:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 max-h-[80vh] overflow-y-auto">
          <ul className="py-2">
            {/* Home */}
            <li>
              <Link
                href={`/${locale}`}
                onClick={close}
                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
              >
                {labels.home}
              </Link>
            </li>

            {/* About JIAYI */}
            <li>
              <button
                onClick={() => toggleSection('about')}
                className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                aria-expanded={openSection === 'about'}
              >
                {labels.about}
                <svg
                  className={`w-4 h-4 transition-transform ${openSection === 'about' ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === 'about' && (
                <ul className="bg-gray-50 border-l-2 border-blue-200 ml-4">
                  <li>
                    <Link
                      href={`/${locale}/about/company-profile`}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      {labels.aboutCompanyProfile}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/about/rd-manufacturing`}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      {labels.aboutRdManufacturing}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/about/news`}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      {labels.aboutNews}
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Products */}
            <li>
              <button
                onClick={() => toggleSection('products')}
                className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                aria-expanded={openSection === 'products'}
              >
                {labels.products}
                <svg
                  className={`w-4 h-4 transition-transform ${openSection === 'products' ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === 'products' && (
                <ul className="bg-gray-50 border-l-2 border-blue-200 ml-4">
                  {productCategorySlugs.map((slug) => (
                    <li key={slug}>
                      <Link
                        href={`/${locale}/products/${slug}`}
                        onClick={close}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        {categoryLabels[slug]}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Industry Applications */}
            <li>
              <button
                onClick={() => toggleSection('industries')}
                className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                aria-expanded={openSection === 'industries'}
              >
                {labels.industries}
                <svg
                  className={`w-4 h-4 transition-transform ${openSection === 'industries' ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === 'industries' && (
                <ul className="bg-gray-50 border-l-2 border-blue-200 ml-4">
                  {industrySlugs.map((slug) => (
                    <li key={slug}>
                      <Link
                        href={`/${locale}/industries/${slug}`}
                        onClick={close}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        {industryLabels[slug]}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Services */}
            <li>
              <button
                onClick={() => toggleSection('services')}
                className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                aria-expanded={openSection === 'services'}
              >
                {labels.services}
                <svg
                  className={`w-4 h-4 transition-transform ${openSection === 'services' ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === 'services' && (
                <ul className="bg-gray-50 border-l-2 border-blue-200 ml-4">
                  <li>
                    <Link
                      href={`/${locale}/services/career`}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      {labels.servicesCareer}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/services/cooperate`}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600"
                    >
                      {labels.servicesCooperate}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/services/events`}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      {labels.servicesEvents}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/services/technology`}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      {labels.servicesTechnology}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/services/catalogs`}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      {labels.servicesCatalogs}
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Contact US */}
            <li>
              <Link
                href={`/${locale}/contact`}
                onClick={close}
                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
              >
                {labels.contact}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
