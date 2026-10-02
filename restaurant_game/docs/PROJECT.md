# Nhà Hàng Triệu Phú: tài liệu dự án

## Ý tưởng
Game quản lý nhà hàng 3D góc nhìn chéo, phong cách chibi ấm áp, cho iOS/Android (màn hình dọc).
Câu chuyện: người chơi được bà Kiku giao lại tiệm cũ; bác đầu bếp Ono Ryota dẫn dắt; bà gửi thư từ các nước.
Hiện là tiệm kiểu Nhật. **Hướng đi tiếp theo đang chờ chủ dự án chốt** (xem cuối file).

## Công nghệ
- Game: HTML + JavaScript thuần + **three.js r128** (3D), không framework, không build tool ngoài `web/build.mjs`.
- App di động: **Capacitor 6** đóng gói bản web (`mobile/`), có `android/` và `ios/`.
- `lib/` (Flutter) là bản mẫu 2D đầu tiên, **ngừng phát triển**, chỉ để tham khảo.

## Cấu trúc mã nguồn `web/src/` (ghép theo thứ tự tên file)
| File | Nội dung |
|---|---|
| `00_shell.html` | Toàn bộ HTML + CSS giao diện (thanh trên, thanh dưới, bảng, hộp thoại), thẻ tải three.js |
| `10_sim.js` | Dữ liệu (món ăn, nhân viên, đồ nội thất, khu mở rộng, nhiệm vụ), trạng thái `S`, lưu/tải, tìm đường, mô phỏng khách và nhân viên (`tick`) |
| `20_scene.js` | Renderer, ánh sáng, vật liệu toon, texture vẽ bằng canvas, dựng nhà, tường, vườn, đường |
| `30_furniture.js` | Mô hình từng loại đồ (bàn, ghế, bếp, băng chuyền, quầy…) và cập nhật mỗi khung hình |
| `40_characters.js` | Nhân vật chibi (mkAvatar), tư thế, biểu cảm, bảng tên, đồng bộ khách và nhân viên |
| `50_street.js` | Dãy cửa hàng, xe cộ, người đi bộ, lễ tân, nhạc công, quản lý, khu đất mở rộng |
| `60_ui_meta_boot.js` | Camera, chạm/kéo, các bảng (thực đơn, nhân viên, nhiệm vụ, chợ cá, mở rộng), vòng lặp game, chương truyện, quà đăng nhập, offline, âm thanh, ngày/đêm, và đoạn khởi động |

**Lưu ý quan trọng:** `10_sim.js` mở đầu bằng `function startGame(){` và `60_ui_meta_boot.js` đóng hàm đó. Mọi code game nằm trong hàm `startGame` (tránh trùng tên biến toàn cục). Từng file **không chạy riêng được**; phải build.

Đối tượng `window.__game` (cuối `60_ui_meta_boot.js`) cho kiểm thử truy cập trạng thái `S`, `view()`, `sim.tick()`…

## Lệnh thường dùng
```bash
node restaurant_game/web/build.mjs            # sinh demo/index.html và mobile/www/index.html
node restaurant_game/web/tests/smoke.mjs      # kiểm tra nhanh (lần đầu: cd restaurant_game/web && npm install && npx playwright install chromium)
cd restaurant_game/mobile && npm install && npx cap sync   # cập nhật app Android/iOS
```

## Nhánh Git
- Nhánh tích hợp hiện tại: `claude/sharp-knuth-swclt3` (Claude). Đề xuất: gộp vào `main` rồi mọi AI mở PR vào `main`.
- ChatGPT/Codex: tạo nhánh `codex/<tên-việc>`; Claude: `claude/<tên-việc>`.

## Trạng thái hiện tại (bản v8)
Đã có: 20 món, 12 nhân viên, 4 khu mở rộng, 4 nâng cấp tiệm, chợ ghép nguyên liệu, 12 chương truyện, quà 7 ngày, thu nhập offline, sổ tay món, ngày/đêm, âm thanh tổng hợp, đường phố có xe và người, giao diện gọn (v8).
Kiểm thử cân bằng 3 giờ: cấp 2 ở phút 5, cấp 6 ở phút 57, cấp 9 ở phút 152.

## Điểm yếu đã biết
- Đồ họa dựng bằng khối hình học trong code; món ăn và icon còn dùng emoji → cần tài nguyên đồ họa thật.
- Người chơi khá thụ động (nhân viên tự làm hết).
- Chưa dựng được APK/IPA (cần Android Studio / Xcode trên máy chủ dự án).

## Hướng đi đang chờ chốt
A "Quán Đêm" (khách quen kể chuyện) · D "Hương Vị Việt" (ẩm thực Việt) · C "Hồi Sinh Phố Cổ" (sửa cả khu phố) · B "Phố Bạn Bè" (xã hội, giai đoạn 2).
Đồ họa: G1 hậu kỳ (tilt-shift, bloom, AO) → G2 bộ mô hình low-poly có sẵn → G3 2D vẽ tay.
