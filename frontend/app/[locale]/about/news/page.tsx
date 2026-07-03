import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { buildPageTitle, buildAlternates } from '@/lib/metadata';
import { getNewsItems, type NewsItemEntry } from '@/lib/strapi';
import logger from '@/lib/logger';

interface NewsPageProps {
  params: { locale: string };
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const alternates = buildAlternates(locale, 'about/news');

  return {
    title: buildPageTitle(t('aboutNews')),
    description:
      'Stay updated with the latest news, trade show participation, and industry announcements from JIAYI Tools. ' +
      'Read about our innovations in precision carbide tooling, upcoming exhibitions, and company milestones.',
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function NewsPage({ params }: NewsPageProps) {
  const { locale } = params;
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Fetch news items from Strapi; graceful fallback if unavailable
  let newsItems: NewsItemEntry[] = [];
  let strapiAvailable = true;

  try {
    const response = await getNewsItems(locale);
    newsItems = response.data ?? [];
  } catch (err) {
    logger.warn({ err, locale }, 'Strapi not available for news page; showing empty state');
    strapiAvailable = false;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">
            About JIAYI
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">News &amp; Exhibitions</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            The latest announcements, trade show participation, and industry updates from JIAYI Tools.
          </p>
        </div>
      </section>

      {/* News Items Listing */}
      <section aria-label="news items" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {strapiAvailable && newsItems.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📰</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No News Items Yet</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                We&apos;re currently working on new announcements and trade show updates. Check back soon!
              </p>
            </div>
          )}

          {!strapiAvailable && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Temporarily Unavailable</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                We&apos;re having trouble loading news items. Please try again later or contact us directly
                for the latest updates.
              </p>
            </div>
          )}

          {strapiAvailable && newsItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((item) => {
                const { attributes } = item;
                const coverImageUrl = attributes.coverImage?.data?.attributes.url;
                const publishDate = attributes.publishDate
                  ? new Date(attributes.publishDate).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : null;

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Cover Image */}
                    {coverImageUrl ? (
                      <div className="relative w-full h-48 bg-gray-100">
                        <Image
                          src={coverImageUrl}
                          alt={attributes.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                        <span className="text-5xl">📰</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                      {publishDate && (
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                          {publishDate}
                        </p>
                      )}
                      <h2 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2">
                        {attributes.title}
                      </h2>
                      {attributes.body && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                          {/* Strip HTML tags for preview */}
                          {attributes.body.replace(/<[^>]*>/g, '').slice(0, 150)}
                          {attributes.body.length > 150 && '...'}
                        </p>
                      )}
                      {/* TODO: Link to full news article page if implementing /news/[slug] in future */}
                      <span className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        {tCommon('readMore')} →
                      </span>
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
        className="py-16 px-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white text-center"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Stay Connected</h2>
          <p className="text-blue-100 mb-8">
            Want to learn more about our upcoming trade show participation or request a private
            product demonstration? Contact our team.
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-semibold px-10 py-4 rounded-xl text-lg shadow-lg transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
