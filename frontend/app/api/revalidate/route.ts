import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import logger from '../../../lib/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrapiWebhookEntry {
  id: number;
  slug?: string;
  category?: {
    slug?: string;
  };
  [key: string]: unknown;
}

interface StrapiWebhookPayload {
  event: string;
  model: string;
  entry: StrapiWebhookEntry;
}

// ---------------------------------------------------------------------------
// POST /api/revalidate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // -------------------------------------------------------------------------
  // 1. Validate secret
  // -------------------------------------------------------------------------
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    logger.warn({ secret: secret ? '[redacted]' : null }, 'Revalidate: bad secret');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // -------------------------------------------------------------------------
  // 2. Parse and handle payload
  // -------------------------------------------------------------------------
  let body: StrapiWebhookPayload;
  try {
    body = (await request.json()) as StrapiWebhookPayload;
  } catch (err) {
    logger.error({ err }, 'Revalidate: failed to parse JSON body');
    return new NextResponse('Bad Request', { status: 400 });
  }

  const { event, model, entry } = body;

  const HANDLED_EVENTS = [
    'entry.publish',
    'entry.unpublish',
    'entry.update',
    'entry.delete',
  ];

  if (!HANDLED_EVENTS.includes(event)) {
    // Unrecognised event — acknowledge without action
    logger.info({ event, model }, 'Revalidate: unhandled event (no-op)');
    return NextResponse.json({ revalidated: false, event }, { status: 200 });
  }

  try {
    logger.info({ event, model, slug: entry?.slug }, 'Revalidate: processing webhook');

    switch (model) {
      case 'product': {
        const slug = entry?.slug ?? '';
        const catSlug = entry?.category?.slug ?? '';
        revalidateTag('products');
        if (catSlug) revalidateTag(`products-${catSlug}`);
        if (slug) {
          revalidateTag(`products-${slug}`);
          revalidateTag(`product-${slug}`);
        }
        break;
      }

      case 'category': {
        const slug = entry?.slug ?? '';
        revalidateTag('categories');
        if (slug) revalidateTag(`products-${slug}`);
        break;
      }

      case 'industry-page': {
        const slug = entry?.slug ?? '';
        revalidateTag('industries');
        if (slug) revalidateTag(`industry-${slug}`);
        break;
      }

      case 'news-item': {
        revalidateTag('news');
        break;
      }

      case 'catalog': {
        revalidateTag('catalogs');
        break;
      }

      default: {
        logger.warn({ model }, 'Revalidate: unknown model');
        break;
      }
    }

    // Always refresh the sitemap after any content change
    revalidatePath('/sitemap.xml');

    logger.info({ event, model }, 'Revalidate: success');
    return NextResponse.json({ revalidated: true, event, model }, { status: 200 });
  } catch (err) {
    logger.error({ err, event, model }, 'Revalidate: unexpected error');
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
