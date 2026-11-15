// データの打ち間違いを拾う。データを触ったら node tests/check-data.js
var fs = require('fs'), vm = require('vm'), path = require('path');
var root = path.join(__dirname, '..');
var ctx = vm.createContext({ console: console, Math: Math });
['js/core.js', 'data/items.js', 'data/monsters.js', 'data/maps.js', 'data/story.js', 'js/sprites.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
});
var G = vm.runInContext('G', ctx), D = G.data, S = G.sprites;
var KNOWN = ['say', 'nar', 'choice', 'if', 'call', 'flag', 'goal', 'give', 'take', 'gold', 'warp', 'fade', 'flash', 'wait',
  'rest', 'join', 'leave', 'equip', 'ltalk', 'stage', 'setstage', 'memory', 'forge', 'dream', 'brew', 'shop', 'sell', 'quests', 'battle', 'end'];
var fails = 0;
function test(name, fn) {
  var errs = [];
  fn(function (m) { errs.push(m); });
  if (errs.length) { fails++; console.log('FAIL ' + name); errs.forEach(function (e) { console.log('     ' + e); }); }
  else console.log('PASS ' + name);
}
function tile(m, x, y) { var r = D.maps[m] && D.maps[m].rows[y]; return r ? r.charAt(x) : ''; }
function solidAt(m, x, y) { return D.maps[m].ev.some(function (e) { return e.x === x && e.y === y && (e.sprite || e.gather) && !e.cond; }); }

// 命令をたどる。cb(命令, どこ)
function walk(cmds, where, cb, seen) {
  seen = seen || {};
  if (typeof cmds === 'string') {
    if (seen[cmds]) return; seen[cmds] = 1;
    if (!D.story[cmds]) { cb(['?missing', cmds], where); return; }
    where = cmds; cmds = D.story[cmds];
  }
  cmds.forEach(function (c) {
    cb(c, where);
    if (c[0] === 'choice') c[2].forEach(function (o) { walk(o[1], where, cb, seen); });
    if (c[0] === 'if') { walk(c[2], where, cb, seen); walk(c[3] || [], where, cb, seen); }
    if (c[0] === 'call') walk(c[1], where, cb, seen);
    if (c[0] === 'stage') c[1].forEach(function (b) { walk(b, where, cb, seen); });
    if (c[0] === 'battle') walk(c[2] || [], where, cb, seen);
  });
}
function allScripts(cb) {
  Object.keys(D.story).forEach(function (k) { walk(D.story[k], k, cb); });
  Object.keys(D.maps).forEach(function (m) {
    D.maps[m].ev.forEach(function (e) { if (e.script) walk(e.script, m + '(' + e.x + ',' + e.y + ')', cb); });
  });  (D.lairTalks || []).forEach(function (t, i) { walk(t.script, '隠れ家の会話' + i, cb); });
  (D.skyTalks || []).forEach(function (t, i) { walk(t, '姫の話' + i, cb); });
}

test('地図の行はすべて同じ幅で、知っている地形だけでできている', function (bad) {
  Object.keys(D.maps).forEach(function (m) {
    var rows = D.maps[m].rows;
    rows.forEach(function (r, y) {
      if (r.length !== rows[0].length) bad(m + ' の ' + y + ' 行目の幅が ' + r.length + '（1行目は ' + rows[0].length + '）');
      for (var x = 0; x < r.length; x++) if (!S.TILES[r.charAt(x)]) bad(m + ' (' + x + ',' + y + ') に知らない地形「' + r.charAt(x) + '」');
    });
  });
});

test('人・物・踏む出来事は歩ける場所にあり、絵が用意されている', function (bad) {
  Object.keys(D.maps).forEach(function (m) {
    D.maps[m].ev.forEach(function (e) {
      var t = tile(m, e.x, e.y), at = m + ' (' + e.x + ',' + e.y + ')';
      if (!t) bad(at + ' は地図の外');
      if ((e.step || e.sprite || e.gather) && !S.walkable(t)) bad(at + ' は歩けない地形「' + t + '」の上');
      if (e.obj && S.walkable(t)) bad(at + ' の「調べる」は通れない地形に置く');
      var name = e.sprite || e.gather;
      if (name && !S.PEOPLE[name] && !S.THINGS[name] && !D.monsters[name]) bad(at + ' の絵「' + name + '」がない');
      if (e.gather && !D.items[e.gather]) bad(at + ' の採集物「' + e.gather + '」がない');
      if (!e.gather && !e.script) bad(at + ' に script がない');
    });
  });
});

