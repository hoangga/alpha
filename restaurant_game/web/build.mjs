// Ghép các file trong web/src (theo thứ tự tên) thành game hoàn chỉnh.
// Kết quả:
//   ../demo/index.html        bản web (tải three.js từ CDN) – dùng cho bản xem thử
//   ../mobile/www/index.html  bản app (three.js đi kèm, chạy offline) – dùng cho Capacitor
// Chạy: node web/build.mjs
import {readFileSync, writeFileSync, readdirSync, copyFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'src');
const parts = readdirSync(src).filter(f => /\.(html|js)$/.test(f)).sort();
const game = parts.map(f => readFileSync(join(src, f), 'utf8')).join('');

const CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>';
if (!game.includes(CDN)) throw new Error('Không tìm thấy thẻ script three.js trong 00_shell.html');

writeFileSync(join(here, '../demo/index.html'), game);

const app = game.replace(CDN, '<script src="three.min.js"></script>');
const i = app.indexOf('<div id="app">');
const head = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#5f381a">
<style>:root{box-sizing:border-box}html,body{margin:0}</style>
`;
writeFileSync(join(here, '../mobile/www/index.html'), head + app.slice(0, i) + '</head>\n<body>\n' + app.slice(i) + '\n</body>\n</html>\n');
copyFileSync(join(here, 'vendor/three.min.js'), join(here, '../mobile/www/three.min.js'));
console.log(`Đã ghép ${parts.length} phần: ${parts.join(', ')}`);
