/**
 * Tiny Desk palette. Warm cream paper, walnut wood, brass lamp glow and a
 * soft brick accent — like a cosy office crammed with books and a goose-neck
 * desk lamp.
 */
export const colors = {
  // Backgrounds — cream paper instead of dark vault.
  background: '#f3e7d2',
  surface: '#ebdcc1',
  surfaceRaised: '#ffffff',

  // "Paper" tones for cards / labels (kept for cross-component compatibility).
  paper: '#fbf3e2',
  paperShade: '#ecddc1',

  // Accents — warm walnut + brass.
  amber: '#b3873d', // brass
  amberBright: '#d8a548', // bright brass lamp glow
  maroon: '#7a3527', // brick
  rust: '#a7563d', // terracotta

  // Text — dark espresso on cream, walnut for muted.
  textOnDark: '#2c1d10', // historical name kept; now "primary text"
  textOnDarkMuted: '#6a4f33', // walnut muted
  textOnPaper: '#2c1d10',
  textOnPaperMuted: '#6a4f33',

  // Swipe / action feedback — botanical and earthy.
  watched: '#5e7a3c', // sage / fern leaf
  skip: '#a7563d', // terracotta
  star: '#d8a548', // brass
  favorite: '#a93b3b', // muted brick red

  // Lines and shadow.
  border: '#caa872', // walnut edge
  shadow: '#000000',
  scrim: 'rgba(46, 30, 16, 0.55)',
} as const;

export type AppColors = typeof colors;
