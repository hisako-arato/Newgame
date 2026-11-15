// 第二章で足した、空の都ネフェリアの場所。
// つながり：廃都の広場 ─南→ 民の家々 ─東→ 灯りの塔
//           廃都の広場 ─東→ 空中庭園 ─東→ 王家の書庫／─北→ 王家の墓所／─南→ 涸れた水路
Object.assign(G.data.maps, {
  machi: {
    name: '民の家々', dark: 0,
    enc: { l: ['yadokumo', 'tori', 'yadokumo'] },
    rows: [
      '      e      ',
      ' lllllllllll ',
      ' lHHlllllHHl ',
      ' lllllllllll ',
      ' lxlllllllxl ',
      ' llllllllllle',
      ' lHHHlllHHHl ',
      ' lllllllllll ',
      '             '
    ],
    ev: [
      { x: 6, y: 0, step: true, script: [['warp', 'sky', 5, 8, 'up']] },
      { x: 12, y: 5, step: true, script: 'machi_east' },
      { x: 2, y: 2, obj: true, script: [['say', '', '食卓に、皿が五枚。うっすらと、埃。\n椅子が一脚だけ、引いたままになっている。']] },
      { x: 9, y: 2, obj: true, script: [['say', '', '壁に、子どもの落書き。雲と、雷と、冠をかぶった人。\nその横に、たどたどしい字。「おうさま　ありがとう」']] },
      { x: 3, y: 6, obj: true, script: [['say', '', '戸口に、色あせた張り紙。\n「水が止まりました。汲み置きを、分け合いましょう」']] },
      { x: 8, y: 6, obj: true, script: 'machi_bakery' },
      { x: 9, y: 6, obj: true, script: [['say', '', '店先の台。パンを並べた跡が、輪になって残っている。']] }
    ]
  },

  bosho: {
    name: '王家の墓所', dark: 0.25,
    rows: [
      '#########',
      '#ssAsAss#',
      '#sssssss#',
      '####s####',
      '#sssssss#',
      '#sssssss#',
      '####D####'
    ],
    ev: [
      { x: 4, y: 6, step: true, script: [['warp', 'garden', 7, 1, 'down']] },
      { x: 4, y: 3, sprite: 'hakamori', cond: '!boshoDone', script: 'bosho_boss' },
      { x: 3, y: 1, obj: true, script: 'bosho_tomb' },
      { x: 5, y: 1, obj: true, script: 'bosho_tomb' }
    ]
  },

  suiro: {
    name: '涸れた水路', dark: 0.3,
    enc: { s: ['mizunosei', 'yadokumo', 'mizunosei'] },
    rows: [
      '######D######',
      '#sssssssssss#',
      '#s###s#s###s#',
      '#sssssssssss#',
      '#s#s#####s#s#',
      '#sssssssssss#',
      '#####s#######',
      '#ssssssSssss#',
      '#############'
    ],
    ev: [
      { x: 6, y: 0, step: true, script: [['warp', 'garden', 9, 9, 'up']] },
      { x: 5, y: 6, sprite: 'suiroushi', cond: '!suiroBoss', script: 'suiro_boss' },
      { x: 7, y: 7, obj: true, script: 'suiro_gate' }
    ]
  },

  akari: {
    name: '灯りの塔', dark: 0.35,
    enc: { s: ['higa', 'higa', 'yadokumo'] },
    rows: [
      '#########',
      '#ssSCSss#',
      '#sssssss#',
      '####s####',
      '#sssssss#',
      '#s#sss#s#',
      '#sssssss#',
      '####D####'
    ],
    ev: [
      { x: 4, y: 7, step: true, script: [['warp', 'machi', 11, 5, 'left']] },
      { x: 4, y: 3, sprite: 'higanushi', cond: '!akariBoss', script: 'akari_boss' },
      { x: 4, y: 1, obj: true, script: 'akari_fire' }
    ]
  }
});
