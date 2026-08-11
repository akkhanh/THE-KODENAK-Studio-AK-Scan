# Mô hình dữ liệu

## 1. Nguyên tắc

- PostgreSQL chỉ lưu metadata và text cần thiết, không lưu binary ảnh/PDF.
- Mọi bảng nghiệp vụ có `created_at`, `updated_at`; dữ liệu xóa có `deleted_at` khi cần.
- Ownership luôn được ràng buộc bằng `user_id` hoặc `guest_session_id`.
- Settings linh hoạt dùng JSONB nhưng trạng thái, format và khóa truy vấn phải là cột typed.

## 2. Bảng chính

### `users`

`id`, `email`, `display_name`, `plan`, `status`, `storage_used_bytes`, timestamps.

### `guest_sessions`

`id`, `token_hash`, `ip_hash` tùy chính sách, `expires_at`, timestamps. Không lưu raw token.

### `documents`

`id`, nullable `user_id`, nullable `guest_session_id`, `name`, `status`, `version`, `page_count`, `ocr_languages`, `expires_at`, `deleted_at`, timestamps.

Constraint: đúng một owner type được đặt. Index owner + created_at và expires_at + status.

### `pages`

`id`, `document_id`, `position`, `version`, `status`, source metadata, `corners` JSONB, `rotation`, `filter_type`, `filter_settings` JSONB, `quality_score`, `pipeline_version`, timestamps.

Unique `(document_id, position)` với cơ chế reorder trong transaction.

### `artifacts`

`id`, `document_id`, nullable `page_id`, `kind`, `storage_key`, `content_type`, `size_bytes`, `checksum`, `fingerprint`, `status`, `expires_at`, timestamps.

Kind gồm source, thumbnail, preview, processed, ocr_json và export. `storage_key` không được trả ra API.

### `ocr_results`

`id`, `page_id`, `source_page_version`, `engine`, `engine_version`, `languages`, `full_text`, `blocks` JSONB hoặc artifact reference, `average_confidence`, `user_corrected_text`, `version`, timestamps.

### `jobs`

`id`, `document_id`, nullable `page_id`, `type`, `status`, `progress`, `current_step`, `attempt_count`, `max_attempts`, `error_code`, `error_details_sanitized`, `deduplication_key`, `started_at`, `completed_at`, timestamps.

### `exports`

`id`, `document_id`, `job_id`, `format`, `settings` JSONB, `source_document_version`, nullable `artifact_id`, `status`, `expires_at`, timestamps.

### `usage_events`

`id`, owner, `event_type`, `quantity`, `period_key`, timestamps. Không chứa OCR text hay filename nhạy cảm.

## 3. Trạng thái

- Document: `draft`, `processing`, `ready`, `partially_failed`, `deleting`, `deleted`, `expired`.
- Page: `uploading`, `uploaded`, `inspecting`, `ready`, `processing`, `failed`, `deleted`.
- Artifact: `pending`, `available`, `deleting`, `deleted`, `failed`.
- Job: `queued`, `processing`, `completed`, `failed`, `retrying`, `cancelled`.

## 4. Retention

- Guest document mặc định `expires_at = created_at + 1 hour`.
- Cleanup query dùng index partial trên record chưa xóa và đã hết hạn.
- Xóa theo hai bước: mark deleting trong transaction → xóa object → mark deleted.
- Reconciliation job tìm artifact `deleting/failed` để thử lại có giới hạn và cảnh báo.

## 5. Migration

Dùng Alembic. Migration production phải forward-compatible với ít nhất một phiên bản app trước; thay đổi phá vỡ dùng expand → migrate → contract.

## 6. Backup

- Database có point-in-time recovery theo khả năng nhà cung cấp.
- Backup không thay đổi cam kết retention: cần chính sách xóa/expiry phù hợp và tài liệu hóa giới hạn khôi phục.
- Object versioning chỉ bật nếu chính sách xóa dữ liệu đã xử lý được version cũ.
