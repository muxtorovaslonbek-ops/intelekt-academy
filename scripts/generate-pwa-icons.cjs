const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG generator using standard PNG specification & node:zlib
function createPNG(width, height, getPixelRGBA) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines: each row has 1 filter byte (0) + width * 4 bytes
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[offset++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      scanlines[offset++] = r;
      scanlines[offset++] = g;
      scanlines[offset++] = b;
      scanlines[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcData = chunk.subarray(4, 8 + length);
  const crcVal = crc32(crcData);
  chunk.writeInt32BE(crcVal, 8 + length);
  return chunk;
}

// Standard CRC32 calculation for PNG chunks
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return ~c;
}

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

// Icon Drawer: Neon cyber AI Future emblem
function drawAIIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: Deep futuristic dark slate (#020617 -> #0f172a)
  let r = Math.floor(2 + (15 - 2) * ((y / h) * 0.7 + (x / w) * 0.3));
  let g = Math.floor(6 + (23 - 6) * ((y / h) * 0.7 + (x / w) * 0.3));
  let b = Math.floor(23 + (42 - 23) * ((y / h) * 0.7 + (x / w) * 0.3));
  let a = 255;

  // Outer neon glowing rounded squircle
  const cornerR = isMaskable ? 0 : 0.22;
  if (!isMaskable && (Math.abs(dx) > 0.95 || Math.abs(dy) > 0.95)) {
    // Soft transparent edge
    if (dist > 1.0) a = 0;
  }

  // Central Glowing Ring
  const ringDist = Math.abs(dist - 0.58);
  if (ringDist < 0.08) {
    const intensity = 1 - ringDist / 0.08;
    // Neon Cyan to Purple gradient (#06b6d4 -> #8b5cf6)
    const t = (dx + 1) / 2;
    r = Math.floor(r + (6 + (139 - 6) * t) * intensity);
    g = Math.floor(g + (182 + (92 - 182) * t) * intensity);
    b = Math.floor(b + (212 + (246 - 212) * t) * intensity);
  }

  // "AI" Symbol / Brain nodes in center
  // Central node
  if (dist < 0.16) {
    r = 255;
    g = 255;
    b = 255;
  } else if (dist < 0.24) {
    const pulse = 1 - (dist - 0.16) / 0.08;
    r = Math.floor(r + 99 * pulse);
    g = Math.floor(g + 102 * pulse);
    b = Math.floor(b + 241 * pulse);
  }

  // Four cardinal satellites
  const sDist1 = Math.hypot(dx - 0.42, dy);
  const sDist2 = Math.hypot(dx + 0.42, dy);
  const sDist3 = Math.hypot(dx, dy - 0.42);
  const sDist4 = Math.hypot(dx, dy + 0.42);
  const minSatellite = Math.min(sDist1, sDist2, sDist3, sDist4);

  if (minSatellite < 0.09) {
    const satIntensity = 1 - minSatellite / 0.09;
    r = Math.floor(r + 6 * satIntensity);
    g = Math.floor(g + 220 * satIntensity);
    b = Math.floor(b + 250 * satIntensity);
  }

  return [Math.min(255, r), Math.min(255, g), Math.min(255, b), a];
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA PNG icons in', publicDir);

// 1. 192x192
const png192 = createPNG(192, 192, (x, y, w, h) => drawAIIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// 2. 512x512
const png512 = createPNG(512, 512, (x, y, w, h) => drawAIIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// 3. Maskable 512x512
const pngMaskable512 = createPNG(512, 512, (x, y, w, h) => drawAIIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);

// 4. Apple Touch Icon 180x180
const pngApple180 = createPNG(180, 180, (x, y, w, h) => drawAIIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple180);

console.log('All PWA PNG icons generated successfully!');
