import { useTranslation } from '@/i18n';

export function useResolvedLocale(): string {
  const { locale } = useTranslation();
  return locale;
}
