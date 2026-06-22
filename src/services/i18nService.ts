import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import hu from '../locales/hu';
import en from '../locales/en';
import de from '../locales/de';
import es from '../locales/es';
import it from '../locales/it';
import tr from '../locales/tr';
import zh from '../locales/zh';
import ja from '../locales/ja';
import ko from '../locales/ko';
import fr from '../locales/fr';
import pt from '../locales/pt';
import pl from '../locales/pl';
import nl from '../locales/nl';
import sv from '../locales/sv';
import ru from '../locales/ru';
import ar from '../locales/ar';
import ro from '../locales/ro';
import sk from '../locales/sk';
import cs from '../locales/cs';
import sr from '../locales/sr';
import hr from '../locales/hr';
import el from '../locales/el';
import uk from '../locales/uk';
import fi from '../locales/fi';
import no from '../locales/no';
import da from '../locales/da';
import he from '../locales/he';

const i18n = new I18n({ hu, en, de, es, it, tr, zh, ja, ko, fr, pt, pl, nl, sv, ru, ar, ro, sk, cs, sr, hr, el, uk, fi, no, da, he });

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const LANGUAGES = [
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', name: 'Srpski', flag: '🇷🇸' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export async function initI18n() {
  try {
    const saved = await AsyncStorage.getItem('language');
    if (saved) {
      i18n.locale = saved;
    } else {
      const deviceLang = Localization.getLocales()[0]?.languageCode || 'en';
      i18n.locale = LANGUAGES.find(l => l.code === deviceLang) ? deviceLang : 'hu';
    }
  } catch (_) {
    i18n.locale = 'hu';
  }
}

export async function setLanguage(code: string) {
  i18n.locale = code;
  await AsyncStorage.setItem('language', code);
}

export function t(key: string, params?: Record<string, string | number>) {
  return i18n.t(key, params);
}

export default i18n;
