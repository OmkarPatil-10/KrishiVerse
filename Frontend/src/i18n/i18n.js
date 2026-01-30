import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    "welcome": "Welcome to KrishiVerse",
                    "farmer": "Farmer",
                    "buyer": "Buyer"
                }
            },
            hi: {
                translation: {
                    "welcome": "कृषीवर्स मध्ये आपले स्वागत आहे", // Placeholder translation
                    "farmer": "शेतकरी",
                    "buyer": "खरेदीदार"
                }
            },
            mr: {
                translation: {
                    "welcome": "कृषीवर्स मध्ये आपले स्वागत आहे",
                    "farmer": "शेतकरी",
                    "buyer": "खरेदीदार"
                }
            }
        },
        lng: localStorage.getItem('language') || 'en', // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
