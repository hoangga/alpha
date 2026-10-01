# Nhà Hàng Triệu Phú

Game quản lý nhà hàng (Flutter + Flame) cho iOS và Google Play, kết hợp 3 lối chơi:

- **Time-management**: chạm bàn để nhận order, chạm lại để phục vụ trước khi khách hết kiên nhẫn.
- **Idle/Tycoon**: thuê Phục vụ để tự động hoá, nâng cấp bàn/thực đơn/đầu bếp; kiếm tiền cả khi offline (tối đa 8 giờ).
- **Trang trí**: mua đồ decor để tăng tiền tip và tốc độ khách đến.

## Chạy

```
flutter pub get
flutter run            # thiết bị/giả lập iOS hoặc Android
flutter test
```

## Build phát hành

- Android: `flutter build appbundle` rồi tải `.aab` lên Google Play Console (cần ký bằng keystore của bạn, đổi `applicationId` `com.hoangga.restaurant_tycoon` nếu muốn).
- iOS: cần máy Mac + Xcode + tài khoản Apple Developer: `flutter build ipa`.

## Cấu trúc

- `lib/game/state.dart` – trạng thái, công thức kinh tế, lưu game, thu nhập offline.
- `lib/game/restaurant_game.dart` – cảnh Flame (bàn, khách, tiến trình).
- `lib/main.dart` – HUD và cửa hàng.
