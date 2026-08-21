// Google Books only exposes the printed EDITION year (a 1990 reprint of Don
// Quixote shows 1990). Open Library's `first_publish_year` is the original, so we
// look it up lazily by title (+author) for the book details view.
const OL_SEARCH = 'https://openlibrary.org/search.json';

export async function fetchOriginalYear(
  title: string,
  author?: string,
): Promise<number | null> {
  const mainTitle = title.split(':')[0].trim();
  if (!mainTitle) return null;
  const params = new URLSearchParams({
    title: mainTitle,
    fields: 'first_publish_year',
    limit: '1',
    sort: 'old', // oldest matching edition ~= original publication
  });
  if (author) params.set('author', author);
  try {
    const res = await fetch(`${OL_SEARCH}?${params.toString()}`, {
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      docs?: { first_publish_year?: number }[];
    };
    const year = data.docs?.[0]?.first_publish_year;
    return typeof year === 'number' && year > 0 ? year : null;
  } catch {
    return null;
  }
}
