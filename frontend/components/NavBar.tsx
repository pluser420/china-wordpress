import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';
import { getLocaleFromPath } from '@/lib/locale';

// Product categories with their URL slugs
const PRODUCT_CATEGORIES = [
  { key: 'holeMaking', slug: 'hole-making' },
  { key: 'milling', slug: 'milling' },
  { key: 'cavityTools', slug: 'cavity-tools' },
  { key: 'portTools', slug: 'port-tools' },
  { key: 'compositeMaterialMachining', slug: 'composite-material-machining' },
  { key: 'threadingTools', slug: 'threading-tools' },
  { key: 'gearTools', slug: 'gear-tools' },
] as const;

// Industry application slugs
const INDUSTRY_SLUGS = [
  { key: 'aerospace', slug: 'aerospace' },
  { key: 'automotive', slug: 'automotive' },
  { key: 'medical', slug: 'medical' },
  { key: 'power', slug: 'power' },
  { key: 'electronics', slug: 'electronics' },
  { key: 'hydraulics', slug: 'hydraulics' },
  { key: 'shipbuilding', slug: 'shipbuilding' },
  { key: 'railTransit', slug: 'rail-transit' },
] as const;

interface NavBarProps {
  locale?: string;
}

export default async function NavBar({ locale: localeProp }: NavBarProps = {}) {
  // Use the prop if provided, otherwise fall back to reading from the request path header
  let locale: ReturnType<typeof getLocaleFromPath>;
  if (localeProp && (['en', 'es'] as string[]).includes(localeProp)) {
    locale = localeProp as ReturnType<typeof getLocaleFromPath>;
  } else {
    const headersList = headers();
    const pathname = headersList.get('x-pathname') ?? '/en';
    locale = getLocaleFromPath(pathname);
  }

  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCat = await getTranslations({ locale, namespace: 'categories' });
  const tInd = await getTranslations({ locale, namespace: 'industries' });

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors flex-shrink-0"
          >
            <span className="text-blue-600">JIAYI</span>
            <span>Tools</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {/* Home */}
            <li>
              <Link
                href={`/${locale}`}
                className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                {tNav('home')}
              </Link>
            </li>

            {/* About JIAYI dropdown */}
            <li className="relative group">
              <button
                className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-haspopup="true"
              >
                {tNav('about')}
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <li>
                  <Link
                    href={`/${locale}/about/company-profile`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {tNav('aboutCompanyProfile')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/about/rd-manufacturing`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {tNav('aboutRdManufacturing')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/about/news`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {tNav('aboutNews')}
                  </Link>
                </li>
              </ul>
            </li>

            {/* Products dropdown */}
            <li className="relative group">
              <button
                className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-haspopup="true"
              >
                {tNav('products')}
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                {PRODUCT_CATEGORIES.map(({ key, slug }) => (
                  <li key={slug}>
                    <Link
                      href={`/${locale}/products/${slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {tCat(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Industry Applications dropdown */}
            <li className="relative group">
              <button
                className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-haspopup="true"
              >
                {tNav('industries')}
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                {INDUSTRY_SLUGS.map(({ key, slug }) => (
                  <li key={slug}>
                    <Link
                      href={`/${locale}/industries/${slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {tInd(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Services dropdown */}
            <li className="relative group">
              <button
                className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-haspopup="true"
              >
                {tNav('services')}
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <li>
                  <Link
                    href={`/${locale}/services/career`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {tNav('servicesCareer')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/services/cooperate`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {tNav('servicesCooperate')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/services/events`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {tNav('servicesEvents')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/services/technology`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {tNav('servicesTechnology')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/services/catalogs`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {tNav('servicesCatalogs')}
                  </Link>
                </li>
              </ul>
            </li>

            {/* Contact US */}
            <li>
              <Link
                href={`/${locale}/contact`}
                className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                {tNav('contact')}
              </Link>
            </li>
          </ul>

          {/* Right side: Language Switcher + Mobile menu toggle */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            {/* Mobile menu is rendered as a client component */}
            <MobileMenu
              locale={locale}
              labels={{
                home: tNav('home'),
                about: tNav('about'),
                aboutCompanyProfile: tNav('aboutCompanyProfile'),
                aboutRdManufacturing: tNav('aboutRdManufacturing'),
                aboutNews: tNav('aboutNews'),
                products: tNav('products'),
                industries: tNav('industries'),
                services: tNav('services'),
                servicesCareer: tNav('servicesCareer'),
                servicesCooperate: tNav('servicesCooperate'),
                servicesEvents: tNav('servicesEvents'),
                servicesTechnology: tNav('servicesTechnology'),
                servicesCatalogs: tNav('servicesCatalogs'),
                contact: tNav('contact'),
              }}
              categoryLabels={Object.fromEntries(
                PRODUCT_CATEGORIES.map(({ key, slug }) => [slug, tCat(key)])
              )}
              industryLabels={Object.fromEntries(
                INDUSTRY_SLUGS.map(({ key, slug }) => [slug, tInd(key)])
              )}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
