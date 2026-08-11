# Product Requirements Document — AK Scan

**Phiên bản:** 1.0  
**Trạng thái:** Ready for technical discovery  
**Nền tảng:** Web responsive, mobile-first

## 1. Tầm nhìn

Giúp người dùng biến ảnh chụp tài liệu không hoàn hảo thành file điện tử sạch, rõ và hữu dụng trong vài bước: tải ảnh, nhận diện giấy, làm sạch, kiểm tra và xuất file.

## 2. Vấn đề

Ảnh điện thoại thường bị nghiêng, méo, bóng, nền xám/vàng, lẫn mặt bàn hoặc chữ thiếu tương phản. Khi ghép nhiều ảnh, người dùng còn phải sắp trang và không thể tìm kiếm/chỉnh sửa chữ trong PDF ảnh.

## 3. Người dùng mục tiêu

- Học sinh/sinh viên scan bài, tài liệu và nộp PDF.
- Nhân viên văn phòng scan hợp đồng, biên bản, biểu mẫu.
- Hộ kinh doanh scan hóa đơn, phiếu giao nhận và chứng từ.
- Người dùng phổ thông scan giấy tờ nhanh mà không cài ứng dụng.

## 4. Giá trị cốt lõi

- Scan rõ: trang thẳng, nền sáng, chữ đen và không mất dấu tiếng Việt.
- Nhanh: không bắt đăng ký trước lần dùng đầu.
- Linh hoạt: PDF, searchable PDF, DOCX, TXT, JPG/PNG.
- Riêng tư: file private, URL có hạn và tự động xóa.

## 5. Phạm vi MVP

### Có trong MVP

- Upload/chụp JPG, JPEG, PNG, WebP và HEIC.
- Tối đa 20 trang/tài liệu khách; giới hạn được cấu hình server-side.
- Tự phát hiện trang và chỉnh bốn góc thủ công.
- Sửa phối cảnh, xoay, khử nhiễu và cân bằng sáng.
- Bộ lọc: gốc, màu tăng cường, thang xám, trắng đen.
- Điều chỉnh sáng, tương phản, trắng nền, sắc nét, xóa bóng.
- Thêm, xóa, xoay và kéo thả thứ tự trang.
- OCR tiếng Việt, tiếng Anh hoặc hỗn hợp.
- Sửa/copy nội dung OCR và đánh dấu vùng tin cậy thấp.
- Xuất PDF ảnh, searchable PDF, DOCX ưu tiên chỉnh sửa, TXT, JPG/PNG.
- Theo dõi tiến trình và thử lại trang lỗi.
- Phiên khách; tài liệu tự xóa sau một giờ theo mặc định.

### Chưa có trong MVP

- Chữ ký số pháp lý.
- Trình chỉnh sửa PDF đầy đủ.
- Word giữ bố cục chính xác 100%.
- OCR chữ viết tay nâng cao.
- Cộng tác realtime, app native và dịch tài liệu.

## 6. Luồng chính

1. Người dùng chọn/chụp một hoặc nhiều ảnh.
2. Hệ thống kiểm tra file, sửa chiều EXIF và tạo thumbnail.
3. Hệ thống phát hiện bốn góc; người dùng được chỉnh lại.
4. Hệ thống tạo preview đã sửa phối cảnh và làm sạch.
5. Người dùng chọn filter, điều chỉnh và sắp xếp trang.
6. Nếu cần Word/searchable PDF, người dùng chọn ngôn ngữ OCR.
7. Hệ thống xử lý full-resolution và tạo file.
8. Người dùng tải bằng URL có thời hạn hoặc xóa ngay tài liệu.

## 7. Yêu cầu chức năng

### FR-01 — Nhập ảnh

- Upload nhiều file, kéo thả desktop và camera mobile.
- Kiểm tra nội dung file thay vì chỉ tin extension/MIME từ client.
- Hiển thị lỗi riêng cho định dạng, dung lượng, tổng pixel và file hỏng.
- Upload trực tiếp lên object storage bằng presigned URL.

### FR-02 — Phát hiện và sửa trang

- Trả bốn góc cùng confidence.
- Cho phép kéo góc, zoom và phát hiện lại.
- Perspective transform từ ảnh gốc; giữ thiết lập không phá hủy.

### FR-03 — Làm sạch

- Preview gần realtime ở độ phân giải trung bình.
- Full-resolution chỉ chạy khi export hoặc khi cần OCR chính xác.
- Không làm mất dấu, chữ mảnh, chữ ký, con dấu hoặc đường bảng khi chế độ yêu cầu giữ chúng.

### FR-04 — Nhiều trang

- Thứ tự trang có tính quyết định khi export.
- Thao tác từng trang hoặc hàng loạt.
- Một trang lỗi không làm mất trang đã hoàn thành.

### FR-05 — OCR

- Trả full text, block/line/word, bounding box và confidence.
- Đánh dấu nội dung dưới ngưỡng confidence cấu hình được.
- Cho sửa nội dung; phiên bản người dùng sửa được dùng khi export.

### FR-06 — Export

- PDF ảnh: khổ A4/Letter/fit, lề và mức nén.
- Searchable PDF: ảnh hiển thị + lớp text Unicode trong suốt.
- DOCX: đoạn, tiêu đề, danh sách, bảng đơn giản và ngắt trang.
- URL tải private, có hạn; tên tải xuống được làm sạch.

### FR-07 — Trạng thái và lỗi

- Trạng thái: queued, processing, completed, failed, retrying, cancelled.
- Hiển thị phần trăm, bước hiện tại và trang hiện tại.
- Lỗi tạm thời được retry có giới hạn; lỗi dữ liệu không retry vô hạn.

### FR-08 — Xóa dữ liệu

- Khách có thể xóa ngay.
- Cleanup xóa source, intermediate, OCR và export khi hết hạn.
- Không coi là đã xóa cho đến khi object storage xác nhận.

## 8. Yêu cầu phi chức năng

- API p95 dưới 500 ms với endpoint không xử lý file.
- Preview một trang thông thường: median dưới 5 giây sau upload.
- OCR một trang in rõ: median dưới 8 giây trên cấu hình chuẩn đã benchmark.
- Tạo PDF 10 trang sau xử lý: dưới 15 giây ở điều kiện chuẩn.
- Hỗ trợ màn hình từ 360 px; Chrome, Edge, Firefox hiện hành và Safari iOS.
- WCAG AA cho luồng chính.
- Tất cả tác vụ phải idempotent hoặc có idempotency key phù hợp.

## 9. Chỉ số thành công

- ≥70% phiên đã upload hoàn tất một export.
- ≥90% ảnh chuẩn đủ cạnh được crop đúng mà không chỉnh tay.
- OCR tài liệu in rõ mục tiêu Character Accuracy ≥95% trên bộ test tiếng Việt nội bộ.
- Job thất bại không phục hồi <2%.
- Không có sự cố truy cập chéo hoặc file tồn tại quá retention ngoài ngưỡng vận hành.

## 10. Tiêu chí nghiệm thu tổng

- Hoàn thành end-to-end trên mobile và desktop.
- PDF mở được trên trình đọc phổ biến; searchable PDF tìm/copy được Unicode Việt.
- DOCX mở được trong Microsoft Word và Google Docs.
- Retry, cleanup, rate limit và authorization có test.
- Không log ảnh, OCR text, tên giấy tờ hoặc presigned URL đầy đủ.
