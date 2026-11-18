// Content decks for the party games, generators and trivia.

export const CLUBS = [
  'Real Madrid', 'Barcelona', 'Man City', 'Liverpool', 'Arsenal', 'Chelsea', 'Man United', 'Bayern',
  'PSG', 'Inter', 'AC Milan', 'Juventus', 'Dortmund', 'Atlético', 'Napoli', 'Tottenham',
];
export const FORMATIONS = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '5-3-2', '4-1-2-1-2', '3-4-3', '4-2-2-2'];

export const HANDICAPS = [
  'No Sprint', '3-Star Teams Only', 'Manual Passing', 'Keeper Is Your Striker', 'Only Long Balls',
  'No Shooting Outside Box', 'Play With Weak Foot Mindset', 'Must Celebrate Every Pass', 'Swap Controllers at HT',
  '10 Men From Kickoff', 'Only Headers Count', 'Max 3 Skill Moves',
];

export const PES_EXCUSES = [
  'Controller is broken', 'Lag!!', 'Scripted game', 'Ref is biased', 'My player was tired',
  'Momentum is real', 'I wasn\'t trying', 'The sun was in my eyes', 'My hand slipped', 'Your team is OP',
  'Wrong player selected', 'I was texting', 'Keeper is AI garbage', 'You only play long balls',
  'It\'s just a game anyway', 'Rematch, that one didn\'t count', 'You got lucky', 'Server issues',
  'I had a cramp', 'My formation reset',
];

export const SPOTS_CAMPUS = [
  'Library 3rd Floor', 'Cafeteria Queue', 'Computer Lab', 'Lecture Hall A', 'Football Pitch', 'Hostel Room 204',
  'Exam Room', 'Campus Gate', 'Wi-Fi Hotspot Bench', 'Dean\'s Office', 'Group Project Meeting', 'Graduation Ceremony',
];
export const SPOTS_FOOTBALL = [
  'Messi', 'Cristiano Ronaldo', 'Mbappé', 'Haaland', 'Salah', 'Neymar', 'Vinícius Jr', 'Bellingham',
  'Lamine Yamal', 'Kane', 'Drogba', 'Ronaldinho', 'Zidane', 'Pelé', 'Maradona', 'Van Dijk',
];

export const WHO_IN_CLASS = [
  'Who in this class is most likely to submit an assignment 1 minute before the deadline?',
  'Who in this class is most likely to become a billionaire and forget us?',
  'Who in this class is most likely to rage-quit eFootball and blame the controller?',
  'Who in this class is most likely to fall asleep in a lecture… in the front row?',
  'Who in this class is most likely to marry their lecturer\'s child?',
  'Who in this class is most likely to reply "seen" to the class group chat?',
  'Who in this class is most likely to start a startup that only sells vibes?',
  'Who in this class is most likely to get lost on campus in final year?',
  'Who in this class is most likely to argue with the lecturer and win?',
  'Who in this class is most likely to go viral for the wrong reason?',
  'Who in this class is most likely to ghost the group project?',
  'Who in this class is most likely to have 3 crushes at the same time?',
  'Who in this class is most likely to bring snacks and not share?',
  'Who in this class is most likely to be late to their own graduation?',
  'Who in this class is most likely to become a lecturer here?',
];

export const FIVE_SECOND = [
  'Name 3 Premier League clubs', 'Name 3 programming languages', 'Name 3 things in your bag', 'Name 3 lecturers',
  'Name 3 African footballers', 'Name 3 excuses for being late', 'Name 3 apps on your phone', 'Name 3 Champions League winners',
  'Name 3 things you do at 3 AM', 'Name 3 fast food items', 'Name 3 goalkeepers', 'Name 3 things in a computer',
  'Name 3 classmates with nicknames', 'Name 3 football stadiums', 'Name 3 reasons to skip class', 'Name 3 Ballon d\'Or winners',
  'Name 3 types of shoes', 'Name 3 things that are always broken on campus', 'Name 3 eFootball skill moves', 'Name 3 countries in Africa',
];

