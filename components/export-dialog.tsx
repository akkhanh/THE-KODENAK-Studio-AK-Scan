"use client";

import { useEffect, useRef } from "react";
import { FileDown, X } from "lucide-react";

export type PageSize = "a4" | "letter" | "fit";
export type PdfMargin = "none" | "small" | "large";
export type PdfQuality = "compact" | "balanced" | "high";
export type ExportFormat = "pdf" | "docx";
export interface ExportOptions { pageSize: PageSize; margin: PdfMargin; quality: PdfQuality; searchable: boolean; format: ExportFormat; }

export function ExportDialog({ open, pageCount, options, onChange, onClose, onExport }: { open: boolean; pageCount: number; options: ExportOptions; onChange: (options: ExportOptions) => void; onClose: () => void; onExport: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current; if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className="export-dialog" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === ref.current) onClose(); }} aria-labelledby="export-title">
    <div className="dialog-head"><div className="dialog-icon"><FileDown size={20} /></div><div><h2 id="export-title">Xuất PDF scan</h2><p>{pageCount} trang sẽ được xử lý trên thiết bị này.</p></div><button onClick={onClose} aria-label="Đóng tùy chọn xuất"><X size={19} /></button></div>
    <div className="dialog-body">
      <fieldset><legend>Khổ trang</legend><div className="choice-grid three">{([ ["a4", "A4", "210 × 297 mm"], ["letter", "Letter", "216 × 279 mm"], ["fit", "Vừa ảnh", "Theo tỷ lệ ảnh"] ] as const).map(([value, label, note]) => <label key={value} className={options.pageSize === value ? "selected" : ""}><input type="radio" name="page-size" value={value} checked={options.pageSize === value} onChange={() => onChange({ ...options, pageSize: value })} /><strong>{label}</strong><span>{note}</span></label>)}</div></fieldset>
      <fieldset><legend>Lề trang</legend><div className="choice-grid">{([ ["none", "Không lề"], ["small", "Nhỏ · 8 mm"], ["large", "Rộng · 15 mm"] ] as const).map(([value, label]) => <label key={value} className={options.margin === value ? "selected" : ""}><input type="radio" name="margin" value={value} checked={options.margin === value} onChange={() => onChange({ ...options, margin: value })} /><strong>{label}</strong></label>)}</div></fieldset>
      <fieldset><legend>Chất lượng</legend><div className="choice-grid">{([ ["compact", "Gọn", "File nhẹ"], ["balanced", "Cân bằng", "Khuyên dùng"], ["high", "Cao", "Chữ nhỏ rõ hơn"] ] as const).map(([value, label, note]) => <label key={value} className={options.quality === value ? "selected" : ""}><input type="radio" name="quality" value={value} checked={options.quality === value} onChange={() => onChange({ ...options, quality: value })} /><strong>{label}</strong><span>{note}</span></label>)}</div></fieldset>
      {options.format === "pdf" && <fieldset><legend>Nhận diện chữ</legend><div className="choice-grid"><label className={options.searchable ? "selected" : ""}><input type="checkbox" checked={options.searchable} onChange={(event) => onChange({ ...options, searchable: event.target.checked })} /><strong>PDF có thể tìm kiếm</strong><span>OCR tiếng Việt + Anh ngay trên thiết bị</span></label></div></fieldset>}
    </div>
    <div className="dialog-actions"><button className="button secondary" onClick={onClose}>Quay lại chỉnh</button><button className="button primary" onClick={onExport}><FileDown size={18} /> Tạo {options.format === "docx" ? "Word" : "PDF"}</button></div>
  </dialog>;
}
