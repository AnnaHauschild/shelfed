/** UI language options — drives TMDB content language + a few localized hints. */
import { getLocales } from 'expo-localization';
import { MediaType } from '@/api/types';

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
  /** Plural of each media type, article included, so it drops straight into
   *  the `{noun}` slot of the empty-state sentences below. */
  mediaPlural: Record<MediaType, string>;
  emptyShelfTitle: string;
  emptyShelfMessage: string;
  emptyFavoritesTitle: string;
  emptyFavoritesMessage: string;
  emptyWishlistTitle: string;
  emptyWishlistMessage: string;
  emptyGenreTitle: string;
  /** `{genre}` is replaced with the selected genre. */
  emptyGenreMessage: string;
  emptyMoodTitle: string;
  emptyMoodMessage: string;
  noSharedTitles: string;
  noMatches: string;
  nothingHere: string;
  loading: string;
  noDescription: string;
}

export const UI_TEXT: Record<AppLanguage, UiText> = {
  en: {
    moodsDescription:
      'Organize your shelf your way. Group titles into personal collections like Comfort, Guilty Pleasure or Childhood.',
    removeHint: 'Tap a lit icon again to remove it from that list.',
    privacyNote:
      'Your shelves, moods and notes live on your device. If you create an account, your email, your name, your photo and your shelves are also stored on our server so you can restore them and share them with people you approve. Posts are deleted after 24 hours. Without an account nothing leaves your device.',
    mediaPlural: {
      movie: 'the movies',
      tv: 'the series',
      book: 'the books',
      game: 'the games',
    },
    emptyShelfTitle: 'Your shelf is empty',
    emptyShelfMessage:
      'Swipe right on {noun} you already know. That is how your shelf for a lifetime starts to grow.',
    emptyFavoritesTitle: 'No favorites yet',
    emptyFavoritesMessage:
      'Tap the heart on a card to mark {noun} you love most.',
    emptyWishlistTitle: 'Nothing saved yet',
    emptyWishlistMessage:
      'Tap the star on a card to keep {noun} you want for later.',
    emptyGenreTitle: 'Nothing in this category',
    emptyGenreMessage: 'No {genre} titles on this shelf yet.',
    emptyMoodTitle: 'This mood is empty',
    emptyMoodMessage: 'Tap the + button to add titles from your shelf.',
    noSharedTitles: 'No shared titles on this list yet.',
    noMatches: 'No matches.',
    nothingHere: 'Nothing here.',
    loading: 'Loading…',
    noDescription: 'No description available for this title.',
  },
  de: {
    moodsDescription:
      'Ordne dein Regal nach deinem Geschmack. Fasse Titel in persönlichen Sammlungen wie Comfort, Guilty Pleasure oder Kindheit zusammen.',
    removeHint:
      'Tippe erneut auf ein leuchtendes Symbol, um es aus der Liste zu entfernen.',
    privacyNote:
      'Deine Regale, Stimmungen und Notizen liegen auf deinem Gerät. Wenn du ein Konto anlegst, werden zusätzlich deine E-Mail-Adresse, dein Name, dein Foto und deine Regale auf unserem Server gespeichert, damit du sie wiederherstellen und mit bestätigten Personen teilen kannst. Beiträge werden nach 24 Stunden gelöscht. Ohne Konto verlässt nichts dein Gerät.',
    mediaPlural: {
      movie: 'die Filme',
      tv: 'die Serien',
      book: 'die Bücher',
      game: 'die Spiele',
    },
    emptyShelfTitle: 'Dein Regal ist leer',
    emptyShelfMessage:
      'Wische {noun} nach rechts, die du schon kennst. So wächst dein Regal für ein Leben lang.',
    emptyFavoritesTitle: 'Noch keine Favoriten',
    emptyFavoritesMessage:
      'Tippe auf das Herz auf einer Karte und markiere {noun}, die du am meisten liebst.',
    emptyWishlistTitle: 'Noch nichts gemerkt',
    emptyWishlistMessage:
      'Tippe auf den Stern auf einer Karte und merke dir {noun}, die du dir für später aufheben willst.',
    emptyGenreTitle: 'Nichts in dieser Kategorie',
    emptyGenreMessage: 'Noch keine Titel aus {genre} in diesem Regal.',
    emptyMoodTitle: 'Dieser Mood ist leer',
    emptyMoodMessage:
      'Tippe auf das Plus, um Titel aus deinem Regal hinzuzufügen.',
    noSharedTitles: 'Auf dieser Liste habt ihr noch keine gemeinsamen Titel.',
    noMatches: 'Keine Treffer.',
    nothingHere: 'Hier ist nichts.',
    loading: 'Wird geladen…',
    noDescription: 'Für diesen Titel gibt es keine Beschreibung.',
  },
  pt: {
    moodsDescription:
      'Organize sua estante do seu jeito. Agrupe títulos em coleções pessoais como Comfort, Guilty Pleasure ou Infância.',
    removeHint: 'Toque novamente em um ícone aceso para removê-lo da lista.',
    privacyNote:
      'Suas estantes, moods e notas ficam no seu aparelho. Se você criar uma conta, seu e-mail, seu nome, sua foto e suas estantes também ficam guardados no nosso servidor, para que você possa restaurá-los e compartilhá-los com pessoas que você aprovar. As publicações são apagadas depois de 24 horas. Sem conta, nada sai do seu aparelho.',
    mediaPlural: {
      movie: 'os filmes',
      tv: 'as séries',
      book: 'os livros',
      game: 'os jogos',
    },
    emptyShelfTitle: 'Sua estante está vazia',
    emptyShelfMessage:
      'Deslize para a direita {noun} que você já conhece. É assim que sua estante para a vida inteira começa a crescer.',
    emptyFavoritesTitle: 'Ainda sem favoritos',
    emptyFavoritesMessage:
      'Toque no coração de um cartão para marcar {noun} que você mais ama.',
    emptyWishlistTitle: 'Ainda não há nada salvo',
    emptyWishlistMessage:
      'Toque na estrela de um cartão para guardar {noun} que você quer para depois.',
    emptyGenreTitle: 'Nada nesta categoria',
    emptyGenreMessage: 'Ainda não há títulos de {genre} nesta estante.',
    emptyMoodTitle: 'Este mood está vazio',
    emptyMoodMessage:
      'Toque no botão + para adicionar títulos da sua estante.',
    noSharedTitles: 'Ainda não há títulos em comum nesta lista.',
    noMatches: 'Nenhum resultado.',
    nothingHere: 'Não há nada aqui.',
    loading: 'Carregando…',
    noDescription: 'Não há descrição para este título.',
  },
  fr: {
    moodsDescription:
      'Organise ton étagère à ta façon. Regroupe des titres dans des collections personnelles comme Comfort, Guilty Pleasure ou Enfance.',
    removeHint: 'Touche à nouveau une icône allumée pour la retirer de la liste.',
    privacyNote:
      'Tes étagères, tes moods et tes notes restent sur ton appareil. Si tu crées un compte, ton adresse e-mail, ton nom, ta photo et tes étagères sont aussi conservés sur notre serveur, pour que tu puisses les restaurer et les partager avec les personnes que tu acceptes. Les publications sont supprimées au bout de 24 heures. Sans compte, rien ne quitte ton appareil.',
    mediaPlural: {
      movie: 'les films',
      tv: 'les séries',
      book: 'les livres',
      game: 'les jeux',
    },
    emptyShelfTitle: 'Ton étagère est vide',
    emptyShelfMessage:
      'Balaie vers la droite {noun} que tu connais déjà. C’est ainsi que ton étagère de toute une vie commence.',
    emptyFavoritesTitle: 'Pas encore de favoris',
    emptyFavoritesMessage:
      'Touche le cœur sur une carte pour marquer {noun} que tu aimes le plus.',
    emptyWishlistTitle: 'Rien d’enregistré pour l’instant',
    emptyWishlistMessage:
      'Touche l’étoile sur une carte pour garder {noun} que tu veux pour plus tard.',
    emptyGenreTitle: 'Rien dans cette catégorie',
    emptyGenreMessage:
      'Aucun titre {genre} sur cette étagère pour l’instant.',
    emptyMoodTitle: 'Ce mood est vide',
    emptyMoodMessage:
      'Touche le bouton + pour ajouter des titres depuis ton étagère.',
    noSharedTitles: 'Aucun titre en commun sur cette liste pour l’instant.',
    noMatches: 'Aucun résultat.',
    nothingHere: 'Il n’y a rien ici.',
    loading: 'Chargement…',
    noDescription: 'Aucune description disponible pour ce titre.',
  },
  es: {
    moodsDescription:
      'Organiza tu estantería a tu manera. Agrupa títulos en colecciones personales como Comfort, Guilty Pleasure o Infancia.',
    removeHint: 'Toca de nuevo un icono encendido para quitarlo de la lista.',
    privacyNote:
      'Tus estanterías, moods y notas están en tu dispositivo. Si creas una cuenta, tu correo, tu nombre, tu foto y tus estanterías también se guardan en nuestro servidor, para que puedas recuperarlos y compartirlos con las personas que apruebes. Las publicaciones se borran a las 24 horas. Sin cuenta, nada sale de tu dispositivo.',
    mediaPlural: {
      movie: 'las películas',
      tv: 'las series',
      book: 'los libros',
      game: 'los juegos',
    },
    emptyShelfTitle: 'Tu estantería está vacía',
    emptyShelfMessage:
      'Desliza a la derecha {noun} que ya conoces. Así empieza a crecer tu estantería para toda la vida.',
    emptyFavoritesTitle: 'Aún no hay favoritos',
    emptyFavoritesMessage:
      'Toca el corazón de una tarjeta para marcar {noun} que más quieres.',
    emptyWishlistTitle: 'Todavía no hay nada guardado',
    emptyWishlistMessage:
      'Toca la estrella de una tarjeta para guardar {noun} que quieres para más tarde.',
    emptyGenreTitle: 'Nada en esta categoría',
    emptyGenreMessage:
      'Todavía no hay títulos de {genre} en esta estantería.',
    emptyMoodTitle: 'Este mood está vacío',
    emptyMoodMessage:
      'Toca el botón + para añadir títulos desde tu estantería.',
    noSharedTitles: 'Todavía no hay títulos en común en esta lista.',
    noMatches: 'Sin resultados.',
    nothingHere: 'Aquí no hay nada.',
    loading: 'Cargando…',
    noDescription: 'No hay descripción para este título.',
  },
  it: {
    moodsDescription:
      'Organizza la tua libreria come vuoi. Raggruppa i titoli in raccolte personali come Comfort, Guilty Pleasure o Infanzia.',
    removeHint: "Tocca di nuovo un'icona accesa per rimuoverla dalla lista.",
    privacyNote:
      'Le tue librerie, i mood e le note restano sul tuo dispositivo. Se crei un account, anche la tua email, il tuo nome, la tua foto e le tue librerie vengono conservate sul nostro server, così puoi ripristinarle e condividerle con le persone che approvi. I post vengono eliminati dopo 24 ore. Senza account nulla lascia il tuo dispositivo.',
    mediaPlural: {
      movie: 'i film',
      tv: 'le serie',
      book: 'i libri',
      game: 'i giochi',
    },
    emptyShelfTitle: 'La tua libreria è vuota',
    emptyShelfMessage:
      'Scorri verso destra {noun} che conosci già. Così nasce la tua libreria di una vita.',
    emptyFavoritesTitle: 'Ancora nessun preferito',
    emptyFavoritesMessage:
      'Tocca il cuore su una scheda per segnare {noun} che ami di più.',
    emptyWishlistTitle: 'Non hai ancora salvato nulla',
    emptyWishlistMessage:
      'Tocca la stella su una scheda per mettere da parte {noun} che vuoi per dopo.',
    emptyGenreTitle: 'Niente in questa categoria',
    emptyGenreMessage:
      'Ancora nessun titolo {genre} in questa libreria.',
    emptyMoodTitle: 'Questo mood è vuoto',
    emptyMoodMessage:
      'Tocca il pulsante + per aggiungere titoli dalla tua libreria.',
    noSharedTitles: 'Ancora nessun titolo in comune in questa lista.',
    noMatches: 'Nessun risultato.',
    nothingHere: 'Qui non c’è niente.',
    loading: 'Caricamento…',
    noDescription: 'Nessuna descrizione disponibile per questo titolo.',
  },
};