export const TRUTHS = [
  'Who in this room would you swap lives with for a week?',
  'What is the most embarrassing thing in your search history?',
  'Have you ever pretended to understand a lecture? Which one?',
  'Who was your first campus crush?',
  'What\'s the worst grade you\'ve hidden from your parents?',
  'Have you ever blamed someone else for your mistake in a group project?',
  'What\'s the longest you\'ve gone without showering during exams?',
  'Who in the class group chat do you have on mute?',
  'Which classmate would you trust with your phone unlocked?',
  'What\'s the cringiest message you\'ve sent to a crush?',
  'Have you ever cried over an eFootball loss?',
  'What lie do you tell most often?',
];
export const DARES = [
  'Do your best commentator voice for the next goal anyone scores.',
  'Text the class group chat "I have an announcement" and say nothing else for 5 minutes.',
  'Let the group choose your profile picture for 1 hour.',
  'Do 10 push-ups while naming 10 footballers.',
  'Speak only in questions until your next turn.',
  'Show the last photo in your gallery.',
  'Do your best impression of a lecturer — the group guesses who.',
  'Celebrate like you just won the Champions League.',
  'Read your last sent text out loud in a dramatic voice.',
  'Let someone post a story from your phone (nothing mean).',
  'Sing the national anthem like a pop star.',
  'Give a 30-second motivational speech about attendance.',
];

export const NEVER = [
  'Never have I ever signed the attendance sheet for someone else.',
  'Never have I ever fallen asleep in a lecture.',
  'Never have I ever submitted an assignment I didn\'t finish reading.',
  'Never have I ever had a crush on someone in this class.',
  'Never have I ever rage-quit an eFootball match.',
  'Never have I ever pretended my internet was bad to leave a call.',
  'Never have I ever eaten someone else\'s food from the fridge.',
  'Never have I ever lied about being "on my way".',
  'Never have I ever googled the answer during an online quiz.',
  'Never have I ever cried because of an exam.',
  'Never have I ever skipped class to watch a football match.',
  'Never have I ever stalked a classmate\'s old photos.',
  'Never have I ever used ChatGPT for a whole assignment.',
  'Never have I ever got lost on campus.',
];

export const BOMB_TOPICS = [
  'Football clubs', 'Things in a classroom', 'Programming languages', 'Countries', 'Fruits', 'Lecturers\' catchphrases',
  'Car brands', 'Things that are red', 'Footballers starting with M', 'Phone brands', 'Movies', 'Snacks',
];

export const WYR: [string, string][] = [
  ['Have a 7 AM lecture every day', 'Have every exam on a Saturday'],
  ['Lose every eFootball match forever', 'Win but only using a 3-star team'],
  ['Be the group project leader forever', 'Never get credit for your work'],
  ['Have your crush read your chat history', 'Have your parents read it'],
  ['Watch every match without sound', 'Watch every match in 144p'],
  ['Repeat first year', 'Do final year twice'],
  ['Have free Wi-Fi everywhere', 'Have free food at the cafeteria'],
  ['Be a famous footballer with no degree', 'Be a billionaire engineer nobody knows'],
  ['Present every assignment out loud', 'Never be allowed to ask a question'],
  ['Only play as Man United for a year', 'Only play as Tottenham for a year'],
  ['Have the lecturer call you by the wrong name forever', 'Be called "Hey you" forever'],
  ['Know every exam question in advance', 'Know who has a crush on you'],
];

export const CHARADES: Record<string, string[]> = {
  'Football Moments': [
    'Ronaldo SIUUU celebration', 'Penalty miss', 'Diving for a free kick', 'Goalkeeper save', 'Bicycle kick',
    'Getting a red card', 'VAR check', 'Corner kick', 'Lifting the trophy', 'Offside trap',
  ],
  'Campus Life': [
    'Sleeping in lecture', 'Cafeteria queue', 'Group project panic', 'Exam results day', 'Wi-Fi not working',
    'Running late to class', 'Printing at the last minute', 'Presenting slides', 'Borrowing a charger', 'Graduation walk',
  ],
  'Actions': [
    'Brushing teeth', 'Riding a moto', 'Taking a selfie', 'Cooking chapati', 'Dancing at a wedding',
    'Swimming', 'Typing very fast', 'Fixing a computer', 'Washing clothes', 'Climbing stairs',
  ],
};

