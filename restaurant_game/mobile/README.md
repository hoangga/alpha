# Nhà Hàng Triệu Phú – app iOS / Android (Capacitor)

Bản game 3D trong `www/index.html` (cùng nội dung với bản demo web) được đóng gói thành app gốc bằng
[Capacitor](https://capacitorjs.com). Thư viện three.js nằm sẵn trong `www/three.min.js` nên game chạy được khi không có mạng.

## Chuẩn bị
- Node.js 18+ và `npm install` trong thư mục này.
- Android: Android Studio (kèm Android SDK 34).
- iOS: máy Mac có Xcode 15+ và CocoaPods, tài khoản Apple Developer để đưa lên App Store.

## Chạy thử và đóng gói
```bash
npm install
npx cap sync            # chép www/ vào hai dự án gốc

# Android
npx cap open android    # mở Android Studio → Run trên máy thật hoặc giả lập
# bản phát hành: Build → Generate Signed Bundle (.aab) → tải lên Google Play Console

# iOS (trên Mac)
npx cap open ios        # mở Xcode → chọn Team ký → Run
# bản phát hành: Product → Archive → Distribute App → App Store Connect
```

## Khi sửa game
Sửa `www/index.html` (hoặc thay bằng bản demo mới) rồi chạy lại `npx cap sync`.

## Việc cần làm trước khi lên store
- Biểu tượng app và màn hình chờ: dùng `@capacitor/assets` để sinh đủ kích thước.
- Đổi `appId` trong `capacitor.config.json` nếu muốn tên gói khác (`com.hoangga.nhahangtrieuphu`).
- Chính sách quyền riêng tư (bắt buộc với cả hai store).
- Kiểm tra hiệu năng trên máy Android tầm trung (game tự giảm chất lượng trên điện thoại).
