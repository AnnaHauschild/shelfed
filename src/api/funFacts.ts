import { contentLanguage } from './tmdb';
import { MediaType } from './types';

type Localized = { en: string; de?: string };

// Our own paraphrasing of well-documented trivia (facts themselves aren't
// copyrightable), keyed by `${mediaType}:${tmdbId}`. A missing title simply shows
// no bulb. English is the fallback for any app language without its own line.
// Grow this map anytime; new entries ship via OTA without a store build.
const FACTS: Record<string, Localized> = {
  'movie:155': {
    en: 'Heath Ledger shut himself in a hotel room for weeks and kept a Joker diary to build the character.',
    de: 'Heath Ledger verzog sich wochenlang allein in ein Hotelzimmer und führte ein Joker-Tagebuch, um die Rolle zu finden.',
  },
  'movie:597': {
    en: 'The hand that sketches Rose belongs to director James Cameron himself, not Leonardo DiCaprio.',
    de: 'Die Hand, die Rose zeichnet, gehört Regisseur James Cameron selbst, nicht Leonardo DiCaprio.',
  },
  'movie:120': {
    en: 'Viggo Mortensen broke two toes kicking an orc helmet, and his real cry of pain stayed in the film.',
    de: 'Viggo Mortensen brach sich beim Tritt gegen einen Orc-Helm zwei Zehen, und sein echter Schmerzensschrei blieb im Film.',
  },
  'movie:578': {
    en: 'The mechanical shark kept breaking down, so Spielberg barely showed it, which made the film scarier.',
    de: 'Der mechanische Hai streikte ständig, also zeigte Spielberg ihn kaum, was den Film gerade dadurch spannender machte.',
  },
  'movie:603': {
    en: 'The green Matrix code is made of mirrored characters taken from Japanese sushi recipes.',
    de: 'Der grüne Matrix-Code besteht aus gespiegelten Zeichen japanischer Sushi-Rezepte.',
  },
  'movie:105': {
    en: 'Marty McFly was filmed for weeks with Eric Stoltz before he was recast with Michael J. Fox.',
    de: 'Marty McFly wurde zuerst wochenlang mit Eric Stoltz gedreht, bevor man ihn durch Michael J. Fox ersetzte.',
  },
  'movie:348': {
    en: 'For the chestburster scene the cast was not told how bloody it would get, so their shock is real.',
    de: 'Bei der Chestburster-Szene wusste die Crew nicht, wie blutig es wird, daher ist das Entsetzen der Schauspieler echt.',
  },
  'movie:27205': {
    en: 'The rotating hallway fight was shot in a real, physically spinning set, not with CGI.',
    de: 'Der rotierende Hotelflur war ein echtes, sich drehendes Set, kein CGI.',
  },
  'movie:13': {
    en: 'Tom Hanks took no salary and chose profit participation instead, earning far more in the end.',
    de: 'Tom Hanks verzichtete auf Gage und nahm stattdessen Gewinnbeteiligung, und verdiente damit am Ende ein Vielfaches.',
  },
  'movie:680': {
    en: 'The adrenaline-shot scene was filmed in reverse: Travolta pulled the needle out, and played backward it looks like the stab.',
    de: 'Die Adrenalinspritzen-Szene wurde rückwärts gefilmt: Travolta zog die Nadel heraus, umgedreht wirkt es wie das Zustechen.',
  },
  'movie:863': {
    en: "A stray command nearly wiped Toy Story 2 from Pixar's servers; a staffer's home backup saved it.",
    de: 'Ein Befehl löschte fast den ganzen Toy Story 2 von Pixars Servern; gerettet hat ihn die Heim-Backup-Kopie einer Mitarbeiterin.',
  },
  'movie:694': {
    en: 'For "Here\'s Johnny!" the door was rebuilt several times because Jack Nicholson smashed through it too fast.',
    de: 'Für „Here\'s Johnny!" baute man die Tür mehrfach nach, weil Jack Nicholson sie zu schnell zertrümmerte.',
  },
};

/** A fun fact for this title in the app language (English fallback), or null. */
export function getFunFact(
  mediaType: MediaType,
  id: string | number,
): string | null {
  const entry = FACTS[`${mediaType}:${id}`];
  if (!entry) return null;
  const lang = contentLanguage().slice(0, 2).toLowerCase();
  if (lang === 'de' && entry.de) return entry.de;
  return entry.en;
}

/** Whether this title has a fun fact (drives the pulsing poster indicator). */
export function hasFunFact(mediaType: MediaType, id: string | number): boolean {
  return `${mediaType}:${id}` in FACTS;
}
