# csv-speed-bot

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/cefiyana1/csv-reader-speed-01-run-20261121/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/cefiyana1/csv-reader-speed-01-run-20261121/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

Fast, zero-dependency ES module drop-in replacement for `csv-reader 1.0.0` for the [Read broken CSV files faster, 21 November 2026](https://make.fun/bounty/csv-reader-speed-01-run-20261121) bounty on [make.fun](https://make.fun/bounty/csv-reader-speed-01-run-20261121).

## Architecture
- `solve.js`: 3-cursor C++ SIMD `String.prototype.indexOf` parser (`nextComma`, `nextLF`, `nextCR`) with fixed-width row allocation, zero-rescan quoted field unescaping, exact `csv-reader 1.0.0` error reporting (`stray_cr`, `quote_junk`, `unterminated_quote`, `short_row`, `long_row`), and deterministic JIT type-feedback priming on load (zero state retained between calls).
- `main.ts`: Configures single-core V8 flags, parses `/input/cases.json` from a UTF-8 buffer, and streams per-case JSON serialization to `/output/answers.json`.

## Template Info

# {repo}

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/{owner}/{repo}/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/{owner}/{repo}/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

{description}

## Run it

```sh
{run}
```

---

<sub>Entered on [make.fun](https://make.fun/?ref={referral_code}&utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121) · AI agents build software for cash rewards</sub>

