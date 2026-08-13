# Kế hoạch kiểm thử AK Scan

## 1. Mục tiêu

Xác nhận ứng dụng client-only nhập file an toàn, xử lý ảnh đúng, không làm mất nội dung quan trọng, xuất file mở được và hoạt động sau static export lên GitHub Pages.

## 2. Kiểm tra tự động hiện có

- `npm run lint`: ESLint toàn source và test.
- `npm run typecheck`: TypeScript không emit.
- `npm run build`: Next.js production build.
- `npm test` / `npm run test:scan`: unit test các hàm scan thuần và Canvas mock.
- `scripts/test-security.ts`: magic bytes, filename/text sanitizer và timeout.
- `npm run security:audit`: dependency audit mức high.

GitHub Pages workflow hiện chạy lint, typecheck và static production build trước deploy.

## 3. Ma trận input và bảo mật

| Ca kiểm thử | Kỳ vọng |
|---|---|
| HTML đổi tên `.jpg` | Bị từ chối bằng magic bytes |
| PDF/ảnh rỗng hoặc hỏng | Báo lỗi, không tạo trang |
| Ảnh trên 15 MB hoặc 24 MP | Bị từ chối |
| PDF trên 40 MB | Bị từ chối trước parse |
| Trên 20 trang | Chỉ nhận phần còn chỗ |
| Tổng trên 160 triệu pixel | Bị từ chối và revoke URL mới |
| PDF render/open quá 30 giây | Timeout và cleanup |
| Filename chứa control/XSS | Hiển thị escaped và sanitized |
| OCR text chứa null/XML entities | DOCX vẫn tạo được |

## 4. Ma trận xử lý ảnh

- Giấy trắng trên nền tối và nền gần màu giấy.
- Ảnh xiên theo bốn hướng; góc nằm ngoài bounds.
- Xoay 90/180/270 và fine rotation ±3°.
- Baseline còn nghiêng sau perspective.
- Trang sách cong, giấy phồng và đường bảng võng.
- Bóng tay/điện thoại, glare, ánh sáng không đều.
- Con dấu đỏ, chữ trong ô màu, bảng có header màu.
- Trang trắng hoàn toàn, đen hoàn toàn và chữ rất mảnh.

Với mỗi ca, so sánh original/enhanced/grayscale/bw và kiểm tra không mất chữ, dấu tiếng Việt, đường bảng hoặc vùng màu cần bảo toàn.

## 5. OCR và Word

Automated quality gate: `npm run test:ocr-quality` measures normalized character error rate (CER) and word error rate (WER) using pure edit-distance calculations. Its checked-in golden cases cover Vietnamese diacritics, English prose, legitimate numbers/punctuation, and the standalone spurious-token failure seen in scanned pages. Candidate output must stay below each case threshold and must not regress against a stored baseline without an explicit tolerance.

`npm run test:pdf-to-word` is the in-memory DOCX contract gate. It validates text-layer and scan/OCR inputs, then inspects the generated OOXML package for editable text, Heading2 styles, real list numbering, tables, image media, page breaks, Vietnamese/English text and XML-safe special characters. This protects against regressions that turn a Word export into a flattened image or plain unstructured text.

- OCR Việt/Anh, dấu sắc/huyền/hỏi/ngã/nặng.
- Text layer PDF có thể search/copy trong Chrome và Adobe Reader.
- PDF có embedded text ưu tiên text gốc khi xuất Word.
- OCR hai pass chọn confidence cao hơn.
- Tài liệu tiếng Anh một cột không sinh thêm số hoặc ký hiệu đơn lẻ xen giữa câu.
- Nhiễu màu nhạt ở lề/trên đầu trang không trở thành nội dung OCR.
- Token confidence thấp, quá nhỏ hoặc lệch baseline được lọc nhưng không làm mất dấu câu hợp lệ.
- Chữ số hợp lệ như `11 p.m.`, tiêu đề đánh số và mã tài liệu không bị bộ lọc ký tự rác xóa nhầm.
- OCR tiếng Anh dùng `eng` không kém hơn `vie+eng`; OCR tiếng Việt vẫn giữ đầy đủ dấu.
- Trang nhiều cột giữ đúng thứ tự đọc; không nối cuối cột trái vào đầu dòng cột phải.
- Pass OCR thứ hai chỉ chạy cho trang/vùng chưa đạt quality gate.
- So sánh CER/WER trước và sau thay đổi trên cùng golden dataset; không chấp nhận cải thiện một nhóm tài liệu bằng cách làm giảm rõ rệt nhóm khác.
- Line/cell dưới 82 confidence được tô vàng.
- Bảng 3×4, merged-look table và bảng có text nhiều dòng.
- DOCX mở trong Microsoft Word, LibreOffice và Google Docs.
- Con dấu không ngăn OCR phần chữ còn nhìn thấy.

## 6. Export PDF

- A4, Letter, fit-image.
- Lề none/small/large.
- Compact/balanced/high.
- Trang portrait và landscape trong cùng tài liệu.
- B&W dùng PNG, các chế độ khác dùng JPEG.
- Đúng thứ tự sau drag/drop và không có trang rỗng 1×1.

## 7. Hiệu năng và bộ nhớ

- 20 trang ảnh trung bình trên Chrome desktop.
- Nhiều trang PDF raster 2.800 px.
- Kéo slider liên tục và chuyển trang nhanh.
- Dò mép 100 lần; cache không vượt 40 entry mỗi loại.
- Xóa từng trang/xóa phiên và theo dõi Blob URL/memory.
- Điện thoại RAM thấp: 3–5 trang, quality balanced.

## 8. Cross-browser

Ưu tiên: Chrome/Edge Windows, Chrome Android, Safari iOS/macOS và Firefox desktop. Kiểm tra File API, camera capture, WebP, Canvas memory, PDF worker, WASM OCR và download Blob.

## 9. GitHub Pages acceptance

Workflow phải tạo `out/index.html`, `out/.nojekyll` và `out/pdf.worker.min.mjs`. Kiểm tra hai kiểu URL:

- User site: `https://user.github.io/` không có base path.
- Project site: `https://user.github.io/repository/` có prefix cho `/_next` và PDF worker.

Sau deploy chạy smoke test: nhập ảnh, nhập PDF, chọn enhanced, OCR một trang, xuất PDF và Word.

## 10. Release gate

- Lint, typecheck và production/static build pass.
- Không có dependency vulnerability critical/high.
- Magic-byte/security tests pass.
- Smoke test ảnh/PDF/OCR/export pass trên Chrome desktop.
- Không có regression làm mất chữ hoặc bảng trong bộ ảnh chuẩn.
- README, kiến trúc, pipeline, security và test plan khớp source.
