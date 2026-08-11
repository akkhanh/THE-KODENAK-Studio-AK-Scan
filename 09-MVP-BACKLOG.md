# MVP Backlog

Ưu tiên: P0 bắt buộc, P1 nên có trong MVP, P2 sau MVP. Estimate dùng story point tương đối và cần team refine.

## Epic 0 — Nền tảng (P0)

- E0-1: Khởi tạo monorepo, lint, type check, test và CI.
- E0-2: Docker local cho API, worker, Postgres, Redis và storage.
- E0-3: Config validation, migration, structured log và request ID.
- E0-4: Health/readiness endpoint và error schema.

## Epic 1 — Identity và document lifecycle (P0)

- E1-1: Guest session an toàn.
- E1-2: CRUD document có ownership.
- E1-3: Retention field, delete state machine và cleanup worker.
- E1-4: Quota/rate-limit nền tảng.

## Epic 2 — Upload (P0)

- E2-1: Presigned upload URL.
- E2-2: Upload complete và object validation.
- E2-3: HEIC/JPG/PNG/WebP decode, EXIF orientation.
- E2-4: Thumbnail và progress UI.
- E2-5: Multi-upload tối đa 20 trang.

## Epic 3 — Scan editor (P0)

- E3-1: Auto corner detection + confidence.
- E3-2: UI chỉnh bốn góc, zoom và rotate.
- E3-3: Perspective transform.
- E3-4: Preset color/grayscale/B&W.
- E3-5: Controls sáng/tương phản/trắng nền/sắc nét/xóa bóng.
- E3-6: Page reorder/delete/add và optimistic version.

## Epic 4 — Job system (P0)

- E4-1: Celery queues và DB job state.
- E4-2: Progress events qua SSE + polling fallback.
- E4-3: Retry/backoff, deduplication và stale-result protection.
- E4-4: Trang lỗi độc lập và retry UI.

## Epic 5 — PDF ảnh (P0)

- E5-1: Full-resolution render.
- E5-2: PDF A4/Letter/fit, margin và compression.
- E5-3: Private download URL và filename sanitation.

## Epic 6 — OCR (P0)

- E6-1: OCRProvider + PaddleOCR implementation.
- E6-2: Normalize block/line/word/confidence.
- E6-3: OCR editor và low-confidence highlight.
- E6-4: Bộ benchmark Việt/Anh và regression report.

## Epic 7 — Export nâng cao (P0/P1)

- E7-1 P0: Searchable PDF Unicode.
- E7-2 P0: TXT.
- E7-3 P0: DOCX đoạn văn + page break.
- E7-4 P1: Heading/list/simple table heuristics.
- E7-5 P1: JPG/PNG ZIP.

## Epic 8 — Bảo mật/vận hành (P0)

- E8-1: IDOR suite và storage least privilege.
- E8-2: Safe logging/Sentry scrubbing.
- E8-3: Metrics queue/latency/error/cleanup.
- E8-4: Alert và runbook.
- E8-5: Dependency/secret/container scanning.

## Milestone đề xuất

### M0 — Technical prototype

Một ảnh: detect → manual corners → enhance → OCR → PDF/DOCX thử nghiệm. Benchmark lựa chọn preset/provider.

### M1 — Internal alpha

Multi-page, job system, PDF ảnh, guest session, cleanup và editor cơ bản.

### M2 — Closed beta

OCR editor, searchable PDF, DOCX, bảo mật, metrics và performance baseline.

### M3 — Public MVP

Ổn định mobile, quota/rate limit, support flow, privacy copy và release gate đầy đủ.
