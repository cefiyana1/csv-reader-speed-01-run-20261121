const v8 = require('node:v8');
v8.setFlagsFromString('--no-wasm-tier-up');
v8.setFlagsFromString('--no-wasm-lazy-compilation');
v8.setFlagsFromString('--no-incremental-marking');
v8.setFlagsFromString('--no-concurrent-marking');
v8.setFlagsFromString('--no-concurrent-sweeping');
v8.setFlagsFromString('--no-concurrent-recompilation');
v8.setFlagsFromString('--no-concurrent-sparkplug');
v8.setFlagsFromString('--no-parallel-scavenge');
v8.setFlagsFromString('--no-parallel-compaction');
v8.setFlagsFromString('--no-parallel-pointer-update');

const fs = require('node:fs');
const inDir = process.env.MAKEFUN_INPUT_DIR || '/input';
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const inPath = inDir + '/cases.json';
const outPath = outDir + '/answers.json';

function fallback() {
  import('./solve.js').then((m) => {
    const fn = m.run || m.readCsv || m.default;
    const cases = JSON.parse(fs.readFileSync(inPath, 'utf8'));
    const out = '[' + cases.map(c => JSON.stringify(fn(c.input))).join(',') + ']';
    fs.writeFileSync(outPath, out);
  });
}

const inFd = fs.openSync(inPath, 'r');
const inSize = fs.fstatSync(inFd).size;

const BASE = 65536;
const OUT_CAP = 524288;
const FIRST_CAP = 262144;
const EXTRA_CAP = 1048576;
const ERR_CAP = 65536;

const inOff = BASE;
const outOff = inOff + ((inSize + 128 + 15) & ~15);
const firstOff = outOff + OUT_CAP;
const extraOff = firstOff + FIRST_CAP;
const errOff = extraOff + EXTRA_CAP;
const pages = (((errOff + ERR_CAP * 20) + 65535) >>> 16) + 1;

const mem = new WebAssembly.Memory({ initial: pages });
const u8 = new Uint8Array(mem.buffer);
let got = 0;
while (got < inSize) {
  const n = fs.readSync(inFd, u8, inOff + got, inSize - got, null);
  if (n <= 0) break;
  got += n;
}
fs.closeSync(inFd);

let outFd;
try {
  outFd = fs.openSync(outPath, 'w+');
} catch {
  fs.mkdirSync(outDir, { recursive: true });
  outFd = fs.openSync(outPath, 'w+');
}

let filePos = 0;
let rewound = false;
const mod = new WebAssembly.Module(fs.readFileSync(__dirname + '/t.wasm'));
const inst = new WebAssembly.Instance(mod, {
  env: {
    memory: mem,
    flush(ptr, len) {
      fs.writeSync(outFd, u8, ptr, len, filePos);
      filePos += len;
    },
    pwrite(ptr, len, pos) {
      fs.writeSync(outFd, u8, ptr, len, pos);
    },
    rewind(pos) {
      filePos = pos;
      rewound = true;
    },
  },
});

const outLen = inst.exports.run_all(
  inOff, inSize, outOff, OUT_CAP, firstOff, FIRST_CAP, extraOff, EXTRA_CAP, errOff, ERR_CAP
);
if (outLen < 0) {
  fs.closeSync(outFd);
  fallback();
} else {
  if (rewound) fs.ftruncateSync(outFd, outLen);
  fs.closeSync(outFd);
}
