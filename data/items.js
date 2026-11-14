// 道具・装備・調合・技。数値はここだけで調整できる（セーブには強さを持たない）
G.data.items = {
  kizu:    { name: '傷薬',       type: 'potion', heal: 40,  price: 30, sell: 22, desc: 'HPを40回復する' },
  jou:     { name: '上等な傷薬', type: 'potion', heal: 110, sell: 60, desc: 'HPを110回復する' },
  kitsuke: { name: '気つけ薬',   type: 'potion', sp: 15,   sell: 35, desc: 'SPを15回復する' },
  kaen:    { name: '火炎瓶',     type: 'bomb',   dmg: 45, elem: 'fire', sell: 40, desc: '戦闘中に投げる。炎で45前後のダメージ' },
  gekko:   { name: '月光草',     type: 'mat', sell: 5,  desc: '夜にだけ葉をひらく薬草' },
  akami:   { name: '赤い実',     type: 'mat', sell: 8,  desc: '森になる、舌がしびれる実' },
  kiba:    { name: '魔物の牙',   type: 'mat', sell: 10, desc: '砕いて薬に混ぜる' },
  rusty:   { name: 'さびた剣',   type: 'weapon', atk: 2 },
  iron:    { name: '鉄の剣',     type: 'weapon', atk: 8,  price: 180 },
  silver:  { name: '銀の剣',     type: 'weapon', atk: 14, price: 480 },
  kishi:   { name: '騎士の剣',   type: 'weapon', atk: 18 },
  coat:    { name: '古びた外套', type: 'armor', def: 1 },
  leather: { name: '革の胸当て', type: 'armor', def: 5,  price: 150 },
  mail:    { name: '鎖かたびら', type: 'armor', def: 10, price: 420 }
};

// 大釜で作れる薬
G.data.recipes = [
  { out: 'kizu',    need: { gekko: 2 } },
  { out: 'kitsuke', need: { akami: 2 } },
  { out: 'jou',     need: { gekko: 2, kiba: 1 } },
  { out: 'kaen',    need: { akami: 1, kiba: 1 } }
];

// 店の品ぞろえ
G.data.shops = {
  stall: ['kizu', 'iron', 'leather', 'silver', 'mail']
};

// 技と魔法。lv はそのレベルで「思い出す」
G.data.skills = [
  { id: 'tomoshibi', name: '灯火の術',   lv: 1, sp: 4,  kind: 'magic', elem: 'fire', pow: 14, desc: '炎の魔法。守りの固い相手にも効く' },
  { id: 'niren',     name: '二連斬り',   lv: 2, sp: 3,  kind: 'multi', hits: 2, rate: 0.7, desc: 'すばやく二度斬る' },
  { id: 'kabuto',    name: '兜割り',     lv: 3, sp: 5,  kind: 'break', rate: 1.5, desc: '強く斬り、相手の守りを下げる' },
  { id: 'iyashi',    name: '癒やしの水', lv: 4, sp: 6,  kind: 'heal', rate: 0.45, desc: 'HPを大きく回復する' },
  { id: 'issen',     name: '剣聖の一閃', lv: 6, sp: 10, kind: 'slash', rate: 2.5, desc: '四百年前の一太刀' },
  // who があるものは仲間の技
  { id: 'ikazuchi',  name: '雷の矢',     who: 'amelia', lv: 1, sp: 4,  kind: 'magic', elem: 'thunder', pow: 16, desc: '雷の魔法。金属や鳥によく効く' },
  { id: 'megumi',    name: '恵みの雨',   who: 'amelia', lv: 1, sp: 5,  kind: 'heal', rate: 0.5, desc: 'ひとりのHPを大きく回復する' },
  { id: 'kiri',      name: '霧の衣',     who: 'amelia', lv: 5, sp: 6,  kind: 'weaken', desc: '霧で相手の目をくらませ、攻撃を弱める' },
  { id: 'kaminari',  name: '神鳴り',     who: 'amelia', lv: 8, sp: 12, kind: 'magic', elem: 'thunder', pow: 42, desc: '王家の雷。地上が「神の怒り」と呼んだもの' }
];
