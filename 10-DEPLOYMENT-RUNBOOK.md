# Deployment & Operations Runbook

## 1. Môi trường

- Development: local, fixture giả.
- Staging: cấu hình gần production, bucket/database riêng.
- Production: managed services, least privilege và backup.

Không sao chép tài liệu production sang môi trường thấp hơn.

## 2. Thành phần triển khai

- `web`: Next.js.
- `api`: FastAPI stateless.
- `worker-image`, `worker-ocr`, `worker-export`, `worker-cleanup`.
- Managed PostgreSQL, Redis và S3-compatible storage.

## 3. Cấu hình bắt buộc

Database URL, Redis URL, bucket/region/endpoint, service credentials, signing/session secrets, retention, upload limits, allowed origins, provider config, Sentry DSN và feature flags. Tất cả được validate khi start; không ghi secret vào log.

## 4. Deploy sequence

1. CI test, scan và build immutable image.
2. Chạy backward-compatible migration.
3. Deploy API/worker canary hoặc rolling.
4. Chạy smoke: health, create document, upload fixture, preview, export, delete.
5. Quan sát error/latency/queue/cleanup.
6. Mới bật feature flag cho traffic rộng hơn.

## 5. Rollback

- Rollback image ứng dụng trước.
- Migration phải tương thích ngược; không rollback phá dữ liệu tùy tiện.
- Tắt feature qua flag khi provider/pipeline lỗi.
- Job message cũ phải được worker mới/cũ xử lý an toàn bằng version check.

## 6. Monitoring

- API request rate/error/latency.
- Queue depth và oldest job age theo queue.
- Job duration/failure/retry.
- Worker CPU/memory/restart.
- DB connection/slow query/storage.
- Object count/bytes và cleanup backlog.
- OCR confidence/latency tổng hợp, không kèm nội dung.

## 7. Alert gợi ý

- API 5xx vượt ngưỡng 5 phút.
- Oldest preview job vượt mục tiêu UX.
- Job failure tăng gấp nhiều lần baseline.
- Cleanup backlog vượt hai chu kỳ.
- Database connection hoặc storage usage gần giới hạn.
- Authorization anomaly hoặc rate-limit spike bất thường.

## 8. Sự cố thường gặp

### Queue tăng

Xác định queue, kiểm tra worker/restart/provider, scale đúng worker; không scale API nếu bottleneck là OCR.

### OCR provider lỗi

Mở circuit breaker, pause/retry queue có backoff, thông báo trạng thái; không tự gửi sang provider khác nếu khác chính sách dữ liệu.

### Cleanup lỗi

Ngăn tạo retention debt mới nếu nghiêm trọng, chạy reconciliation có kiểm soát, xác minh object trước/sau và lập incident nếu vượt cam kết.

### Rò presigned URL/token

Revoke/rotate credential liên quan, giảm TTL, kiểm tra access log, cô lập object và thực hiện incident process.

## 9. Backup/restore drill

Thực hiện định kỳ restore database vào môi trường cô lập bằng dữ liệu test/sanitized. Xác nhận restoration không vô tình phục hồi file đã phải xóa ngoài chính sách.
