import { useQuery } from '@tanstack/react-query';
import { fetchBookDescription } from '@/api/openLibrary';

/**
 * Lazily loads a book's description from Open Library (only when the details
 * view for a book is open). Cached for an hour since it never changes.
 */
export function useBookDescription(bookId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['book-description', bookId],
    queryFn: () => fetchBookDescription(bookId),
    enabled: enabled && bookId.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}
