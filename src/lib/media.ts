// Network sources for the Music, Memes & GIFs section. All are free; only GIPHY needs a key.

async function getJson<T>(url: string, timeoutMs = 12000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

export function errorText(e: unknown): string {
  if (e instanceof Error && e.name === 'AbortError') return 'The request timed out. Check your connection.';
  return 'Couldn’t load right now. Check your connection and try again.';
}

// ---------------------------------------------------------------- Music (Apple / iTunes)
export type Track = {
  id: string;
  title: string;
  artist: string;
  art: string;
  preview: string | null;
  link: string;
  explicit: boolean;
  genre: string;
};

type ItunesResult = {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
  trackExplicitness?: string;
  primaryGenreName?: string;
  kind?: string;
};

const toTrack = (r: ItunesResult): Track | null => {
  if (!r.trackId || !r.trackName) return null;
  return {
    id: String(r.trackId),
    title: r.trackName,
    artist: r.artistName ?? 'Unknown artist',
    art: (r.artworkUrl100 ?? '').replace('100x100bb', '300x300bb'),
    preview: r.previewUrl ?? null,
    link: r.trackViewUrl ?? '',
    explicit: r.trackExplicitness === 'explicit',
    genre: r.primaryGenreName ?? '',
  };
};

export async function searchTracks(term: string, opts: { clean: boolean; country?: string; limit?: number }): Promise<Track[]> {
  const q = new URLSearchParams({
    term,
    media: 'music',
    entity: 'song',
    limit: String(opts.limit ?? 30),
    country: opts.country ?? 'us',
    explicit: opts.clean ? 'No' : 'Yes',
  });
  const j = await getJson<{ results: ItunesResult[] }>(`https://itunes.apple.com/search?${q.toString()}`);
  return j.results.map(toTrack).filter((t): t is Track => t !== null && (!opts.clean || !t.explicit));
}

export const CHART_COUNTRIES: { code: string; label: string }[] = [
  { code: 'ng', label: '🇳🇬 Nigeria' },
  { code: 'ke', label: '🇰🇪 Kenya' },
  { code: 'za', label: '🇿🇦 South Africa' },
  { code: 'us', label: '🇺🇸 USA' },
  { code: 'gb', label: '🇬🇧 UK' },
];

/** Apple Music "most played" chart, then a lookup to attach 30s previews. */
export async function chartTracks(country: string, clean: boolean): Promise<Track[]> {
  const feed = await getJson<{ feed: { results: { id: string }[] } }>(
    `https://rss.marketingtools.apple.com/api/v2/${country}/music/most-played/40/songs.json`,
  );
  const ids = feed.feed.results.map((r) => r.id);
  if (!ids.length) return [];
  const j = await getJson<{ results: ItunesResult[] }>(`https://itunes.apple.com/lookup?id=${ids.join(',')}&country=${country}&entity=song`);
  const byId = new Map(j.results.map(toTrack).filter((t): t is Track => t !== null).map((t) => [t.id, t]));
  return ids.map((id) => byId.get(id)).filter((t): t is Track => !!t && (!clean || !t.explicit));
}

// ---------------------------------------------------------------- Memes & reaction GIFs (Reddit via meme-api)
export type Meme = { id: string; title: string; url: string; sub: string; ups: number; link: string; isGif: boolean };

type MemeApi = { memes?: { postLink: string; subreddit: string; title: string; url: string; nsfw: boolean; spoiler: boolean; ups: number }[] };

export async function fetchMemes(sub: string, count = 20): Promise<Meme[]> {
  const j = await getJson<MemeApi>(`https://meme-api.com/gimme/${encodeURIComponent(sub)}/${count}`);
  return (j.memes ?? [])
    .filter((m) => !m.nsfw && !m.spoiler && /\.(jpe?g|png|gif|webp)$/i.test(m.url))
    .map((m) => ({ id: m.url, title: m.title, url: m.url, sub: m.subreddit, ups: m.ups, link: m.postLink, isGif: /\.gif$/i.test(m.url) }));
}

export const MEME_SUBS = ['memes', 'StudentMemes', 'soccermemes', 'footballmemes', 'africanmemes', 'ProgrammerHumor', 'wholesomememes', 'dankmemes'];
export const GIF_SUBS = ['reactiongifs', 'funnygifs', 'HighQualityGifs'];

// ---------------------------------------------------------------- GIPHY (optional key)
export const GIPHY_KEY: string = process.env.EXPO_PUBLIC_GIPHY_API_KEY ?? '';

export type Gif = { id: string; title: string; url: string; preview: string; link: string; ratio: number };

type GiphyResp = {
  data: { id: string; title: string; url: string; images: { fixed_width: { url: string; width: string; height: string }; original: { url: string } } }[];
};

export async function giphy(query: string): Promise<Gif[]> {
  const q = new URLSearchParams({ api_key: GIPHY_KEY, limit: '30', rating: 'pg-13' });
  const url = query.trim()
    ? `https://api.giphy.com/v1/gifs/search?${q.toString()}&q=${encodeURIComponent(query.trim())}`
    : `https://api.giphy.com/v1/gifs/trending?${q.toString()}`;
  const j = await getJson<GiphyResp>(url);
  return j.data.map((g) => {
    const fw = g.images.fixed_width;
    const w = Number(fw.width) || 1;
    const h = Number(fw.height) || 1;
    return { id: g.id, title: g.title, url: g.images.original.url, preview: fw.url, link: g.url, ratio: w / h };
  });
}

// ---------------------------------------------------------------- Meme templates (Imgflip)
export type Template = { id: string; name: string; url: string; width: number; height: number };

let templateCache: Template[] | null = null;
export async function memeTemplates(): Promise<Template[]> {
  if (templateCache) return templateCache;
  const j = await getJson<{ success: boolean; data: { memes: Template[] } }>('https://api.imgflip.com/get_memes');
  templateCache = j.data.memes;
  return templateCache;
}
