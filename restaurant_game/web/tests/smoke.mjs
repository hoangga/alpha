// Kiểm tra nhanh: mở bản app trong Chromium không giao diện, chạy mô phỏng 3 phút trong game,
// báo lỗi nếu có lỗi JavaScript, game không khởi động, hoặc không phục vụ được khách nào.
// Cần: npm i -D playwright (và trình duyệt Chromium). Chạy: node web/tests/smoke.mjs
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const page_url = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '../../mobile/www/index.html');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
});
const page = await browser.newPage({viewport: {width: 390, height: 800}});
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
// lỗi tải phông Google khi không có mạng không làm hỏng game, nên bỏ qua
page.on('console', m => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text()); });
await page.goto(page_url);
await page.waitForTimeout(3000);
const started = await page.evaluate(() => !!window.__game && document.getElementById('boot').hidden);
// chạy thẳng phần mô phỏng 180 giây trong game (không phụ thuộc tốc độ vẽ của máy)
const served = await page.evaluate(() => { __game.clearTalk(); for (let t = 0; t < 180; t += 0.05) __game.sim.tick(0.05); return __game.S.served; });
await page.waitForTimeout(1500);
await browser.close();
console.log({started, served, errors});
if (!started || errors.length || served < 1) { console.error('SMOKE TEST FAILED'); process.exit(1); }
console.log('SMOKE TEST OK');
