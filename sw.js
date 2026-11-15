// アプリとして入れたとき、電波がなくても遊べるようにする入れ物（サービスワーカー）。
//
// 入れる物の一覧は tools/build-pages.js が files.json に書く（index.html が読むファイルとアイコン）。
// VERSION も tools/build-pages.js が中身から作って書きこむ。中身が変わると版が変わり、
// ブラウザが全部を取り直してから古い版を消す（遊んでいる途中で新旧のファイルがまざらないように）。
// 新しい版は「次に開いたとき」から効く
const VERSION = '__VERSION__';
const CACHE = 'unjou-' + VERSION;
const FONTS = 'unjou-fonts';   // Google Fonts の文字。版が変わっても取り直さない

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const list = (await (await fetch('files.json', { cache: 'no-store' })).json()).files;
    const cache = await caches.open(CACHE);
    // ブラウザの手元の控えを使わず、必ず取り直す（古い版がまざらないように）
    for (const u of list) {
      const res = await fetch(new Request(u, { cache: 'reload' }));
      if (!res.ok) throw new Error(u + ' ' + res.status);
      await cache.put(u, res);
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE && k !== FONTS) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  // 文字（フォント）は一度取れたらしまっておく。電波がないときも同じ字で遊べるように
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith((async () => {
      const cache = await caches.open(FONTS);
      const hit = await cache.match(req);
      if (hit) return hit;
      try { const res = await fetch(req); if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }
      catch (err) { return Response.error(); }
    })());
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // ページは './' でしまってある（Cloudflare は index.html を './' へ転送するため）
    const hit = req.mode === 'navigate' ? await cache.match('./') : await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(req); } catch (err) { return Response.error(); }
  })());
});
