# Kiến trúc hệ thống

## 1. Kiểu kiến trúc

MVP dùng modular monolith với các process triển khai độc lập: API, image worker, OCR worker, export worker và cleanup worker. Không tách microservice sớm nhưng ranh giới module phải rõ.

```text
Next.js
   │ HTTPS
   ▼
FastAPI ───── PostgreSQL
   │             │
   ├──── Redis / Celery Queue
   │              ├── image worker
   │              ├── OCR worker
   │              ├── export worker
   │              └── cleanup worker
   │
   └──── S3-compatible private storage
```

## 2. Quyết định công nghệ

- FastAPI: API typed, OpenAPI và phù hợp hệ sinh thái xử lý ảnh Python.
- OpenCV/Pillow/NumPy: crop, perspective, enhancement và encode.
- PaddleOCR: mặc định; bọc sau `OCRProvider` để thay thế.
- Celery/Redis: đủ nhanh cho MVP và dễ scale theo loại queue.
- PostgreSQL: transaction, JSONB cho settings và truy vấn vận hành.
- S3-compatible storage: file không đi qua API trong upload/download thông thường.
- PyMuPDF/python-docx: export PDF và Word.

## 3. Ranh giới module

- `auth`: identity, guest session, access token.
- `documents`: lifecycle tài liệu và retention.
- `pages`: upload, ordering, corners và settings.
- `processing`: image pipeline và quality score.
- `ocr`: provider, normalized result, user corrections.
- `exports`: PDF/DOCX/TXT/image.
- `jobs`: enqueue, progress, retry, cancellation.
- `storage`: presigned URL, object validation, delete.
- `usage`: quota, rate limit và billing hooks.

Module gọi nhau qua service interface, không truy cập bảng của module khác từ route handler.

## 4. Luồng upload và xử lý

1. API tạo document/page và object key ngẫu nhiên.
2. API cấp presigned PUT URL ngắn hạn.
3. Client upload thẳng storage rồi gọi complete.
4. Worker xác minh object, kích thước, magic bytes và pixel count.
5. Worker tạo thumbnail, phát hiện góc và preview.
6. Người dùng cập nhật corners/settings.
7. Export command tạo chuỗi job full-resolution → OCR nếu cần → export.
8. API cấp presigned GET URL ngắn hạn khi hoàn tất.

## 5. Queue

- `image.preview`: latency thấp.
- `image.full`: CPU/memory cao.
- `ocr`: có thể tách CPU/GPU.
- `export`: PDF/DOCX.
- `maintenance`: cleanup và reconciliation.

Job lưu DB là nguồn sự thật; Celery message chỉ là phương tiện thực thi. Task phải kiểm tra trạng thái hiện tại trước khi chạy để hỗ trợ redelivery.

## 6. Idempotency và consistency

- `POST /documents`, complete upload và export hỗ trợ `Idempotency-Key`.
- Mỗi artifact có fingerprint từ source version + corners + settings + pipeline version.
- Nếu fingerprint không đổi, tái sử dụng artifact hợp lệ.
- Page update tăng `version`; worker chỉ commit nếu version vẫn khớp.
- Cleanup dùng trạng thái `deleting` và có reconciliation cho object xóa thất bại.

## 7. Scale

Thứ tự scale: tăng image worker → OCR worker → tách queue → GPU OCR → tách export → thay broker/workflow engine khi thực tế yêu cầu. API stateless và scale ngang.

## 8. Failure handling

- Retry exponential backoff cho storage/network/provider timeout.
- Không retry file sai, vượt limit, document đã xóa/hết hạn.
- Dead-letter hoặc trạng thái failed sau số lần tối đa.
- Một page failed vẫn cho phép user sửa/thử lại hoặc export các page hợp lệ sau xác nhận.

## 9. Phiên bản artifact

Lưu `pipeline_version`, `ocr_engine`, `ocr_version` và `export_version`. Việc nâng model không âm thầm thay kết quả cũ; reprocess là hành động rõ ràng.