export const TABOO: { word: string; banned: string[] }[] = [
  { word: 'Penalty', banned: ['Kick', 'Spot', 'Goal', 'Keeper'] },
  { word: 'Lecturer', banned: ['Teach', 'Class', 'Professor', 'University'] },
  { word: 'Laptop', banned: ['Computer', 'Keyboard', 'Screen', 'Portable'] },
  { word: 'Offside', banned: ['Flag', 'Line', 'Defender', 'Rule'] },
  { word: 'Exam', banned: ['Test', 'Paper', 'Study', 'Marks'] },
  { word: 'Wi-Fi', banned: ['Internet', 'Password', 'Router', 'Connection'] },
  { word: 'Cafeteria', banned: ['Food', 'Eat', 'Lunch', 'Canteen'] },
  { word: 'Goalkeeper', banned: ['Save', 'Gloves', 'Net', 'Hands'] },
  { word: 'Assignment', banned: ['Homework', 'Submit', 'Deadline', 'Lecturer'] },
  { word: 'Hostel', banned: ['Room', 'Sleep', 'Dorm', 'Roommate'] },
  { word: 'Champions League', banned: ['Europe', 'Trophy', 'Anthem', 'Clubs'] },
  { word: 'Graduation', banned: ['Gown', 'Degree', 'Ceremony', 'Finish'] },
  { word: 'Password', banned: ['Secret', 'Login', 'Account', 'Type'] },
  { word: 'Referee', banned: ['Whistle', 'Card', 'Match', 'Rules'] },
  { word: 'Coffee', banned: ['Drink', 'Morning', 'Cup', 'Caffeine'] },
];

/** Bluff Detective: true facts and invented ones. */
export const BLUFFS: { text: string; real: boolean; note: string }[] = [
  { text: 'Lionel Messi has won the Ballon d\'Or 8 times.', real: true, note: 'Real — a record 8 Ballon d\'Or awards (last in 2023).' },
  { text: 'Cristiano Ronaldo started his senior career at Sporting CP.', real: true, note: 'Real — he joined Man United from Sporting in 2003.' },
  { text: 'The first FIFA World Cup was held in Uruguay in 1930.', real: true, note: 'Real — Uruguay hosted and won it.' },
  { text: 'A football match is officially 100 minutes long.', real: false, note: 'Fake — it\'s 90 minutes plus added time.' },
  { text: 'Brazil has won the World Cup 5 times.', real: true, note: 'Real — 1958, 1962, 1970, 1994, 2002.' },
  { text: 'Goalkeepers are allowed to handle back-passes from teammates\' feet.', real: false, note: 'Fake — the back-pass rule bans it since 1992.' },
  { text: 'Leicester City won the Premier League in 2015–16.', real: true, note: 'Real — at 5000-1 odds.' },
  { text: 'Erling Haaland\'s father also played in the Premier League.', real: true, note: 'Real — Alf-Inge Haaland played for Leeds and Man City.' },
  { text: 'The Champions League anthem is sung in only English.', real: false, note: 'Fake — it uses English, French and German.' },
  { text: 'A red card in football is shown for 10 minutes, then the player returns.', real: false, note: 'Fake — that\'s a sin-bin idea, not standard football.' },
  { text: 'Mohamed Salah once played for Chelsea.', real: true, note: 'Real — Chelsea (2014–16) before Roma and Liverpool.' },
  { text: 'Real Madrid has never won the Champions League more than 10 times.', real: false, note: 'Fake — they have won it 15+ times.' },
  { text: 'The computer mouse was invented before the Internet\'s precursor ARPANET went live.', real: true, note: 'Real — Engelbart\'s mouse prototype (1964) predates ARPANET (1969).' },
  { text: 'Python, the programming language, is named after a snake.', real: false, note: 'Fake — it\'s named after Monty Python.' },
  { text: 'Didier Drogba scored in the 2012 Champions League final.', real: true, note: 'Real — a late header, then the winning penalty.' },
  { text: 'Offside can be called directly from a throw-in.', real: false, note: 'Fake — you cannot be offside from a throw-in.' },
];

