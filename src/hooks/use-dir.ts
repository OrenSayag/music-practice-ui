import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RTL_LANGUAGES = new Set(['he', 'ar']);

export function useDir() {
  const { i18n } = useTranslation();
  const dir = RTL_LANGUAGES.has(i18n.language) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [dir, i18n.language]);

  return dir;
}
