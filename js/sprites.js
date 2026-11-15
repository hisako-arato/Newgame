// 絵はすべてここで描く（画像ファイルを持たない）。地形は手続き、人と魔物はドット絵
(function () {
  var T = 16;

  // 地形。walk＝歩ける
  var TILES = {
    '#': { walk: false }, ' ': { walk: false }, 'W': { walk: false }, 'H': { walk: false }, 'R': { walk: false },
    't': { walk: false }, 'w': { walk: false }, 'k': { walk: false }, 'B': { walk: false }, 'C': { walk: false },
    'S': { walk: false }, 'a': { walk: false }, 'q': { walk: false }, 'T': { walk: false }, 'x': { walk: false },
    'g': { walk: true }, 'p': { walk: true }, 'f': { walk: true }, 'b': { walk: true }, 'D': { walk: true },
    'o': { walk: true }, 's': { walk: true }, 'U': { walk: true }, 'M': { walk: true }, 'c': { walk: true },
    'l': { walk: true }, 'e': { walk: true }, 'A': { walk: false },
    'z': { walk: true }, 'r': { walk: false }, 'P': { walk: false }, 'm': { walk: true }
  };

  // 同じマスはいつも同じ模様になるよう、座標から乱数を作る
  function rnd(x, y, i) {
    var n = Math.sin(x * 127.1 + y * 311.7 + i * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function rect(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function specks(c, ox, oy, tx, ty, cols, n) {
    for (var i = 0; i < n; i++) {
      rect(c, cols[i % cols.length], ox + Math.floor(rnd(tx, ty, i) * 15), oy + Math.floor(rnd(tx, ty, i + 9) * 15), 1, 1);
    }
  }
  function grass(c, ox, oy, tx, ty, dark) {
    rect(c, dark ? '#2f5a3a' : '#4c8a4a', ox, oy, T, T);
    specks(c, ox, oy, tx, ty, dark ? ['#27492f', '#3c6e46'] : ['#3f7740', '#63a35a', '#3f7740'], 7);
  }
  function stone(c, ox, oy, a, b) {
    rect(c, a, ox, oy, T, T);
    c.fillStyle = b;
    c.fillRect(ox, oy + 7, T, 1); c.fillRect(ox, oy + 15, T, 1);
    c.fillRect(ox + 7, oy, 1, 7); c.fillRect(ox + 3, oy + 8, 1, 7); c.fillRect(ox + 11, oy + 8, 1, 7);
  }

  function drawTile(c, ch, ox, oy, tx, ty) {
    switch (ch) {
      case 'g': grass(c, ox, oy, tx, ty); break;
      case 'f': grass(c, ox, oy, tx, ty, true); break;
      case 'p':
        rect(c, '#b79a6a', ox, oy, T, T);
        specks(c, ox, oy, tx, ty, ['#a3875a', '#c9ae80'], 6); break;
      case 't':
        grass(c, ox, oy, tx, ty, true);
        rect(c, '#5a3d24', ox + 7, oy + 10, 2, 5);
        rect(c, '#1f4a2a', ox + 2, oy + 3, 12, 8);
        rect(c, '#2c6a38', ox + 4, oy + 1, 8, 8);
        rect(c, '#3d8548', ox + 5, oy + 2, 3, 3); break;
      case 'w':
        rect(c, '#2a5a9a', ox, oy, T, T);
        rect(c, '#4a82c4', ox + 2 + Math.floor(rnd(tx, ty, 1) * 6), oy + 4, 5, 1);
        rect(c, '#4a82c4', ox + 6 + Math.floor(rnd(tx, ty, 2) * 5), oy + 11, 4, 1); break;
      case 'b':
        rect(c, '#2a5a9a', ox, oy, T, T);
        rect(c, '#8a6a42', ox + 1, oy, 14, T);
        c.fillStyle = '#6b5032';
        for (var i = 0; i < 4; i++) c.fillRect(ox + 1, oy + i * 4 + 3, 14, 1);
        rect(c, '#4d3922', ox + 1, oy, 1, T); rect(c, '#4d3922', ox + 14, oy, 1, T); break;
      case 'W': stone(c, ox, oy, '#7c7f8c', '#555866'); rect(c, '#9fa3b0', ox, oy, T, 1); break;
      case '#': stone(c, ox, oy, '#3d3a48', '#27252f'); break;
      case 'H':
        rect(c, '#c9b592', ox, oy, T, T);
        rect(c, '#8a6f4a', ox, oy, T, 2); rect(c, '#8a6f4a', ox, oy, 1, T); rect(c, '#8a6f4a', ox + 15, oy, 1, T);
        if (rnd(tx, ty, 3) > 0.45) { rect(c, '#3a3040', ox + 5, oy + 5, 6, 6); rect(c, '#ffd77a', ox + 6, oy + 6, 4, 4); }
        break;
      case 'R':
        rect(c, '#8a3f3a', ox, oy, T, T);
        c.fillStyle = '#6b2e2c';
        for (var j = 0; j < 4; j++) c.fillRect(ox, oy + j * 4 + 3, T, 1);
        break;
      case 'D':
        rect(c, '#c9b592', ox, oy, T, T);
        rect(c, '#4d3320', ox + 3, oy + 1, 10, 15); rect(c, '#6e4a2c', ox + 4, oy + 2, 8, 14);
        rect(c, '#ffd77a', ox + 10, oy + 9, 1, 2); break;
      case 'o':
        rect(c, '#7a5a3c', ox, oy, T, T);
        c.fillStyle = '#634830';
        c.fillRect(ox, oy + 5, T, 1); c.fillRect(ox, oy + 11, T, 1);
        c.fillRect(ox + (tx % 2 ? 4 : 10), oy, 1, 5); c.fillRect(ox + (tx % 2 ? 11 : 6), oy + 6, 1, 5); break;
      case 's': stone(c, ox, oy, '#5d5a6a', '#4b4857'); break;
      case 'k':
        rect(c, '#7a5a3c', ox, oy, T, T);
        rect(c, '#4d3320', ox, oy + 3, T, 12); rect(c, '#9a7448', ox, oy + 2, T, 4); rect(c, '#b88d5c', ox, oy + 2, T, 1); break;
      case 'B':
        stone(c, ox, oy, '#5d5a6a', '#4b4857');
        rect(c, '#4d3320', ox + 1, oy + 1, 14, 14); rect(c, '#7d4a52', ox + 2, oy + 6, 12, 8); rect(c, '#e6e1d6', ox + 3, oy + 2, 10, 4); break;
      case 'C':
        stone(c, ox, oy, '#5d5a6a', '#4b4857');
        rect(c, '#22222a', ox + 2, oy + 6, 12, 8); rect(c, '#33333d', ox + 1, oy + 5, 14, 2);
        rect(c, '#58d08a', ox + 3, oy + 6, 10, 2); rect(c, '#a8f0c0', ox + 5, oy + 3, 1, 2); rect(c, '#a8f0c0', ox + 9, oy + 1, 1, 3);
        rect(c, '#e2622a', ox + 4, oy + 14, 3, 2); rect(c, '#f0a030', ox + 8, oy + 14, 3, 2); break;
      case 'S':
        rect(c, '#4d3320', ox, oy, T, T);
        rect(c, '#2e1f14', ox + 1, oy + 1, 14, 6); rect(c, '#2e1f14', ox + 1, oy + 8, 14, 7);
        var cols = ['#a04040', '#4060a0', '#c9a544', '#407a50', '#8a5aa0'];
        for (var b = 0; b < 6; b++) {
          rect(c, cols[Math.floor(rnd(tx, ty, b) * 5)], ox + 2 + b * 2, oy + 2, 2, 5);
          rect(c, cols[Math.floor(rnd(tx, ty, b + 6) * 5)], ox + 2 + b * 2, oy + 9, 2, 6);
        }
        break;
      case 'a':
        drawTile(c, 'o', ox, oy, tx, ty);
        rect(c, '#9a7448', ox + 2, oy + 3, 12, 8); rect(c, '#6e4a2c', ox + 3, oy + 11, 2, 4); rect(c, '#6e4a2c', ox + 11, oy + 11, 2, 4);
        rect(c, '#ffd77a', ox + 7, oy + 4, 2, 3); break;
      case 'q':
        drawTile(c, 'o', ox, oy, tx, ty);
        rect(c, '#6e4a2c', ox + 3, oy + 2, 10, 13); rect(c, '#3a3040', ox + 3, oy + 5, 10, 1); rect(c, '#3a3040', ox + 3, oy + 11, 10, 1); break;
      case 'U':
        stone(c, ox, oy, '#5d5a6a', '#4b4857');
        for (var u = 0; u < 4; u++) rect(c, ['#8a8798', '#757284', '#605d6e', '#4b4857'][u], ox + 2, oy + 12 - u * 4, 12, 4);
        break;
      case 'M':
        grass(c, ox, oy, tx, ty, true);
        c.strokeStyle = '#b6a2ff'; c.lineWidth = 1;
        c.beginPath(); c.arc(ox + 8, oy + 8, 6.5, 0, 7); c.stroke();
        c.beginPath(); c.arc(ox + 8, oy + 8, 3.5, 0, 7); c.stroke();
        rect(c, '#e9e2ff', ox + 7, oy + 7, 2, 2); break;
      case 'c':
        rect(c, '#8a2f3a', ox, oy, T, T);
        rect(c, '#c9a544', ox, oy, 1, T); rect(c, '#c9a544', ox + 15, oy, 1, T); break;
      case 'T':
        stone(c, ox, oy, '#5d5a6a', '#4b4857');
        rect(c, '#c9a544', ox + 2, oy, 12, 16); rect(c, '#8a2f3a', ox + 4, oy + 3, 8, 11); rect(c, '#f0d77a', ox + 2, oy, 12, 2); break;
      case 'l':
        rect(c, '#d8dde8', ox, oy, T, T);
        specks(c, ox, oy, tx, ty, ['#c2c8d6', '#eef1f7', '#b4bccc'], 8);
        if (rnd(tx, ty, 5) > 0.7) rect(c, '#a9b2c4', ox + 3, oy + 8, 9, 1);
        break;
      case 'z':
        // 雷で焼けた土
        rect(c, '#4a4038', ox, oy, T, T);
        specks(c, ox, oy, tx, ty, ['#3a312b', '#5c5046', '#2c2520'], 8);
        if (rnd(tx, ty, 4) > 0.8) rect(c, '#e8c84a', ox + 5 + Math.floor(rnd(tx, ty, 6) * 6), oy + 6, 1, 1);
        break;
      case 'r':
        drawTile(c, 'z', ox, oy, tx, ty);
        rect(c, '#6a625a', ox + 2, oy + 5, 12, 9); rect(c, '#8a8278', ox + 4, oy + 3, 7, 5); rect(c, '#4c463f', ox + 2, oy + 12, 12, 2);
        break;
      case 'm':
        // 湿地のぬかるみ
        rect(c, '#3f5a4c', ox, oy, T, T);
        specks(c, ox, oy, tx, ty, ['#34493e', '#54705f', '#2c4038'], 8);
        break;
      case 'P':
        // 壁に掛かった古い肖像画
        stone(c, ox, oy, '#3d3a48', '#27252f');
        rect(c, '#c9a544', ox + 3, oy + 2, 10, 12); rect(c, '#2b3350', ox + 4, oy + 3, 8, 10);
        rect(c, '#e8c4a0', ox + 6, oy + 5, 4, 4); rect(c, '#cfd3dc', ox + 6, oy + 4, 4, 2); rect(c, '#1c2030', ox + 5, oy + 9, 6, 4);
        break;
      case 'A':
        // 祭壇。白い石の台に、青く光る小瓶
        stone(c, ox, oy, '#5d5a6a', '#4b4857');
        rect(c, '#d8dde8', ox + 1, oy + 7, 14, 8); rect(c, '#f4f6fb', ox, oy + 5, 16, 3); rect(c, '#a9b2c4', ox + 1, oy + 14, 14, 1);
        rect(c, '#7ae0ff', ox + 7, oy + 1, 2, 4); rect(c, '#e9fbff', ox + 7, oy, 2, 1); break;
      case 'e':
        // となりの場所へ続く通り道。雲の床に青い印
        drawTile(c, 'l', ox, oy, tx, ty);
        rect(c, '#7fbfe6', ox + 2, oy + 7, 12, 2); rect(c, '#7fbfe6', ox + 7, oy + 2, 2, 12);
        rect(c, '#bfe0f4', ox + 6, oy + 6, 4, 4); break;
      case 'x':
        drawTile(c, 'l', ox, oy, tx, ty);
        rect(c, '#8f97aa', ox + 1, oy + 6, 14, 9); rect(c, '#b4bccc', ox + 3, oy + 2, 5, 8); rect(c, '#6f7689', ox + 9, oy + 9, 5, 6);
        rect(c, '#6f7689', ox + 4, oy + 5, 1, 4); break;
      default:
        rect(c, '#0b0d16', ox, oy, T, T);
    }
  }

  // 人のひな形（正面）。H髪 S肌 E目 C服 D脚 B靴 K冠・帽子 L長い髪
  var HUMAN = [
    '................',
    '.....KKKKKK.....',
    '....HHHHHHHH....',
    '....HHHHHHHH....',
    '...LHSSSSSSHL...',
    '...LSESSSSESL...',
    '...LSSSSSSSSL...',
    '...L.SSSSSS.L...',
    '...LCCCCCCCCL...',
    '...CCCCCCCCCC...',
    '...SCCCCCCCCS...',
    '...SCCCCCCCCS...',
    '....CCCCCCCC....',
    '....DDD..DDD....',
    '....DDD..DDD....',
    '....BBB..BBB....'
  ];
  var PEOPLE = {
    hero:        { H: '#cfd3dc', S: '#e8c4a0', E: '#2a2a3a', C: '#2b3350', D: '#1c2030', B: '#3a2a20' },
    master:      { H: '#8a8a8a', S: '#d9b08c', E: '#222', C: '#e6e1d6', D: '#3a3040', B: '#222' },
    drunk:       { H: '#7a4a2a', S: '#e0a890', E: '#222', C: '#7a5a3a', D: '#4a3a2a', B: '#222' },
    liese:       { H: '#e6c85a', S: '#f0cfae', E: '#2a4a8a', C: '#8fa3c4', D: '#5a6a8a', B: '#3a3a4a', L: '#e6c85a' },
    mina:        { H: '#a05a3a', S: '#f0cfae', E: '#2a5a3a', C: '#3f8a5a', D: '#2a5a3a', B: '#3a2a20', L: '#a05a3a' },
    merchant:    { H: '#3a2a20', S: '#d9b08c', E: '#222', C: '#b8763a', D: '#5a3d24', B: '#222', K: '#c9a544' },
    townsman:    { H: '#4a3a2a', S: '#e0b896', E: '#222', C: '#5a7a9a', D: '#3a4a5a', B: '#222' },
    girl:        { H: '#c97a4a', S: '#f4d6b8', E: '#222', C: '#d98aa0', D: '#a05a70', B: '#5a3d24', L: '#c97a4a' },
    guard:       { H: '#7c7f8c', S: '#e0b896', E: '#222', C: '#6a7088', D: '#4a4e60', B: '#2a2a34', K: '#9fa3b0' },
    adventurer:  { H: '#b0402a', S: '#e8c4a0', E: '#222', C: '#4a6a4a', D: '#3a3a2a', B: '#222' },
    adventurer2: { H: '#d8d8d8', S: '#c9a080', E: '#222', C: '#5a4a6a', D: '#3a3040', B: '#222' },
    king:        { H: '#e8e8e8', S: '#e0b896', E: '#222', C: '#a02f3a', D: '#6b1f28', B: '#3a2a20', K: '#f0c84a' },
    bard:        { H: '#7ac0a0', S: '#f0cfae', E: '#2a5a4a', C: '#3a6a8a', D: '#2a4a5a', B: '#3a2a20', K: '#c9a544' },
    hanna:       { H: '#e8e8ee', S: '#e0c0a8', E: '#222', C: '#7a5a7a', D: '#5a3f5a', B: '#3a2a20', L: '#e8e8ee' },
    smith:       { H: '#2a2a2a', S: '#c8966e', E: '#222', C: '#5a4a3a', D: '#3a3028', B: '#222' },
    mage:        { H: '#3a2a4a', S: '#e0b896', E: '#222', C: '#6a4a9a', D: '#4a3470', B: '#222', K: '#8a6ac4', L: '#6a4a9a' },
    riko:        { H: '#d98a3a', S: '#f6d8bc', E: '#3a6a3a', C: '#5a9a6a', D: '#3a6a4a', B: '#5a3d24', L: '#d98a3a', K: '#e6c85a' },
    amelia:      { H: '#bfe0f4', S: '#fbe6d6', E: '#4a7ac4', C: '#f4f6fb', D: '#d8dde8', B: '#c2c8d6', L: '#bfe0f4' }
  };
  // 物のドット絵
  var THINGS = {
    sign: { pal: { a: '#8a6a42', b: '#5a3d24', c: '#e6d6b0' }, art: [
      '................', '................', '..aaaaaaaaaaaa..', '..acccccccccca..', '..acbbbbbbbbca..', '..acccccccccca..',
      '..acbbbbbbcca...', '..acccccccccca..', '..aaaaaaaaaaaa..', '.......bb.......', '.......bb.......', '.......bb.......',
      '.......bb.......', '.......bb.......', '......bbbb......', '................'] },
    gekko: { pal: { a: '#9fe0c0', b: '#4aa07a', c: '#f4fff8' }, art: [
      '................', '................', '................', '................', '.......c........', '......cac.......',
      '..c....a....c...', '.cac...b...cac..', '..a..b.b.b..a...', '..b..bbbbb..b...', '..bb..bbb..bb...', '...bb.bbb.bb....',
      '....bbbbbbb.....', '.....bbbbb......', '......bbb.......', '................'] },
    akami: { pal: { a: '#d0303a', b: '#2f5a3a', c: '#ff8a90' }, art: [
      '................', '................', '................', '.....bbbbbb.....', '...bbbbbbbbbb...', '..bbbabbbbabbb..',
      '..bbacabbacabb..', '.bbbbabbbbabbbb.', '.bbbbbbabbbbbbb.', '.bbabbacabbabbb.', '..bacabbabacabb.', '..bbabbbbbbabb..',
      '...bbbbbbbbbb...', '.....bbbbbb.....', '................', '................'] },
    grave: { pal: { a: '#7a8078', b: '#565c56', c: '#a4aaa0', g: '#4c8a4a', f: '#f4f0d0' }, art: [
      '................', '................', '.....aaaaaa.....', '....accccccb....', '....acaaaacb....', '....accaaccb....',
      '....acaccacb....', '....acaaaacb....', '....accccccb....', '....acaaaacb....', '....acaaaacb....', '....accccccb....',
      '...gabbbbbbbg...', '..ggbbbbbbbbgf..', '..gggggggggggg..', '................'] },
    chest: { pal: { a: '#8a5a2a', b: '#5a3a1a', c: '#e6c04a' }, art: [
      '................', '................', '................', '................', '..bbbbbbbbbbbb..', '.baaaaaaaaaaaab.',
      '.baaaaaaaaaaaab.', '.bccccccccccccb.', '.baaaaaccaaaaab.', '.baaaaaccaaaaab.', '.baaaaaaaaaaaab.', '.baaaaaaaaaaaab.',
      '.bbbbbbbbbbbbbb.', '................', '................', '................'] },
    // 鉱石と雷晶は同じ形で、色だけ変える
    tetsu: { pal: { a: '#3a3a44', b: '#55525e', c: '#8a8794' }, art: ['................', '................', '................', '......aa........', '.....acca..a....', '....acccaaaca...', '...accccaaccca..', '...acbccacccba..', '..accbbcacbbcca.', '..acbbbcccbbbca.', '.acccbbccccbbcca', '.accccccbccccccb', '.bbccccbbbcccbb.', '..bbbbbbbbbbbb..', '................', '................'] },
    gin: { pal: { a: '#7a8496', b: '#aab4c6', c: '#e6ecf6' }, art: ['................', '................', '................', '......aa........', '.....acca..a....', '....acccaaaca...', '...accccaaccca..', '...acbccacccba..', '..accbbcacbbcca.', '..acbbbcccbbbca.', '.acccbbccccbbcca', '.accccccbccccccb', '.bbccccbbbcccbb.', '..bbbbbbbbbbbb..', '................', '................'] },
    raisho: { pal: { a: '#a8841a', b: '#e8c84a', c: '#fff4b0' }, art: ['................', '................', '................', '......aa........', '.....acca..a....', '....acccaaaca...', '...accccaaccca..', '...acbccacccba..', '..accbbcacbbcca.', '..acbbbcccbbbca.', '.acccbbccccbbcca', '.accccccbccccccb', '.bbccccbbbcccbb.', '..bbbbbbbbbbbb..', '................', '................'] },
    nemuri: { pal: { a: '#6a5aa0', b: '#9a8ad0', c: '#e6dcc8', d: '#bfb39a' }, art: [
      '................', '................', '................', '................', '................', '......aaaa......',
      '....aabbbbaa....', '...abbbbbbbba...', '...abbabbabba...', '....aaaaaaaa....', '......cccc......', '......cccc......',
      '......cccc......', '.....dccccd.....', '................', '................'] },
    rubble: { pal: { a: '#8f97aa', b: '#6f7689', c: '#b4bccc' }, art: [
      '................', '................', '......cc........', '.....ccca.......', '.....ccaa.......', '.....caaa..c....',
      '.....caab.cca...', '....ccaab.caa...', '....caaabccaab..', '...ccaaabcaaab..', '..ccaaaabaaaabb.', '..caaaaabaaaabb.',
      '.caaabaaaaabaab.', '.aaabbaaabbbaab.', 'aabbbbbbbbbbbbbb', '................'] }
  };

  function paint(c, art, pal, ox, oy, sc, flip) {
    for (var y = 0; y < art.length; y++) {
      var row = art[y];
      for (var x = 0; x < row.length; x++) {
        var col = pal[row.charAt(x)];
        if (!col) continue;
        c.fillStyle = col;
        c.fillRect(ox + (flip ? row.length - 1 - x : x) * sc, oy + y * sc, sc, sc);
      }
    }
  }

  // 色ちがいの魔物は、like で指した魔物の絵を借りる
  function artOf(m) { return m.art || G.data.monsters[m.like].art; }

  // 人：向きと歩きの2コマをその場で作る
  function humanArt(dir, frame) {
    var a = HUMAN.slice();
    if (dir === 'up') {
      for (var y = 4; y <= 6; y++) a[y] = a[y].replace(/[SE]/g, 'H');
    } else if (dir === 'left') {
      a[5] = '...LSESSSSSSL...';
    } else if (dir === 'right') {
      a[5] = '...LSSSSSSESL...';
    }
    if (frame) { a[14] = '....DDD.........'; a[15] = '....BBB..DDD....'; }
    return a;
  }

  G.sprites = {
    T: T, TILES: TILES, PEOPLE: PEOPLE, THINGS: THINGS,
    walkable: function (ch) { return !!(TILES[ch] && TILES[ch].walk); },
    // 地図をまるごと1枚に描いておく（毎フレーム描き直さない）
    renderMap: function (map) {
      var cv = document.createElement('canvas');
      cv.width = map.rows[0].length * T; cv.height = map.rows.length * T;
      var c = cv.getContext('2d');
      for (var y = 0; y < map.rows.length; y++)
        for (var x = 0; x < map.rows[y].length; x++) drawTile(c, map.rows[y].charAt(x), x * T, y * T, x, y);
      return cv;
    },
    draw: function (c, name, px, py, dir, frame) {
      if (PEOPLE[name]) { paint(c, humanArt(dir || 'down', frame), PEOPLE[name], px, py, 1); return; }
      if (THINGS[name]) { paint(c, THINGS[name].art, THINGS[name].pal, px, py, 1); return; }
      var m = G.data.monsters[name];
      if (m) paint(c, artOf(m), m.pal, px, py, 1);
    },
    drawMonster: function (c, id, sc) {
      var m = G.data.monsters[id];
      c.clearRect(0, 0, c.canvas.width, c.canvas.height);
      if (m.person) paint(c, humanArt('down', 0), PEOPLE[m.person], 0, 0, sc);
      else paint(c, artOf(m), m.pal, 0, 0, sc);
    }
  };
})();