export const WAVELENGTH: [string, string][] = [
  ['Overrated', 'Underrated'], ['Easy course', 'Impossible course'], ['Boring', 'Exciting'], ['Mid player', 'GOAT'],
  ['Cheap', 'Expensive'], ['Worst campus food', 'Best campus food'], ['Introvert', 'Extrovert'], ['Useless skill', 'Essential skill'],
  ['Cold', 'Hot'], ['Bad excuse', 'Great excuse'], ['Normal', 'Weird'], ['Forgettable', 'Iconic'],
];

export type Career = { name: string; path: string[] };
export const CAREERS: Career[] = [
  { name: 'Cristiano Ronaldo', path: ['Sporting CP', 'Man United', 'Real Madrid', 'Juventus', 'Man United', 'Al Nassr'] },
  { name: 'Zlatan Ibrahimović', path: ['Malmö', 'Ajax', 'Juventus', 'Inter', 'Barcelona', 'AC Milan', 'PSG', 'Man United', 'LA Galaxy', 'AC Milan'] },
  { name: 'Kylian Mbappé', path: ['Monaco', 'PSG', 'Real Madrid'] },
  { name: 'Neymar', path: ['Santos', 'Barcelona', 'PSG', 'Al Hilal', 'Santos'] },
  { name: 'Luis Suárez', path: ['Nacional', 'Groningen', 'Ajax', 'Liverpool', 'Barcelona', 'Atlético Madrid', 'Nacional', 'Grêmio', 'Inter Miami'] },
  { name: 'Didier Drogba', path: ['Le Mans', 'Guingamp', 'Marseille', 'Chelsea', 'Shanghai Shenhua', 'Galatasaray', 'Chelsea', 'Montreal Impact', 'Phoenix Rising'] },
  { name: 'Thierry Henry', path: ['Monaco', 'Juventus', 'Arsenal', 'Barcelona', 'NY Red Bulls'] },
  { name: 'Sadio Mané', path: ['Metz', 'RB Salzburg', 'Southampton', 'Liverpool', 'Bayern', 'Al Nassr'] },
  { name: 'Mohamed Salah', path: ['Al Mokawloon', 'Basel', 'Chelsea', 'Fiorentina', 'Roma', 'Liverpool'] },
  { name: 'Erling Haaland', path: ['Bryne', 'Molde', 'RB Salzburg', 'Dortmund', 'Man City'] },
  { name: 'Samuel Eto\'o', path: ['Real Madrid', 'Mallorca', 'Barcelona', 'Inter', 'Anzhi', 'Chelsea', 'Everton', 'Sampdoria'] },
  { name: 'Ángel Di María', path: ['Rosario Central', 'Benfica', 'Real Madrid', 'Man United', 'PSG', 'Juventus', 'Benfica'] },
  { name: 'Edinson Cavani', path: ['Danubio', 'Palermo', 'Napoli', 'PSG', 'Man United', 'Valencia', 'Boca Juniors'] },
  { name: 'Romelu Lukaku', path: ['Anderlecht', 'Chelsea', 'Everton', 'Man United', 'Inter', 'Chelsea', 'Roma', 'Napoli'] },
];

