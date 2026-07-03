'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { switchLocaleInPath } from '@/lib/locale';
import type { Locale } from '@/lib/locale';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();

  const enHref = switchLocaleInPath(pathname, 'en');
  const esHref = switchLocaleInPath(pathname, 'es');

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <Link
        href={enHref}
        className={`px-2 py-1 rounded transition-colors ${
          currentLocale === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-current={currentLocale === 'en' ? 'true' : undefined}
      >
        EN
      </Link>
      <span className="text-gray-300">|</span>
      <Link
        href={esHref}
        className={`px-2 py-1 rounded transition-colors ${
          currentLocale === 'es'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-current={currentLocale === 'es' ? 'true' : undefined}
      >
        ES
      </Link>
    </div>
  );
}
