import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  en: { common: { hello: 'Hello' } },
  pt: { common: { hello: 'Olá' } },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: Localization.locale.split('-')[0],
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  resources,
  interpolation: { escapeValue: false },
});

export default i18n;
