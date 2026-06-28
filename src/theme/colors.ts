/**
 * Sepia / 90s-videothek colour palette. Warm browns, amber glow and faded
 * maroon evoke a dim DVD-rental store at night.
 */
export const colors = {
  // Backgrounds.
  background: '#1d140c',
  surface: '#2b1d12',
  surfaceRaised: '#3a281a',

  // "Paper" tones for cards / labels.
  paper: '#f4e4c1',
  paperShade: '#e6d2a8',

  // Accents.
  amber: '#c8862b',
  amberBright: '#e0a23c',
  maroon: '#7c2f1e',
  rust: '#a8482a',

  // Text.
  textOnDark: '#f4e4c1',
  textOnDarkMuted: '#b89b73',
  textOnPaper: '#3a281a',
  textOnPaperMuted: '#7a5c3a',

  // Swipe / action feedback.
  watched: '#6f8f3a', // mossy green — "I've seen it"
  skip: '#a8482a', // rust — "skip / not seen"
  star: '#d9a531', // watchlist
  favorite: '#b23a48', // favourite heart

  // Lines and shadow.
  border: '#5a4128',
  shadow: '#000000',
  scrim: 'rgba(15, 9, 4, 0.85)',
} as const;

export type AppColors = typeof colors;
