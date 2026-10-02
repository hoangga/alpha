# Hướng dẫn cho AI cùng làm dự án (ChatGPT/Codex, Claude, …)

Repo này có hai phần độc lập:
- Thư mục gốc (`index.html`, `sw.js`, …): app "Nhật ký giao dịch" cũ. **Không động vào** nếu không được yêu cầu.
- `restaurant_game/`: game **Nhà Hàng Triệu Phú**, dự án đang phát triển. Đọc `restaurant_game/docs/PROJECT.md` trước khi làm bất cứ việc gì.

## Quy tắc làm chung (bắt buộc)
1. **Sửa mã nguồn trong `restaurant_game/web/src/`**, không sửa tay `restaurant_game/demo/index.html` hay `restaurant_game/mobile/www/index.html` (hai file này do lệnh build sinh ra).
2. Sau khi sửa: `node restaurant_game/web/build.mjs` rồi `node restaurant_game/web/tests/smoke.mjs` (cần Playwright + Chromium). Chỉ đẩy code khi smoke test báo `SMOKE TEST OK`.
3. **Mỗi AI làm trên nhánh riêng**, mở Pull Request vào nhánh tích hợp (xem PROJECT.md). Không force-push nhánh của người khác.
4. **Nhận việc trong `restaurant_game/docs/TASKS.md`** trước khi làm (ghi tên mình vào cột "Người làm") để hai AI không sửa trùng một chỗ.
5. Xong việc thì ghi 2–5 dòng vào `restaurant_game/docs/HANDOFF.md`: đã làm gì, file nào, còn gì dang dở.
6. Toàn bộ chữ trong game là **tiếng Việt có dấu**. Giữ phong cách code hiện có (code gọn, nhiều hàm ngắn, chú thích ngắn bằng tiếng Anh).
7. Không thêm thư viện ngoài nếu chưa ghi vào TASKS.md và được chủ dự án (hoangga) đồng ý.
