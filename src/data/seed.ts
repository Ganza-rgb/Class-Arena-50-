// Pre-populated sample data so the app feels alive on first launch.
// All names are fictional.
const H = 3600_000;
const now = Date.now();

export type Classmate = { id: string; name: string; nick: string; club: string; efootball: boolean };

export const SEED_ROSTER: Classmate[] = [
  { id: 'c1', name: 'Aline Uwase', nick: 'The Notetaker', club: 'Real Madrid', efootball: false },
  { id: 'c2', name: 'Kevin Mugisha', nick: 'K-Mug', club: 'Arsenal', efootball: true },
  { id: 'c3', name: 'Grace Ingabire', nick: 'Gracie', club: 'Barcelona', efootball: false },
  { id: 'c4', name: 'Eric Niyonzima', nick: 'Skill Moves Eric', club: 'Man City', efootball: true },
  { id: 'c5', name: 'Diane Mutoni', nick: 'DJ Di', club: 'Liverpool', efootball: true },
  { id: 'c6', name: 'Patrick Habimana', nick: 'Pato', club: 'Chelsea', efootball: true },
  { id: 'c7', name: 'Sandra Keza', nick: 'San', club: 'PSG', efootball: false },
  { id: 'c8', name: 'Jean-Paul Hakizimana', nick: 'JP', club: 'Man United', efootball: true },
  { id: 'c9', name: 'Brenda Akello', nick: 'Bree', club: 'Bayern', efootball: false },
  { id: 'c10', name: 'Samuel Otieno', nick: 'Sammy Rage-Quit', club: 'Man United', efootball: true },
  { id: 'c11', name: 'Ange Umutoni', nick: 'Angel', club: 'Juventus', efootball: false },
  { id: 'c12', name: 'David Kamau', nick: 'Dave The Wall', club: 'Arsenal', efootball: true },
  { id: 'c13', name: 'Fiona Nyambura', nick: 'Fifi', club: 'Liverpool', efootball: false },
  { id: 'c14', name: 'Cedric Manzi', nick: 'Ced', club: 'Real Madrid', efootball: true },
  { id: 'c15', name: 'Joy Achieng', nick: 'Joyful', club: 'Chelsea', efootball: false },
  { id: 'c16', name: 'Yves Irakoze', nick: 'Late Yves', club: 'Barcelona', efootball: true },
  { id: 'c17', name: 'Linda Wanjiru', nick: 'Lindz', club: 'AC Milan', efootball: false },
  { id: 'c18', name: 'Moses Ssempa', nick: 'Mo Salah Jr', club: 'Liverpool', efootball: true },
  { id: 'c19', name: 'Clarisse Iradukunda', nick: 'Clara', club: 'Inter', efootball: false },
  { id: 'c20', name: 'Brian Ochieng', nick: 'B-Tech', club: 'Man City', efootball: true },
];

export type Crush = {
  id: string;
  to: string;
  message: string;
  hearts: number;
  guesses: string[];
  ts: number;
  color: number;
};

export const SEED_CRUSHES: Crush[] = [
  {
    id: 'cr1',
    to: 'Girl in the blue hoodie, row 3',
    message: 'You lent me a pen in the Data Structures CAT and I have not returned it OR my heart. 🖊️',
    hearts: 34,
    guesses: ['It is definitely Yves 👀', 'Whoever it is, return the pen'],
    ts: now - 2 * H,
    color: 2,
  },
  {
    id: 'cr2',
    to: 'Kevin M.',
    message: 'The way you defend Arsenal every single week… loyalty like that is rare. Marry me after we finish the semester.',
    hearts: 51,
    guesses: ['Diane for sure', 'This is a Tottenham fan trolling'],
    ts: now - 5 * H,
    color: 0,
  },
  {
    id: 'cr3',
    to: 'The one who always says "let me share my screen"',
    message: 'Share your number instead. 📱',
    hearts: 22,
    guesses: [],
    ts: now - 9 * H,
    color: 4,
  },
  {
    id: 'cr4',
    to: 'Grace I.',
    message: 'You explained recursion to me and now I can\'t stop thinking about you. Base case: me + you.',
    hearts: 67,
    guesses: ['Nerd love 😭', 'Eric wrote this, I know his rizz'],
    ts: now - 26 * H,
    color: 1,
  },
];

export type Confession = {
  id: string;
  num: number;
  text: string;
  laugh: number;
  skull: number;
  cap: number;
  ts: number;
};

export const SEED_CONFESSIONS: Confession[] = [
  { id: 'cf1', num: 42, text: 'I actually enjoy 8 AM lectures. The silence, the empty seats, the lecturer only teaching me. Peak.', laugh: 42, skull: 19, cap: 31, ts: now - 1 * H },
  { id: 'cf2', num: 41, text: 'I have been marking myself present for my roommate since week 2. He has never been to Networking class.', laugh: 77, skull: 54, cap: 6, ts: now - 4 * H },
  { id: 'cf3', num: 40, text: 'I lost 9 eFootball games in a row and told everyone my controller was broken. It was not broken.', laugh: 88, skull: 23, cap: 12, ts: now - 7 * H },
  { id: 'cf4', num: 39, text: 'The group project "we" submitted? I wrote all of it at 3 AM. You\'re welcome, Group 7.', laugh: 35, skull: 61, cap: 18, ts: now - 20 * H },
  { id: 'cf5', num: 38, text: 'I still don\'t know what an API is and we\'re in third year. I just nod.', laugh: 120, skull: 98, cap: 4, ts: now - 30 * H },
];

