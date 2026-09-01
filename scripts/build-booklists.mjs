// One-off build script: resolves three curated reading lists into bundled JSON
// of fully-normalised Book objects, so the curated book categories load
// instantly and never depend on Google Books search quality.
//
// Usage: node scripts/build-booklists.mjs
// Reads EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY from .env; the key is never printed.
//
// Titles that cannot be resolved are reported at the end and simply left out,
// so a typo in a list can never ship a broken entry.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_PATH = join(ROOT, 'src', 'api', 'bookLists.json');

// Pre-1970 canon: the books most people mean by "a classic".
const CLASSICS = [
  ['Pride and Prejudice', 'Jane Austen'],
  ['Jane Eyre', 'Charlotte Bronte'],
  ['Wuthering Heights', 'Emily Bronte'],
  ['Great Expectations', 'Charles Dickens'],
  ['A Tale of Two Cities', 'Charles Dickens'],
  ['Moby-Dick', 'Herman Melville'],
  ['Frankenstein', 'Mary Shelley'],
  ['Dracula', 'Bram Stoker'],
  ['The Picture of Dorian Gray', 'Oscar Wilde'],
  ['The Adventures of Huckleberry Finn', 'Mark Twain'],
  ['Little Women', 'Louisa May Alcott'],
  ['The Scarlet Letter', 'Nathaniel Hawthorne'],
  ['Anna Karenina', 'Leo Tolstoy'],
  ['War and Peace', 'Leo Tolstoy'],
  ['Crime and Punishment', 'Fyodor Dostoevsky'],
  ['The Brothers Karamazov', 'Fyodor Dostoevsky'],
  ['Madame Bovary', 'Gustave Flaubert'],
  ['Les Miserables', 'Victor Hugo'],
  ['The Count of Monte Cristo', 'Alexandre Dumas'],
  ['Don Quixote', 'Miguel de Cervantes'],
  ['The Great Gatsby', 'F. Scott Fitzgerald'],
  ['To Kill a Mockingbird', 'Harper Lee'],
  ['Nineteen Eighty-Four', 'George Orwell'],
  ['Animal Farm', 'George Orwell'],
  ['Brave New World', 'Aldous Huxley'],
  ['Fahrenheit 451', 'Ray Bradbury'],
  ['The Catcher in the Rye', 'J. D. Salinger'],
  ['Of Mice and Men', 'John Steinbeck'],
  ['The Grapes of Wrath', 'John Steinbeck'],
  ['For Whom the Bell Tolls', 'Ernest Hemingway'],
  ['The Old Man and the Sea', 'Ernest Hemingway'],
  ['Lord of the Flies', 'William Golding'],
  ['The Hobbit', 'J. R. R. Tolkien'],
  ['The Lord of the Rings', 'J. R. R. Tolkien'],
  ['The Chronicles of Narnia', 'C. S. Lewis'],
  ['Rebecca', 'Daphne du Maurier'],
  ['Murder on the Orient Express', 'Agatha Christie'],
  ['And Then There Were None', 'Agatha Christie'],
  ['The Hound of the Baskervilles', 'Arthur Conan Doyle'],
  ['Treasure Island', 'Robert Louis Stevenson'],
  ['The Strange Case of Dr Jekyll and Mr Hyde', 'Robert Louis Stevenson'],
  ['Twenty Thousand Leagues Under the Sea', 'Jules Verne'],
  ['The Time Machine', 'H. G. Wells'],
  ['The War of the Worlds', 'H. G. Wells'],
  ['The Trial', 'Franz Kafka'],
  ['The Metamorphosis', 'Franz Kafka'],
  ['Siddhartha', 'Hermann Hesse'],
  ['Steppenwolf', 'Hermann Hesse'],
  ['Death in Venice', 'Thomas Mann'],
  ['The Stranger', 'Albert Camus'],
  ['Mrs Dalloway', 'Virginia Woolf'],
  ['To the Lighthouse', 'Virginia Woolf'],
  ['Ulysses', 'James Joyce'],
  ['Dubliners', 'James Joyce'],
  ['Catch-22', 'Joseph Heller'],
  ['Slaughterhouse-Five', 'Kurt Vonnegut'],
  ['Dune', 'Frank Herbert'],
  ['A Clockwork Orange', 'Anthony Burgess'],
  ['Doctor Zhivago', 'Boris Pasternak'],
  ['The Bell Jar', 'Sylvia Plath'],
  ['Invisible Man', 'Ralph Ellison'],
  ['Their Eyes Were Watching God', 'Zora Neale Hurston'],
  ['The Diary of a Young Girl', 'Anne Frank'],
  ['On the Road', 'Jack Kerouac'],
  ['The Little Prince', 'Antoine de Saint-Exupery'],
];

