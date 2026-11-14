// 起動。キーもタップも同じ入口（G.field / G.ui）を通す
(function () {
  var $ = G.util.$;
  var KEY = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };

  function boot() {
    G.field.init();
    $('btnMenu').onclick = function () { G.menu.open(); };
    $('btnContinue').onclick = function () { var s = G.load(); if (s) G.title.start(s); };
    $('btnNew').onclick = async function () {
      if (G.load()) {
        var i = await G.ui.list('記録が残っています。最初から始めると、次に記録されたとき上書きされます。', [{ label: '最初から始める' }], { cancelLabel: 'やめる' });
        if (i < 0) return;
      }
      G.title.start(null);
    };
    window.addEventListener('keydown', function (e) {
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
