import { contentLanguage } from './tmdb';
import { MediaType } from './types';

type Localized = { en: string; de?: string; source?: string };

export interface FunFact {
  text: string;
  /** Public page (Wikipedia) to read more / verify the fact. */
  source?: string;
}

// Our own paraphrasing of well-documented trivia (facts themselves aren't
// copyrightable), keyed by `${mediaType}:${tmdbId}`. A missing title simply shows
// no bulb. English is the fallback for any app language without its own line.
// `source` links a public page to read more / verify. Grow this map anytime; new
// entries ship via OTA without a store build.
const FACTS: Record<string, Localized> = {
  'movie:155': {
    en: 'Heath Ledger shut himself in a hotel room for weeks and kept a Joker diary to build the character.',
    de: 'Heath Ledger verzog sich wochenlang allein in ein Hotelzimmer und führte ein Joker-Tagebuch, um die Rolle zu finden.',
    source: 'https://en.wikipedia.org/wiki/The_Dark_Knight',
  },
  'movie:597': {
    en: 'The hand that sketches Rose belongs to director James Cameron himself, not Leonardo DiCaprio.',
    de: 'Die Hand, die Rose zeichnet, gehört Regisseur James Cameron selbst, nicht Leonardo DiCaprio.',
    source: 'https://en.wikipedia.org/wiki/Titanic_(1997_film)',
  },
  'movie:121': {
    en: 'Viggo Mortensen broke two toes kicking an orc helmet, and his real cry of pain stayed in the film.',
    de: 'Viggo Mortensen brach sich beim Tritt gegen einen Orc-Helm zwei Zehen, und sein echter Schmerzensschrei blieb im Film.',
    source:
      'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings:_The_Two_Towers',
  },
  'movie:578': {
    en: 'The mechanical shark kept breaking down, so Spielberg barely showed it, which made the film scarier.',
    de: 'Der mechanische Hai streikte ständig, also zeigte Spielberg ihn kaum, was den Film gerade dadurch spannender machte.',
    source: 'https://en.wikipedia.org/wiki/Jaws_(film)',
  },
  'movie:603': {
    en: 'The green Matrix code is made of mirrored characters taken from Japanese sushi recipes.',
    de: 'Der grüne Matrix-Code besteht aus gespiegelten Zeichen japanischer Sushi-Rezepte.',
    source: 'https://en.wikipedia.org/wiki/The_Matrix',
  },
  'movie:105': {
    en: 'Marty McFly was filmed for weeks with Eric Stoltz before he was recast with Michael J. Fox.',
    de: 'Marty McFly wurde zuerst wochenlang mit Eric Stoltz gedreht, bevor man ihn durch Michael J. Fox ersetzte.',
    source: 'https://en.wikipedia.org/wiki/Back_to_the_Future',
  },
  'movie:348': {
    en: 'For the chestburster scene the cast was not told how bloody it would get, so their shock is real.',
    de: 'Bei der Chestburster-Szene wusste die Crew nicht, wie blutig es wird, daher ist das Entsetzen der Schauspieler echt.',
    source: 'https://en.wikipedia.org/wiki/Alien_(film)',
  },
  'movie:27205': {
    en: 'The rotating hallway fight was shot in a real, physically spinning set, not with CGI.',
    de: 'Der rotierende Hotelflur war ein echtes, sich drehendes Set, kein CGI.',
    source: 'https://en.wikipedia.org/wiki/Inception',
  },
  'movie:13': {
    en: 'Tom Hanks took no salary and chose profit participation instead, earning far more in the end.',
    de: 'Tom Hanks verzichtete auf Gage und nahm stattdessen Gewinnbeteiligung, und verdiente damit am Ende ein Vielfaches.',
    source: 'https://en.wikipedia.org/wiki/Forrest_Gump',
  },
  'movie:680': {
    en: 'The adrenaline-shot scene was inspired by a true story from a Scorsese documentary, in which a man really revived an overdose victim with a shot to the heart.',
    de: 'Die Adrenalinspritzen-Szene beruht auf einer wahren Geschichte aus einer Scorsese-Doku, in der ein Mann ein Überdosis-Opfer wirklich mit einem Stich ins Herz wiederbelebte.',
    source: 'https://en.wikipedia.org/wiki/Pulp_Fiction',
  },
  'movie:863': {
    en: "A stray command nearly wiped Toy Story 2 from Pixar's servers; a staffer's home backup saved it.",
    de: 'Ein Befehl löschte fast den ganzen Toy Story 2 von Pixars Servern; gerettet hat ihn die Heim-Backup-Kopie einer Mitarbeiterin.',
    source: 'https://en.wikipedia.org/wiki/Toy_Story_2',
  },
  'movie:694': {
    en: 'For "Here\'s Johnny!" the prop door was swapped for a real one because Jack Nicholson, a trained firefighter, smashed through it too fast.',
    de: 'Für „Here\'s Johnny!" ersetzte man die Requisiten-Tür durch eine echte, weil Jack Nicholson, ausgebildeter Feuerwehrmann, sie zu schnell zertrümmerte.',
    source: 'https://en.wikipedia.org/wiki/The_Shining_(film)',
  },
};

/** A fun fact for this title in the app language (English fallback), or null. */
export function getFunFact(
  mediaType: MediaType,
  id: string | number,
): FunFact | null {
  const entry = FACTS[`${mediaType}:${id}`];
  if (!entry) return null;
  const lang = contentLanguage().slice(0, 2).toLowerCase();
  const text = lang === 'de' && entry.de ? entry.de : entry.en;
  return { text, source: entry.source };
}

/** Whether this title has a fun fact (drives the pulsing poster indicator). */
export function hasFunFact(mediaType: MediaType, id: string | number): boolean {
  return `${mediaType}:${id}` in FACTS;
}
