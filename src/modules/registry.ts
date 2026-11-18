import type { LucideIcon } from 'lucide-react-native';
import {
  AudioWaveform,
  Award,
  BadgeCheck,
  Ban,
  Banknote,
  Bird,
  Bomb,
  Brain,
  CalendarDays,
  Calculator,
  Crosshair,
  Crown,
  Dices,
  Clapperboard,
  Disc3,
  DiscAlbum,
  Drum,
  Drama,
  Flag,
  Flame,
  FlameKindling,
  Gauge,
  Gavel,
  Ghost,
  Goal,
  Grid3x3,
  Hand,
  ImagePlus,
  Images,
  Heart,
  ListChecks,
  ListMusic,
  ListOrdered,
  Mail,
  Megaphone,
  Mic,
  MicOff,
  MoveVertical,
  Newspaper,
  Palette,
  Rainbow,
  Route,
  Scissors,
  ScrollText,
  Shield,
  Spade,
  Sparkles,
  Split,
  Swords,
  Table,
  Target,
  Timer,
  Trophy,
  Users,
  UtensilsCrossed,
  VenetianMask,
  Vote,
  Zap,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { ART, type ArtKey } from '../lib/art';
import { C } from '../theme';
import * as A from './arcade';
import * as Cr from './crush';
import * as E from './efootball';
import * as P from './party';
import * as T from './trivia';
import * as V from './vibes';
import type { ModuleProps } from './types';

export type CategoryId = 'crush' | 'efootball' | 'party' | 'arcade' | 'trivia' | 'vibes';

export const CATEGORIES: Record<CategoryId, { label: string; short: string; color: string; art: ArtKey; tagline: string }> = {
  crush: { label: 'Secret Crush & Anonymous Lounge', short: 'Crush & Anon', color: C.violet, art: 'sparkling-heart', tagline: 'Crushes, confessions & polls' },
  efootball: { label: 'eFootball & PES Battle Arena', short: 'eFootball', color: C.cobalt, art: 'ball', tagline: 'Brackets, leagues & beef' },
  party: { label: 'Pass-the-Phone Party & Roast', short: 'Party', color: C.orange, art: 'party', tagline: 'Pass the phone, roast a friend' },
  arcade: { label: '2-Player & Reflex Arcade', short: 'Arcade', color: C.green, art: 'joystick', tagline: 'Reflex & 2-player games' },
  trivia: { label: 'Football Trivia & Viral Generators', short: 'Trivia & Tools', color: C.amber, art: 'commentary', tagline: 'Quizzes & meme-worthy cards' },
  vibes: { label: 'Music, Memes & GIFs', short: 'Vibes', color: C.pink, art: 'songs', tagline: 'Songs, beats, memes & GIFs' },
};

export const CATEGORY_ORDER: CategoryId[] = ['crush', 'efootball', 'party', 'arcade', 'trivia', 'vibes'];

export type ModuleDef = {
  id: string;
  title: string;
  cat: CategoryId;
  tag: string;
  blurb: string;
  icon: LucideIcon;
  Component: ComponentType<ModuleProps>;
  /** Game owns the whole screen (no scroll container). */
  fullscreen?: boolean;
};

/** Every module's 3D art lives at assets/3d/<id>.png. */
export const artOf = (id: string): ArtKey => (id in ART ? (id as ArtKey) : 'games');

export const MODULES: ModuleDef[] = [
  // 0. Music, Memes & GIFs (online)
  { id: 'songs', title: 'Song Explorer', cat: 'vibes', tag: 'MUSIC', blurb: 'Top charts & genres with 30s previews.', icon: ListMusic, Component: V.SongExplorer },
  { id: 'beats', title: 'Beat Explorer', cat: 'vibes', tag: 'BEATS', blurb: 'Amapiano, drill, lo-fi & afro instrumentals.', icon: Drum, Component: V.BeatExplorer },
  { id: 'song-drop', title: 'Song Drop', cat: 'vibes', tag: 'CLASS DJ', blurb: 'Drop a track, vote it up, crown the song of the day.', icon: DiscAlbum, Component: V.SongDrop },
  { id: 'memes', title: 'Meme Explorer', cat: 'vibes', tag: 'MEMES', blurb: 'Fresh memes: student, football, African, dev.', icon: Images, Component: V.MemeExplorer },
  { id: 'gifs', title: 'Funny GIF Finder', cat: 'vibes', tag: 'GIFS', blurb: 'Reaction GIFs to share in the group chat.', icon: Clapperboard, Component: V.GifFinder },
  { id: 'meme-maker', title: 'Meme Maker', cat: 'vibes', tag: 'CREATE', blurb: 'Top text, bottom text, instant classic.', icon: ImagePlus, Component: V.MemeMaker },

  // 1. Secret Crush & Anonymous Lounge
  { id: 'crush-board', title: 'Secret Crush Board', cat: 'crush', tag: 'ANON', blurb: 'Post anonymous crushes, send hearts, guess who.', icon: Heart, Component: Cr.CrushBoard },
  { id: 'confessions', title: 'Class Confessions', cat: 'crush', tag: 'ANON', blurb: 'Tap-to-unblur confessions with live reactions.', icon: Ghost, Component: Cr.Confessions },
  { id: 'rizz-meter', title: 'Rizz Meter', cat: 'crush', tag: 'SPICY', blurb: 'Two names in. Compatibility % and a campus roast out.', icon: Gauge, Component: Cr.RizzMeter },
  { id: 'polls', title: 'Anonymous Polls', cat: 'crush', tag: 'LIVE', blurb: 'Create and vote on live class polls.', icon: Vote, Component: Cr.Polls },
  { id: 'aura', title: 'Drip / Aura Rater', cat: 'crush', tag: 'SPICY', blurb: 'Pick the fit, get a shareable Aura Score.', icon: Sparkles, Component: Cr.AuraRater },
  { id: 'admirer', title: 'Secret Admirer Hints', cat: 'crush', tag: 'ANON', blurb: 'Drop 3 mystery clues for someone in class.', icon: Mail, Component: Cr.AdmirerHints },

  // 2. eFootball & PES Battle Arena
  { id: 'bracket', title: 'Knockout Bracket', cat: 'efootball', tag: 'eFOOTBALL', blurb: 'QF → SF → Final with score entry and pens.', icon: Trophy, Component: E.KnockoutBracket },
  { id: 'league', title: 'Class League Table', cat: 'efootball', tag: 'eFOOTBALL', blurb: 'Auto P, W, D, L, GD, Pts from every result.', icon: Table, Component: E.LeagueTable },
  { id: 'hype-poster', title: '1v1 Hype Poster', cat: 'efootball', tag: 'GENERATOR', blurb: 'Screenshot-ready broadcast match card.', icon: Megaphone, Component: E.HypePoster },
  { id: 'team-wheel', title: 'Team & Formation Wheel', cat: 'efootball', tag: 'SPIN', blurb: 'Spin for a random club and formation.', icon: Disc3, Component: E.TeamWheel },
  { id: 'pens', title: 'Penalty Mind-Game', cat: 'efootball', tag: 'VS CPU', blurb: 'Left, centre or right? The keeper learns.', icon: Goal, Component: E.PenaltyMindGame },
  { id: 'bingo', title: 'PES Excuse Bingo', cat: 'efootball', tag: 'SPICY', blurb: 'Mark every excuse. Four in a row wins.', icon: Grid3x3, Component: E.ExcuseBingo },
  { id: 'rivalry', title: 'Rivalry Tracker', cat: 'efootball', tag: 'H2H', blurb: 'Head-to-head records and streaks.', icon: Swords, Component: E.RivalryTracker },
  { id: 'wso', title: 'Winner Stays On', cat: 'efootball', tag: 'QUEUE', blurb: 'Manage the controller queue and king streaks.', icon: Crown, Component: E.WinnerStaysOn },
  { id: 'handicap', title: 'Handicap Spinner', cat: 'efootball', tag: 'SPIN', blurb: 'No Sprint. Manual Passing. 3-Star Teams.', icon: Ban, Component: E.HandicapSpinner },
  { id: 'wooden-spoon', title: 'Wooden Spoon Wall', cat: 'efootball', tag: 'SHAME', blurb: 'The Hall of Shame. Throw tomatoes.', icon: UtensilsCrossed, Component: E.WoodenSpoon },

  // 3. Pass-the-Phone Party & Roast
  { id: 'imposter', title: 'Campus Imposter', cat: 'party', tag: 'PASS-PHONE', blurb: 'Spyfall with campus spots & footballers.', icon: VenetianMask, Component: P.Imposter },
  { id: 'who-in-class', title: 'Who In This Class?', cat: 'party', tag: 'ANON', blurb: 'Rapid roast prompts + secret voting.', icon: Users, Component: P.WhoInClass },
  { id: 'five-second', title: '5-Second Rule', cat: 'party', tag: 'TIMER', blurb: 'Name 3 things before the buzzer.', icon: Timer, Component: P.FiveSecond },
  { id: 'truth-dare', title: 'Hot Seat Truth or Dare', cat: 'party', tag: 'SPICY', blurb: 'Random hot seat, then truth or dare.', icon: Flame, Component: P.TruthOrDare },
  { id: 'never', title: 'Never Have I Ever', cat: 'party', tag: 'CAMPUS', blurb: 'Five fingers each. Campus edition.', icon: Hand, Component: P.NeverHaveIEver },
  { id: 'bomb', title: 'Bomb Hot-Potato', cat: 'party', tag: 'PASS-PHONE', blurb: 'Hidden fuse. Answer and pass, fast.', icon: Bomb, Component: P.BombPotato },
  { id: 'wyr', title: 'Would You Rather', cat: 'party', tag: 'VOTE', blurb: 'Impossible campus & football choices.', icon: Split, Component: P.WouldYouRather },
  { id: 'charades', title: 'Rapid Charades', cat: 'party', tag: 'TIMER', blurb: 'Act it out in 60 seconds.', icon: Drama, Component: P.Charades },
  { id: 'taboo', title: 'Forbidden Word', cat: 'party', tag: 'TEAMS', blurb: 'Describe it without the banned words.', icon: MicOff, Component: P.ForbiddenWord },
  { id: 'bluff', title: 'Fake News Detective', cat: 'party', tag: 'QUIZ', blurb: 'Real headline or total bluff?', icon: Newspaper, Component: P.BluffDetective },
  { id: 'wavelength', title: 'Mind-Sync Wavelength', cat: 'party', tag: 'TEAMS', blurb: 'One clue. Find the hidden spot.', icon: AudioWaveform, Component: P.Wavelength },
  { id: 'victim', title: 'Random Victim Wheel', cat: 'party', tag: 'SPIN', blurb: 'Spin the Classmate Roster.', icon: Target, Component: P.VictimWheel },

  // 4. 2-Player & Reflex Arcade
  { id: 'tug', title: 'Finger Tug-of-War', cat: 'arcade', tag: '2-PLAYER', blurb: 'Same screen. Tap faster than your rival.', icon: MoveVertical, Component: A.TugOfWar, fullscreen: true },
  { id: 'keeper-duel', title: 'Keeper Reflex Duel', cat: 'arcade', tag: '2-PLAYER', blurb: 'Dive the right way first.', icon: Shield, Component: A.KeeperDuel, fullscreen: true },
  { id: 'crossbar', title: 'Crossbar Challenge', cat: 'arcade', tag: 'SOLO', blurb: 'Stop the power bar on the bar.', icon: Crosshair, Component: A.Crossbar },
  { id: 'f1-lights', title: 'F1 Lights Reaction', cat: 'arcade', tag: 'REFLEX', blurb: 'Lights out and away we go.', icon: Flag, Component: A.F1Lights },
  { id: 'stroop', title: 'Stroop Brain Trap', cat: 'arcade', tag: 'BRAIN', blurb: 'Tap the ink colour, not the word.', icon: Palette, Component: A.Stroop },
  { id: 'flappy', title: 'Flappy Football', cat: 'arcade', tag: 'SOLO', blurb: 'Keep the ball up. Dodge the posts.', icon: Bird, Component: A.FlappyFootball, fullscreen: true },
  { id: 'simon', title: 'Simon Memory Flash', cat: 'arcade', tag: 'BRAIN', blurb: 'Repeat the growing pattern.', icon: Brain, Component: A.Simon },
  { id: 'tap-battle', title: '10-Second Tap Battle', cat: 'arcade', tag: '2-PLAYER', blurb: 'Who has the fastest thumbs?', icon: Zap, Component: A.TapBattle, fullscreen: true },
  { id: 'rps', title: 'Rock-Paper-Scissors', cat: 'arcade', tag: 'BEST OF 5', blurb: 'First to 3 against the CPU.', icon: Scissors, Component: A.RockPaperScissors },
  { id: 'hilo', title: 'Higher or Lower', cat: 'arcade', tag: 'STREAK', blurb: 'Card streak challenge.', icon: Spade, Component: A.HigherLower },
  { id: 'math', title: 'Quick Math Sprint', cat: 'arcade', tag: 'BRAIN', blurb: '30 seconds of mental maths.', icon: Calculator, Component: A.MathSprint },
  { id: 'dice', title: 'Dice & Coin Fate', cat: 'arcade', tag: 'FATE', blurb: 'Settle every argument.', icon: Dices, Component: A.DiceCoin },

  // 5. Football Trivia & Viral Generators
  { id: 'career', title: 'Guess the Career Path', cat: 'trivia', tag: 'QUIZ', blurb: 'Clubs in order. Name the player.', icon: Route, Component: T.CareerPath },
  { id: 'fees', title: 'Transfer Fee Hi-Lo', cat: 'trivia', tag: 'STREAK', blurb: 'Was it more or less than that?', icon: Banknote, Component: T.TransferHL },
  { id: 'sbs', title: 'Start, Bench, Sell', cat: 'trivia', tag: 'DEBATE', blurb: 'Three players, three fates.', icon: ListChecks, Component: T.StartBenchSell },
  { id: 'blind-rank', title: 'Blind Rank 5', cat: 'trivia', tag: 'DEBATE', blurb: 'Rank them before you see who\'s next.', icon: ListOrdered, Component: T.BlindRank },
  { id: 'predictor', title: 'Scoreline Predictor', cat: 'trivia', tag: 'LEAGUE', blurb: 'Weekend predictions with points.', icon: CalendarDays, Component: T.ScorelinePredictor },
  { id: 'commentary', title: 'Iconic Commentary Quiz', cat: 'trivia', tag: 'QUIZ', blurb: 'Name the moment from the mic.', icon: Mic, Component: T.CommentaryQuiz },
  { id: 'delusion', title: 'Delusional Fan Meter', cat: 'trivia', tag: 'SPICY', blurb: 'How deep is the copium?', icon: Rainbow, Component: T.DelusionalMeter },
  { id: 'banter', title: 'Hot-Take Banter Court', cat: 'trivia', tag: 'VOTE', blurb: 'W or L? The jury decides.', icon: Gavel, Component: T.BanterCourt },
  { id: 'here-we-go', title: '"HERE WE GO!" Card', cat: 'trivia', tag: 'GENERATOR', blurb: 'Breaking-news transfer card maker.', icon: BadgeCheck, Component: T.HereWeGo },
  { id: 'certificate', title: 'Fake Award Certificate', cat: 'trivia', tag: 'GENERATOR', blurb: 'Honour the class legends.', icon: Award, Component: T.AwardCertificate },
  { id: 'lecturer-excuse', title: 'Lecturer Excuse Gen', cat: 'trivia', tag: 'GENERATOR', blurb: 'Why class is cancelled today.', icon: ScrollText, Component: T.LecturerExcuse },
  { id: 'roast-name', title: 'Roast-My-Name', cat: 'trivia', tag: 'SPICY', blurb: 'Type a name. Receive damage.', icon: FlameKindling, Component: T.RoastMyName },
];

export const MODULE_MAP: Record<string, ModuleDef> = Object.fromEntries(MODULES.map((m) => [m.id, m]));
