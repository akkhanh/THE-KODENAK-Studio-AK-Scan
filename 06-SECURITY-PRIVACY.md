# Bảo mật và quyền riêng tư

## 1. Phân loại dữ liệu

Ảnh, OCR text, PDF/DOCX và filename là dữ liệu nhạy cảm. ID kỹ thuật, metrics đã tổng hợp và error code đã làm sạch là dữ liệu vận hành. Mặc định không dùng tài liệu để huấn luyện mô hình.

## 2. Kiểm soát truy cập

- Mọi resource lookup gắn owner; resource khác chủ trả 404.
- Guest token được hash trong DB, cookie Secure/HttpOnly/SameSite phù hợp.
- Presigned URL hết hạn ngắn, giới hạn object key và method.
- Object bucket private; chặn public access.
- Service account theo least privilege và tách môi trường.

## 3. Upload an toàn

- Allowlist định dạng và xác minh magic bytes.
- Giới hạn từng file, tổng file, dimension và decoded pixel.
- Timeout decode; chặn decompression bomb và malformed image.
- Không thực thi macro; DOCX/PDF chỉ là output do hệ thống tạo.
- Quarantine hoặc scan nếu phát hiện file bất thường.

## 4. Mã hóa và secret

- TLS cho dữ liệu truyền.
- Encryption at rest của database/storage.
- Secret manager; không commit key hoặc `.env` thật.
- Rotation key và audit quyền truy cập production.

## 5. Logging và analytics

Không log:

- OCR text, ảnh hoặc binary.
- Filename gốc nếu có thể chứa PII.
- Presigned URL đầy đủ, token hoặc authorization header.
- Nội dung exception từ OCR provider nếu chứa payload.

Log request ID, owner pseudonymous ID, document/job ID, duration, status và error code đã sanitize.

## 6. Retention và xóa

- Guest mặc định một giờ; giá trị cấu hình và hiển thị trước upload.
- Nút xóa ngay cho source, intermediate và exports.
- Cleanup có retry, reconciliation, metric tồn đọng và cảnh báo.
- Cache/CDN không được giữ object quá thời hạn ngoài chính sách.

## 7. Abuse controls

- Rate limit theo identity và IP có cân nhắc NAT.
- Quota page, pixel, OCR và concurrent job.
- Circuit breaker khi provider quá tải.
- Không cho user điều khiển trực tiếp storage key, shell command, path hoặc template tùy ý.

## 8. Threat checklist trước release

- IDOR/truy cập chéo.
- SSRF qua URL import nếu sau này hỗ trợ.
- Path traversal trong filename/export.
- Zip bomb cho image ZIP output/input tương lai.
- Injection qua metadata/filename vào header hoặc DOCX/XML.
- Race giữa export và delete.
- Replay upload-complete/presigned URL.
- Worker xử lý object đã bị thay thế.
- Rò dữ liệu qua error monitoring.

## 9. Incident response tối thiểu

Có owner trực, cách revoke key, vô hiệu download URL, dừng worker, cô lập bucket/object, truy vết request ID và thông báo nội bộ. Không tự động xóa bằng chứng vận hành trước khi đánh giá sự cố, đồng thời vẫn tuân thủ retention dữ liệu người dùng.