/** Approximate reported base fees, € millions. */
export const TRANSFERS: { player: string; move: string; fee: number }[] = [
  { player: 'Neymar', move: 'Barcelona → PSG (2017)', fee: 222 },
  { player: 'Kylian Mbappé', move: 'Monaco → PSG (2018)', fee: 180 },
  { player: 'Philippe Coutinho', move: 'Liverpool → Barcelona (2018)', fee: 135 },
  { player: 'João Félix', move: 'Benfica → Atlético (2019)', fee: 126 },
  { player: 'Enzo Fernández', move: 'Benfica → Chelsea (2023)', fee: 121 },
  { player: 'Antoine Griezmann', move: 'Atlético → Barcelona (2019)', fee: 120 },
  { player: 'Jack Grealish', move: 'Aston Villa → Man City (2021)', fee: 117 },
  { player: 'Declan Rice', move: 'West Ham → Arsenal (2023)', fee: 116 },
  { player: 'Romelu Lukaku', move: 'Inter → Chelsea (2021)', fee: 115 },
  { player: 'Jude Bellingham', move: 'Dortmund → Real Madrid (2023)', fee: 103 },
  { player: 'Paul Pogba', move: 'Juventus → Man United (2016)', fee: 105 },
  { player: 'Gareth Bale', move: 'Tottenham → Real Madrid (2013)', fee: 101 },
  { player: 'Cristiano Ronaldo', move: 'Real Madrid → Juventus (2018)', fee: 100 },
  { player: 'Harry Kane', move: 'Tottenham → Bayern (2023)', fee: 95 },
  { player: 'Virgil van Dijk', move: 'Southampton → Liverpool (2018)', fee: 85 },
  { player: 'Luis Suárez', move: 'Liverpool → Barcelona (2014)', fee: 82 },
  { player: 'Kai Havertz', move: 'Leverkusen → Chelsea (2020)', fee: 80 },
  { player: 'Zinedine Zidane', move: 'Juventus → Real Madrid (2001)', fee: 77 },
  { player: 'Erling Haaland', move: 'Dortmund → Man City (2022)', fee: 60 },
  { player: 'Mohamed Salah', move: 'Roma → Liverpool (2017)', fee: 42 },
  { player: 'Sadio Mané', move: 'Southampton → Liverpool (2016)', fee: 41 },
];

export const FOOTBALLERS = [
  'Messi', 'Cristiano Ronaldo', 'Mbappé', 'Haaland', 'Salah', 'Neymar', 'Vinícius Jr', 'Bellingham', 'Lamine Yamal',
  'Kane', 'Van Dijk', 'De Bruyne', 'Modrić', 'Lewandowski', 'Benzema', 'Griezmann', 'Rodri', 'Saka', 'Pedri',
  'Osimhen', 'Mané', 'Son Heung-min', 'Musiala', 'Rashford', 'Courtois', 'Alisson', 'Kimmich', 'Ødegaard',
  'Ronaldinho', 'Zidane', 'Drogba', 'Henry', 'Kaká', 'Pirlo', 'Iniesta', 'Xavi', 'Rooney', 'Eto\'o',
];

export const RANK_THEMES: { title: string; pool: string[] }[] = [
  { title: 'Strikers', pool: ['Haaland', 'Mbappé', 'Kane', 'Lewandowski', 'Benzema', 'Osimhen', 'Drogba', 'Henry', 'Suárez', 'Ronaldo Nazário', 'Eto\'o', 'Ibrahimović'] },
  { title: 'Midfield maestros', pool: ['Modrić', 'De Bruyne', 'Iniesta', 'Xavi', 'Pirlo', 'Zidane', 'Kroos', 'Rodri', 'Bellingham', 'Pedri', 'Kaká', 'Lampard'] },
  { title: 'African legends', pool: ['Drogba', 'Eto\'o', 'Salah', 'Mané', 'Yaya Touré', 'Weah', 'Okocha', 'Essien', 'Mahrez', 'Osimhen', 'Kanu', 'Hakimi'] },
  { title: 'Wonderkids', pool: ['Lamine Yamal', 'Musiala', 'Pedri', 'Gavi', 'Endrick', 'Bellingham', 'Saka', 'Wirtz', 'Garnacho', 'Camavinga', 'Mainoo', 'Zaïre-Emery'] },
  { title: 'Goalkeepers', pool: ['Buffon', 'Casillas', 'Neuer', 'Courtois', 'Alisson', 'Oblak', 'Ederson', 'Donnarumma', 'Ter Stegen', 'Onana', 'Mendy', 'Čech'] },
];

