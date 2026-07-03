import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | JIAYI Tools',
    default: 'JIAYI Tools — Precision Carbide Cutting Tools',
  },
  description:
    'JIAYI Tools manufactures precision carbide cutting tools for global industries. ' +
    'Explore our product catalog of hole making, milling, cavity tools, and more.',
};

const SUPPORTED_LOCALES = ['en', 'es'] as const;

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = params;

  // Validate locale; 404 if unsupported
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    notFound();
  }

  // Load translation messages for the current locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NavBar locale={locale} />
          <main>{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}
