# API Specification — MVP

**Base path:** `/v1`  
**Format:** JSON, trừ upload trực tiếp  
**Auth:** Bearer token hoặc signed guest session cookie

## 1. Quy ước

- ID là UUID/ULID không đoán được.
- Thời gian ISO-8601 UTC.
- Mutation quan trọng nhận header `Idempotency-Key`.
- Lỗi có dạng:

```json
{
  "error": {
    "code": "IMAGE_TOO_LARGE",
    "message": "Ảnh vượt quá giới hạn cho phép.",
    "request_id": "req_...",
    "details": {}
  }
}
```

## 2. Documents

### `POST /documents`

Tạo tài liệu. Request có `name` tùy chọn. Response trả `id`, `status`, `page_count`, `expires_at`.

### `GET /documents/{document_id}`

Trả document, pages theo order, job/export gần nhất. Không trả storage key nội bộ.

### `PATCH /documents/{document_id}`

Đổi tên hoặc cấu hình OCR mặc định.

### `DELETE /documents/{document_id}`

Đánh dấu deleting, hủy job chưa chạy và enqueue cleanup. Idempotent.

## 3. Pages và upload

### `POST /documents/{document_id}/pages/upload-url`

```json
{
  "filename": "IMG_0012.HEIC",
  "content_type": "image/heic",
  "file_size": 5242880
}
```

Trả `page_id`, `upload_url`, headers bắt buộc và `expires_at`.

### `POST /pages/{page_id}/upload-complete`

Xác minh object và enqueue inspect/detect. Không tin metadata client.

### `PATCH /pages/{page_id}/corners`

```json
{
  "version": 2,
  "corners": {
    "top_left": [0.05, 0.04],
    "top_right": [0.96, 0.05],
    "bottom_right": [0.97, 0.95],
    "bottom_left": [0.04, 0.96]
  }
}
```

Tọa độ normalized 0..1 theo ảnh đã sửa orientation.

### `POST /pages/{page_id}/detect`

Phát hiện lại và trả job.

### `POST /pages/{page_id}/preview`

```json
{
  "version": 3,
  "filter": "black_and_white",
  "settings": {
    "brightness": 0,
    "contrast": 15,
    "whiten_background": 70,
    "sharpen": 20,
    "remove_shadow": 60
  }
}
```

### `PATCH /documents/{document_id}/page-order`

Nhận danh sách đầy đủ `page_ids` và optimistic `document_version`.

### `DELETE /pages/{page_id}`

Soft delete ngay khỏi UI; object được cleanup nền.

## 4. OCR

### `POST /documents/{document_id}/ocr`

```json
{"languages": ["vi", "en"], "pages": "all"}
```

### `GET /pages/{page_id}/ocr`

Trả full text, blocks, confidence và version.

### `PATCH /pages/{page_id}/ocr`

Lưu nội dung người dùng sửa, kèm `ocr_version` để chống ghi đè.

## 5. Export

### `POST /documents/{document_id}/exports`

```json
{
  "format": "searchable_pdf",
  "page_size": "A4",
  "orientation": "auto",
  "margin": "small",
  "quality": "high",
  "compression": "balanced",
  "filename": "tai-lieu"
}
```

Format: `image_pdf`, `searchable_pdf`, `docx`, `txt`, `jpg_zip`, `png_zip`.

### `GET /exports/{export_id}`

Trả trạng thái, progress, size và expiry.

### `GET /exports/{export_id}/download`

Trả URL GET có hạn; không redirect tới object public.

## 6. Jobs

### `GET /jobs/{job_id}`

```json
{
  "id": "...",
  "status": "processing",
  "progress": 65,
  "current_step": "recognizing_text",
  "page_id": "...",
  "error": null
}
```

### `POST /jobs/{job_id}/retry`

Chỉ cho loại lỗi retryable và chủ sở hữu hợp lệ.

### `GET /documents/{document_id}/events`

SSE cho job/page/export events. Client fallback về polling có jitter.

## 7. HTTP status chính

- `200/201/202/204`: thành công/tạo/đã nhận job/xóa.
- `400`: input sai.
- `401/403`: thiếu identity/không có quyền.
- `404`: không tồn tại hoặc cố tình che resource khác chủ.
- `409`: version/idempotency conflict.
- `413`: quá dung lượng.
- `415`: định dạng không hỗ trợ.
- `422`: ảnh hợp lệ về file nhưng không thể xử lý.
- `429`: vượt quota/rate.

## 8. OpenAPI

FastAPI OpenAPI là hợp đồng máy đọc. CI phải phát hiện breaking change; examples trong file này phải được đồng bộ với schema code.