export type LeagueMatch = { id: string; home: string; away: string; hs: number; as: number; ts: number };

export const SEED_LEAGUE_PLAYERS: string[] = ['Kevin', 'Eric', 'Diane', 'Patrick', 'JP', 'Samuel', 'David', 'Brian'];

export const SEED_LEAGUE_MATCHES: LeagueMatch[] = [
  { id: 'm1', home: 'Eric', away: 'Samuel', hs: 4, as: 1, ts: now - 50 * H },
  { id: 'm2', home: 'Kevin', away: 'Diane', hs: 2, as: 2, ts: now - 49 * H },
  { id: 'm3', home: 'Patrick', away: 'JP', hs: 1, as: 3, ts: now - 48 * H },
  { id: 'm4', home: 'David', away: 'Brian', hs: 0, as: 0, ts: now - 47 * H },
  { id: 'm5', home: 'Eric', away: 'Kevin', hs: 3, as: 2, ts: now - 26 * H },
  { id: 'm6', home: 'Diane', away: 'Samuel', hs: 5, as: 0, ts: now - 25 * H },
  { id: 'm7', home: 'JP', away: 'David', hs: 2, as: 1, ts: now - 24 * H },
  { id: 'm8', home: 'Brian', away: 'Patrick', hs: 3, as: 3, ts: now - 23 * H },
  { id: 'm9', home: 'Samuel', away: 'Brian', hs: 1, as: 2, ts: now - 3 * H },
  { id: 'm10', home: 'Diane', away: 'Eric', hs: 1, as: 1, ts: now - 2 * H },
];

export type Poll = { id: string; q: string; options: { text: string; votes: number }[]; voted: number | null; ts: number };

export const SEED_POLLS: Poll[] = [
  {
    id: 'p1',
    q: 'Who is actually going to finish the group project?',
    options: [
      { text: 'Aline (as always)', votes: 18 },
      { text: 'Whoever panics first', votes: 11 },
      { text: 'ChatGPT', votes: 23 },
      { text: 'Nobody, we die together', votes: 9 },
    ],
    voted: null,
    ts: now - 3 * H,
  },
  {
    id: 'p2',
    q: 'Best spot to "study" before exams?',
    options: [
      { text: 'Library 3rd floor', votes: 14 },
      { text: 'Cafeteria (eating)', votes: 21 },
      { text: 'Bed. Final answer.', votes: 27 },
    ],
    voted: null,
    ts: now - 12 * H,
  },
];

export type Shame = { id: string; name: string; crime: string; tomatoes: number; ts: number };

export const SEED_SHAME: Shame[] = [
  { id: 's1', name: 'Samuel', crime: 'Lost 5–0 to Diane, then claimed the sun was in his eyes. Indoors.', tomatoes: 41, ts: now - 25 * H },
  { id: 's2', name: 'Patrick', crime: 'Scored 3 own goals in one match. Called it "tactical".', tomatoes: 28, ts: now - 70 * H },
  { id: 's3', name: 'David', crime: 'Rage-quit at 0–0 because "the ref is biased". There is no ref.', tomatoes: 19, ts: now - 120 * H },
];

export type HotTake = { id: string; text: string; w: number; l: number; mine: 'w' | 'l' | null; ts: number };

export const SEED_TAKES: HotTake[] = [
  { id: 't1', text: 'Penaldo is still better than Messi at taking free kicks in 2026.', w: 14, l: 39, mine: null, ts: now - 4 * H },
  { id: 't2', text: 'Arsenal fans have suffered more than final-year students.', w: 47, l: 12, mine: null, ts: now - 9 * H },
  { id: 't3', text: 'The lecturer who ends class early is the real Ballon d\'Or winner.', w: 88, l: 3, mine: null, ts: now - 15 * H },
  { id: 't4', text: 'Playing eFootball on manual passing is the only real way. Everyone else is a casual.', w: 19, l: 26, mine: null, ts: now - 30 * H },
];

export type Rivalry = { id: string; a: string; b: string; aw: number; bw: number; d: number; log: ('a' | 'b' | 'd')[] };

export const SEED_RIVALRIES: Rivalry[] = [
  { id: 'r1', a: 'Eric', b: 'Kevin', aw: 7, bw: 5, d: 2, log: ['a', 'b', 'a', 'd', 'a'] },
  { id: 'r2', a: 'Diane', b: 'Samuel', aw: 9, bw: 1, d: 0, log: ['a', 'a', 'a', 'a'] },
];
