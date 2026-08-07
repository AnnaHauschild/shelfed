import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { MediaType } from '@/api/types';

export interface ShelfGenreRequest {
  mediaType: MediaType;
  genre: string;
}

interface ShelfFilterValue {
  /** A genre the shelf should preselect (e.g. tapped from Statistics). */
  pending: ShelfGenreRequest | null;
  requestGenre: (req: ShelfGenreRequest) => void;
  clearPending: () => void;
}

const ShelfFilterContext = createContext<ShelfFilterValue>({
  pending: null,
  requestGenre: () => {},
  clearPending: () => {},
});

export function useShelfFilter(): ShelfFilterValue {
  return useContext(ShelfFilterContext);
}

/** Carries a one-shot "open the shelf filtered to this genre" request. */
export function ShelfFilterProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<ShelfGenreRequest | null>(null);
  const requestGenre = useCallback((req: ShelfGenreRequest) => setPending(req), []);
  const clearPending = useCallback(() => setPending(null), []);
  const value = useMemo(
    () => ({ pending, requestGenre, clearPending }),
    [pending, requestGenre, clearPending],
  );
  return (
    <ShelfFilterContext.Provider value={value}>
      {children}
    </ShelfFilterContext.Provider>
  );
}
