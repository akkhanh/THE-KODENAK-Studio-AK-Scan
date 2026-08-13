import { BookOpen, FileImage, FileText, FileWarning, LockKeyhole, Scale, ScanSearch } from "lucide-react";

const items = [
  [ScanSearch, "Workspace", "#workspace"], [BookOpen, "Bắt đầu", "#bat-dau"],
  [FileImage, "Ảnh & PDF", "#anh-pdf"], [FileText, "Workflow", "#workflow"],
  [LockKeyhole, "Quyền riêng tư", "#quyen-rieng-tu"], [FileWarning, "Giới hạn", "#gioi-han"],
  [Scale, "Điều khoản", "#dieu-khoan"],
] as const;

export function PageToc() {
  return <aside className="page-toc" aria-label="Mục lục trang"><p>MỤC LỤC</p><nav>{items.map(([Icon, label, href]) => <a key={href} href={href} title={label}><Icon size={17} /><span>{label}</span></a>)}</nav></aside>;
}