// Roughly 1970 to today: the books people actually recommend to each other.
const MODERN = [
  ['The Handmaids Tale', 'Margaret Atwood'],
  ['Beloved', 'Toni Morrison'],
  ['The Kite Runner', 'Khaled Hosseini'],
  ['A Thousand Splendid Suns', 'Khaled Hosseini'],
  ['Life of Pi', 'Yann Martel'],
  ['The Road', 'Cormac McCarthy'],
  ['No Country for Old Men', 'Cormac McCarthy'],
  ['Never Let Me Go', 'Kazuo Ishiguro'],
  ['The Remains of the Day', 'Kazuo Ishiguro'],
  ['Klara and the Sun', 'Kazuo Ishiguro'],
  ['Atonement', 'Ian McEwan'],
  ['The Secret History', 'Donna Tartt'],
  ['The Goldfinch', 'Donna Tartt'],
  ['Middlesex', 'Jeffrey Eugenides'],
  ['The Virgin Suicides', 'Jeffrey Eugenides'],
  ['White Teeth', 'Zadie Smith'],
  ['A Little Life', 'Hanya Yanagihara'],
  ['Normal People', 'Sally Rooney'],
  ['Conversations with Friends', 'Sally Rooney'],
  ['Where the Crawdads Sing', 'Delia Owens'],
  ['The Night Circus', 'Erin Morgenstern'],
  ['The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid'],
  ['Daisy Jones and the Six', 'Taylor Jenkins Reid'],
  ['Eleanor Oliphant Is Completely Fine', 'Gail Honeyman'],
  ['The Midnight Library', 'Matt Haig'],
  ['Circe', 'Madeline Miller'],
  ['The Song of Achilles', 'Madeline Miller'],
  ['Piranesi', 'Susanna Clarke'],
  ['Jonathan Strange and Mr Norrell', 'Susanna Clarke'],
  ['American Gods', 'Neil Gaiman'],
  ['Good Omens', 'Neil Gaiman'],
  ['The Name of the Wind', 'Patrick Rothfuss'],
  ['A Game of Thrones', 'George R. R. Martin'],
  ['Mistborn', 'Brandon Sanderson'],
  ['The Way of Kings', 'Brandon Sanderson'],
  ['Harry Potter and the Philosophers Stone', 'J. K. Rowling'],
  ['The Hunger Games', 'Suzanne Collins'],
  ['The Book Thief', 'Markus Zusak'],
  ['The Curious Incident of the Dog in the Night-Time', 'Mark Haddon'],
  ['Cloud Atlas', 'David Mitchell'],
  ['The Wind-Up Bird Chronicle', 'Haruki Murakami'],
  ['Norwegian Wood', 'Haruki Murakami'],
  ['Kafka on the Shore', 'Haruki Murakami'],
  ['Gone Girl', 'Gillian Flynn'],
  ['The Girl with the Dragon Tattoo', 'Stieg Larsson'],
  ['The Silence of the Lambs', 'Thomas Harris'],
  ['It', 'Stephen King'],
  ['The Shining', 'Stephen King'],
  ['11/22/63', 'Stephen King'],
  ['The Martian', 'Andy Weir'],
  ['Project Hail Mary', 'Andy Weir'],
  ['Ready Player One', 'Ernest Cline'],
  ['Snow Crash', 'Neal Stephenson'],
  ['Neuromancer', 'William Gibson'],
  ['Station Eleven', 'Emily St. John Mandel'],
  ['The Three-Body Problem', 'Cixin Liu'],
  ['Pachinko', 'Min Jin Lee'],
  ['Homegoing', 'Yaa Gyasi'],
  ['Americanah', 'Chimamanda Ngozi Adichie'],
  ['Half of a Yellow Sun', 'Chimamanda Ngozi Adichie'],
  ['Sapiens', 'Yuval Noah Harari'],
  ['Educated', 'Tara Westover'],
  ['Born a Crime', 'Trevor Noah'],
  ['Wild', 'Cheryl Strayed'],
];

