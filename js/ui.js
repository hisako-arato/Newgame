// 文字は DOM で出す（canvas に描くより日本語がきれいで、タップしやすい）
(function () {
  var $ = G.util.$;
  var confirmFn = null;   // いま「決定」で起きること（メッセージ送り）

  G.ui = {
    // 1ページ分の台詞。タップ（または決定キー）で次へ
    say: function (name, text) {
      return new Promise(function (res) {
        var box = $('msg');
        $('msgName').textContent = name || '';
        $('msgName').hidden = !name;
        $('msgText').textContent = text;
        box.className = name ? '' : 'nar';
        box.hidden = false;
        var armed = false;
        // 直前のタップでそのまま送られないよう、少しだけ待ってから受け付ける
        setTimeout(function () { armed = true; }, 120);
        confirmFn = function () {
          if (!armed) return;
          confirmFn = null; box.hidden = true; box.onclick = null; res();
        };
        box.onclick = confirmFn;
      });
    },
    confirm: function () { if (confirmFn) { confirmFn(); return true; } return false; },

    // 選択肢・メニュー。opts：{label, sub, disabled}。戻り値は番号、もどるは -1
    list: function (title, opts, o) {
      o = o || {};
      return new Promise(function (res) {
        var box = $('list');
        box.innerHTML = '';
        if (title) { var h = document.createElement('div'); h.className = 'listTitle'; h.textContent = title; box.appendChild(h); }
        var wrap = document.createElement('div'); wrap.className = 'listItems' + (o.grid ? ' grid' : '');
        function done(i) { box.hidden = true; box.innerHTML = ''; res(i); }
        opts.forEach(function (op, i) {
          var b = document.createElement('button');
          b.type = 'button'; b.disabled = !!op.disabled;
          var l = document.createElement('span'); l.textContent = op.label; b.appendChild(l);
          if (op.sub) { var s = document.createElement('small'); s.textContent = op.sub; b.appendChild(s); }
          b.onclick = function () { done(i); };
          wrap.appendChild(b);
        });
        box.appendChild(wrap);
        if (o.cancel !== false) {
          var c = document.createElement('button');
          c.type = 'button'; c.className = 'cancel'; c.textContent = o.cancelLabel || 'もどる';
          c.onclick = function () { done(-1); };
          box.appendChild(c);
        }
        box.hidden = false;
      });
    },

    fade: function (dir, ms) {
      var f = $('fade');
      if (ms === undefined) ms = 450;
      f.style.transitionDuration = ms + 'ms';
      f.style.opacity = dir === 'out' ? 1 : 0;
      return G.util.sleep(ms + 30);
    },
    flash: function () {
      var f = $('flashFx');
      f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
      return G.util.sleep(700);
    },

    mapName: function (t) {
      var e = $('mapname');
      e.textContent = t; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show');
    },

    hud: function () {
      var s = G.state; if (!s) return;
      var st = G.stats();
      $('goal').textContent = s.goal ? '目的：' + s.goal : '';
      $('stat').textContent = 'Lv' + s.lv + '　HP ' + s.hp + '/' + st.maxhp + '　SP ' + s.sp + '/' + st.maxsp + '　' + s.gold + 'G';
    },

    // 章の終わりなどの一枚絵（文字だけ）
    card: function (title, text, button) {
      return new Promise(function (res) {
        var c = $('card');
        c.innerHTML = '';
        var h = document.createElement('h2'); h.textContent = title;
        var p = document.createElement('p'); p.textContent = text;
        var b = document.createElement('button'); b.type = 'button'; b.textContent = button || 'タイトルへ';
        b.onclick = function () { c.hidden = true; res(); };
        c.appendChild(h); c.appendChild(p); c.appendChild(b);
        c.hidden = false;
      });
    }
  };
})();