test('命令はすべて知っているもので、名前の参照先がある', function (bad) {
  allScripts(function (c, where) {
    if (c[0] === '?missing') return bad(where + ' が呼ぶ「' + c[1] + '」がない');
    if (KNOWN.indexOf(c[0]) < 0) return bad(where + ' に知らない命令「' + c[0] + '」');
    if (c[0] === 'say' && (typeof c[1] !== 'string' || typeof c[2] !== 'string')) bad(where + ' の say は [名前, 台詞]');
    if ((c[0] === 'give' || c[0] === 'take' || c[0] === 'equip') && !D.items[c[1]]) bad(where + ' の道具「' + c[1] + '」がない');
    if (c[0] === 'battle' && !D.monsters[c[1]]) bad(where + ' の魔物「' + c[1] + '」がない');
    if (c[0] === 'memory' && !D.memories[c[1]]) bad(where + ' の記憶「' + c[1] + '」がない');
    if (c[0] === 'shop' && !D.shops[c[1]]) bad(where + ' の店「' + c[1] + '」がない');
  });
});

test('ワープ先は歩ける場所で、人や物と重ならない', function (bad) {
  allScripts(function (c, where) {
    if (c[0] !== 'warp') return;
    if (!D.maps[c[1]]) return bad(where + ' のワープ先の地図「' + c[1] + '」がない');
    if (!S.walkable(tile(c[1], c[2], c[3]))) bad(where + ' → ' + c[1] + ' (' + c[2] + ',' + c[3] + ') は歩けない');
    if (solidAt(c[1], c[2], c[3])) bad(where + ' → ' + c[1] + ' (' + c[2] + ',' + c[3] + ') に人か物がいる');
  });
});

test('すべての地図に、最初の隠れ家からたどり着ける', function (bad) {
  var to = {};
  Object.keys(D.maps).forEach(function (m) {
    to[m] = [];
    D.maps[m].ev.forEach(function (e) { if (e.script) walk(e.script, m, function (c) { if (c[0] === 'warp') to[m].push(c[1]); }); });
  });
  var seen = { lair: 1 }, q = ['lair'];
  while (q.length) (to[q.shift()] || []).forEach(function (n) { if (!seen[n]) { seen[n] = 1; q.push(n); } });
  Object.keys(D.maps).forEach(function (m) { if (!seen[m]) bad(m + ' に行く道がない'); });
});

test('魔物の絵は16×16で、色がそろっている。落とし物・出現表の名前も正しい', function (bad) {
  Object.keys(D.monsters).forEach(function (id) {
    var m = D.monsters[id];
    // 人の姿の相手は、歩く画面と同じ絵を使う
    if (m.person) { if (!S.PEOPLE[m.person]) bad(id + ' の人の絵「' + m.person + '」がない'); }
    else if (m.like) { if (!D.monsters[m.like] || !D.monsters[m.like].art) bad(id + ' が絵を借りる「' + m.like + '」がない'); }
    else if (m.art.length !== 16) bad(id + ' の絵が ' + m.art.length + ' 行');
    (m.art || (m.like && D.monsters[m.like] ? D.monsters[m.like].art : [])).forEach(function (r, y) {
      if (r.length !== 16) bad(id + ' の絵の ' + y + ' 行目が ' + r.length + ' 文字');
      for (var x = 0; x < r.length; x++) if (r.charAt(x) !== '.' && !m.pal[r.charAt(x)]) bad(id + ' の絵に色のない文字「' + r.charAt(x) + '」');
    });
    (m.drops || []).forEach(function (d) { if (!D.items[d.item]) bad(id + ' の落とし物「' + d.item + '」がない'); });
  });
  Object.keys(S.THINGS).forEach(function (id) {
    S.THINGS[id].art.forEach(function (r, y) { if (r.length !== 16) bad('物の絵 ' + id + ' の ' + y + ' 行目が ' + r.length + ' 文字'); });
    if (S.THINGS[id].art.length !== 16) bad('物の絵 ' + id + ' が ' + S.THINGS[id].art.length + ' 行');
  });
  Object.keys(D.maps).forEach(function (m) {
    var enc = D.maps[m].enc || {};
    Object.keys(enc).forEach(function (t) { enc[t].forEach(function (id) { if (!D.monsters[id]) bad(m + ' の出現表の「' + id + '」がない'); }); });
  });
});

