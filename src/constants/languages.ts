/** UI language options — drives TMDB content language + a few localized hints. */
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

/**
 * The handful of UI strings the user asked to localize (everything else stays
 * English): the Moods explainer + the "remove from list" hint in the details
 * card. Kept deliberately tiny — full app i18n is out of scope.
 */
export interface UiText {
  moodsDescription: string;
  removeHint: string;
}

export const UI_TEXT: Record<AppLanguage, UiText> = {
  en: {
    moodsDescription:
      'Organize your shelf your way. Group titles into personal collections like Comfort, Guilty Pleasure or Childhood.',
    removeHint: 'Tap a lit icon again to remove it from that list.',
  },
  de: {
    moodsDescription:
      'Ordne dein Regal nach deinem Geschmack. Fasse Titel in persönlichen Sammlungen wie Comfort, Guilty Pleasure oder Kindheit zusammen.',
    removeHint:
      'Tippe erneut auf ein leuchtendes Symbol, um es aus der Liste zu entfernen.',
  },
  pt: {
    moodsDescription:
      'Organize sua estante do seu jeito. Agrupe títulos em coleções pessoais como Comfort, Guilty Pleasure ou Infância.',
    removeHint: 'Toque novamente em um ícone aceso para removê-lo da lista.',
  },
  fr: {
    moodsDescription:
      'Organise ton étagère à ta façon. Regroupe des titres dans des collections personnelles comme Comfort, Guilty Pleasure ou Enfance.',
    removeHint: 'Touche à nouveau une icône allumée pour la retirer de la liste.',
  },
  es: {
    moodsDescription:
      'Organiza tu estantería a tu manera. Agrupa títulos en colecciones personales como Comfort, Guilty Pleasure o Infancia.',
    removeHint: 'Toca de nuevo un icono encendido para quitarlo de la lista.',
  },
  it: {
    moodsDescription:
      'Organizza la tua libreria come vuoi. Raggruppa i titoli in raccolte personali come Comfort, Guilty Pleasure o Infanzia.',
    removeHint: "Tocca di nuovo un'icona accesa per rimuoverla dalla lista.",
  },
};