export const COMMENTARY: { line: string; options: string[]; answer: number; note: string }[] = [
  { line: '"AGÜEROOOOO! I swear you\'ll never see anything like this ever again!"', options: ['Agüero vs QPR, 2012', 'Agüero vs Arsenal, 2018', 'Argentina vs Germany, 2014', 'Man City vs Liverpool, 2019'], answer: 0, note: 'Martin Tyler, the final-day title winner for Man City.' },
  { line: '"…and Solskjaer has won it!"', options: ['1999 Champions League final', '2008 Champions League final', '1999 FA Cup final', '2001 Premier League title'], answer: 0, note: 'Clive Tyldesley, Man United vs Bayern in Barcelona.' },
  { line: '"They think it\'s all over… it is now!"', options: ['1966 World Cup final', '1996 Euro semi-final', '1970 World Cup final', '1990 World Cup semi-final'], answer: 0, note: 'Kenneth Wolstenholme as Geoff Hurst completes his hat-trick.' },
  { line: '"Corner taken quickly… ORIGI!"', options: ['Liverpool 4–0 Barcelona, 2019', 'Liverpool vs Tottenham final, 2019', 'Liverpool 3–3 Milan, 2005', 'Everton derby, 2018'], answer: 0, note: 'The Anfield comeback that sent Liverpool to the final.' },
  { line: '"Lionel Messi has conquered the final peak."', options: ['2022 World Cup final', '2021 Copa América final', '2015 Champions League final', '2014 World Cup final'], answer: 0, note: 'Peter Drury as Argentina won in Qatar.' },
  { line: '"Dennis Bergkamp! Dennis Bergkamp! Dennis Bergkamp!"', options: ['Netherlands vs Argentina, 1998', 'Arsenal vs Newcastle, 2002', 'Arsenal vs Leicester, 1997', 'Euro 2000 semi-final'], answer: 0, note: 'Jack van Gelder on that touch-and-finish in France \'98.' },
  { line: '"Mach ihn! Mach ihn! Er macht ihn!"', options: ['Götze, 2014 World Cup final', 'Müller vs Brazil, 2014', 'Klose, 2006 World Cup', 'Lahm vs Costa Rica, 2006'], answer: 0, note: 'Tom Bartels as Mario Götze won it for Germany.' },
  { line: '"¡Iniesta de mi vida!"', options: ['2010 World Cup final', 'Chelsea vs Barcelona, 2009', 'Euro 2012 final', 'El Clásico 5–0, 2010'], answer: 0, note: 'Spanish commentary on the winner vs the Netherlands.' },
  { line: '"Barrilete cósmico… ¿de qué planeta viniste?"', options: ['Maradona vs England, 1986', 'Messi vs Getafe, 2007', 'Maradona vs Belgium, 1986', 'Riquelme vs Real Madrid, 2000'], answer: 0, note: 'Víctor Hugo Morales on the Goal of the Century.' },
  { line: '"Sergio Ramos… in the 93rd minute!"', options: ['2014 Champions League final', '2016 Champions League final', '2017 Supercopa', 'El Clásico, 2016'], answer: 0, note: 'The 92:48 equaliser vs Atlético on the way to La Décima.' },
];

export const DELUSION_QS: { q: string; options: { t: string; pts: number }[] }[] = [
  { q: 'Your club\'s chances of winning the league this season?', options: [{ t: 'Realistic: top 4 maybe', pts: 0 }, { t: 'We\'re contenders', pts: 8 }, { t: 'Already printing the shirts', pts: 18 }, { t: 'Treble. Easy.', pts: 25 }] },
  { q: 'Your worst player is…', options: [{ t: 'Genuinely bad', pts: 0 }, { t: 'Just needs time', pts: 8 }, { t: 'Misunderstood genius', pts: 15 }, { t: 'Better than Messi', pts: 22 }] },
  { q: 'After a 4–0 loss you say…', options: [{ t: 'We were terrible', pts: 0 }, { t: 'Ref robbed us', pts: 12 }, { t: 'Moral victory', pts: 16 }, { t: 'Didn\'t watch, doesn\'t count', pts: 20 }] },
  { q: 'Your eFootball rating of yourself?', options: [{ t: 'Average', pts: 0 }, { t: 'Above average', pts: 6 }, { t: 'Top 3 in class', pts: 12 }, { t: 'Should be pro', pts: 20 }] },
  { q: 'When a new signing arrives…', options: [{ t: 'Wait and see', pts: 0 }, { t: 'Edit his Wikipedia', pts: 10 }, { t: 'Buy his shirt day one', pts: 14 }, { t: 'Already Ballon d\'Or', pts: 20 }] },
];

