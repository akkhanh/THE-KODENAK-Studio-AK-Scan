# AK Scan

AK Scan biến ảnh chụp hoặc PDF thành bản scan sạch ngay trong trình duyệt: dò mép, sửa phối cảnh, cân nghiêng, làm phẳng giấy cong, xóa bóng, tăng nét, OCR Việt/Anh và xuất PDF/DOCX.

## Điểm chính

- Xử lý cục bộ; không upload tài liệu lên backend.
- Hỗ trợ JPG, PNG, WebP, PDF và camera.
- Original, enhanced, grayscale và black/white.
- Searchable PDF bằng Tesseract.js + pdf-lib.
- Word có paragraph, đánh dấu OCR confidence thấp và dựng bảng đơn giản.
- Deploy tự động lên GitHub Pages.
- Miễn phí; bản quyền akkhanh — THE KODENAK.

## Chạy local

```bash
npm ci
npm run dev
```

Mở `http://localhost:3000`.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm run build
npm test
npm run security:audit
```

## Deploy GitHub Pages

Push lên nhánh `main`, sau đó vào **Settings → Pages → Source: GitHub Actions**. Workflow `.github/workflows/deploy-pages.yml` tự nhận tên repository, static export và deploy thư mục `out`.

## Tài liệu kỹ thuật

- [Kiến trúc](02-ARCHITECTURE.md)
- [Pipeline ảnh và OCR](05-IMAGE-OCR-PIPELINE.md)
- [Bảo mật và quyền riêng tư](06-SECURITY-PRIVACY.md)
- [Kế hoạch kiểm thử](08-TEST-PLAN.md)

## Giới hạn

Tối đa 20 trang, 15 MB/24 MP mỗi ảnh, 40 MB mỗi PDF và 160 triệu pixel mỗi phiên. OCR và khôi phục bố cục không đảm bảo chính xác tuyệt đối; luôn kiểm tra với tài liệu gốc.
