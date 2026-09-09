import { AppLanguage } from '../constants/languages';
import { contentLanguage } from './tmdb';
import { MediaType } from './types';

/** The fact in each app language plus the source link. `en` is required and
 *  serves as the fallback for any language not filled in yet. */
type Localized = Partial<Record<AppLanguage, string>> & {
  en: string;
  source?: string;
};

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
    en: 'The green code is made of mirrored Japanese characters, letters and digits. Its designer likes to say it consists of Japanese sushi recipes.',
    de: 'Der grüne Code besteht aus gespiegelten japanischen Schriftzeichen, Buchstaben und Ziffern. Sein Gestalter sagt gern, er bestehe aus japanischen Sushi-Rezepten.',
    source:
      'https://en.wikipedia.org/wiki/The_Matrix#:~:text=made%20out%20of%20Japanese%20sushi%20recipes',
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
    de: 'Gedreht wurde unter dem Tarntitel „A Boy\u2019s Life\u201c. Die Schauspieler lasen das Drehbuch hinter verschlossenen Türen, alle am Set brauchten einen Ausweis.',
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
    en: 'The shape-shifting liquid metal villain is on screen for only about five minutes in total. Rendering 15 seconds of him could take ten days.',
    de: 'Der flüssige Metallgegner, der jede Gestalt annehmen kann, ist zusammengerechnet nur etwa fünf Minuten zu sehen. Für 15 Sekunden davon rechneten die Computer bis zu zehn Tage.',
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
  'movie:613': {
    en: 'The ruined Berlin is mostly Saint Petersburg. A run-down industrial district by a canal stood in for the bombed capital.',
    de: 'Das zerstörte Berlin ist zum großen Teil Sankt Petersburg. Ein heruntergekommenes Industrieviertel am Kanal spielte die zerbombte Hauptstadt.',
    source:
      'https://en.wikipedia.org/wiki/Downfall_(2004_film)#:~:text=used%20to%20portray%20the%20historical%20setting%20in%20Berlin',
  },
  'movie:76341': {
    en: 'The guitarist strapped to the front of the war rig plays a real instrument that really shoots flames. None of his scenes are computer generated.',
    de: 'Der Gitarrist, der vorn am Kriegstruck hängt, spielt ein echtes Instrument, das wirklich Feuer speit. Keine seiner Szenen entstand am Computer.',
    source:
      'https://en.wikipedia.org/wiki/Mad_Max:_Fury_Road#:~:text=guitar%20shoots%20fire',
  },
  'movie:289': {
    en: 'The plane in the farewell scene is a cardboard model, made to look bigger by small extras standing around it. The famous fog hides that it is fake.',
    de: 'Das Flugzeug in der Abschiedsszene ist ein Pappmodell. Kleinwüchsige Statisten daneben ließen es größer wirken, der berühmte Nebel verdeckte den Rest.',
    source:
      'https://en.wikipedia.org/wiki/Casablanca_(film)#:~:text=proportionate%20cardboard%20plane',
  },
  'movie:78': {
    en: 'The sunny landscape shots in the original ending are leftover aerial footage Stanley Kubrick had filmed for The Shining.',
    de: 'Die sonnigen Landschaftsaufnahmen im ursprünglichen Ende sind übrig gebliebene Luftaufnahmen, die Stanley Kubrick für Shining gedreht hatte.',
    source:
      'https://en.wikipedia.org/wiki/Blade_Runner#:~:text=surplus%20helicopter%20aerial%20photography',
  },
  'movie:37165': {
    en: 'The first version of the script was called The Malcolm Show. It was a science fiction thriller set in New York, not a comedy.',
    de: 'Die erste Fassung des Drehbuchs hieß The Malcolm Show. Sie war ein Science-Fiction-Thriller, der in New York spielte, keine Komödie.',
    source:
      'https://en.wikipedia.org/wiki/The_Truman_Show#:~:text=with%20the%20story%20set%20in%20New%20York%20City',
  },
  'movie:671': {
    en: 'An American boy was seen as the favourite to play Harry. Rowling insisted on British actors and rang the director to make sure he was not cast.',
    de: 'Als Favorit für die Harry-Rolle galt ein amerikanischer Junge. Rowling bestand auf britischen Darstellern und rief den Regisseur an, damit er ihn nicht besetzt.',
    source:
      'https://en.wikipedia.org/wiki/Harry_Potter_and_the_Philosopher%27s_Stone_(film)#:~:text=even%20called%20Columbus%20to%20confirm',
  },
  'movie:338': {
    en: 'Filming at the dacha was called off once because of rain and another time because a pack of wild boar had wrecked the garden.',
    de: 'Der Dreh an der Datsche fiel einmal wegen Regen aus und ein anderes Mal, weil eine Rotte Wildschweine den Garten verwüstet hatte.',
    source:
      'https://de.wikipedia.org/wiki/Good_Bye,_Lenin!#:~:text=Rotte%20Wildschweine',
  },
  'movie:120467': {
    en: 'The hotel lobby is an empty department store in Görlitz in eastern Germany. Wes Anderson even considered buying the building to save it from demolition.',
    de: 'Die Hotelhalle ist ein leerstehendes Kaufhaus in Görlitz. Wes Anderson überlegte sogar, das Gebäude zu kaufen, um es vor dem Abriss zu retten.',
    source:
      'https://en.wikipedia.org/wiki/The_Grand_Budapest_Hotel#:~:text=considered%20buying%20the%20Warenhaus%20to%20save%20it',
  },
  'movie:62': {
    en: 'The weightlessness was made by hanging the actors on wires from the top of the set and filming from directly below. Their own bodies hid the wires.',
    de: 'Die Schwerelosigkeit entstand, indem die Darsteller an Seilen von der Decke hingen und von unten gefilmt wurden. Ihre eigenen Körper verdeckten die Seile.',
    source:
      'https://en.wikipedia.org/wiki/2001:_A_Space_Odyssey#:~:text=suspending%20the%20actors%20from%20wires',
  },
  'movie:807': {
    en: 'For deeper blacks the film was put through a costly chemical process. Only a few hundred of the 2,500 cinema prints got it, so most audiences saw a different looking film.',
    de: 'Für tiefere Schwarztöne wurde das Filmmaterial aufwendig chemisch behandelt. Nur ein paar Hundert der 2.500 Kinokopien bekamen das, die meisten Zuschauer sahen also einen anders aussehenden Film.',
    source:
      'https://en.wikipedia.org/wiki/Seven_(1995_film)#:~:text=only%20a%20few%20hundred%20used%20the%20process',
  },
  'movie:12': {
    en: 'The shark is named Bruce after the mechanical shark in Jaws, which that crew had nicknamed after Spielberg\u2019s lawyer.',
    de: 'Der Hai heißt Bruce, nach dem mechanischen Hai aus Der weiße Hai. Den hatte die Crew damals nach Spielbergs Anwalt benannt.',
    source:
      'https://en.wikipedia.org/wiki/Finding_Nemo#:~:text=after%20Bruce%20Ramer',
  },
  'movie:620': {
    en: 'The shoot blocked New York streets at rush hour. When angry locals asked who was responsible, a producer told them it was Francis Ford Coppola shooting another film.',
    de: 'Der Dreh blockierte New Yorker Straßen im Berufsverkehr. Als wütende Anwohner fragten, wer daran schuld sei, erzählte ein Produzent ihnen, das sei Francis Ford Coppola mit einem anderen Film.',
    source:
      'https://en.wikipedia.org/wiki/Ghostbusters#:~:text=he%20blamed%20Francis%20Ford%20Coppola',
  },
  'movie:244786': {
    en: 'Many of the band were real music students, and the director set out to capture their genuine fear of the raging conductor. Between takes the actor was reportedly very gentle.',
    de: 'Viele in der Filmband waren echte Musikstudenten, und der Regisseur fing gezielt ihre echte Angst vor dem tobenden Dirigenten ein. Zwischen den Aufnahmen war der Darsteller angeblich ausgesprochen freundlich.',
    source:
      'https://en.wikipedia.org/wiki/Whiplash_(2014_film)#:~:text=expressions%20of%20fear%20and%20anxiety',
  },
  'movie:745': {
    en: 'Bruce Willis took the part as compensation for a production that had collapsed with him a year earlier.',
    de: 'Bruce Willis übernahm die Rolle als Ausgleich für eine Produktion, die ein Jahr zuvor mit ihm geplatzt war.',
    source:
      'https://en.wikipedia.org/wiki/The_Sixth_Sense#:~:text=compensate%20the%20studio%20for',
  },
  'movie:862': {
    en: 'Disney halted production because Woody had turned into an unpleasant tyrant. Pixar spent three months rewriting him into a leader, paid for out of Steve Jobs\u2019 own pocket.',
    de: 'Disney stoppte die Produktion, weil Woody zu einem unangenehmen Tyrannen geworden war. Pixar schrieb ihn in drei Monaten zum Anführer um, bezahlt aus Steve Jobs eigener Tasche.',
    source:
      'https://en.wikipedia.org/wiki/Toy_Story#:~:text=Woody%20transformed%20from%20a%20tyrant%20to%20a%20wise%20leader',
  },
  'movie:769': {
    en: 'One of the investigators is played by the real prosecutor who handled the case. He got the part after a casual remark, and his scene was improvised.',
    de: 'Einer der Ermittler wird vom echten Staatsanwalt gespielt, der den Fall damals führte. Er kam durch eine beiläufige Bemerkung zur Rolle, seine Szene war improvisiert.',
    source:
      'https://en.wikipedia.org/wiki/Goodfellas#:~:text=cast%20on%20a%20whim',
  },
  'movie:19': {
    en: 'The vast city was built as models. Angled mirrors made the actors look as if they stood inside the tiny sets, a trick Hitchcock borrowed two years later.',
    de: 'Die riesige Stadt bestand aus Modellen. Schräg gestellte Spiegel ließen die Darsteller wirken, als stünden sie in den winzigen Kulissen. Hitchcock übernahm den Trick zwei Jahre später.',
    source:
      'https://en.wikipedia.org/wiki/Metropolis_(1927_film)#:~:text=mirrors%20are%20used%20to%20create%20the%20illusion',
  },
  'movie:872': {
    en: 'It is often said that milk was mixed into the rain so it would show on camera. That is a myth. The effect came from backlighting.',
    de: 'Oft heißt es, dem Regen sei Milch beigemischt worden, damit man ihn besser sieht. Das ist ein Mythos, der Effekt entstand durch Gegenlicht.',
    source:
      'https://en.wikipedia.org/wiki/Singin%27_in_the_Rain#:~:text=the%20rain%20was%20mixed%20with%20milk',
  },
  'movie:808': {
    en: 'Mike Myers had already recorded the whole part when he asked to do it again in a Scottish accent. The studio agreed and scrapped finished animation for it.',
    de: 'Mike Myers hatte die Rolle schon komplett eingesprochen, als er darum bat, sie noch einmal mit schottischem Akzent zu machen. Das Studio stimmte zu und verwarf dafür fertige Animation.',
    source:
      'https://en.wikipedia.org/wiki/Shrek#:~:text=re-record%20all%20of%20his%20lines%20with%20a',
  },
  'movie:120': {
    en: 'The costume department deliberately wore the clothing out so it would look old and used. Around 19,000 costumes were made.',
    de: 'Die Kostümabteilung trug die Kleidung gezielt ab, damit sie alt und benutzt aussieht. Rund 19.000 Kostüme entstanden so.',
    source:
      'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings:_The_Fellowship_of_the_Ring#:~:text=wearing%20them%20out%20for%20an%20impression%20of%20age',
  },
  'movie:28': {
    en: 'Coppola offered the direction to George Lucas first. Lucas was busy with another project: he had just been given the go-ahead for Star Wars.',
    de: 'Coppola bot George Lucas die Regie an. Der war mit einem anderen Projekt beschäftigt: Er hatte gerade grünes Licht für Star Wars bekommen.',
    source:
      'https://en.wikipedia.org/wiki/Apocalypse_Now#:~:text=had%20gotten%20the%20go-ahead%20to%20make',
  },
  'tv:1399': {
    en: 'The original pilot was received so poorly at a private screening that HBO demanded about 90 percent of the episode be reshot, with changes to the cast and director.',
    de: 'Die ursprüngliche Pilotfolge kam bei einer privaten Vorführung so schlecht an, dass HBO rund 90 Prozent der Folge neu drehen ließ und Besetzung sowie Regie änderte.',
    pt: 'O piloto original foi tão mal recebido em uma exibição privada que a HBO exigiu refilmar cerca de 90 por cento do episódio, com mudanças no elenco e na direção.',
    fr: 'Le pilote original fut si mal reçu lors d’une projection privée que HBO exigea de retourner environ 90 pour cent de l’épisode, avec des changements de distribution et de réalisateur.',
    es: 'El piloto original tuvo tan mala acogida en una proyección privada que HBO exigió volver a rodar cerca del 90 por ciento del episodio, con cambios en el reparto y la dirección.',
    it: 'Il pilot originale fu accolto così male durante una proiezione privata che HBO impose di rigirare circa il 90 per cento dell’episodio, cambiando parte del cast e il regista.',
    source:
      'https://en.wikipedia.org/wiki/Game_of_Thrones#:~:text=after%20its%20poor%20reception%20following%20a%20private%20viewing%2C%20HBO%20demanded%20an%20extensive%20re-shoot',
  },
  'tv:60059': {
    en: 'At the start of every season, a writer rewatched all 62 episodes of Breaking Bad to make sure the new scripts created no continuity conflicts.',
    de: 'Zu Beginn jeder Staffel sah sich ein Autor alle 62 Folgen von Breaking Bad erneut an, damit die neuen Drehbücher keine Widersprüche erzeugten.',
    pt: 'No início de cada temporada, um roteirista reassistia aos 62 episódios de Breaking Bad para garantir que os novos roteiros não criassem conflitos de continuidade.',
    fr: 'Au début de chaque saison, un scénariste revoyait les 62 épisodes de Breaking Bad afin de vérifier que les nouveaux scripts ne créaient aucune incohérence.',
    es: 'Al comienzo de cada temporada, un guionista volvía a ver los 62 episodios de Breaking Bad para comprobar que los nuevos guiones no crearan contradicciones.',
    it: 'All’inizio di ogni stagione, uno sceneggiatore riguardava tutti i 62 episodi di Breaking Bad per assicurarsi che i nuovi copioni non creassero incongruenze.',
    source:
      'https://en.wikipedia.org/wiki/Better_Call_Saul#:~:text=a%20writer%20would%20be%20tasked%20at%20the%20start%20of%20each%20season%20to%20rewatch%20all%2062%20episodes',
  },
  'tv:76331': {
    en: 'Jesse Armstrong first conceived Succession as a feature film about the Murdoch family, but the script was never produced.',
    de: 'Jesse Armstrong plante Succession zunächst als Kinofilm über die Familie Murdoch, doch das Drehbuch wurde nie verfilmt.',
    pt: 'Jesse Armstrong concebeu Succession inicialmente como um longa-metragem sobre a família Murdoch, mas o roteiro nunca chegou a ser produzido.',
    fr: 'Jesse Armstrong avait d’abord imaginé Succession comme un long métrage sur la famille Murdoch, mais le scénario ne fut jamais produit.',
    es: 'Jesse Armstrong concibió Succession inicialmente como un largometraje sobre la familia Murdoch, pero el guion nunca llegó a producirse.',
    it: 'Jesse Armstrong concepì inizialmente Succession come un film sulla famiglia Murdoch, ma la sceneggiatura non fu mai prodotta.',
    source:
      'https://en.wikipedia.org/wiki/Succession_(TV_series)#:~:text=initially%20conceived%20the%20series%20as%20a%20feature%20film%20about%20the%20Murdoch%20family',
  },
  'tv:67070': {
    en: 'The character of Fleabag began with a challenge from a friend, who asked Phoebe Waller-Bridge to create a sketch for a ten-minute slot at a storytelling night.',
    de: 'Die Figur Fleabag entstand durch die Herausforderung einer Freundin: Phoebe Waller-Bridge sollte einen Sketch für einen zehnminütigen Auftritt bei einem Erzählabend entwickeln.',
    pt: 'A personagem Fleabag nasceu de um desafio feito por uma amiga, que pediu a Phoebe Waller-Bridge um esquete para uma participação de dez minutos em uma noite de histórias.',
    fr: 'Le personnage de Fleabag est né du défi lancé par une amie à Phoebe Waller-Bridge, qui devait créer un sketch pour un créneau de dix minutes lors d’une soirée de récits.',
    es: 'El personaje de Fleabag nació de un reto de una amiga, que pidió a Phoebe Waller-Bridge crear un número para un espacio de diez minutos en una noche de narración.',
    it: 'Il personaggio di Fleabag nacque da una sfida lanciata da un’amica, che chiese a Phoebe Waller-Bridge di creare uno sketch per uno spazio di dieci minuti durante una serata di racconti.',
    source:
      'https://en.wikipedia.org/wiki/Fleabag#:~:text=The%20initial%20idea%20of%20the%20character%20of%20Fleabag%20came%20from%20a%20challenge%20by%20a%20friend',
  },
  'tv:1396': {
    en: 'Bryan Cranston almost lost the part. The network knew him only as the goofy dad from Malcolm in the Middle and offered Walter White to John Cusack and Matthew Broderick first. Both said no, and only then was Cranston cast.',
    de: 'Bryan Cranston hätte die Rolle fast nicht bekommen. Der Sender kannte ihn nur als albernen Vater aus Malcolm mittendrin und bot Walter White zuerst John Cusack und Matthew Broderick an. Beide sagten ab, erst danach bekam Cranston die Rolle.',
    source:
      'https://en.wikipedia.org/wiki/Breaking_Bad#:~:text=John%20Cusack%20and%20Matthew%20Broderick',
  },
  'tv:1398': {
    en: 'Steven Van Zandt, the guitarist from Bruce Springsteen\u2019s E Street Band, had never acted before and auditioned for Tony. HBO wanted an experienced actor, so a new role was written for him instead.',
    de: 'Steven Van Zandt, Gitarrist aus Bruce Springsteens E Street Band, hatte nie zuvor gespielt und sprach für Tony vor. HBO wollte einen erfahrenen Darsteller, also schrieb man ihm eine eigene Rolle.',
    source:
      'https://en.wikipedia.org/wiki/The_Sopranos#:~:text=had%20never%20acted%20before',
  },
  'tv:66732': {
    en: 'About 15 networks turned the show down. They all thought a story carried by children would not work and asked for the kids to be dropped.',
    de: 'Rund 15 Sender lehnten die Serie ab. Alle hielten eine Geschichte mit Kindern als Hauptfiguren für unmöglich und wollten die Kinder herausstreichen.',
    source:
      'https://en.wikipedia.org/wiki/Stranger_Things#:~:text=about%2015%20cable%20networks',
  },
  'tv:87108': {
    en: 'The score contains no ordinary instruments. The composer recorded sounds inside a real decommissioned nuclear plant and built the music entirely from them.',
    de: 'Die Musik enthält keine gewöhnlichen Instrumente. Die Komponistin nahm Geräusche in einem stillgelegten Kernkraftwerk auf und baute die Musik allein daraus.',
    source:
      'https://en.wikipedia.org/wiki/Chernobyl_(miniseries)#:~:text=recordings%20from%20the%20power%20plant',
  },
  'tv:1668': {
    en: 'The fountain from the opening titles is not in New York. The show was never filmed there. That scene was shot on a studio lot in California at four in the morning, on an unusually cold night.',
    de: 'Der Brunnen aus dem Vorspann steht nicht in New York. Dort wurde nie gedreht. Die Szene entstand auf einem Studiogelände in Kalifornien, morgens um vier und in ungewöhnlicher Kälte.',
    source:
      'https://en.wikipedia.org/wiki/Friends#:~:text=The%20opening%20title%20sequence%20was%20filmed%20in%20a%20fountain',
  },
  'tv:1920': {
    en: 'The terrifying Bob was the set dresser. Lynch filmed him on a whim, then a camera operator reported a ruined shot because the man was accidentally caught in a mirror. Lynch kept it and built a character around him.',
    de: 'Der furchteinflößende Bob war der Ausstatter der Serie. Lynch filmte ihn spontan, dann meldete ein Kameramann eine verdorbene Aufnahme, weil der Mann versehentlich in einem Spiegel zu sehen war. Lynch behielt sie und machte eine Figur aus ihm.',
    source:
      'https://en.wikipedia.org/wiki/Twin_Peaks#:~:text=reflected%20in%20the%20mirror',
  },
  'tv:456': {
    en: 'Matt Groening invented the family in minutes, waiting in a producer\u2019s lobby before the pitch. He named the characters after his own relatives and changed only his own name: Bart is an anagram of brat.',
    de: 'Matt Groening erfand die Familie in wenigen Minuten, während er vor dem Termin im Vorzimmer eines Produzenten wartete. Er benannte die Figuren nach seinen eigenen Verwandten und änderte nur seinen eigenen Namen: Bart ist ein Anagramm des englischen Wortes für Gör.',
    source:
      'https://en.wikipedia.org/wiki/The_Simpsons#:~:text=named%20the%20characters%20after%20his%20own%20family%20members',
  },
  'tv:1400': {
    en: 'The network\u2019s own test report called the pilot weak. One viewer wrote that you cannot get excited about two guys going to the laundromat. Years later the creators hung that report in a bathroom on the set.',
    de: 'Der eigene Testbericht des Senders nannte die Pilotfolge schwach. Ein Zuschauer schrieb, für zwei Männer im Waschsalon könne man sich nicht begeistern. Jahre später hängten die Macher diesen Bericht im Bad des Studios auf.',
    source:
      'https://en.wikipedia.org/wiki/Seinfeld#:~:text=hung%20it%20in%20a%20bathroom%20on%20the%20set',
  },
  'tv:70523': {
    en: 'The town of Winden does not exist, and neither does its nuclear plant. Everything was filmed in and around Berlin, and the reactor towers were added by computer.',
    de: 'Den Ort Winden gibt es nicht, das Kernkraftwerk auch nicht. Gedreht wurde alles in und um Berlin, und die Reaktortürme wurden am Computer eingefügt.',
    source:
      'https://en.wikipedia.org/wiki/Dark_(TV_series)#:~:text=nuclear%20reactor%20towers%20were%20computer-animated',
  },
  'tv:1438': {
    en: 'The gentle deacon was played by a real drug lord. Little Melvin Williams went to prison in the 1980s through an investigation one of the show\u2019s own writers had worked on. Years later the same show cast him as a man of the church.',
    de: 'Der freundliche Diakon wurde von einem echten Drogenboss gespielt. Little Melvin Williams kam in den Achtzigern ins Gefängnis, durch Ermittlungen, an denen einer der Autoren der Serie selbst beteiligt war. Jahre später besetzte ihn dieselbe Serie als Mann der Kirche.',
    source:
      'https://en.wikipedia.org/wiki/The_Wire#:~:text=had%20a%20recurring%20role%20as%20a%20deacon',
  },
  'tv:2316': {
    en: 'Phyllis was not an actress. She worked in casting and only read the lines opposite the people auditioning. The director of the pilot liked her so much that he gave her a part in the show.',
    de: 'Phyllis war keine Schauspielerin. Sie arbeitete im Casting und las nur die Gegenparts für die Leute vor, die sich bewarben. Dem Regisseur der Pilotfolge gefiel sie so gut, dass er ihr selbst eine Rolle gab.',
    source:
      'https://en.wikipedia.org/wiki/The_Office_(American_TV_series)#:~:text=read%20with%20other%20actors%20auditioning%20so%20much%20that%20he%20cast',
  },
  'tv:1104': {
    en: 'The actors smoked herbal cigarettes instead of tobacco. Creator Matthew Weiner said real cigarettes had made actors on other sets agitated, nervous and even sick.',
    de: 'Die Darsteller rauchten Kräuterzigaretten statt Tabak. Serienschöpfer Matthew Weiner hatte an anderen Sets erlebt, dass echte Zigaretten Schauspieler unruhig, nervös und sogar krank machten.',
    pt: 'Os atores fumavam cigarros de ervas em vez de tabaco. O criador Matthew Weiner disse que cigarros de verdade haviam deixado atores de outros sets agitados, nervosos e até doentes.',
    fr: 'Les acteurs fumaient des cigarettes aux herbes plutôt que du tabac. Le créateur Matthew Weiner avait vu de vraies cigarettes rendre des acteurs agités, nerveux et même malades sur d’autres tournages.',
    es: 'Los actores fumaban cigarrillos de hierbas en lugar de tabaco. El creador Matthew Weiner había visto cómo los cigarrillos reales ponían a actores de otros rodajes inquietos, nerviosos e incluso enfermos.',
    it: 'Gli attori fumavano sigarette alle erbe invece del tabacco. Il creatore Matthew Weiner aveva visto sigarette vere rendere gli attori agitati, nervosi e persino malati su altri set.',
    source:
      'https://en.wikipedia.org/wiki/Mad_Men#:~:text=you%20don%27t%20want%20actors%20smoking%20real%20cigarettes',
  },
  'tv:100088': {
    en: 'Ashley Johnson, who originally played Ellie in the video games, appears in the series as Ellie’s mother Anna.',
    de: 'Ashley Johnson, die Ellie ursprünglich in den Videospielen spielte, tritt in der Serie als Ellies Mutter Anna auf.',
    pt: 'Ashley Johnson, que interpretou Ellie originalmente nos videogames, aparece na série como Anna, a mãe de Ellie.',
    fr: 'Ashley Johnson, qui incarnait Ellie à l’origine dans les jeux vidéo, joue Anna, la mère d’Ellie, dans la série.',
    es: 'Ashley Johnson, quien interpretó originalmente a Ellie en los videojuegos, aparece en la serie como Anna, la madre de Ellie.',
    it: 'Ashley Johnson, che interpretava Ellie nei videogiochi originali, appare nella serie nel ruolo di Anna, la madre di Ellie.',
    source:
      'https://en.wikipedia.org/wiki/The_Last_of_Us_(TV_series)#:~:text=Johnson%20previously%20portrayed%20Ellie%20in%20the%20video%20games',
  },
  'tv:136315': {
    en: 'The sandwich shop interior was copied from the real Mr. Beef in Chicago. Creator Christopher Storer was a regular customer and a friend of the owner’s son.',
    de: 'Das Innere des Sandwichladens wurde dem echten Mr. Beef in Chicago nachempfunden. Serienschöpfer Christopher Storer war dort Stammgast und mit dem Sohn des Besitzers befreundet.',
    pt: 'O interior da lanchonete foi copiado do verdadeiro Mr. Beef, em Chicago. O criador Christopher Storer era cliente frequente e amigo do filho do proprietário.',
    fr: 'L’intérieur de la sandwicherie reproduit le véritable Mr. Beef de Chicago. Le créateur Christopher Storer en était un client régulier et un ami du fils du propriétaire.',
    es: 'El interior de la tienda de sándwiches se copió del auténtico Mr. Beef de Chicago. El creador Christopher Storer era cliente habitual y amigo del hijo del propietario.',
    it: 'L’interno della paninoteca è stato copiato dal vero Mr. Beef di Chicago. Il creatore Christopher Storer era un cliente abituale e amico del figlio del proprietario.',
    source:
      'https://en.wikipedia.org/wiki/The_Bear_(TV_series)#:~:text=The%20sandwich%20shop%20interior%20is%20copied%20from%20the%20Chicago%20shop',
  },
  'tv:19885': {
    en: 'Sherlock’s parents are played by Benedict Cumberbatch’s real parents, actors Wanda Ventham and Timothy Carlton.',
    de: 'Sherlocks Eltern werden von Benedict Cumberbatchs echten Eltern gespielt, den Schauspielern Wanda Ventham und Timothy Carlton.',
    pt: 'Os pais de Sherlock são interpretados pelos pais de verdade de Benedict Cumberbatch, os atores Wanda Ventham e Timothy Carlton.',
    fr: 'Les parents de Sherlock sont joués par les véritables parents de Benedict Cumberbatch, les acteurs Wanda Ventham et Timothy Carlton.',
    es: 'Los padres de Sherlock son interpretados por los padres reales de Benedict Cumberbatch, los actores Wanda Ventham y Timothy Carlton.',
    it: 'I genitori di Sherlock sono interpretati dai veri genitori di Benedict Cumberbatch, gli attori Wanda Ventham e Timothy Carlton.',
    source:
      'https://en.wikipedia.org/wiki/Sherlock_(TV_series)#:~:text=Cumberbatch%27s%20actual%20parents%2C%20are%20introduced%20as%20Sherlock%20and%20Mycroft%27s%20parents',
  },
  'tv:42009': {
    en: 'The title Black Mirror refers to the cold, shiny screen of a television, monitor or smartphone after it has been switched off.',
    de: 'Der Titel Black Mirror bezeichnet den kalten, glänzenden Bildschirm eines Fernsehers, Monitors oder Smartphones, nachdem er ausgeschaltet wurde.',
    pt: 'O título Black Mirror se refere à tela fria e brilhante de uma televisão, monitor ou smartphone depois de desligada.',
    fr: 'Le titre Black Mirror désigne l’écran froid et brillant d’un téléviseur, d’un moniteur ou d’un smartphone une fois éteint.',
    es: 'El título Black Mirror alude a la pantalla fría y brillante de un televisor, monitor o teléfono inteligente cuando está apagada.',
    it: 'Il titolo Black Mirror indica lo schermo freddo e lucido di un televisore, monitor o smartphone dopo che è stato spento.',
    source:
      'https://en.wikipedia.org/wiki/Black_Mirror#:~:text=The%20%22black%20mirror%22%20of%20the%20title%20is%20the%20one%20you%27ll%20find%20on%20every%20wall',
  },
  'tv:60574': {
    en: 'For his Northern Irish accent, New Zealand-raised Sam Neill asked James Nesbitt and Liam Neeson for help. He then had to tone it down for US audiences.',
    de: 'Für seinen nordirischen Akzent holte sich der in Neuseeland aufgewachsene Sam Neill Hilfe von James Nesbitt und Liam Neeson. Für das US-Publikum musste er ihn anschließend abschwächen.',
    pt: 'Para recuperar seu sotaque norte-irlandês, Sam Neill, criado na Nova Zelândia, pediu ajuda a James Nesbitt e Liam Neeson. Depois, teve de suavizá-lo para o público dos EUA.',
    fr: 'Pour retrouver son accent nord-irlandais, Sam Neill, élevé en Nouvelle-Zélande, demanda l’aide de James Nesbitt et Liam Neeson, avant de devoir l’atténuer pour le public américain.',
    es: 'Para recuperar su acento norirlandés, Sam Neill, criado en Nueva Zelanda, pidió ayuda a James Nesbitt y Liam Neeson; después tuvo que suavizarlo para el público estadounidense.',
    it: 'Per ritrovare il suo accento nordirlandese, Sam Neill, cresciuto in Nuova Zelanda, chiese aiuto a James Nesbitt e Liam Neeson, per poi doverlo attenuare per il pubblico statunitense.',
    source:
      'https://en.wikipedia.org/wiki/Peaky_Blinders_(TV_series)#:~:text=Sam%20Neill%20enlisted%20the%20help%20of%20Northern%20Irish%20actors%20James%20Nesbitt%20and%20Liam%20Neeson',
  },
  'tv:65494': {
    en: 'Buckingham Palace was assembled from several stand-ins: Lancaster House, Wrotham Park and Wilton House, while two cathedrals doubled for Westminster Abbey.',
    de: 'Der Buckingham Palace wurde aus mehreren Drehorten zusammengesetzt: Lancaster House, Wrotham Park und Wilton House; zwei Kathedralen vertraten außerdem die Westminster Abbey.',
    pt: 'O Palácio de Buckingham foi montado a partir de vários locais: Lancaster House, Wrotham Park e Wilton House, enquanto duas catedrais fizeram o papel da Abadia de Westminster.',
    fr: 'Le palais de Buckingham fut reconstitué à partir de plusieurs lieux : Lancaster House, Wrotham Park et Wilton House, tandis que deux cathédrales remplacèrent l’abbaye de Westminster.',
    es: 'El palacio de Buckingham se compuso con varios lugares: Lancaster House, Wrotham Park y Wilton House, mientras que dos catedrales hicieron de la abadía de Westminster.',
    it: 'Buckingham Palace fu ricreato combinando Lancaster House, Wrotham Park e Wilton House, mentre due cattedrali fecero da controfigura all’abbazia di Westminster.',
    source:
      'https://en.wikipedia.org/wiki/The_Crown_(TV_series)#:~:text=Lancaster%20House%2C%20Wrotham%20Park%2C%20and%20Wilton%20House%20were%20used%20to%20double%20as%20Buckingham%20Palace',
  },
  'tv:95396': {
    en: 'Lumon’s retro computers really worked, but their keyboards had no Escape key. This symbolized the innies’ lack of control in the office.',
    de: 'Lumons Retrocomputer funktionierten wirklich, doch auf ihren Tastaturen fehlte die Escape-Taste. Das versinnbildlichte die fehlende Kontrolle der Innies im Büro.',
    pt: 'Os computadores retrô da Lumon funcionavam de verdade, mas seus teclados não tinham a tecla Escape. Isso simbolizava a falta de controle dos innies no escritório.',
    fr: 'Les ordinateurs rétro de Lumon fonctionnaient réellement, mais leurs claviers n’avaient pas de touche Échap, métaphore du manque de contrôle des innies au bureau.',
    es: 'Los ordenadores retro de Lumon funcionaban de verdad, pero sus teclados no tenían tecla Escape, una metáfora de la falta de control de los innies en la oficina.',
    it: 'I computer rétro della Lumon funzionavano davvero, ma le tastiere erano prive del tasto Esc, metafora della mancanza di controllo degli innie in ufficio.',
    source:
      'https://en.wikipedia.org/wiki/Severance_(TV_series)#:~:text=The%20computers%20lacked%20an%20escape%20key%2C%20as%20a%20metaphor%20for%20the%20lack%20of%20control',
  },
  'tv:82856': {
    en: 'The digital scenery reflected naturally in the Mandalorian’s shiny armor during filming. With a green screen, those green reflections would have needed to be removed and replaced later.',
    de: 'Die digitale Kulisse spiegelte sich beim Dreh ganz natürlich in der glänzenden Rüstung des Mandalorianers. Bei einem Greenscreen hätten die grünen Reflexionen später entfernt und ersetzt werden müssen.',
    pt: 'Os cenários digitais se refletiam naturalmente na armadura brilhante do Mandaloriano durante as filmagens. Com uma tela verde, esses reflexos verdes teriam de ser removidos e substituídos depois.',
    fr: 'Les décors numériques se reflétaient naturellement dans l’armure brillante du Mandalorien pendant le tournage. Avec un écran vert, ces reflets verts auraient dû être supprimés et remplacés ensuite.',
    es: 'Los escenarios digitales se reflejaban de forma natural en la brillante armadura del Mandaloriano durante el rodaje. Con una pantalla verde, esos reflejos verdes habrían tenido que eliminarse y sustituirse después.',
    it: 'Gli scenari digitali si riflettevano naturalmente nella lucida armatura del Mandaloriano durante le riprese. Con un green screen, quei riflessi verdi avrebbero dovuto essere rimossi e sostituiti in seguito.',
    source:
      'https://en.wikipedia.org/wiki/The_Mandalorian#:~:text=Using%20StageCraft%2C%20the%20reflections%20in%20the%20Mandalorian%27s%20armor%20were%20already%20correct%20on%20set',
  },
  'tv:119051': {
    en: 'Jenna Ortega choreographed Wednesday’s viral dance herself, drawing inspiration from Siouxsie Sioux, Bob Fosse and footage from 1980s goth clubs.',
    de: 'Jenna Ortega choreografierte Wednesdays viralen Tanz selbst. Dabei ließ sie sich von Siouxsie Sioux, Bob Fosse und Aufnahmen aus Goth-Clubs der 1980er inspirieren.',
    pt: 'Jenna Ortega criou a coreografia da dança viral de Wednesday. Ela se inspirou em Siouxsie Sioux, Bob Fosse e em imagens de clubes góticos dos anos 1980.',
    fr: 'Jenna Ortega a elle-même chorégraphié la danse virale de Wednesday, en s’inspirant de Siouxsie Sioux, de Bob Fosse et d’images de clubs gothiques des années 1980.',
    es: 'Jenna Ortega coreografió ella misma el baile viral de Wednesday, inspirándose en Siouxsie Sioux, Bob Fosse y grabaciones de clubes góticos de los años ochenta.',
    it: 'Jenna Ortega ha coreografato personalmente il ballo virale di Wednesday, ispirandosi a Siouxsie Sioux, Bob Fosse e ai filmati dei club goth degli anni Ottanta.',
    source:
      'https://en.wikipedia.org/wiki/Wednesday_(TV_series)#:~:text=She%20choreographed%20her%20dance%20to%20the%20Cramps%27%20%22Goo%20Goo%20Muck%22%20herself',
  },
  'tv:94997': {
    en: 'The succession conflict in House of the Dragon was inspired by the Anarchy, a real civil war between Stephen of Blois and Empress Matilda in 12th-century England.',
    de: 'Der Thronfolgestreit in House of the Dragon wurde von der Anarchie inspiriert, einem echten Bürgerkrieg zwischen Stephan von Blois und Kaiserin Matilda im England des 12. Jahrhunderts.',
    pt: 'O conflito sucessório de House of the Dragon foi inspirado pela Anarquia, uma guerra civil real entre Estêvão de Blois e a imperatriz Matilda na Inglaterra do século XII.',
    fr: 'Le conflit de succession de House of the Dragon s’inspire de l’Anarchie, une véritable guerre civile entre Étienne de Blois et l’impératrice Mathilde dans l’Angleterre du XIIe siècle.',
    es: 'El conflicto sucesorio de House of the Dragon se inspiró en la Anarquía, una guerra civil real entre Esteban de Blois y la emperatriz Matilde en la Inglaterra del siglo XII.',
    it: 'Il conflitto per la successione di House of the Dragon è ispirato all’Anarchia, una vera guerra civile tra Stefano di Blois e l’imperatrice Matilde nell’Inghilterra del XII secolo.',
    source:
      'https://en.wikipedia.org/wiki/House_of_the_Dragon#:~:text=Inspiration%20for%20the%20series%20came%20from%20English%20medieval%20history%20and%20the%20Anarchy',
  },
  'tv:93405': {
    en: 'The giant doll from Red Light, Green Light was based on Young-hee, a character from South Korean schoolbooks of the 1970s and 1980s. Her hairstyle was inspired by creator Hwang Dong-hyuk’s daughter.',
    de: 'Die riesige Puppe aus Rotes Licht, grünes Licht basiert auf Young-hee, einer Figur aus südkoreanischen Schulbüchern der 1970er und 1980er. Ihre Frisur wurde von der Tochter des Schöpfers Hwang Dong-hyuk inspiriert.',
    pt: 'A boneca gigante de Batatinha Frita 1, 2, 3 foi baseada em Young-hee, personagem de livros escolares sul-coreanos dos anos 1970 e 1980. Seu penteado foi inspirado na filha do criador Hwang Dong-hyuk.',
    fr: 'La poupée géante d’Un, deux, trois, soleil s’inspire de Young-hee, un personnage de manuels scolaires sud-coréens des années 1970 et 1980. Sa coiffure vient de la fille du créateur Hwang Dong-hyuk.',
    es: 'La muñeca gigante de Luz roja, luz verde se basó en Young-hee, un personaje de libros escolares surcoreanos de los años setenta y ochenta. Su peinado se inspiró en la hija del creador Hwang Dong-hyuk.',
    it: 'La bambola gigante di Un, due, tre, stella si basa su Young-hee, un personaggio dei libri scolastici sudcoreani degli anni Settanta e Ottanta. La sua acconciatura è ispirata alla figlia del creatore Hwang Dong-hyuk.',
    source:
      'https://en.wikipedia.org/wiki/Squid_Game#:~:text=The%20robot%20doll%20in%20the%20first%20episode%2C%20%22Red%20Light%2C%20Green%20Light%22%2C%20was%20inspired%20by%20Young-hee',
  },
  'tv:4607': {
    en: 'For the Lost score, Michael Giacchino created some of its sounds by striking suspended pieces of the plane’s fuselage.',
    de: 'Für die Musik von Lost erzeugte Michael Giacchino einige Klänge, indem er aufgehängte Teile des Flugzeugrumpfs anschlug.',
    pt: 'Para a trilha sonora de Lost, Michael Giacchino criou alguns sons batendo em pedaços suspensos da fuselagem do avião.',
    fr: 'Pour la musique de Lost, Michael Giacchino a créé certains sons en frappant des morceaux suspendus du fuselage de l’avion.',
    es: 'Para la banda sonora de Lost, Michael Giacchino creó algunos sonidos golpeando piezas suspendidas del fuselaje del avión.',
    it: 'Per la colonna sonora di Lost, Michael Giacchino creò alcuni suoni percuotendo parti sospese della fusoliera dell’aereo.',
    source:
      'https://en.wikipedia.org/wiki/Lost_(TV_series)#:~:text=Giacchino%20achieved%20some%20of%20the%20sounds%20for%20the%20score%20using%20unusual%20instruments%2C%20such%20as%20striking%20suspended%20pieces%20of%20the%20plane%27s%20fuselage',
  },
  'tv:1405': {
    en: 'Although Dexter is set in Miami, many of its exterior scenes were filmed in Los Angeles and Long Beach, California.',
    de: 'Obwohl Dexter in Miami spielt, wurden viele Außenszenen in Los Angeles und Long Beach in Kalifornien gedreht.',
    pt: 'Embora Dexter se passe em Miami, muitas de suas cenas externas foram filmadas em Los Angeles e Long Beach, na Califórnia.',
    fr: 'Bien que Dexter se déroule à Miami, de nombreuses scènes extérieures ont été tournées à Los Angeles et Long Beach, en Californie.',
    es: 'Aunque Dexter está ambientada en Miami, muchas de sus escenas exteriores se rodaron en Los Ángeles y Long Beach, California.',
    it: 'Sebbene Dexter sia ambientata a Miami, molte scene in esterni furono girate a Los Angeles e Long Beach, in California.',
    source:
      'https://en.wikipedia.org/wiki/Dexter_(TV_series)#:~:text=Although%20the%20series%20is%20set%20in%20Miami%2C%20Florida%2C%20many%20of%20the%20exterior%20scenes%20are%20filmed%20in%20Los%20Angeles%20and%20Long%20Beach%2C%20California',
  },
  'tv:76479': {
    en: 'Although The Boys is set in New York City like the comics, the series was filmed in Toronto, Canada.',
    de: 'Obwohl The Boys wie die Comics in New York City spielt, wurde die Serie im kanadischen Toronto gedreht.',
    pt: 'Embora The Boys se passe em Nova York, como nos quadrinhos, a série foi filmada em Toronto, no Canadá.',
    fr: 'Bien que The Boys se déroule à New York comme les comics, la série a été tournée à Toronto, au Canada.',
    es: 'Aunque The Boys está ambientada en Nueva York, como los cómics, la serie se rodó en Toronto, Canadá.',
    it: 'Sebbene The Boys sia ambientata a New York come i fumetti, la serie è stata girata a Toronto, in Canada.',
    source:
      'https://en.wikipedia.org/wiki/The_Boys_(TV_series)#:~:text=Although%20situated%20in%20New%20York%20City%20as%20in%20the%20comics%2C%20it%20was%20confirmed%20that%20the%20series%20would%20be%20filmed%20in%20Toronto%2C%20Canada',
  },
  'tv:85552': {
    en: 'Euphoria’s second season was shot mainly on cross-processed Kodak Ektachrome film to evoke “some sort of memory of high school.”',
    de: 'Die zweite Staffel von Euphoria wurde hauptsächlich auf crossentwickeltem Kodak-Ektachrome-Film gedreht, um „eine Art Erinnerung an die Highschool“ hervorzurufen.',
    pt: 'A segunda temporada de Euphoria foi filmada principalmente em Kodak Ektachrome com processamento cruzado para evocar “algum tipo de memória do ensino médio”.',
    fr: 'La deuxième saison d’Euphoria a été tournée principalement sur pellicule Kodak Ektachrome développée en traitement croisé afin d’évoquer « une sorte de souvenir du lycée ».',
    es: 'La segunda temporada de Euphoria se rodó principalmente en película Kodak Ektachrome con procesado cruzado para evocar «algún tipo de recuerdo del instituto».',
    it: 'La seconda stagione di Euphoria è stata girata principalmente su pellicola Kodak Ektachrome con sviluppo incrociato per evocare «una sorta di ricordo del liceo».',
    source:
      'https://en.wikipedia.org/wiki/Euphoria_(American_TV_series)#:~:text=The%20two%20special%20episodes%20and%20second%20season%20were%20shot%20on%2035%20mm%20movie%20film%2C%20primarily%20cross%20processed%20Kodak%27s%20Ektachrome%20stock',
  },
  'tv:97546': {
    en: 'Before Ted Lasso became a series, Jason Sudeikis first played the character in 2013 television commercials promoting NBC Sports’ Premier League coverage.',
    de: 'Bevor Ted Lasso zur Serie wurde, spielte Jason Sudeikis die Figur erstmals 2013 in Werbespots für die Premier-League-Übertragungen von NBC Sports.',
    pt: 'Antes de Ted Lasso virar série, Jason Sudeikis interpretou o personagem pela primeira vez em 2013, em comerciais da cobertura da Premier League pela NBC Sports.',
    fr: 'Avant que Ted Lasso ne devienne une série, Jason Sudeikis a incarné le personnage pour la première fois en 2013 dans des publicités pour la couverture de la Premier League par NBC Sports.',
    es: 'Antes de que Ted Lasso se convirtiera en serie, Jason Sudeikis interpretó al personaje por primera vez en 2013 en anuncios de la cobertura de la Premier League de NBC Sports.',
    it: 'Prima che Ted Lasso diventasse una serie, Jason Sudeikis interpretò il personaggio per la prima volta nel 2013 in spot per la copertura della Premier League di NBC Sports.',
    source:
      'https://en.wikipedia.org/wiki/Ted_Lasso#:~:text=in%202013%20as%20part%20of%20a%20series%20of%20television%20commercials',
  },
  'tv:91239': {
    en: 'Bridgerton’s costume team involved more than 200 people and spent five months preparing 5,000 costumes for the series.',
    de: 'An den Kostümen für Bridgerton arbeiteten mehr als 200 Menschen fünf Monate lang. Dabei entstanden 5.000 Kostüme für die Serie.',
    pt: 'A equipe de figurino de Bridgerton reuniu mais de 200 pessoas e passou cinco meses preparando 5.000 trajes para a série.',
    fr: 'Plus de 200 personnes ont travaillé pendant cinq mois à la préparation des costumes de Bridgerton, créant 5 000 tenues pour la série.',
    es: 'Más de 200 personas trabajaron durante cinco meses en el vestuario de Bridgerton y crearon 5.000 trajes para la serie.',
    it: 'Oltre 200 persone lavorarono per cinque mesi ai costumi di Bridgerton, creando 5.000 abiti per la serie.',
    source:
      'https://en.wikipedia.org/wiki/Bridgerton#:~:text=involved%20over%20two%20hundred%20people%20and%20five%20months%20of%20preparation',
  },
  'tv:94605': {
    en: 'The first season of Arcane took six years to develop.',
    de: 'Die Entwicklung der ersten Staffel von Arcane dauerte sechs Jahre.',
    pt: 'A primeira temporada de Arcane levou seis anos para ser desenvolvida.',
    fr: 'Le développement de la première saison d’Arcane a duré six ans.',
    es: 'El desarrollo de la primera temporada de Arcane llevó seis años.',
    it: 'Lo sviluppo della prima stagione di Arcane richiese sei anni.',
    source:
      'https://en.wikipedia.org/wiki/Arcane_(TV_series)#:~:text=it%20took%20six%20years%20to%20develop%20the%20first%20season',
  },
  'tv:87739': {
    en: 'The chess consultants for The Queen’s Gambit devised several hundred different board positions for situations in the script.',
    de: 'Die Schachberater von Das Damengambit entwickelten mehrere Hundert verschiedene Brettstellungen für die Situationen im Drehbuch.',
    pt: 'Os consultores de xadrez de O Gambito da Rainha criaram várias centenas de posições diferentes para as situações do roteiro.',
    fr: 'Les consultants en échecs du Jeu de la dame ont conçu plusieurs centaines de positions différentes pour les situations du scénario.',
    es: 'Los asesores de ajedrez de Gambito de dama idearon varios cientos de posiciones diferentes para las situaciones del guion.',
    it: 'I consulenti scacchistici de La regina degli scacchi idearono diverse centinaia di posizioni differenti per le situazioni della sceneggiatura.',
    source:
      'https://en.wikipedia.org/wiki/The_Queen%27s_Gambit_(miniseries)#:~:text=devised%20several%20hundred%20chess%20positions%20to%20be%20used%20for%20various%20situations%20in%20the%20script',
  },
  'tv:111803': {
    en: 'The White Lotus began after HBO asked Mike White for an idea that could be filmed in a “bubble” environment during the COVID-19 lockdowns.',
    de: 'The White Lotus entstand, nachdem HBO Mike White während der COVID-19-Lockdowns nach einer Idee gefragt hatte, die sich in einer abgeschotteten „Blase“ drehen ließ.',
    pt: 'The White Lotus surgiu depois que a HBO pediu a Mike White, durante os confinamentos da COVID-19, uma ideia que pudesse ser filmada em um ambiente de “bolha”.',
    fr: 'The White Lotus est née après que HBO a demandé à Mike White, pendant les confinements liés à la COVID-19, une idée pouvant être tournée dans un environnement « bulle ».',
    es: 'The White Lotus surgió después de que HBO pidiera a Mike White, durante los confinamientos por la COVID-19, una idea que pudiera rodarse en un entorno de «burbuja».',
    it: 'The White Lotus nacque dopo che HBO chiese a Mike White, durante i lockdown per il COVID-19, un’idea che potesse essere girata in un ambiente «bolla».',
    source:
      'https://en.wikipedia.org/wiki/The_White_Lotus#:~:text=ideas%20for%20a%20show%20that%20could%20be%20shot%20in%20a%20bubble%20environment%20under%20lockdown%20conditions',
  },
  'tv:83867': {
    en: 'Andor built a practical outdoor city set that co-star Adria Arjona estimated was three to five city blocks long.',
    de: 'Für Andor wurde eine echte Außenkulisse einer Stadt gebaut, die laut Darstellerin Adria Arjona drei bis fünf Häuserblocks lang war.',
    pt: 'Andor construiu um cenário externo de cidade de verdade que, segundo a atriz Adria Arjona, tinha de três a cinco quarteirões de extensão.',
    fr: 'Andor a fait construire un véritable décor de ville en extérieur qui, selon l’actrice Adria Arjona, s’étendait sur trois à cinq pâtés de maisons.',
    es: 'Andor construyó un decorado urbano exterior real que, según la actriz Adria Arjona, medía entre tres y cinco manzanas.',
    it: 'Per Andor fu costruito un vero set urbano all’aperto che, secondo l’attrice Adria Arjona, si estendeva per tre-cinque isolati.',
    source:
      'https://en.wikipedia.org/wiki/Andor#:~:text=An%20outdoor%20city%20set%2C%20which%20co%2Dstar%20Adria%20Arjona%20estimated%20to%20be%20three%20to%20five%20city%20blocks%20long%2C%20was%20built%20practically%20for%20the%20series',
  },
  'tv:106379': {
    en: 'Fallout filmed its first Brotherhood of Steel base at the Utah airfield where the 509th Composite Group trained for the atomic missions of World War II.',
    de: 'Fallout drehte die erste Basis der Stählernen Bruderschaft auf jenem Flugplatz in Utah, auf dem die 509th Composite Group für die Atommissionen des Zweiten Weltkriegs trainierte.',
    pt: 'Fallout filmou a primeira base da Irmandade do Aço no aeródromo de Utah onde o 509th Composite Group treinou para as missões atômicas da Segunda Guerra Mundial.',
    fr: 'Fallout a tourné la première base de la Confrérie de l’Acier sur l’aérodrome de l’Utah où le 509th Composite Group s’était entraîné pour les missions atomiques de la Seconde Guerre mondiale.',
    es: 'Fallout rodó la primera base de la Hermandad del Acero en el aeródromo de Utah donde el 509th Composite Group se entrenó para las misiones atómicas de la Segunda Guerra Mundial.',
    it: 'Fallout ha girato la prima base della Confraternita d’Acciaio nell’aeroporto dello Utah dove il 509th Composite Group si addestrò per le missioni atomiche della Seconda guerra mondiale.',
    source:
      'https://en.wikipedia.org/wiki/Fallout_(American_TV_series)#:~:text=This%20location%20has%20a%20unique%20atomic%20history%20connection%20as%20it%20is%20the%20airfield%20where%20the%20509th%20Composite%20Group%20trained%20for%20the%20atomic%20missions%20in%20World%20War%20II',
  },
  'tv:126308': {
    en: 'Hiroyuki Sanada filmed for a single day in 2019 so FX could retain the rights to Shōgun while the series was being reworked.',
    de: 'Hiroyuki Sanada drehte 2019 einen einzigen Tag, damit FX die Rechte an Shōgun behalten konnte, während die Serie überarbeitet wurde.',
    pt: 'Hiroyuki Sanada filmou por apenas um dia em 2019 para que a FX pudesse manter os direitos de Shōgun enquanto a série era reformulada.',
    fr: 'Hiroyuki Sanada a tourné une seule journée en 2019 afin que FX puisse conserver les droits de Shōgun pendant le remaniement de la série.',
    es: 'Hiroyuki Sanada rodó un solo día en 2019 para que FX pudiera conservar los derechos de Shōgun mientras se reformulaba la serie.',
    it: 'Hiroyuki Sanada girò per un solo giorno nel 2019 affinché FX potesse mantenere i diritti di Shōgun mentre la serie veniva rielaborata.',
    source:
      'https://en.wikipedia.org/wiki/Sh%C5%8Dgun_(2024_TV_series)#:~:text=Sanada%20did%20a%20single%20day%20of%20filming%20in%202019%20in%20order%20for%20FX%20to%20retain%20the%20rights%20to%20the%20property%20as%20the%20series%20was%20being%20retooled',
  },
  'tv:62560': {
    en: 'Rami Malek brought his own black hoodie to the Mr. Robot set. It became Elliot’s signature look, so the costume designer ordered 20 more despite the model having been discontinued years earlier.',
    de: 'Rami Malek brachte seinen eigenen schwarzen Kapuzenpullover zum Set von Mr. Robot mit. Er wurde zu Elliots Markenzeichen, weshalb die Kostümbildnerin 20 weitere bestellte, obwohl das Modell seit Jahren nicht mehr hergestellt wurde.',
    pt: 'Rami Malek levou seu próprio moletom preto com capuz ao set de Mr. Robot. A peça virou a marca registrada de Elliot, e a figurinista encomendou mais 20, embora o modelo já não fosse fabricado havia anos.',
    fr: 'Rami Malek a apporté son propre sweat à capuche noir sur le tournage de Mr. Robot. Il est devenu la tenue emblématique d’Elliot, si bien que la costumière en a commandé 20 autres malgré l’arrêt du modèle depuis des années.',
    es: 'Rami Malek llevó su propia sudadera negra con capucha al rodaje de Mr. Robot. Se convirtió en el atuendo característico de Elliot, así que la diseñadora de vestuario encargó 20 más aunque el modelo llevaba años descatalogado.',
    it: 'Rami Malek portò sul set di Mr. Robot la propria felpa nera con cappuccio. Divenne il look distintivo di Elliot, così la costumista ne ordinò altre 20 nonostante il modello fosse fuori produzione da anni.',
    source:
      'https://en.wikipedia.org/wiki/Mr._Robot#:~:text=black%20hoodie%20to%20set',
  },
  'tv:63351': {
    en: 'Some images of Pablo Escobar and his entourage in Narcos’ opening credits came directly from the drug lord’s personal photographer, known as El Chino.',
    de: 'Einige Bilder von Pablo Escobar und seinem Umfeld im Vorspann von Narcos stammten direkt von seinem persönlichen Fotografen, der unter dem Namen El Chino bekannt war.',
    pt: 'Algumas imagens de Pablo Escobar e seu grupo na abertura de Narcos vieram diretamente do fotógrafo pessoal do traficante, conhecido como El Chino.',
    fr: 'Certaines images de Pablo Escobar et de son entourage dans le générique de Narcos provenaient directement du photographe personnel du baron de la drogue, connu sous le nom d’El Chino.',
    es: 'Algunas imágenes de Pablo Escobar y su entorno en los créditos iniciales de Narcos procedían directamente del fotógrafo personal del narcotraficante, conocido como El Chino.',
    it: 'Alcune immagini di Pablo Escobar e del suo entourage nei titoli di testa di Narcos provenivano direttamente dal fotografo personale del narcotrafficante, noto come El Chino.',
    source:
      'https://en.wikipedia.org/wiki/Narcos#:~:text=drug%20baron%27s%20personal%20photographer',
  },
  'tv:66573': {
    en: 'The first casting announcement for Janet in The Good Place described her as a violin salesperson with a checkered past, but writer Megan Amram later admitted that description was a hoax.',
    de: 'In der ersten Besetzungsankündigung für Janet in The Good Place wurde sie als Geigenverkäuferin mit zwielichtiger Vergangenheit beschrieben. Autorin Megan Amram gab später zu, dass diese Beschreibung erfunden war.',
    pt: 'O primeiro anúncio de elenco de Janet em The Good Place a descrevia como uma vendedora de violinos com um passado duvidoso, mas a roteirista Megan Amram admitiu depois que a descrição era uma farsa.',
    fr: 'La première annonce de casting de Janet dans The Good Place la présentait comme une vendeuse de violons au passé trouble, mais la scénariste Megan Amram a reconnu plus tard que cette description était un canular.',
    es: 'El primer anuncio de reparto de Janet en The Good Place la describía como una vendedora de violines con un pasado turbio, pero la guionista Megan Amram admitió después que aquella descripción era un engaño.',
    it: 'Il primo annuncio del casting di Janet in The Good Place la descriveva come una venditrice di violini dal passato discutibile, ma la sceneggiatrice Megan Amram ammise in seguito che la descrizione era una bufala.',
    source:
      'https://en.wikipedia.org/wiki/The_Good_Place#:~:text=a%20violin%20salesperson%20with%20a%20checkered%20past',
  },
  'tv:72844': {
    en: 'The exterior of Hill House was a real mansion in LaGrange, Georgia, but the house’s interiors were filmed on studio sets in Atlanta.',
    de: 'Für die Außenansicht von Hill House diente ein echtes Herrenhaus in LaGrange im US-Bundesstaat Georgia. Die Innenräume des Hauses wurden dagegen in Studiokulissen in Atlanta gedreht.',
    pt: 'O exterior de Hill House era uma mansão real em LaGrange, no estado da Geórgia, mas os interiores da casa foram filmados em cenários de estúdio em Atlanta.',
    fr: 'L’extérieur de Hill House était un véritable manoir situé à LaGrange, en Géorgie, mais les intérieurs de la maison ont été tournés sur des décors de studio à Atlanta.',
    es: 'El exterior de Hill House era una mansión real de LaGrange, Georgia, pero los interiores de la casa se rodaron en decorados de estudio en Atlanta.',
    it: 'L’esterno di Hill House era una vera villa a LaGrange, in Georgia, ma gli interni della casa furono girati su set in studio ad Atlanta.',
    source:
      'https://en.wikipedia.org/wiki/The_Haunting_of_Hill_House_(TV_series)#:~:text=interior%20settings%20were%20filmed',
  },
  'tv:69478': {
    en: 'Margaret Atwood, author of The Handmaid’s Tale, served as a consulting producer on the series and made a small cameo in its first episode.',
    de: 'Margaret Atwood, die Autorin von Der Report der Magd, war beratende Produzentin der Serie und hatte in der ersten Folge einen kleinen Gastauftritt.',
    pt: 'Margaret Atwood, autora de O Conto da Aia, trabalhou como produtora consultora da série e fez uma pequena participação no primeiro episódio.',
    fr: 'Margaret Atwood, autrice de La Servante écarlate, a été productrice consultante de la série et a fait une brève apparition dans le premier épisode.',
    es: 'Margaret Atwood, autora de El cuento de la criada, fue productora consultora de la serie e hizo un pequeño cameo en el primer episodio.',
    it: 'Margaret Atwood, autrice de Il racconto dell’ancella, è stata produttrice consulente della serie e ha fatto un piccolo cameo nel primo episodio.',
    source:
      'https://en.wikipedia.org/wiki/The_Handmaid%27s_Tale_(TV_series)#:~:text=She%20also%20played%20a%20small%20cameo%20role%20in%20the%20first%20episode',
  },
  'tv:73586': {
    en: 'Taylor Sheridan originally wrote Yellowstone as a film and pitched it as “The Godfather in Montana.”',
    de: 'Taylor Sheridan schrieb Yellowstone ursprünglich als Film und beschrieb das Projekt als „Der Pate in Montana“.',
    pt: 'Taylor Sheridan escreveu Yellowstone originalmente como um filme e apresentou o projeto como “O Poderoso Chefão em Montana”.',
    fr: 'Taylor Sheridan avait initialement écrit Yellowstone comme un film et le présentait comme « Le Parrain dans le Montana ».',
    es: 'Taylor Sheridan escribió Yellowstone originalmente como una película y presentó el proyecto como «El padrino en Montana».',
    it: 'Taylor Sheridan scrisse Yellowstone inizialmente come film e presentò il progetto come «Il padrino nel Montana».',
    source:
      'https://en.wikipedia.org/wiki/Yellowstone_(TV_series)#:~:text=Taylor%20Sheridan%20originally%20wrote%20Yellowstone%20as%20a%20film',
  },
  'tv:63639': {
    en: 'After Syfy canceled The Expanse, fans crowdfunded an airplane to fly a Save The Expanse banner around Amazon Studios. Amazon picked up the series that same month.',
    de: 'Nachdem Syfy The Expanse abgesetzt hatte, finanzierten Fans per Crowdfunding ein Flugzeug, das ein Save The Expanse Banner um die Amazon Studios flog. Noch im selben Monat übernahm Amazon die Serie.',
    pt: 'Depois que a Syfy cancelou The Expanse, fãs financiaram coletivamente um avião para sobrevoar a Amazon Studios com uma faixa Save The Expanse. A Amazon resgatou a série naquele mesmo mês.',
    fr: 'Après l’annulation de The Expanse par Syfy, des fans ont financé un avion pour faire voler une bannière Save The Expanse autour d’Amazon Studios. Amazon a repris la série le même mois.',
    es: 'Después de que Syfy cancelara The Expanse, los fans financiaron un avión para volar alrededor de Amazon Studios con una pancarta Save The Expanse. Amazon rescató la serie ese mismo mes.',
    it: 'Dopo la cancellazione di The Expanse da parte di Syfy, i fan finanziarono un aereo che volò intorno agli Amazon Studios con uno striscione Save The Expanse. Amazon salvò la serie nello stesso mese.',
    source:
      'https://en.wikipedia.org/wiki/The_Expanse_(TV_series)#:~:text=a%20crowdfunding%20campaign%20paid%20for%20an%20airplane%20to%20fly%20a',
  },
  'tv:67744': {
    en: 'Mindhunter modeled its serial killers on the real convicted criminals, and their prison dialogue was taken from actual interviews.',
    de: 'Mindhunter gestaltete seine Serienmörder nach den echten verurteilten Verbrechern. Ihre Gefängnisdialoge stammten aus tatsächlichen Interviews.',
    pt: 'Mindhunter baseou seus assassinos em série nos criminosos realmente condenados, e os diálogos na prisão foram extraídos de entrevistas reais.',
    fr: 'Mindhunter a modelé ses tueurs en série sur les véritables criminels condamnés, et leurs dialogues en prison provenaient d’entretiens réels.',
    es: 'Mindhunter modeló a sus asesinos en serie a partir de los criminales reales condenados, y sus diálogos en prisión procedían de entrevistas auténticas.',
    it: 'Mindhunter ha modellato i suoi serial killer sui veri criminali condannati, mentre i dialoghi in prigione sono stati tratti da interviste reali.',
    source:
      'https://en.wikipedia.org/wiki/Mindhunter_(TV_series)#:~:text=their%20prison%20scene%20dialogues%20were%20taken%20from%20real%20interviews',
  },
  'tv:46648': {
    en: 'Matthew McConaughey was originally meant to play Marty Hart in True Detective, but he convinced creator Nic Pizzolatto to cast him as Rust Cohle instead.',
    de: 'Matthew McConaughey sollte in True Detective ursprünglich Marty Hart spielen, überzeugte den Schöpfer Nic Pizzolatto aber davon, ihn stattdessen als Rust Cohle zu besetzen.',
    pt: 'Matthew McConaughey deveria interpretar Marty Hart em True Detective, mas convenceu o criador Nic Pizzolatto a escalá-lo como Rust Cohle.',
    fr: 'Matthew McConaughey devait initialement jouer Marty Hart dans True Detective, mais il a convaincu le créateur Nic Pizzolatto de lui confier plutôt le rôle de Rust Cohle.',
    es: 'Matthew McConaughey iba a interpretar originalmente a Marty Hart en True Detective, pero convenció al creador Nic Pizzolatto para que le diera el papel de Rust Cohle.',
    it: 'Matthew McConaughey avrebbe dovuto interpretare Marty Hart in True Detective, ma convinse il creatore Nic Pizzolatto ad affidargli invece il ruolo di Rust Cohle.',
    source:
      'https://en.wikipedia.org/wiki/True_Detective#:~:text=he%20later%20convinced%20Pizzolatto%20to%20cast%20him%20as%20Cohle',
  },
  'tv:60622': {
    en: 'Long before the Fargo series premiered, a different TV pilot based on the film was made in 1997, starring Edie Falco as Marge Gunderson and directed by Kathy Bates.',
    de: 'Lange vor dem Start der Serie Fargo entstand bereits 1997 eine andere Pilotfolge zum Film. Edie Falco spielte Marge Gunderson, Regie führte Kathy Bates.',
    pt: 'Muito antes da estreia da série Fargo, outro piloto de TV baseado no filme foi produzido em 1997, com Edie Falco como Marge Gunderson e direção de Kathy Bates.',
    fr: 'Bien avant le lancement de la série Fargo, un autre pilote télévisé inspiré du film a été tourné en 1997, avec Edie Falco dans le rôle de Marge Gunderson et Kathy Bates à la réalisation.',
    es: 'Mucho antes del estreno de la serie Fargo, en 1997 se rodó otro piloto televisivo basado en la película, con Edie Falco como Marge Gunderson y Kathy Bates como directora.',
    it: 'Molto prima del debutto della serie Fargo, nel 1997 fu girato un altro episodio pilota basato sul film, con Edie Falco nel ruolo di Marge Gunderson e Kathy Bates alla regia.',
    source:
      'https://en.wikipedia.org/wiki/Fargo_(TV_series)#:~:text=a%20pilot%20was%20filmed%20for%20an%20intended%20television%20series%20based%20on%20the%20film',
  },
  'tv:54344': {
    en: 'The third season of The Leftovers used a different theme song for every episode because Damon Lindelof wanted the music to introduce each episode thematically.',
    de: 'Die dritte Staffel von The Leftovers verwendete für jede Folge einen anderen Titelsong, weil Damon Lindelof die jeweilige Folge damit thematisch einleiten wollte.',
    pt: 'A terceira temporada de The Leftovers usou uma música de abertura diferente em cada episódio porque Damon Lindelof queria que a música apresentasse o tema de cada capítulo.',
    fr: 'La troisième saison de The Leftovers a utilisé une chanson de générique différente pour chaque épisode, car Damon Lindelof voulait que la musique en introduise le thème.',
    es: 'La tercera temporada de The Leftovers utilizó una canción de cabecera distinta en cada episodio porque Damon Lindelof quería que la música introdujera su tema.',
    it: 'La terza stagione di The Leftovers usò una sigla diversa per ogni episodio perché Damon Lindelof voleva che la musica ne introducesse il tema.',
    source:
      'https://en.wikipedia.org/wiki/The_Leftovers_(TV_series)#:~:text=Season%203%20retains%20the%20opening%20from%20Season%202%20but%20with%20a%20different%20theme%20song%20for%20each%20episode',
  },
  'tv:69740': {
    en: 'To make Ozark’s money laundering story realistic, the writers brought an FBI financial crimes agent and a hedge fund manager into the writers’ room.',
    de: 'Damit die Geldwäsche in Ozark glaubwürdig dargestellt wurde, ließ sich das Autorenteam von einem Ermittler des FBI für Finanzkriminalität und einem Hedgefondsmanager beraten.',
    pt: 'Para tornar a lavagem de dinheiro de Ozark realista, os roteiristas levaram um agente do FBI especializado em crimes financeiros e um gestor de fundo de hedge à sala de roteiro.',
    fr: 'Pour rendre le blanchiment d’argent d’Ozark réaliste, les scénaristes ont fait venir dans leur salle un agent du FBI spécialisé dans la criminalité financière et un gestionnaire de fonds spéculatif.',
    es: 'Para que el blanqueo de dinero de Ozark resultara realista, los guionistas llevaron a su sala a un agente del FBI especializado en delitos financieros y a un gestor de fondos de cobertura.',
    it: 'Per rendere realistico il riciclaggio di denaro in Ozark, gli sceneggiatori invitarono nella sala autori un agente dell’FBI specializzato in crimini finanziari e un gestore di hedge fund.',
    source:
      'https://en.wikipedia.org/wiki/Ozark_(TV_series)#:~:text=brought%20an%20FBI%20agent%20who%20works%20on%20financial%20crimes%20into%20the%20writers%27%20room',
  },
  'tv:46533': {
    en: 'The Americans creator Joe Weisberg’s former job at the CIA helped him develop storylines for the series, including plots based on real-life stories.',
    de: 'Seine frühere Arbeit bei der CIA half dem Schöpfer von The Americans, Joe Weisberg, Handlungsstränge für die Serie zu entwickeln, darunter Geschichten nach wahren Begebenheiten.',
    pt: 'O antigo trabalho de Joe Weisberg, criador de The Americans, na CIA ajudou-o a desenvolver tramas para a série, incluindo histórias baseadas em casos reais.',
    fr: 'L’ancien emploi de Joe Weisberg, créateur de The Americans, à la CIA l’a aidé à développer des intrigues pour la série, dont certaines inspirées d’histoires vraies.',
    es: 'El antiguo trabajo de Joe Weisberg, creador de The Americans, en la CIA le ayudó a desarrollar tramas para la serie, incluidas historias basadas en casos reales.',
    it: 'Il precedente lavoro di Joe Weisberg, creatore di The Americans, alla CIA lo aiutò a sviluppare trame per la serie, incluse storie basate su fatti reali.',
    source:
      'https://en.wikipedia.org/wiki/The_Americans#:~:text=basing%20some%20plot%20lines%20on%20real-life%20stories',
  },
  'tv:1621': {
    en: 'Boardwalk Empire built a 300-foot-long boardwalk on an empty lot in Brooklyn. The set alone cost $5 million.',
    de: 'Für Boardwalk Empire wurde auf einem leeren Grundstück in Brooklyn eine 91 Meter lange Strandpromenade gebaut. Allein diese Kulisse kostete fünf Millionen Dollar.',
    pt: 'Boardwalk Empire construiu um calçadão de 91 metros em um terreno vazio no Brooklyn. Só esse cenário custou cinco milhões de dólares.',
    fr: 'Boardwalk Empire a construit une promenade de 91 mètres sur un terrain vide à Brooklyn. Ce décor a coûté à lui seul cinq millions de dollars.',
    es: 'Boardwalk Empire construyó un paseo marítimo de 91 metros en un terreno vacío de Brooklyn. Solo ese decorado costó cinco millones de dólares.',
    it: 'Per Boardwalk Empire fu costruita una passerella di 91 metri in un lotto vuoto a Brooklyn. Solo questo set costò cinque milioni di dollari.',
    source:
      'https://en.wikipedia.org/wiki/Boardwalk_Empire#:~:text=at%20the%20cost%20of%20%245%20million',
  },
  'tv:115004': {
    en: 'Kate Winslet said learning Mare of Easttown’s local Delco accent was so difficult that it caused her to “throw things”.',
    de: 'Kate Winslet sagte, der lokale Delco-Akzent für Mare of Easttown sei so schwer zu lernen gewesen, dass sie deswegen „Dinge warf“.',
    pt: 'Kate Winslet disse que aprender o sotaque local de Delco para Mare of Easttown foi tão difícil que a fez “atirar coisas”.',
    fr: 'Kate Winslet a déclaré que l’accent local du Delaware County pour Mare of Easttown était si difficile à apprendre qu’il lui arrivait de « jeter des objets ».',
    es: 'Kate Winslet dijo que aprender el acento local de Delco para Mare of Easttown fue tan difícil que la llevó a «lanzar cosas».',
    it: 'Kate Winslet disse che imparare l’accento locale del Delaware County per Mare of Easttown fu così difficile da portarla a «lanciare oggetti».',
    source:
      'https://en.wikipedia.org/wiki/Mare_of_Easttown#:~:text=learning%20the%20accent%20was%20so%20difficult%20that%20it%20caused%20her%20to',
  },
  'tv:95480': {
    en: 'Slow Horses films two seasons back to back, so the next season is already finished by the time the current one is released.',
    de: 'Slow Horses dreht jeweils zwei Staffeln direkt hintereinander. Wenn eine Staffel erscheint, ist die nächste deshalb bereits fertig gedreht.',
    pt: 'Slow Horses filma duas temporadas consecutivamente. Por isso, quando uma temporada estreia, a seguinte já terminou de ser filmada.',
    fr: 'Slow Horses tourne deux saisons à la suite. Ainsi, lorsque l’une sort, le tournage de la suivante est déjà terminé.',
    es: 'Slow Horses rueda dos temporadas seguidas. Por eso, cuando se estrena una temporada, la siguiente ya ha terminado de rodarse.',
    it: 'Slow Horses gira due stagioni una dopo l’altra. Così, quando una stagione esce, le riprese della successiva sono già terminate.',
    source:
      'https://en.wikipedia.org/wiki/Slow_Horses#:~:text=schedule%20of%20shooting%20two%20series%20back%20to%20back',
  },
  'tv:72750': {
    en: 'More than 100 actresses were considered for the role of Villanelle in Killing Eve before Jodie Comer was cast.',
    de: 'Für die Rolle der Villanelle in Killing Eve wurden mehr als 100 Schauspielerinnen in Betracht gezogen, bevor Jodie Comer besetzt wurde.',
    pt: 'Mais de 100 atrizes foram consideradas para o papel de Villanelle em Killing Eve antes de Jodie Comer ser escolhida.',
    fr: 'Plus de 100 actrices ont été envisagées pour le rôle de Villanelle dans Killing Eve avant que Jodie Comer ne soit choisie.',
    es: 'Más de 100 actrices fueron consideradas para el papel de Villanelle en Killing Eve antes de que eligieran a Jodie Comer.',
    it: 'Più di 100 attrici furono prese in considerazione per il ruolo di Villanelle in Killing Eve prima che venisse scelta Jodie Comer.',
    source:
      'https://en.wikipedia.org/wiki/Killing_Eve#:~:text=the%20production%20considered%20over%20100%20actresses',
  },
  'tv:61859': {
    en: 'The Night Manager author John le Carré made a cameo in episode four as a restaurant diner who is insulted.',
    de: 'Der Autor von The Night Manager, John le Carré, hatte in Folge vier einen Gastauftritt als Restaurantgast, der beleidigt wird.',
    pt: 'John le Carré, autor de The Night Manager, fez uma participação no quarto episódio como um cliente de restaurante que é insultado.',
    fr: 'John le Carré, l’auteur de The Night Manager, apparaît dans le quatrième épisode en client de restaurant qui se fait insulter.',
    es: 'John le Carré, autor de The Night Manager, hizo un cameo en el cuarto episodio como un comensal al que insultan.',
    it: 'John le Carré, autore di The Night Manager, fece un cameo nel quarto episodio nei panni di un cliente di ristorante che viene insultato.',
    source:
      'https://en.wikipedia.org/wiki/The_Night_Manager_(British_TV_series)#:~:text=Le%20Carr%C3%A9%20makes%20a%20cameo%20appearance%20as%20an%20insulted%20restaurant%20diner%20in%20episode%20four',
  },
  'tv:66292': {
    en: 'Nicole Kidman and Reese Witherspoon secured the screen rights to Big Little Lies less than a month after the novel was published, initially planning to turn it into a film.',
    de: 'Nicole Kidman und Reese Witherspoon sicherten sich die Filmrechte an Big Little Lies weniger als einen Monat nach Erscheinen des Romans. Ursprünglich wollten sie daraus einen Film machen.',
    pt: 'Nicole Kidman e Reese Witherspoon adquiriram os direitos de adaptação de Big Little Lies menos de um mês após a publicação do romance e planejavam inicialmente transformá-lo em filme.',
    fr: 'Nicole Kidman et Reese Witherspoon ont acquis les droits d’adaptation de Big Little Lies moins d’un mois après la publication du roman, avec l’intention initiale d’en faire un film.',
    es: 'Nicole Kidman y Reese Witherspoon adquirieron los derechos de adaptación de Big Little Lies menos de un mes después de publicarse la novela, con la intención inicial de convertirla en película.',
    it: 'Nicole Kidman e Reese Witherspoon acquisirono i diritti di adattamento di Big Little Lies meno di un mese dopo la pubblicazione del romanzo, progettando inizialmente di farne un film.',
    source:
      'https://en.wikipedia.org/wiki/Big_Little_Lies_(TV_series)#:~:text=Actresses%20and%20producers%20Nicole%20Kidman%20and%20Reese%20Witherspoon%20were%20announced%20to%20have%20optioned%20the%20screen%20rights%20to,develop%20the%20project%20as%20a%20film',
  },
  'tv:70453': {
    en: 'Every piece of music in Sharp Objects is diegetic: it comes from a stereo, headphones, or another source within the scene.',
    de: 'Jedes Musikstück in Sharp Objects ist Teil der erzählten Welt: Es kommt aus einer Stereoanlage, Kopfhörern oder einer anderen Quelle innerhalb der Szene.',
    pt: 'Toda a música de Sharp Objects faz parte do mundo da história: ela vem de um aparelho de som, de fones de ouvido ou de outra fonte dentro da cena.',
    fr: 'Toute la musique de Sharp Objects appartient à l’univers de l’histoire : elle provient d’une chaîne stéréo, d’un casque ou d’une autre source présente dans la scène.',
    es: 'Toda la música de Sharp Objects forma parte del mundo de la historia: procede de un equipo de sonido, unos auriculares u otra fuente dentro de la escena.',
    it: 'Tutta la musica di Sharp Objects appartiene al mondo narrativo: proviene da uno stereo, dalle cuffie o da un’altra fonte presente nella scena.',
    source:
      'https://en.wikipedia.org/wiki/Sharp_Objects_(miniseries)#:~:text=All%20music%20featured%20in%20the%20series%20is%20diegetic%2C%20coming%20from%20a%20source%20%28a%20stereo%2C%20headphones%2C%20etc.%29%20within%20the%20scene',
  },
  'tv:63333': {
    en: 'The Last Kingdom gave Bernard Cornwell, author of the novels behind the series, a cameo in series three as Beornheard.',
    de: 'The Last Kingdom gab Bernard Cornwell, dem Autor der Romanvorlage, in der dritten Staffel einen Cameo-Auftritt als Beornheard.',
    pt: 'The Last Kingdom deu a Bernard Cornwell, autor dos romances que inspiraram a série, uma participação especial na terceira temporada como Beornheard.',
    fr: 'The Last Kingdom a offert à Bernard Cornwell, auteur des romans à l’origine de la série, un caméo dans la troisième saison dans le rôle de Beornheard.',
    es: 'The Last Kingdom dio a Bernard Cornwell, autor de las novelas en las que se basa la serie, un cameo en la tercera temporada como Beornheard.',
    it: 'The Last Kingdom ha affidato a Bernard Cornwell, autore dei romanzi da cui è tratta la serie, un cameo nella terza stagione nel ruolo di Beornheard.',
    source:
      'https://en.wikipedia.org/wiki/The_Last_Kingdom_(TV_series)#:~:text=Bernard%20Cornwell%20as%20Beornheard',
  },
  'tv:69061': {
    en: 'The creators of The OA found the story so difficult to summarize in writing that they developed it aloud, even acting out every character and the major moments when pitching it.',
    de: 'Die Schöpfer von The OA fanden die Geschichte schriftlich so schwer zusammenzufassen, dass sie sie mündlich entwickelten und beim Pitch sogar alle Figuren und großen Momente selbst spielten.',
    pt: 'Os criadores de The OA acharam a história tão difícil de resumir por escrito que a desenvolveram oralmente e, ao apresentá-la, chegaram a interpretar todos os personagens e os grandes momentos.',
    fr: 'Les créateurs de The OA trouvaient l’histoire si difficile à résumer par écrit qu’ils l’ont développée oralement, allant jusqu’à jouer tous les personnages et les grands moments lors de leur présentation.',
    es: 'A los creadores de The OA les resultaba tan difícil resumir la historia por escrito que la desarrollaron oralmente y, al presentarla, incluso interpretaron todos los personajes y los grandes momentos.',
    it: 'I creatori di The OA trovavano la storia così difficile da riassumere per iscritto che la svilupparono oralmente, arrivando a interpretare tutti i personaggi e i momenti principali durante la presentazione.',
    source:
      'https://en.wikipedia.org/wiki/The_OA#:~:text=They%20found%20it%20difficult%20to%20summarize%20the%20series%20in%20a%20written%20story%2C%20so%20they%20developed%20it%20aurally&text=playing%20all%20the%20characters%20and%20acting%20out%20the%20big%20moments%20through%20many%20hours',
  },
  'tv:1407': {
    en: 'A Washington Post journalist connected the Homeland team with Edward Snowden for an hours-long video call before Snowden appeared in documentaries or gave interviews.',
    de: 'Ein Journalist der Washington Post vermittelte dem Homeland-Team ein stundenlanges Videogespräch mit Edward Snowden, noch bevor Snowden in Dokumentationen auftrat oder Interviews gab.',
    pt: 'Um jornalista do Washington Post conectou a equipe de Homeland a Edward Snowden para uma videochamada de várias horas, antes de Snowden aparecer em documentários ou conceder entrevistas.',
    fr: 'Un journaliste du Washington Post a mis l’équipe de Homeland en relation avec Edward Snowden pour un appel vidéo de plusieurs heures, avant que Snowden n’apparaisse dans des documentaires ou ne donne des interviews.',
    es: 'Un periodista del Washington Post puso al equipo de Homeland en contacto con Edward Snowden para una videollamada de varias horas, antes de que Snowden apareciera en documentales o concediera entrevistas.',
    it: 'Un giornalista del Washington Post mise il team di Homeland in contatto con Edward Snowden per una videochiamata durata ore, prima che Snowden apparisse in documentari o rilasciasse interviste.',
    source:
      'https://en.wikipedia.org/wiki/Homeland_(TV_series)#:~:text=Washington%20Post%20writer%20Barton%20Gellman%20connected%20the%20Homeland%20team%20on%20an%20hours%2Dlong%20video%20call%20with%20Edward%20Snowden%20before%20he%20appeared%20in%20documentaries%20or%20did%20interviews',
  },
  'tv:66276': {
    en: 'The lead role in The Night Of was intended for James Gandolfini, then passed to Robert De Niro after Gandolfini’s death, and finally to John Turturro when scheduling conflicts ruled De Niro out.',
    de: 'Die Hauptrolle in The Night Of war für James Gandolfini vorgesehen, ging nach seinem Tod zunächst an Robert De Niro und schließlich an John Turturro, als De Niro wegen Terminkonflikten absagen musste.',
    pt: 'O papel principal de The Night Of seria de James Gandolfini, passou para Robert De Niro após a morte do ator e acabou com John Turturro quando conflitos de agenda impediram a participação de De Niro.',
    fr: 'Le rôle principal de The Night Of était destiné à James Gandolfini, puis est revenu à Robert De Niro après sa mort, avant d’être finalement confié à John Turturro lorsque des conflits d’emploi du temps ont écarté De Niro.',
    es: 'El papel protagonista de The Night Of estaba destinado a James Gandolfini, pasó a Robert De Niro tras su muerte y finalmente a John Turturro cuando los conflictos de agenda impidieron participar a De Niro.',
    it: 'Il ruolo principale di The Night Of era destinato a James Gandolfini, passò a Robert De Niro dopo la sua morte e infine a John Turturro quando gli impegni impedirono a De Niro di partecipare.',
    source:
      'https://en.wikipedia.org/wiki/The_Night_Of#:~:text=James%20Gandolfini%20was%20set%20to%20star&text=Robert%20De%20Niro%20was%20set%20to%20replace%20Gandolfini&text=John%20Turturro%20replaced%20De%20Niro%20because%20of%20scheduling%20conflicts',
  },
};

/** A fun fact for this title in the app language (English fallback), or null. */
export function getFunFact(
  mediaType: MediaType,
  id: string | number,
): FunFact | null {
  const entry = FACTS[`${mediaType}:${id}`];
  if (!entry) return null;
  const lang = contentLanguage().slice(0, 2).toLowerCase() as AppLanguage;
  return { text: entry[lang] ?? entry.en, source: entry.source };
}
