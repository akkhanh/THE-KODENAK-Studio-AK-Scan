# Pipeline xử lý ảnh và OCR

## 1. Mục tiêu

Biến ảnh chụp/PDF thành trang scan thẳng, nền sạch, chữ rõ và giữ được bảng, vùng màu hoặc con dấu khi chế độ cho phép. Mọi thao tác diễn ra cục bộ trong trình duyệt.

## 2. Pipeline render trang

`renderPage(page, maxEdge)` trong `lib/scan.ts` thực hiện:

1. Decode Blob URL thành ảnh.
2. Clamp và sắp thứ tự bốn góc.
3. Perspective warp bằng lưới tam giác cục bộ.
4. Nếu bật dewarp: đo độ lệch baseline theo các dải dọc, làm mượt đường cong và dịch dải về cùng đường cơ sở.
5. Auto deskew từ gradient dòng chữ, cộng thêm `fineRotation` do người dùng chỉnh.
6. Xoay 0/90/180/270 độ.
7. Giới hạn kích thước đầu ra theo `maxEdge`.
8. Chạy filter và trả Canvas.

## 3. Dò mép tài liệu

`detectDocumentCorners` downscale ảnh, chuyển grayscale, tính gradient/edge và tìm các đường biên ứng viên. Giao điểm được chấm điểm theo diện tích, convexity, tỷ lệ và độ mạnh cạnh.

Kết quả gồm bốn tọa độ chuẩn hóa và confidence. UI chỉ tự áp dụng khi confidence từ 0,58; nếu thấp sẽ giữ góc hiện tại và yêu cầu người dùng kiểm tra tay.

## 4. Cân thẳng và làm phẳng

- Auto deskew lấy profile gradient ngang và tìm góc có score tốt nhất.
- `fineRotation` cho phép chỉnh thêm từ −3° đến +3°.
- Dewarp chia trang thành 16–28 vùng để ước lượng độ lệch dòng; output chia đến 120 dải dọc để hiệu chỉnh mượt.
- Skew và curvature cache tối đa 40 entry để tránh tính lại liên tục.

Dewarp phù hợp độ cong vừa và dạng hình trụ. Trang sách cong mạnh sát gáy vẫn có thể cần mô hình mesh 2D/deep learning trong tương lai.

## 5. Các chế độ filter

- `original`: giữ nguyên màu và không áp dụng các slider làm sạch.
- `enhanced`: chuẩn hóa bóng/nền cục bộ, tăng sáng và tương phản nhưng giữ màu quan trọng.
- `grayscale`: bỏ màu sau bước loại bóng và cân nền.
- `bw`: phân ngưỡng trắng/đen có bảo vệ vùng màu để hạn chế mất chữ trong ô màu.

Slider hiện tại: brightness, contrast, whiten, removeShadow và sharpen. Preset không-original bắt đầu ở 8/22/20/28/18 nhưng có thể chỉnh từng trang hoặc áp dụng settings cho mọi trang.

## 6. Làm sạch nền

Shadow removal dùng ảnh grayscale và background map cục bộ để giảm bóng không đều. Whiten đẩy vùng sáng về trắng; contrast và brightness được áp dụng sau normalization. Sharpen dùng kernel cục bộ với giá trị được clamp tự nhiên bởi `Uint8ClampedArray`.

## 7. Đánh giá chất lượng

`analyzeImageQuality` lấy mẫu ảnh nhỏ để đánh giá kích thước và sharpness. Cảnh báo được hiển thị ở thumbnail và bảng điều khiển. Quality warning không tự chặn export.

## 8. OCR và searchable PDF

Tesseract.js tạo worker với hai ngôn ngữ `vie` và `eng`. Với searchable PDF:

1. Render từng trang theo chất lượng xuất.
2. Tesseract nhận dạng và sinh PDF có text layer.
3. pdf-lib nạp PDF từng trang và ghép vào tài liệu cuối.
4. Worker được terminate trong `finally`.

Tiến độ OCR được ánh xạ vào progress tổng. Người dùng có thể yêu cầu hủy; việc hủy được kiểm tra giữa các trang.

## 9. Xuất Word

- Nếu PDF có embedded text hợp lệ, dùng text đó để giảm sai OCR.
- Nếu không, OCR grayscale đã tăng removeShadow/whiten.
- Nếu confidence dưới 94, chạy thêm enhanced pass và chọn kết quả confidence cao hơn.
- Line confidence dưới 82 được tô vàng trong DOCX.
- `detectTableGrid` tìm các đường ngang/dọc; word được đưa vào cell theo tâm bounding box.
- Output ưu tiên đúng chữ và tái tạo bảng đơn giản, không cam kết pixel-perfect.

Mọi text trước khi vào DOCX đều được loại null byte, control character và lone surrogate.

## 10. Export PDF ảnh

Hỗ trợ A4, Letter hoặc vừa ảnh; lề 0/8/15 mm; chất lượng compact/balanced/high. Trang trắng đen dùng PNG lossless, các filter khác dùng JPEG theo quality đã chọn.

## 11. Hướng kiểm thử chất lượng

Golden dataset nên bao gồm tài liệu Việt/Anh, bảng, con dấu, ô màu, nền tối, bóng, ảnh nghiêng, trang cong và PDF đã nén. Chỉ số cần theo dõi: corner confidence, skew residual, foreground loss, OCR confidence/CER và peak memory.
