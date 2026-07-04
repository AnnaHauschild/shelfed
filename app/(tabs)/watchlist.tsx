import { ShelfGrid } from '@/components/ShelfGrid';
import { WATCHLIST_LABEL } from '@/constants/labels';
import { colors } from '@/theme';

/** Movies the user wants to watch later (added via the Star button). */
export default function WatchlistScreen() {
  return (
    <ShelfGrid
      type="watchlist"
      title={WATCHLIST_LABEL}
      icon="star"
      accent={colors.star}
      filterable
      emptyTitle="Nothing saved yet"
      emptyMessage="Tap the star on a card to save the {noun} you want for later."
    />
  );
}
