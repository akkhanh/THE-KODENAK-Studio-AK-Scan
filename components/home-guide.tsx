import { BookOpen, Check, Download, FileImage, FileText, FileWarning, LockKeyhole, ScanSearch, Scale, SlidersHorizontal } from "lucide-react";

const steps = [
  [FileImage, "01", "Chọn tài liệu", "Chọn JPG, PNG, WebP, PDF hoặc mở camera. PDF nhiều trang sẽ được tách thành từng trang."],
  [ScanSearch, "02", "Căn lại trang", "Dùng Tự dò mép, kiểm tra bốn góc, cân thẳng và làm phẳng giấy cong khi cần."],
  [SlidersHorizontal, "03", "Làm sạch", "Chọn Tăng cường, Xám hoặc Trắng đen rồi chỉnh nền, bóng và độ nét."],
  [Download, "04", "Xuất kết quả", "Chọn khổ giấy, chất lượng và tải PDF; có thể bật OCR hoặc xuất Word."],
] as const;

export function HomeGuide() {
  return <section className="home-guide" id="huong-dan">
    <header className="guide-hero"><div><p className="overline">Hướng dẫn &amp; thông tin sử dụng</p><h2>Mọi điều cần biết trước khi bắt đầu</h2><p>Một quy trình duy nhất để scan sạch, kiểm tra kết quả và sử dụng tài liệu an toàn.</p></div><div className="guide-free"><span>MIỄN PHÍ</span><strong>Phát hành trên GitHub</strong><small>Bản quyền akkhanh — THE KODENAK</small></div></header>
    <div className="guide-layout">
      <aside className="guide-nav"><p>MỤC LỤC</p><nav aria-label="Mục lục hướng dẫn"><a href="#bat-dau"><BookOpen size={17} />Bắt đầu</a><a href="#anh-pdf"><FileText size={17} />Ảnh &amp; PDF</a><a href="#quyen-rieng-tu"><LockKeyhole size={17} />Quyền riêng tư</a><a href="#gioi-han"><FileWarning size={17} />Giới hạn</a><a href="#dieu-khoan"><Scale size={17} />Điều khoản</a></nav></aside>
      <div className="guide-content">
        <article className="guide-card" id="bat-dau"><p className="overline">Quy trình 4 bước</p><h3>Làm đúng ngay từ lần đầu</h3><div className="guide-steps">{steps.map(([Icon, number, title, text]) => <section key={number}><span>{number}</span><Icon size={21} /><h4>{title}</h4><p>{text}</p></section>)}</div></article>
        <article className="guide-card" id="anh-pdf"><p className="overline">Chuẩn bị đầu vào</p><h3>Ảnh rõ sẽ cho bản scan tốt hơn</h3><ul className="check-list"><li><Check />Đặt giấy trên nền tương phản và đủ sáng.</li><li><Check />Giữ camera song song, chụp đủ bốn góc và tránh rung.</li><li><Check />Không che nội dung bằng tay hoặc bóng điện thoại.</li><li><Check />Ưu tiên ảnh gốc chưa gửi qua ứng dụng chat.</li></ul><div className="format-grid"><div><FileImage /><strong>Ảnh</strong><p>Phù hợp nhất với tài liệu vừa chụp bằng điện thoại.</p></div><div><FileText /><strong>PDF</strong><p>Mỗi trang được dựng lossless rồi dùng chung pipeline tăng cường.</p></div></div><div className="tip-box"><strong>Giấy hoặc trang sách bị cong?</strong><p>Căn đúng bốn góc trước, sau đó bật <b>Làm phẳng giấy cong</b>.</p></div></article>
        <article className="guide-card" id="quyen-rieng-tu"><p className="overline">Riêng tư theo thiết kế</p><h3>Tài liệu không được tải lên máy chủ</h3><p>Ảnh, PDF và nội dung OCR được xử lý trong bộ nhớ trình duyệt. AK Scan không có API upload hay kho lưu tài liệu.</p><div className="privacy-flow"><span>File trên máy</span><b>→</b><span>Trình duyệt xử lý</span><b>→</b><span>Tải kết quả xuống</span></div><div className="notice-box"><strong>Khi dùng máy tính chung</strong><p>Hãy xóa phiên, đóng tab và bảo vệ file trong thư mục tải xuống sau khi hoàn tất.</p></div></article>
        <article className="guide-card" id="gioi-han"><p className="overline">Giới hạn xử lý</p><h3>Hiệu năng phụ thuộc thiết bị</h3><div className="limit-grid"><div><strong>20</strong><span>trang tối đa</span></div><div><strong>15 MB</strong><span>mỗi ảnh</span></div><div><strong>40 MB</strong><span>mỗi PDF</span></div><div><strong>24 MP</strong><span>mỗi ảnh</span></div></div><p>Ảnh rung, chữ quá nhỏ, giấy nhàu mạnh, PDF đã nén nhiều lần và trang sách cong sát gáy có thể không phục hồi hoàn toàn. OCR có thể đọc sai; luôn đối chiếu Word với bản gốc.</p></article>
        <article className="guide-card" id="dieu-khoan"><p className="overline">Bản quyền &amp; điều khoản</p><h3>Miễn phí để sử dụng, có trách nhiệm khi dùng</h3><p>AK Scan thuộc quyền tác giả của <strong>akkhanh — THE KODENAK</strong> và sẽ được phát hành miễn phí trên GitHub. Quyền sửa đổi, phân phối mã nguồn tuân theo giấy phép đi kèm repository.</p><div className="terms-grid"><div><strong>Được sử dụng miễn phí</strong><p>Cho công việc cá nhân, học tập và văn phòng.</p></div><div><strong>Phải kiểm tra kết quả</strong><p>AK Scan là công cụ hỗ trợ, không xác nhận tính pháp lý của tài liệu.</p></div><div><strong>Không sử dụng sai mục đích</strong><p>Không giả mạo giấy tờ, làm sai lệch nội dung hoặc xâm phạm quyền của người khác.</p></div></div></article>
      </div>
    </div>
  </section>;
}
