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
    // Persist preference in cookie — next-intl middleware reads NEXT_LOCALE on the next request
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-zinc-600">
        {t('label')}
      </span>
      <div className="glass flex rounded-xl p-1 gap-0.5">
        {locales.map(({ code, key }) => (
          <button
            key={code}
            onClick={() => switchLocale(code)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all duration-200
              ${currentLocale === code
                ? 'bg-accent text-zinc-950 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
              }
            `}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  );
}
