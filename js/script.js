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
      case 'equip': {
        // 武器・防具を受け取る。いまより強ければその場で持ち替える
        var eq = G.data.items[c[1]], slot = eq.type === 'weapon' ? 'weapon' : 'armor', key = slot === 'weapon' ? 'atk' : 'def';
        if (eq[key] > G.data.items[s[slot]][key]) {
          s[slot] = c[1]; ui.hud();
          await ui.say('', eq.name + ' を装備した。（' + (slot === 'weapon' ? '攻撃+' : '守り+') + eq[key] + '）');
        } else {
          await ui.say('', eq.name + ' を受け取った。\nいまの装備のほうが強いので、しまっておく。');
        }
        break;
      }
      // 段階ごとに違う台詞。段階が並びより先なら最後のものを使う
      case 'stage': return run(c[1][Math.min(s.stage, c[1].length - 1)]);
      case 'setstage': s.stage = c[1]; break;
      case 'memory': {
        var mm = G.data.memories[c[1]];
        if (s.mem.indexOf(c[1]) < 0) {
          s.mem.push(c[1]);
          await ui.fade('out');
          await ui.say('', '【記憶　' + mm.title + '】\n' + mm.text);
          await ui.fade('in');
        }
        break;
      }
      case 'forge': await G.menu.forge(); break;
      case 'leave': s.flags[c[1]] = false; ui.hud(); break;
      case 'join': s.flags[c[1]] = true; G.fullHeal(); ui.hud(); break;
      case 'dream': {
        // 地上では過去の夢を、空では姫の話を、物語が進んだぶんだけ順に見せる
        if (s.flags.amelia) {
          var tk = G.data.skyTalks[s.talks];
          if (tk) { s.talks++; await run(tk); }
        } else {
          var d = G.data.dreams[s.dreams];
          if (d && s.stage >= d.stage) { s.dreams++; await ui.say('', d.text); }
        }
        break;
      }
      case 'ltalk': {
        // 隠れ家でのリコとの会話。1日（眠るまで）にひとつだけ進む
        var lt = G.data.lairTalks[s.ltalks];
        if (s.flags.riko && lt && s.stage >= lt.stage && s.ltalkDay !== s.rests) {
          s.ltalks++; s.ltalkDay = s.rests;
          await run(lt.script);
        }
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
