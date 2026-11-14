// 歩く画面。タップした場所まで道を探して歩き、人や物をタップすると近寄って話す
(function () {
  var T = 16, VIEW = 176, STEP_MS = 130;
  var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  var cv, ctx, map, bg, camX = 0, camY = 0;

  var F = G.field = {
    active: false, busy: false,
    path: [], target: null, moving: null, keys: {}, safe: 0, mark: null, t: 0,

    init: function () {
      cv = G.util.$('view'); ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      cv.addEventListener('pointerdown', function (e) {
        var r = cv.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width * VIEW + camX, py = (e.clientY - r.top) / r.height * VIEW + camY;
        F.tap(Math.floor(px / T), Math.floor(py / T));
      });
    },

    enter: function (id) {
      map = G.data.maps[id];
      bg = G.sprites.renderMap(map);
      G.state.map = id;
      F.path = []; F.target = null; F.moving = null; F.mark = null; F.safe = 0;
      G.ui.mapName(map.name);
    },
    warp: function (id, x, y, dir) {
      G.state.x = x; G.state.y = y; if (dir) G.state.dir = dir;
      F.enter(id);
    },

    // 待ちのある処理はここに包む。その間は歩けない
    run: async function (fn) {
      if (F.busy) return;
      F.busy = true; F.path = []; F.target = null; F.mark = null;
      try { await fn(); } finally { F.busy = false; G.ui.hud(); G.save(); }
    },

    tile: function (x, y) {
      if (y < 0 || y >= map.rows.length || x < 0 || x >= map.rows[0].length) return ' ';
      return map.rows[y].charAt(x);
    },
    gkey: function (e) { return G.state.map + ':' + e.x + ',' + e.y; },
    events: function () {
      return map.ev.filter(function (e) {
        if (e.gather) return !G.state.gathered[F.gkey(e)];
        return G.cond(e.cond);
      });
    },
    solid: function (e) { return !!(e.sprite || e.gather); },
    eventAt: function (x, y, step) {
      var ev = F.events();
      for (var i = 0; i < ev.length; i++) if (ev[i].x === x && ev[i].y === y && !!ev[i].step === !!step) return ev[i];
      return null;
    },
    passable: function (x, y) {
      if (!G.sprites.walkable(F.tile(x, y))) return false;
      var e = F.eventAt(x, y, false);
      return !(e && F.solid(e));
    },

    // 幅優先で道を探す。goals のどれかに着く最短の道（向きの並び）を返す
    findPath: function (goals) {
      var s = G.state, W = map.rows[0].length, start = s.y * W + s.x;
      var goal = {}; goals.forEach(function (g) { goal[g[1] * W + g[0]] = true; });
      if (goal[start]) return [];
      var prev = {}, q = [start]; prev[start] = -1;
      while (q.length) {
        var cur = q.shift(), cx = cur % W, cy = (cur - cx) / W;
        for (var d in DIRS) {
          var nx = cx + DIRS[d][0], ny = cy + DIRS[d][1], n = ny * W + nx;
          if (prev[n] !== undefined || !F.passable(nx, ny)) continue;
          prev[n] = { from: cur, dir: d };
          if (goal[n]) {
            var out = [];
            while (prev[n] !== -1) { out.unshift(prev[n].dir); n = prev[n].from; }
            return out;
          }
          q.push(n);
        }
      }
      return null;
    },
    // 話しかけられる立ち位置。カウンター越しにも話せる
    reach: function (e) {
      var out = [];
      for (var d in DIRS) {
        var x = e.x + DIRS[d][0], y = e.y + DIRS[d][1];
        if (F.tile(x, y) === 'k') { x += DIRS[d][0]; y += DIRS[d][1]; }
        if (F.passable(x, y)) out.push([x, y]);
      }
      return out;
    },

    tap: function (tx, ty) {
      if (!F.active || F.busy) return;
      var e = F.eventAt(tx, ty, false);
      var isObj = e && (F.solid(e) || !G.sprites.walkable(F.tile(tx, ty)));
      if (isObj) {
        var p = F.findPath(F.reach(e));
        if (p) { F.path = p; F.target = e; F.mark = { x: tx, y: ty }; if (!p.length && !F.moving) F.arrive(); }
        return;
      }
      if (!F.passable(tx, ty)) return;
      var p2 = F.findPath([[tx, ty]]);
      if (p2) { F.path = p2; F.target = null; F.mark = { x: tx, y: ty }; }
    },

    face: function (e) {
      var s = G.state, dx = e.x - s.x, dy = e.y - s.y;
      s.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    },
    arrive: function () {
      var e = F.target; F.target = null; F.mark = null;
      if (e) { F.face(e); F.interact(e); }
    },
    interact: function (e) {
      if (e.gather) {
        return F.run(async function () {
          G.state.gathered[F.gkey(e)] = 1;
          await G.script.run([['give', e.gather, 2]]);
        });
      }
      return F.run(function () { return G.script.run(e.script); });
    },
    // 決定キー：向いている先を調べる
    action: function () {
      if (!F.active || F.busy || F.moving) return;
      var s = G.state, d = DIRS[s.dir], x = s.x + d[0], y = s.y + d[1];
      if (F.tile(x, y) === 'k') { x += d[0]; y += d[1]; }
      var e = F.eventAt(x, y, false);
      if (e) F.interact(e);
    },

    tryMove: function (dir) {
      var s = G.state, d = DIRS[dir];
      s.dir = dir;
      if (!F.passable(s.x + d[0], s.y + d[1])) return false;
      F.moving = { fx: s.x, fy: s.y, tx: s.x + d[0], ty: s.y + d[1], t: 0 };
      return true;
    },
    onStep: function () {
      var s = G.state;
      var e = F.eventAt(s.x, s.y, true);
      if (e) { F.run(function () { return G.script.run(e.script); }); return; }
      if (!F.path.length && F.target) { F.arrive(); return; }
      if (!F.path.length) F.mark = null;
      // 魔物：道の上では出ない。草むら・森だけ
      var list = map.enc && map.enc[F.tile(s.x, s.y)];
      if (!list) return;
      F.safe++;
      if (F.safe > 4 && Math.random() < 0.13) {
        F.safe = 0;
        var id = list[G.util.rnd(list.length)];
        F.run(function () { return G.battle.start(id); });
      }
    },

    update: function (dt) {
      if (!F.active) return;
      F.t += dt;
      if (F.moving) {
        F.moving.t += dt / STEP_MS;
        if (F.moving.t >= 1) {
          G.state.x = F.moving.tx; G.state.y = F.moving.ty; F.moving = null;
          F.onStep();
        }
        return;
      }
      if (F.busy) return;
      if (F.path.length) {
        if (!F.tryMove(F.path.shift())) { F.path = []; F.target = null; F.mark = null; }
        return;
      }
      for (var k in DIRS) if (F.keys[k]) { F.tryMove(k); break; }
    },

    render: function () {
      if (!map) return;
      var s = G.state, m = F.moving;
      var hx = (m ? m.fx + (m.tx - m.fx) * m.t : s.x) * T, hy = (m ? m.fy + (m.ty - m.fy) * m.t : s.y) * T;
      var mw = map.rows[0].length * T, mh = map.rows.length * T;
      // 地図が画面より小さいときは真ん中に置く
      camX = mw <= VIEW ? -(VIEW - mw) / 2 : G.util.clamp(hx - 80, 0, mw - VIEW);
      camY = mh <= VIEW ? -(VIEW - mh) / 2 : G.util.clamp(hy - 80, 0, mh - VIEW);
      camX = Math.round(camX); camY = Math.round(camY);
      ctx.fillStyle = '#0b0d16'; ctx.fillRect(0, 0, VIEW, VIEW);
      ctx.drawImage(bg, -camX, -camY);

      var list = F.events().filter(function (e) { return e.sprite || e.gather; })
        .map(function (e) { return { y: e.y * T, x: e.x * T, name: e.sprite || e.gather, dir: e.dir }; });
      list.push({ y: hy, x: hx, name: 'hero', dir: s.dir, frame: m ? (m.t < 0.5 ? 1 : 0) : 0, hero: true });
      list.sort(function (a, b) { return a.y - b.y; });
      list.forEach(function (o) {
        // 足もとの影
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(Math.round(o.x) - camX + 3, Math.round(o.y) - camY + 14, 10, 2);
        G.sprites.draw(ctx, o.name, Math.round(o.x) - camX, Math.round(o.y) - camY - (o.hero ? 0 : 0), o.dir, o.frame);
      });

      if (map.dark) { ctx.fillStyle = 'rgba(14,18,60,' + map.dark + ')'; ctx.fillRect(0, 0, VIEW, VIEW); }
      if (F.mark) {
        var a = 0.5 + 0.4 * Math.sin(F.t / 120);
        ctx.strokeStyle = 'rgba(255,225,130,' + a + ')'; ctx.lineWidth = 1;
        ctx.strokeRect(F.mark.x * T - camX + 1.5, F.mark.y * T - camY + 1.5, T - 3, T - 3);
      }
    }
  };
})();
