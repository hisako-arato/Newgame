// 地図。文字の意味は js/sprites.js の TILES を参照。
// ev の種類：sprite 付き＝人や物（通れない）／obj＝地形そのものを調べる／step＝踏むと起きる／gather＝採集
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
      { x: 7, y: 1, sprite: 'guard', script: 'town_guard' }
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
      'tggggggggpppffffffft',
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
      { x: 3, y: 12, gather: 'gekko' },
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
      '###sTs###',
      '#ssscsss#',
      '#ssscsss#',
      '#ssscsss#',
      '#ssscsss#',
      '#ssscsss#',
      '####D####'
    ],
    ev: [
      { x: 4, y: 7, step: true, script: [['warp', 'field', 9, 1, 'down']] },
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
      ' llllclllle',
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
  }
};
