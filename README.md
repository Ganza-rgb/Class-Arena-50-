# CLASS ARENA 50+

A cozy **Campus Quest** world for the class: islands on a map, stone plaques, chunky buttons and original 3D art. 58 playable games and tools, built with Expo (React Native + TypeScript).

## Run it

```bash
npm install
npx expo start        # scan the QR code with Expo Go (Android / iOS)
npx expo start --web  # or open in a browser
```

## Checks

```bash
npm run typecheck     # tsc --noEmit (strict + noUnused*)
npx expo lint
npx expo-doctor
```

## Structure

```
src/app/                 Expo Router routes
  _layout.tsx            fonts, safe area, soundboard provider, stack
  index.tsx              shell: Map · Games · Ranks · Party · Settings tabs + scenery
  module/[id].tsx        renders any of the 58 modules by id
src/modules/
  registry.ts            the data-driven list of all 58 modules (add one here)
  crush.tsx              6 · Secret Crush & Anonymous Lounge
  efootball.tsx          10 · eFootball & PES Battle Arena
  party.tsx              12 · Pass-the-Phone Party & Roast
  arcade.tsx             12 · 2-Player & Reflex Arcade
  trivia.tsx             12 · Football Trivia & Viral Generators
  vibes.tsx               6 · Music, Memes & GIFs (needs internet)
src/lib/media.ts         music / meme / GIF / template API clients
src/engines/             reusable engines: Wheel, QuizRunner, TapZone (multi-touch), hooks (countdown, deck, rAF loop)
src/ui/                  UI kit (Txt, Btn, Card, Chip, Sheet, Field) + Campus Quest blocks (Plaque, StoneBtn, Chunky, Coins, Float)
src/screens/             HomeTab (Class Map + Class Night), GamesTab, RankingTab, PartyTab, SettingsTab
src/components/          Scenery (sky/grass/earth), Nav, Header, ModuleCard, Soundboard, Roster
src/lib/art.ts           typed map of every 3D sprite (generated)
src/lib/store.ts         usePersisted — AsyncStorage-backed state shared across screens
src/lib/sound.ts         soundboard playback (expo-audio) + haptics
src/data/                seed data (roster, crushes, confessions, league…) and content decks
scripts/gen-sounds.mjs   synthesises the 8 soundboard WAVs
scripts/render-3d.mjs    renders every 3D model to assets/3d (see below)
design/                  HTML design directions + the three.js 3D kit (npm run design)
```

## Notes

- **Persistence:** everything is saved on-device with AsyncStorage (React Native's equivalent of localStorage). The Roster tab can restore the sample class.
- **Sounds:** React Native has no Web Audio API, so the 8 effects (Airhorn, Goal Roar, Crowd Boo, Whistle, Sad Trombone, Rimshot, Dramatic Boom, Heartbeat) are synthesised with the same oscillator/noise/envelope techniques by `npm run gen:sounds` into `assets/sounds/`, then played with `expo-audio`.
- **2-player games** (Tug-of-War, Keeper Duel, Tap Battle) use raw touch events so both players can tap at the same time on one phone.
- Transfer fees are approximate reported base fees; the "HERE WE GO!" card is a parody generator.

## Music, Memes & GIFs (online)

| Module | Source | Key needed |
|---|---|---|
| Song Explorer / Beat Explorer | Apple Music charts (NG, KE, ZA, US, UK) + iTunes Search, 30-second previews | No |
| Song Drop | Same search; drops, 🔥/🗑️ votes and "Song of the Day" are stored on the device | No |
| Meme Explorer | Reddit via meme-api.com (r/memes, r/StudentMemes, r/soccermemes, r/africanmemes…), NSFW/spoiler posts filtered | No |
| Meme Maker | Imgflip templates or your own photo; shares a rendered JPG | No |
| Funny GIF Finder | Reaction-GIF subreddits by default; **search** turns on with a GIPHY key (rating `pg-13`) | Optional |

To enable GIF search, get a free key at https://developers.giphy.com, then copy `.env.example` to `.env`, fill it in, and restart `npx expo start`:

```
EXPO_PUBLIC_GIPHY_API_KEY=your_key_here
```

Apple's chart feed blocks browser requests, so in the web preview Song Explorer starts on genre search instead of charts; phones get charts.

## Original 3D art

Every image in the app (game icons, mascots, medals, coins, UI) is an original 3D model built in code with three.js. There are no emoji or stock assets.

- Models live in `design/3d/kit.js` (`PROPS` maps each art key to a model).
- `npm run gen:art` renders them headlessly (Edge/Chrome with software WebGL) to transparent 384px PNGs in `assets/3d/` and regenerates `src/lib/art.ts`.
- To add art: write a builder in `kit.js`, add its key to `PROPS`, run `npm run gen:art`, then use `<Art name="your-key" />`.
- Preview everything at `npm run design` → http://localhost:5050/design/3d/sprites.html. The live, real-time version (mascots that blink and follow the cursor) is at `/design/e-living-3d.html`.

## Design directions

`npm run design` serves `design/`: five HTML directions (A–E). The app is built on **C · Campus Quest**.
