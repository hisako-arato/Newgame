// 会話・出来事の命令を順に実行する。新しい命令を足したら tests/check-data.js の KNOWN にも足す
(function () {
  var ui = G.ui;

  async function step(c) {
    var s = G.state;
    switch (c[0]) {
      case 'say': await ui.say(c[1], c[2]); break;
      case 'nar': await ui.say('', c[1]); break;
      case 'choice': {
        var i = await ui.list(c[1], c[2].map(function (o) { return { label: o[0] }; }), { cancel: false });
        return run(c[2][i][1]);
      }
      case 'if': return run(G.cond(c[1]) ? c[2] : (c[3] || []));
      case 'call': return run(c[1]);
      case 'flag': s.flags[c[1]] = c[2] === undefined ? true : c[2]; break;
      case 'goal': s.goal = c[1]; ui.hud(); break;
      case 'give':
        G.addItem(c[1], c[2] || 1);
        await ui.say('', G.data.items[c[1]].name + ' を ' + (c[2] || 1) + 'つ手に入れた。');
        break;
      case 'take': G.addItem(c[1], -(c[2] || 1)); break;
      case 'gold':
        s.gold += c[1]; ui.hud();
        await ui.say('', c[1] + 'G を受け取った。');
        break;
      case 'warp': G.field.warp(c[1], c[2], c[3], c[4]); break;
      case 'fade': await ui.fade(c[1], c[2]); break;
      case 'flash': await ui.flash(); break;
      case 'wait': await G.util.sleep(c[1]); break;
      case 'rest': G.menu.rest(); break;
      case 'dream': {
        // はじめの数回だけ、過去の断片を順に見せる
        var d = G.data.dreams[s.rests - 1];
        if (d) await ui.say('', d);
        break;
      }
      case 'brew': await G.menu.brew(); break;
      case 'shop': await G.menu.shop(c[1]); break;
      case 'sell': await G.menu.sell(); break;
      case 'quests': await G.menu.guild(); break;
      case 'battle': {
        var r = await G.battle.start(c[1]);
        if (r === 'win') return run(c[2] || []);
        return 'stop';   // 負け・逃げたら、その先の出来事は起こさない
      }
      case 'end':
        G.save();
        await ui.card(c[1], c[2]);
        G.title.show();
        return 'stop';
      default: throw new Error('知らない命令: ' + c[0]);
    }
  }

  async function run(cmds) {
    if (typeof cmds === 'string') cmds = G.data.story[cmds];
    for (var i = 0; i < cmds.length; i++) {
      if (await step(cmds[i]) === 'stop') return 'stop';
    }
  }

  G.script = { run: run };
})();
