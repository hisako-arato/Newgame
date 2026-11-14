// 戦闘。1対1のターン制。相手が「力をためた」次の番は大技が来るので、ぼうぎょで受ける
(function () {
  var $ = G.util.$, sleep = G.util.sleep;
  var en, guard, fast;

  function vary(v) { return Math.max(1, Math.round(v * (0.85 + Math.random() * 0.3))); }
  async function log(t) {
    var box = $('bLog'), p = document.createElement('div');
    p.textContent = t; box.appendChild(p);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    await sleep(fast ? 120 : 620);
    fast = false;
  }
  function bars() {
    var s = G.state, st = G.stats();
    $('bHpBar').style.width = Math.max(0, en.hp / en.max * 100) + '%';
    $('bHero').textContent = 'カイン　Lv' + s.lv + '　HP ' + s.hp + '/' + st.maxhp + '　SP ' + s.sp + '/' + st.maxsp;
    G.ui.hud();
  }
  function shake(id) {
    var e = $(id); e.classList.remove('hit'); void e.offsetWidth; e.classList.add('hit');
  }
  async function hitEnemy(dmg, word) {
    en.hp -= dmg; shake('bCanvas'); bars();
    await log(en.name + ' に ' + dmg + ' のダメージ' + (word || '') + '！');
  }
  function physical(rate) { return vary((G.stats().atk - en.def / 2) * rate); }

  // 行動を選ぶ。もどるを選んだら最初の選択に戻る
  async function choose() {
    var s = G.state;
    for (;;) {
      var i = await G.ui.list('', [
        { label: 'こうげき' }, { label: 'わざ' }, { label: 'くすり' }, { label: 'ぼうぎょ' },
        { label: 'にげる', disabled: !!en.boss }
      ], { cancel: false, grid: true });
      if (i === 0) return { type: 'attack' };
      if (i === 3) return { type: 'guard' };
      if (i === 4) return { type: 'run' };
      if (i === 1) {
        var sk = G.data.skills.filter(function (k) { return k.lv <= s.lv; });
        var j = await G.ui.list('わざ・魔法', sk.map(function (k) {
          return { label: k.name + '（SP' + k.sp + '）', sub: k.desc, disabled: s.sp < k.sp };
        }));
        if (j >= 0) return { type: 'skill', skill: sk[j] };
      }
      if (i === 2) {
        var ids = Object.keys(s.items).filter(function (id) { var t = G.data.items[id].type; return t === 'potion' || t === 'bomb'; });
        if (!ids.length) { await log('使える薬を持っていない。'); continue; }
        var k2 = await G.ui.list('くすり', ids.map(function (id) {
          return { label: G.data.items[id].name + ' ×' + s.items[id], sub: G.data.items[id].desc };
        }));
        if (k2 >= 0) return { type: 'item', id: ids[k2] };
      }
    }
  }

  async function heroTurn(a) {
    var s = G.state, st = G.stats();
    guard = false;
    if (a.type === 'attack') {
      await log('カインの攻撃！');
      await hitEnemy(physical(1));
    } else if (a.type === 'guard') {
      guard = true;
      await log('カインは身を守っている。');
    } else if (a.type === 'skill') {
      var k = a.skill; s.sp -= k.sp;
      await log('カインは ' + k.name + ' を使った！');
      if (k.kind === 'magic') {
        var weak = en.weak === k.elem;
        await hitEnemy(vary((k.pow + s.lv * 3) * (weak ? 1.5 : 1)), weak ? '。弱点だ' : '');
      } else if (k.kind === 'multi') {
        for (var h = 0; h < k.hits && en.hp > 0; h++) await hitEnemy(physical(k.rate));
      } else if (k.kind === 'break') {
        await hitEnemy(physical(k.rate));
        if (en.hp > 0) { en.def = Math.max(0, Math.round(en.def * 0.6)); await log(en.name + ' の守りが下がった。'); }
      } else if (k.kind === 'heal') {
        var v = Math.round(st.maxhp * k.rate);
        s.hp = Math.min(st.maxhp, s.hp + v); bars();
        await log('HPが ' + v + ' 回復した。');
      } else {
        await hitEnemy(physical(k.rate));
      }
    } else if (a.type === 'item') {
      var it = G.data.items[a.id];
      G.addItem(a.id, -1);
      await log('カインは ' + it.name + ' を使った。');
      if (it.heal) { s.hp = Math.min(st.maxhp, s.hp + it.heal); bars(); await log('HPが ' + it.heal + ' 回復した。'); }
      if (it.sp) { s.sp = Math.min(st.maxsp, s.sp + it.sp); bars(); await log('SPが ' + it.sp + ' 回復した。'); }
      if (it.dmg) {
        var w = en.weak === it.elem;
        await hitEnemy(vary(it.dmg * (w ? 1.5 : 1)), w ? '。弱点だ' : '');
      }
    }
  }

  async function enemyTurn() {
    var s = G.state, st = G.stats();
    var rate = 1;
    if (en.charging) {
      en.charging = false; rate = 2.2;
      await log(en.name + ' の渾身の一撃！');
    } else if (en.charge && Math.random() < en.charge) {
      en.charging = true;
      await log(en.name + ' は低くうなり、力をためている……');
      return;
    } else {
      await log(en.name + ' の攻撃！');
    }
    var dmg = vary(en.atk * rate - st.def / 2);
    if (guard) dmg = Math.max(1, Math.round(dmg * 0.4));
    s.hp = Math.max(0, s.hp - dmg); shake('bHero'); bars();
    await log('カインは ' + dmg + ' のダメージを受けた' + (guard ? '（ぼうぎょ）' : '') + '。');
  }

  async function win() {
    var s = G.state, m = en.src;
    await log(en.name + ' を倒した！');
    s.exp += m.exp; s.gold += m.gold;
    await log('経験値 ' + m.exp + '、' + m.gold + 'G を手に入れた。');
    for (var i = 0; i < (m.drops || []).length; i++) {
      var d = m.drops[i];
      if (Math.random() < d.rate) { G.addItem(d.item, 1); await log(G.data.items[d.item].name + ' を拾った。'); }
    }
    // 受けている討伐依頼を数える
    G.data.quests.forEach(function (q) {
      var st = s.quests[q.id];
      if (st && st.state === 'active' && q.type === 'kill' && q.target === en.id) st.count = Math.min(q.need, (st.count || 0) + 1);
    });
    while (s.exp >= G.needExp(s.lv)) {
      s.exp -= G.needExp(s.lv); s.lv++;
      var st2 = G.stats(); s.hp = st2.maxhp; s.sp = st2.maxsp; bars();
      await log('レベルが ' + s.lv + ' になった。身体が、剣を思い出していく。');
      var learned = G.data.skills.filter(function (k) { return k.lv === s.lv; });
      for (var j = 0; j < learned.length; j++) await log('「' + learned[j].name + '」を思い出した！');
    }
    await sleep(500);
  }

  // 負けても終わらない。主人公は死ねないので、隠れ家で目を覚ます
  async function lose() {
    var s = G.state;
    await log('カインは倒れた……');
    await G.ui.fade('out');
    $('battle').hidden = true;
    s.deaths++;
    G.field.warp('lair', 2, 3, 'down');
    var st = G.stats(); s.hp = st.maxhp; s.sp = st.maxsp;
    await G.ui.say('', '——致命傷だった。\nそれでも心臓は、勝手にまた動きはじめる。');
    await G.ui.say('カイン', '……また、死ねなかった。');
    await G.ui.fade('in');
  }

  G.battle = {
    start: async function (id) {
      var m = G.data.monsters[id];
      en = { id: id, src: m, name: m.name, hp: m.hp, max: m.hp, atk: m.atk, def: m.def, weak: m.weak, charge: m.charge, boss: m.boss, charging: false };
      guard = false;
      var cv = $('bCanvas');
      cv.className = m.boss ? 'boss' : '';
      G.sprites.drawMonster(cv.getContext('2d'), id, 4);
      $('bName').textContent = m.name;
      $('bLog').innerHTML = '';
      $('battle').hidden = false;
      $('battle').onclick = function () { fast = true; };
      bars();
      await log(m.name + ' があらわれた！');
      for (;;) {
        var a = await choose();
        if (a.type === 'run') {
          if (Math.random() < 0.65) { await log('うまく逃げきった。'); $('battle').hidden = true; return 'run'; }
          await log('逃げられなかった！');
        } else {
          await heroTurn(a);
        }
        if (en.hp <= 0) { await win(); $('battle').hidden = true; return 'win'; }
        await enemyTurn();
        if (G.state.hp <= 0) { await lose(); return 'lose'; }
      }
    }
  };
})();
