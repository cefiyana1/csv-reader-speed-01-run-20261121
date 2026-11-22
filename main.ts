import { closeSync, openSync, readFileSync, writeSync } from 'node:fs';
import { join } from 'node:path';
import { setFlagsFromString } from 'node:v8';

for (const flag of [
  '--no-incremental-marking',
  '--no-concurrent-marking',
  '--no-concurrent-sweeping',
  '--no-concurrent-recompilation',
  '--no-concurrent-sparkplug',
  '--no-parallel-scavenge',
  '--no-parallel-compaction',
  '--no-parallel-pointer-update',
]) {
  setFlagsFromString(flag);
}

const { run } = (await import(new URL('./solve.js', import.meta.url).href)) as {
  run: (input: unknown) => unknown;
};

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const cases = JSON.parse(
  readFileSync(join(INPUT_DIR, 'cases.json')) as unknown as string,
) as ({ id: string; input: unknown } | null)[];

const fd = openSync(join(OUTPUT_DIR, 'answers.json'), 'w');
try {
  writeSync(fd, '[');
  for (let i = 0; i < cases.length; i++) {
    if (i > 0) writeSync(fd, ',');
    const c = cases[i]!;
    const ans = run(c.input);
    cases[i] = null;
    writeSync(fd, JSON.stringify(ans));
  }
  writeSync(fd, ']');
} finally {
  closeSync(fd);
}
