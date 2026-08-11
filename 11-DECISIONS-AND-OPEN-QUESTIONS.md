# Quyết định và câu hỏi còn mở

## 1. Quyết định đã chốt

| ID | Quyết định | Trạng thái |
|---|---|---|
| ADR-001 | Python + FastAPI cho backend | Chốt |
| ADR-002 | Modular monolith, API và worker triển khai riêng | Chốt |
| ADR-003 | OpenCV/Pillow/NumPy cho xử lý ảnh | Chốt |
| ADR-004 | PaddleOCR mặc định sau interface provider | Chốt cho prototype |
| ADR-005 | Celery + Redis cho MVP | Chốt |
| ADR-006 | PostgreSQL lưu metadata, object storage lưu file | Chốt |
| ADR-007 | PyMuPDF và python-docx cho export | Chốt |
| ADR-008 | Upload/download trực tiếp bằng presigned URL | Chốt |
| ADR-009 | Guest dùng trước, không bắt đăng ký | Chốt |
| ADR-010 | DOCX MVP ưu tiên chỉnh sửa, không pixel-perfect | Chốt |

## 2. Câu hỏi P0 cần chốt trước sprint 1

- Frontend có xác nhận dùng Next.js/TypeScript không?
- Object storage chọn Cloudflare R2, AWS S3 hay MinIO cho từng môi trường?
- Hạ tầng production dự kiến ở nhà cung cấp/khu vực nào?
- Giới hạn chính thức: MB/file, megapixel/file, trang/document và concurrent jobs?
- Guest retention một giờ có phù hợp hay cần thời gian khác?
- Có cho phép dùng OCR cloud làm fallback không? Nếu có, cần consent và khu vực dữ liệu nào?
- Mục tiêu tải beta: user đồng thời, trang/ngày và tỷ lệ OCR?
- Có cho phép scan giấy tờ định danh và dữ liệu tài chính không?

## 3. Câu hỏi P1 trước public beta

- Cơ chế tài khoản: tự xây hay dùng Clerk/Auth0/Supabase Auth?
- Gói miễn phí/trả phí và quota OCR.
- Lịch sử tài liệu cho tài khoản được lưu bao lâu?
- Có cần CAPTCHA/anti-bot ở guest flow?
- Hỗ trợ format/khổ giấy theo thị trường nào ngoài Việt Nam?
- Kênh hỗ trợ và SLA phản hồi lỗi tài liệu.

## 4. Spike kỹ thuật cần làm

- So sánh PaddleOCR/Tesseract/ít nhất một cloud OCR trên holdout Việt.
- Benchmark CPU trước khi quyết định GPU.
- So sánh thuật toán shadow removal/threshold trên dấu tiếng Việt.
- Kiểm chứng HEIC decode trong image container production.
- Kiểm chứng searchable PDF Unicode và selection order.
- Kiểm chứng DOCX với Word desktop và Google Docs.

## 5. Mẫu ADR mới

```text
# ADR-XXX — Tên quyết định
Status: Proposed | Accepted | Superseded
Date:
Context:
Decision:
Consequences:
Alternatives considered:
```
