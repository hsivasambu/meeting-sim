import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { DEFAULT_RUNS, POLICIES, SEED_PREFIX } from './settings';
import { verifiedMeeting } from './runner';
import { summarize } from './summary';
import { contentPack } from '../src/core/content/index';

const { values } = parseArgs({
  args: process.argv.slice(process.argv[2] === '--' ? 3 : 2),
  options: {
    runs: { type: 'string', default: String(DEFAULT_RUNS) },
    policy: { type: 'string', default: 'all' },
  },
  allowPositionals: false,
});
const runs = Number(values.runs);
if (!Number.isSafeInteger(runs) || runs <= 0)
  throw new Error('--runs must be a positive safe integer');
if (!['all', ...POLICIES].includes(values.policy))
  throw new Error(
    'Task 08a supports --policy all|greedy|random; remaining policies land in 09',
  );
const policies = POLICIES.filter(
  (policy) => values.policy === 'all' || policy === values.policy,
);
const summaries = policies.map((policy) =>
  summarize(
    policy,
    Array.from({ length: runs }, (_, index) =>
      verifiedMeeting(`${SEED_PREFIX}${index}`, policy),
    ),
  ),
);
const report = {
  task: '08a',
  revision: execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim(),
  workingTreeDirty:
    execFileSync('git', ['status', '--porcelain'], {
      encoding: 'utf8',
    }).trim() !== '',
  contentAndConstantsHash: createHash('sha256')
    .update(JSON.stringify(contentPack))
    .update(
      (await readFile('src/core/engine/constants.ts', 'utf8')).replaceAll(
        '\r\n',
        '\n',
      ),
    )
    .digest('hex'),
  seedRange: `${SEED_PREFIX}0 through ${SEED_PREFIX}${runs - 1}`,
  randomStream:
    'SHA-256 seed:policy:random:turn with counter and uint32 rejection sampling',
  invariants:
    'PASS: every transition checked; every complete run replayed identically',
  balance: 'Diagnostic only; no tuning or acceptance thresholds changed',
  summaries,
};
await mkdir('test-results', { recursive: true });
await writeFile(
  'test-results/simulation-summary.json',
  JSON.stringify(report, null, 2) + '\n',
);
console.log(JSON.stringify(report, null, 2));