// Originally written in a language other than English.
const WORLD = [
  ['One Hundred Years of Solitude', 'Gabriel Garcia Marquez'],
  ['Love in the Time of Cholera', 'Gabriel Garcia Marquez'],
  ['The House of the Spirits', 'Isabel Allende'],
  ['The Shadow of the Wind', 'Carlos Ruiz Zafon'],
  ['The Alchemist', 'Paulo Coelho'],
  ['The Name of the Rose', 'Umberto Eco'],
  ['If on a Winters Night a Traveler', 'Italo Calvino'],
  ['The Leopard', 'Giuseppe Tomasi di Lampedusa'],
  ['My Brilliant Friend', 'Elena Ferrante'],
  ['The Perfume', 'Patrick Suskind'],
  ['The Tin Drum', 'Gunter Grass'],
  ['The Reader', 'Bernhard Schlink'],
  ['The Neverending Story', 'Michael Ende'],
  ['Momo', 'Michael Ende'],
  ['The Hundred-Year-Old Man Who Climbed Out the Window and Disappeared', 'Jonas Jonasson'],
  ['A Man Called Ove', 'Fredrik Backman'],
  ['Anxious People', 'Fredrik Backman'],
  ['The Girl Who Saved the King of Sweden', 'Jonas Jonasson'],
  ['Out Stealing Horses', 'Per Petterson'],
  ['Kitchen', 'Banana Yoshimoto'],
  ['The Housekeeper and the Professor', 'Yoko Ogawa'],
  ['Convenience Store Woman', 'Sayaka Murata'],
  ['Before the Coffee Gets Cold', 'Toshikazu Kawaguchi'],
  ['The Vegetarian', 'Han Kang'],
  ['Please Look After Mom', 'Kyung-sook Shin'],
  ['Wild Swans', 'Jung Chang'],
  ['Balzac and the Little Chinese Seamstress', 'Dai Sijie'],
  ['The Elegance of the Hedgehog', 'Muriel Barbery'],
  ['Suite Francaise', 'Irene Nemirovsky'],
  ['The Little Paris Bookshop', 'Nina George'],
  ['Bonjour Tristesse', 'Francoise Sagan'],
  ['The Lover', 'Marguerite Duras'],
  ['Nausea', 'Jean-Paul Sartre'],
  ['The Master and Margarita', 'Mikhail Bulgakov'],
  ['We', 'Yevgeny Zamyatin'],
  ['Doctor Faustus', 'Thomas Mann'],
  ['All Quiet on the Western Front', 'Erich Maria Remarque'],
  ['The Book of Disquiet', 'Fernando Pessoa'],
  ['Blindness', 'Jose Saramago'],
  ['Snow', 'Orhan Pamuk'],
  ['My Name Is Red', 'Orhan Pamuk'],
  ['The Yacoubian Building', 'Alaa Al Aswany'],
  ['Palace Walk', 'Naguib Mahfouz'],
  ['Season of Migration to the North', 'Tayeb Salih'],
  ['Things Fall Apart', 'Chinua Achebe'],
  ['The God of Small Things', 'Arundhati Roy'],
  ['Midnights Children', 'Salman Rushdie'],
  ['A Suitable Boy', 'Vikram Seth'],
  ['The White Tiger', 'Aravind Adiga'],
  ['Like Water for Chocolate', 'Laura Esquivel'],
  ['Pedro Paramo', 'Juan Rulfo'],
  ['The Aleph', 'Jorge Luis Borges'],
  ['Hopscotch', 'Julio Cortazar'],
  ['2666', 'Roberto Bolano'],
  ['The Time of the Doves', 'Merce Rodoreda'],
  ['Independent People', 'Halldor Laxness'],
  ['Smillas Sense of Snow', 'Peter Hoeg'],
  ['The Unbearable Lightness of Being', 'Milan Kundera'],
  ['The Good Soldier Svejk', 'Jaroslav Hasek'],
  ['Solaris', 'Stanislaw Lem'],
];

