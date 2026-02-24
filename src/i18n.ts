import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import en from './locales/en.json';
import ar from './locales/ar.json';

// Initialize i18next
const resources = {
    en: { translation: en },
    ar: { translation: ar },
};

// We are enforcing Arabic for now per the new spec.
const currentLanguage = 'ar';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: currentLanguage,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // React already safeguards from XSS
        },
    });

// Force RTL layout
if (!I18nManager.isRTL && currentLanguage === 'ar') {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
}

export default i18n;
