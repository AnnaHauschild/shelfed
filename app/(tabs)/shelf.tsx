import { ShelfGrid } from '@/components/ShelfGrid';
import { colors } from '@/theme';

/** The core feature: every movie the user has marked as watched. */
export default function WatchedShelfScreen() {
  return (
    <ShelfGrid
      type="watched"
      title="Watched Shelf"
      icon="albums"
      accent={colors.watched}
      filterable
      moods
      empty="shelf"
    />
  );
}
