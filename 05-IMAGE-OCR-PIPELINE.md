# Pipeline xử lý ảnh và OCR

## 1. Mục tiêu chất lượng

Trang thẳng, crop đúng, nền sáng đều, chữ rõ nhưng không mất dấu tiếng Việt, chữ ký, con dấu hoặc đường bảng. Mọi kết quả phải tái tạo được từ ảnh gốc + settings + pipeline version.

## 2. Pipeline ảnh

1. Validate magic bytes, decode an toàn, dimension và pixel count.
2. Đọc orientation EXIF rồi loại metadata không cần thiết.
3. Tạo ảnh làm việc đã giới hạn cạnh dài.
4. Detect document contour và confidence.
5. Sắp thứ tự bốn góc và perspective transform.
6. Denoise có kiểm soát.
7. Ước lượng illumination/background.
8. Shadow removal và white balance.
9. Local contrast enhancement.
10. Filter: color, grayscale hoặc adaptive black/white.
11. Sharpen, morphological cleanup nhẹ.
12. Quality assessment và encode artifact.

## 3. Corner detection MVP

- Grayscale → blur → edge detection → contours.
- Ưu tiên quadrilateral lớn, convex, tỷ lệ/diện tích hợp lý.
- Trả normalized coordinates và confidence.
- Không tự áp dụng kết quả confidence thấp; UI yêu cầu chỉnh tay.
- Manual corners luôn thắng auto detection.

## 4. Filter settings

Các giá trị API normalized theo thang được schema quy định. Worker map sang tham số thuật toán theo `pipeline_version`.

- `brightness`
- `contrast`
- `whiten_background`
- `remove_shadow`
- `denoise`
- `sharpen`
- `threshold_strength`

Preset không được ghi đè settings người dùng đã chỉnh nếu không có xác nhận.

## 5. Quality checks

- Blur score.
- Glare/overexposure ratio.
- Shadow non-uniformity.
- Crop completeness/confidence.
- Text-size estimate.
- Output foreground ratio để phát hiện trang trắng/chữ bị dính.

Quality warning không tự động chặn export trừ khi file không thể decode hoặc vượt giới hạn an toàn.

## 6. OCR

`OCRProvider.recognize(image, languages) -> NormalizedOCRResult`.

Kết quả chuẩn hóa gồm full text, blocks, lines, words, bounding polygons, confidence, reading order, language và engine version. PaddleOCR là provider mặc định; provider cloud chỉ được dùng khi chính sách sản phẩm và consent cho phép.

## 7. OCR preprocessing

- OCR dùng processed image phù hợp, nhưng có thể chọn grayscale thay vì binary nếu binary làm mất nét.
- Benchmark ít nhất ba biến thể preprocessing.
- Deskew nhỏ sau perspective nếu text baseline vẫn nghiêng.
- Không tự sửa tên, số tài khoản, mã số, ngày hoặc số tiền dựa trên phỏng đoán.

## 8. Searchable PDF

- Ảnh processed là lớp hiển thị.
- Text OCR được scale từ tọa độ ảnh sang tọa độ PDF.
- Lớp text trong suốt, Unicode Việt và có reading order hợp lý.
- Test copy/paste, search, rotate và nhiều khổ trang.

## 9. DOCX

MVP ưu tiên chỉnh sửa: paragraph, heading heuristic, list, page break và simple table. Vùng không thể tái tạo có thể chèn ảnh. Không cam kết pixel-perfect.

## 10. Benchmark dataset

Trước beta cần 200–500 trang đã được phép sử dụng: tài liệu Việt/Anh, font nhỏ, bảng, hóa đơn, giấy cũ, bóng, mờ, dấu/chữ ký. Tách train/tuning và holdout; báo CER, WER, latency, memory, failure rate theo nhóm ảnh.

## 11. Golden tests

- Lưu input đã ẩn dữ liệu và expected corners/text/output metrics.
- So sánh thay đổi pipeline theo ngưỡng, không chỉ pixel-perfect.
- Mọi thay đổi `pipeline_version` phải chạy regression benchmark.
