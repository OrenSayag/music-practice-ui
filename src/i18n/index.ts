import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';

const STORAGE_KEY = 'music-practice-language';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: localStorage.getItem(STORAGE_KEY) || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
