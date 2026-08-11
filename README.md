# AK Scan — Bộ tài liệu khởi động dự án

AK Scan là website biến ảnh chụp tài liệu thành bản scan sạch và xuất PDF, searchable PDF, Word hoặc TXT.

## Thứ tự đọc

1. [01-PRD.md](01-PRD.md) — phạm vi và yêu cầu sản phẩm.
2. [02-ARCHITECTURE.md](02-ARCHITECTURE.md) — kiến trúc và quyết định công nghệ.
3. [03-API-SPEC.md](03-API-SPEC.md) — hợp đồng API MVP.
4. [04-DATABASE.md](04-DATABASE.md) — mô hình dữ liệu.
5. [05-IMAGE-OCR-PIPELINE.md](05-IMAGE-OCR-PIPELINE.md) — pipeline scan và OCR.
6. [06-SECURITY-PRIVACY.md](06-SECURITY-PRIVACY.md) — bảo mật, riêng tư và lưu trữ.
7. [07-ENGINEERING-GUIDE.md](07-ENGINEERING-GUIDE.md) — cấu trúc repo và quy ước phát triển.
8. [08-TEST-PLAN.md](08-TEST-PLAN.md) — chiến lược kiểm thử và nghiệm thu.
9. [09-MVP-BACKLOG.md](09-MVP-BACKLOG.md) — epic, user story và thứ tự triển khai.
10. [10-DEPLOYMENT-RUNBOOK.md](10-DEPLOYMENT-RUNBOOK.md) — môi trường, triển khai và vận hành.
11. [11-DECISIONS-AND-OPEN-QUESTIONS.md](11-DECISIONS-AND-OPEN-QUESTIONS.md) — quyết định đã chốt và câu hỏi còn mở.

## Stack MVP đã chốt

- Frontend: Next.js + TypeScript.
- API: Python + FastAPI.
- Xử lý ảnh: OpenCV, Pillow, NumPy.
- OCR: PaddleOCR qua lớp provider độc lập.
- Tác vụ nền: Celery + Redis.
- Database: PostgreSQL.
- File: S3-compatible object storage (Cloudflare R2 hoặc Amazon S3).
- PDF: PyMuPDF.
- Word: python-docx.
- Đóng gói: Docker.

## Definition of Ready để bắt đầu code

- Đọc và chốt các câu hỏi P0 trong file 11.
- Chuẩn bị tối thiểu 50 ảnh mẫu nội bộ, không chứa dữ liệu nhạy cảm thật.
- Tạo repo, môi trường local và CI.
- Chốt object storage cho dev/staging.
- Chốt giới hạn file/trang của MVP.

## Definition of Done của MVP

Người dùng có thể tải tối đa 20 ảnh, chỉnh bốn góc, làm sạch trang, sắp xếp trang, OCR tiếng Việt/Anh và tải PDF, searchable PDF, DOCX hoặc TXT. Tài liệu khách được tự động xóa đúng hạn và không thể bị truy cập chéo.
