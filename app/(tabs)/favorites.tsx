import { ShelfGrid } from '@/components/ShelfGrid';
import { colors } from '@/theme';

/** The user's favourite movies (added via the Heart button) — a strong signal. */
export default function FavoritesScreen() {
  return (
    <ShelfGrid
      type="favorite"
      title="Favorites"
      icon="heart"
      accent={colors.favorite}
      filterable
      emptyTitle="No favorites yet"
      emptyMessage="Tap the heart on a card to mark the movies you love most."
    />
  );
}
