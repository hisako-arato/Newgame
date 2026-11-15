// 第一章の夏〜冬で足した、地上の街・道・ダンジョン。
// つながり：街道 ─西→ 落雷の野 ─西→ 海沿いの道 ─西→ 港町サルベ（船で座礁船の洞窟）／海沿いの道の北に、雷の落ちた砦
//           落雷の野 ─北→ 鉱山町ガラ（北にガラ鉱山、東に氷穴）／落雷の野 ─南→ 霧の湿地 ─東→ ニレの村
//           森の奥 ─東→ 東街道 ─東→ 学びの町ルーメ（学舎の地下書庫）／東街道の北に、古戦場
//           街道 ─北の橋→ 国境の町 ─北→ 王都（地下水道 → 廃研究所）
Object.assign(G.data.maps, {
  // ---------------- 夏 ----------------
  coast: {
    name: '海沿いの道', dark: 0.12,
    enc: { g: ['hamagani', 'umidori', 'umidori'], y: ['hamagani'] },
    rows: [
      'tttttttttptttttttt',
      'tggggggggpgggggggt',
      'tggtgggggpggggtggt',
      'tggggggggpgggggggt',
      'pppppppppppppppppp',
      'tyyyggyyypyyggyyyt',
      'tyyyyyyyyyyyyyyyyt',
      'twwyyyywwwwyyyywwt',
      'wwwwwwwwwwwwwwwwww'
    ],
    ev: [
      { x: 17, y: 4, step: true, script: [['warp', 'plain', 1, 6, 'right']] },
      { x: 0, y: 4, step: true, script: 'coast_west' },
      { x: 9, y: 0, step: true, script: 'coast_north' },
      { x: 10, y: 1, sprite: 'sign', script: [['say', '', '【北：ハルツ砦】王国軍の砦。関係者のほか、立ち入りを禁ず。']] },
      { x: 2, y: 3, sprite: 'sign', script: [['say', '', '【西：港町サルベ】魚と塩と、遠い国の品。']] },
      { x: 5, y: 2, gather: 'gekko' },
      { x: 13, y: 1, gather: 'gekko' },
      { x: 15, y: 6, gather: 'akami' }
    ]
  },

  salbe: {
    name: '港町サルベ', dark: 0.1,
    rows: [
      'WWWWWWWWWWWWWWWW',
      'WgRRRggggggRRRgW',
      'WgHHHggggggHHHgW',
      'WggpgggggggggpgW',
      'WggppppppppppppW',
      'Wggpggggpggggppp',
      'WgRRRgggpgggRRRW',
      'WgHHHgggpgggHHHW',
      'WyyyyyyypyyyyyyW',
      'WwwwwwwwowwwwwwW',
      'WwwwwwwwowwwwwwW',
      'WWWWWWWWWWWWWWWW'
    ],
    ev: [
      { x: 15, y: 5, step: true, script: [['warp', 'coast', 1, 4, 'right']] },
      { x: 8, y: 10, sprite: 'sailor', script: 'salbe_boat' },
      { x: 5, y: 5, sprite: 'merchant', script: 'salbe_merchant' },
      { x: 12, y: 3, sprite: 'girl', script: 'inn' },
      { x: 10, y: 8, sprite: 'sailor', script: 'salbe_fisher' },
      { x: 4, y: 8, sprite: 'townsman', script: 'salbe_man' },
      { x: 6, y: 3, sprite: 'sign', script: [['say', '', '【港町サルベ】\n宿は北東の家。船は南の桟橋から。']] }
    ]
  },

  wreck: {
    name: '座礁船の洞窟', dark: 0.35,
    enc: { s: ['funayurei', 'funekurage', 'funekurage'] },
    rows: [
      '###########',
      '#oooqSqooo#',
      '#ooooooooo#',
      '####o######',
      '#sssssswws#',
      '#swwssssss#',
      '#sssswwsss#',
      '#swsssssws#',
      '#sssssssss#',
      '#####D#####'
    ],
    ev: [
      { x: 5, y: 9, step: true, script: [['warp', 'salbe', 8, 8, 'up']] },
      { x: 4, y: 3, sprite: 'senchou', cond: '!wreckDone', script: 'wreck_boss' },
      { x: 5, y: 1, obj: true, script: 'wreck_box' },
      { x: 8, y: 8, sprite: 'chest', cond: '!chestWreck', script: [['say', '', '水夫の私物入れ。'], ['give', 'jou', 2], ['flag', 'chestWreck']] }
    ]
  },

  gara: {
    name: '鉱山町ガラ', dark: 0.15,
    rows: [
      '######D#######',
      'WzzzzzpzzzzzzW',
      'WzRRRzpzzRRRzW',
      'WzHHHzpzzHHHzW',
      'WzzzzzpzzzzzzW',
      'Wzzzzzpppppppp',
      'WzRRzzpzzzzzzW',
      'WzHHzzpzzzzzzW',
      'WzzzzzpzzzzzzW',
      'WWWWWWpWWWWWWW'
    ],
    ev: [
      { x: 6, y: 9, step: true, script: [['warp', 'plain', 10, 1, 'down']] },
      { x: 6, y: 0, step: true, script: [['warp', 'mine', 6, 9, 'up']] },
      { x: 13, y: 5, step: true, script: 'gara_east' },
      { x: 4, y: 4, sprite: 'miner', script: 'gara_miner' },
      { x: 9, y: 4, sprite: 'professor', script: 'gara_engineer' },
      { x: 10, y: 7, sprite: 'smith', script: [['say', 'ガラの鍛冶屋', '掘りたての鉱石なら、うちがいちばんうまく打つ。'], ['forge']] },
      { x: 3, y: 8, sprite: 'girl', script: 'inn' },
      { x: 8, y: 1, sprite: 'sign', script: [['say', '', '【北：ガラ鉱山】／【東：氷穴】冬のほかは、入口が水に沈む。']] }
    ]
  },

  // ---------------- 秋 ----------------
  eastroad: {
    name: '東街道', dark: 0.2,
    enc: { g: ['sanzoku', 'ogarasu', 'ogarasu'] },
    rows: [
      'tttttttttptttttttt',
      'tggggggggpgggggggt',
      'tgtggggggpgggtgggt',
      'tggggggggpgggggggt',
      'pppppppppppppppppp',
      'tggggtgggggggggggt',
      'tggggggggggtgggggt',
      'tgtggggggggggggtgt',
      'tttttttttttttttttt'
    ],
    ev: [
      { x: 0, y: 4, step: true, script: [['warp', 'woods', 14, 5, 'left']] },
      { x: 17, y: 4, step: true, script: [['warp', 'rume', 1, 5, 'right']] },
      { x: 9, y: 0, step: true, script: 'eastroad_north' },
      { x: 10, y: 1, sprite: 'sign', script: [['say', '', '【北：古戦場】\n足を踏み入れる者は、死者に礼を。']] },
      { x: 15, y: 3, sprite: 'sign', script: [['say', '', '【東：学びの町ルーメ】']] },
      { x: 4, y: 6, gather: 'gekko' },
      { x: 13, y: 6, gather: 'akami' },
      { x: 7, y: 2, gather: 'gekko' }
    ]
  },

  rume: {
    name: '学びの町ルーメ', dark: 0.1,
    rows: [
      'WWWWWWWWWWWWWW',
      'WgRRRRRRRRRRgW',
      'WgHHHHHDHHHHgW',
      'WggggggpgggggW',
      'WggtgggpgggtgW',
      'pppppppppggggW',
      'WggggggpgggggW',
      'WgRRRggpgRRRgW',
      'WgHHHggpgHHHgW',
      'WggggggggggggW',
      'WWWWWWWWWWWWWW'
    ],
    ev: [
      { x: 0, y: 5, step: true, script: [['warp', 'eastroad', 16, 4, 'left']] },
      { x: 7, y: 2, step: true, script: 'rume_door' },
      { x: 8, y: 3, sprite: 'professor', script: 'rume_professor' },
      { x: 4, y: 6, sprite: 'adventurer', script: 'rume_student' },
      { x: 11, y: 6, sprite: 'merchant', script: [['say', '学舎前の薬種屋', '学生相手の商いでね。質は保証するよ。'], ['shop', 'rume']] },
      { x: 10, y: 9, sprite: 'girl', script: 'inn' },
      { x: 5, y: 3, sprite: 'sign', script: [['say', '', '【王立薬学舎】\n入学試験は年に一度、秋。飛び入りも受けつける。']] }
    ]
  },

  shoko: {
    name: '学舎の地下書庫', dark: 0.35,
    enc: { s: ['honkui', 'shoyoroi', 'honkui'] },
    rows: [
      '#########',
      '#SSSSSSS#',
      '#sssssss#',
      '####s####',
      '#sSsssSs#',
      '#sssssss#',
      '#sSsssSs#',
      '#sssssss#',
      '####D####'
    ],
    ev: [
      { x: 4, y: 8, step: true, script: [['warp', 'rume', 7, 3, 'down']] },
      { x: 4, y: 3, sprite: 'kinsho', cond: '!shokoDone', script: 'shoko_boss' },
      { x: 4, y: 1, obj: true, script: 'shoko_book' },
      { x: 1, y: 7, sprite: 'chest', cond: '!chestShoko', script: [['say', '', '司書の置き忘れ。'], ['give', 'kitsuke', 2], ['flag', 'chestShoko']] }
    ]
  },

  nire: {
    name: 'ニレの村', dark: 0.3,
    rows: [
      'tttttttttttt',
      'tgRRgggRRggt',
      'tgHHgggHHggt',
      'tggggpgggggt',
      'pppppppppggt',
      'tggggpgggggt',
      'tgRRgpgRRggt',
      'tgHHgggHHggt',
      'tttttttttttt'
    ],
    ev: [
      { x: 0, y: 4, step: true, script: [['warp', 'marsh', 14, 4, 'left']] },
      { x: 6, y: 3, sprite: 'elder', script: 'nire_elder' },
      { x: 4, y: 5, sprite: 'sick', cond: '!nireDone', script: [['say', '村の男', '……子どもが、三人とも……。水も、飲めないんだ……。']] },
      { x: 9, y: 5, sprite: 'sick', cond: '!nireDone', script: [['say', '村の女', '（熱で、こちらが見えていない）']] },
      { x: 4, y: 5, sprite: 'townsman', cond: 'nireDone', script: [['say', '村の男', '子どもらが、粥を食べたよ。三人とも。\nあの嬢ちゃんは、うちの村の恩人だ。']] },
      { x: 9, y: 3, sprite: 'girl', cond: 'nireDone', script: 'inn' }
    ]
  },

  senjo: {
    name: '古戦場', dark: 0.3,
    enc: { z: ['gaikotsu', 'onnen', 'gaikotsu'] },
    rows: [
      'tttttttttttttttt',
      'tzzzzzzrzzzzzzzt',
      'tzrzzzzzzzzrzzzt',
      'tzzzzrzzzzzzzzzt',
      'tzzzzzzzrzzzzrzt',
      'tzzrzzzzzzzzzzzt',
      'tzzzzzzzzzrzzzzt',
      'tzrzzzzzzzzzzzzt',
      'tzzzzzzrzpzzrzzt',
      'tzzzzzzzzpzzzzzt',
      'tttttttttptttttt'
    ],
    ev: [
      { x: 9, y: 10, step: true, script: [['warp', 'eastroad', 9, 1, 'down']] },
      { x: 8, y: 2, sprite: 'boushou', cond: '!senjoDone', script: 'senjo_boss' },
      { x: 8, y: 1, sprite: 'grave', script: 'senjo_grave' },
      { x: 13, y: 8, sprite: 'chest', cond: '!chestSenjo', script: [['say', '', '錆びた兵糧箱。中に、封のされた薬瓶。'], ['give', 'jou', 3], ['flag', 'chestSenjo']] }
    ]
  },

  // ---------------- 冬 ----------------
  hyouketsu: {
    name: '氷穴', dark: 0.2,
    enc: { i: ['koriokami', 'hyoshogame', 'koriokami'] },
    rows: [
      '###########',
      '#iiiiiiiii#',
      '#ii##iii#i#',
      '#iiiiiiiii#',
      '####i######',
      '#iiiiii#ii#',
      '#i##iiiiii#',
      '#iiiii##ii#',
      '#ii#iiiiii#',
      '#iiiiiiiii#',
      '#####D#####'
    ],
    ev: [
      { x: 5, y: 10, step: true, script: [['warp', 'gara', 12, 5, 'left']] },
      { x: 4, y: 4, sprite: 'hyouou', cond: '!hyouDone', script: 'hyou_boss' },
      { x: 8, y: 1, gather: 'hyoshoka', n: 1 },
      { x: 1, y: 9, sprite: 'chest', cond: '!chestHyou', script: [['say', '', '氷に閉じこめられた、古い背嚢。'], ['give', 'tokujou', 1], ['flag', 'chestHyou']] }
    ]
  },

  toride: {
    name: 'ハルツ砦', dark: 0.3,
    enc: { s: ['raiyoroi', 'kogegarasu', 'raiyoroi'] },
    rows: [
      '###########',
      '#sssSssSss#',
      '#sssssssss#',
      '#####s#####',
      '#szsssszss#',
      '#ss#sss#ss#',
      '#sssszssss#',
      '#ss#sss#zs#',
      '#sssssssss#',
      '#####D#####'
    ],
    ev: [
      { x: 5, y: 9, step: true, script: [['warp', 'coast', 9, 1, 'down']] },
      { x: 5, y: 3, sprite: 'toridenushi', cond: '!torideDone', script: 'toride_boss' },
      { x: 4, y: 1, obj: true, script: 'toride_diary' },
      { x: 7, y: 1, obj: true, script: [['say', '', '焼けた棚。地図の束が、炭になっている。\n一枚だけ残った端切れに——「高度」「雲」の文字。']] },
      { x: 9, y: 8, sprite: 'chest', cond: '!chestToride', script: [['say', '', '兵の装備箱。'], ['give', 'tokujou', 1], ['give', 'kitsuke', 2], ['flag', 'chestToride']] }
    ]
  },

  border: {
    name: '国境の町', dark: 0.25,
    rows: [
      'WWWWWppWWWWW',
      'WggggppggggW',
      'WgRRgppgRRgW',
      'WgHHgppgHHgW',
      'WggggppggggW',
      'WggtgppgtggW',
      'WgRRgppgRRgW',
      'WgHHgppgHHgW',
      'WggggppggggW',
      'WWWWWppWWWWW'
    ],
    ev: [
      { x: 5, y: 9, step: true, script: [['warp', 'field', 9, 1, 'down']] },
      { x: 6, y: 9, step: true, script: [['warp', 'field', 10, 1, 'down']] },
      { x: 5, y: 0, step: true, script: 'border_north' },
      { x: 6, y: 0, step: true, script: 'border_north' },
      { x: 3, y: 4, sprite: 'merchant', script: 'border_merchant' },
      { x: 8, y: 4, sprite: 'townsman', script: 'border_farmer' },
      { x: 2, y: 8, sprite: 'guard', script: 'border_guard' },
      { x: 9, y: 8, sprite: 'girl', script: 'inn' },
      { x: 9, y: 1, sprite: 'adventurer2', script: [['say', '国境の商人', '剣も鎧も、戦の前がいちばん売れる。嫌な商売さ。'], ['shop', 'border']] }
    ]
  },

  suido: {
    name: '王都の地下水道', dark: 0.42,
    enc: { s: ['dobunezumi', 'odei', 'dobunezumi'] },
    rows: [
      '#########D###',
      '#ssswwwsssss#',
      '#swsssssswws#',
      '#swssw#sssss#',
      '#sssswwsws#s#',
      '#s##ssssssss#',
      '#sswwsss#wws#',
      '#ssssswsssss#',
      '#Ussssssssss#',
      '#############'
    ],
    ev: [
      { x: 1, y: 8, step: true, script: [['warp', 'capital', 3, 10, 'right']] },
      { x: 9, y: 0, step: true, script: [['warp', 'lab', 4, 7, 'up']] },
      { x: 11, y: 8, sprite: 'chest', cond: '!chestSuido', script: [['say', '', '流れ着いた木箱。'], ['give', 'tokujou', 2], ['flag', 'chestSuido']] }
    ]
  },

  lab: {
    name: '魔導師団の廃研究所', dark: 0.35,
    enc: { s: ['jikkentai'] },
    rows: [
      '#########',
      '#ssSsSss#',
      '#sssssss#',
      '####s####',
      '#sSsssSs#',
      '#sssssss#',
      '#sSsssSs#',
      '#sssssss#',
      '####D####'
    ],
    ev: [
      { x: 4, y: 8, step: true, script: [['warp', 'suido', 9, 1, 'down']] },
      { x: 4, y: 3, sprite: 'jinban', cond: '!labBoss', script: 'lab_boss' },
      { x: 4, y: 1, sprite: 'circle', script: 'lab_circle' },
      { x: 3, y: 1, obj: true, script: [['say', '', '【転移実験記録　王国暦三一一年】\n「一度に送れるのは、ひとりが限度。帰りの陣は、行った者が自分で描くほかない」']] },
      { x: 5, y: 1, obj: true, script: [['say', '', '【転移実験記録　つづき】\n「送る者の名は、王がお決めになった。——ほかに、できる者がいない」\n名前の部分は、刃物で削り取られている。']] }
    ]
  },

  // ---------------- 第三章：地上の戦い ----------------
  honjin: {
    name: '魔導師団の本陣', dark: 0.25,
    rows: [
      'ttttttttttttt',
      'tzzzzzzzzzzzt',
      'tzHHzzzzzHHzt',
      'tzzzzzzzzzzzt',
      'tzzzzzzzzzzzt',
      'tzzzzzzzzzzzt',
      'tzzzzzpzzzzzt',
      'ttttttptttttt'
    ],
    ev: [
      { x: 6, y: 7, step: true, script: [['warp', 'field', 9, 1, 'down']] },
      { x: 6, y: 3, sprite: 'circle', script: [['say', '', '地面いっぱいに描かれた魔導陣。空の杭と、光の糸でつながっている。']] },
      { x: 6, y: 2, sprite: 'danchou', cond: '!honjinDone', script: 'honjin_boss' },
      { x: 4, y: 5, sprite: 'guard', cond: '!hj1', script: 'honjin_s1' },
      { x: 8, y: 5, sprite: 'mage', cond: '!hj2', script: 'honjin_s2' }
    ]
  }
});
