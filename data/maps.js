// 地図。文字の意味は js/sprites.js の TILES を参照。
// ev の種類：sprite 付き＝人や物（通れない）／obj＝地形そのものを調べる／step＝踏むと起きる／gather＝採集
// 戦のあいだだけ出る人。W('!s1')＝戦が始まっていて、まだ s1 が立っていない
function W(c) { return function (s) { return !!s.flags.war && !s.flags[c.slice(1)]; }; }
// 物語がその段階まで進んだら出る人
function ST(n) { return function (s) { return s.stage >= n; }; }
G.data.maps = {
  lair: {
    name: '地下の隠れ家', dark: 0,
    rows: [
      '#########',
      '#SSsCsSS#',
      '#sssssss#',
      '#Bsssssa#',
      '#sssssss#',
      '#sssUsss#',
      '#########'
    ],
    ev: [
      { x: 1, y: 3, obj: true, script: 'bed' },
      { x: 4, y: 1, obj: true, script: 'cauldron' },
      { x: 1, y: 1, obj: true, script: 'note1' },
      { x: 2, y: 1, obj: true, script: 'note2' },
      { x: 6, y: 1, obj: true, script: 'note3' },
      { x: 7, y: 1, obj: true, script: 'note4' },
      { x: 7, y: 3, obj: true, script: [['say', '', '飲みかけの薬草茶が冷めている。']] },
      { x: 4, y: 5, step: true, script: [['warp', 'town', 3, 17, 'right']] }
    ]
  },

  town: {
    name: 'ミルテの街', dark: 0.3,
    rows: [
      'WWWWWWWWppWWWWWWWW',
      'WgggggggppgggggggW',
      'WgRRRRRgppgRRRRRgW',
      'WgRRRRRgppgRRRRRgW',
      'WgHHDHHgppgHHDHHgW',
      'WgggpgggppgggpgggW',
      'WgppppppppppppppgW',
      'WgggggggppgggggggW',
      'WgtgggggppggggtggW',
      'WgggggggppgggggggW',
      'WgRRRRggppggRRRRgW',
      'WgHHHHggppggHHHHgW',
      'WgggggggppgggggggW',
      'WgggppppppggggggtW',
      'WgggpgggggggtggggW',
      'WtttpttgggggggRRRW',
      'WtggpgtggtggggHHHW',
      'WtMgggtgggggggggtW',
      'WttttttggtgggggggW',
      'WWWWWWWWWWWWWWWWWW'
    ],
    ev: [
      { x: 4, y: 4, step: true, script: [['warp', 'bar', 4, 6, 'up']] },
      { x: 13, y: 4, step: true, script: [['warp', 'guild', 4, 6, 'up']] },
      { x: 8, y: 0, step: true, script: [['warp', 'field', 9, 20, 'up']] },
      { x: 9, y: 0, step: true, script: [['warp', 'field', 10, 20, 'up']] },
      { x: 2, y: 17, step: true, script: [['warp', 'lair', 4, 4, 'up']] },
      { x: 3, y: 5, sprite: 'sign', script: [['say', '', '【酒場 止まり木】\n夜だけ開く。']] },
      { x: 12, y: 5, sprite: 'sign', script: [['say', '', '【冒険者ギルド ミルテ支部】\n討伐・採集の依頼はこちら。']] },
      { x: 11, y: 7, sprite: 'merchant', script: 'stall' },
      { x: 6, y: 8, sprite: 'townsman', script: 'town_man' },
      { x: 12, y: 13, sprite: 'girl', script: 'town_girl' },
      { x: 7, y: 1, sprite: 'guard', script: 'town_guard' },
      { x: 13, y: 9, sprite: 'smith', script: 'smith' }
    ]
  },

  bar: {
    name: '酒場 止まり木', dark: 0.12,
    rows: [
      '#########',
      '#qSSSSSq#',
      '#ooooooo#',
      '#kkkkkko#',
      '#ooooooo#',
      '#oaoooao#',
      '#ooooooo#',
      '####D####'
    ],
    ev: [
      { x: 4, y: 7, step: true, script: [['warp', 'town', 4, 5, 'down']] },
      { x: 4, y: 2, sprite: 'master', script: 'bar_master' },
      { x: 1, y: 4, sprite: 'drunk', script: 'bar_drunk' },
      { x: 7, y: 4, sprite: 'bard', cond: ST(1), script: 'bar_bard' },
      { x: 2, y: 6, sprite: 'hanna', cond: ST(2), script: 'bar_hanna' },
      { x: 6, y: 4, sprite: 'liese', cond: 'lieseInBar', script: 'bar_liese' }
    ]
  },

  guild: {
    name: '冒険者ギルド', dark: 0.05,
    rows: [
      '#########',
      '#SSqqqSS#',
      '#ooooooo#',
      '#okkkkko#',
      '#ooooooo#',
      '#aoooooa#',
      '#ooooooo#',
      '####D####'
    ],
    ev: [
      { x: 4, y: 7, step: true, script: [['warp', 'town', 13, 5, 'down']] },
      { x: 4, y: 2, sprite: 'mina', script: 'guild_mina' },
      { x: 1, y: 4, sprite: 'adventurer', script: 'guild_adv' },
      { x: 6, y: 5, sprite: 'adventurer2', script: 'guild_adv2' }
    ]
  },

  field: {
    name: 'ミルテ街道', dark: 0.3,
    enc: { g: ['numeri', 'numeri', 'kiba', 'kiba', 'kame'], f: ['koumori', 'koumori', 'kage'] },
    rows: [
      'tttttttttppttttttttt',
      'tggggggggppggggggggt',
      'tggggggggppggggggggt',
      'tgggtggggppggggtgggt',
      'tggggggggppggggggggt',
      'tggggggggppggggggggt',
      'wwwwwwwwwbwwwwwwwwww',
      'wwwwwwwwwbwwwwwwwwww',
      'tggggggggppggggggggt',
      'tggggggggppgggtfffft',
      'tggtgggggppggtffffft',
      'tggggggggppgtfffffft',
      'ppppppppppppffffffff',
      'tggggggggppgtfffffft',
      'tgggggtggppggtffffft',
      'tggggggggppgggtfffft',
      'tggggggggppggggttttt',
      'tggggggggppggggggggt',
      'tggtgggggppgggggtggt',
      'tggggggggppggggggggt',
      'tggggggggppggggggggt',
      'tttttttttppttttttttt'
    ],
    ev: [
      { x: 9, y: 21, step: true, script: [['warp', 'town', 8, 1, 'down']] },
      { x: 10, y: 21, step: true, script: [['warp', 'town', 9, 1, 'down']] },
      { x: 9, y: 0, step: true, script: 'capital_gate' },
      { x: 10, y: 0, step: true, script: 'capital_gate' },
      { x: 9, y: 7, sprite: 'kuma', cond: '!bearDown', script: 'bridge_bear' },
      { x: 11, y: 8, sprite: 'sign', script: [['say', '', '【この先 王都ガルディア】\n橋を渡って北へ。']] },
      { x: 11, y: 19, sprite: 'sign', script: [['say', '', '【街道】道の上は魔物が出にくい。\n草むらと森に入るときは用心を。']] },
      { x: 3, y: 13, gather: 'gekko' },
      { x: 0, y: 12, step: true, script: 'field_west' },
      { x: 19, y: 12, step: true, script: 'field_east' },
      { x: 2, y: 11, sprite: 'sign', script: [['say', '', '【西：落雷の野】\n近ごろ雷が多い。用のない者は近づかぬこと。']] },
      { x: 17, y: 11, sprite: 'sign', script: [['say', '', '【東：森の奥】\n古い見張り塔あり。足もと注意。']] },
      { x: 6, y: 17, gather: 'gekko' },
      { x: 15, y: 18, gather: 'gekko' },
      { x: 2, y: 9, gather: 'gekko' },
      { x: 16, y: 4, gather: 'gekko' },
      { x: 16, y: 10, gather: 'akami' },
      { x: 18, y: 13, gather: 'akami' },
      { x: 15, y: 12, gather: 'akami' }
    ]
  },

  castle: {
    name: '王城 謁見の間', dark: 0,
    rows: [
      '#########',
      '##PsTs###',
      '#ssscsss#',
      '#ssscsss#',
      '#ssscsss#',
      '#ssscsss#',
      '#ssscsss#',
      '####D####'
    ],
    ev: [
      { x: 4, y: 7, step: true, script: [['warp', 'capital', 7, 2, 'down']] },
      { x: 2, y: 1, obj: true, script: 'portrait' },
      { x: 4, y: 2, sprite: 'king', script: 'king' },
      { x: 5, y: 3, sprite: 'liese', script: [['say', 'リーゼ', '陛下の御前です。……来てくださると、信じていました。']] },
      { x: 2, y: 4, sprite: 'guard', script: [['say', '近衛兵', '（槍を立てたまま、じっとこちらを見ている）']] },
      { x: 6, y: 4, sprite: 'guard', script: [['say', '近衛兵', '……あれが、伝承の。']] }
    ]
  },

  sky: {
    name: '廃都の広場', dark: 0,
    rows: [
      '           ',
      ' llllTllll ',
      ' lxlllllxl ',
      ' llllcllll ',
      ' lxllcllxl ',
      'ellllclllle',
      ' lllxlllll ',
      ' lBlllllSl ',
      ' lllllllll ',
      '           '
    ],
    ev: [
      { x: 5, y: 2, sprite: 'amelia', cond: '!amelia', script: 'sky_princess' },
      { x: 5, y: 1, obj: true, script: 'throne' },
      { x: 2, y: 7, obj: true, script: 'bed' },
      { x: 8, y: 7, obj: true, script: [['say', '', '王家の薬棚。四百年たっても、調合の道具はそろっている。'], ['brew']] },
      { x: 10, y: 5, step: true, script: 'sky_east' },
      { x: 0, y: 5, step: true, script: 'sky_west' },
      { x: 5, y: 5, sprite: 'guard', cond: W('!s1'), script: 'war_s1' },
      { x: 3, y: 3, sprite: 'guard', cond: W('!s2'), script: 'war_s2' },
      { x: 6, y: 4, sprite: 'liese', cond: function (s) { return s.flags.lieseCame && !s.flags.lieseDown; }, script: 'war_liese' },
      { x: 2, y: 5, sprite: 'rubble', script: [['say', '', '崩れた噴水。水は、とうに涸れている。']] },
      { x: 8, y: 6, sprite: 'rubble', script: [['say', '', '誰かの家だったもの。食卓に、皿が並んだままだ。']] }
    ]
  },

  garden: {
    name: '空中庭園', dark: 0,
    enc: { g: ['kurage', 'kurage', 'tori'] },
    rows: [
      '                ',
      ' llllllgggggxll ',
      ' lxgggggggtgggl ',
      ' lgggtgggggggxl ',
      ' lggggglllggggl ',
      'ellllllllllllle ',
      ' lgggglllgggggl ',
      ' lgtgggggggtggl ',
      ' lxggggggggggll ',
      ' llllgggxggllll ',
      '                '
    ],
    ev: [
      { x: 0, y: 5, step: true, script: [['warp', 'sky', 9, 5, 'left']] },
      { x: 14, y: 5, step: true, script: 'garden_east' },
      { x: 3, y: 2, gather: 'gekko' },
      { x: 12, y: 7, gather: 'gekko' },
      { x: 6, y: 8, gather: 'gekko' },
      { x: 11, y: 1, gather: 'akami' },
      { x: 2, y: 6, gather: 'akami' },
      { x: 7, y: 5, sprite: 'mage', cond: W('!m1'), script: 'war_m1' },
      { x: 12, y: 3, sprite: 'mage', cond: W('!m2'), script: 'war_m2' },
      { x: 13, y: 9, sprite: 'chest', cond: '!chestGarden', script: [['say', '', '崩れた東屋の下に、古い箱がある。'], ['give', 'jou', 2], ['flag', 'chestGarden']] }
    ]
  },

  archive: {
    name: '王家の書庫', dark: 0.15,
    enc: { s: ['yoroi', 'yoroi', 'kurage'] },
    rows: [
      '###########',
      '#SSSSSSSSS#',
      '#sssscssss#',
      '#sSsscssSs#',
      '#sSsscssSs#',
      '#sssscssss#',
      '#sSsscssSs#',
      '#sSsscssSs#',
      '#sssscssss#',
      '#####D#####'
    ],
    ev: [
      { x: 5, y: 9, step: true, script: [['warp', 'garden', 13, 5, 'left']] },
      { x: 5, y: 2, sprite: 'bannin', cond: '!archiveDone', script: 'archive_guard' },
      { x: 5, y: 1, obj: true, script: 'archive_record' },
      { x: 1, y: 2, sprite: 'chest', cond: '!chestArcA', script: [['give', 'kitsuke', 2], ['flag', 'chestArcA']] },
      { x: 9, y: 8, sprite: 'chest', cond: '!chestArcB', script: [['give', 'kaen', 2], ['flag', 'chestArcB']] }
    ]
  },

  gate: {
    name: '城の正門', dark: 0,
    rows: [
      '           ',
      ' lllllllll ',
      ' lxlllllxl ',
      ' lllllllll ',
      ' llllllllle',
      ' lllllllll ',
      ' lxlllllxl ',
      ' lllllllll ',
      '           '
    ],
    ev: [
      { x: 10, y: 4, step: true, script: [['warp', 'sky', 1, 5, 'right']] },
      { x: 2, y: 4, sprite: 'king', cond: '!kingDown', script: 'war_king' },
      { x: 2, y: 3, sprite: 'guard', cond: '!kingDown', script: [['say', '近衛兵', '陛下の御前だ。剣を引け、剣聖。']] },
      { x: 2, y: 5, sprite: 'mage', cond: '!kingDown', script: [['say', '魔導師', '杭はもう、十分に打たれた。この都は落ちる。']] }
    ]
  },

  altar: {
    name: '隠された祭壇', dark: 0.1,
    rows: [
      '#######',
      '#sssss#',
      '#ssAss#',
      '#sscss#',
      '#sscss#',
      '#sscss#',
      '#######'
    ],
    ev: [
      { x: 3, y: 2, obj: true, script: 'altar' }
    ]
  },

  // ---- 地上の各地（第一章の探検）----
  woods: {
    name: '森の奥', dark: 0.38,
    enc: { f: ['ookumo', 'ookumo', 'kage', 'koumori'] },
    rows: [
      'tttttttttttttttt',
      'tfffftHDHtffffft',
      'tffffffffffffttt',
      'tfftffffftfffftt',
      'tffffttffffffftt',
      'fffffffffttfffft',
      'tfftfffffffffftt',
      'tffffftffffftfft',
      'ttfffffffftfffft',
      'tfffftfffffffttt',
      'tftfffffftffffft',
      'tfffffffffffffft',
      'tttttttttttttttt'
    ],
    ev: [
      { x: 0, y: 5, step: true, script: [['warp', 'field', 18, 12, 'left']] },
      { x: 7, y: 1, step: true, script: 'tower_enter' },
      { x: 13, y: 7, gather: 'akami' },
      { x: 3, y: 10, gather: 'akami' },
      { x: 12, y: 3, gather: 'gekko' },
      { x: 14, y: 11, sprite: 'chest', cond: '!chestWoods', script: [['give', 'kaen', 2], ['flag', 'chestWoods']] }
    ]
  },

  tower: {
    name: '古い見張り塔', dark: 0.25,
    enc: { s: ['yuurei'] },
    rows: [
      '#########',
      '#ssSSSss#',
      '#sssssss#',
      '####s####',
      '#sssssss#',
      '#s#sss#s#',
      '#sssssss#',
      '####D####'
    ],
    ev: [
      { x: 4, y: 7, step: true, script: [['warp', 'woods', 7, 2, 'down']] },
      { x: 4, y: 3, sprite: 'bantou', cond: '!towerDone', script: 'tower_guard' },
      { x: 4, y: 1, obj: true, script: [['say', '', '壁に、すり減った紋章。交差した二本の剣。\nその下に、小さく名前が刻まれている。——「カイン」。']] },
      { x: 7, y: 1, gather: 'nemuri', n: 1 },
      { x: 1, y: 2, sprite: 'chest', cond: '!chestTower', script: [['say', '', '古い兵の背嚢。中身は、まだ使えそうだ。'], ['give', 'jou', 1], ['flag', 'chestTower']] }
    ]
  },

  plain: {
    name: '落雷の野', dark: 0.2,
    enc: { z: ['koge', 'koge', 'tokage'] },
    rows: [
      'ttttttttt#D#tttttt',
      'tzzzzzzzzzpzzzgggt',
      'tzzrzzzzzzpzzggggt',
      'tzzzzzrzzzpzzzgggt',
      'tzzzzzzzzzpzrzgggt',
      'tzrzzzzzzzpzzzzggt',
      'tzzzzzzzzzpppppppp',
      'tzzzzrzzzzpzzzgggt',
      'tzzzzzzzzzpzzrgggt',
      'tzzrzzzzzzpzzzzggt',
      'tzzzzzzzzzpzzzgggt',
      'tzzzzzzrzzpzzzgggt',
      'ttttttttttpttttttt'
    ],
    ev: [
      { x: 17, y: 6, step: true, script: [['warp', 'field', 1, 12, 'right']] },
      { x: 10, y: 0, step: true, script: [['warp', 'mine', 6, 9, 'up']] },
      { x: 10, y: 12, step: true, script: 'plain_south' },
      { x: 4, y: 6, sprite: 'rairou', cond: '!rairouDown', script: 'plain_wolf' },
      { x: 3, y: 5, sprite: 'rubble', script: [['say', '', '溶けて固まった炉。斧と、打ちかけの剣が、山になって焼けている。']] },
      { x: 2, y: 7, sprite: 'rubble', script: [['say', '', '焼け落ちた木こり小屋。\nすぐ隣の森の木は、一本も焦げていない。']] },
      { x: 12, y: 1, sprite: 'sign', script: [['say', '', '【北：ガラ鉱山】鉄と銀が出る。魔物も出る。\n【南：霧の湿地】立ち入るなら、二人以上で。']] },
      { x: 2, y: 1, gather: 'raisho' },
      { x: 7, y: 4, gather: 'raisho' },
      { x: 6, y: 10, gather: 'raisho' },
      { x: 4, y: 9, gather: 'raisho' },
      { x: 15, y: 9, gather: 'gekko' },
      { x: 16, y: 3, gather: 'gekko' }
    ]
  },

  mine: {
    name: 'ガラ鉱山', dark: 0.42,
    enc: { s: ['iwakui', 'doukutsu', 'doukutsu'] },
    rows: [
      '#############',
      '#sss#sssssss#',
      '#sss#ss#ssss#',
      '#ss###s#s##s#',
      '#sssssss#sss#',
      '#s##s###ssss#',
      '#sssssss#s#s#',
      '###s#sss#sss#',
      '#sss#s#sssss#',
      '#ssssssss#ss#',
      '######D######'
    ],
    ev: [
      { x: 6, y: 10, step: true, script: [['warp', 'plain', 10, 1, 'down']] },
      { x: 1, y: 1, gather: 'tetsu' },
      { x: 3, y: 4, gather: 'tetsu' },
      { x: 1, y: 8, gather: 'tetsu' },
      { x: 7, y: 7, gather: 'tetsu' },
      { x: 11, y: 2, gather: 'gin' },
      { x: 9, y: 6, gather: 'gin' },
      { x: 11, y: 9, gather: 'gin' },
      { x: 3, y: 1, sprite: 'chest', cond: '!chestMine', script: [['say', '', '鉱夫の忘れもの。'], ['give', 'kitsuke', 2], ['flag', 'chestMine']] }
    ]
  },

  marsh: {
    name: '霧の湿地', dark: 0.35,
    enc: { m: ['doro', 'dokutake', 'doro'] },
    rows: [
      'ttttttttttpttttt',
      'tmmmmmmmmmpmwwmt',
      'tmwwmmmmmmpmwwmt',
      'tmwwwmmmmppmmwmt',
      'tmmmwmmmmpmmmmmt',
      'tmmmmmmmppmmwwmt',
      'twwmmmmppmmmwwmt',
      'twwwmmmpmmmmmwmt',
      'tmwmmmmpppppRRRt',
      'tmmmmmmmmwwpHDHt',
      'tmmmwwmmmmwppppt',
      'tttttttttttttttt'
    ],
    ev: [
      { x: 10, y: 0, step: true, script: [['warp', 'plain', 10, 11, 'up']] },
      { x: 13, y: 9, step: true, script: [['warp', 'chapel', 4, 6, 'up']] },
      { x: 14, y: 10, sprite: 'adventurer', cond: '!rescued', script: 'marsh_roy' },
      { x: 2, y: 4, gather: 'gekko' },
      { x: 6, y: 9, gather: 'gekko' },
      { x: 13, y: 4, gather: 'akami' },
      { x: 1, y: 10, sprite: 'chest', cond: '!chestMarsh', script: [['say', '', '泥に半分沈んだ箱。'], ['give', 'jou', 2], ['flag', 'chestMarsh']] }
    ]
  },

  chapel: {
    name: '沈んだ礼拝堂', dark: 0.3,
    rows: [
      '#########',
      '#ssSSSss#',
      '#sssssss#',
      '####s####',
      '#sssssss#',
      '#swsssws#',
      '#sssssss#',
      '####D####'
    ],
    ev: [
      { x: 4, y: 7, step: true, script: [['warp', 'marsh', 13, 10, 'down']] },
      { x: 4, y: 3, sprite: 'nushi', cond: '!rescued', script: 'chapel_boss' },
      { x: 7, y: 2, sprite: 'adventurer2', cond: '!rescued', script: [['say', 'ドーガ', 'う、動けん……。あの化け物を、なんとかしてくれ……。']] },
      { x: 4, y: 1, obj: true, script: 'mural' }
    ]
  },

  capital: {
    name: '王都ガルディア', dark: 0.3,
    rows: [
      '################',
      '#######D########',
      'WggggggpgggggggW',
      'WgRRRggpggRRRRgW',
      'WgHHHggpggHHHHgW',
      'WgggggppppgggggW',
      'WgggggpggpgggggW',
      'WgRRRgpggpgRRRgW',
      'WgHHHgpggpgHHHgW',
      'WggggppppppggggW',
      'WggggggppggggggW',
      'WWWWWWWppWWWWWWW'
    ],
    ev: [
      { x: 7, y: 11, step: true, script: [['warp', 'field', 9, 1, 'down']] },
      { x: 8, y: 11, step: true, script: [['warp', 'field', 10, 1, 'down']] },
      { x: 7, y: 1, step: true, script: 'castle_enter' },
      { x: 8, y: 2, sprite: 'guard', script: [['say', '近衛兵', '薬売りのカイン殿ですな。陛下がお待ちです。扉の奥へ。']] },
      { x: 3, y: 5, sprite: 'smith', script: [['say', '王都の鍛冶', '昼も夜も、炉を止めるなとのお達しだ。\n鍬も鍋も後回し。打つのは剣と鏃ばかりさ。']] },
      { x: 12, y: 5, sprite: 'townsman', script: [['say', '木こり', '北の森は、もう半分も残っちゃいない。炭にして炉にくべるんだと。\n……あの森で育ったんだがな、おれは。']] },
      { x: 4, y: 9, sprite: 'girl', script: [['say', '女の子', '父さんね、兵隊さんになるの。となりの国へ行くんだって。\n雷がこわいから、行かないでって言ったのに。']] },
      { x: 11, y: 9, sprite: 'merchant', script: [['say', '王都の商人', '王都の品だよ。田舎の行商とは物が違う。'], ['shop', 'capital']] },
      { x: 13, y: 2, sprite: 'sign', script: [['say', '', '【布告】\n「雷に怯えるな。神などおらぬ。国の鉄は、国を守る」\n——ガルド王']] }
    ]
  }
};
