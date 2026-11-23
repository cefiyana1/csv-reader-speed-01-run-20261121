const fs = require('node:fs');
const inDir = process.env.MAKEFUN_INPUT_DIR || '/input';
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const inPath = inDir + '/cases.json';
const outPath = outDir + '/answers.json';

function fallback() {
  import('./solve.js').then((m) => {
    const fn = m.run || m.readCsv || m.default;
    const cases = JSON.parse(fs.readFileSync(inPath, 'utf8'));
    const out = '[' + cases.map((c) => JSON.stringify(fn(c.input))).join(',') + ']';
    fs.writeFileSync(outPath, out);
  });
}

const inFd = fs.openSync(inPath, 'r');
let outFd;
try {
  outFd = fs.openSync(outPath, 'w+');
} catch {
  fs.mkdirSync(outDir, { recursive: true });
  outFd = fs.openSync(outPath, 'w+');
}

const BASE = 65536;
const IN_CAP = 524288;
const OUT_CAP = 524288;
const FIRST_CAP = 131072;
const EXTRA_CAP = 524288;
const ERR_CAP = 65536;

const inOff = BASE;
const outOff = inOff + IN_CAP + 256;
const firstOff = outOff + OUT_CAP + 512;
const extraOff = firstOff + FIRST_CAP + 256;
const errOff = extraOff + EXTRA_CAP + 256;
const pages = (((errOff + ERR_CAP * 20) + 65535) >>> 16) + 1;

const mem = new WebAssembly.Memory({ initial: pages });
const u8 = new Uint8Array(mem.buffer);
let filePos = 0;
let rewound = false;

function writeFull(ptr, len, pos) {
  let off = 0;
  while (off < len) {
    const n = pos === null
      ? fs.writeSync(outFd, u8, ptr + off, len - off)
      : fs.writeSync(outFd, u8, ptr + off, len - off, pos + off);
    if (n <= 0) break;
    off += n;
  }
}

const mod = new WebAssembly.Module(fs.readFileSync(__dirname + '/t.wasm'));
const inst = new WebAssembly.Instance(mod, {
  env: {
    memory: mem,
    read(ptr, maxLen) {
      let total = 0;
      while (total < maxLen) {
        const n = fs.readSync(inFd, u8, ptr + total, maxLen - total, null);
        if (n <= 0) break;
        total += n;
      }
      return total;
    },
    flush(ptr, len) {
      writeFull(ptr, len, rewound ? filePos : null);
      filePos += len;
    },
    pwrite(ptr, len, pos) {
      writeFull(ptr, len, pos);
    },
    rewind(pos) {
      filePos = pos;
      rewound = true;
    },
  },
});

const outLen = inst.exports.run_stream(
  inOff, IN_CAP, outOff, OUT_CAP, firstOff, FIRST_CAP, extraOff, EXTRA_CAP, errOff, ERR_CAP
);
fs.closeSync(inFd);
if (outLen < 0) {
  fs.closeSync(outFd);
  fallback();
} else {
  if (rewound) fs.ftruncateSync(outFd, outLen);
  fs.closeSync(outFd);
}
