// メニュー・店・調合・ギルド・タイトル
(function () {
  var ui = G.ui, $ = G.util.$;
  var IT = function (id) { return G.data.items[id]; };

  function needText(need) {
    return Object.keys(need).map(function (id) { return IT(id).name + ' ' + G.count(id) + '/' + need[id]; }).join('、');
  }
  function canMake(r) {
    return Object.keys(r.need).every(function (id) { return G.count(id) >= r.need[id]; });
  }
  function questDone(q) {
    var st = G.state.quests[q.id];
    if (!st || st.state !== 'active') return false;
    return q.type === 'kill' ? (st.count || 0) >= q.need : G.count(q.target) >= q.need;
  }
  function questProgress(q) {
    var st = G.state.quests[q.id] || {};
    return (q.type === 'kill' ? (st.count || 0) : Math.min(q.need, G.count(q.target))) + '/' + q.need;
  }

  G.menu = {
    rest: function () {
      var s = G.state;
      G.fullHeal(); s.gathered = {}; s.rests++;
      ui.hud();
    },

    open: function () {
      if (!G.field.active || G.field.busy) return;
      G.field.run(async function () {
        for (;;) {
          var i = await ui.list('メニュー', [{ label: 'つよさ' }, { label: 'もちもの' }, { label: '依頼' }, { label: 'きろくする' }, { label: '記憶', sub: '思い出したこと ' + G.state.mem.length + '/' + Object.keys(G.data.memories).length }], { cancelLabel: 'とじる' });
          if (i < 0) return;
          if (i === 0) await G.menu.status();
          if (i === 1) await G.menu.items();
          if (i === 2) await G.menu.questLog();
          if (i === 4) await G.menu.memories();
          if (i === 3) await ui.say('', G.save() ? '記録した。（歩いているあいだも自動で記録されます）' : 'この端末では記録できなかった。');
        }
      });
    },

    status: async function () {
      var s = G.state, st = G.stats();
      var sk = G.data.skills.filter(function (k) { return !k.who && k.lv <= s.lv; }).map(function (k) { return k.name; }).join('、');
      await ui.say('カイン',
        'Lv ' + s.lv + '（次まで ' + (G.needExp(s.lv) - s.exp) + '）\n' +
        'HP ' + s.hp + '/' + st.maxhp + '　SP ' + s.sp + '/' + st.maxsp + '\n' +
        '攻撃 ' + st.atk + '（' + IT(s.weapon).name + '）　守り ' + st.def + '（' + IT(s.armor).name + '）\n' +
        'わざ：' + sk + '\n' +
        '死ねなかった回数：' + s.deaths);
      if (s.flags.amelia) {
        var at = G.statsOf('amelia');
        var ask = G.data.skills.filter(function (k) { return k.who === 'amelia' && k.lv <= s.lv; }).map(function (k) { return k.name; }).join('、');
        await ui.say('アメリア',
          'HP ' + s.ahp + '/' + at.maxhp + '　SP ' + s.asp + '/' + at.maxsp + '\n' +
          '攻撃 ' + at.atk + '　守り ' + at.def + '\n' +
          'わざ：' + ask + '\n' +
          'レベルはカインと一緒に上がる。');
      }
    },

    items: async function () {
      var s = G.state;
      for (;;) {
        var ids = Object.keys(s.items);
        if (!ids.length) { await ui.say('', '何も持っていない。'); return; }
        var i = await ui.list('もちもの（' + s.gold + 'G）', ids.map(function (id) {
          return { label: IT(id).name + ' ×' + s.items[id], sub: IT(id).desc, disabled: IT(id).type !== 'potion' };
        }));
        if (i < 0) return;
        var it = IT(ids[i]), who = 'hero', pt = G.party();
        if (pt.length > 1) {
          var w = await ui.list('だれに使う？', pt.map(function (id) {
            return { label: G.NAMES[id], sub: 'HP ' + G.hp(id) + '/' + G.statsOf(id).maxhp + '　SP ' + G.sp(id) + '/' + G.statsOf(id).maxsp };
          }));
          if (w < 0) continue;
          who = pt[w];
        }
        G.addItem(ids[i], -1);
        if (it.heal) G.addHp(who, it.heal);
        if (it.sp) G.addSp(who, it.sp);
        ui.hud();
      }
    },

    questLog: async function () {
      var act = G.data.quests.filter(function (q) { var st = G.state.quests[q.id]; return st && st.state === 'active'; });
      if (!act.length) { await ui.say('', '受けている依頼はない。\nギルドの受付で受けられる。'); return; }
      await ui.say('受けている依頼', act.map(function (q) { return '・' + q.title + '（' + questProgress(q) + '）\n　' + q.desc; }).join('\n'));
    },

    memories: async function () {
      var s = G.state;
      if (!s.mem.length) { await ui.say('', 'まだ何も思い出していない。\n世界を歩くうちに、思い出すことがあるかもしれない。'); return; }
      for (;;) {
        var i = await ui.list('記憶', s.mem.map(function (id) { return { label: G.data.memories[id].title }; }));
        if (i < 0) return;
        var m = G.data.memories[s.mem[i]];
        await ui.say('', '【記憶　' + m.title + '】\n' + m.text);
      }
    },

    // 鍛冶屋：鉱石とお金で装備を打ってもらう
    forge: async function () {
      var s = G.state;
      for (;;) {
        var fs = G.data.forge;
        var i = await ui.list('何を打ってもらう？（所持金 ' + s.gold + 'G）', fs.map(function (f) {
          var it = IT(f.out), own = s.weapon === f.out || s.armor === f.out;
          var up = it.type === 'weapon' ? '攻撃+' + it.atk : '守り+' + it.def;
          return { label: it.name + '（' + up + '）　' + f.gold + 'G', sub: own ? '装備中' : needText(f.need), disabled: own || s.gold < f.gold || !canMake(f) };
        }), { cancelLabel: 'やめる' });
        if (i < 0) return;
        var f = fs[i];
        Object.keys(f.need).forEach(function (id) { G.addItem(id, -f.need[id]); });
        s.gold -= f.gold;
        await G.script.run([['equip', f.out]]);
      }
    },

    brew: async function () {
      for (;;) {
        var rs = G.data.recipes.filter(function (r) { return G.cond(r.cond); });
        var i = await ui.list('何を調合する？', rs.map(function (r) {
          return { label: IT(r.out).name + '（所持 ' + G.count(r.out) + '）', sub: needText(r.need), disabled: !canMake(r) };
        }), { cancelLabel: 'やめる' });
        if (i < 0) return;
        Object.keys(rs[i].need).forEach(function (id) { G.addItem(id, -rs[i].need[id]); });
        G.addItem(rs[i].out, 1);
      }
    },

    shop: async function (id) {
      var s = G.state;
      for (;;) {
        var goods = G.data.shops[id];
        var i = await ui.list('買う（所持金 ' + s.gold + 'G）', goods.map(function (g) {
          var it = IT(g), own = it.type !== 'potion' && (s.weapon === g || s.armor === g);
          var sub = it.type === 'weapon' ? '攻撃+' + it.atk : it.type === 'armor' ? '守り+' + it.def : it.desc;
          return { label: it.name + '　' + it.price + 'G', sub: own ? '装備中' : sub, disabled: own || s.gold < it.price };
        }), { cancelLabel: 'やめる' });
        if (i < 0) return;
        var it2 = IT(goods[i]);
        s.gold -= it2.price;
        // 武器と防具は買ったらその場で持ち替える（装備の画面を持たないため）
        if (it2.type === 'weapon') s.weapon = goods[i];
        else if (it2.type === 'armor') s.armor = goods[i];
        else G.addItem(goods[i], 1);
        ui.hud();
      }
    },

    sell: async function () {
      var s = G.state;
      for (;;) {
        var ids = Object.keys(s.items).filter(function (id) { return IT(id).sell; });
        if (!ids.length) { await ui.say('バロウ', '売れるものは持ってないようだな。'); return; }
        var i = await ui.list('売る（所持金 ' + s.gold + 'G）', ids.map(function (id) {
          return { label: IT(id).name + ' ×' + s.items[id], sub: IT(id).sell + 'G' };
        }), { cancelLabel: 'やめる' });
        if (i < 0) return;
        s.gold += IT(ids[i]).sell; G.addItem(ids[i], -1); ui.hud();
      }
    },

    guild: async function () {
      var s = G.state;
      for (;;) {
        var qs = G.data.quests.filter(function (q) { return G.cond(q.cond) && (s.quests[q.id] || {}).state !== 'done'; });
        if (!qs.length) { await ui.say('ミーナ', '今お願いできる依頼は、これで全部です。お疲れさまでした！'); return; }
        var i = await ui.list('依頼', qs.map(function (q) {
          var st = s.quests[q.id];
          var tag = !st ? '受ける' : questDone(q) ? '報告する' : '進行中 ' + questProgress(q);
          return { label: q.title + '　' + q.gold + 'G', sub: tag + '：' + q.desc };
        }), { cancelLabel: 'やめる' });
        if (i < 0) return;
        var q = qs[i];
        if (!s.quests[q.id]) {
          s.quests[q.id] = { state: 'active', count: 0 };
          await ui.say('ミーナ', '「' + q.title + '」ですね。お気をつけて！');
        } else if (questDone(q)) {
          if (q.type === 'deliver') G.addItem(q.target, -q.need);
          s.quests[q.id].state = 'done'; s.gold += q.gold; ui.hud();
          await ui.say('ミーナ', 'お見事です！　報酬の ' + q.gold + 'G です。');
        } else {
          await ui.say('ミーナ', 'まだ途中のようです（' + questProgress(q) + '）。\n' + q.desc + '。');
        }
      }
    }
  };

  G.title = {
    show: function () {
      G.field.active = false;
      $('battle').hidden = true;
      $('btnContinue').disabled = !G.load();
      $('title').hidden = false;
      ui.fade('in', 0);
    },
    start: function (saved) {
      $('title').hidden = true;
      G.state = saved || G.newState();
      if (!saved) G.fullHeal();
      G.field.enter(G.state.map);
      G.field.active = true;
      ui.hud();
      if (!saved) G.field.run(function () { return G.script.run('opening'); });
    }
  };
})();