const LISTS = { classics: CLASSICS, modern: MODERN, world: WORLD };

function readKey() {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY\s*=\s*(.+)\s*$/);
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '');
  }
  throw new Error('EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY not found in .env');
}

const KEY = readKey();

// Google Books answers 5xx often enough that a single try loses whole entries.
async function gbGet(url, attempts = 5) {
  let lastStatus = 0;
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    lastStatus = res.status;
    if (res.status < 500 && res.status !== 429) break;
    await new Promise((r) => setTimeout(r, 600 * (i + 1)));
  }
  throw new Error(`Google Books failed (${lastStatus})`);
}

function coverUrl(links) {
  const raw = links?.thumbnail ?? links?.smallThumbnail;
  if (!raw) return null;
  return `${raw.replace(/^http:\/\//, 'https://').replace(/&edge=curl/gi, '')}&fife=w640`;
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Prefers a real, recent, commercially published edition, because those are the
// ones with a designed cover rather than a scanned title page.
function score(volume) {
  const info = volume.volumeInfo ?? {};
  if (!info.imageLinks) return -1;
  const year = Number(String(info.publishedDate ?? '').slice(0, 4));
  let points = 0;
  if (info.publisher) points += 3;
  if ((info.industryIdentifiers ?? []).some((i) => i.type === 'ISBN_13')) points += 3;
  if (info.description && info.description.length > 200) points += 2;
  if (Number.isFinite(year)) {
    if (year >= 2010) points += 4;
    else if (year >= 2000) points += 3;
    else if (year >= 1990) points += 1;
  }
  if (info.language === 'en') points += 1;
  if ((info.pageCount ?? 0) > 80) points += 1;
  return points;
}

async function resolve(title, author) {
  const q = `intitle:"${title}" inauthor:"${author}"`;
  const url =
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}` +
    `&maxResults=20&printType=books&orderBy=relevance&key=${KEY}`;
  const data = await gbGet(url);
  const items = data.items ?? [];
  let best = null;
  let bestScore = 0;
  for (const item of items) {
    const points = score(item);
    if (points > bestScore) {
      best = item;
      bestScore = points;
    }
  }
  if (!best) return null;
  const info = best.volumeInfo;
  const year = Number(String(info.publishedDate ?? '').slice(0, 4));
  return {
    id: best.id,
    title: info.title ?? title,
    year: Number.isFinite(year) ? year : null,
    genreIds: [],
    genres: (info.categories ?? []).slice(0, 4).map((c) => c.split('/').pop().trim()),
    posterPath: coverUrl(info.imageLinks),
    backdropPath: null,
    overview: stripHtml(info.description ?? ''),
    voteAverage: info.averageRating ? Math.round(info.averageRating * 2 * 10) / 10 : 0,
    voteCount: info.ratingsCount ?? 0,
    popularity: 0,
    authors: info.authors ?? [author],
    mediaType: 'book',
  };
}

const out = {};
const missing = [];

for (const [listName, entries] of Object.entries(LISTS)) {
  out[listName] = [];
  for (const [title, author] of entries) {
    try {
      const book = await resolve(title, author);
      if (book) out[listName].push(book);
      else missing.push(`${listName}: ${title} / ${author} (no usable edition)`);
    } catch (err) {
      missing.push(`${listName}: ${title} / ${author} (${err.message})`);
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log(`${listName}: ${out[listName].length} / ${entries.length} resolved`);
}

writeFileSync(OUT_PATH, JSON.stringify(out), 'utf8');
console.log(`\nWritten to ${OUT_PATH}`);
if (missing.length) {
  console.log(`\nUnresolved (${missing.length}):`);
  for (const m of missing) console.log('  ' + m);
}
