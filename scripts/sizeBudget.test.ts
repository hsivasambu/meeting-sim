import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { afterEach, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  assertBudget,
  measureBuild,
  JS_BUDGET,
  MEDIA_BUDGET,
} from './sizeBudget';

const directories: string[] = [];
async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'meeting-size-'));
  directories.push(directory);
  await mkdir(join(directory, 'bundles/lazy'), { recursive: true });
  return directory;
}
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('deployment budgets', () => {
  it('counts nested and lazy JS, images, OG, icons and fonts together', async () => {
    const directory = await fixture();
    await writeFile(
      join(directory, 'bundles/main.js'),
      'export const main = true;',
    );
    await writeFile(
      join(directory, 'bundles/lazy/chunk.mjs'),
      'export const lazy = true;',
    );
    await writeFile(join(directory, 'og.png'), Buffer.alloc(13));
    await writeFile(join(directory, 'icon.ico'), Buffer.alloc(7));
    await writeFile(join(directory, 'font.woff2'), Buffer.alloc(11));
    await writeFile(join(directory, 'atlas.json'), '{}');
    const result = await measureBuild(directory);
    expect(result.javascriptFiles).toBe(2);
    expect(result.media).toBe(31);
    expect(result.javascript).toBe(
      gzipSync('export const main = true;').byteLength +
        gzipSync('export const lazy = true;').byteLength,
    );
    expect(() => assertBudget(result)).not.toThrow();
  });

  it('rejects missing builds and missing JavaScript output', async () => {
    const directory = await fixture();
    await expect(measureBuild(join(directory, 'missing'))).rejects.toThrow();
    expect(() =>
      assertBudget({ javascript: 0, media: 0, javascriptFiles: 0 }),
    ).toThrow();
  });

  it('accepts exact limits and rejects even one excess byte in either total', () => {
    const boundary = {
      javascript: JS_BUDGET,
      media: MEDIA_BUDGET,
      javascriptFiles: 1,
    };
    expect(() => assertBudget(boundary)).not.toThrow();
    expect(() =>
      assertBudget({ ...boundary, javascript: JS_BUDGET + 1 }),
    ).toThrow();
    expect(() =>
      assertBudget({ ...boundary, media: MEDIA_BUDGET + 1 }),
    ).toThrow();
  });

  it('accounts for every generated lazy chunk without averaging their gzip sizes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.uint8Array({ minLength: 1, maxLength: 64 }), {
          minLength: 1,
          maxLength: 5,
        }),
        async (chunks) => {
          const directory = await fixture();
          await Promise.all(
            chunks.map((chunk, index) =>
              writeFile(join(directory, `bundles/lazy/${index}.js`), chunk),
            ),
          );
          const result = await measureBuild(directory);
          expect(result.javascript).toBe(
            chunks.reduce((sum, chunk) => sum + gzipSync(chunk).byteLength, 0),
          );
          expect(result.javascriptFiles).toBe(chunks.length);
        },
      ),
      { seed: 20261011, numRuns: 25 },
    );
  });
});
