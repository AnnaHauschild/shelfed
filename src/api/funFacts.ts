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
  'movie:9552': {
    en: "The sound of Regan's head turning was created by twisting a leather wallet.",
    de: 'Das Geräusch von Regans sich drehendem Kopf entstand durch das Verdrehen einer Lederbrieftasche.',
    pt: 'O som da cabeça de Regan girando foi criado torcendo uma carteira de couro.',
    fr: 'Le bruit de la tête de Regan qui tourne fut créé en tordant un portefeuille en cuir.',
    es: 'El sonido de la cabeza de Regan girando se creó retorciendo una cartera de cuero.',
    it: 'Il suono della testa di Regan che ruota fu creato torcendo un portafoglio di pelle.',
    source:
      'https://en.wikipedia.org/wiki/The_Exorcist#:~:text=twisting%20a%20leather%20wallet',
  },
  'movie:15': {
    en: "Make-up artist Maurice Seiderman created the look of skin pores on Kane's face using a negative cast made from an orange peel.",
    de: 'Maskenbildner Maurice Seiderman erzeugte die Hautporen in Kanes Gesicht mit einem Negativabdruck einer Orangenschale.',
    pt: 'O maquiador Maurice Seiderman criou a aparência dos poros no rosto de Kane com um molde negativo feito de casca de laranja.',
    fr: 'Le maquilleur Maurice Seiderman créa l’apparence des pores sur le visage de Kane avec une empreinte négative faite à partir d’une peau d’orange.',
    es: 'El maquillador Maurice Seiderman creó la apariencia de los poros en el rostro de Kane con un molde negativo hecho de cáscara de naranja.',
    it: 'Il truccatore Maurice Seiderman creò l’aspetto dei pori sul viso di Kane con un calco negativo ricavato da una buccia d’arancia.',
    source:
      'https://en.wikipedia.org/wiki/Citizen_Kane#:~:text=negative%20cast%20made%20from%20an%20orange%20peel',
  },
  'movie:1018': {
    en: 'Rebekah Del Rio sang “Llorando” for David Lynch once, unaware that he was recording her. Lynch used that very performance in the film.',
    de: 'Rebekah Del Rio sang „Llorando“ nur einmal für David Lynch, ohne zu wissen, dass er sie aufnahm. Lynch verwendete genau diese Aufnahme im Film.',
    pt: 'Rebekah Del Rio cantou “Llorando” uma única vez para David Lynch, sem saber que ele a estava gravando. Lynch usou justamente essa interpretação no filme.',
    fr: 'Rebekah Del Rio chanta « Llorando » une seule fois pour David Lynch, sans savoir qu’il l’enregistrait. Lynch utilisa cette interprétation dans le film.',
    es: 'Rebekah Del Rio cantó “Llorando” una sola vez para David Lynch, sin saber que él la estaba grabando. Lynch utilizó esa misma interpretación en la película.',
    it: 'Rebekah Del Rio cantò “Llorando” una sola volta per David Lynch, senza sapere che lui la stava registrando. Lynch usò proprio quell’esecuzione nel film.',
    source:
      'https://en.wikipedia.org/wiki/Mulholland_Drive_(film)#:~:text=she%20sang%20the%20song%20for%20him%20once%20without%20knowing%20that%20he%20was%20recording%20her',
  },
  'movie:1091': {
    en: "The creature effects used an unlikely mix of materials including mayonnaise, creamed corn, microwaved bubble gum and K-Y Jelly.",
    de: 'Für die Kreatureneffekte kam eine ungewöhnliche Mischung zum Einsatz: Mayonnaise, Maiscreme, Kaugummi aus der Mikrowelle und K-Y Jelly.',
    pt: 'Os efeitos das criaturas usaram uma mistura improvável de materiais, incluindo maionese, creme de milho, chiclete aquecido no micro-ondas e K-Y Jelly.',
    fr: 'Les effets des créatures utilisèrent un mélange improbable de matériaux, notamment de la mayonnaise, du maïs à la crème, du chewing-gum passé au micro-ondes et du K-Y Jelly.',
    es: 'Los efectos de las criaturas usaron una mezcla insólita de materiales, entre ellos mayonesa, crema de maíz, chicle calentado en el microondas y K-Y Jelly.',
    it: 'Gli effetti delle creature usarono un’improbabile miscela di materiali, tra cui maionese, crema di mais, gomma da masticare scaldata al microonde e K-Y Jelly.',
    source:
      'https://en.wikipedia.org/wiki/The_Thing_(1982_film)#:~:text=microwaved%20bubble%20gum',
  },
  'movie:426': {
    en: 'After filming the famous dolly zoom on a full-sized set proved difficult, a model of the tower shaft was built and the shot was filmed horizontally.',
    de: 'Nachdem sich der berühmte Dolly-Zoom auf einem lebensgroßen Set als schwierig erwies, baute man ein Modell des Turmschachts und filmte die Aufnahme horizontal.',
    pt: 'Depois que filmar o famoso dolly zoom em um cenário em tamanho real se mostrou difícil, foi construída uma maquete do poço da torre e a tomada foi filmada na horizontal.',
    fr: 'Le célèbre travelling compensé étant difficile à filmer sur un décor grandeur nature, une maquette de la cage de la tour fut construite et le plan fut tourné à l’horizontale.',
    es: 'Como resultó difícil filmar el famoso dolly zoom en un decorado de tamaño real, se construyó una maqueta del hueco de la torre y la toma se rodó en horizontal.',
    it: 'Poiché filmare il celebre dolly zoom su un set a grandezza naturale si rivelò difficile, fu costruito un modello del vano della torre e la ripresa venne girata in orizzontale.',
    source:
      'https://en.wikipedia.org/wiki/Vertigo_(film)#:~:text=Following%20difficulties%20filming%20the%20shot%20on%20a%20full-sized%20set%2C%20a%20model%20of%20the%20tower%20shaft%20was%20constructed%2C%20and%20the%20dolly%20zoom%20was%20filmed%20horizontally',
  },
  'movie:840': {
    en: 'The mothership miniature hides a tiny R2-D2 on its underside and a pea-sized TIE fighter on one of its projecting structures.',
    de: 'Im Miniaturmodell des Mutterschiffs verstecken sich ein winziger R2-D2 an der Unterseite und ein erbsengroßer TIE-Jäger an einem der herausragenden Bauteile.',
    pt: 'A miniatura da nave-mãe esconde um pequeno R2-D2 na parte inferior e um caça TIE do tamanho de uma ervilha em uma de suas estruturas salientes.',
    fr: 'La maquette du vaisseau-mère cache un minuscule R2-D2 sous sa coque et un chasseur TIE de la taille d’un petit pois au bout de l’une de ses structures saillantes.',
    es: 'La miniatura de la nave nodriza esconde un diminuto R2-D2 en la parte inferior y un caza TIE del tamaño de un guisante al final de una de sus estructuras salientes.',
    it: 'Il modellino dell’astronave madre nasconde un minuscolo R2-D2 sul lato inferiore e un caccia TIE grande quanto un pisello all’estremità di una delle strutture sporgenti.',
    source:
      'https://en.wikipedia.org/wiki/Close_Encounters_of_the_Third_Kind#:~:text=put%20a%20small%20R2-D2%20model%20onto%20the%20underside%20of%20the%20mothership',
  },
  'movie:679': {
    en: 'The nuclear explosion of the colony in the finale was created simply by shining a light bulb through cotton.',
    de: 'Die nukleare Explosion der Kolonie im Finale entstand ganz einfach, indem eine Glühbirne durch Watte leuchtete.',
    pt: 'A explosão nuclear da colônia no final foi criada simplesmente fazendo uma lâmpada brilhar através de algodão.',
    fr: 'L’explosion nucléaire de la colonie dans le final fut créée simplement en faisant briller une ampoule à travers du coton.',
    es: 'La explosión nuclear de la colonia en el final se creó simplemente haciendo brillar una bombilla a través de algodón.',
    it: 'L’esplosione nucleare della colonia nel finale fu creata semplicemente facendo brillare una lampadina attraverso del cotone.',
    source:
      'https://en.wikipedia.org/wiki/Aliens_(film)#:~:text=The%20nuclear%20explosion%20of%20the%20colony%20in%20the%20finale%20was%20created%20by%20shining%20a%20light%20bulb%20through%20cotton',
  },
  'movie:792': {
    en: 'Before filming, the principal actors completed an immersive 30-day military-style training regimen led by Vietnam War veteran Dale Dye.',
    de: 'Vor dem Dreh absolvierten die Hauptdarsteller ein intensives 30-tägiges Militärtraining unter der Leitung des Vietnamkriegsveteranen Dale Dye.',
    pt: 'Antes das filmagens, os atores principais fizeram um treinamento militar imersivo de 30 dias liderado pelo veterano da Guerra do Vietnã Dale Dye.',
    fr: 'Avant le tournage, les acteurs principaux suivirent un entraînement militaire immersif de 30 jours dirigé par Dale Dye, vétéran de la guerre du Viêt Nam.',
    es: 'Antes del rodaje, los actores principales completaron un entrenamiento militar inmersivo de 30 días dirigido por el veterano de la guerra de Vietnam Dale Dye.',
    it: 'Prima delle riprese, gli attori principali completarono un addestramento militare immersivo di 30 giorni guidato dal veterano della guerra del Vietnam Dale Dye.',
    source:
      'https://en.wikipedia.org/wiki/Platoon_(film)#:~:text=immersive%2030-day%20military-style%20training%20regimen',
  },
  'movie:268': {
    en: 'For the interiors of Axis Chemicals, Batman reused the power-plant and alien-nest sets from Aliens.',
    de: 'Für die Innenräume von Axis Chemicals wurden in Batman die Kraftwerks- und Aliennest-Kulissen aus Aliens wiederverwendet.',
    pt: 'Para os interiores da Axis Chemicals, Batman reutilizou os cenários da usina e do ninho alienígena de Aliens.',
    fr: 'Pour les intérieurs d’Axis Chemicals, Batman réutilisa les décors de la centrale et du nid extraterrestre d’Aliens.',
    es: 'Para los interiores de Axis Chemicals, Batman reutilizó los decorados de la central y del nido alienígena de Aliens.',
    it: 'Per gli interni della Axis Chemicals, Batman riutilizzò i set della centrale e del nido alieno di Aliens.',
    source:
      'https://en.wikipedia.org/wiki/Batman_(1989_film)#:~:text=the%20power%20plant%20and%20alien%20nest%20sets%20from%20Aliens',
  },
  'movie:22': {
    en: 'Of the film’s 600 visual-effects shots, 250 were used simply to remove modern sailboats from the image.',
    de: 'Von den 600 visuellen Effektaufnahmen des Films dienten 250 allein dazu, moderne Segelboote aus dem Bild zu entfernen.',
    pt: 'Das 600 tomadas de efeitos visuais do filme, 250 serviram apenas para remover veleiros modernos da imagem.',
    fr: 'Sur les 600 plans à effets visuels du film, 250 servirent simplement à retirer des voiliers modernes de l’image.',
    es: 'De las 600 tomas de efectos visuales de la película, 250 se usaron únicamente para eliminar veleros modernos de la imagen.',
    it: 'Delle 600 inquadrature con effetti visivi del film, 250 servirono soltanto a rimuovere moderne barche a vela dall’immagine.',
    source:
      'https://en.wikipedia.org/wiki/Pirates_of_the_Caribbean:_The_Curse_of_the_Black_Pearl#:~:text=There%20were%20600%20visual%20effects%20shots%2C%20250%20of%20which%20involved%20merely%20removing%20modern%20sailboats',
  },
  'movie:19995': {
    en: 'Before soundstage filming began, James Cameron sent the cast to Hawaii so they could get a feel for a rainforest setting.',
    de: 'Bevor die Dreharbeiten im Studio begannen, schickte James Cameron die Besetzung nach Hawaii, damit sie ein Gefühl für die Umgebung eines Regenwaldes bekam.',
    pt: 'Antes do início das filmagens em estúdio, James Cameron enviou o elenco ao Havaí para que conhecesse a sensação de estar em uma floresta tropical.',
    fr: 'Avant le début du tournage en studio, James Cameron envoya les acteurs à Hawaï pour qu’ils s’imprègnent d’un environnement de forêt tropicale.',
    es: 'Antes de comenzar el rodaje en estudio, James Cameron envió al reparto a Hawái para que experimentara el entorno de una selva tropical.',
    it: 'Prima dell’inizio delle riprese in studio, James Cameron mandò il cast alle Hawaii perché potesse familiarizzare con l’ambiente di una foresta pluviale.',
    source:
      'https://en.wikipedia.org/wiki/Avatar_(2009_film)#:~:text=Cameron%20sent%20the%20cast%20to%20Hawaii%20to%20get%20a%20feel%20for%20a%20rainforest%20setting',
  },
  'movie:49026': {
    en: 'Hans Zimmer crowdsourced online recordings of the “Deshi Basara” chant for use in the film’s score.',
    de: 'Hans Zimmer sammelte per Crowdsourcing Online-Aufnahmen des „Deshi Basara“-Gesangs für die Filmmusik.',
    pt: 'Hans Zimmer recorreu ao crowdsourcing para reunir gravações on-line do canto “Deshi Basara” para a trilha sonora do filme.',
    fr: 'Hans Zimmer fit appel au crowdsourcing pour recueillir en ligne des enregistrements du chant « Deshi Basara » destinés à la musique du film.',
    es: 'Hans Zimmer recurrió al crowdsourcing para reunir grabaciones en línea del canto «Deshi Basara» para la banda sonora de la película.',
    it: 'Hans Zimmer ricorse al crowdsourcing per raccogliere online registrazioni del canto «Deshi Basara» da usare nella colonna sonora del film.',
    source:
      'https://en.wikipedia.org/wiki/The_Dark_Knight_Rises#:~:text=Zimmer%20crowdsourced%20online%20audio%20recordings%20of%20the%20chant%20to%20be%20used%20in%20the%20film%27s%20score',
  },
  'movie:510': {
    en: 'During rehearsals, the cast observed patients’ daily routines and group therapy; Jack Nicholson and Louise Fletcher also witnessed electroconvulsive therapy.',
    de: 'Während der Proben beobachtete die Besetzung den Alltag und die Gruppentherapie von Patienten; Jack Nicholson und Louise Fletcher erlebten außerdem eine Elektrokrampftherapie mit.',
    pt: 'Durante os ensaios, o elenco observou a rotina diária e a terapia em grupo dos pacientes; Jack Nicholson e Louise Fletcher também presenciaram uma eletroconvulsoterapia.',
    fr: 'Pendant les répétitions, les acteurs observèrent le quotidien et les séances de thérapie de groupe des patients ; Jack Nicholson et Louise Fletcher assistèrent également à une électroconvulsivothérapie.',
    es: 'Durante los ensayos, el reparto observó la rutina diaria y la terapia de grupo de los pacientes; Jack Nicholson y Louise Fletcher también presenciaron una terapia electroconvulsiva.',
    it: 'Durante le prove, il cast osservò la routine quotidiana e la terapia di gruppo dei pazienti; Jack Nicholson e Louise Fletcher assistettero anche a una terapia elettroconvulsivante.',
    source:
      'https://en.wikipedia.org/wiki/One_Flew_Over_the_Cuckoo%27s_Nest_(film)#:~:text=The%20cast%20watched%20the%20patients%20in%20their%20daily%20routine%20and%20at%20group%20therapy,being%20performed%20on%20a%20patient',
  },
  'movie:1924': {
    en: 'Christopher Reeve refused to wear a muscle suit and instead trained until his weight rose from 188 to 212 pounds during production.',
    de: 'Christopher Reeve lehnte einen Muskelanzug ab und trainierte stattdessen so lange, bis sein Gewicht während der Produktion von 188 auf 212 Pfund stieg.',
    pt: 'Christopher Reeve recusou usar um traje musculoso e preferiu treinar até seu peso aumentar de 188 para 212 libras durante a produção.',
    fr: 'Christopher Reeve refusa de porter un costume rembourré et préféra s’entraîner jusqu’à passer de 188 à 212 livres pendant la production.',
    es: 'Christopher Reeve se negó a usar un traje musculoso y prefirió entrenar hasta que su peso aumentó de 188 a 212 libras durante la producción.',
    it: 'Christopher Reeve rifiutò di indossare un costume muscoloso e preferì allenarsi finché il suo peso passò da 188 a 212 libbre durante la produzione.',
    source:
      'https://en.wikipedia.org/wiki/Superman_(1978_film)#:~:text=He%20was%20told%20to%20wear%20a%20%22muscle%20suit%22%20to%20produce%20the%20desired%20muscular%20physique%2C%20but%20Reeve%20refused,Reeve%20went%20from%20188%20pounds%20(85%20kg)%20to%20212%20pounds%20(96%20kg)%20during%20pre-production%20and%20filming',
  },
  'movie:857': {
    en: 'Steven Spielberg deliberately excluded Matt Damon from the main cast’s six-day boot camp so that the other actors would resent him and his character.',
    de: 'Steven Spielberg ließ Matt Damon bewusst nicht am sechstägigen Bootcamp der Hauptbesetzung teilnehmen. So sollten die anderen Schauspieler ihm und seiner Figur gegenüber echten Groll entwickeln.',
    pt: 'Steven Spielberg excluiu deliberadamente Matt Damon do treinamento militar de seis dias do elenco principal para que os outros atores ressentissem dele e de seu personagem.',
    fr: 'Steven Spielberg exclut délibérément Matt Damon du stage militaire de six jours suivi par les acteurs principaux afin que les autres lui en veuillent, ainsi qu’à son personnage.',
    es: 'Steven Spielberg excluyó deliberadamente a Matt Damon del campamento militar de seis días del reparto principal para que los demás actores sintieran resentimiento hacia él y su personaje.',
    it: 'Steven Spielberg escluse deliberatamente Matt Damon dai sei giorni di addestramento militare del cast principale affinché gli altri attori provassero risentimento verso di lui e il suo personaggio.',
    source:
      'https://en.wikipedia.org/wiki/Saving_Private_Ryan#:~:text=Spielberg%20kept%20Damon%20out%20of%20the%20boot%20camp%20because%20he%20wanted%20the%20other%20actors%20to%20resent%20him%20and%20his%20character',
  },
  'movie:281957': {
    en: 'The Revenant was shot using natural light, and reaching its remote locations and returning from them could consume 40 percent of the filming day.',
    de: 'The Revenant wurde mit natürlichem Licht an so abgelegenen Orten gedreht, dass allein die Hin- und Rückwege rund 40 Prozent eines Drehtags beanspruchten.',
    pt: 'The Revenant foi filmado com luz natural, e chegar às locações remotas e voltar delas podia consumir 40 por cento do dia de filmagem.',
    fr: 'The Revenant fut tourné en lumière naturelle, et les trajets aller-retour vers ses lieux reculés pouvaient prendre 40 pour cent d’une journée de tournage.',
    es: 'The Revenant se rodó con luz natural, y llegar a sus remotas localizaciones y regresar de ellas podía consumir el 40 por ciento de la jornada de rodaje.',
    it: 'The Revenant fu girato con luce naturale, e raggiungere le location remote e tornare indietro poteva assorbire il 40 per cento della giornata di riprese.',
    source:
      'https://en.wikipedia.org/wiki/The_Revenant_(2015_film)#:~:text=shot%20the%20film%20using%20natural%20lighting,we%20have%20already%20spent%2040%25%20of%20the%20day',
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
  'tv:1402': {
    en: 'Every walker goes through “zombie school” to learn how to move like a zombie before appearing in The Walking Dead.',
    de: 'Jeder Walker besucht eine „Zombie-Schule“, um vor seinem Auftritt in The Walking Dead zu lernen, wie sich ein Zombie bewegt.',
    pt: 'Todos os figurantes que interpretam caminhantes passam por uma “escola de zumbis” para aprender a se mover como zumbis antes de aparecer em The Walking Dead.',
    fr: 'Tous les figurants qui jouent des rôdeurs passent par une « école de zombies » pour apprendre à se déplacer comme des zombies avant d’apparaître dans The Walking Dead.',
    es: 'Todos los extras que interpretan caminantes pasan por una «escuela de zombis» para aprender a moverse como zombis antes de aparecer en The Walking Dead.',
    it: 'Tutte le comparse che interpretano i vaganti frequentano una “scuola per zombie” per imparare a muoversi come zombie prima di apparire in The Walking Dead.',
    source:
      'https://en.wikipedia.org/wiki/The_Walking_Dead_(TV_series)#:~:text=Each%20walker%20is%20put%20through%20%22zombie%20school%22%20and%20is%20taught%20how%20to%20move%20like%20a%20zombie',
  },
  'tv:1425': {
    en: 'Russia vetoed filming three House of Cards episodes inside the UN Security Council chamber at the last minute.',
    de: 'Russland verhinderte in letzter Minute, dass drei Folgen von House of Cards im Saal des UN-Sicherheitsrats gedreht wurden.',
    pt: 'A Rússia vetou, no último minuto, as filmagens de três episódios de House of Cards dentro da sala do Conselho de Segurança da ONU.',
    fr: 'La Russie a opposé son veto, à la dernière minute, au tournage de trois épisodes de House of Cards dans la salle du Conseil de sécurité de l’ONU.',
    es: 'Rusia vetó en el último momento el rodaje de tres episodios de House of Cards dentro de la sala del Consejo de Seguridad de la ONU.',
    it: 'La Russia pose il veto all’ultimo minuto alle riprese di tre episodi di House of Cards nella sala del Consiglio di sicurezza dell’ONU.',
    source:
      'https://en.wikipedia.org/wiki/House_of_Cards_(American_TV_series)#:~:text=filming%20of%20three%20episodes%20in%20the%20UN%20Security%20Council%20chamber%20was%20vetoed%20by%20Russia%20at%20the%20last%20minute',
  },
  'tv:4087': {
    en: 'The X-Files theme’s famous echo was an accident: frustrated composer Mark Snow put his hand and forearm on his keyboard and activated the effect by mistake.',
    de: 'Das berühmte Echo der Titelmusik von The X-Files entstand durch Zufall: Der frustrierte Komponist Mark Snow legte Hand und Unterarm auf sein Keyboard und löste den Effekt versehentlich aus.',
    pt: 'O famoso eco do tema de The X-Files surgiu por acaso: frustrado, o compositor Mark Snow apoiou a mão e o antebraço no teclado e ativou o efeito sem querer.',
    fr: 'Le célèbre écho du générique de The X-Files est né par accident : frustré, le compositeur Mark Snow a posé sa main et son avant-bras sur son clavier et déclenché l’effet par inadvertance.',
    es: 'El famoso eco de la sintonía de The X-Files surgió por accidente: frustrado, el compositor Mark Snow apoyó la mano y el antebrazo en el teclado y activó el efecto sin querer.',
    it: 'Il celebre eco della sigla di The X-Files nacque per caso: frustrato, il compositore Mark Snow appoggiò la mano e l’avambraccio sulla tastiera e attivò l’effetto per errore.',
    source:
      'https://en.wikipedia.org/wiki/The_X-Files#:~:text=Snow%20created%20the%20echo%20effect%20on%20the%20track%20by%20accident&text=he%20accidentally%20activated%20an%20echo%20effect%20setting',
  },
  'tv:688': {
    en: 'The White House set was fully connected, allowing The West Wing to film its trademark hallway conversations as long shots with very few cuts.',
    de: 'Die Kulisse des Weißen Hauses war vollständig verbunden, sodass The West Wing seine typischen Gespräche auf den Fluren in langen Aufnahmen mit sehr wenigen Schnitten drehen konnte.',
    pt: 'O cenário da Casa Branca era totalmente interligado, permitindo que The West Wing filmasse suas famosas conversas pelos corredores em planos longos com pouquíssimos cortes.',
    fr: 'Le décor de la Maison-Blanche était entièrement relié, ce qui permettait à The West Wing de filmer ses célèbres conversations dans les couloirs en longs plans avec très peu de coupes.',
    es: 'El plató de la Casa Blanca estaba totalmente conectado, lo que permitió a The West Wing rodar sus famosas conversaciones por los pasillos en planos largos con muy pocos cortes.',
    it: 'Il set della Casa Bianca era completamente collegato, permettendo a The West Wing di girare le sue celebri conversazioni nei corridoi con lunghe riprese e pochissimi stacchi.',
    source:
      'https://en.wikipedia.org/wiki/The_West_Wing#:~:text=A%20large%2C%20fully%20connected%20set&text=shots%20with%20very%20few%20cuts%20and%20long%2C%20continuous%20master%20shots',
  },
  'tv:4613': {
    en: 'Before filming Band of Brothers, military adviser Dale Dye put the actors through a ten-day boot camp that ended with parachute training.',
    de: 'Vor den Dreharbeiten zu Band of Brothers schickte Militärberater Dale Dye die Schauspieler in ein zehntägiges Ausbildungslager, das mit Fallschirmtraining endete.',
    pt: 'Antes das filmagens de Band of Brothers, o consultor militar Dale Dye submeteu os atores a um treinamento militar de dez dias que terminou com instrução de paraquedismo.',
    fr: 'Avant le tournage de Band of Brothers, le conseiller militaire Dale Dye a soumis les acteurs à un camp d’entraînement de dix jours qui s’est achevé par une formation au parachutisme.',
    es: 'Antes del rodaje de Band of Brothers, el asesor militar Dale Dye sometió a los actores a un campamento de entrenamiento de diez días que terminó con prácticas de paracaidismo.',
    it: 'Prima delle riprese di Band of Brothers, il consulente militare Dale Dye sottopose gli attori a un campo di addestramento di dieci giorni concluso con esercitazioni di paracadutismo.',
    source:
      'https://en.wikipedia.org/wiki/Band_of_Brothers_(miniseries)#:~:text=instructed%20the%20actors%20in%20a%2010-day%20boot%20camp',
  },
  'tv:1274': {
    en: 'After reading the first Six Feet Under draft, HBO executive Carolyn Strauss asked Alan Ball to make it more disturbing, giving him permission to take the series deeper and darker.',
    de: 'Nachdem HBO-Managerin Carolyn Strauss den ersten Entwurf von Six Feet Under gelesen hatte, bat sie Alan Ball, ihn verstörender zu machen. Damit gab sie ihm die Freiheit, die Serie tiefgründiger und düsterer zu gestalten.',
    pt: 'Depois de ler o primeiro rascunho de Six Feet Under, a executiva da HBO Carolyn Strauss pediu a Alan Ball que o tornasse mais perturbador, dando-lhe liberdade para aprofundar e escurecer a série.',
    fr: 'Après avoir lu la première version de Six Feet Under, Carolyn Strauss, dirigeante de HBO, a demandé à Alan Ball de la rendre plus dérangeante, lui donnant ainsi la liberté d’approfondir et d’assombrir la série.',
    es: 'Tras leer el primer borrador de Six Feet Under, la ejecutiva de HBO Carolyn Strauss pidió a Alan Ball que lo hiciera más perturbador, dándole libertad para profundizar y oscurecer la serie.',
    it: 'Dopo aver letto la prima bozza di Six Feet Under, la dirigente di HBO Carolyn Strauss chiese ad Alan Ball di renderla più inquietante, dandogli la libertà di approfondire e incupire la serie.',
    source:
      'https://en.wikipedia.org/wiki/Six_Feet_Under_(TV_series)#:~:text=make%20it%20just%20a%20little%20more%20fucked%20up',
  },
  'tv:1406': {
    en: 'David Milch originally planned to explore the rise of civilization through a story set in ancient Rome. Because HBO was already developing Rome, the network asked him to move the idea elsewhere, and it became Deadwood.',
    de: 'David Milch wollte die Entstehung von Zivilisation ursprünglich anhand einer Geschichte im alten Rom untersuchen. Weil HBO bereits Rome entwickelte, bat der Sender ihn um einen anderen Schauplatz, und daraus entstand Deadwood.',
    pt: 'David Milch planejava originalmente explorar o surgimento da civilização em uma história ambientada na Roma Antiga. Como a HBO já desenvolvia Rome, o canal pediu outro cenário, e a ideia se tornou Deadwood.',
    fr: 'David Milch voulait initialement étudier la naissance de la civilisation dans une histoire située dans la Rome antique. Comme HBO développait déjà Rome, la chaîne lui a demandé de déplacer son idée, qui est devenue Deadwood.',
    es: 'David Milch planeaba originalmente explorar el nacimiento de la civilización mediante una historia ambientada en la antigua Roma. Como HBO ya desarrollaba Rome, la cadena le pidió otro escenario, y la idea se convirtió en Deadwood.',
    it: 'David Milch voleva inizialmente esplorare la nascita della civiltà attraverso una storia ambientata nell’antica Roma. Poiché HBO stava già sviluppando Rome, la rete gli chiese un’altra ambientazione e l’idea divenne Deadwood.',
    source:
      'https://en.wikipedia.org/wiki/Deadwood_(TV_series)#:~:text=he%20intended%20to%20study%20this%20within%20Roman%20civilization&text=Milch%20was%20asked%20by%20the%20network%20if%20he%20could%20stage%20the%20story%20in%20another%20place',
  },
  'tv:4589': {
    en: 'Ron Howard narrated only the initial pilot of Arrested Development at first. His voice fit the show so well that the producers decided to keep him as the series narrator.',
    de: 'Ron Howard sprach zunächst nur den Kommentar für die erste Pilotfassung von Arrested Development. Seine Stimme passte so gut zur Serie, dass die Produzenten ihn als Erzähler behielten.',
    pt: 'No início, Ron Howard narrou apenas o piloto inicial de Arrested Development. Sua voz combinou tão bem com a série que os produtores decidiram mantê-lo como narrador.',
    fr: 'Au départ, Ron Howard n’a assuré la narration que du pilote initial d’Arrested Development. Sa voix convenait si bien à la série que les producteurs ont décidé de le garder comme narrateur.',
    es: 'Al principio, Ron Howard solo narró el piloto inicial de Arrested Development. Su voz encajó tan bien con la serie que los productores decidieron mantenerlo como narrador.',
    it: 'Inizialmente Ron Howard narrò soltanto il primo episodio pilota di Arrested Development. La sua voce si adattava così bene alla serie che i produttori decisero di mantenerlo come narratore.',
    source:
      'https://en.wikipedia.org/wiki/Arrested_Development#:~:text=Howard%20provided%20the%20narration%20for%20the%20initial%20pilot&text=the%20decision%20was%20made%20to%20keep%20his%20voice',
  },
  'tv:1891': {
    en: 'Many background performers in Rome practiced the jobs they portrayed in real life. For example, the actor playing a street butcher was actually a butcher.',
    de: 'Viele Komparsen in Rome übten die dargestellten Berufe auch im echten Leben aus. Der Darsteller eines Straßenmetzgers war zum Beispiel tatsächlich Metzger.',
    pt: 'Muitos figurantes de Rome exerciam na vida real as profissões que interpretavam. Por exemplo, o ator que fazia um açougueiro de rua era realmente açougueiro.',
    fr: 'De nombreux figurants de Rome exerçaient réellement les métiers qu’ils représentaient. Par exemple, l’acteur jouant un boucher de rue était véritablement boucher.',
    es: 'Muchos figurantes de Rome ejercían en la vida real los oficios que representaban. Por ejemplo, el actor que hacía de carnicero callejero era realmente carnicero.',
    it: 'Molte comparse di Rome svolgevano davvero i mestieri che interpretavano. Per esempio, l’attore che impersonava un macellaio di strada era realmente un macellaio.',
    source:
      'https://en.wikipedia.org/wiki/Rome_(TV_series)#:~:text=was%20in%20fact%20a%20real-life%20butcher',
  },
  'tv:16997': {
    en: 'The Pacific was initially estimated to cost $100 million, but its final cost exceeded $200 million, making it the most expensive television miniseries ever created at the time.',
    de: 'Für The Pacific waren zunächst 100 Millionen Dollar veranschlagt. Am Ende kostete die Produktion mehr als 200 Millionen Dollar und war damals die teuerste je gedrehte TV-Miniserie.',
    pt: 'The Pacific teve um orçamento inicial estimado em 100 milhões de dólares, mas acabou custando mais de 200 milhões e se tornou a minissérie de televisão mais cara já produzida até então.',
    fr: 'Le budget initial de The Pacific était estimé à 100 millions de dollars, mais la production a finalement coûté plus de 200 millions, ce qui en faisait alors la mini-série télévisée la plus chère jamais créée.',
    es: 'El presupuesto inicial de The Pacific se estimó en 100 millones de dólares, pero acabó costando más de 200 millones y se convirtió entonces en la miniserie de televisión más cara jamás creada.',
    it: 'Il costo iniziale di The Pacific era stimato in 100 milioni di dollari, ma alla fine superò i 200 milioni, rendendola all’epoca la miniserie televisiva più costosa mai realizzata.',
    source:
      'https://en.wikipedia.org/wiki/The_Pacific_(miniseries)#:~:text=Originally%20the%20project%20was%20estimated%20at%20%24100%20million%20to%20produce&text=making%20The%20Pacific%20the%20most%20expensive%20television%20miniseries%20ever%20created%20at%20the%20time',
  },
  'tv:1972': {
    en: 'The opening theme of Battlestar Galactica is a new-age-influenced version of the Gayatri Mantra, a Hindu hymn dedicated to the solar deity Savitr.',
    de: 'Die Titelmusik von Battlestar Galactica ist eine vom New Age beeinflusste Version des Gayatri-Mantras, einer hinduistischen Hymne an die Sonnengottheit Savitr.',
    pt: 'O tema de abertura de Battlestar Galactica é uma versão do Gayatri Mantra com influência new age, um hino hindu dedicado à divindade solar Savitr.',
    fr: 'Le générique de Battlestar Galactica est une version du Gayatri Mantra influencée par le new age, un hymne hindou dédié à la divinité solaire Savitr.',
    es: 'La sintonía de apertura de Battlestar Galactica es una versión del Gayatri Mantra con influencias new age, un himno hindú dedicado a la deidad solar Savitr.',
    it: 'La sigla di Battlestar Galactica è una versione del Gayatri Mantra influenzata dalla new age, un inno induista dedicato alla divinità solare Savitr.',
    source:
      'https://en.wikipedia.org/wiki/Battlestar_Galactica_(2004_TV_series)#:~:text=The%20opening%20theme%20is%20a%20new-age-inflected%20version%20of%20the%20Gayatri%20Mantra&text=a%20Hindu%20hymn%20dedicated%20to%20the%20solar%20deity%20Savitr',
  },
  'tv:4608': {
    en: '30 Rock once built an elaborate set that took three days to construct for only six seconds of screen time.',
    de: '30 Rock baute einmal eine aufwendige Kulisse, deren Errichtung drei Tage dauerte und die nur sechs Sekunden lang im Bild war.',
    pt: '30 Rock construiu certa vez um cenário elaborado que levou três dias para ficar pronto e apareceu na tela por apenas seis segundos.',
    fr: '30 Rock a un jour construit un décor élaboré dont la réalisation a pris trois jours pour seulement six secondes à l’écran.',
    es: '30 Rock construyó una vez un elaborado decorado que tardó tres días en completarse para aparecer en pantalla solo seis segundos.',
    it: '30 Rock costruì una volta un set elaborato che richiese tre giorni di lavoro per appena sei secondi sullo schermo.',
    source:
      'https://en.wikipedia.org/wiki/30_Rock#:~:text=once%20using%20a%20set%20that%20took%20three%20days%20to%20build%20for%20only%20six%20seconds%20of%20screen%20time',
  },
  'tv:1414': {
    en: 'The Shield creator Shawn Ryan based the pilot’s ending on an alternate ending he had imagined for Donnie Brasco, in which Al Pacino’s mobster shoots Johnny Depp’s undercover agent because he knew his identity all along.',
    de: 'Der Schöpfer von The Shield, Shawn Ryan, übernahm das Ende der Pilotfolge aus einem alternativen Ende, das er sich für Donnie Brasco ausgedacht hatte: Al Pacinos Mafioso erschießt Johnny Depps Undercoveragenten, weil er dessen Identität die ganze Zeit kannte.',
    pt: 'Shawn Ryan, criador de The Shield, baseou o final do episódio piloto em um desfecho alternativo que havia imaginado para Donnie Brasco: o mafioso de Al Pacino atira no agente infiltrado de Johnny Depp porque sempre soube sua identidade.',
    fr: 'Shawn Ryan, créateur de The Shield, a fondé la fin du pilote sur une fin alternative qu’il avait imaginée pour Donnie Brasco : le mafieux d’Al Pacino abat l’agent infiltré de Johnny Depp parce qu’il connaissait son identité depuis le début.',
    es: 'Shawn Ryan, creador de The Shield, basó el final del piloto en un desenlace alternativo que había imaginado para Donnie Brasco: el mafioso de Al Pacino dispara al agente encubierto de Johnny Depp porque siempre conoció su identidad.',
    it: 'Shawn Ryan, creatore di The Shield, basò il finale dell’episodio pilota su un finale alternativo che aveva immaginato per Donnie Brasco: il mafioso di Al Pacino spara all’agente sotto copertura di Johnny Depp perché ne conosceva da sempre l’identità.',
    source:
      'https://en.wikipedia.org/wiki/The_Shield#:~:text=Ryan%20had%20the%20idea%20of%20an%20alternate%20ending%20to%20Donnie%20Brasco&text=He%20used%20this%20ending%20idea%20in%20the%20pilot%20for%20The%20Shield',
  },
  'tv:4278': {
    en: 'Friday Night Lights was filmed without rehearsal or extensive blocking. Three camera operators followed the actors instead, and first takes usually made the final cut.',
    de: 'Friday Night Lights wurde ohne Proben oder umfangreiche Bewegungsplanung gedreht. Stattdessen folgten drei Kameraleute den Schauspielern, und meist landete schon die erste Aufnahme in der fertigen Folge.',
    pt: 'Friday Night Lights foi filmada sem ensaios nem marcações extensas. Três operadores de câmera acompanhavam os atores, e geralmente a primeira tomada entrava no corte final.',
    fr: 'Friday Night Lights était tournée sans répétitions ni mise en place détaillée. Trois cadreurs suivaient plutôt les acteurs, et les premières prises finissaient généralement dans le montage final.',
    es: 'Friday Night Lights se rodaba sin ensayos ni una planificación exhaustiva de movimientos. Tres operadores de cámara seguían a los actores, y las primeras tomas solían acabar en el montaje final.',
    it: 'Friday Night Lights veniva girata senza prove né una pianificazione dettagliata dei movimenti. Tre operatori seguivano invece gli attori e di solito le prime riprese finivano nel montaggio definitivo.',
    source:
      'https://en.wikipedia.org/wiki/Friday_Night_Lights_(TV_series)#:~:text=This%20freedom%20was%20complemented%20by%20filming%20without%20rehearsal%20and%20without%20extensive%20blocking&text=The%20first%20takes%20usually%20made%20the%20final%20cut',
  },
  'tv:1436': {
    en: 'Boyd Crowder was supposed to die in the Justified pilot, but the character was kept after test audiences liked Walton Goggins’ performance. Goggins became a main cast member from season two.',
    de: 'Boyd Crowder sollte in der Pilotfolge von Justified sterben. Weil das Testpublikum Walton Goggins’ Darstellung mochte, blieb die Figur jedoch erhalten, und Goggins gehörte ab Staffel zwei zur Hauptbesetzung.',
    pt: 'Boyd Crowder deveria morrer no episódio piloto de Justified, mas o personagem foi mantido porque o público de teste gostou da atuação de Walton Goggins. A partir da segunda temporada, Goggins integrou o elenco principal.',
    fr: 'Boyd Crowder devait mourir dans le pilote de Justified, mais le personnage a été conservé après que le public test eut apprécié la prestation de Walton Goggins. Dès la deuxième saison, Goggins a rejoint la distribution principale.',
    es: 'Boyd Crowder debía morir en el piloto de Justified, pero conservaron al personaje porque al público de prueba le gustó la interpretación de Walton Goggins. Desde la segunda temporada, Goggins formó parte del reparto principal.',
    it: 'Boyd Crowder avrebbe dovuto morire nell’episodio pilota di Justified, ma il personaggio fu mantenuto perché il pubblico di prova apprezzò l’interpretazione di Walton Goggins. Dalla seconda stagione, Goggins entrò nel cast principale.',
    source:
      'https://en.wikipedia.org/wiki/Justified_(TV_series)#:~:text=The%20character%20of%20Boyd%20was%20intended%20to%20die%20in%20the%20pilot%20episode&text=Goggins%20was%20promoted%20to%20main%20cast%20from%20season%202%20onward',
  },
  'tv:17967': {
    en: 'Treme’s title card changed with each season to mirror New Orleans’ recovery: it progressed from a mold damaged backdrop to a newly painted white wall that actor Clarke Peters finished by hand.',
    de: 'Die Titelkarte von Treme veränderte sich mit jeder Staffel und spiegelte so den Wiederaufbau von New Orleans wider: Auf einen schimmelgeschädigten Hintergrund folgte schließlich eine frisch gestrichene weiße Wand, der Schauspieler Clarke Peters von Hand den letzten Schliff gab.',
    pt: 'O cartão de título de Treme mudava a cada temporada para refletir a recuperação de Nova Orleans: passou de um fundo danificado por mofo a uma parede branca recém pintada, finalizada à mão pelo ator Clarke Peters.',
    fr: 'Le carton titre de Treme changeait à chaque saison pour refléter la reconstruction de La Nouvelle Orléans : le fond abîmé par la moisissure a fini par devenir un mur blanc fraîchement peint, auquel l’acteur Clarke Peters a apporté les dernières touches à la main.',
    es: 'La tarjeta del título de Treme cambiaba cada temporada para reflejar la recuperación de Nueva Orleans: pasó de un fondo dañado por el moho a una pared blanca recién pintada, rematada a mano por el actor Clarke Peters.',
    it: 'Il cartello del titolo di Treme cambiava a ogni stagione per riflettere la rinascita di New Orleans: da uno sfondo danneggiato dalla muffa passò infine a una parete bianca appena dipinta, rifinita a mano dall’attore Clarke Peters.',
    source:
      'https://en.wikipedia.org/wiki/Treme_(TV_series)#:~:text=The%20Treme%20title%20card%20evolves%20with%20each%20season%2C%20to%20evoke%20the%20recovery%20of%20New%20Orleans&text=Clarke%20Peters%20provided%20the%20hand-brushed%20finishing%20touches',
  },
  'tv:2947': {
    en: 'Before filming Veep began, the cast spent several months rehearsing so the actors would become comfortable improvising with one another.',
    de: 'Bevor die Dreharbeiten zu Veep begannen, probte die Besetzung mehrere Monate lang, damit sich die Schauspieler beim gemeinsamen Improvisieren wohlfühlten.',
    pt: 'Antes do início das filmagens de Veep, o elenco ensaiou durante vários meses para que os atores se sentissem à vontade improvisando juntos.',
    fr: 'Avant le début du tournage de Veep, la distribution a répété pendant plusieurs mois afin que les acteurs soient à l’aise pour improviser ensemble.',
    es: 'Antes de comenzar el rodaje de Veep, el reparto ensayó durante varios meses para que los actores se sintieran cómodos improvisando juntos.',
    it: 'Prima dell’inizio delle riprese di Veep, il cast provò per diversi mesi affinché gli attori si sentissero a proprio agio nell’improvvisare insieme.',
    source:
      'https://en.wikipedia.org/wiki/Veep#:~:text=filming%20for%20the%20series%20began%20in%20October%202011%20in%20Baltimore&text=after%20several%20months%20of%20rehearsal%20designed%20to%20get%20the%20actors%20comfortable%20improvising%20with%20one%20another',
  },
  'tv:18347': {
    en: 'Dan Harmon devised Community from his own life: he enrolled in a community-college Spanish class to save a relationship, joined a study group and unexpectedly became close to people with whom he had little in common.',
    de: 'Dan Harmon entwickelte Community aus seinem eigenen Leben: Um eine Beziehung zu retten, belegte er einen Spanischkurs an einem Community College, schloss sich einer Lerngruppe an und freundete sich unerwartet mit Menschen an, mit denen er wenig gemeinsam hatte.',
    pt: 'Dan Harmon criou Community a partir da própria vida: matriculou-se em uma aula de espanhol numa faculdade comunitária para salvar um relacionamento, entrou em um grupo de estudos e, inesperadamente, tornou-se amigo de pessoas com quem tinha pouco em comum.',
    fr: 'Dan Harmon a imaginé Community à partir de sa propre vie : pour sauver une relation, il s’est inscrit à un cours d’espagnol dans un community college, a rejoint un groupe d’étude et s’est lié contre toute attente avec des personnes avec lesquelles il avait peu en commun.',
    es: 'Dan Harmon ideó Community a partir de su propia vida: para salvar una relación, se matriculó en una clase de español de un community college, se unió a un grupo de estudio y, contra todo pronóstico, entabló amistad con personas con las que tenía poco en común.',
    it: 'Dan Harmon ideò Community partendo dalla propria vita: per salvare una relazione si iscrisse a un corso di spagnolo in un community college, entrò in un gruppo di studio e, inaspettatamente, strinse amicizia con persone con cui aveva poco in comune.',
    source:
      'https://en.wikipedia.org/wiki/Community_(TV_series)#:~:text=Harmon%20based%20the%20premise%20of%20Community%20on%20his%20own%20experiences&text=became%20close%20friends%20with%20the%20members%2C%20with%20whom%20he%20had%20very%20little%20in%20common',
  },
  'tv:8592': {
    en: 'Ron Swanson’s anti-government convictions were inspired by creator Michael Schur meeting a real libertarian government official who admitted, “I don’t really believe in the mission of my job.”',
    de: 'Ron Swansons staatsfeindliche Überzeugungen entstanden, nachdem Serienschöpfer Michael Schur einen echten libertären Behördenmitarbeiter traf, der zugab: „Ich glaube nicht wirklich an den Auftrag meiner Arbeit.“',
    pt: 'As convicções antigoverno de Ron Swanson foram inspiradas pelo encontro do criador Michael Schur com uma autoridade governamental libertária de verdade, que admitiu: “Eu realmente não acredito na missão do meu trabalho.”',
    fr: 'Les convictions antigouvernementales de Ron Swanson ont été inspirées par la rencontre du créateur Michael Schur avec un véritable responsable gouvernemental libertarien, qui lui a avoué : « Je ne crois pas vraiment à la mission de mon travail. »',
    es: 'Las convicciones antigubernamentales de Ron Swanson se inspiraron en el encuentro del creador Michael Schur con un funcionario público libertario real, quien admitió: «No creo realmente en la misión de mi trabajo».',
    it: 'Le convinzioni antigovernative di Ron Swanson nacquero dall’incontro del creatore Michael Schur con un vero funzionario pubblico libertario, che ammise: «Non credo davvero nella missione del mio lavoro».',
    source:
      'https://en.wikipedia.org/wiki/Parks_and_Recreation#:~:text=the%20inspiration%20for%20Ron%20Swanson%27s%20anti-government%20convictions%20came%20from%20a%20real-life%20encounter%20Schur%20had%20in%20Burbank&text=I%20don%27t%20really%20believe%20in%20the%20mission%20of%20my%20job',
  },
  'tv:4546': {
    en: 'Raw footage filmed for Curb Your Enthusiasm at Dodger Stadium inadvertently gave murder suspect Juan Catalan an alibi, helping to exonerate him while he faced the death penalty.',
    de: 'Rohmaterial, das für Curb Your Enthusiasm im Dodger Stadium gedreht wurde, lieferte dem Mordverdächtigen Juan Catalan unbeabsichtigt ein Alibi und half so, ihn zu entlasten, während ihm die Todesstrafe drohte.',
    pt: 'Imagens brutas filmadas para Curb Your Enthusiasm no Dodger Stadium deram involuntariamente um álibi ao suspeito de assassinato Juan Catalan e ajudaram a inocentá-lo quando ele enfrentava a pena de morte.',
    fr: 'Des images brutes tournées pour Curb Your Enthusiasm au Dodger Stadium ont fourni par hasard un alibi à Juan Catalan, soupçonné de meurtre, et ont contribué à le disculper alors qu’il risquait la peine de mort.',
    es: 'Imágenes sin editar rodadas para Curb Your Enthusiasm en el Dodger Stadium proporcionaron por casualidad una coartada al sospechoso de asesinato Juan Catalan y ayudaron a exonerarlo cuando se enfrentaba a la pena de muerte.',
    it: 'Le riprese grezze realizzate per Curb Your Enthusiasm al Dodger Stadium fornirono involontariamente un alibi al sospettato di omicidio Juan Catalan e contribuirono a scagionarlo mentre rischiava la pena di morte.',
    source:
      'https://en.wikipedia.org/wiki/Curb_Your_Enthusiasm#:~:text=contains%20raw%20footage%20from%20the%20filming%20of%20an%20episode%20of%20season%204%20at%20Dodger%20Stadium&text=helped%20to%20inadvertently%20exonerate%20Juan%20Catalan%2C%20who%20was%20accused%20of%20murder%20and%20faced%20the%20death%20penalty',
  },
  'tv:65495': {
    en: 'Atlanta had an all-Black writing staff, something that was virtually unheard of in American television at the time.',
    de: 'Atlanta hatte ein ausschließlich schwarzes Autorenteam, was damals im amerikanischen Fernsehen so gut wie unbekannt war.',
    pt: 'Atlanta tinha uma equipe de roteiristas formada exclusivamente por pessoas negras, algo praticamente inédito na televisão americana da época.',
    fr: 'Atlanta disposait d’une équipe de scénaristes entièrement noire, une situation pratiquement sans précédent dans la télévision américaine de l’époque.',
    es: 'Atlanta contó con un equipo de guionistas formado íntegramente por personas negras, algo prácticamente inaudito en la televisión estadounidense de la época.',
    it: 'Atlanta aveva un gruppo di sceneggiatori composto interamente da persone nere, una cosa praticamente senza precedenti nella televisione americana dell’epoca.',
    source:
      'https://en.wikipedia.org/wiki/Atlanta_(TV_series)#:~:text=The%20series%20is%20also%20notable%20for%20having%20an%20all-Black%20writing%20staff%2C%20which%20was%20virtually%20unheard%20of%20in%20American%20television',
  },
  'tv:61222': {
    en: 'The idea for BoJack Horseman began while Raphael Bob-Waksberg lived in what he called a glorified closet in a Hollywood Hills mansion, feeling simultaneously on top of the world and more isolated than ever.',
    de: 'Die Idee zu BoJack Horseman entstand, als Raphael Bob-Waksberg in dem wohnte, was er als verherrlichten Abstellraum in einer Villa in den Hollywood Hills bezeichnete, und sich zugleich wie auf dem Gipfel der Welt und isolierter denn je fühlte.',
    pt: 'A ideia de BoJack Horseman surgiu quando Raphael Bob-Waksberg morava no que chamou de um armário glorificado em uma mansão nas Hollywood Hills e se sentia, ao mesmo tempo, no topo do mundo e mais isolado do que nunca.',
    fr: 'L’idée de BoJack Horseman est née lorsque Raphael Bob-Waksberg vivait dans ce qu’il appelait un placard glorifié au sein d’une villa des Hollywood Hills, tout en se sentant au sommet du monde et plus isolé que jamais.',
    es: 'La idea de BoJack Horseman nació cuando Raphael Bob-Waksberg vivía en lo que describió como un armario glorificado dentro de una mansión de Hollywood Hills y se sentía a la vez en la cima del mundo y más aislado que nunca.',
    it: 'L’idea di BoJack Horseman nacque mentre Raphael Bob-Waksberg viveva in quello che definì un ripostiglio glorificato in una villa sulle Hollywood Hills, sentendosi allo stesso tempo in cima al mondo e più isolato che mai.',
    source:
      'https://en.wikipedia.org/wiki/BoJack_Horseman#:~:text=living%20in%20what%20he%20described%20as%20%22a%20glorified%20closet%20in%20a%20beautiful%20mansion%22&text=simultaneously%20on%20top%20of%20the%20world%20and%20never%20more%20isolated%20and%20alone',
  },
  'tv:60573': {
    en: 'The Weissman score used in Silicon Valley to compare data compression did not exist before the series. A Stanford professor and graduate student created it at the producers’ request.',
    de: 'Der in Silicon Valley verwendete Weissman-Score zum Vergleich von Datenkompression existierte vor der Serie nicht. Ein Stanford-Professor und ein Student entwickelten ihn auf Wunsch der Produzenten.',
    pt: 'A pontuação Weissman usada em Silicon Valley para comparar compressão de dados não existia antes da série. Um professor de Stanford e um estudante de pós-graduação a criaram a pedido dos produtores.',
    fr: 'Le score de Weissman utilisé dans Silicon Valley pour comparer la compression de données n’existait pas avant la série. Un professeur de Stanford et un étudiant de cycle supérieur l’ont créé à la demande des producteurs.',
    es: 'La puntuación Weissman utilizada en Silicon Valley para comparar la compresión de datos no existía antes de la serie. Un profesor de Stanford y un estudiante de posgrado la crearon a petición de los productores.',
    it: 'Il punteggio Weissman usato in Silicon Valley per confrontare la compressione dei dati non esisteva prima della serie. Un professore di Stanford e uno studente post-laurea lo crearono su richiesta dei produttori.',
    source:
      'https://en.wikipedia.org/wiki/Silicon_Valley_(TV_series)#:~:text=The%20show%20refers%20to%20a%20metric%20in%20comparing%20the%20compression%20rates%20of%20applications%20called%20the%20Weissman%20score%2C%20which%20did%20not%20exist%20before%20the%20show%27s%20run&text=at%20the%20request%20of%20the%20show%27s%20producers',
  },
  'tv:1435': {
    en: 'The Good Wife was conceived after its creators noticed that many wives standing beside politicians during public sex scandals were lawyers who had paused their own careers for their husbands.',
    de: 'Die Idee zu The Good Wife entstand, nachdem die Serienschöpfer bemerkten, dass viele Ehefrauen an der Seite von Politikern bei öffentlichen Sexskandalen selbst Juristinnen waren, die ihre Karriere für ihre Männer unterbrochen hatten.',
    pt: 'The Good Wife foi concebida depois que seus criadores perceberam que muitas esposas ao lado de políticos durante escândalos sexuais públicos eram advogadas que haviam interrompido a própria carreira pelos maridos.',
    fr: 'The Good Wife a été imaginée après que ses créateurs eurent remarqué que de nombreuses épouses aux côtés de politiciens lors de scandales sexuels publics étaient des avocates qui avaient interrompu leur propre carrière pour leur mari.',
    es: 'The Good Wife se concibió después de que sus creadores observaran que muchas esposas al lado de políticos durante escándalos sexuales públicos eran abogadas que habían aparcado su propia carrera por sus maridos.',
    it: 'The Good Wife fu ideata dopo che i suoi creatori notarono che molte mogli al fianco di politici durante scandali sessuali pubblici erano avvocate che avevano sospeso la propria carriera per il marito.',
    source:
      'https://en.wikipedia.org/wiki/The_Good_Wife#:~:text=They%20were%20further%20intrigued%20by%20the%20fact%20that%20many%20of%20the%20wives%20were%20lawyers%20who%20had%20halted%20their%20personal%20careers%20for%20the%20sake%20of%20their%20husbands%27%20professional%20ambitions',
  },
  'tv:73107': {
    en: 'NoHo Hank was originally supposed to be killed by Barry in the pilot, but Anthony Carrigan’s performance impressed the creators so much that they made him a series regular.',
    de: 'NoHo Hank sollte ursprünglich schon in der Pilotfolge von Barry getötet werden. Anthony Carrigans Darstellung beeindruckte die Serienschöpfer jedoch so sehr, dass sie ihn zur Hauptfigur machten.',
    pt: 'NoHo Hank deveria originalmente ser morto por Barry no episódio piloto, mas a atuação de Anthony Carrigan impressionou tanto os criadores que eles o tornaram parte do elenco regular.',
    fr: 'À l’origine, NoHo Hank devait être tué par Barry dans l’épisode pilote, mais la prestation d’Anthony Carrigan impressionna tellement les créateurs qu’ils en firent un personnage régulier.',
    es: 'En un principio, NoHo Hank iba a morir a manos de Barry en el episodio piloto, pero la interpretación de Anthony Carrigan impresionó tanto a los creadores que lo convirtieron en personaje habitual.',
    it: 'In origine NoHo Hank doveva essere ucciso da Barry nell’episodio pilota, ma l’interpretazione di Anthony Carrigan colpì così tanto gli autori che lo resero un personaggio fisso.',
    source:
      'https://en.wikipedia.org/wiki/Barry_(TV_series)#:~:text=Originally%20planned%20to%20be%20killed%20by%20Barry%20in%20the%20pilot%20episode%2C%20Hank%20was%20made%20a%20series%20regular%20after%20Carrigan%27s%20performance%20impressed%20the%20show%27s%20creators',
  },
  'tv:61662': {
    en: 'When networks urged the creators of Schitt’s Creek to change its title, the Levys brought phone-book pages to CBC showing real people with the surname Schitt—and kept the name.',
    de: 'Als Sender die Schöpfer von Schitt’s Creek zu einem anderen Titel drängten, brachten die Levys dem CBC Telefonbuchseiten mit echten Trägern des Nachnamens Schitt – und behielten den Namen.',
    pt: 'Quando emissoras pressionaram os criadores de Schitt’s Creek a mudar o título, os Levy levaram à CBC páginas de uma lista telefônica com pessoas reais de sobrenome Schitt — e mantiveram o nome.',
    fr: 'Lorsque des chaînes poussèrent les créateurs de Schitt’s Creek à changer le titre, les Levy apportèrent à CBC des pages d’annuaire montrant de vraies personnes portant le nom Schitt — et conservèrent le titre.',
    es: 'Cuando varias cadenas instaron a los creadores de Schitt’s Creek a cambiar el título, los Levy llevaron a CBC páginas de una guía telefónica con personas reales de apellido Schitt y conservaron el nombre.',
    it: 'Quando alcune emittenti spinsero gli autori di Schitt’s Creek a cambiare il titolo, i Levy portarono alla CBC pagine dell’elenco telefonico con persone reali di cognome Schitt e mantennero il nome.',
    source:
      'https://en.wikipedia.org/wiki/Schitt%27s_Creek#:~:text=To%20prove%20their%20point%2C%20they%20brought%20pages%20copied%20from%20a%20phone%20book%20to%20the%20CBC%20showing%20listings%20for%20individuals%20with%20the%20%22Schitt%22%20surname&text=allowed%20the%20Levys%20to%20keep%20the%20original%20title',
  },
  'tv:64254': {
    en: 'Aziz Ansari’s real-life parents, Shoukath and Fatima, play his character Dev’s parents in Master of None.',
    de: 'Aziz Ansaris echte Eltern Shoukath und Fatima spielen in Master of None die Eltern seiner Figur Dev.',
    pt: 'Os pais de Aziz Ansari na vida real, Shoukath e Fatima, interpretam os pais de seu personagem Dev em Master of None.',
    fr: 'Les véritables parents d’Aziz Ansari, Shoukath et Fatima, jouent les parents de son personnage Dev dans Master of None.',
    es: 'Los padres de Aziz Ansari en la vida real, Shoukath y Fatima, interpretan a los padres de su personaje Dev en Master of None.',
    it: 'I veri genitori di Aziz Ansari, Shoukath e Fatima, interpretano i genitori del suo personaggio Dev in Master of None.',
    source:
      'https://en.wikipedia.org/wiki/Master_of_None#:~:text=Ansari%27s%20real-life%20parents%20Shoukath%20and%20Fatima%2C%20who%20play%20Dev%27s%20parents',
  },
  'tv:125935': {
    en: 'Quinta Brunson named Abbott Elementary after Joyce Abbott, one of her favorite elementary-school teachers; her mother’s 40-year teaching career inspired the series.',
    de: 'Quinta Brunson benannte Abbott Elementary nach Joyce Abbott, einer ihrer Lieblingslehrerinnen aus der Grundschule; die 40-jährige Lehrerinnenlaufbahn ihrer Mutter inspirierte die Serie.',
    pt: 'Quinta Brunson batizou Abbott Elementary em homenagem a Joyce Abbott, uma de suas professoras favoritas do ensino fundamental; os 40 anos de carreira docente de sua mãe inspiraram a série.',
    fr: 'Quinta Brunson a nommé Abbott Elementary en hommage à Joyce Abbott, l’une de ses institutrices préférées ; les quarante ans de carrière d’enseignante de sa mère ont inspiré la série.',
    es: 'Quinta Brunson llamó Abbott Elementary así por Joyce Abbott, una de sus maestras favoritas de primaria; los 40 años de carrera docente de su madre inspiraron la serie.',
    it: 'Quinta Brunson chiamò Abbott Elementary in onore di Joyce Abbott, una delle sue insegnanti preferite delle elementari; i quarant’anni di carriera di sua madre come insegnante ispirarono la serie.',
    source:
      'https://en.wikipedia.org/wiki/Abbott_Elementary#:~:text=Brunson%20said%20that%20her%20mother%27s%2040-year%20career%20as%20a%20schoolteacher%20inspired%20her%20to%20create%20Abbott%20Elementary%2C%20named%20after%20Joyce%20Abbott%2C%20one%20of%20her%20favorite%20elementary%20school%20teachers',
  },
  'tv:84977': {
    en: 'Russian Doll nearly used Lil’ Kim, Lou Reed or the Stooges for Nadia’s musical reset. Harry Nilsson’s “Gotta Get Up” won out, despite its repeated use consuming a significant part of the music budget.',
    de: 'Für Nadias musikalischen Neustart in Russian Doll waren auch Songs von Lil’ Kim, Lou Reed und den Stooges im Rennen. Trotz erheblicher Kosten für die vielen Einsätze fiel die Wahl auf Harry Nilssons „Gotta Get Up“.',
    pt: 'Russian Doll quase usou Lil’ Kim, Lou Reed ou os Stooges para o reinício musical de Nadia. “Gotta Get Up”, de Harry Nilsson, foi a escolhida, apesar de seu uso repetido consumir uma parte significativa do orçamento musical.',
    fr: 'Russian Doll a failli utiliser Lil’ Kim, Lou Reed ou les Stooges pour le thème de réinitialisation de Nadia. « Gotta Get Up » de Harry Nilsson l’a emporté, malgré le coût important de ses nombreuses utilisations pour le budget musical.',
    es: 'Russian Doll casi utilizó a Lil’ Kim, Lou Reed o los Stooges para el reinicio musical de Nadia. Finalmente se eligió “Gotta Get Up”, de Harry Nilsson, pese a que su uso repetido consumió una parte importante del presupuesto musical.',
    it: 'Russian Doll prese in considerazione Lil’ Kim, Lou Reed e gli Stooges per il reset musicale di Nadia. Alla fine fu scelta “Gotta Get Up” di Harry Nilsson, nonostante i ripetuti utilizzi assorbissero una parte significativa del budget musicale.',
    source:
      'https://en.wikipedia.org/wiki/Russian_Doll_(TV_series)#:~:text=Other%20contenders%20for%20the%20reset%20song%20included%20%22Not%20Tonight%22%20by%20Lil%27%20Kim%2C%20%22Crazy%20Feeling%22%20by%20Lou%20Reed%20and%20%22No%20Fun%22%20by%20the%20Stooges&text=the%20cost%20of%20using%20it%20so%20many%20times%20took%20up%20a%20significant%20portion%20of%20the%20music%20budget',
  },
  'tv:124101': {
    en: 'Because of the COVID-19 pandemic, the Hacks cast held table reads over Zoom. Jean Smart and Carl Clemons-Hopkins did not meet in person until minutes before filming the pilot.',
    de: 'Wegen der COVID-19-Pandemie hielt der Cast von Hacks die Leseproben per Zoom ab. Jean Smart und Carl Clemons-Hopkins trafen sich sogar erst wenige Minuten vor dem Dreh der Pilotfolge persönlich.',
    pt: 'Por causa da pandemia de COVID-19, o elenco de Hacks fez leituras de roteiro pelo Zoom. Jean Smart e Carl Clemons-Hopkins só se conheceram pessoalmente minutos antes da filmagem do episódio piloto.',
    fr: 'En raison de la pandémie de COVID-19, la distribution de Hacks a fait les lectures sur Zoom. Jean Smart et Carl Clemons-Hopkins ne se sont rencontrés en personne que quelques minutes avant le tournage du pilote.',
    es: 'Debido a la pandemia de COVID-19, el reparto de Hacks hizo las lecturas por Zoom; Jean Smart y Carl Clemons-Hopkins no se conocieron en persona hasta minutos antes de rodar el episodio piloto.',
    it: 'A causa della pandemia di COVID-19, il cast di Hacks fece le letture su Zoom: Jean Smart e Carl Clemons-Hopkins si incontrarono di persona solo pochi minuti prima di girare l’episodio pilota.',
    source:
      'https://en.wikipedia.org/wiki/Hacks#:~:text=Because%20of%20the%20COVID-19%20pandemic%2C%20actors%20held%20table%20reads%20over%20Zoom&text=did%20not%20even%20meet%20each%20other%20in%20person%20until%20minutes%20before%20the%20pilot%20was%20filmed',
  },
  'tv:67883': {
    en: 'The success of Insecure’s soundtrack led Issa Rae to establish her own record label, Raedio, in partnership with Atlantic Records.',
    de: 'Der Erfolg des Soundtracks von Insecure führte dazu, dass Issa Rae gemeinsam mit Atlantic Records ihr eigenes Plattenlabel Raedio gründete.',
    pt: 'O sucesso da trilha sonora de Insecure levou Issa Rae a fundar sua própria gravadora, Raedio, em parceria com a Atlantic Records.',
    fr: 'Le succès de la bande originale d’Insecure a conduit Issa Rae à créer son propre label, Raedio, en partenariat avec Atlantic Records.',
    es: 'El éxito de la banda sonora de Insecure llevó a Issa Rae a fundar su propio sello discográfico, Raedio, en colaboración con Atlantic Records.',
    it: 'Il successo della colonna sonora di Insecure portò Issa Rae a fondare la propria etichetta discografica, Raedio, in collaborazione con Atlantic Records.',
    source:
      'https://en.wikipedia.org/wiki/Insecure_(TV_series)#:~:text=The%20success%20of%20the%20soundtrack%20lead%20to%20Rae%20establishing%20her%20own%20record%20label%2C%20Raedio%2C%20in%20partnership%20with%20Atlantic%20Records',
  },
  'tv:95215': {
    en: 'Reservation Dogs was the first show with an entirely Native writers’ room. By season two, every member of the Indigenous sketch-comedy group the 1491s had worked on the series.',
    de: 'Reservation Dogs war die erste Serie mit einem ausschließlich indigenen Writers’ Room. Bis zur zweiten Staffel hatten alle Mitglieder der indigenen Sketch-Comedy-Gruppe 1491s an der Serie mitgearbeitet.',
    pt: 'Reservation Dogs foi a primeira série com uma sala de roteiristas inteiramente indígena. Na segunda temporada, todos os integrantes do grupo indígena de comédia 1491s já haviam trabalhado na série.',
    fr: 'Reservation Dogs fut la première série dotée d’une équipe de scénaristes entièrement autochtone. Dès la deuxième saison, tous les membres de la troupe de sketchs autochtone 1491s avaient travaillé sur la série.',
    es: 'Reservation Dogs fue la primera serie con una sala de guionistas íntegramente indígena. Para la segunda temporada, todos los miembros del grupo indígena de comedia 1491s habían trabajado en la serie.',
    it: 'Reservation Dogs fu la prima serie con una squadra di sceneggiatori interamente nativa. Entro la seconda stagione, tutti i membri del gruppo di sketch comedy indigeno 1491s avevano lavorato alla serie.',
    source:
      'https://en.wikipedia.org/wiki/Reservation_Dogs#:~:text=It%27s%20the%20first%20show%20to%20feature%20an%20entirely%20Native%20writers%27%20room&text=all%20of%20the%201491s%20worked%20on%20Reservation%20Dogs%20as%20writers%20and%20actors%2C%20directors%2C%20or%20producers',
  },
  'tv:70796': {
    en: 'The Marvelous Mrs. Maisel filmed the Gaslight Club exterior at 96 St. Mark’s Place, the same building pictured on the cover of Led Zeppelin’s Physical Graffiti.',
    de: 'The Marvelous Mrs. Maisel drehte die Außenansicht des Gaslight Club am 96 St. Mark’s Place. Dasselbe Gebäude ist auf dem Cover von Led Zeppelins Physical Graffiti zu sehen.',
    pt: 'The Marvelous Mrs. Maisel filmou o exterior do Gaslight Club no número 96 da St. Mark’s Place, o mesmo edifício retratado na capa de Physical Graffiti, do Led Zeppelin.',
    fr: 'The Marvelous Mrs. Maisel a filmé l’extérieur du Gaslight Club au 96 St. Mark’s Place, le même immeuble qui figure sur la pochette de Physical Graffiti de Led Zeppelin.',
    es: 'The Marvelous Mrs. Maisel rodó el exterior del Gaslight Club en el número 96 de St. Mark’s Place, el mismo edificio que aparece en la portada de Physical Graffiti de Led Zeppelin.',
    it: 'The Marvelous Mrs. Maisel girò gli esterni del Gaslight Club al 96 di St. Mark’s Place, lo stesso edificio raffigurato sulla copertina di Physical Graffiti dei Led Zeppelin.',
    source:
      'https://en.wikipedia.org/wiki/The_Marvelous_Mrs._Maisel#:~:text=Exterior%20shots%20for%20the%20Gaslight%20Club%20were%20filmed%20in%20October%202016%20outside%2096%20St.%20Mark%27s%20Place%20in%20the%20East%20Village%2C%20the%20building%20featured%20on%20the%20cover%20of%20Led%20Zeppelin%27s%201975%20album%20Physical%20Graffiti',
  },
  'tv:76148': {
    en: 'Derry Girls creator Lisa McGee based events on her own life, including writing a letter to Chelsea Clinton. Chelsea later appeared in the series as herself.',
    de: 'Derry-Girls-Schöpferin Lisa McGee griff Ereignisse aus ihrem eigenen Leben auf, darunter einen Brief an Chelsea Clinton. Chelsea trat später in der Serie als sie selbst auf.',
    pt: 'Lisa McGee, criadora de Derry Girls, baseou acontecimentos em sua própria vida, inclusive uma carta que escreveu a Chelsea Clinton. Chelsea mais tarde apareceu na série como ela mesma.',
    fr: 'Lisa McGee, créatrice de Derry Girls, s’est inspirée d’événements de sa propre vie, notamment d’une lettre écrite à Chelsea Clinton. Chelsea est ensuite apparue dans son propre rôle dans la série.',
    es: 'Lisa McGee, creadora de Derry Girls, se basó en hechos de su propia vida, como una carta que escribió a Chelsea Clinton. Chelsea apareció después como ella misma en la serie.',
    it: 'Lisa McGee, creatrice di Derry Girls, si ispirò a eventi della propria vita, tra cui una lettera scritta a Chelsea Clinton. Chelsea apparve poi nella serie nei panni di sé stessa.',
    source:
      'https://en.wikipedia.org/wiki/Derry_Girls#:~:text=Lisa%20McGee%20based%20events%20in%20the%20programme%20on%20her%20own%20life%2C%20such%20as%20writing%20a%20letter%20to%20the%20Clintons%27%20daughter%2C%20Chelsea&text=Chelsea%20Clinton%20as%20herself',
  },
  'tv:83631': {
    en: 'Nadja’s supernatural appearance beside Jenna in a park used no CGI: Natasia Demetriou hid behind a tree and stepped out as the camera tracked past it.',
    de: 'Für Nadjas übernatürliches Auftauchen neben Jenna in einem Park wurde kein CGI verwendet: Natasia Demetriou versteckte sich hinter einem Baum und trat im richtigen Moment hervor, während die Kamera vorbeifuhr.',
    pt: 'A aparição sobrenatural de Nadja ao lado de Jenna em um parque não usou CGI: Natasia Demetriou se escondeu atrás de uma árvore e saiu no momento certo enquanto a câmera passava.',
    fr: 'L’apparition surnaturelle de Nadja aux côtés de Jenna dans un parc n’a utilisé aucune image de synthèse : Natasia Demetriou s’est cachée derrière un arbre et en est sortie au bon moment pendant le travelling.',
    es: 'La aparición sobrenatural de Nadja junto a Jenna en un parque no usó CGI: Natasia Demetriou se escondió detrás de un árbol y salió en el momento preciso mientras la cámara pasaba.',
    it: 'L’apparizione soprannaturale di Nadja accanto a Jenna in un parco non usò CGI: Natasia Demetriou si nascose dietro un albero e uscì al momento giusto mentre la cinepresa passava.',
    source:
      'https://en.wikipedia.org/wiki/What_We_Do_in_the_Shadows_(TV_series)#:~:text=That%20was%20all%20just%20done%20completely%20the%20old%20fashioned%20way%20where%20Natasia%20was%20hiding%20behind%20a%20tree%20and%20the%20camera%20was%20tracking%20along%20and%20at%20the%20right%20moment%2C%20she%20walked%20out%20from%20behind%20a%20tree',
  },
  'tv:66859': {
    en: 'Better Things is semi-autobiographically based on Pamela Adlon’s life, and takes its title from the Kinks song “Better Things.”',
    de: 'Better Things basiert teilweise autobiografisch auf Pamela Adlons Leben und ist nach dem gleichnamigen Song der Kinks benannt.',
    pt: 'Better Things é uma obra semiautobiográfica baseada na vida de Pamela Adlon e recebeu o nome da canção homônima dos Kinks.',
    fr: 'Better Things s’inspire de manière semi-autobiographique de la vie de Pamela Adlon et tire son titre de la chanson du même nom des Kinks.',
    es: 'Better Things se basa de forma semiautobiográfica en la vida de Pamela Adlon y toma su título de la canción homónima de los Kinks.',
    it: 'Better Things si basa in modo semi-autobiografico sulla vita di Pamela Adlon e prende il titolo dall’omonima canzone dei Kinks.',
    source:
      'https://en.wikipedia.org/wiki/Better_Things_(TV_series)#:~:text=The%20story%20is%20semi-autobiographically%20based%20on%20Adlon%27s%20life&text=The%20show%20is%20named%20after%20the%20song%20%22Better%20Things%22%20by%20The%20Kinks',
  },
  'movie:185': {
    en: 'Malcolm McDowell scratched a cornea and was temporarily blinded while filming A Clockwork Orange’s Ludovico scene. The doctor beside him on camera was a real physician tasked with keeping his forced-open eyes from drying.',
    de: 'Beim Dreh der Ludovico-Szene in A Clockwork Orange verletzte sich Malcolm McDowell an der Hornhaut und war vorübergehend blind. Der Arzt neben ihm war ein echter Mediziner, der verhindern sollte, dass seine offengehaltenen Augen austrockneten.',
    pt: 'Durante as filmagens da cena de Ludovico em A Clockwork Orange, Malcolm McDowell arranhou uma córnea e ficou temporariamente cego. O médico ao seu lado era um profissional de verdade, encarregado de impedir que seus olhos, mantidos abertos à força, ressecassem.',
    fr: 'Pendant le tournage de la scène de Ludovico dans A Clockwork Orange, Malcolm McDowell s’est éraflé la cornée et a été temporairement aveugle. Le médecin à ses côtés était un vrai praticien chargé d’empêcher ses yeux maintenus ouverts de se dessécher.',
    es: 'Durante el rodaje de la escena de Ludovico en A Clockwork Orange, Malcolm McDowell se arañó una córnea y quedó temporalmente ciego. El médico que aparecía a su lado era un profesional real encargado de evitar que sus ojos, mantenidos abiertos a la fuerza, se secaran.',
    it: 'Durante le riprese della scena Ludovico in A Clockwork Orange, Malcolm McDowell si graffiò una cornea e rimase temporaneamente cieco. Il medico accanto a lui era un vero dottore, incaricato di impedire che gli occhi tenuti aperti a forza si seccassero.',
    source:
      'https://en.wikipedia.org/wiki/A_Clockwork_Orange_(film)#:~:text=During%20the%20filming%20of%20the%20Ludovico%20technique%20scene%2C%20McDowell%20scratched%20a%20cornea%20and%20was%20temporarily%20blinded&text=was%20a%20real%20physician%20present%20to%20prevent%20the%20actor%27s%20eyes%20from%20drying',
  },
  'movie:239': {
    en: 'Some Like It Hot’s closing line, “Well, nobody’s perfect,” was only a placeholder: Billy Wilder and I. A. L. Diamond planned to replace it once they devised something better, but never did.',
    de: 'Der Schlusssatz von Some Like It Hot, „Nobody is perfect“, war nur als Platzhalter gedacht: Billy Wilder und I. A. L. Diamond wollten ihn ersetzen, sobald ihnen etwas Besseres einfiel – doch dazu kam es nie.',
    pt: 'A frase final de Some Like It Hot, “Well, nobody’s perfect”, era apenas provisória: Billy Wilder e I. A. L. Diamond pretendiam substituí-la quando encontrassem algo melhor, mas nunca encontraram.',
    fr: 'La dernière réplique de Some Like It Hot, « Well, nobody’s perfect », n’était qu’un texte provisoire : Billy Wilder et I. A. L. Diamond comptaient la remplacer lorsqu’ils trouveraient mieux, mais cela n’arriva jamais.',
    es: 'La frase final de Some Like It Hot, «Well, nobody’s perfect», era solo provisional: Billy Wilder e I. A. L. Diamond pensaban sustituirla cuando se les ocurriera algo mejor, pero nunca lo hicieron.',
    it: 'La battuta finale di Some Like It Hot, «Well, nobody’s perfect», era soltanto provvisoria: Billy Wilder e I. A. L. Diamond volevano sostituirla quando avessero trovato qualcosa di meglio, ma non accadde mai.',
    source:
      'https://en.wikipedia.org/wiki/Some_Like_It_Hot#:~:text=Diamond%20and%20Wilder%20put%20it%20in%20the%20script%20as%20a%20%22placeholder%22%20until%20they%20could%20come%20up%20with%20something%20better%2C%20but%20they%20never%20did',
  },
  'movie:164': {
    en: 'After Breakfast at Tiffany’s test preview, Paramount production head Martin Rankin wanted “Moon River” replaced with music sung by somebody else. Producers Richard Shepherd and Martin Jurow refused.',
    de: 'Nach der Testvorführung von Breakfast at Tiffany’s wollte Paramount-Produktionschef Martin Rankin „Moon River“ durch Musik ersetzen lassen, die jemand anderes sang. Die Produzenten Richard Shepherd und Martin Jurow lehnten das ab.',
    pt: 'Após a pré-estreia de Breakfast at Tiffany’s, Martin Rankin, chefe de produção da Paramount, quis substituir “Moon River” por uma música cantada por outra pessoa. Os produtores Richard Shepherd e Martin Jurow se recusaram.',
    fr: 'Après la projection test de Breakfast at Tiffany’s, Martin Rankin, directeur de la production de Paramount, voulut remplacer « Moon River » par une chanson interprétée par quelqu’un d’autre. Les producteurs Richard Shepherd et Martin Jurow refusèrent.',
    es: 'Tras el pase de prueba de Breakfast at Tiffany’s, Martin Rankin, jefe de producción de Paramount, quiso sustituir «Moon River» por música cantada por otra persona. Los productores Richard Shepherd y Martin Jurow se negaron.',
    it: 'Dopo la proiezione di prova di Breakfast at Tiffany’s, Martin Rankin, responsabile della produzione Paramount, volle sostituire «Moon River» con musica cantata da qualcun altro. I produttori Richard Shepherd e Martin Jurow si rifiutarono.',
    source:
      'https://en.wikipedia.org/wiki/Breakfast_at_Tiffany%27s_(film)#:~:text=After%20the%20film%27s%20test%20preview%20in%20San%20Francisco%2C%20Martin%20Rankin%2C%20Paramount%27s%20head%20of%20production%2C%20wanted%20%22Moon%20River%22%20replaced%20with%20music%20sung%20by%20somebody%20else&text=Shepherd%20claimed%20he%20and%20Jurow%20refused%20to%20replace%20it',
  },
  'movie:654': {
    en: 'After Marlon Brando initially declined On the Waterfront, Frank Sinatra had a handshake deal and even attended a costume fitting to play Terry Malloy. Within a week of reconsidering, Brando signed for the role instead.',
    de: 'Nachdem Marlon Brando On the Waterfront zunächst abgelehnt hatte, erhielt Frank Sinatra per Handschlag die Rolle des Terry Malloy und nahm sogar an einer Kostümanprobe teil. Doch als Brando seine Absage überdachte, unterschrieb er innerhalb einer Woche für die Rolle.',
    pt: 'Depois que Marlon Brando inicialmente recusou On the Waterfront, Frank Sinatra fechou um acordo de aperto de mão e chegou a fazer uma prova de figurino para interpretar Terry Malloy. Porém, ao reconsiderar, Brando assinou para o papel em menos de uma semana.',
    fr: 'Après le refus initial de Marlon Brando de jouer dans On the Waterfront, Frank Sinatra conclut un accord verbal et participa même à un essayage pour incarner Terry Malloy. Mais Brando revint sur sa décision et signa pour le rôle en moins d’une semaine.',
    es: 'Después de que Marlon Brando rechazara inicialmente On the Waterfront, Frank Sinatra cerró un acuerdo de palabra e incluso acudió a una prueba de vestuario para interpretar a Terry Malloy. Sin embargo, Brando reconsideró su negativa y firmó para el papel en menos de una semana.',
    it: 'Dopo che Marlon Brando rifiutò inizialmente On the Waterfront, Frank Sinatra raggiunse un accordo sulla parola e partecipò perfino a una prova costume per interpretare Terry Malloy. Brando però cambiò idea e firmò per il ruolo nel giro di una settimana.',
    source:
      'https://en.wikipedia.org/wiki/On_the_Waterfront#:~:text=Marlon%20Brando%20initially%20declined%20the%20role%20of%20Terry%20Malloy&text=Within%20a%20week%2C%20Brando%20signed%20a%20contract%20to%20perform%20in%20the%20film',
  },
  'movie:963': {
    en: 'The scene in The Maltese Falcon in which Gutman explains the Falcon’s history was filmed as an unbroken seven-minute take. After two days of rehearsal, a single mistake meant starting the elaborate camera movement all over again.',
    de: 'Die Szene in The Maltese Falcon, in der Gutman die Geschichte des Falken erzählt, wurde als ununterbrochene siebenminütige Einstellung gedreht. Nach zwei Probentagen bedeutete ein einziger Fehler, dass die aufwendige Kamerafahrt von vorn beginnen musste.',
    pt: 'A cena de The Maltese Falcon em que Gutman conta a história do Falcão foi filmada em um plano contínuo de sete minutos. Após dois dias de ensaios, um único erro obrigava a recomeçar todo o elaborado movimento de câmera.',
    fr: 'La scène de The Maltese Falcon dans laquelle Gutman raconte l’histoire du Faucon fut filmée en un plan ininterrompu de sept minutes. Après deux jours de répétitions, la moindre erreur obligeait à reprendre depuis le début cet élaboré mouvement de caméra.',
    es: 'La escena de The Maltese Falcon en la que Gutman cuenta la historia del Halcón se rodó como una toma ininterrumpida de siete minutos. Tras dos días de ensayos, un solo error obligaba a comenzar de nuevo todo el elaborado movimiento de cámara.',
    it: 'La scena di The Maltese Falcon in cui Gutman racconta la storia del Falcone fu girata in un’unica ripresa ininterrotta di sette minuti. Dopo due giorni di prove, un solo errore costringeva a ricominciare da capo l’elaborato movimento di macchina.',
    source:
      'https://en.wikipedia.org/wiki/The_Maltese_Falcon_(1941_film)#:~:text=Roger%20Ebert%20describes%20this%20scene%20as%20%22an%20astonishing%20unbroken%20seven%2Dminute%20take%22&text=We%20rehearsed%20two%20days&text=One%20miss%20and%20we%20had%20to%20begin%20all%20over%20again',
  },
  'movie:567': {
    en: 'Rear Window’s uninterrupted 90-second opening, which introduces Jefferies and his neighborhood, required extensive rehearsals and ten takes over half a day of filming.',
    de: 'Die ununterbrochene 90-sekündige Eröffnung von Rear Window, die Jefferies und seine Nachbarschaft vorstellt, erforderte zahlreiche Proben und zehn Takes während eines halben Drehtags.',
    pt: 'A abertura ininterrupta de 90 segundos de Rear Window, que apresenta Jefferies e sua vizinhança, exigiu muitos ensaios e dez tomadas ao longo de meio dia de filmagem.',
    fr: 'L’ouverture ininterrompue de 90 secondes de Rear Window, qui présente Jefferies et son voisinage, nécessita de nombreuses répétitions et dix prises pendant une demi-journée de tournage.',
    es: 'La apertura ininterrumpida de 90 segundos de Rear Window, que presenta a Jefferies y su vecindario, requirió numerosos ensayos y diez tomas durante medio día de rodaje.',
    it: 'L’apertura ininterrotta di 90 secondi di Rear Window, che presenta Jefferies e il suo vicinato, richiese molte prove e dieci ciak nell’arco di mezza giornata di riprese.',
    source:
      'https://en.wikipedia.org/wiki/Rear_Window#:~:text=The%20famous%20uninterrupted%2090%20second%20scene%20at%20the%20beginning%20of%20the%20film%20in%20which%20the%20main%20character%20Jefferies%20and%20his%20neighbourhood%20are%20introduced%20to%20the%20viewer%20was%20created%20with%20meticulous%20care&text=It%20required%20a%20lot%20of%20rehearsals%20and%20ten%20takes%20during%20half%20a%20day%20of%20filming%20before%20it%20was%20completed',
  },
  'movie:213': {
    en: 'After U.N. authorities denied permission to film on or near their property for North by Northwest, Hitchcock had Cary Grant arrive outside the General Assembly Building by taxi while a hidden camera crew secretly captured the scene.',
    de: 'Nachdem die UN Dreharbeiten auf oder nahe ihrem Gelände für North by Northwest untersagt hatten, ließ Hitchcock Cary Grant vor dem Gebäude der Generalversammlung aus einem Taxi steigen, während ein verstecktes Kamerateam die Szene heimlich filmte.',
    pt: 'Depois que a ONU negou permissão para filmar em sua propriedade ou nas proximidades para North by Northwest, Hitchcock fez Cary Grant chegar de táxi diante do edifício da Assembleia Geral enquanto uma equipe escondida registrava a cena secretamente.',
    fr: 'Après le refus de l’ONU d’autoriser le tournage sur sa propriété ou à proximité pour North by Northwest, Hitchcock fit arriver Cary Grant en taxi devant le bâtiment de l’Assemblée générale tandis qu’une équipe cachée filmait secrètement la scène.',
    es: 'Después de que la ONU negara permiso para rodar en su propiedad o cerca de ella para North by Northwest, Hitchcock hizo que Cary Grant llegara en taxi ante el edificio de la Asamblea General mientras un equipo oculto filmaba la escena en secreto.',
    it: 'Dopo che l’ONU negò il permesso di girare nella sua proprietà o nelle vicinanze per North by Northwest, Hitchcock fece arrivare Cary Grant in taxi davanti al Palazzo dell’Assemblea generale mentre una troupe nascosta filmava segretamente la scena.',
    source:
      'https://en.wikipedia.org/wiki/North_by_Northwest#:~:text=The%20scene%20of%20Cary%20Grant%20going%20to%20the%20United%20Nations%20in%20New%20York%20was%20filmed%20illicitly%20because%2C%20after%20reviewing%20the%20script%2C%20U.N.%20authorities%20denied%20permission%20to%20film%20on%20or%20near%20its%20property&text=After%20two%20failed%20attempts%20to%20get%20the%20required%20shots%2C%20Hitchcock%20had%20Grant%20pull%20up%20in%20a%20taxicab%20right%20outside%20the%20General%20Assembly%20Building%20while%20a%20hidden%20camera%20crew%20filmed%20him',
  },
  'movie:935': {
    en: 'For Dr. Strangelove, Stanley Kubrick told George C. Scott that his absurdly exaggerated “practice” takes would never be used. Kubrick then chose many of them for the final film instead of Scott’s more restrained takes.',
    de: 'Für Dr. Strangelove sagte Stanley Kubrick George C. Scott, seine absurd übertriebenen „Probetakes“ würden niemals verwendet. Anschließend nahm Kubrick viele davon anstelle von Scotts zurückhaltenderen Takes in den fertigen Film auf.',
    pt: 'Em Dr. Strangelove, Stanley Kubrick disse a George C. Scott que suas tomadas de “ensaio”, absurdamente exageradas, jamais seriam usadas. Depois, Kubrick escolheu muitas delas para o filme final em vez das tomadas mais contidas de Scott.',
    fr: 'Pour Dr. Strangelove, Stanley Kubrick assura à George C. Scott que ses prises d’« essai », volontairement outrancières, ne seraient jamais utilisées. Kubrick en choisit ensuite beaucoup pour le montage final à la place des prises plus retenues de Scott.',
    es: 'Para Dr. Strangelove, Stanley Kubrick le dijo a George C. Scott que sus «tomas de ensayo», absurdamente exageradas, nunca se usarían. Después, Kubrick eligió muchas de ellas para la película final en lugar de las tomas más contenidas de Scott.',
    it: 'Per Dr. Strangelove, Stanley Kubrick disse a George C. Scott che le sue assurde ed esagerate riprese di «prova» non sarebbero mai state usate. Kubrick ne scelse poi molte per il film definitivo al posto delle interpretazioni più misurate di Scott.',
    source:
      'https://en.wikipedia.org/wiki/Dr._Strangelove#:~:text=Kubrick%20talked%20Scott%20into%20doing%20absurd%20%22practice%22%20takes%2C%20which%20Kubrick%20told%20Scott%20would%20never%20be%20used%2C%20as%20a%20way%20to%20warm%20up%20for%20the%20%22real%22%20takes&text=Kubrick%20used%20many%20of%20these%20%22practice%22%20takes%20in%20the%20final%20film%2C%20rather%20than%20the%20more%20restrained%20ones',
  },
  'movie:424': {
    en: 'Sid Sheinberg greenlit Schindler’s List on the condition that Steven Spielberg make Jurassic Park first. Spielberg said Sheinberg knew that after directing Schindler he would not have been able to make Jurassic Park.',
    de: 'Sid Sheinberg gab Schindlers Liste nur unter der Bedingung grünes Licht, dass Steven Spielberg zuerst Jurassic Park drehte. Spielberg sagte, Sheinberg habe gewusst, dass er Jurassic Park nach Schindlers Liste nicht mehr hätte drehen können.',
    pt: 'Sid Sheinberg deu sinal verde a Schindler’s List com a condição de que Steven Spielberg fizesse Jurassic Park primeiro. Spielberg disse que Sheinberg sabia que, depois de dirigir Schindler, ele não teria conseguido fazer Jurassic Park.',
    fr: 'Sid Sheinberg donna son feu vert à Schindler’s List à condition que Steven Spielberg réalise d’abord Jurassic Park. Spielberg expliqua que Sheinberg savait qu’après avoir tourné Schindler, il n’aurait pas pu faire Jurassic Park.',
    es: 'Sid Sheinberg dio luz verde a Schindler’s List con la condición de que Steven Spielberg rodara primero Jurassic Park. Spielberg dijo que Sheinberg sabía que, después de dirigir Schindler, no habría podido hacer Jurassic Park.',
    it: 'Sid Sheinberg diede il via libera a Schindler’s List a condizione che Steven Spielberg girasse prima Jurassic Park. Spielberg disse che Sheinberg sapeva che, dopo aver diretto Schindler, non sarebbe riuscito a realizzare Jurassic Park.',
    source:
      'https://en.wikipedia.org/wiki/Schindler%27s_List#:~:text=Sid%20Sheinberg%20greenlit%20the%20film%20on%20condition%20that%20Spielberg%20made%20Jurassic%20Park%20first&text=He%20knew%20that%20once%20I%20had%20directed%20Schindler%20I%20wouldn%27t%20be%20able%20to%20do%20Jurassic%20Park',
  },
  'movie:223': {
    en: 'Rebecca used two miniatures of Manderley: a large model for closer views such as the fire through its windows, and a half-size version for long shots and the film’s opening because the larger one could not fit the full house and grounds in frame.',
    de: 'Für Rebecca entstanden zwei Miniaturen von Manderley: ein großes Modell für nähere Aufnahmen wie das Feuer hinter den Fenstern und eine halb so große Version für Totalen und den Filmanfang, weil Haus und Gelände beim größeren Modell nicht vollständig ins Bild passten.',
    pt: 'Rebecca usou duas miniaturas de Manderley: uma grande para planos mais próximos, como o fogo visto pelas janelas, e outra com metade do tamanho para planos gerais e a abertura do filme, pois a maior não permitia enquadrar toda a casa e o terreno.',
    fr: 'Rebecca utilisa deux miniatures de Manderley : une grande pour les vues rapprochées, comme les flammes aux fenêtres, et une version deux fois plus petite pour les plans d’ensemble et l’ouverture du film, car la première ne permettait pas de cadrer toute la demeure et son parc.',
    es: 'Rebecca utilizó dos miniaturas de Manderley: una grande para planos cercanos, como el fuego visto por las ventanas, y otra de la mitad de tamaño para planos generales y el inicio de la película, ya que la mayor no permitía encuadrar toda la casa y los terrenos.',
    it: 'Per Rebecca furono create due miniature di Manderley: una grande per le inquadrature ravvicinate, come le fiamme attraverso le finestre, e una di metà grandezza per i campi lunghi e l’apertura del film, perché con la prima non si riuscivano a inquadrare l’intera casa e il parco.',
    source:
      'https://en.wikipedia.org/wiki/Rebecca_(1940_film)#:~:text=Two%20miniatures%20of%20Manderley%20were%20created&text=This%20half%2Dsize%20miniature%20was%20used%20for%20the%20opening%20of%20the%20film',
  },
  'movie:804': {
    en: 'Gregory Peck’s Roman Holiday contract gave him solo star billing while newcomer Audrey Hepburn was to appear much less prominently. Halfway through filming, Peck asked director William Wyler to give her equal billing—an almost unheard-of Hollywood gesture.',
    de: 'Gregory Pecks Vertrag für Roman Holiday sicherte ihm die alleinige Spitzenposition zu, während die Newcomerin Audrey Hepburn deutlich weniger prominent genannt werden sollte. Nach der Hälfte der Dreharbeiten bat Peck Regisseur William Wyler, ihr gleichwertige Nennung zu geben – eine in Hollywood nahezu beispiellose Geste.',
    pt: 'O contrato de Gregory Peck para Roman Holiday lhe garantia destaque exclusivo, enquanto a estreante Audrey Hepburn apareceria com bem menos proeminência. Na metade das filmagens, Peck pediu ao diretor William Wyler que desse a ela o mesmo destaque — um gesto quase inédito em Hollywood.',
    fr: 'Le contrat de Gregory Peck pour Roman Holiday lui garantissait d’être seul en tête d’affiche, tandis que la débutante Audrey Hepburn devait être créditée bien moins en vue. À mi-tournage, Peck demanda au réalisateur William Wyler de lui accorder la même place — un geste presque inédit à Hollywood.',
    es: 'El contrato de Gregory Peck para Roman Holiday le otorgaba en solitario la máxima posición en los créditos, mientras que la debutante Audrey Hepburn aparecería mucho menos destacada. A mitad del rodaje, Peck pidió al director William Wyler que le diera la misma categoría, un gesto casi inaudito en Hollywood.',
    it: 'Il contratto di Gregory Peck per Roman Holiday gli garantiva da solo il primo posto nei titoli, mentre l’esordiente Audrey Hepburn doveva comparire con molto meno risalto. A metà delle riprese, Peck chiese al regista William Wyler di darle pari rilievo: un gesto quasi inaudito a Hollywood.',
    source:
      'https://en.wikipedia.org/wiki/Roman_Holiday#:~:text=Peck%27s%20contract%20gave%20him%20solo%20star%20billing%2C%20with%20newcomer%20Hepburn%20listed%20much%20less%20prominently%20in%20the%20credits&text=Halfway%20through%20the%20filming%2C%20Peck%20suggested%20to%20Wyler%20that%20he%20elevate%20her%20to%20equal%20billing',
  },
  'movie:1541': {
    en: 'Michelle Pfeiffer and Jodie Foster originally accepted the lead roles in Thelma & Louise with enthusiasm, but both dropped out during pre-production. Pfeiffer later said she regretted passing on the film.',
    de: 'Michelle Pfeiffer und Jodie Foster nahmen die Hauptrollen in Thelma & Louise ursprünglich begeistert an, stiegen aber beide während der Vorproduktion aus. Pfeiffer sagte später, sie habe es bereut, auf den Film verzichtet zu haben.',
    pt: 'Michelle Pfeiffer e Jodie Foster aceitaram originalmente com entusiasmo os papéis principais de Thelma & Louise, mas ambas desistiram durante a pré-produção. Pfeiffer disse mais tarde que se arrependeu de ter deixado o filme passar.',
    fr: 'Michelle Pfeiffer et Jodie Foster avaient d’abord accepté avec enthousiasme les rôles principaux de Thelma & Louise, mais toutes deux se retirèrent pendant la préproduction. Pfeiffer déclara ensuite avoir regretté d’avoir laissé passer le film.',
    es: 'Michelle Pfeiffer y Jodie Foster aceptaron originalmente con entusiasmo los papeles protagonistas de Thelma & Louise, pero ambas abandonaron durante la preproducción. Pfeiffer dijo después que lamentaba haber dejado pasar la película.',
    it: 'Michelle Pfeiffer e Jodie Foster accettarono inizialmente con entusiasmo i ruoli da protagoniste in Thelma & Louise, ma entrambe lasciarono il progetto durante la pre-produzione. Pfeiffer disse in seguito di essersi pentita di aver rinunciato al film.',
    source:
      'https://en.wikipedia.org/wiki/Thelma_%26_Louise#:~:text=Michelle%20Pfeiffer%20and%20Jodie%20Foster%20were%20originally%20chosen%20for%20the%20leads%3B%20both%20accepted%20their%20roles%20with%20enthusiasm&text=Pfeiffer%20later%20said%20she%20regretted%20passing%20on%20the%20film',
  },
  'movie:571': {
    en: 'The Birds was partly inspired by a real 1961 mass bird attack in Capitola, California, which Hitchcock used as research. Toxic algae were later identified as the cause of the birds’ behavior.',
    de: 'Der Film Die Vögel wurde teilweise von einem echten massenhaften Vogelangriff 1961 im kalifornischen Capitola inspiriert, den Hitchcock als Recherchematerial nutzte. Später wurden giftige Algen als Ursache für das Verhalten der Vögel erkannt.',
    pt: 'The Birds foi parcialmente inspirado por um ataque real em massa de aves ocorrido em 1961 em Capitola, Califórnia, que Hitchcock usou em sua pesquisa. Mais tarde, algas tóxicas foram identificadas como a causa do comportamento das aves.',
    fr: 'The Birds fut en partie inspiré par une véritable attaque massive d’oiseaux survenue en 1961 à Capitola, en Californie, que Hitchcock utilisa pour ses recherches. Des algues toxiques furent ensuite identifiées comme la cause du comportement des oiseaux.',
    es: 'The Birds se inspiró en parte en un ataque masivo real de aves ocurrido en 1961 en Capitola, California, que Hitchcock utilizó para documentarse. Más tarde se identificaron algas tóxicas como la causa del comportamiento de las aves.',
    it: 'The Birds fu in parte ispirato da un vero attacco di massa di uccelli avvenuto nel 1961 a Capitola, in California, che Hitchcock usò per le sue ricerche. In seguito furono identificate delle alghe tossiche come causa del comportamento degli uccelli.',
    source:
      'https://en.wikipedia.org/wiki/The_Birds_(film)#:~:text=The%20Birds%20is%20also%20partly%20inspired%20by%20the%20true%20events%20of%20a%20mass%20bird%20attack&text=The%20real%20cause%20of%20the%20birds%27%20behavior%20was%20toxic%20algae',
  },
  'movie:996': {
    en: 'Billy Wilder filmed Double Indemnity’s original gas-chamber ending over five days and spent $150,000 on it, but ultimately cut it because he felt the office farewell between Neff and Keyes was more meaningful.',
    de: 'Billy Wilder drehte das ursprüngliche Gaskammer-Ende von Double Indemnity fünf Tage lang und gab dafür 150.000 Dollar aus. Am Ende schnitt er es dennoch heraus, weil er den Abschied zwischen Neff und Keyes im Büro für bedeutungsvoller hielt.',
    pt: 'Billy Wilder filmou durante cinco dias o final original de Double Indemnity na câmara de gás e gastou 150 mil dólares nele, mas acabou cortando-o por considerar mais significativa a despedida entre Neff e Keyes no escritório.',
    fr: 'Billy Wilder tourna pendant cinq jours la fin originale de Double Indemnity dans la chambre à gaz et y consacra 150 000 dollars, mais il la coupa finalement, jugeant les adieux de Neff et Keyes au bureau plus forts de sens.',
    es: 'Billy Wilder rodó durante cinco días el final original de Double Indemnity en la cámara de gas y gastó 150.000 dólares en él, pero terminó eliminándolo porque consideraba más significativa la despedida entre Neff y Keyes en la oficina.',
    it: 'Billy Wilder girò per cinque giorni il finale originale di Double Indemnity nella camera a gas e vi spese 150.000 dollari, ma alla fine lo tagliò perché riteneva più significativo l’addio tra Neff e Keyes in ufficio.',
    source:
      'https://en.wikipedia.org/wiki/Double_Indemnity#:~:text=Wilder%20shot%20for%20five%20days%20and%20spent%20%24150%2C000%20on%20the%20scene&text=You%20couldn%27t%20have%20a%20more%20meaningful%20scene%20between%20two%20men',
  },
  'movie:1585': {
    en: 'For It’s a Wonderful Life, Russell Shearman developed a quieter chemical snow from water, soap flakes, foamite and sugar. Earlier movie snow used cornflakes so noisy that dialogue had to be redubbed.',
    de: 'Für It’s a Wonderful Life entwickelte Russell Shearman einen leiseren Kunstschnee aus Wasser, Seifenflocken, Foamite und Zucker. Zuvor nutzte man beim Film Cornflakes, die so laut waren, dass Dialoge nachsynchronisiert werden mussten.',
    pt: 'Para It’s a Wonderful Life, Russell Shearman criou uma neve química mais silenciosa com água, flocos de sabão, foamite e açúcar. Antes disso, o cinema usava flocos de milho tão barulhentos que os diálogos precisavam ser redublados.',
    fr: 'Pour It’s a Wonderful Life, Russell Shearman mit au point une neige chimique plus silencieuse à base d’eau, de paillettes de savon, de foamite et de sucre. Auparavant, le cinéma utilisait des cornflakes si bruyants que les dialogues devaient être redoublés.',
    es: 'Para It’s a Wonderful Life, Russell Shearman creó una nieve química más silenciosa con agua, copos de jabón, foamite y azúcar. Antes, el cine utilizaba copos de maíz tan ruidosos que los diálogos tenían que volver a grabarse.',
    it: 'Per It’s a Wonderful Life, Russell Shearman sviluppò una neve chimica più silenziosa con acqua, scaglie di sapone, foamite e zucchero. Prima si usavano fiocchi di mais così rumorosi che i dialoghi dovevano essere ridoppiati.',
    source:
      'https://en.wikipedia.org/wiki/It%27s_a_Wonderful_Life#:~:text=developed%20a%20new%20compound%20using%20water%2C%20soap%20flakes%2C%20foamite%2C%20and%20sugar%20to%20create%20%22chemical%20snow%22&text=dialogue%20had%20to%20be%20redubbed%20afterwards',
  },
  'movie:389': {
    en: 'To make 12 Angry Men feel increasingly claustrophobic, Sidney Lumet and cinematographer Boris Kaufman gradually used longer lenses, moved from above-eye-level views to lower camera angles, and ended with nearly everyone in close-up.',
    de: 'Damit 12 Angry Men zunehmend klaustrophobisch wirkt, setzten Sidney Lumet und Kameramann Boris Kaufman nach und nach längere Brennweiten ein, wechselten von Perspektiven über Augenhöhe zu tieferen Kamerawinkeln und zeigten am Ende fast alle in Nahaufnahme.',
    pt: 'Para tornar 12 Angry Men cada vez mais claustrofóbico, Sidney Lumet e o diretor de fotografia Boris Kaufman usaram lentes progressivamente mais longas, passaram de enquadramentos acima do nível dos olhos para ângulos mais baixos e terminaram com quase todos em close.',
    fr: 'Pour rendre 12 Angry Men de plus en plus claustrophobe, Sidney Lumet et le directeur de la photographie Boris Kaufman utilisèrent des focales progressivement plus longues, passèrent de cadrages au-dessus des yeux à des angles plus bas et finirent par montrer presque tous les personnages en gros plan.',
    es: 'Para que 12 Angry Men resultara cada vez más claustrofóbica, Sidney Lumet y el director de fotografía Boris Kaufman utilizaron lentes progresivamente más largas, pasaron de encuadres por encima de los ojos a ángulos más bajos y acabaron mostrando a casi todos en primer plano.',
    it: 'Per rendere 12 Angry Men sempre più claustrofobico, Sidney Lumet e il direttore della fotografia Boris Kaufman usarono focali progressivamente più lunghe, passarono da inquadrature sopra il livello degli occhi ad angolazioni più basse e finirono mostrando quasi tutti in primo piano.',
    source:
      'https://en.wikipedia.org/wiki/12_Angry_Men#:~:text=At%20the%20beginning%20of%20the%20film%2C%20the%20cameras%20are%20positioned%20above%20eye%20level&text=create%20a%20nearly%20palpable%20sense%20of%20claustrophobia',
  },
  'movie:546554': {
    en: 'Rian Johnson named the characters in Knives Out after musicians he enjoyed, including Joni Mitchell, Richard Thompson and Steely Dan’s Donald Fagen.',
    de: 'Rian Johnson benannte die Figuren in Knives Out nach Musikern, die er mochte – darunter Joni Mitchell, Richard Thompson und Steely-Dan-Mitglied Donald Fagen.',
    pt: 'Rian Johnson deu aos personagens de Knives Out nomes de músicos de que gostava, entre eles Joni Mitchell, Richard Thompson e Donald Fagen, do Steely Dan.',
    fr: 'Rian Johnson donna aux personnages de Knives Out les noms de musiciens qu’il appréciait, notamment Joni Mitchell, Richard Thompson et Donald Fagen de Steely Dan.',
    es: 'Rian Johnson puso a los personajes de Knives Out nombres de músicos que le gustaban, entre ellos Joni Mitchell, Richard Thompson y Donald Fagen, de Steely Dan.',
    it: 'Rian Johnson diede ai personaggi di Knives Out i nomi di musicisti che apprezzava, tra cui Joni Mitchell, Richard Thompson e Donald Fagen degli Steely Dan.',
    source:
      'https://en.wikipedia.org/wiki/Knives_Out#:~:text=Johnson%20named%20each%20of%20the%20characters%20after%20musicians%20whose%20works%20he%20enjoyed',
  },
  'movie:38': {
    en: 'Eternal Sunshine used little CGI: many effects were created in-camera. For the ocean to wash away the Montauk house, the crew built a corner of the house on the beach and let the tide rise.',
    de: 'Eternal Sunshine setzte kaum CGI ein: Viele Effekte entstanden direkt in der Kamera. Damit das Meer das Haus in Montauk fortspülen konnte, baute die Crew eine Hausecke am Strand und ließ die Flut steigen.',
    pt: 'Eternal Sunshine usou pouco CGI: muitos efeitos foram feitos diretamente na câmera. Para o oceano levar a casa de Montauk, a equipe construiu um canto da casa na praia e deixou a maré subir.',
    fr: 'Eternal Sunshine utilisa peu d’images de synthèse : de nombreux effets furent réalisés directement à la prise de vues. Pour que l’océan emporte la maison de Montauk, l’équipe en construisit un angle sur la plage et laissa monter la marée.',
    es: 'Eternal Sunshine utilizó poco CGI: muchos efectos se hicieron directamente en cámara. Para que el océano arrastrara la casa de Montauk, el equipo construyó una esquina de la casa en la playa y dejó subir la marea.',
    it: 'Eternal Sunshine usò poca CGI: molti effetti furono realizzati direttamente in ripresa. Per far sì che l’oceano spazzasse via la casa di Montauk, la troupe ne costruì un angolo sulla spiaggia e lasciò salire la marea.',
    source:
      'https://en.wikipedia.org/wiki/Eternal_Sunshine_of_the_Spotless_Mind#:~:text=The%20film%20used%20minimal%20CGI%2C%20with%20many%20effects%20accomplished%20in%2Dcamera&text=building%20the%20corner%20of%20a%20house%20on%20the%20beach%20and%20allowing%20the%20tide%20to%20rise',
  },
  'movie:6977': {
    en: 'No Country for Old Men contains only about 16 minutes of music, several of them during the end credits. Composer Carter Burwell used Buddhist singing bowls because most instruments did not fit his minimalist sound sculpture.',
    de: 'No Country for Old Men enthält nur etwa 16 Minuten Musik, davon mehrere im Abspann. Komponist Carter Burwell nutzte buddhistische Klangschalen, weil die meisten Instrumente nicht zu seiner minimalistischen Klangskulptur passten.',
    pt: 'No Country for Old Men contém apenas cerca de 16 minutos de música, vários deles nos créditos finais. O compositor Carter Burwell usou tigelas tibetanas porque a maioria dos instrumentos não combinava com sua escultura sonora minimalista.',
    fr: 'No Country for Old Men ne contient qu’environ 16 minutes de musique, dont plusieurs pendant le générique de fin. Le compositeur Carter Burwell utilisa des bols chantants bouddhistes, car la plupart des instruments ne convenaient pas à sa sculpture sonore minimaliste.',
    es: 'No Country for Old Men contiene solo unos 16 minutos de música, varios de ellos durante los créditos finales. El compositor Carter Burwell utilizó cuencos cantores budistas porque la mayoría de los instrumentos no encajaban en su escultura sonora minimalista.',
    it: 'No Country for Old Men contiene solo circa 16 minuti di musica, diversi dei quali nei titoli di coda. Il compositore Carter Burwell usò campane tibetane perché la maggior parte degli strumenti non si adattava alla sua scultura sonora minimalista.',
    source:
      'https://en.wikipedia.org/wiki/No_Country_for_Old_Men#:~:text=he%20used%20singing%20bowls%2C%20standing%20metal%20bells%20traditionally%20employed%20in%20Buddhist%20meditation%20practice&text=The%20movie%20contains%20a%20%22mere%22%2016%20minutes%20of%20music',
  },
  'movie:419430': {
    en: 'Jordan Peele himself voiced the wounded deer in Get Out. He also narrated the UNCF commercial heard in the film.',
    de: 'Jordan Peele sprach in Get Out selbst die Laute des verletzten Hirsches ein. Auch der Sprecher des UNCF-Werbespots im Film ist er.',
    pt: 'O próprio Jordan Peele fez os sons do cervo ferido em Get Out. Ele também narrou o comercial da UNCF ouvido no filme.',
    fr: 'Jordan Peele produisit lui-même les cris du cerf blessé dans Get Out. Il prêta aussi sa voix à la publicité de l’UNCF entendue dans le film.',
    es: 'El propio Jordan Peele puso voz a los sonidos del ciervo herido en Get Out. También narró el anuncio de la UNCF que se oye en la película.',
    it: 'Jordan Peele prestò personalmente la voce ai versi del cervo ferito in Get Out. Fu sua anche la voce narrante dello spot dell’UNCF che si sente nel film.',
    source:
      'https://en.wikipedia.org/wiki/Get_Out#:~:text=Writer%2Ddirector%20Jordan%20Peele%20voices%20the%20sounds%20made%20by%20the%20wounded%20deer%2C%20and%20narrates%20a%20UNCF%20commercial',
  },
  'movie:329865': {
    en: 'The asteroid 15 Eunomia inspired the appearance of the heptapod spacecraft in Arrival.',
    de: 'Der Asteroid 15 Eunomia inspirierte das Aussehen der Heptapoden-Raumschiffe in Arrival.',
    pt: 'O asteroide 15 Eunomia inspirou a aparência das naves dos heptápodes em Arrival.',
    fr: 'L’astéroïde 15 Eunomia inspira l’apparence des vaisseaux heptapodes dans Arrival.',
    es: 'El asteroide 15 Eunomia inspiró el aspecto de las naves de los heptápodos en Arrival.',
    it: 'L’asteroide 15 Eunomia ispirò l’aspetto delle astronavi degli eptapodi in Arrival.',
    source:
      'https://en.wikipedia.org/wiki/Arrival_(film)#:~:text=is%20the%20inspiration%20for%20the%20look%20of%20the%20heptapod%20ships',
  },
  'movie:376867': {
    en: 'Barry Jenkins kept the three actors who played Chiron in Moonlight from meeting until filming was over, so they would not imitate one another.',
    de: 'Barry Jenkins ließ die drei Chiron-Darsteller in Moonlight erst nach den Dreharbeiten aufeinandertreffen, damit sie einander nicht nachahmten.',
    pt: 'Barry Jenkins impediu que os três atores que interpretaram Chiron em Moonlight se conhecessem antes do fim das filmagens, para que não imitassem uns aos outros.',
    fr: 'Barry Jenkins empêcha les trois acteurs incarnant Chiron dans Moonlight de se rencontrer avant la fin du tournage, afin qu’ils ne s’imitent pas.',
    es: 'Barry Jenkins evitó que los tres actores que interpretaron a Chiron en Moonlight se conocieran hasta después del rodaje, para que no se imitaran entre sí.',
    it: 'Barry Jenkins impedì ai tre attori che interpretarono Chiron in Moonlight di incontrarsi prima della fine delle riprese, affinché non si imitassero a vicenda.',
    source:
      'https://en.wikipedia.org/wiki/Moonlight_(2016_film)#:~:text=the%20three%20actors%20for%20Chiron%20did%20not%20meet%20each%20other%20until%20after%20filming%20to%20avoid%20any%20imitations%20of%20one%20another',
  },
  'movie:1417': {
    en: 'During production of Pan’s Labyrinth, Guillermo del Toro accidentally left a notebook containing twenty years of ideas and drawings in a London taxi. The driver returned it two days later.',
    de: 'Während der Produktion von Pans Labyrinth ließ Guillermo del Toro versehentlich ein Notizbuch mit Ideen und Zeichnungen aus zwanzig Jahren in einem Londoner Taxi liegen. Der Fahrer brachte es zwei Tage später zurück.',
    pt: 'Durante a produção de Pan’s Labyrinth, Guillermo del Toro deixou por engano em um táxi de Londres um caderno com vinte anos de ideias e desenhos. O motorista o devolveu dois dias depois.',
    fr: 'Pendant la production de Pan’s Labyrinth, Guillermo del Toro oublia dans un taxi londonien un carnet réunissant vingt ans d’idées et de dessins. Le chauffeur le lui rendit deux jours plus tard.',
    es: 'Durante la producción de Pan’s Labyrinth, Guillermo del Toro dejó por accidente en un taxi de Londres un cuaderno con veinte años de ideas y dibujos. El taxista se lo devolvió dos días después.',
    it: 'Durante la produzione di Pan’s Labyrinth, Guillermo del Toro lasciò per errore su un taxi londinese un quaderno contenente vent’anni di idee e disegni. Il tassista glielo restituì due giorni dopo.',
    source:
      'https://en.wikipedia.org/wiki/Pan%27s_Labyrinth#:~:text=At%20one%20point%20during%20production%2C%20he%20left%20the%20notebook%20in%20a%20taxi&text=the%20cabbie%20returned%20it%20to%20him%20two%20days%20later',
  },
  'movie:9693': {
    en: 'During one of Children of Men’s complex long takes, blood splattered onto the camera lens. Cinematographer Emmanuel Lubezki convinced Alfonso Cuarón to leave it in the film.',
    de: 'Während einer der aufwendigen langen Einstellungen in Children of Men spritzte Blut auf die Kameralinse. Kameramann Emmanuel Lubezki überzeugte Alfonso Cuarón, es im Film zu belassen.',
    pt: 'Durante um dos complexos planos longos de Children of Men, sangue respingou na lente da câmera. O diretor de fotografia Emmanuel Lubezki convenceu Alfonso Cuarón a manter a imagem no filme.',
    fr: 'Pendant l’un des longs plans complexes de Children of Men, du sang éclaboussa l’objectif. Le directeur de la photographie Emmanuel Lubezki convainquit Alfonso Cuarón de conserver la prise dans le film.',
    es: 'Durante uno de los complejos planos largos de Children of Men, la sangre salpicó el objetivo de la cámara. El director de fotografía Emmanuel Lubezki convenció a Alfonso Cuarón para dejar la toma en la película.',
    it: 'Durante uno dei complessi piani sequenza di Children of Men, del sangue schizzò sull’obiettivo. Il direttore della fotografia Emmanuel Lubezki convinse Alfonso Cuarón a lasciare la ripresa nel film.',
    source:
      'https://en.wikipedia.org/wiki/Children_of_Men#:~:text=In%20the%20middle%20of%20one%20shot%2C%20blood%20splattered%20onto%20the%20lens&text=convinced%20the%20director%20to%20leave%20it%20in',
  },
  'movie:37799': {
    en: 'The opening scene of The Social Network, in which Mark Zuckerberg talks with his girlfriend, took 99 takes to complete.',
    de: 'Für die Eröffnungsszene von The Social Network, in der Mark Zuckerberg mit seiner Freundin spricht, waren 99 Takes nötig.',
    pt: 'A cena de abertura de The Social Network, em que Mark Zuckerberg conversa com a namorada, precisou de 99 tomadas para ser concluída.',
    fr: 'La scène d’ouverture de The Social Network, dans laquelle Mark Zuckerberg parle avec sa petite amie, nécessita 99 prises.',
    es: 'La escena inicial de The Social Network, en la que Mark Zuckerberg habla con su novia, necesitó 99 tomas para completarse.',
    it: 'La scena iniziale di The Social Network, in cui Mark Zuckerberg parla con la sua ragazza, richiese 99 ciak.',
    source:
      'https://en.wikipedia.org/wiki/The_Social_Network#:~:text=The%20first%20scene%20in%20the%20film%2C%20where%20Zuckerberg%20is%20with%20his%20girlfriend%2C%20took%2099%20takes%20to%20finish',
  },
  'movie:545611': {
    en: 'Everything Everywhere All at Once’s visual effects were produced in-house by a team of only eight artists using Adobe After Effects and Premiere Pro.',
    de: 'Die visuellen Effekte von Everything Everywhere All at Once entstanden intern bei einem Team aus nur acht Künstlern mit Adobe After Effects und Premiere Pro.',
    pt: 'Os efeitos visuais de Everything Everywhere All at Once foram produzidos internamente por uma equipe de apenas oito artistas usando Adobe After Effects e Premiere Pro.',
    fr: 'Les effets visuels d’Everything Everywhere All at Once furent réalisés en interne par une équipe de seulement huit artistes avec Adobe After Effects et Premiere Pro.',
    es: 'Los efectos visuales de Everything Everywhere All at Once se produjeron internamente con un equipo de solo ocho artistas que utilizó Adobe After Effects y Premiere Pro.',
    it: 'Gli effetti visivi di Everything Everywhere All at Once furono realizzati internamente da un team di soli otto artisti usando Adobe After Effects e Premiere Pro.',
    source:
      'https://en.wikipedia.org/wiki/Everything_Everywhere_All_at_Once#:~:text=Instead%2C%20the%20filmmakers%20assembled%20a%20small%20team%20of%20eight%20artists%20headed%20by%20Zak%20Stoltz%2C%20who%20produced%20visual%20effects%20using%20Adobe%20After%20Effects%20and%20Adobe%20Premiere%20Pro',
  },
  'movie:152601': {
    en: 'While filming Her, Samantha Morton performed the operating system’s voice from a small soundproof booth, and she and Joaquin Phoenix avoided seeing each other on set.',
    de: 'Beim Dreh von Her sprach Samantha Morton die Stimme des Betriebssystems aus einer kleinen schallisolierten Kabine ein; sie und Joaquin Phoenix vermieden es, einander am Set zu sehen.',
    pt: 'Durante as filmagens de Her, Samantha Morton interpretou a voz do sistema operacional em uma pequena cabine à prova de som, e ela e Joaquin Phoenix evitaram se ver no set.',
    fr: 'Pendant le tournage de Her, Samantha Morton interpréta la voix du système d’exploitation depuis une petite cabine insonorisée, et Joaquin Phoenix et elle évitèrent de se voir sur le plateau.',
    es: 'Durante el rodaje de Her, Samantha Morton interpretó la voz del sistema operativo desde una pequeña cabina insonorizada, y ella y Joaquin Phoenix evitaron verse en el set.',
    it: 'Durante le riprese di Her, Samantha Morton interpretò la voce del sistema operativo da una piccola cabina insonorizzata, mentre lei e Joaquin Phoenix evitarono di vedersi sul set.',
    source:
      'https://en.wikipedia.org/wiki/Her_(2013_film)#:~:text=During%20production%20of%20the%20film%2C%20actress%20Samantha%20Morton%20performed%20the%20role%20of%20Samantha%20by%20acting%20on%20set%20%22in%20a%20four-by-four%20carpeted%20soundproof%20booth%20made%20of%20black%20painted%20plywood%20and%20soft%2C%20noise-muffling%20fabric.%22&text=At%20Jonze%27s%20suggestion%2C%20she%20and%20Joaquin%20Phoenix%20avoided%20seeing%20each%20other%20on%20set%20during%20filming',
  },
  'movie:264660': {
    en: 'Ex Machina’s sets contained 15,000 tungsten pea bulbs, installed to avoid the fluorescent lighting often used in science-fiction films.',
    de: 'In den Kulissen von Ex Machina wurden 15.000 kleine Wolframglühlampen installiert, um das in Science-Fiction-Filmen häufig verwendete Leuchtstofflicht zu vermeiden.',
    pt: 'Os cenários de Ex Machina receberam 15 mil pequenas lâmpadas de tungstênio para evitar a iluminação fluorescente frequentemente usada em filmes de ficção científica.',
    fr: 'Les décors d’Ex Machina furent équipés de 15 000 petites ampoules au tungstène afin d’éviter l’éclairage fluorescent souvent employé dans les films de science-fiction.',
    es: 'En los decorados de Ex Machina se instalaron 15.000 pequeñas bombillas de tungsteno para evitar la iluminación fluorescente habitual en las películas de ciencia ficción.',
    it: 'Nei set di Ex Machina furono installate 15.000 piccole lampadine al tungsteno per evitare l’illuminazione fluorescente spesso usata nei film di fantascienza.',
    source:
      'https://en.wikipedia.org/wiki/Ex_Machina_(film)#:~:text=Fifteen%20thousand%20tungsten%20pea%20bulb%20lights%20were%20installed%20into%20the%20sets%20to%20avoid%20the%20fluorescent%20light%20often%20used%20in%20science-fiction%20films',
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
