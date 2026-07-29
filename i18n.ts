import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './assets/locales/en.json';
import fr from './assets/locales/fr.json';
import ln from './assets/locales/ln.json';

const LANGUAGE_KEY = 'user-language';

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: (callback: (lang: string) => void) => {
        AsyncStorage.getItem(LANGUAGE_KEY).then(savedLanguage => {
            if (savedLanguage) {
                return callback(savedLanguage);
            }
            callback('fr');
        }).catch(() => {
            callback('fr');
        });
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    },
};

i18n
    .use(languageDetector as any)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
            ln: { translation: ln },
        },
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
