# Engineering Guide

## 1. Monorepo đề xuất

```text
AK_Scan/
├── apps/
│   ├── web/
│   └── api/
├── workers/
│   ├── image/
│   ├── ocr/
│   ├── export/
│   └── cleanup/
├── packages/
│   ├── api-client/
│   └── shared-schemas/
├── infra/
├── docs/
├── tests/
│   ├── fixtures/
│   └── e2e/
├── docker-compose.yml
└── README.md
```

Trong Python có thể dùng chung package `backend` giữa API/worker để giữ modular monolith; Docker command quyết định process chạy.

## 2. Backend layout

```text
backend/app/
├── api/
├── core/
├── database/
├── models/
├── schemas/
├── repositories/
├── services/
│   ├── image_processing/
│   ├── ocr/
│   ├── exports/
│   └── storage/
├── tasks/
└── main.py
```

Route handler không chứa thuật toán hoặc truy vấn phức tạp. Repository xử lý persistence; service xử lý use case; provider bọc hệ thống ngoài.

## 3. Quy ước code

- Python typed, formatter/linter thống nhất, strict schema cho API.
- TypeScript strict mode.
- Không dùng dictionary tùy ý ở boundary nếu có thể định nghĩa model.
- UTC trong backend; timezone chỉ ở UI.
- Structured logging và request/job correlation ID.
- Config qua environment validation; app fail fast khi thiếu config.
- Không commit secret, file tài liệu thật hoặc artifact nặng.

## 4. Branch và review

- PR nhỏ theo vertical slice.
- Thay schema phải có migration và backward-compatibility note.
- Thay API phải cập nhật OpenAPI/client/tests/docs.
- Thay pipeline phải có before/after benchmark và tăng version khi kết quả có ý nghĩa.

## 5. Local development

Docker Compose tối thiểu: PostgreSQL, Redis, S3 emulator hoặc bucket dev, API và một worker. Seed chỉ dùng fixture giả/đã ẩn dữ liệu.

## 6. CI bắt buộc

- Lint và type check web/backend.
- Unit tests.
- Migration check.
- API schema compatibility.
- Integration test với Postgres/Redis/storage.
- Build Docker image.
- Dependency và secret scan.
- Image golden tests có thể chạy subset nhanh ở PR, full suite theo lịch.

## 7. Definition of Done cho story

- Acceptance criteria đạt.
- Có test tương ứng.
- Error/empty/loading state đầy đủ.
- Metrics/log an toàn được thêm nếu cần.
- Docs/schema/migration cập nhật.
- Không làm tăng regression vượt ngưỡng benchmark.
