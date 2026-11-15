// 起動。キーもタップも同じ入口（G.field / G.ui）を通す
(function () {
  var $ = G.util.$;
  var KEY = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };

  // ブラウザの枠を消して画面いっぱいにする。iPhone の Safari などできない端末では何もしない
  // （ホーム画面に入れたアプリは、はじめから全画面で開く）
  G.fullscreen = {
    can: function () { var d = document.documentElement; return !!(d.requestFullscreen || d.webkitRequestFullscreen); },
    on: function () { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
    enter: function () {
      var d = document.documentElement, f = d.requestFullscreen || d.webkitRequestFullscreen;
      if (!f || G.fullscreen.on()) return;
      try { var p = f.call(d, { navigationUI: 'hide' }); if (p && p.catch) p.catch(function () {}); } catch (e) { /* 断られたら枠つきのまま */ }
    },
    toggle: function () {
      if (!G.fullscreen.on()) { G.fullscreen.enter(); return; }
      var x = document.exitFullscreen || document.webkitExitFullscreen;
      if (x) { try { var p = x.call(document); if (p && p.catch) p.catch(function () {}); } catch (e) { /* そのまま */ } }
    }
  };

  function boot() {
    G.field.init();
    $('btnMenu').onclick = function () { G.menu.open(); };
    $('btnContinue').onclick = function () { G.fullscreen.enter(); var s = G.load(); if (s) G.title.start(s); };
    $('btnNew').onclick = async function () {
      G.fullscreen.enter();
      if (G.load()) {
        var i = await G.ui.list('記録が残っています。最初から始めると、次に記録されたとき上書きされます。', [{ label: '最初から始める' }], { cancelLabel: 'やめる' });
        if (i < 0) return;
      }
      G.title.start(null);
    };
    window.addEventListener('keydown', function (e) {
      if (e.key === 'f') G.fullscreen.toggle();
      if (KEY[e.key]) { G.field.keys[KEY[e.key]] = true; G.field.path = []; G.field.target = null; G.field.mark = null; e.preventDefault(); }
      if (e.key === 'Enter' || e.key === ' ') { if (!G.ui.confirm()) G.field.action(); e.preventDefault(); }
      if (e.key === 'Escape' || e.key === 'm') G.menu.open();
    });
    window.addEventListener('keyup', function (e) { if (KEY[e.key]) G.field.keys[KEY[e.key]] = false; });

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(50, now - last); last = now;
      G.field.update(dt);
      if (G.field.active) G.field.render();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    G.title.show();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
