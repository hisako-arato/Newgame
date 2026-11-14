// 魔物。art は 16×16 のドット絵（. は透明、ほかの文字は pal の色）
G.data.monsters = {
  numeri: {
    name: 'ぬめり茸', hp: 18, atk: 7, def: 2, exp: 6, gold: 4, weak: 'fire',
    drops: [{ item: 'gekko', rate: 0.35 }],
    pal: { a: '#b85c8a', b: '#e08ab4', c: '#f4e6d0', d: '#cbb89a', e: '#2a1a2a', f: '#fff' },
    art: [
      '................',
      '................',
      '.....aaaaaa.....',
      '...aabbbbbbaa...',
      '..abbfbbbbbbba..',
      '.abbbbbbbfbbbba.',
      '.abbfbbbbbbbbba.',
      '.aabbbbbbbbbbaa.',
      '..aaaaaaaaaaaa..',
      '....cccccccc....',
      '...cceccccecc...',
      '...cceccccecc...',
      '...cccceecccc...',
      '...dccccccccd...',
      '..ddccccccccdd..',
      '.dddddddddddddd.'
    ]
  },
  kiba: {
    name: '牙うさぎ', hp: 24, atk: 10, def: 3, exp: 9, gold: 6,
    drops: [{ item: 'kiba', rate: 0.5 }],
    pal: { a: '#d9c7a8', b: '#b89f7c', c: '#f2a0a8', e: '#c02030', f: '#fff', k: '#3a2a20' },
    art: [
      '..aa......aa....',
      '..aca.....aca...',
      '..aca.....aca...',
      '..aca.....aca...',
      '..aaa.....aaa...',
      '..aaaaaaaaaaa...',
      '.aaaaaaaaaaaaa..',
      '.aaeaaaaaaaeaa..',
      '.aaeaaaaaaaeaa..',
      '.aaaaaakaaaaaa..',
      '.baaaafaafaaab..',
      '..baaafaafaab...',
      '..bbaaaaaaabb...',
      '.bbaaaaaaaaabb..',
      '.baab.....baab..',
      '.bbbb.....bbbb..'
    ]
  },
  kame: {
    name: '石甲羅', hp: 40, atk: 9, def: 14, exp: 20, gold: 18, weak: 'fire',
    drops: [{ item: 'kiba', rate: 0.3 }],
    pal: { a: '#7d8590', b: '#5a616b', c: '#a9b0ba', g: '#6f8f4a', h: '#4f6b34', e: '#111' },
    art: [
      '................',
      '................',
      '................',
      '.....aaaaaa.....',
      '...aacaaaacaa...',
      '..aaaabbbbaaaa..',
      '.aacabaaaabacaa.',
      '.aaabaaccaabaaa.',
      '.aaabaaaaaabaaa.',
      'gaacabbbbbbacaag',
      'ggaaaaaaaaaaaagg',
      'geg.bbbbbbbb.ggg',
      'ggg..........hh.',
      '.hh.gg....gg....',
      '....gg....gg....',
      '....hh....hh....'
    ]
  },
  koumori: {
    name: '夜鳴きコウモリ', hp: 30, atk: 13, def: 4, exp: 14, gold: 9,
    drops: [{ item: 'akami', rate: 0.35 }],
    pal: { a: '#4a3a6a', b: '#33264d', c: '#7a62a8', e: '#ffd23a', f: '#fff' },
    art: [
      '................',
      '................',
      'a..............a',
      'aa....a..a....aa',
      'aba...aaaa...aba',
      'abba.aaaaaa.abba',
      'abbbaaeaaeaabbba',
      'abbbbaaaaaabbbba',
      'abcbbaafaafabbca',
      'ab.bbbaaaabbb.ba',
      'a..b.baaaab.b..a',
      '.....baaaab.....',
      '......baab......',
      '......b..b......',
      '................',
      '................'
    ]
  },
  kage: {
    name: '影狼', hp: 46, atk: 17, def: 6, exp: 24, gold: 15, charge: 0.25,
    drops: [{ item: 'kiba', rate: 0.6 }],
    pal: { a: '#2b2f3f', b: '#1a1c28', c: '#4a5068', e: '#e23a3a', f: '#eee' },
    art: [
      '................',
      '.a....a.........',
      '.aa..aa.........',
      '.aaaaaa.........',
      'aaeaaea.........',
      'aaaaaaaa......a.',
      'aaaaaaaaac...aa.',
      '.ffaaaaaaaccaaa.',
      '.f.aaaaaaaaaaab.',
      '...caaaaaaaaaab.',
      '...caaaaaaaaaab.',
      '...aaabbbbaaaab.',
      '...aab....aab...',
      '...aab....aab...',
      '...ab.....ab....',
      '...bb.....bb....'
    ]
  },
  kuma: {
    name: '雷喰らいの大熊', hp: 190, atk: 24, def: 8, exp: 120, gold: 200, weak: 'fire', charge: 0.3, boss: true,
    drops: [{ item: 'kiba', rate: 1 }],
    pal: { a: '#5a3d2b', b: '#3d281b', c: '#8a6248', e: '#ffe14a', y: '#ffe14a', f: '#eee', k: '#111' },
    art: [
      '.aa........aa...',
      'acca......acca..',
      'aaaaaaaaaaaaaa.y',
      '.aaaaaaaaaaaa.yy',
      '.aeeaaaaaaeea.y.',
      '.aaaaccccaaaa...',
      '.aaaackkcaaaa.y.',
      '..aaafccfaaa..y.',
      '.aaaaaaaaaaaaa..',
      'aaaaaaaaaaaaaaa.',
      'aaayaaaaaaayaaa.',
      'aaayyaaaaayyaaa.',
      'fbaaaaaaaaaaabf.',
      '.baaab...baaab..',
      '.baaab...baaab..',
      '.ffbbf...fbbff..'
    ]
  }
};
