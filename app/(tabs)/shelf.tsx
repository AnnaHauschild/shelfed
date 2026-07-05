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
      emptyTitle="Your shelf is empty"
      emptyMessage="Swipe right on the {noun} you've already enjoyed to start building your lifetime shelf."
    />
  );
}
