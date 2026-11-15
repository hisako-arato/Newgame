// 戦闘。味方（1〜2人）対 魔物1体のターン制。
// 幅を出す仕掛け：弱点の属性（炎・氷・雷）、相手の「ため」とぼうぎょ、
// 味方を強める薬（攻撃↑）、みんなを守る薬（受ける傷↓）、相手を弱める技（守り↓・攻撃↓）
(function () {
  var $ = G.util.$, sleep = G.util.sleep;
  var en, guard, fast;   // guard：この番に身を守っている味方
  var buff, shield;      // buff[id]：攻撃が上がっている残りの番／shield：みんなが守られている残りの番
  var ELEM = { fire: '炎', ice: '氷', thunder: '雷' };

  function vary(v) { return Math.max(1, Math.round(v * (0.85 + Math.random() * 0.3))); }
  function N(id) { return G.NAMES[id]; }
  function alive() { return G.party().filter(function (id) { return G.hp(id) > 0; }); }
  function skillsOf(id) {
    return G.data.skills.filter(function (k) { return (k.who || 'hero') === id && k.lv <= G.state.lv; });
  }

  async function log(t) {
    var box = $('bLog'), p = document.createElement('div');
    p.textContent = t; box.appendChild(p);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    await sleep(fast ? 120 : 620);
    fast = false;
  }
  function bars() {
    $('bHpBar').style.width = Math.max(0, en.hp / en.max * 100) + '%';
    $('bHero').textContent = G.party().map(function (id) {
      var t = G.statsOf(id), tag = G.hp(id) <= 0 ? '　（倒れている）' : (buff[id] ? '　攻↑' : '') + (shield ? '　守↑' : '');
      return N(id) + '　HP ' + G.hp(id) + '/' + t.maxhp + '　SP ' + G.sp(id) + '/' + t.maxsp + tag;
    }).join('\n');
    G.ui.hud();
  }
  function shake(id) {
    var e = $(id); e.classList.remove('hit'); void e.offsetWidth; e.classList.add('hit');
  }
  async function hitEnemy(dmg, word) {
    en.hp -= dmg; shake('bCanvas'); bars();
    await log(en.name + ' に ' + dmg + ' のダメージ' + (word || '') + '！');
  }
  function physical(id, rate) { return vary((G.statsOf(id).atk * (buff[id] ? 1.4 : 1) - en.def / 2) * rate); }
  function magicDmg(k) { return (k.pow + G.state.lv * 3) * (en.weak === k.elem ? 1.5 : 1); }

  // 回復や薬の相手を選ぶ。ひとりなら聞かない。倒れている仲間は戦闘中は起こせない
  async function pickAlly() {
    var pt = alive();
    if (G.party().length < 2) return pt[0];
    var i = await G.ui.list('だれに？', pt.map(function (id) {
      return { label: N(id), sub: 'HP ' + G.hp(id) + '/' + G.statsOf(id).maxhp };
    }));
    return i < 0 ? null : pt[i];
  }

  // おまかせの仲間が自分で決める。人が選ぶときと同じ技しか使わない
  function think(id) {
    var sk = skillsOf(id).filter(function (k) { return G.sp(id) >= k.sp; });
    var by = function (kind) { return sk.filter(function (k) { return k.kind === kind; }); };
    // 相手がためているときは、身を守る
    if (en.charging) return { type: 'guard' };
    // だれかが危なければ回復
    var low = alive().filter(function (a) { return G.hp(a) < G.statsOf(a).maxhp * 0.45; })
      .sort(function (a, b) { return G.hp(a) / G.statsOf(a).maxhp - G.hp(b) / G.statsOf(b).maxhp; })[0];
    var lows = alive().filter(function (a) { return G.hp(a) < G.statsOf(a).maxhp * 0.5; }).length;
    if (lows >= 2 && by('healall').length) return { type: 'skill', skill: by('healall')[0] };
    if (low && by('heal').length) return { type: 'skill', skill: by('heal').sort(function (a, b) { return b.rate - a.rate; })[0], to: low };
    // 強い相手には、先に備える（カインの攻撃を上げる・みんなを守る・相手を弱める）
    if (en.boss || en.max >= 150) {
      if (by('shield').length && !shield) return { type: 'skill', skill: by('shield')[0] };
      if (by('buff').length && G.hp('hero') > 0 && !buff.hero) return { type: 'skill', skill: by('buff')[0], to: 'hero' };
      if (by('weaken').length && !en.weakened) return { type: 'skill', skill: by('weaken')[0] };
    }
    // いちばん効く魔法。SP は回復のぶんを少し残す
    var keep = by('heal').length ? by('heal')[0].sp : 0;
    var mg = by('magic').filter(function (k) { return G.sp(id) - k.sp >= keep || en.hp <= magicDmg(k); })
      .sort(function (a, b) { return magicDmg(b) - magicDmg(a); })[0];
    if (mg && magicDmg(mg) > G.statsOf(id).atk - en.def / 2) return { type: 'skill', skill: mg };
    return { type: 'attack' };
  }

  // 行動を選ぶ。もどるを選んだら最初の選択に戻る
  async function choose(id) {
    var s = G.state;
    if (id !== 'hero' && s.auto) return think(id);
    for (;;) {
      var i = await G.ui.list(N(id) + 'は どうする？', [
        { label: 'こうげき' }, { label: 'わざ' }, { label: 'くすり' }, { label: 'ぼうぎょ' },
        { label: 'にげる', disabled: !!en.boss }
      ], { cancel: false, grid: true });
      if (i === 0) return { type: 'attack' };
      if (i === 3) return { type: 'guard' };
      if (i === 4) return { type: 'run' };
      if (i === 1) {
        var sk = skillsOf(id);
        var j = await G.ui.list('わざ・魔法', sk.map(function (k) {
          return { label: k.name + '（SP' + k.sp + '）', sub: k.desc, disabled: G.sp(id) < k.sp };
        }));
        if (j < 0) continue;
        var a = { type: 'skill', skill: sk[j] };
        if (sk[j].kind === 'heal' || sk[j].kind === 'buff') { a.to = await pickAlly(); if (!a.to) continue; }
        return a;
      }
      if (i === 2) {
        var ids = Object.keys(s.items).filter(function (x) { var t = G.data.items[x].type; return t === 'potion' || t === 'bomb'; });
        if (!ids.length) { await log('使える薬を持っていない。'); continue; }
        var k2 = await G.ui.list('くすり', ids.map(function (x) {
          return { label: G.data.items[x].name + ' ×' + s.items[x], sub: G.data.items[x].desc };
        }));
        if (k2 < 0) continue;
        var b = { type: 'item', id: ids[k2] };
        if (G.data.items[ids[k2]].type === 'potion') { b.to = await pickAlly(); if (!b.to) continue; }
        return b;
      }
    }
  }

  async function act(id, a) {
    if (a.type === 'attack') {
      await log(N(id) + 'の攻撃！');
      await hitEnemy(physical(id, 1));
    } else if (a.type === 'guard') {
      guard[id] = true;
      await log(N(id) + 'は身を守っている。');
    } else if (a.type === 'skill') {
      var k = a.skill; G.addSp(id, -k.sp);
      await log(N(id) + 'は ' + k.name + ' を使った！');
      if (k.kind === 'magic') {
        await hitEnemy(vary(magicDmg(k)), en.weak === k.elem ? '。' + ELEM[k.elem] + 'が弱点だ' : '');
      } else if (k.kind === 'multi') {
        for (var h = 0; h < k.hits && en.hp > 0; h++) await hitEnemy(physical(id, k.rate));
      } else if (k.kind === 'break') {
        await hitEnemy(physical(id, k.rate));
        if (en.hp > 0) { en.def = Math.max(0, Math.round(en.def * 0.6)); await log(en.name + ' の守りが下がった。'); }
      } else if (k.kind === 'weaken') {
        // 重ねがけで無力にならないよう、元の7割までしか下げない
        en.atk = Math.max(Math.round(en.src.atk * 0.7), Math.round(en.atk * 0.7)); en.weakened = true;
        await log(en.name + ' の攻撃が弱まった。');
      } else if (k.kind === 'heal') {
        var to = G.hp(a.to) > 0 ? a.to : id;
        var v = Math.round(G.statsOf(to).maxhp * k.rate);
        G.addHp(to, v); bars();
        await log(N(to) + 'のHPが ' + v + ' 回復した。');
      } else if (k.kind === 'healall') {
        alive().forEach(function (m) { G.addHp(m, Math.round(G.statsOf(m).maxhp * k.rate)); });
        bars();
        await log('みんなのHPが回復した。');
      } else if (k.kind === 'buff') {
        var bt = G.hp(a.to) > 0 ? a.to : id;
        buff[bt] = 4; bars();
        await log(N(bt) + 'の攻撃が上がった！');
      } else if (k.kind === 'shield') {
        shield = 4; bars();
        await log('みんなの受ける傷が小さくなった！');
      } else {
        await hitEnemy(physical(id, k.rate));
      }
    } else if (a.type === 'item') {
      var it = G.data.items[a.id];
      if (!G.count(a.id)) { await log(it.name + ' はもう残っていない。'); return; }
      G.addItem(a.id, -1);
      await log(N(id) + 'は ' + it.name + ' を使った。');
      var t = a.to && G.hp(a.to) > 0 ? a.to : id;
      if (it.heal) { G.addHp(t, it.heal); bars(); await log(N(t) + 'のHPが ' + it.heal + ' 回復した。'); }
      if (it.sp) { G.addSp(t, it.sp); bars(); await log(N(t) + 'のSPが ' + it.sp + ' 回復した。'); }
      if (it.dmg) {
        var w = en.weak === it.elem;
        await hitEnemy(vary(it.dmg * (w ? 1.5 : 1)), w ? '。' + ELEM[it.elem] + 'が弱点だ' : '');
      }
    }
  }

  async function enemyTurn() {
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
    var pt = alive(), id = pt[G.util.rnd(pt.length)];
    var dmg = vary(en.atk * rate - G.statsOf(id).def / 2);
    if (shield) dmg = Math.max(1, Math.round(dmg * 0.7));
    if (guard[id]) dmg = Math.max(1, Math.round(dmg * 0.4));
    G.addHp(id, -dmg); shake('bHero'); bars();
    await log(N(id) + 'は ' + dmg + ' のダメージを受けた' + (guard[id] ? '（ぼうぎょ）' : '') + '。');
    if (G.hp(id) <= 0 && alive().length) await log(N(id) + 'は倒れた……');
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
    // 倒れた仲間は、戦いが終われば起き上がる
    for (var p = 0; p < G.party().length; p++) {
      var id = G.party()[p];
      if (G.hp(id) <= 0) {
        G.addHp(id, Math.round(G.statsOf(id).maxhp * 0.2)); bars();
        await log(N(id) + (id === 'riko' ? 'は目を覚ました。' : 'は息を吹き返した。'));
      }
    }
    while (s.exp >= G.needExp(s.lv)) {
      s.exp -= G.needExp(s.lv); s.lv++;
      G.fullHeal(); bars();
      await log('レベルが ' + s.lv + ' になった。身体が、剣を思い出していく。');
      var learned = G.data.skills.filter(function (k) { return k.lv === s.lv && G.party().indexOf(k.who || 'hero') >= 0; });
      for (var j = 0; j < learned.length; j++) {
        var who = learned[j].who || 'hero';
        await log(N(who) + 'は「' + learned[j].name + '」を' + (who === 'riko' ? '覚えた！' : '思い出した！'));
      }
    }
    await sleep(500);
  }

  // 負けても終わらない。死ねないので、寝台で目を覚ます
  async function lose() {
    var s = G.state, sky = !!s.flags.amelia && !s.flags.riko;
    await log(G.party().length > 2 ? 'みんな倒れた……' : G.party().length > 1 ? 'ふたりとも倒れた……' : 'カインは倒れた……');
    await G.ui.fade('out');
    $('battle').hidden = true;
    s.deaths++;
    if (sky) G.field.warp('sky', 3, 7, 'left'); else G.field.warp('lair', 2, 3, 'down');
    G.fullHeal();
    await G.ui.say('', '——致命傷だった。\nそれでも心臓は、勝手にまた動きはじめる。');
    if (sky) await G.ui.say('アメリア', '……おはよう。また、死ねなかったわね。わたしたち。');
    else if (s.flags.riko) {
      await G.ui.say('リコ', 'お師匠さま……！　よかった、目を開けた。\nここまで引きずって帰るの、大変だったんですからね。');
      await G.ui.say('カイン', '……また、死ねなかった。');
      await G.ui.say('リコ', 'もう。縁起でもないこと言わないでください。');
    } else await G.ui.say('カイン', '……また、死ねなかった。');
    await G.ui.fade('in');
  }

  G.battle = {
    start: async function (id) {
      var m = G.data.monsters[id];
      en = { id: id, src: m, name: m.name, hp: m.hp, max: m.hp, atk: m.atk, def: m.def, weak: m.weak, charge: m.charge, boss: m.boss, charging: false, weakened: false };
      guard = {}; buff = {}; shield = 0;
      var cv = $('bCanvas');
      cv.className = m.boss ? 'boss' : '';
      G.sprites.drawMonster(cv.getContext('2d'), id, 4);
      $('bName').textContent = m.name;
      $('bLog').innerHTML = '';
      $('battle').hidden = false;
      $('battle').onclick = function () { fast = true; };
      // 倒れたまま戦いに入らないよう、最低限は起こしておく
      G.party().forEach(function (p) { if (G.hp(p) <= 0) G.addHp(p, 1); });
      bars();
      await log(m.name + ' があらわれた！');
      for (;;) {
        // 先に全員の行動を決めてから、順に動く
        var pt = alive(), plan = [], ran = false;
        for (var i = 0; i < pt.length; i++) {
          var a = await choose(pt[i]);
          if (a.type === 'run') { ran = true; break; }
          plan.push([pt[i], a]);
        }
        guard = {};
        if (ran) {
          if (Math.random() < 0.65) { await log('うまく逃げきった。'); $('battle').hidden = true; return 'run'; }
          await log('逃げられなかった！');
        } else {
          for (var j = 0; j < plan.length && en.hp > 0; j++) await act(plan[j][0], plan[j][1]);
        }
        if (en.hp <= 0) { await win(); $('battle').hidden = true; return 'win'; }
        await enemyTurn();
        if (!alive().length) { await lose(); return 'lose'; }
        // 薬の効き目は番ごとに薄れる
        for (var b in buff) if (--buff[b] <= 0) delete buff[b];
        if (shield > 0) shield--;
        bars();
      }
    }
  };
})();
