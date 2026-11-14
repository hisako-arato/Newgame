// index.html が読む CSS と JS を1ファイルにまとめる（1ファイルしか置けない場所で遊ぶため）
// 使い方：node tools/build-single.js 出力先.html
// 出力には <html> <head> <body> を付けない。貼り付け先が外枠を用意する前提
var fs = require('fs'), path = require('path');
var root = path.join(__dirname, '..');
var out = process.argv[2];
if (!out) { console.error('出力先を指定してください'); process.exit(1); }

var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
var app = html.split('<!--APP-->')[1].split('<!--/APP-->')[0];
var title = /<title>(.*?)<\/title>/.exec(html)[1];
var fonts = /<link rel="stylesheet" href="(https:\/\/fonts[^"]+)">/.exec(html)[1];
var css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
var scripts = [];
html.replace(/<script src="([^"]+)"><\/script>/g, function (_, src) { scripts.push(src); });

var parts = [
  '<title>' + title + '</title>',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<link rel="stylesheet" href="' + fonts + '">',
  '<style>\n' + css + '</style>',
  app.trim()
];
scripts.forEach(function (src) {
  parts.push('<script>\n// ' + src + '\n' + fs.readFileSync(path.join(root, src), 'utf8') + '</script>');
});
fs.writeFileSync(out, parts.join('\n') + '\n');
console.log(out + ' を書き出した（' + scripts.length + ' 個のスクリプト）');
