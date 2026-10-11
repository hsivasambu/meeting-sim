import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { gzipSync } from 'node:zlib';

const JS_BUDGET = 120 * 1024;
const MEDIA_BUDGET = 400 * 1024;
const mediaExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
]);

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(path) : Promise.resolve([path]);
    }),
  );
  return nested.flat();
}

const files = await filesUnder('dist');
let javascript = 0;
let media = 0;
let javascriptFiles = 0;
for (const path of files) {
  const extension = extname(path).toLowerCase();
  if (['.js', '.mjs', '.cjs'].includes(extension)) {
    javascript += gzipSync(await readFile(path)).byteLength;
    javascriptFiles += 1;
  } else if (mediaExtensions.has(extension)) {
    media += (await readFile(path)).byteLength;
  }
}
console.log(
  `JavaScript: ${javascript}/${JS_BUDGET} gzip bytes; images/fonts: ${media}/${MEDIA_BUDGET} bytes`,
);
if (javascriptFiles === 0 || javascript > JS_BUDGET || media > MEDIA_BUDGET) {
  throw new Error(
    'Missing JavaScript build output or exceeded deployment budget',
  );
}
