import { createContext, useCallback, useContext, useState } from 'react';
import { Movie } from '@/api/types';
import { PostComposer } from '@/components/PostComposer';

interface ComposerContextValue {
  /** Opens the Story composer for a title (share it to your friends). */
  open: (movie: Movie) => void;
}

const ComposerContext = createContext<ComposerContextValue | null>(null);

/** Opens the app-wide Story composer from any Share button. */
export function useComposer(): ComposerContextValue {
  const ctx = useContext(ComposerContext);
  if (!ctx) {
    throw new Error('useComposer must be used within a PostComposerProvider');
  }
  return ctx;
}

/** Hosts a single, app-wide Story composer so Share works the same everywhere. */
export function PostComposerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const open = useCallback((m: Movie) => setMovie(m), []);

  return (
    <ComposerContext.Provider value={{ open }}>
      {children}
      <PostComposer movie={movie} onClose={() => setMovie(null)} />
    </ComposerContext.Provider>
  );
}
