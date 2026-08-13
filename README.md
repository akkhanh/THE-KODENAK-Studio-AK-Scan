# AK Scan

> Quét ảnh tài liệu, tạo PDF scan và chuyển PDF tài liệu sang Word ngay trên thiết bị.

AK Scan là ứng dụng client-only: ảnh, PDF và nội dung OCR được xử lý trong trình duyệt, không có API upload và không lưu tài liệu lên máy chủ.

## Ba workflow

1. **Ảnh chụp tài liệu → PDF scan**: tự dò bốn góc, nắn phối cảnh, làm sạch nền, khử bóng và tăng nét.
2. **PDF chứa ảnh scan → PDF scan**: tách từng trang rồi chạy cùng pipeline xử lý như ảnh chụp.
3. **PDF tài liệu có lớp chữ → Word chỉnh sửa**: đọc trực tiếp lớp chữ, khôi phục đoạn, heading, danh sách và bảng; không OCR lại khi lớp chữ dùng được.

## Tính năng

- Hỗ trợ JPG, PNG, WebP, PDF và camera trên thiết bị tương thích.
- Căn chỉnh tự động hoặc chỉnh tay bốn góc; hỗ trợ làm phẳng giấy cong.
- Bộ lọc màu gốc, tăng cường, xám và trắng đen; chỉnh sáng, tương phản, trắng nền, khử bóng và sắc nét.
- OCR tiếng Việt và tiếng Anh (`eng+vie`) với nhiều lượt đối chiếu để ưu tiên độ chính xác.
- Xuất PDF scan, PDF có thể tìm kiếm và DOCX chỉnh sửa.
- Giữ bố cục PDF có lớp chữ: đoạn văn, heading, danh sách, bảng và căn đều hai lề.
- Mục lục cố định, giao diện responsive, hỗ trợ thu phóng Firefox bằng `transform: scale()`.
- Favicon, Apple Touch Icon, Web App Manifest, Open Graph/Twitter Card và `robots.txt`.

## Riêng tư và bảo mật

- Không cần tài khoản hoặc backend.
- Tài liệu chỉ nằm trong bộ nhớ phiên trình duyệt của người dùng.
- Tesseract, WASM, dữ liệu ngôn ngữ và worker được đóng gói nội bộ; đường dẫn OCR tôn trọng `basePath` khi deploy GitHub Pages.
- Kiểm tra magic bytes cho JPG, PNG, WebP và PDF; làm sạch ký tự điều khiển trước khi tạo PDF/DOCX.
- Blob URL được thu hồi khi xóa trang hoặc đóng phiên.

> Ảnh và PDF được xử lý hoàn toàn trên thiết bị của bạn, không tải lên máy chủ.

## Sử dụng

1. Chọn ảnh, PDF hoặc mở camera.
2. Kiểm tra vùng giấy và chỉnh bốn góc nếu cần.
3. Chọn bộ lọc và tinh chỉnh ảnh.
4. Chọn đầu ra PDF, PDF tìm kiếm hoặc Word chỉnh sửa.
5. Kiểm tra kết quả với bản gốc trước khi sử dụng cho tài liệu quan trọng.

Ảnh phẳng, đủ sáng, camera song song mặt giấy và bốn góc được căn chính xác sẽ cho OCR tốt hơn.

## Chạy local

Yêu cầu Node.js 20+ và npm.

```bash
git clone https://github.com/akkhanh/THE-KODENAK-Studio-AK-Scan.git
cd THE-KODENAK-Studio-AK-Scan
npm ci
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Kiểm tra chất lượng

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions chạy lint, typecheck và toàn bộ test trước khi build static site.

## Deploy GitHub Pages

Repository đã có workflow tại `.github/workflows/deploy-pages.yml`.

1. Vào **Settings → Pages** và chọn **GitHub Actions**.
2. Push lên nhánh `main` hoặc chạy workflow thủ công.
3. Với repository này, URL dự kiến là:
   `https://akkhanh.github.io/THE-KODENAK-Studio-AK-Scan/`

Nếu dùng tên miền riêng, cấu hình `NEXT_PUBLIC_SITE_URL` và thêm `public/CNAME` chứa tên miền chính thức.

## Giới hạn hiện tại

| Giới hạn | Mức tối đa |
| --- | ---: |
| Số trang mỗi phiên | 20 |
| Dung lượng mỗi ảnh | 15 MB |
| Độ phân giải mỗi ảnh | 24 MP |
| Dung lượng mỗi PDF | 40 MB |
| Tổng pixel mỗi phiên | 160 triệu |

## Công nghệ

- Next.js 16 và React 19
- Canvas API và Offscreen-friendly rendering pipeline
- PDF.js, pdf-lib, jsPDF
- Tesseract.js với dữ liệu `eng` và `vie` nội bộ
- `docx` cho Word chỉnh sửa

## Tài liệu kỹ thuật

- [Kiến trúc hệ thống](02-ARCHITECTURE.md)
- [Pipeline ảnh và OCR](05-IMAGE-OCR-PIPELINE.md)
- [Bảo mật và quyền riêng tư](06-SECURITY-PRIVACY.md)
- [Kế hoạch kiểm thử](08-TEST-PLAN.md)

## Tác giả và bản quyền

Phát triển bởi **akkhanh — THE KODENAK**. Dự án được phát hành miễn phí trên GitHub; vui lòng giữ thông tin tác giả khi sử dụng, chỉnh sửa hoặc chia sẻ lại.

© 2026 akkhanh — THE KODENAK.