export const AURA_TRAITS: { group: string; options: { t: string; pts: number }[] }[] = [
  { group: 'Fit', options: [{ t: 'Full tracksuit', pts: 8 }, { t: 'Matching set', pts: 14 }, { t: 'Oversized hoodie', pts: 10 }, { t: 'Formal for no reason', pts: 16 }, { t: 'Pyjamas to class', pts: 3 }] },
  { group: 'Shoes', options: [{ t: 'Clean white sneakers', pts: 15 }, { t: 'Slides + socks', pts: 6 }, { t: 'Boots', pts: 12 }, { t: 'Football boots indoors', pts: 4 }] },
  { group: 'Accessory', options: [{ t: 'Chain', pts: 12 }, { t: 'Headphones on, music off', pts: 14 }, { t: 'Backpack on one strap', pts: 11 }, { t: 'Nothing. Raw.', pts: 8 }] },
  { group: 'Vibe', options: [{ t: 'Silent but deadly', pts: 18 }, { t: 'Loud & proud', pts: 10 }, { t: 'Lecturer\'s favourite', pts: 9 }, { t: 'Always eating', pts: 7 }, { t: 'Mysterious', pts: 20 }] },
  { group: 'Entrance', options: [{ t: 'Late, unbothered', pts: 16 }, { t: 'Early, front row', pts: 7 }, { t: 'Never seen arriving', pts: 19 }, { t: 'Running, apologising', pts: 3 }] },
];

export const AWARDS = [
  'Most Likely To Sleep Through Graduation', 'Group Project MVP', 'Certified Attendance Faker', 'eFootball Menace of the Year',
  'Professional Excuse Maker', 'The Human Wi-Fi Hotspot', 'Lifetime Achievement in Being Late', 'Best Dressed On A Budget',
  'Chief Of Vibes', 'Last-Minute Submission Legend', 'Class Group Chat Admin (Self-Appointed)', 'Cafeteria Food Critic',
];

export const EXCUSE_PARTS = {
  opener: [
    'Dear class,', 'Good morning everyone,', 'URGENT:', 'Class rep, kindly inform the students:', 'Hello my dear students,',
  ],
  reason: [
    'my laptop has decided to install 147 updates', 'my goat escaped and is currently in the Dean\'s office', 'I am stuck in traffic behind a wedding convoy',
    'the projector and I are no longer on speaking terms', 'my power bank is at 2% and so is my motivation', 'I was called to referee a very important eFootball final',
    'my neighbour\'s rooster has filed a noise complaint against me', 'I accidentally locked myself out of the staff room', 'I am attending an emergency meeting about meetings',
    'my car only starts when it feels appreciated', 'I sprained my ankle celebrating my team\'s goal', 'the Wi-Fi at my house finally got the better of me',
  ],
  ending: [
    'Please read chapters 1 to 14 for next week.', 'There will be a surprise CAT next class.', 'Use this time to work on your group projects.',
    'Attendance will still be taken.', 'Kindly do not celebrate in the corridor.', 'We shall catch up on Saturday at 7 AM.',
  ],
};

export const ROAST_BITS = {
  vibe: [
    'sounds like a Wi-Fi network nobody can connect to', 'sounds like a substitute who never comes on', 'is giving "group project member who only did the title page"',
    'sounds like a password with 3 special characters', 'has main-character energy in a background-extra body', 'sounds like the cafeteria special that\'s always sold out',
    'sounds like a 4-star player with 2-star stamina', 'is the human equivalent of "seen 2:14 AM"',
  ],
  power: [
    'Special ability: arriving exactly when attendance ends.', 'Special ability: saying "I\'m almost there" from bed.', 'Special ability: finding the one free socket in the library.',
    'Special ability: 100% confidence, 12% accuracy.', 'Special ability: replying to group chats only to say "who?"', 'Special ability: turning every topic into football.',
  ],
};

export const ADMIRER_FACTS = {
  seat: ['front row', 'middle rows', 'back row', 'near the window', 'next to the door', 'wherever the socket is'],
  vibe: ['quiet', 'loud', 'funny', 'always late', 'always early', 'always eating', 'mysterious'],
  wears: ['a hoodie', 'glasses', 'sneakers', 'a cap', 'a chain', 'a jersey', 'a watch'],
};

