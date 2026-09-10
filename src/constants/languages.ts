/** UI language options — drives TMDB content language + a few localized hints. */
import { getLocales } from 'expo-localization';
import { contentLanguage } from '@/api/tmdb';
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
  /** Alert buttons. Translated even though they are short: this is where a
   *  misread word costs real data. */
  cancel: string;
  delete: string;
  clear: string;
  reset: string;
  /** `{where}` in the two messages below. */
  scopeDevice: string;
  scopeDeviceAndCloud: string;
  allCategories: string;
  clearShelvesRow: string;
  clearShelvesHint: string;
  clearShelvesTitle: string;
  /** `{shelves}`, `{media}` and `{where}` are filled in. */
  clearShelvesMessage: string;
  clearSelected: string;
  resetEverything: string;
  resetAllTitle: string;
  resetAllMessage: string;
  /** `{name}` is the mood the user is about to delete. */
  deleteMoodTitle: string;
  deleteMoodMessage: string;
  deleteStoryTitle: string;
  deleteStoryMessage: string;
  signOut: string;
  deleteAccount: string;
  deleteAccountConfirm: string;
  accountIntro: string;
  sendCode: string;
  /** `{email}` is the address the code went to. */
  codeSent: string;
  verify: string;
  changeEmail: string;
  pickUsername: string;
  checking: string;
  usernameFree: string;
  usernameTaken: string;
  save: string;
  privateAccount: string;
  privateOn: string;
  privateOff: string;
  photoDenied: string;
  errSendCode: string;
  errVerifyCode: string;
  errNotSignedIn: string;
  errUsernameTaken: string;
  errSaveProfile: string;
  errDeleteAccount: string;
  errReadImage: string;
  errSavePhoto: string;
  errProcessImage: string;
  landingTagline: string;
  /** `{name}` is the display name. */
  greeting: string;
  setName: string;
  categoryBlurb: Record<MediaType, string>;
  findHeading: Record<MediaType, string>;
  searchPlaceholder: Record<MediaType, string>;
  nothingFound: string;
  couldNotLoad: string;
  somethingWrong: string;
  retry: string;
  phSearchActor: string;
  phSearchAuthor: string;
  phFindPeople: string;
  phSearchShelf: string;
  phMoodName: string;
  phMoodExample: string;
  phNote: string;
  phYourName: string;
  phSearchGifs: string;
  phType: string;
  phOptional: string;
  matchTitle: string;
  matchNice: string;
  matchYouAnd: string;
  /** Follows the friend names, so it carries its own leading space or comma. */
  matchWantToSee: string;
  matchLove: string;
  lovesThisOne: string;
  lovesThisMany: string;
  lovesThisHeading: string;
  wantsToSeeOne: string;
  wantsToSeeMany: string;
  wantsToSeeHeading: string;
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
    cancel: 'Cancel',
    delete: 'Delete',
    clear: 'Clear',
    reset: 'Reset',
    scopeDevice: 'on this device',
    scopeDeviceAndCloud: 'on this device and in the cloud',
    allCategories: 'all categories',
    clearShelvesRow: 'Clear shelves…',
    clearShelvesHint: 'Choose which shelves and categories to empty.',
    clearShelvesTitle: 'Clear shelves?',
    clearShelvesMessage: 'This empties {shelves} for {media} {where}.',
    clearSelected: 'Clear selected',
    resetEverything: 'Reset everything',
    resetAllTitle: 'Reset everything?',
    resetAllMessage:
      'This permanently deletes all shelves, moods, notes and episode progress {where}. This cannot be undone.',
    deleteMoodTitle: 'Delete “{name}”?',
    deleteMoodMessage:
      'This removes the mood only. Your titles stay on your shelf.',
    deleteStoryTitle: 'Delete this story?',
    deleteStoryMessage: 'It will be removed for everyone.',
    signOut: 'Sign out',
    deleteAccount: 'Delete account',
    deleteAccountConfirm: 'Tap again to delete for good',
    accountIntro:
      'Optional. Sign in to share lists and follow friends. Everything works without an account too.',
    sendCode: 'Send code',
    codeSent: 'We sent a 6-digit code to {email}.',
    verify: 'Verify',
    changeEmail: 'Change email',
    pickUsername: 'Pick a username so friends can find you.',
    checking: 'Checking…',
    usernameFree: '✓ Available',
    usernameTaken: '✗ Already taken',
    save: 'Save',
    privateAccount: 'Private account',
    privateOn: 'New followers need your approval.',
    privateOff: 'Anyone can follow and see your shelves.',
    photoDenied: 'Photo access was denied.',
    errSendCode: 'Could not send the code.',
    errVerifyCode: 'That code did not work.',
    errNotSignedIn: 'Not signed in.',
    errUsernameTaken: 'That username is already taken.',
    errSaveProfile: 'Could not save your profile.',
    errDeleteAccount: 'Could not delete the account.',
    errReadImage: 'Could not read that image.',
    errSavePhoto: 'Could not save the photo.',
    errProcessImage: 'Could not process the image.',
    landingTagline: 'Your lifelong collection.',
    greeting: 'Hi, {name}',
    setName: 'Tap to set your name',
    categoryBlurb: {
      movie: 'Recall the films of a lifetime',
      tv: 'Track the shows you have binged',
      book: 'Remember the books you have read',
      game: 'Log the games you have played',
    },
    findHeading: {
      movie: 'Find any movie',
      tv: 'Find any series',
      book: 'Find any book',
      game: 'Find any game',
    },
    searchPlaceholder: {
      movie: 'Find a movie by title…',
      tv: 'Find a series by title…',
      book: 'Find a book by title…',
      game: 'Find a game by title…',
    },
    nothingFound: 'Nothing found right now.',
    couldNotLoad: 'Could not load {noun}.',
    somethingWrong: 'Something went wrong.',
    retry: 'Retry',
    phSearchActor: 'Search an actor…',
    phSearchAuthor: 'Search an author…',
    phFindPeople: 'Find people by username',
    phSearchShelf: 'Search this shelf…',
    phMoodName: 'Mood name',
    phMoodExample: 'e.g. 🛋️ Comfort',
    phNote: 'Write your thoughts, favourite scenes, who you watched it with…',
    phYourName: 'Add your name',
    phSearchGifs: 'Search GIFs…',
    phType: 'Type…',
    phOptional: '(optional)',
    matchTitle: 'It’s a Match!',
    matchNice: 'Nice!',
    matchYouAnd: 'You and',
    matchWantToSee: ' both want to see',
    matchLove: ' both love',
    lovesThisOne: 'loves this',
    lovesThisMany: 'love this',
    lovesThisHeading: 'Love this',
    wantsToSeeOne: 'wants to see this',
    wantsToSeeMany: 'want to see this',
    wantsToSeeHeading: 'Want to see this',
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
    cancel: 'Abbrechen',
    delete: 'Löschen',
    clear: 'Leeren',
    reset: 'Zurücksetzen',
    scopeDevice: 'auf diesem Gerät',
    scopeDeviceAndCloud: 'auf diesem Gerät und in der Cloud',
    allCategories: 'alle Kategorien',
    clearShelvesRow: 'Regale leeren…',
    clearShelvesHint: 'Wähle aus, welche Regale und Kategorien geleert werden.',
    clearShelvesTitle: 'Regale leeren?',
    clearShelvesMessage: 'Das leert {shelves} für {media} {where}.',
    clearSelected: 'Auswahl leeren',
    resetEverything: 'Alles zurücksetzen',
    resetAllTitle: 'Alles zurücksetzen?',
    resetAllMessage:
      'Das löscht endgültig alle Regale, Moods, Notizen und den Serienfortschritt {where}. Das lässt sich nicht rückgängig machen.',
    deleteMoodTitle: '„{name}“ löschen?',
    deleteMoodMessage:
      'Das entfernt nur den Mood. Deine Titel bleiben in deinem Regal.',
    deleteStoryTitle: 'Diese Story löschen?',
    deleteStoryMessage: 'Sie verschwindet für alle.',
    signOut: 'Abmelden',
    deleteAccount: 'Konto löschen',
    deleteAccountConfirm: 'Noch einmal tippen, dann ist es endgültig',
    accountIntro:
      'Freiwillig. Melde dich an, um Listen zu teilen und Freunden zu folgen. Ohne Konto funktioniert alles genauso.',
    sendCode: 'Code senden',
    codeSent: 'Wir haben einen sechsstelligen Code an {email} geschickt.',
    verify: 'Bestätigen',
    changeEmail: 'E-Mail ändern',
    pickUsername: 'Wähle einen Benutzernamen, damit Freunde dich finden.',
    checking: 'Wird geprüft…',
    usernameFree: '✓ Frei',
    usernameTaken: '✗ Schon vergeben',
    save: 'Speichern',
    privateAccount: 'Privates Konto',
    privateOn: 'Neue Follower musst du bestätigen.',
    privateOff: 'Alle dürfen dir folgen und deine Regale sehen.',
    photoDenied: 'Der Zugriff auf deine Fotos wurde abgelehnt.',
    errSendCode: 'Der Code konnte nicht gesendet werden.',
    errVerifyCode: 'Dieser Code hat nicht funktioniert.',
    errNotSignedIn: 'Nicht angemeldet.',
    errUsernameTaken: 'Dieser Benutzername ist schon vergeben.',
    errSaveProfile: 'Dein Profil konnte nicht gespeichert werden.',
    errDeleteAccount: 'Das Konto konnte nicht gelöscht werden.',
    errReadImage: 'Das Bild konnte nicht gelesen werden.',
    errSavePhoto: 'Das Foto konnte nicht gespeichert werden.',
    errProcessImage: 'Das Bild konnte nicht verarbeitet werden.',
    landingTagline: 'Deine Sammlung fürs Leben.',
    greeting: 'Hallo, {name}',
    setName: 'Tippe, um deinen Namen zu setzen',
    categoryBlurb: {
      movie: 'Die Filme deines Lebens',
      tv: 'Serien, die du verschlungen hast',
      book: 'Bücher, die du gelesen hast',
      game: 'Spiele, die du gespielt hast',
    },
    findHeading: {
      movie: 'Finde jeden Film',
      tv: 'Finde jede Serie',
      book: 'Finde jedes Buch',
      game: 'Finde jedes Spiel',
    },
    searchPlaceholder: {
      movie: 'Film nach Titel suchen…',
      tv: 'Serie nach Titel suchen…',
      book: 'Buch nach Titel suchen…',
      game: 'Spiel nach Titel suchen…',
    },
    nothingFound: 'Gerade nichts gefunden.',
    couldNotLoad: 'Konnte {noun} nicht laden.',
    somethingWrong: 'Etwas ist schiefgelaufen.',
    retry: 'Erneut versuchen',
    phSearchActor: 'Schauspieler suchen…',
    phSearchAuthor: 'Autor suchen…',
    phFindPeople: 'Leute über den Benutzernamen finden',
    phSearchShelf: 'In diesem Regal suchen…',
    phMoodName: 'Name des Moods',
    phMoodExample: 'z. B. 🛋️ Comfort',
    phNote:
      'Schreib deine Gedanken auf, Lieblingsszenen, mit wem du es gesehen hast…',
    phYourName: 'Deinen Namen eintragen',
    phSearchGifs: 'GIFs suchen…',
    phType: 'Schreib etwas…',
    phOptional: '(optional)',
    matchTitle: 'Es ist ein Match!',
    matchNice: 'Schön!',
    matchYouAnd: 'Du und',
    matchWantToSee: ' wollt beide sehen',
    matchLove: ' liebt beide',
    lovesThisOne: 'liebt das',
    lovesThisMany: 'lieben das',
    lovesThisHeading: 'Lieben das',
    wantsToSeeOne: 'will das sehen',
    wantsToSeeMany: 'wollen das sehen',
    wantsToSeeHeading: 'Wollen das sehen',
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
    cancel: 'Cancelar',
    delete: 'Excluir',
    clear: 'Esvaziar',
    reset: 'Redefinir',
    scopeDevice: 'neste aparelho',
    scopeDeviceAndCloud: 'neste aparelho e na nuvem',
    allCategories: 'todas as categorias',
    clearShelvesRow: 'Esvaziar estantes…',
    clearShelvesHint:
      'Escolha quais estantes e categorias devem ser esvaziadas.',
    clearShelvesTitle: 'Esvaziar estantes?',
    clearShelvesMessage: 'Isto esvazia {shelves} para {media} {where}.',
    clearSelected: 'Esvaziar seleção',
    resetEverything: 'Redefinir tudo',
    resetAllTitle: 'Redefinir tudo?',
    resetAllMessage:
      'Isto apaga definitivamente todas as estantes, os moods, as notas e o progresso das séries {where}. Não dá para desfazer.',
    deleteMoodTitle: 'Excluir “{name}”?',
    deleteMoodMessage:
      'Isto remove apenas o mood. Seus títulos continuam na sua estante.',
    deleteStoryTitle: 'Excluir esta story?',
    deleteStoryMessage: 'Ela some para todo mundo.',
    signOut: 'Sair',
    deleteAccount: 'Excluir conta',
    deleteAccountConfirm: 'Toque de novo para excluir de vez',
    accountIntro:
      'Opcional. Entre para compartilhar listas e seguir amigos. Tudo funciona sem conta também.',
    sendCode: 'Enviar código',
    codeSent: 'Enviamos um código de seis dígitos para {email}.',
    verify: 'Confirmar',
    changeEmail: 'Trocar e-mail',
    pickUsername:
      'Escolha um nome de usuário para os amigos te encontrarem.',
    checking: 'Verificando…',
    usernameFree: '✓ Disponível',
    usernameTaken: '✗ Já está em uso',
    save: 'Salvar',
    privateAccount: 'Conta privada',
    privateOn: 'Novos seguidores precisam da sua aprovação.',
    privateOff: 'Qualquer pessoa pode seguir você e ver suas estantes.',
    photoDenied: 'O acesso às suas fotos foi negado.',
    errSendCode: 'Não foi possível enviar o código.',
    errVerifyCode: 'Esse código não funcionou.',
    errNotSignedIn: 'Você não está conectado.',
    errUsernameTaken: 'Esse nome de usuário já está em uso.',
    errSaveProfile: 'Não foi possível salvar seu perfil.',
    errDeleteAccount: 'Não foi possível excluir a conta.',
    errReadImage: 'Não foi possível ler essa imagem.',
    errSavePhoto: 'Não foi possível salvar a foto.',
    errProcessImage: 'Não foi possível processar a imagem.',
    landingTagline: 'Sua coleção para a vida toda.',
    greeting: 'Oi, {name}',
    setName: 'Toque para colocar seu nome',
    categoryBlurb: {
      movie: 'Os filmes de uma vida',
      tv: 'As séries que você maratonou',
      book: 'Os livros que você leu',
      game: 'Os jogos que você jogou',
    },
    findHeading: {
      movie: 'Encontre qualquer filme',
      tv: 'Encontre qualquer série',
      book: 'Encontre qualquer livro',
      game: 'Encontre qualquer jogo',
    },
    searchPlaceholder: {
      movie: 'Buscar filme pelo título…',
      tv: 'Buscar série pelo título…',
      book: 'Buscar livro pelo título…',
      game: 'Buscar jogo pelo título…',
    },
    nothingFound: 'Nada encontrado no momento.',
    couldNotLoad: 'Não foi possível carregar {noun}.',
    somethingWrong: 'Algo deu errado.',
    retry: 'Tentar de novo',
    phSearchActor: 'Buscar ator…',
    phSearchAuthor: 'Buscar autor…',
    phFindPeople: 'Encontrar pessoas pelo nome de usuário',
    phSearchShelf: 'Buscar nesta estante…',
    phMoodName: 'Nome do mood',
    phMoodExample: 'ex. 🛋️ Comfort',
    phNote:
      'Escreva o que achou, cenas favoritas, com quem você viu…',
    phYourName: 'Coloque seu nome',
    phSearchGifs: 'Buscar GIFs…',
    phType: 'Digite…',
    phOptional: '(opcional)',
    matchTitle: 'É um Match!',
    matchNice: 'Legal!',
    matchYouAnd: 'Você e',
    matchWantToSee: ' querem ver',
    matchLove: ' amam',
    lovesThisOne: 'ama isto',
    lovesThisMany: 'amam isto',
    lovesThisHeading: 'Amam isto',
    wantsToSeeOne: 'quer ver isto',
    wantsToSeeMany: 'querem ver isto',
    wantsToSeeHeading: 'Querem ver isto',
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
    cancel: 'Annuler',
    delete: 'Supprimer',
    clear: 'Vider',
    reset: 'Réinitialiser',
    scopeDevice: 'sur cet appareil',
    scopeDeviceAndCloud: 'sur cet appareil et dans le cloud',
    allCategories: 'toutes les catégories',
    clearShelvesRow: 'Vider les étagères…',
    clearShelvesHint: 'Choisis les étagères et les catégories à vider.',
    clearShelvesTitle: 'Vider les étagères ?',
    clearShelvesMessage: 'Cela vide {shelves} pour {media} {where}.',
    clearSelected: 'Vider la sélection',
    resetEverything: 'Tout réinitialiser',
    resetAllTitle: 'Tout réinitialiser ?',
    resetAllMessage:
      'Cela supprime définitivement toutes les étagères, les moods, les notes et la progression des séries {where}. C’est irréversible.',
    deleteMoodTitle: 'Supprimer « {name} » ?',
    deleteMoodMessage:
      'Cela retire seulement le mood. Tes titres restent sur ton étagère.',
    deleteStoryTitle: 'Supprimer cette story ?',
    deleteStoryMessage: 'Elle disparaîtra pour tout le monde.',
    signOut: 'Se déconnecter',
    deleteAccount: 'Supprimer le compte',
    deleteAccountConfirm: 'Touche encore une fois pour supprimer définitivement',
    accountIntro:
      'Facultatif. Connecte-toi pour partager des listes et suivre tes amis. Tout fonctionne aussi sans compte.',
    sendCode: 'Envoyer le code',
    codeSent: 'Nous avons envoyé un code à six chiffres à {email}.',
    verify: 'Valider',
    changeEmail: 'Changer d’adresse',
    pickUsername:
      'Choisis un nom d’utilisateur pour que tes amis te trouvent.',
    checking: 'Vérification…',
    usernameFree: '✓ Disponible',
    usernameTaken: '✗ Déjà pris',
    save: 'Enregistrer',
    privateAccount: 'Compte privé',
    privateOn: 'Les nouveaux abonnés doivent être acceptés.',
    privateOff: 'Tout le monde peut te suivre et voir tes étagères.',
    photoDenied: 'L’accès à tes photos a été refusé.',
    errSendCode: 'Impossible d’envoyer le code.',
    errVerifyCode: 'Ce code n’a pas fonctionné.',
    errNotSignedIn: 'Tu n’es pas connecté.',
    errUsernameTaken: 'Ce nom d’utilisateur est déjà pris.',
    errSaveProfile: 'Impossible d’enregistrer ton profil.',
    errDeleteAccount: 'Impossible de supprimer le compte.',
    errReadImage: 'Impossible de lire cette image.',
    errSavePhoto: 'Impossible d’enregistrer la photo.',
    errProcessImage: 'Impossible de traiter l’image.',
    landingTagline: 'Ta collection de toute une vie.',
    greeting: 'Salut, {name}',
    setName: 'Touche pour indiquer ton nom',
    categoryBlurb: {
      movie: 'Les films de toute une vie',
      tv: 'Les séries que tu as dévorées',
      book: 'Les livres que tu as lus',
      game: 'Les jeux auxquels tu as joué',
    },
    findHeading: {
      movie: 'Trouve n’importe quel film',
      tv: 'Trouve n’importe quelle série',
      book: 'Trouve n’importe quel livre',
      game: 'Trouve n’importe quel jeu',
    },
    searchPlaceholder: {
      movie: 'Chercher un film par titre…',
      tv: 'Chercher une série par titre…',
      book: 'Chercher un livre par titre…',
      game: 'Chercher un jeu par titre…',
    },
    nothingFound: 'Rien trouvé pour le moment.',
    couldNotLoad: 'Impossible de charger {noun}.',
    somethingWrong: 'Quelque chose s’est mal passé.',
    retry: 'Réessayer',
    phSearchActor: 'Chercher un acteur…',
    phSearchAuthor: 'Chercher un auteur…',
    phFindPeople: 'Trouver des gens par nom d’utilisateur',
    phSearchShelf: 'Chercher sur cette étagère…',
    phMoodName: 'Nom du mood',
    phMoodExample: 'ex. 🛋️ Comfort',
    phNote:
      'Écris ce que tu en as pensé, tes scènes préférées, avec qui tu l’as vu…',
    phYourName: 'Indique ton nom',
    phSearchGifs: 'Chercher des GIF…',
    phType: 'Écris…',
    phOptional: '(facultatif)',
    matchTitle: 'C’est un Match !',
    matchNice: 'Super !',
    matchYouAnd: 'Toi et',
    matchWantToSee: ', vous voulez voir',
    matchLove: ', vous aimez tous les deux',
    lovesThisOne: 'aime ça',
    lovesThisMany: 'aiment ça',
    lovesThisHeading: 'Aiment ça',
    wantsToSeeOne: 'veut voir ça',
    wantsToSeeMany: 'veulent voir ça',
    wantsToSeeHeading: 'Veulent voir ça',
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
    cancel: 'Cancelar',
    delete: 'Eliminar',
    clear: 'Vaciar',
    reset: 'Restablecer',
    scopeDevice: 'en este dispositivo',
    scopeDeviceAndCloud: 'en este dispositivo y en la nube',
    allCategories: 'todas las categorías',
    clearShelvesRow: 'Vaciar estanterías…',
    clearShelvesHint: 'Elige qué estanterías y categorías se vacían.',
    clearShelvesTitle: '¿Vaciar las estanterías?',
    clearShelvesMessage: 'Esto vacía {shelves} para {media} {where}.',
    clearSelected: 'Vaciar la selección',
    resetEverything: 'Restablecer todo',
    resetAllTitle: '¿Restablecer todo?',
    resetAllMessage:
      'Esto borra definitivamente todas las estanterías, los moods, las notas y el progreso de las series {where}. No se puede deshacer.',
    deleteMoodTitle: '¿Eliminar “{name}”?',
    deleteMoodMessage:
      'Esto quita solo el mood. Tus títulos siguen en tu estantería.',
    deleteStoryTitle: '¿Eliminar esta story?',
    deleteStoryMessage: 'Desaparece para todo el mundo.',
    signOut: 'Cerrar sesión',
    deleteAccount: 'Eliminar cuenta',
    deleteAccountConfirm: 'Toca otra vez para eliminarla para siempre',
    accountIntro:
      'Opcional. Inicia sesión para compartir listas y seguir a tus amigos. Todo funciona también sin cuenta.',
    sendCode: 'Enviar código',
    codeSent: 'Hemos enviado un código de seis cifras a {email}.',
    verify: 'Verificar',
    changeEmail: 'Cambiar el correo',
    pickUsername:
      'Elige un nombre de usuario para que tus amigos te encuentren.',
    checking: 'Comprobando…',
    usernameFree: '✓ Disponible',
    usernameTaken: '✗ Ya está en uso',
    save: 'Guardar',
    privateAccount: 'Cuenta privada',
    privateOn: 'Los nuevos seguidores necesitan tu aprobación.',
    privateOff: 'Cualquiera puede seguirte y ver tus estanterías.',
    photoDenied: 'Se denegó el acceso a tus fotos.',
    errSendCode: 'No se pudo enviar el código.',
    errVerifyCode: 'Ese código no funcionó.',
    errNotSignedIn: 'No has iniciado sesión.',
    errUsernameTaken: 'Ese nombre de usuario ya está en uso.',
    errSaveProfile: 'No se pudo guardar tu perfil.',
    errDeleteAccount: 'No se pudo eliminar la cuenta.',
    errReadImage: 'No se pudo leer esa imagen.',
    errSavePhoto: 'No se pudo guardar la foto.',
    errProcessImage: 'No se pudo procesar la imagen.',
    landingTagline: 'Tu colección para toda la vida.',
    greeting: 'Hola, {name}',
    setName: 'Toca para poner tu nombre',
    categoryBlurb: {
      movie: 'Las películas de tu vida',
      tv: 'Las series que has devorado',
      book: 'Los libros que has leído',
      game: 'Los juegos a los que has jugado',
    },
    findHeading: {
      movie: 'Encuentra cualquier película',
      tv: 'Encuentra cualquier serie',
      book: 'Encuentra cualquier libro',
      game: 'Encuentra cualquier juego',
    },
    searchPlaceholder: {
      movie: 'Buscar una película por título…',
      tv: 'Buscar una serie por título…',
      book: 'Buscar un libro por título…',
      game: 'Buscar un juego por título…',
    },
    nothingFound: 'No se ha encontrado nada ahora mismo.',
    couldNotLoad: 'No se pudieron cargar {noun}.',
    somethingWrong: 'Algo ha salido mal.',
    retry: 'Reintentar',
    phSearchActor: 'Buscar un actor…',
    phSearchAuthor: 'Buscar un autor…',
    phFindPeople: 'Buscar personas por nombre de usuario',
    phSearchShelf: 'Buscar en esta estantería…',
    phMoodName: 'Nombre del mood',
    phMoodExample: 'p. ej. 🛋️ Comfort',
    phNote:
      'Escribe lo que piensas, tus escenas favoritas, con quién lo viste…',
    phYourName: 'Pon tu nombre',
    phSearchGifs: 'Buscar GIFs…',
    phType: 'Escribe…',
    phOptional: '(opcional)',
    matchTitle: '¡Es un Match!',
    matchNice: '¡Genial!',
    matchYouAnd: 'Tú y',
    matchWantToSee: ', queréis verlo los dos',
    matchLove: ', os encanta a los dos',
    lovesThisOne: 'le encanta',
    lovesThisMany: 'les encanta',
    lovesThisHeading: 'Les encanta',
    wantsToSeeOne: 'quiere verlo',
    wantsToSeeMany: 'quieren verlo',
    wantsToSeeHeading: 'Quieren verlo',
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
    cancel: 'Annulla',
    delete: 'Elimina',
    clear: 'Svuota',
    reset: 'Reimposta',
    scopeDevice: 'su questo dispositivo',
    scopeDeviceAndCloud: 'su questo dispositivo e nel cloud',
    allCategories: 'tutte le categorie',
    clearShelvesRow: 'Svuota le librerie…',
    clearShelvesHint: 'Scegli quali librerie e categorie svuotare.',
    clearShelvesTitle: 'Svuotare le librerie?',
    clearShelvesMessage: 'Questo svuota {shelves} per {media} {where}.',
    clearSelected: 'Svuota la selezione',
    resetEverything: 'Reimposta tutto',
    resetAllTitle: 'Reimpostare tutto?',
    resetAllMessage:
      'Questo elimina definitivamente tutte le librerie, i mood, le note e i progressi delle serie {where}. Non si può annullare.',
    deleteMoodTitle: 'Eliminare “{name}”?',
    deleteMoodMessage:
      'Questo rimuove solo il mood. I tuoi titoli restano nella tua libreria.',
    deleteStoryTitle: 'Eliminare questa story?',
    deleteStoryMessage: 'Sparirà per tutti.',
    signOut: 'Esci',
    deleteAccount: 'Elimina account',
    deleteAccountConfirm: 'Tocca di nuovo per eliminarlo per sempre',
    accountIntro:
      'Facoltativo. Accedi per condividere le liste e seguire gli amici. Tutto funziona anche senza account.',
    sendCode: 'Invia il codice',
    codeSent: 'Abbiamo inviato un codice di sei cifre a {email}.',
    verify: 'Conferma',
    changeEmail: 'Cambia email',
    pickUsername: 'Scegli un nome utente così gli amici ti trovano.',
    checking: 'Controllo…',
    usernameFree: '✓ Disponibile',
    usernameTaken: '✗ Già in uso',
    save: 'Salva',
    privateAccount: 'Account privato',
    privateOn: 'I nuovi follower devono essere approvati.',
    privateOff: 'Chiunque può seguirti e vedere le tue librerie.',
    photoDenied: 'L’accesso alle tue foto è stato negato.',
    errSendCode: 'Non è stato possibile inviare il codice.',
    errVerifyCode: 'Questo codice non ha funzionato.',
    errNotSignedIn: 'Non hai effettuato l’accesso.',
    errUsernameTaken: 'Questo nome utente è già in uso.',
    errSaveProfile: 'Non è stato possibile salvare il tuo profilo.',
    errDeleteAccount: 'Non è stato possibile eliminare l’account.',
    errReadImage: 'Non è stato possibile leggere questa immagine.',
    errSavePhoto: 'Non è stato possibile salvare la foto.',
    errProcessImage: 'Non è stato possibile elaborare l’immagine.',
    landingTagline: 'La tua collezione di una vita.',
    greeting: 'Ciao, {name}',
    setName: 'Tocca per inserire il tuo nome',
    categoryBlurb: {
      movie: 'I film di una vita',
      tv: 'Le serie che hai divorato',
      book: 'I libri che hai letto',
      game: 'I giochi a cui hai giocato',
    },
    findHeading: {
      movie: 'Trova qualsiasi film',
      tv: 'Trova qualsiasi serie',
      book: 'Trova qualsiasi libro',
      game: 'Trova qualsiasi gioco',
    },
    searchPlaceholder: {
      movie: 'Cerca un film per titolo…',
      tv: 'Cerca una serie per titolo…',
      book: 'Cerca un libro per titolo…',
      game: 'Cerca un gioco per titolo…',
    },
    nothingFound: 'Al momento non è stato trovato nulla.',
    couldNotLoad: 'Non è stato possibile caricare {noun}.',
    somethingWrong: 'Qualcosa è andato storto.',
    retry: 'Riprova',
    phSearchActor: 'Cerca un attore…',
    phSearchAuthor: 'Cerca un autore…',
    phFindPeople: 'Trova persone dal nome utente',
    phSearchShelf: 'Cerca in questa libreria…',
    phMoodName: 'Nome del mood',
    phMoodExample: 'es. 🛋️ Comfort',
    phNote:
      'Scrivi cosa ne pensi, le scene preferite, con chi l’hai visto…',
    phYourName: 'Inserisci il tuo nome',
    phSearchGifs: 'Cerca GIF…',
    phType: 'Scrivi…',
    phOptional: '(facoltativo)',
    matchTitle: 'È un Match!',
    matchNice: 'Bello!',
    matchYouAnd: 'Tu e',
    matchWantToSee: ', volete vederlo entrambi',
    matchLove: ', lo amate entrambi',
    lovesThisOne: 'lo ama',
    lovesThisMany: 'lo amano',
    lovesThisHeading: 'Lo amano',
    wantsToSeeOne: 'vuole vederlo',
    wantsToSeeMany: 'vogliono vederlo',
    wantsToSeeHeading: 'Vogliono vederlo',
  },
};

/** UI text outside React, for providers that sit above the LanguageProvider. */
export function currentUiText(): UiText {
  const code = contentLanguage().slice(0, 2).toLowerCase();
  return UI_TEXT[isAppLanguage(code) ? code : DEFAULT_LANGUAGE];
}
