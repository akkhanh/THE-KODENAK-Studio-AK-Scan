# Kiến trúc AK Scan

> Cập nhật theo source hiện tại. AK Scan là ứng dụng Next.js xử lý tài liệu hoàn toàn trong trình duyệt, không có API upload, database hay backend xử lý ảnh.

## 1. Tổng quan

```text
Ảnh/PDF trên máy người dùng
        │
        ▼
File API + kiểm tra magic bytes
        │
        ├── Ảnh → Blob URL
        └── PDF → PDF.js Worker → Canvas lossless
                           │
                           ▼
Canvas pipeline: crop → perspective → dewarp → deskew → filter
                           │
              ┌────────────┼─────────────┐
              ▼            ▼             ▼
           jsPDF       Tesseract.js      docx
              │         + pdf-lib         │
              ▼            ▼             ▼
            PDF      Searchable PDF      DOCX
```

Next.js chỉ cung cấp HTML, CSS, JavaScript và các asset tĩnh. Sau khi trang được tải, file người dùng không được gửi về máy chủ AK Scan.

## 2. Công nghệ đang sử dụng

- Next.js 16 App Router, React 19 và TypeScript.
- Canvas API cho toàn bộ pipeline xử lý pixel.
- PDF.js (`pdfjs-dist`) và `public/pdf.worker.min.mjs` để đọc PDF.
- Tesseract.js 7 chạy OCR Việt + Anh bằng WebAssembly/Worker.
- jsPDF để tạo PDF ảnh.
- pdf-lib để ghép các trang searchable PDF do OCR tạo.
- docx để tạo Word, paragraph và bảng.
- dnd-kit để sắp xếp trang.
- Lucide React cho icon giao diện.

## 3. Cấu trúc source

```text
app/
  page.tsx              Điểm vào trang chủ
  layout.tsx            Metadata và layout gốc
  globals.css           Toàn bộ giao diện responsive
components/
  scan-workspace.tsx    Quản lý phiên, input, OCR và export
  scan-preview.tsx      Render preview và chỉnh bốn góc
  export-dialog.tsx     Tùy chọn file đầu ra
  home-guide.tsx        Hướng dẫn, riêng tư và điều khoản
lib/
  scan.ts               Thuật toán ảnh và render pipeline
  upload-security.ts    Xác thực input, sanitize và timeout
public/
  pdf.worker.min.mjs    Worker PDF.js dùng ở runtime
.github/workflows/
  deploy-pages.yml      Build và deploy GitHub Pages
```

## 4. Trạng thái phiên

`ScanWorkspace` giữ danh sách tối đa 20 `ScanPage` trong React state. Mỗi trang chứa Blob URL, tên, rotation, fine rotation, dewarp, bốn góc chuẩn hóa, filter settings, cảnh báo chất lượng và optional embedded PDF text.

Blob URL được thu hồi khi xóa trang, xóa phiên hoặc unmount component. Không có persistence: tải lại hoặc đóng tab sẽ mất phiên chỉnh sửa.

## 5. Luồng nhập file

### Ảnh

1. Đọc tối đa 1.024 byte đầu và xác minh JPEG/PNG/WebP magic bytes.
2. Từ chối file rỗng, trên 15 MB, decode lỗi, timeout hoặc trên 24 MP.
3. Tạo Blob URL và đánh giá độ nét/chất lượng ban đầu.

### PDF

1. Xác minh `%PDF-` trong 1.024 byte đầu và giới hạn 40 MB.
2. PDF.js mở file với timeout 30 giây.
3. Mỗi trang được render nền trắng, cạnh dài tối đa 2.800 px.
4. Canvas được lưu thành PNG lossless để tránh nén JPEG trung gian.
5. Text layer có sẵn được sanitize và giữ cho xuất Word.

Tổng pixel của một phiên bị giới hạn 160 triệu để giảm nguy cơ tab hết RAM.

## 6. Triển khai

Local dùng `npm run dev`. Production có server Next.js có thể dùng `npm run build && npm run start` và nhận security headers từ `next.config.ts`.

Trong GitHub Actions, cấu hình tự bật `output: "export"`, xác định `basePath` từ `GITHUB_REPOSITORY` và tạo thư mục `out`. Workflow deploy `out` lên GitHub Pages. PDF worker cũng dùng base path động nên hoạt động ở cả domain gốc và project site.

## 7. Giới hạn kiến trúc

- Xử lý pixel nặng vẫn chạy trên main thread; PDF và OCR có worker riêng.
- Hiệu năng phụ thuộc CPU/RAM của thiết bị người dùng.
- Không có tài khoản, lưu lịch sử hoặc đồng bộ thiết bị.
- GitHub Pages không áp dụng custom HTTP security headers của Next.js.
- OCR có thể cần tải model ngôn ngữ và không đảm bảo chính xác tuyệt đối.
