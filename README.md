# csv-speed-bot

Fast, zero-dependency ES module drop-in replacement for `csv-reader 1.0.0` (`csv-reader-speed-01`).

## Architecture
- `solve.js`: 3-cursor C++ SIMD `String.prototype.indexOf` parser (`nextComma`, `nextLF`, `nextCR`) with monomorphic fixed-width row allocation, zero-rescan quoted field unescaping, exact broken-row error semantics (`stray_cr`, `quote_junk`, `unterminated_quote`, `short_row`, `long_row`), and deterministic JIT type-feedback priming on load (zero state retained between calls).
- `main.ts`: Tunes single-core V8 GC/recompilation flags, parses `/input/cases.json` directly from UTF-8 Buffer, and streams per-case JSON serialization to `/output/answers.json`.
