import { ShelfGrid } from '@/components/ShelfGrid';
import { colors } from '@/theme';

/** Movies the user wants to watch later (added via the Star button). */
export default function WatchlistScreen() {
  return (
    <ShelfGrid
      type="watchlist"
      title="Watchlist"
      icon="star"
      accent={colors.star}
      filterable
      emptyTitle="Nothing saved yet"
      emptyMessage="Tap the star on a card to save movies you want to watch later."
    />
  );
}
