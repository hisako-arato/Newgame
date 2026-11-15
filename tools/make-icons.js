// アプリのアイコン（ホーム画面に出る絵）を作る。夜空の月と、雲の上の城。
//   node tools/make-icons.js   → assets/icons/*.png
// ゲームの中は画像ファイルを持たないが、アイコンだけは端末が PNG を求めるので書き出して置く。
// 外の道具を入れずに済むよう、PNG は自前で書く
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const out = path.join(__dirname, '..', 'assets', 'icons');
const N = 32;   // 32×32 ドットで描いて、整数倍に拡大する

function hex(c) { return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); }
function mix(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }

// 雲のふくらみ（左から順に、中心 x・高さ）
const BUMPS = [[2, 23], [7, 21], [13, 22], [19, 20], [25, 21], [30, 22]];
function cloudTop(x) {
  let top = 32;
  for (const [cx, h] of BUMPS) { const d = Math.abs(x - cx); if (d <= 4) top = Math.min(top, h + Math.round(d * d / 5)); }
  return top;
}
// 城の影（雲から突き出す塔）
function castle(x, y) {
  const towers = [[11, 13, 12], [14, 17, 9], [18, 20, 12]];   // [左, 右, 上端]
  for (const [l, r, t] of towers) {
    if (x >= l && x <= r && y >= t) return true;
    if (x === Math.round((l + r) / 2) && y >= t - 2) return true;   // 尖塔
  }
  return x >= 10 && x <= 21 && y >= 15;
}
function pixel(x, y) {
  const sky = mix(hex('#26305c'), hex('#0b0d16'), y / N);
  // 月
  const mx = x - 23.5, my = y - 7.5;
  if (mx * mx + my * my <= 16) return hex(mx * mx + (my + 1.5) * (my + 1.5) <= 9 && mx < -1 ? '#d8d2b4' : '#f1ecd4');
  if (mx * mx + my * my <= 30) return mix(sky, hex('#f1ecd4'), 0.18);
  // 雲
  const ct = cloudTop(x);
  if (y >= ct) return hex(y === ct ? '#f4f6fb' : y < ct + 3 ? '#d8dde8' : '#b4bccc');
  if (castle(x, y)) return hex(x === 12 && y === 14 || x === 19 && y === 14 || x === 15 && y === 11 ? '#ffd77a' : '#4b4f68');
  // 星
  if ((x * 7 + y * 13) % 41 === 0 && y < 18) return hex('#cfd8f0');
  return sky;
}

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
// pad：絵のまわりの余白の割合（maskable は端を丸く切られるので広めにとる）
function png(size, pad) {
  const inner = Math.floor(size * (1 - pad * 2) / N) * N, off = Math.floor((size - inner) / 2), sc = inner / N;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const px = Math.floor((x - off) / sc), py = Math.floor((y - off) / sc);
      const c = px >= 0 && py >= 0 && px < N && py < N ? pixel(px, py) : pixel(Math.max(0, Math.min(N - 1, px)), Math.max(0, Math.min(N - 1, py)));
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2]; raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

fs.mkdirSync(out, { recursive: true });
const list = [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['maskable-512.png', 512, 0.1], ['apple-touch-icon.png', 180, 0]];
for (const [name, size, pad] of list) fs.writeFileSync(path.join(out, name), png(size, pad));
console.log(list.length + ' 個のアイコンを ' + path.relative(process.cwd(), out) + ' に書き出した');
