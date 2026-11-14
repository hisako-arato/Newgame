// 部品はすべてグローバルの G にぶら下げる（index.html をそのまま開いても動くよう、ES モジュールは使わない）
var G = { data: {}, state: null };

G.util = {
  sleep: function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); },
  rnd: function (n) { return Math.floor(Math.random() * n); },
  clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
  $: function (id) { return document.getElementById(id); }
};

G.SAVE_KEY = 'newgame_save_v1';

G.newState = function () {
  return {
    map: 'lair', x: 4, y: 3, dir: 'down',
    lv: 1, exp: 0, hp: 0, sp: 0, gold: 30,
    items: { kizu: 2, gekko: 2 },
    weapon: 'rusty', armor: 'coat',
    flags: {}, quests: {}, gathered: {},
    ahp: 0, asp: 0,   // 仲間（アメリア）のHP・SP
    deaths: 0, rests: 0, goal: ''
  };
};

// 強さはレベルと装備から毎回計算する。数値を調整すれば途中のセーブにもそのまま効く
G.stats = function () {
  var s = G.state, l = s.lv - 1, it = G.data.items;
  return {
    maxhp: 46 + 11 * l,
    maxsp: 12 + 4 * l,
    atk: 9 + 3 * l + it[s.weapon].atk,
    def: 4 + 2 * l + it[s.armor].def
  };
};
// 仲間。レベルは主人公と共通にして、育てる手間を増やさない
G.NAMES = { hero: 'カイン', amelia: 'アメリア' };
G.party = function () { return G.state.flags.amelia ? ['hero', 'amelia'] : ['hero']; };
G.statsOf = function (id) {
  if (id !== 'amelia') return G.stats();
  var l = G.state.lv - 1;
  return { maxhp: 34 + 8 * l, maxsp: 20 + 6 * l, atk: 5 + 2 * l, def: 3 + 2 * l };
};
G.hp = function (id) { return G.state[id === 'amelia' ? 'ahp' : 'hp']; };
G.sp = function (id) { return G.state[id === 'amelia' ? 'asp' : 'sp']; };
G.addHp = function (id, n) {
  var k = id === 'amelia' ? 'ahp' : 'hp';
  G.state[k] = G.util.clamp(G.state[k] + n, 0, G.statsOf(id).maxhp);
};
G.addSp = function (id, n) {
  var k = id === 'amelia' ? 'asp' : 'sp';
  G.state[k] = G.util.clamp(G.state[k] + n, 0, G.statsOf(id).maxsp);
};
G.fullHeal = function () {
  G.party().forEach(function (id) { G.addHp(id, 9999); G.addSp(id, 9999); });
};
G.needExp = function (lv) { return 14 * lv + 6 * lv * lv; };

// 条件：'flag'／'!flag'／function(state)
G.cond = function (c) {
  if (c === undefined || c === null) return true;
  if (typeof c === 'function') return !!c(G.state);
  if (c.charAt(0) === '!') return !G.state.flags[c.slice(1)];
  return !!G.state.flags[c];
};

G.count = function (id) { return G.state.items[id] || 0; };
G.addItem = function (id, n) {
  var v = G.count(id) + n;
  if (v <= 0) delete G.state.items[id]; else G.state.items[id] = v;
};

// 保存は端末のブラウザの中だけ。読めない環境（プライベートウィンドウなど）でも遊べるように必ず包む
G.save = function () {
  try { localStorage.setItem(G.SAVE_KEY, JSON.stringify(G.state)); return true; } catch (e) { return false; }
};
G.load = function () {
  try {
    var t = localStorage.getItem(G.SAVE_KEY);
    if (!t) return null;
    var s = JSON.parse(t), base = G.newState();
    for (var k in base) if (s[k] === undefined) s[k] = base[k];
    return s;
  } catch (e) { return null; }
};
