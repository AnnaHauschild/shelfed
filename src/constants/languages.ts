/** UI language options — drives TMDB content language + a few localized hints. */
import { getLocales } from 'expo-localization';

export type AppLanguage = 'en' | 'de' | 'pt' | 'fr' | 'es' | 'it';

export interface LanguageOption {
  code: AppLanguage;
  /** Native language name shown in the picker. */
  label: string;
  /** TMDB `language` tag for localized titles/overviews. */
  tmdb: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', tmdb: 'en-US', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', tmdb: 'de-DE', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', tmdb: 'pt-BR', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', tmdb: 'fr-FR', flag: '🇫🇷' },
  { code: 'es', label: 'Español', tmdb: 'es-ES', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', tmdb: 'it-IT', flag: '🇮🇹' },
];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

/** Persisted settings key for the chosen language. */
export const LANGUAGE_SETTING_KEY = 'appLanguage';

/** Maps an app language to its TMDB content-language tag. */
export function tmdbTag(code: AppLanguage): string {
  return LANGUAGES.find((l) => l.code === code)?.tmdb ?? 'en-US';
}

/** True for a valid app-language code (guards persisted/legacy values). */
export function isAppLanguage(value: string | null): value is AppLanguage {
  return !!value && LANGUAGES.some((l) => l.code === value);
}

/** The device's language if the app speaks it, else English. Used until the
 *  user picks one explicitly, so a fresh install starts localized. */
export function deviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode?.toLowerCase() ?? null;
  return isAppLanguage(code) ? code : DEFAULT_LANGUAGE;
}

/**
 * Localized flowing text. Short labels (Wishlist, Discover) stay English on
 * purpose; whole sentences do not, so people who read no English never stall.
 */
export interface UiText {
  moodsDescription: string;
  removeHint: string;
  /** Shown under "Privacy" in the About sheet. Must match legal/privacy.html. */
  privacyNote: string;
}

export const UI_TEXT: Record<AppLanguage, UiText> = {
  en: {
    moodsDescription:
      'Organize your shelf your way. Group titles into personal collections like Comfort, Guilty Pleasure or Childhood.',
    removeHint: 'Tap a lit icon again to remove it from that list.',
    privacyNote:
      'Your shelves, moods and notes live on your device. If you create an account, your email, your name, your photo and your shelves are also stored on our server so you can restore them and share them with people you approve. Posts are deleted after 24 hours. Without an account nothing leaves your device.',
  },
  de: {
    moodsDescription:
      'Ordne dein Regal nach deinem Geschmack. Fasse Titel in persönlichen Sammlungen wie Comfort, Guilty Pleasure oder Kindheit zusammen.',
    removeHint:
      'Tippe erneut auf ein leuchtendes Symbol, um es aus der Liste zu entfernen.',
    privacyNote:
      'Deine Regale, Stimmungen und Notizen liegen auf deinem Gerät. Wenn du ein Konto anlegst, werden zusätzlich deine E-Mail-Adresse, dein Name, dein Foto und deine Regale auf unserem Server gespeichert, damit du sie wiederherstellen und mit bestätigten Personen teilen kannst. Beiträge werden nach 24 Stunden gelöscht. Ohne Konto verlässt nichts dein Gerät.',
  },
  pt: {
    moodsDescription:
      'Organize sua estante do seu jeito. Agrupe títulos em coleções pessoais como Comfort, Guilty Pleasure ou Infância.',
    removeHint: 'Toque novamente em um ícone aceso para removê-lo da lista.',
    privacyNote:
      'Suas estantes, moods e notas ficam no seu aparelho. Se você criar uma conta, seu e-mail, seu nome, sua foto e suas estantes também ficam guardados no nosso servidor, para que você possa restaurá-los e compartilhá-los com pessoas que você aprovar. As publicações são apagadas depois de 24 horas. Sem conta, nada sai do seu aparelho.',
  },
  fr: {
    moodsDescription:
      'Organise ton étagère à ta façon. Regroupe des titres dans des collections personnelles comme Comfort, Guilty Pleasure ou Enfance.',
    removeHint: 'Touche à nouveau une icône allumée pour la retirer de la liste.',
    privacyNote:
      'Tes étagères, tes moods et tes notes restent sur ton appareil. Si tu crées un compte, ton adresse e-mail, ton nom, ta photo et tes étagères sont aussi conservés sur notre serveur, pour que tu puisses les restaurer et les partager avec les personnes que tu acceptes. Les publications sont supprimées au bout de 24 heures. Sans compte, rien ne quitte ton appareil.',
  },
  es: {
    moodsDescription:
      'Organiza tu estantería a tu manera. Agrupa títulos en colecciones personales como Comfort, Guilty Pleasure o Infancia.',
    removeHint: 'Toca de nuevo un icono encendido para quitarlo de la lista.',
    privacyNote:
      'Tus estanterías, moods y notas están en tu dispositivo. Si creas una cuenta, tu correo, tu nombre, tu foto y tus estanterías también se guardan en nuestro servidor, para que puedas recuperarlos y compartirlos con las personas que apruebes. Las publicaciones se borran a las 24 horas. Sin cuenta, nada sale de tu dispositivo.',
  },
  it: {
    moodsDescription:
      'Organizza la tua libreria come vuoi. Raggruppa i titoli in raccolte personali come Comfort, Guilty Pleasure o Infanzia.',
    removeHint: "Tocca di nuovo un'icona accesa per rimuoverla dalla lista.",
    privacyNote:
      'Le tue librerie, i mood e le note restano sul tuo dispositivo. Se crei un account, anche la tua email, il tuo nome, la tua foto e le tue librerie vengono conservate sul nostro server, così puoi ripristinarle e condividerle con le persone che approvi. I post vengono eliminati dopo 24 ore. Senza account nulla lascia il tuo dispositivo.',
  },
};
