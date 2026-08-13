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

## 12. Kế hoạch cải thiện độ chính xác OCR

Mục tiêu là giảm cả hai nhóm lỗi: ký tự rác được chèn thêm và chữ thật bị bỏ sót. Không dùng confidence toàn trang làm tiêu chí duy nhất vì một trang có confidence cao vẫn có thể chứa nhiều ký tự đơn lẻ sai.

### 12.1. Phân loại đầu vào trước OCR

- PDF có text layer hợp lệ dùng text và tọa độ gốc từ PDF.js, không OCR lại toàn trang.
- Trang scan được phân loại sơ bộ theo ngôn ngữ, số cột, mật độ chữ và loại nội dung trước khi chọn cấu hình OCR.
- Trang tiếng Anh chỉ dùng `eng`; trang tiếng Việt hoặc song ngữ mới dùng `vie+eng` để tránh tăng tập ký tự không cần thiết.
- Chọn page segmentation mode theo bố cục: văn bản một cột, nhiều cột, vùng chữ rời hoặc bảng không dùng chung một cấu hình cố định.

### 12.2. Tiền xử lý thích nghi

- Đo DPI/kích thước chữ ước lượng và upscale khi chữ quá nhỏ.
- Deskew trước OCR; không chạy OCR trên trang còn nghiêng đáng kể.
- Cắt viền và vùng nhiễu ngoài nội dung, nhưng giữ khoảng trắng an toàn quanh chữ.
- Tạo tối đa hai biến thể grayscale/binary có tham số thích nghi theo độ tương phản, thay vì ép mọi trang qua cùng mức whiten/removeShadow.
- Chỉ chạy biến thể thứ hai trên trang hoặc vùng có chất lượng thấp.

### 12.3. Chọn kết quả theo vùng

- So sánh OCR theo dòng hoặc block, không chọn nguyên một pass chỉ bằng confidence toàn trang.
- Với vùng bất đồng, ưu tiên kết quả có confidence từ, tính hợp lệ ngôn ngữ, trật tự đọc và khoảng cách hình học tốt hơn.
- OCR lại riêng các dòng có confidence thấp bằng crop độ phân giải cao và page segmentation phù hợp.
- Không chạy pass hai cho các vùng đã có kết quả tốt để giảm thời gian và RAM.

### 12.4. Lọc ký tự rác an toàn

- Dựng dòng từ danh sách word/symbol có bounding box; không đưa nguyên `line.text` vào Word.
- Loại token confidence rất thấp nếu token chỉ là một ký tự bất thường, nằm lệch baseline, quá nhỏ hoặc cách xa các từ còn lại.
- Không xóa máy móc chữ số, dấu câu hoặc ký tự tiếng Việt hợp lệ. Token thấp confidence nhưng phù hợp ngữ cảnh được giữ và đánh dấu cần kiểm tra.
- Chuẩn hóa khoảng trắng, dấu câu lặp, ký tự điều khiển và các chuỗi rác phổ biến sau OCR.
- Giữ bản OCR thô nội bộ trong phiên để có thể đối chiếu khi bộ lọc loại nhầm.

### 12.5. Quality gate trước khi tạo Word

- Tính confidence theo block/dòng và tỷ lệ token bị lọc.
- Cảnh báo nếu trang có quá nhiều token thấp confidence, dòng mất cân đối hoặc số ký tự thay đổi bất thường giữa hai pass.
- Word mặc định chỉ chứa kết quả đã lọc; vùng chưa chắc chắn được tô vàng theo từng từ thay vì tô cả dòng.
- Cho phép người dùng chọn ngôn ngữ `Tự động`, `Tiếng Việt`, `Tiếng Anh`, hoặc `Việt + Anh` khi tự động nhận sai.

### 12.6. Thứ tự triển khai

1. Dựng lại text từ word-level OCR và lọc token rác có bảo toàn dấu câu.
2. Chọn ngôn ngữ và page segmentation mode thích nghi.
3. OCR lại theo vùng confidence thấp thay vì chạy lại toàn trang.
4. Bổ sung phân tích nhiều cột, nhiều bảng và thứ tự đọc.
5. Đo CER/WER, thời gian và peak memory trên golden dataset trước khi bật mặc định.
