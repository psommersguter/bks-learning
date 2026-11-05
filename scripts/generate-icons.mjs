// Generates the app icons (a red/white checkerboard, the Croatian "šahovnica")
// without any image tooling: PNGs are encoded by hand using node:zlib.
// Run with `yarn icons`; the output in public/ is committed.

import { writeFileSync } from "node:fs";
import { crc32, deflateSync } from "node:zlib";

const OUT_DIR = new URL("../public/", import.meta.url);
const GRID = 5;
const RED = [0xc8, 0x10, 0x2e];
const WHITE = [0xff, 0xff, 0xff];

/** Top-left cell is red, like the Croatian coat of arms. */
function isRedCell(col, row) {
  return (col + row) % 2 === 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function checkerboardPng(size) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0); // width
  header.writeUInt32BE(size, 4); // height
  header[8] = 8; // bit depth
  header[9] = 2; // color type: RGB
  // compression, filter and interlace stay 0

  const rowLength = 1 + size * 3; // leading filter byte + RGB pixels
  const pixels = Buffer.alloc(rowLength * size);
  for (let y = 0; y < size; y++) {
    const row = Math.floor((y * GRID) / size);
    for (let x = 0; x < size; x++) {
      const col = Math.floor((x * GRID) / size);
      const [r, g, b] = isRedCell(col, row) ? RED : WHITE;
      const offset = y * rowLength + 1 + x * 3;
      pixels[offset] = r;
      pixels[offset + 1] = g;
      pixels[offset + 2] = b;
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(pixels)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function checkerboardSvg() {
  const toHex = (rgb) => `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  const cells = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (isRedCell(col, row)) cells.push(`<rect x="${col}" y="${row}" width="1" height="1"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID} ${GRID}" shape-rendering="crispEdges">
<title>BKS Vokabeltrainer</title>
<rect width="${GRID}" height="${GRID}" rx="0.6" fill="${toHex(WHITE)}"/>
<g fill="${toHex(RED)}">${cells.join("")}</g>
</svg>
`;
}

writeFileSync(new URL("icon-192.png", OUT_DIR), checkerboardPng(192));
writeFileSync(new URL("icon-512.png", OUT_DIR), checkerboardPng(512));
writeFileSync(new URL("apple-touch-icon.png", OUT_DIR), checkerboardPng(180));
writeFileSync(new URL("favicon.svg", OUT_DIR), checkerboardSvg());
console.log("Icons written to public/");
