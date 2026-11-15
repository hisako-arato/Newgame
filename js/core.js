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
    ahp: 0, asp: 0, rhp: 0, rsp: 0,   // 仲間（アメリア・リコ）のHP・SP
    auto: false,       // 仲間の行動をおまかせにするか
    ver: 2,            // 記録の版。第一章を作り直したとき（2026-11-15）に段階の番号が変わった
    stage: 0,          // 第一章の進み具合（酒場の夜が何回目まで進んだか）
    mem: [],           // 思い出した記憶
    ltalks: 0, ltalkDay: -1,   // 隠れ家でのリコとの会話が何番目まで進んだか・最後に話した日
    dreams: 0, talks: 0,   // 見た夢・空で聞いた姫の話の数
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
// 仲間。レベルは主人公と共通にして、育てる手間を増やさない。
// 足すときはこの表に書く（flag：仲間にいるあいだ立つ旗、hp・sp：記録に持つ名前、stats：レベルごとの強さ）
G.NAMES = { hero: 'カイン', riko: 'リコ', amelia: 'アメリア' };
// 空の少女は、名乗るまで名前が分からない
G.refreshNames = function () {
  G.NAMES.amelia = G.state && G.state.flags.named ? 'アメリア' : '少女';
};
G.MEMBERS = {
  riko:   { hp: 'rhp', sp: 'rsp', stats: function (l) { return { maxhp: 30 + 7 * l, maxsp: 16 + 5 * l, atk: 4 + 2 * l, def: 3 + 2 * l }; } },
  amelia: { hp: 'ahp', sp: 'asp', stats: function (l) { return { maxhp: 34 + 8 * l, maxsp: 20 + 6 * l, atk: 5 + 2 * l, def: 3 + 2 * l }; } }
};
G.party = function () {
  return ['hero'].concat(Object.keys(G.MEMBERS).filter(function (id) { return G.state.flags[id]; }));
};
G.statsOf = function (id) {
  return G.MEMBERS[id] ? G.MEMBERS[id].stats(G.state.lv - 1) : G.stats();
};
G.hp = function (id) { return G.state[G.MEMBERS[id] ? G.MEMBERS[id].hp : 'hp']; };
G.sp = function (id) { return G.state[G.MEMBERS[id] ? G.MEMBERS[id].sp : 'sp']; };
G.addHp = function (id, n) {
  var k = G.MEMBERS[id] ? G.MEMBERS[id].hp : 'hp';
  G.state[k] = G.util.clamp(G.state[k] + n, 0, G.statsOf(id).maxhp);
};
G.addSp = function (id, n) {
  var k = G.MEMBERS[id] ? G.MEMBERS[id].sp : 'sp';
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
    var f = s.flags || (s.flags = {});
    // 段階を持たない、いちばん古い記録
    if (s.stage === undefined) s.stage = f.letter ? 5 : 0;
    // 版1の記録（酒場の夜が5つだったころ）は、新しい段階の番号に付け替える。
    // 済ませた夜より前の出来事は、済んだことにする（行き止まりを作らないため）
    if (!s.ver) {
      s.stage = [0, 1, 2, 4, 6, 10][Math.min(5, s.stage)];
      if (s.stage >= 4) f.wreckDone = true;
      if (s.stage >= 6) f.mineDone = f.shokoDone = f.bookRead = f.examDone = f.plainSeen = f.wreckBox = true;
      if (s.stage >= 10) f.nireDone = f.nireTalk = f.chapelDone = f.senjoDone = f.flowerDone = f.hyouDone = f.torideDone = f.diaryRead = f.labBoss = f.labDone = true;
      if (f.kingDone) f.sleepPotion = true;
      if (f.rescued) f.chapelDone = true;
      // 空にいた記録：姫とはもう名乗り合っている
      if (f.amelia) f.named = f.skyMet = f.cityLit = true;
      s.ver = 2;
    }
    for (var k in base) if (s[k] === undefined) s[k] = base[k];
    return s;
  } catch (e) { return null; }
};
