// 公開する物だけを dist/ に集める（Cloudflare に上げる中身）。
//   node tools/build-pages.js
// STORY.md・CLAUDE.md は物語のネタばらしなので、URL から読めないよう入れない。
// 遊ぶのに要る物だけを PUBLIC に名前で書く（足し忘れは tests/check-data.js が見つける）
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const PUBLIC = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'data', 'assets'];

// index.html が読む、手元のファイル（<script src>・<link href>）
function referenced(html) {
  return [...new Set([...html.matchAll(/(?:src|href)="([^"#?]+)"/g)].map(m => m[1]).filter(u => !/^[a-z]+:/i.test(u)))];
}

function build() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist);
  for (const p of PUBLIC) fs.cpSync(path.join(root, p), path.join(dist, p), { recursive: true });

  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const icons = fs.readdirSync(path.join(dist, 'assets/icons')).map(f => 'assets/icons/' + f);
  const files = ['./', ...new Set([...referenced(html), ...icons])];
  for (const u of files) if (u !== './' && !fs.existsSync(path.join(dist, u))) throw new Error(u + ' が dist/ にない');

  // 版は中身から作る。どれか1つでも変われば、スマホは次に開いたとき全部を取り直す
  const h = crypto.createHash('sha256');
  for (const u of files) h.update(fs.readFileSync(path.join(dist, u === './' ? 'index.html' : u)));
  const version = h.digest('hex').slice(0, 12);
  const sw = path.join(dist, 'sw.js');
  fs.writeFileSync(sw, fs.readFileSync(sw, 'utf8').replace("'__VERSION__'", JSON.stringify(version)));
  fs.writeFileSync(path.join(dist, 'files.json'), JSON.stringify({ version, files }));

  // sw.js と一覧は毎回取りに来させる（古い入れ物が居座らないように）
  fs.writeFileSync(path.join(dist, '_headers'), [
    '/sw.js', '  Cache-Control: no-cache',
    '/files.json', '  Cache-Control: no-cache',
    '/manifest.webmanifest', '  Content-Type: application/manifest+json', ''
  ].join('\n'));
  console.log('dist/ に公開物を集めた（版 ' + version + '、オフライン用 ' + files.length + ' 個）');
}

if (require.main === module) build();
module.exports = { PUBLIC, referenced };
