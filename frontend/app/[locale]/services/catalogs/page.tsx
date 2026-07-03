import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { buildPageTitle, buildAlternates } from '@/lib/metadata';
import { getCatalogs, type CatalogItem } from '@/lib/strapi';
import logger from '@/lib/logger';

interface CatalogsPageProps {
  params: { locale: string };
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: CatalogsPageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const alternates = buildAlternates(locale, 'services/catalogs');

  return {
    title: buildPageTitle(t('servicesCatalogs')),
    description:
      'Download JIAYI Tools product catalogs in PDF format. Browse our comprehensive range of carbide ' +
      'cutting tools including hole making, milling, cavity tools, port tools, threading tools, and gear tools.',
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function CatalogsPage({ params }: CatalogsPageProps) {
  const { locale } = params;
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Fetch catalogs from Strapi; graceful fallback if unavailable
  let catalogs: CatalogItem[] = [];
  let strapiAvailable = true;

  try {
    const response = await getCatalogs(locale);
    catalogs = response.data ?? [];
  } catch (err) {
    logger.warn({ err, locale }, 'Strapi not available for catalogs page; showing empty state');
    strapiAvailable = false;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">Services</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Product Catalogs</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Download comprehensive product catalogs to review our full range of precision carbide
            cutting tools, technical specifications, and ordering information.
          </p>
        </div>
      </section>

      {/* Catalogs Listing */}
      <section aria-label="product catalogs" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {strapiAvailable && catalogs.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Catalogs Available</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                We&apos;re currently preparing our product catalogs for download. Check back soon or
                contact us directly for product information.
              </p>
            </div>
          )}

          {!strapiAvailable && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Temporarily Unavailable</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                We&apos;re having trouble loading catalog data. Please try again later or contact us
                directly to request product catalogs.
              </p>
            </div>
          )}

          {strapiAvailable && catalogs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogs.map((catalog) => {
                const { attributes } = catalog;
                const coverThumbnailUrl = attributes.coverThumbnail?.data?.attributes.url;
                const pdfFileUrl = attributes.pdfFile?.data?.attributes.url;

                return (
                  <article
                    key={catalog.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Cover Thumbnail */}
                    {coverThumbnailUrl ? (
                      <div className="relative w-full h-64 bg-gray-100">
                        <Image
                          src={coverThumbnailUrl}
                          alt={attributes.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                        <span className="text-5xl">📄</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2">
                        {attributes.name}
                      </h2>
                      {attributes.description && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-5 flex-1">
                          {attributes.description}
                        </p>
                      )}

                      {/* Download Button */}
                      {pdfFileUrl ? (
                        <a
                          href={pdfFileUrl}
                          download
                          className="block text-center bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                          Download PDF
                        </a>
                      ) : (
                        <button
                          disabled
                          className="block text-center bg-gray-200 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
                        >
                          PDF Unavailable
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        aria-label="contact CTA"
        className="py-16 px-4 bg-white text-center border-t border-gray-100"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Custom Product Information?</h2>
          <p className="text-gray-500 mb-8">
            Contact our technical sales team for custom product sheets, CAD models, or application-specific
            recommendations.
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-10 py-4 rounded-xl text-lg shadow transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
