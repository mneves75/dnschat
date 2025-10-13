import { useMemo } from 'react';

import { useMemo } from 'react';

import { useTranslation } from '@/i18n';

export function useResolvedLocale(): string {
  const { locale } = useTranslation();
  return useMemo(() => locale, [locale]);
}
