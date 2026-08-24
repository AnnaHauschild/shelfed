import { AppLanguage } from './languages';

/** Persisted flag: the first-launch intro walkthrough has been shown once. */
export const INTRO_SEEN_KEY = 'introSeenV1';

// Dev/QA switch: replay BOTH onboardings (intro walkthrough + swipe arrows) on
// every launch, ignoring the persisted "seen" flags. Keep false in production.
export const DEV_REPLAY_ONBOARDING = false;

export interface IntroSlideText {
  title: string;
  body: string;
}

export interface IntroText {
  /** Same length + order across every language (index-aligned with the visuals). */
  slides: IntroSlideText[];
  skip: string;
  next: string;
  done: string;
}

export const INTRO_TEXT: Record<AppLanguage, IntroText> = {
  en: {
    slides: [
      {
        title: 'Welcome to Shelfed',
        body: 'Your lifelong collection of the films, series, books and games you love, all in one place.',
      },
      {
        title: 'Swipe to discover',
        body: 'Swipe right to shelf a title you love, left to skip it. Tap any card for the full details.',
      },
      {
        title: 'Your shelves & lists',
        body: 'Save to your Wishlist or Favorites, and group titles into your own moods.',
      },
      {
        title: 'Share with friends',
        body: 'Follow friends and share the titles you love.',
      },
    ],
    skip: 'Skip',
    next: 'Next',
    done: 'Get started',
  },
  de: {
    slides: [
      {
        title: 'Willkommen bei Shelfed',
        body: 'Deine lebenslange Sammlung der Filme, Serien, Bücher und Spiele, die du liebst, alles an einem Ort.',
      },
      {
        title: 'Wischen zum Entdecken',
        body: 'Wisch nach rechts, um einen Titel ins Regal zu stellen, nach links zum Überspringen. Tippe eine Karte für alle Details.',
      },
      {
        title: 'Deine Regale & Listen',
        body: 'Speichere in deine Wunschliste oder Favoriten und sortiere Titel in eigene Moods.',
      },
      {
        title: 'Mit Freunden teilen',
        body: 'Folge Freunden und teile die Titel, die du liebst.',
      },
    ],
    skip: 'Überspringen',
    next: 'Weiter',
    done: 'Los geht’s',
  },
  pt: {
    slides: [
      {
        title: 'Bem-vindo ao Shelfed',
        body: 'Sua coleção para a vida toda dos filmes, séries, livros e jogos que você ama, tudo num só lugar.',
      },
      {
        title: 'Deslize para descobrir',
        body: 'Deslize para a direita para guardar um título que você ama, para a esquerda para pular. Toque num cartão para ver os detalhes.',
      },
      {
        title: 'Suas estantes e listas',
        body: 'Salve na sua Lista de desejos ou Favoritos e agrupe títulos nos seus próprios moods.',
      },
      {
        title: 'Compartilhe com amigos',
        body: 'Siga amigos e compartilhe os títulos que você ama.',
      },
    ],
    skip: 'Pular',
    next: 'Avançar',
    done: 'Começar',
  },
  fr: {
    slides: [
      {
        title: 'Bienvenue sur Shelfed',
        body: 'Ta collection de toute une vie : les films, séries, livres et jeux que tu aimes, au même endroit.',
      },
      {
        title: 'Glisse pour découvrir',
        body: 'Glisse à droite pour ranger un titre que tu aimes, à gauche pour passer. Touche une carte pour tous les détails.',
      },
      {
        title: 'Tes étagères et listes',
        body: 'Enregistre dans ta Liste de souhaits ou tes Favoris, et regroupe des titres dans tes propres moods.',
      },
      {
        title: 'Partage avec tes amis',
        body: 'Suis tes amis et partage les titres que tu aimes.',
      },
    ],
    skip: 'Passer',
    next: 'Suivant',
    done: 'Commencer',
  },
  es: {
    slides: [
      {
        title: 'Bienvenido a Shelfed',
        body: 'Tu colección de toda la vida: las películas, series, libros y juegos que amas, todo en un solo lugar.',
      },
      {
        title: 'Desliza para descubrir',
        body: 'Desliza a la derecha para guardar un título que te encanta, a la izquierda para saltarlo. Toca una tarjeta para ver los detalles.',
      },
      {
        title: 'Tus estanterías y listas',
        body: 'Guarda en tu Lista de deseos o Favoritos y agrupa títulos en tus propios moods.',
      },
      {
        title: 'Comparte con amigos',
        body: 'Sigue a amigos y comparte los títulos que te encantan.',
      },
    ],
    skip: 'Saltar',
    next: 'Siguiente',
    done: 'Empezar',
  },
  it: {
    slides: [
      {
        title: 'Benvenuto su Shelfed',
        body: 'La tua collezione di una vita: i film, le serie, i libri e i giochi che ami, tutto in un unico posto.',
      },
      {
        title: 'Scorri per scoprire',
        body: 'Scorri a destra per mettere sullo scaffale un titolo che ami, a sinistra per saltarlo. Tocca una carta per tutti i dettagli.',
      },
      {
        title: 'I tuoi scaffali e liste',
        body: 'Salva nella tua Lista dei desideri o nei Preferiti e raggruppa i titoli nei tuoi mood.',
      },
      {
        title: 'Condividi con gli amici',
        body: 'Segui gli amici e condividi i titoli che ami.',
      },
    ],
    skip: 'Salta',
    next: 'Avanti',
    done: 'Inizia',
  },
};
