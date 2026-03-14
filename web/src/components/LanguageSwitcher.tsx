'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const locales = [
  { code: 'en', key: 'en' },
  { code: 'ar', key: 'ar' },
  { code: 'fr', key: 'fr' },
] as const;

type LocaleCode = (typeof locales)[number]['code'];

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const t = useTranslations('language');
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: LocaleCode) {
    // Persist preference in a cookie so next-intl middleware remembers it
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Replace the locale segment in the current path
    // pathname looks like /en/dashboard → replace /en with /ar
    const segments = pathname.split('/');
    segments[1] = newLocale; // index 1 is the locale segment
    router.push(segments.join('/'));
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">{t('label')}:</span>
      <div className="flex gap-1">
        {locales.map(({ code, key }) => (
          <button
            key={code}
            onClick={() => switchLocale(code)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              currentLocale === code
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  );
}
