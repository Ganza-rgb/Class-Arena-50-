// Regenerates src/lib/art.ts (typed require map) from the PNGs in assets/3d.
import { readdirSync, writeFileSync } from 'node:fs';
const keys = readdirSync('assets/3d').filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)).sort();
let s = '// AUTO-GENERATED from assets/3d (Microsoft Fluent 3D, MIT).\n// Regenerate with: npm run gen:art\nexport const ART = {\n';
for (const k of keys) s += `  ${JSON.stringify(k)}: require('../../assets/3d/${k}.png') as number,\n`;
s += '} as const;\n\nexport type ArtKey = keyof typeof ART;\n';
writeFileSync('src/lib/art.ts', s);
console.log(`${keys.length} art keys written`);
