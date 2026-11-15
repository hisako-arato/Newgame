# 雲上のレクイエム

不老不死の元・剣聖が、死に方を探して空へ昇る RPG。スマホの縦持ちで遊ぶ。
全三章。**第一章**（隠れ家 → 酒場 → 街道 → 王城 → 空）、**第二章**（廃都の広場 → 空中庭園 → 王家の書庫 → 玉座）、**第三章**（地上の軍との戦い → 正門 → 隠された祭壇 → 結末）。

## アプリとして入れる（スマホ）

https://unjou-requiem.haruki-atmark.workers.dev を開き、ブラウザのメニューから入れる。

- **Android（Chrome）**：︙ →「アプリをインストール」（または「ホーム画面に追加」）
- **iPhone（Safari）**：共有ボタン →「ホーム画面に追加」

ホーム画面のアイコンから開くと、ブラウザの枠のない全画面で遊べる。
一度開けば、あとは電波がなくても遊べる（文字の形は、2回目に開いたときから電波なしでも同じになる）。
記録はその端末の中だけに残る。

## 遊び方

- 画面に指を置いたまま、すべらせた向きに歩く。指を離すと止まる
- 人や物をタップすると、近寄って話す・調べる。それ以外の場所をタップすると、向いている先を調べる
- 台詞は、画面のどこをタップしても次へ進む
- ブラウザで遊ぶときは「はじめから」「つづきから」で全画面になる（できる端末だけ。メニューで切り替えられる）
- PC では矢印キーで歩き、Enter で話す・台詞を送る、Esc でメニュー、F で全画面
- `index.html` をブラウザで直接開いても遊べる（ダブルクリックでも動く）

### 流れ
全三章。第一章は、酒場に通う夜と、各地の探検を交互に進める一年間。迷ったら、夜の酒場でバロウに「話す」。

**第一章　止まり木の四季**
- 春：傷薬を届ける → ギルドの依頼 → 森の奥の見張り塔（寄り道：薬草の谷）
- 夏：港町サルベと座礁船の洞窟 → 鉱山町ガラとガラ鉱山
- 秋：学びの町ルーメと地下書庫 → ニレの村と沈んだ礼拝堂 → 古戦場
- 冬：氷穴 → ハルツ砦 → 使者 → 国境の町・王都・地下水道・廃研究所・王城

**第二章　雲の上のふたり**：廃都の広場 → 民の家々 → 空中庭園 → 王家の書庫 → 王家の墓所 → 涸れた水路・灯りの塔 → 玉座

**第三章　空と地上**：広場の兵 → 庭園の魔導兵 → 転移陣で地上へ（隠れ家・酒場・街道の北の本陣）→ 空へ戻る → 正門 → 祭壇

### 覚えておくとよいこと
- 弟子のリコが、はじめから一緒に戦う（空へは付いてこない）。氷の魔法と、手当て・とぎ薬・まもりの香
- 隠れ家の大釜を使うたびに（1日にひとつ）、リコとの会話が進む
- 町の宿に泊まると（20G）、回復して、草や実がまた生える
- メニューの「仲間の行動」で、仲間をおまかせにできる（戦闘のたびに選ばなくてよくなる）
- 弱点は3つ。狼・コウモリは氷、亀・茸は炎、鳥・甲冑は雷
- 道の上は魔物が出ない。草むらと森で出る
- 相手が「力をためている」と出たら、次の番は「ぼうぎょ」
- 倒れても終わらない。隠れ家で目を覚ます
- ベッドで眠ると全回復し、草や実がまた生える
- 姫は雷の魔法と回復が使える。鳥や甲冑には雷がよく効く
- 空では広場の寝台で休み、薬棚で調合する（休むと、姫が空の国のことを話す）
- 各地で思い出した「記憶」は、メニューから読み返せる
- 石甲羅・岩喰いなど硬い相手には、灯火の術か火炎瓶

## 構成

| 場所 | 中身 |
|---|---|
| `data/` | 中身。地図（`maps.js`＝はじめの場所、`maps2.js`＝第一章の夏〜冬、`maps3.js`＝空）、会話と出来事（`story.js`＝共通と春、`story2.js`＝第一章の本筋、`story3.js`＝第二章、`story4.js`＝第三章と結末）、魔物（`monsters.js`・`monsters2.js`）、道具・調合・技（`items.js`） |
| `js/` | 仕組み。歩く画面（`field.js`）、命令の実行（`script.js`）、戦闘（`battle.js`）、メニュー・店（`menu.js`）、絵（`sprites.js`） |
| `css/style.css` | 見た目 |
| `tests/check-data.js` | データの打ち間違いを拾う検査。`node tests/check-data.js` |
| `manifest.webmanifest`・`sw.js` | アプリとして入れるための設定と、電波なしで遊ぶための入れ物 |
| `assets/icons/` | アプリのアイコン。`node tools/make-icons.js` で作り直す |
| `tools/build-pages.js` | 公開する物だけを `dist/` に集める（設定ノートは入れない） |
| `.github/workflows/deploy.yml` | `main` に push すると Cloudflare に上げる |
| `tools/build-single.js` | 1ファイルにまとめた版を作る。`node tools/build-single.js 出力先.html` |
| `STORY.md` | 設定ノート（ネタばらしを含む） |

## 肉付けのしかた

- **人を足す**：`data/maps.js` の `ev` に `{ x, y, sprite, script }`。見た目は `js/sprites.js` の `PEOPLE` に色を足す
- **会話を足す**：`data/story.js` に命令を並べる（`say`・`choice`・`if`・`flag`・`give`・`battle`・`warp` など）
- **魔物を足す**：`data/monsters.js` に強さと 16×16 のドット絵。地図の `enc` に名前を入れると出る
- **色ちがいの魔物を足す**：`like: '元の魔物'` と `pal`（色）だけ書けば、絵を借りられる
- **酒場の夜を足す**：`data/story.js` の `bar_master` の `stage` に段を足し、`night○` を書く。常連の台詞も `stage` で段ごとに変える
- **記憶・夢・姫の話を足す**：`data/story.js` の `memories`・`dreams`・`skyTalks`
- **依頼・薬・装備を足す**：`data/story.js` の `quests`、`data/items.js`

## 公開のしかた（Cloudflare）

`main` に push すると、GitHub Actions が `dist/` を Cloudflare に上げる（https://unjou-requiem.haruki-atmark.workers.dev）。
はじめに一度だけ、GitHub の Secrets に `CLOUDFLARE_API_TOKEN` を入れる。入っていないあいだは、検査だけして上げない。

1. Cloudflare のダッシュボード（https://dash.cloudflare.com）→ 右上の人のアイコン → **My Profile** → **API Tokens** → **Create Token**
2. テンプレート **Edit Cloudflare Workers** の **Use template** → そのまま **Continue to summary** → **Create Token**。
   出てきたトークンを写す（この画面でしか見られない）。haitomoshibi 用に作ったトークンが手元にあれば、それを使ってもよい
3. GitHub の Newgame リポジトリ → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**。
   Name に `CLOUDFLARE_API_TOKEN`、Secret にトークンを貼って **Add secret**
4. **Actions** タブ → **deploy** → **Run workflow** で、すぐに上げられる（以後は main に push するたびに自動）

PC の PowerShell からなら、3 の代わりに次でもよい（聞かれたらトークンを貼る）：

```powershell
& "$env:LOCALAPPDATA\Programs\GitHubCLI\bin\gh.exe" secret set CLOUDFLARE_API_TOKEN -R hisako-arato/Newgame
```

手で上げるときは：

```
node tools/build-pages.js
npx wrangler deploy
```
