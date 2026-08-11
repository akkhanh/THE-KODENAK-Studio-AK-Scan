# AK Scan

> Biến ảnh chụp tài liệu và PDF thành bản scan trắng sáng, rõ chữ — xử lý hoàn toàn ngay trên thiết bị.

**AK Scan** là công cụ scan tài liệu chạy trực tiếp trong trình duyệt. Ứng dụng có thể nhận ảnh từ máy tính, camera hoặc PDF; sau đó tự dò mép giấy, sửa góc nghiêng, làm sạch nền và xuất thành PDF hoặc Word.

Không cần đăng ký. Không cần backend. Tài liệu không bị tải lên máy chủ.

---

## Tính năng nổi bật

### Làm sạch và căn chỉnh tài liệu

- Tự động dò bốn mép trang giấy.
- Sửa phối cảnh của ảnh chụp bị méo góc.
- Cân thẳng tài liệu bị nghiêng.
- Hỗ trợ làm phẳng giấy cong hoặc trang sách bị phồng.
- Xóa bóng, làm trắng nền và tăng độ rõ của chữ.
- Cho phép chỉnh tay bốn góc khi kết quả tự động chưa phù hợp.

### Nhiều chế độ hiển thị

- **Màu gốc:** giữ màu sắc của tài liệu.
- **Tăng cường:** làm sạch nền nhưng vẫn bảo toàn màu, bảng và con dấu.
- **Xám:** loại bỏ màu và giảm bóng nền.
- **Trắng đen:** đưa tài liệu về hai màu, phù hợp với văn bản cần in rõ nét.

### OCR và xuất tài liệu

- Nhận dạng văn bản tiếng Việt và tiếng Anh.
- Tạo PDF có thể tìm kiếm và sao chép chữ.
- Xuất DOCX với đoạn văn và bảng dữ liệu cơ bản.
- Đánh dấu những vùng OCR có độ tin cậy thấp để dễ kiểm tra.
- Xuất nhiều trang theo đúng thứ tự thành một file PDF khổ A4.

### Ảnh và PDF đầu vào

- Hỗ trợ JPG, PNG, WebP và PDF.
- Chụp trực tiếp bằng camera trên thiết bị tương thích.
- Kéo thả nhiều trang, sắp xếp lại hoặc xóa từng trang.
- Ảnh và trang PDF đi qua cùng một quy trình xử lý để cho kết quả nhất quán.

---

## Riêng tư theo thiết kế

Toàn bộ quá trình đọc file, xử lý ảnh, OCR và tạo tài liệu được thực hiện trong trình duyệt của người dùng.

- Không có máy chủ nhận tài liệu.
- Không lưu nội dung ảnh hoặc PDF lên đám mây.
- Không yêu cầu tài khoản.
- Có thể xóa phiên hiện tại để giải phóng toàn bộ tài liệu đang mở.

> Trình duyệt vẫn cần tải mã nguồn và các thư viện của ứng dụng khi mở trang. Nội dung tài liệu chỉ được xử lý cục bộ trên thiết bị.

---

## Cách sử dụng

1. Chọn ảnh, PDF hoặc mở camera.
2. Kiểm tra vùng giấy được tự động nhận diện.
3. Chỉnh lại bốn góc nếu cần.
4. Chọn chế độ màu và điều chỉnh độ sáng, tương phản, trắng nền, xóa bóng, sắc nét.
5. Sắp xếp thứ tự các trang.
6. Xuất PDF scan, PDF có thể tìm kiếm hoặc DOCX.

Để có kết quả tốt nhất, hãy đặt tài liệu trên nền tương phản, giữ camera song song với mặt giấy và tránh ánh sáng chiếu trực tiếp gây lóa.

---

## Chạy dự án trên máy

Yêu cầu: **Node.js 20 trở lên** và npm.

```bash
git clone https://github.com/akkhanh/THE-KODENAK-Studio-AK-Scan.git
cd THE-KODENAK-Studio-AK-Scan
npm ci
npm run dev
```

Sau đó mở [http://localhost:3000](http://localhost:3000).

## Kiểm tra chất lượng

```bash
npm run lint
npm run typecheck
npm test
npm run security:audit
npm run build
```

## Công nghệ sử dụng

- Next.js và React
- Canvas API
- PDF.js, pdf-lib và jsPDF
- Tesseract.js
- docx

Ứng dụng được thiết kế theo mô hình client-only và có thể xuất thành website tĩnh.

---

## Giới hạn xử lý

| Loại giới hạn | Mức hiện tại |
| --- | ---: |
| Số trang mỗi phiên | Tối đa 20 trang |
| Dung lượng mỗi ảnh | Tối đa 15 MB |
| Độ phân giải mỗi ảnh | Tối đa 24 MP |
| Dung lượng mỗi PDF | Tối đa 40 MB |
| Tổng số pixel mỗi phiên | Tối đa 160 triệu pixel |

Chất lượng OCR phụ thuộc vào độ nét, ánh sáng, kiểu chữ và ngôn ngữ của tài liệu. Với hợp đồng, hóa đơn hoặc hồ sơ quan trọng, nên đối chiếu kết quả với bản gốc trước khi sử dụng.

## Tài liệu kỹ thuật

- [Kiến trúc hệ thống](02-ARCHITECTURE.md)
- [Pipeline xử lý ảnh và OCR](05-IMAGE-OCR-PIPELINE.md)
- [Bảo mật và quyền riêng tư](06-SECURITY-PRIVACY.md)
- [Kế hoạch kiểm thử](08-TEST-PLAN.md)

---

## Tác giả và bản quyền

Phát triển bởi **akkhanh — THE KODENAK**.

Dự án được phát hành miễn phí trên GitHub. Vui lòng giữ thông tin tác giả khi sử dụng, chỉnh sửa hoặc chia sẻ lại dự án.

© 2026 akkhanh — THE KODENAK. All rights reserved.
