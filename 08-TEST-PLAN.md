# Test Plan

## 1. Mục tiêu

Xác nhận chất lượng scan/OCR, tính đúng của export, khả năng phục hồi và bảo mật dữ liệu. Test không được chỉ dựa trên ảnh đẹp.

## 2. Các tầng test

- Unit: corner ordering, transforms, settings mapping, quota, authorization policy.
- Component: image pipeline, OCR normalization, PDF/DOCX generation.
- Integration: Postgres, Redis, object storage, Celery job lifecycle.
- Contract: OpenAPI và frontend client.
- E2E: upload → edit → OCR → export → download → delete.
- Performance: upload concurrency, queue, worker memory, tài liệu 20 trang.
- Security: IDOR, file validation, rate limit, presigned URL và log leakage.

## 3. Ma trận ảnh

- Nền sáng/tối/tương tự màu giấy.
- Góc xiên, xoay, thiếu một phần cạnh.
- Bóng tay/điện thoại, glare, ánh sáng yếu.
- Giấy trắng, vàng, cũ; trang sách cong.
- Font nhỏ, tiếng Việt nhiều dấu, song ngữ.
- Bảng, hóa đơn dài, chữ ký, con dấu.
- HEIC iPhone và ảnh Android phổ biến.
- File hỏng, giả extension, ảnh pixel cực lớn.

## 4. Acceptance tests quan trọng

### Upload

- 20 ảnh hợp lệ hoàn tất và giữ đúng thứ tự.
- File sai/hỏng/quá limit trả lỗi rõ và không tạo job xử lý.
- Retry upload không tạo page trùng khi cùng idempotency key.

### Processing

- Manual corners tạo output đúng với normalized coordinates.
- Thay settings tăng page version; kết quả job cũ không ghi đè.
- Một page fail không xóa output page khác.

### OCR/export

- Unicode tiếng Việt không lỗi font.
- Search/copy text trong PDF hoạt động.
- DOCX mở trong Word và Google Docs.
- Thứ tự trang export đúng database.

### Security/retention

- User/guest khác không đọc, sửa, tải hoặc xóa resource.
- URL hết hạn không tải được.
- Delete xóa mọi artifact và cleanup có thể retry.
- Log không chứa content/token/URL bí mật.

## 5. Performance baseline

Định nghĩa máy/worker chuẩn trước benchmark. Ghi p50/p95/p99 cho preview, OCR, export; peak memory theo megapixel; throughput theo worker; queue wait. Không công bố SLA dựa trên máy dev.

## 6. Release gate

- Không còn lỗi severity critical/high mở.
- E2E luồng chính pass trên Chrome desktop và Safari/Chrome mobile mục tiêu.
- OCR/scan regression trong ngưỡng đã chốt.
- Cleanup và authorization suite pass 100%.
- Load test đạt tải beta dự kiến với headroom.
