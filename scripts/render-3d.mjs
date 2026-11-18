// Renders every Arena 3D model (design/3d/kit.js → PROPS) to a transparent PNG in assets/3d/.
// Uses a local headless Chromium (Edge/Chrome) with software WebGL — no extra npm deps.
// Run: npm run gen:art            (all sprites)
//      node scripts/render-3d.mjs crush-board,ghost   (subset)
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'assets', '3d');
const PORT = 5077;
const subset = process.argv[2] ?? '';

const CANDIDATES = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const browser = CANDIDATES.find((p) => existsSync(p));
if (!browser) {
  console.error('No Chromium-based browser found. Set BROWSER=/path/to/chrome');
  process.exit(1);
}

const server = spawn(process.execPath, [join(ROOT, 'scripts', 'serve-design.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1200));

try {
  const url = `http://localhost:${PORT}/design/3d/sprites.html${subset ? `?keys=${encodeURIComponent(subset)}` : ''}`;
  console.log(`Rendering sprites with ${browser}…`);
  const res = spawnSync(
    browser,
    ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--window-size=1200,900', '--virtual-time-budget=900000', '--dump-dom', url],
    { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, timeout: 15 * 60 * 1000 },
  );
  const m = /<textarea id="out">([\s\S]*?)<\/textarea>/.exec(res.stdout ?? '');
  if (!m || !m[1].trim()) {
    console.error('Renderer produced no output.', res.stderr?.slice(0, 2000));
    process.exitCode = 1;
  } else {
    const json = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const sprites = JSON.parse(json);
    mkdirSync(OUT, { recursive: true });
    let bytes = 0;
    for (const [key, dataUrl] of Object.entries(sprites)) {
      const buf = Buffer.from(String(dataUrl).split(',')[1] ?? '', 'base64');
      bytes += buf.length;
      writeFileSync(join(OUT, `${key}.png`), buf);
    }
    writeFileSync(
      join(OUT, 'LICENSE.txt'),
      'Original 3D art for Class Arena, modelled procedurally in design/3d/kit.js and rendered by scripts/render-3d.mjs.\n',
    );
    console.log(`Wrote ${Object.keys(sprites).length} sprites (${(bytes / 1024 / 1024).toFixed(1)} MB) to assets/3d`);
  }
} finally {
  server.kill();
}
