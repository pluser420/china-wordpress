import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { getLocaleFromPath } from '@/lib/locale';

interface FooterProps {
  locale?: string;
}

export default async function Footer({ locale: localeProp }: FooterProps = {}) {
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
  const tFooter = await getTranslations({ locale, namespace: 'footer' });
  const tCat = await getTranslations({ locale, namespace: 'categories' });
  const tInd = await getTranslations({ locale, namespace: 'industries' });

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: Company Info */}
          <div className="lg:col-span-1">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-1 text-xl font-bold mb-4 hover:text-white transition-colors"
            >
              <span className="text-blue-400">JIAYI</span>
              <span className="text-white">Tools</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Precision carbide cutting tools manufacturer serving global industries since 2009.
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-200">{tFooter('companyInfo')}</p>
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">{tFooter('address')}:</span>{' '}
                Shenzhen, Guangdong, China
              </p>
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">{tFooter('phone')}:</span>{' '}
                <a href="tel:+86755XXXXXXXX" className="hover:text-blue-400 transition-colors">
                  +86 755 XXXX XXXX
                </a>
              </p>
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">{tFooter('email')}:</span>{' '}
                <a href="mailto:info@jiayitools.com" className="hover:text-blue-400 transition-colors">
                  info@jiayitools.com
                </a>
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {tFooter('quickLinks')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tNav('home')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about/company-profile`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tNav('aboutCompanyProfile')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about/rd-manufacturing`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tNav('aboutRdManufacturing')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about/news`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tNav('aboutNews')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tNav('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Product Categories */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {tNav('products')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/products/hole-making`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tCat('holeMaking')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products/milling`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tCat('milling')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products/cavity-tools`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tCat('cavityTools')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products/port-tools`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tCat('portTools')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products/composite-material-machining`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tCat('compositeMaterialMachining')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products/threading-tools`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tCat('threadingTools')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products/gear-tools`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tCat('gearTools')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Industries + Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {tNav('industries')}
            </h3>
            <ul className="space-y-2 text-sm mb-6">
              <li>
                <Link href={`/${locale}/industries/aerospace`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tInd('aerospace')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/industries/automotive`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tInd('automotive')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/industries/medical`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tInd('medical')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/industries/power`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tInd('power')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/industries/electronics`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tInd('electronics')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/industries/shipbuilding`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tInd('shipbuilding')}
                </Link>
              </li>
            </ul>

            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              {tNav('services')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/services/catalogs`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tNav('servicesCatalogs')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services/technology`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tNav('servicesTechnology')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services/cooperate`} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {tNav('servicesCooperate')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {tFooter('copyright').replace('2024', String(currentYear))}
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href={`/${locale}/about/company-profile`} className="hover:text-gray-300 transition-colors">
              {tNav('about')}
            </Link>
            <span>·</span>
            <Link href={`/${locale}/contact`} className="hover:text-gray-300 transition-colors">
              {tNav('contact')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
