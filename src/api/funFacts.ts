import { contentLanguage } from './tmdb';
import { MediaType } from './types';

type Localized = { en: string; de?: string; source?: string };

export interface FunFact {
  text: string;
  /** Public page (Wikipedia) to read more / verify the fact. */
  source?: string;
}

// Our own paraphrasing of well-documented trivia (facts themselves aren't
// copyrightable), keyed by `${mediaType}:${tmdbId}`. A title without an entry simply
// shows no fact. English is the fallback for any app language without its own line.
// `source` links a public page to read more / verify. Grow this map anytime; new
// entries ship via OTA without a store build.
const FACTS: Record<string, Localized> = {
  'movie:155': {
    en: 'Heath Ledger shut himself in a hotel room for weeks and kept a Joker diary to build the character.',
    de: 'Heath Ledger verzog sich wochenlang allein in ein Hotelzimmer und führte ein Joker-Tagebuch, um die Rolle zu finden.',
    source:
      'https://en.wikipedia.org/wiki/The_Dark_Knight#:~:text=Joker%20diary',
  },
  'movie:597': {
    en: 'The nude drawing of Rose was made by director James Cameron himself, not by Leonardo DiCaprio.',
    de: 'Die Aktzeichnung von Rose stammt von Regisseur James Cameron selbst, nicht von Leonardo DiCaprio.',
    source:
      'https://en.wikipedia.org/wiki/Titanic_(1997_film)#:~:text=Cameron%20sketched%20Jack',
  },
  'movie:121': {
    en: 'Viggo Mortensen really broke two toes kicking an orc helmet, and that exact take is the one used in the film.',
    de: 'Viggo Mortensen brach sich beim Tritt gegen einen Ork-Helm tatsächlich zwei Zehen, und genau diese Aufnahme kam in den Film.',
    source:
      'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings:_The_Two_Towers#:~:text=broke%20two%20toes%20when%20he%20kicked%20an%20Orc%20helmet',
  },
  'movie:578': {
    en: 'The mechanical shark kept breaking down, so Spielberg barely showed it, which made the film scarier.',
    de: 'Der mechanische Hai streikte ständig, also zeigte Spielberg ihn kaum, was den Film gerade dadurch spannender machte.',
    source:
      'https://en.wikipedia.org/wiki/Jaws_(film)#:~:text=unreliable%20mechanical%20sharks',
  },
  'movie:603': {
    en: 'The green Matrix code is made of mirrored characters taken from Japanese sushi recipes.',
    de: 'Der grüne Matrix-Code besteht aus gespiegelten Zeichen japanischer Sushi-Rezepte.',
    source:
      'https://en.wikipedia.org/wiki/The_Matrix#:~:text=sushi%20recipes',
  },
  'movie:105': {
    en: 'Marty McFly was filmed for weeks with Eric Stoltz before he was recast with Michael J. Fox.',
    de: 'Marty McFly wurde zuerst wochenlang mit Eric Stoltz gedreht, bevor man ihn durch Michael J. Fox ersetzte.',
    source:
      'https://en.wikipedia.org/wiki/Back_to_the_Future#:~:text=Eric%20Stoltz%20was%20cast%20as%20Marty',
  },
  'movie:348': {
    en: 'For the chestburster scene the cast was not told how bloody it would get, so their shock is real.',
    de: 'Bei der Chestburster-Szene wussten die Darsteller nicht, wie blutig es wird, daher ist ihr Entsetzen echt.',
    source:
      'https://en.wikipedia.org/wiki/Alien_(film)#:~:text=not%20been%20told%20that%20fake%20blood',
  },
  'movie:27205': {
    en: 'The rotating hallway fight was shot in a real, physically spinning set, not with CGI.',
    de: 'Der rotierende Hotelflur war ein echtes, sich drehendes Set, kein CGI.',
    source:
      'https://en.wikipedia.org/wiki/Inception#:~:text=giant%20hamster%20wheel',
  },
  'movie:13': {
    en: 'Tom Hanks took no salary and chose profit participation instead, earning far more in the end.',
    de: 'Tom Hanks verzichtete auf Gage und nahm stattdessen Gewinnbeteiligung, und verdiente damit am Ende ein Vielfaches.',
    source:
      'https://en.wikipedia.org/wiki/Forrest_Gump#:~:text=gross%20receipts%20instead%20of%20a%20salary',
  },
  'movie:680': {
    en: 'The adrenaline-shot scene was inspired by a true story from a Scorsese documentary, in which a man really revived an overdose victim with a shot to the heart.',
    de: 'Die Adrenalinspritzen-Szene beruht auf einer wahren Geschichte aus einer Scorsese-Doku, in der ein Mann ein Überdosis-Opfer wirklich mit einem Stich ins Herz wiederbelebte.',
    source:
      'https://en.wikipedia.org/wiki/Pulp_Fiction#:~:text=adrenaline%20scene%20was%20inspired',
  },
  'movie:863': {
    en: "A stray command nearly wiped Toy Story 2 from Pixar's servers; a staffer's home backup saved it.",
    de: 'Ein Befehl löschte fast den ganzen Toy Story 2 von Pixars Servern; gerettet hat ihn die Heim-Backup-Kopie einer Mitarbeiterin.',
    source:
      'https://en.wikipedia.org/wiki/Toy_Story_2#:~:text=backup%20copy%20of%20the%20film%20on%20her%20home%20computer',
  },
  'movie:694': {
    en: 'For "Here\'s Johnny!" the prop door was swapped for a real one because Jack Nicholson, a trained firefighter, smashed through it too fast.',
    de: 'Für „Here’s Johnny!“ ersetzte man die Requisiten-Tür durch eine echte, weil Jack Nicholson, ausgebildeter Feuerwehrmann, sie zu schnell zertrümmerte.',
    source:
      'https://en.wikipedia.org/wiki/The_Shining_(film)#:~:text=tore%20through%20it%20too%20quickly',
  },
  'movie:329': {
    en: 'The ripples in the glass of water were made by a crew member lying under the car, plucking guitar strings run through it.',
    de: 'Die Wellen im Wasserglas entstanden, weil ein Crewmitglied unter dem Auto lag und an durchgezogenen Gitarrensaiten zupfte.',
    source:
      'https://en.wikipedia.org/wiki/Jurassic_Park#:~:text=put%20a%20glass%20of%20water%20on%20his%20guitar',
  },
  'movie:630': {
    en: 'The first Tin Man had to leave the film after the aluminium dust in his make-up poisoned him, yet his singing voice stayed in the group numbers.',
    de: 'Der erste Blechmann musste den Film verlassen, weil ihn der Aluminiumstaub in seinem Make-up vergiftete; seine Singstimme blieb trotzdem in den Chorstücken.',
    source:
      'https://en.wikipedia.org/wiki/The_Wizard_of_Oz#:~:text=toxic%20reaction%20after%20repeatedly%20inhaling',
  },
  'movie:238': {
    en: 'The horse head in the bed was real. It came from a dog food company, from an animal that was going to be slaughtered anyway.',
    de: 'Der Pferdekopf im Bett war echt. Er stammte von einer Hundefutterfirma, von einem Tier, das ohnehin geschlachtet werden sollte.',
    source:
      'https://en.wikipedia.org/wiki/The_Godfather#:~:text=obtained%20from%20a%20dog-food%20company',
  },
  'movie:278': {
    en: 'For the escape through the sewage pipe, Tim Robbins crawled through a mixture of water, chocolate syrup and sawdust.',
    de: 'Für die Flucht durch das Abwasserrohr kroch Tim Robbins durch eine Mischung aus Wasser, Schokoladensirup und Sägemehl.',
    source:
      'https://en.wikipedia.org/wiki/The_Shawshank_Redemption#:~:text=water%2C%20chocolate%20syrup%2C%20and%20sawdust',
  },
  'movie:274': {
    en: 'It was only the third film ever to win all five major Oscars: picture, director, actor, actress and screenplay.',
    de: 'Er war erst der dritte Film überhaupt, der alle fünf großen Oscars gewann: Film, Regie, Hauptdarsteller, Hauptdarstellerin und Drehbuch.',
    source:
      'https://en.wikipedia.org/wiki/The_Silence_of_the_Lambs_(film)#:~:text=only%20the%20third%20film%20in%20history',
  },
  'movie:539': {
    en: 'It showed the first flushing toilet in mainstream American film and television. The censors objected to it.',
    de: 'Er zeigte die erste Toilettenspülung im amerikanischen Kino und Fernsehen. Die Zensur nahm daran Anstoß.',
    source:
      'https://en.wikipedia.org/wiki/Psycho_(1960_film)#:~:text=No%20flushing%20toilet%20had%20appeared%20in%20mainstream',
  },
  'movie:11': {
    en: 'Tatooine was originally meant to be a jungle planet. Lucas made it a desert because he did not fancy months of shooting in the jungle.',
    de: 'Tatooine sollte ursprünglich ein Dschungelplanet sein. Lucas machte eine Wüste daraus, weil er keine Lust auf monatelange Dreharbeiten im Dschungel hatte.',
    source:
      'https://en.wikipedia.org/wiki/Star_Wars_(film)#:~:text=Lucas%20envisioned%20Tatooine%20as%20a%20jungle%20planet',
  },
  'movie:601': {
    en: 'The film was shot under the fake title "A Boy\u2019s Life". Actors read the script behind closed doors and everyone on set needed an ID card.',
    de: 'Gedreht wurde unter dem Tarntitel „A Boy\u2019s Life". Die Schauspieler lasen das Drehbuch hinter verschlossenen Türen, alle am Set brauchten einen Ausweis.',
    source:
      'https://en.wikipedia.org/wiki/E.T._the_Extra-Terrestrial#:~:text=filmed%20under%20the%20cover%20name',
  },
  'movie:98': {
    en: 'For the opening battle Ridley Scott burned down a piece of English forest. He had permission: the section was due to be cleared anyway.',
    de: 'Für die Eröffnungsschlacht brannte Ridley Scott ein Stück englischen Wald nieder. Mit Erlaubnis: Der Abschnitt sollte ohnehin gerodet werden.',
    source:
      'https://en.wikipedia.org/wiki/Gladiator_(2000_film)#:~:text=obtained%20permission%20to%20burn%20it%20down',
  },
  'movie:550': {
    en: 'Long before the narrator meets Tyler, he already flickers through the film in single frames, blurred in the background.',
    de: 'Lange bevor der Erzähler Tyler trifft, blitzt der schon in einzelnen Bildern auf, unscharf im Hintergrund.',
    source:
      'https://en.wikipedia.org/wiki/Fight_Club#:~:text=single%20frames%20for%20subliminal%20effect',
  },
  'movie:157336': {
    en: 'The robots TARS and CASE were real props, physically operated on set by actor Bill Irwin, who was then digitally erased.',
    de: 'Die Roboter TARS und CASE waren echte Requisiten, die Schauspieler Bill Irwin am Set führte. Er wurde danach digital wegretuschiert.',
    source:
      'https://en.wikipedia.org/wiki/Interstellar_(film)#:~:text=physically%20controlled%20both%20robots',
  },
  'movie:496243': {
    en: 'Both homes were sets. The Kims\u2019 semi-basement flat and its street were built from scratch, partly so they could be flooded.',
    de: 'Beide Wohnungen waren Kulissen. Die Souterrainwohnung der Kims und ihre Straße wurden neu gebaut, auch damit man sie fluten konnte.',
    source:
      'https://en.wikipedia.org/wiki/Parasite_(2019_film)#:~:text=necessity%20for%20the%20flooding%20scenes',
  },
  'movie:85': {
    en: 'In the bazaar a swordsman shows off his blade work and Indy just pulls his gun. The long fight was rehearsed for weeks, but Harrison Ford was ill with dysentery.',
    de: 'Auf dem Basar führt ein Schwertkämpfer seine Säbelkünste vor, Indy zieht einfach die Pistole. Der lange Kampf war wochenlang einstudiert, aber Harrison Ford war an Ruhr erkrankt.',
    source:
      'https://en.wikipedia.org/wiki/Raiders_of_the_Lost_Ark#:~:text=shorten%20the%20fight%20scene%20significantly',
  },
  'movie:8587': {
    en: 'A wildlife expert brought live lions into the studio so the animators could see how the real animals move.',
    de: 'Ein Tierexperte brachte lebende Löwen ins Studio, damit die Zeichner sehen konnten, wie sich die echten Tiere bewegen.',
    source:
      'https://en.wikipedia.org/wiki/The_Lion_King#:~:text=with%20an%20assortment%20of%20lions',
  },
  'movie:280': {
    en: 'The liquid metal T-1000 adds up to about five minutes of screen time. Rendering 15 seconds of it could take ten days.',
    de: 'Der flüssige T-1000 ist insgesamt etwa fünf Minuten zu sehen. Für 15 Sekunden davon rechneten die Computer bis zu zehn Tage.',
    source:
      'https://en.wikipedia.org/wiki/Terminator_2:_Judgment_Day#:~:text=rendering%2015%20seconds%20of%20footage%20took%20up%20to%20ten%20days',
  },
  'movie:771': {
    en: 'Joe Pesci deliberately kept his distance from Macaulay Culkin off camera so the hostility between them would stay believable.',
    de: 'Joe Pesci ging Macaulay Culkin abseits der Kamera bewusst aus dem Weg, damit die Feindschaft zwischen beiden glaubwürdig blieb.',
    source:
      'https://en.wikipedia.org/wiki/Home_Alone#:~:text=intentionally%20limited%20my%20interactions%20with%20him',
  },
  'movie:387': {
    en: 'One morning the U-boat mock-up was no longer in the harbour. It had been rented out to Steven Spielberg, filming Raiders of the Lost Ark nearby, and nobody had told the crew.',
    de: 'Eines Morgens lag die U-Boot-Attrappe nicht mehr im Hafen. Sie war an Steven Spielberg vermietet worden, der nebenan Jäger des verlorenen Schatzes drehte. Nur hatte das niemand der Crew gesagt.',
    source:
      'https://en.wikipedia.org/wiki/Das_Boot#:~:text=had%20rented%20the%20mock-up%20for%20his%20own%20film',
  },
  'movie:129': {
    en: 'The bathhouse goes back to a real one from Miyazaki\u2019s childhood, where a small door beside a tub always made him wonder what was behind it.',
    de: 'Das Badehaus geht auf ein echtes aus Miyazakis Kindheit zurück. Neben einer Wanne war eine kleine Tür, hinter der er als Kind immer etwas vermutete.',
    source:
      'https://en.wikipedia.org/wiki/Spirited_Away#:~:text=small%20door%20next%20to%20one%20of%20the%20bathtubs',
  },
  'movie:194': {
    en: 'The part was written for English actress Emily Watson. Her French was not strong enough and she was booked elsewhere, so the role became French.',
    de: 'Die Rolle war für die englische Schauspielerin Emily Watson geschrieben. Ihr Französisch reichte nicht und sie war anderweitig gebunden, also wurde Amélie Französin.',
    source:
      'https://en.wikipedia.org/wiki/Am%C3%A9lie#:~:text=for%20the%20English%20actress%20Emily%20Watson',
  },
  'movie:104': {
    en: 'The names in the closing credits scroll downwards. Normally credits travel up the screen.',
    de: 'Die Namen im Abspann wandern nach unten. Normalerweise laufen sie nach oben aus dem Bild.',
    source:
      'https://de.wikipedia.org/wiki/Lola_rennt#:~:text=l%C3%A4uft%20von%20oben%20nach%20unten',
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