test('どの地図も、入口から人・物・出口のすべてに歩いて行ける', function (bad) {
  // 入口＝ワープで着く場所。条件つきの人（ボスなど）は、いなくなったものとして数える
  var arrive = {};
  allScripts(function (c) { if (c[0] === 'warp' && D.maps[c[1]]) (arrive[c[1]] = arrive[c[1]] || []).push([c[2], c[3]]); });
  arrive.lair = (arrive.lair || []).concat([[4, 3]]);
  Object.keys(D.maps).forEach(function (m) {
    var rows = D.maps[m].rows, W = rows[0].length, seen = {}, q = (arrive[m] || []).map(function (p) { return p[1] * W + p[0]; });
    var block = {};
    D.maps[m].ev.forEach(function (e) { if ((e.sprite || e.gather) && !e.cond) block[e.y * W + e.x] = 1; });
    q.forEach(function (n) { seen[n] = 1; });
    while (q.length) {
      var cur = q.shift(), cx = cur % W, cy = (cur - cx) / W;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var nx = cx + d[0], ny = cy + d[1], n = ny * W + nx;
        if (seen[n] || !S.walkable(tile(m, nx, ny)) || block[n]) return;
        seen[n] = 1; q.push(n);
      });
    }
    D.maps[m].ev.forEach(function (e) {
      var ok = seen[e.y * W + e.x];
      // 通れない人・物は、となり（カウンター越しなら、その向こう）に立てればよい
      if (!ok) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var x = e.x + d[0], y = e.y + d[1];
        if (tile(m, x, y) === 'k') { x += d[0]; y += d[1]; }
        if (seen[y * W + x]) ok = true;
      });
      if (!ok) bad(m + ' (' + e.x + ',' + e.y + ') に行けない');
    });
  });
});

test('調合・店・依頼・初期の持ち物が、ある道具と魔物を指している', function (bad) {
  D.forge.forEach(function (f) {
    if (!D.items[f.out]) bad('鍛冶の「' + f.out + '」がない');
    Object.keys(f.need).forEach(function (id) { if (!D.items[id]) bad('鍛冶の材料「' + id + '」がない'); });
  });
  D.dreams.forEach(function (d, i) { if (typeof d.text !== 'string' || typeof d.stage !== 'number') bad('夢 ' + i + ' は {stage, text}'); });
  D.recipes.forEach(function (r) {
    if (!D.items[r.out]) bad('調合の「' + r.out + '」がない');
    Object.keys(r.need).forEach(function (id) { if (!D.items[id]) bad('調合の材料「' + id + '」がない'); });
  });
  Object.keys(D.shops).forEach(function (s) { D.shops[s].forEach(function (id) { if (!D.items[id] || !D.items[id].price) bad('店 ' + s + ' の「' + id + '」に値段がない'); }); });
  D.quests.forEach(function (q) {
    if (q.type === 'kill' && !D.monsters[q.target]) bad('依頼 ' + q.id + ' の魔物「' + q.target + '」がない');
    if (q.type === 'deliver' && !D.items[q.target]) bad('依頼 ' + q.id + ' の道具「' + q.target + '」がない');
  });
  var s = G.newState();
  Object.keys(s.items).concat([s.weapon, s.armor]).forEach(function (id) { if (!D.items[id]) bad('初期の持ち物「' + id + '」がない'); });
  if (!S.walkable(tile(s.map, s.x, s.y))) bad('開始位置が歩けない');
});

test('アプリとして公開する物に、ゲームが読むファイルがすべて入っていて、設定ノートは入っていない', function (bad) {
  var B = require(path.join(root, 'tools/build-pages.js'));
  var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  B.referenced(html).forEach(function (u) {
    if (!fs.existsSync(path.join(root, u))) bad('index.html が読む ' + u + ' がない');
    if (!B.PUBLIC.some(function (p) { return u === p || u.indexOf(p + '/') === 0; })) bad(u + ' が tools/build-pages.js の PUBLIC に入っていない');
  });
  ['STORY.md', 'CLAUDE.md', 'README.md', '.'].forEach(function (f) { if (B.PUBLIC.indexOf(f) >= 0) bad(f + ' を公開してはいけない'); });
  var mf = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  mf.icons.forEach(function (ic) { if (!fs.existsSync(path.join(root, ic.src))) bad('アイコン ' + ic.src + ' がない'); });
});

console.log(fails ? '\n' + fails + ' 件の FAIL' : '\nすべて PASS');
process.exit(fails ? 1 : 0);
