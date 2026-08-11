"use client";

import { useEffect, useRef, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AlertTriangle, Crop, Download, Eye, FileText, ImagePlus, LoaderCircle, RotateCw, ScanLine, ScanSearch, SlidersHorizontal } from "lucide-react";
import { jsPDF } from "jspdf";
import { analyzeImageQuality, defaultCorners, defaultSettings, detectDocumentCorners, detectTableGrid, FilterName, renderPage, ScanPage } from "@/lib/scan";
import { ScanPreview } from "./scan-preview";
import { ExportDialog, ExportOptions } from "./export-dialog";
import { HomeGuide } from "./home-guide";
import { DonateWidget } from "./donate-widget";
import { AppFooter } from "./app-footer";
import { AppHeader } from "./app-header";
import { HomeUpload } from "./home-upload";
import { SortablePage } from "./sortable-page";
import { detectUploadKind, safeDisplayName, sanitizeDocumentText, withTimeout } from "@/lib/upload-security";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_PDF_BYTES = 40 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 24_000_000;
const MAX_SESSION_PIXELS = 160_000_000;

const filters: Array<{ id: FilterName; label: string }> = [
  { id: "original", label: "Ảnh gốc" }, { id: "enhanced", label: "Tăng cường" },
  { id: "grayscale", label: "Xám" }, { id: "bw", label: "Trắng đen" }
];

export function ScanWorkspace() {
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [editingCorners, setEditingCorners] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({ pageSize: "a4", margin: "small", quality: "balanced", searchable: false, format: "pdf" });
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const objectUrls = useRef(new Set<string>());
  const cancelExport = useRef(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const active = pages.find((page) => page.id === activeId) ?? pages[0];

  useEffect(() => () => { objectUrls.current.forEach((url) => URL.revokeObjectURL(url)); objectUrls.current.clear(); }, []);

  async function inspectFile(file: File) {
    const name = safeDisplayName(file.name);
    const kind = await detectUploadKind(file);
    if (!kind || kind === "pdf") throw new Error(`${name}: nội dung file không phải ảnh JPG, PNG hoặc WebP hợp lệ.`);
    if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error(`${name}: ảnh phải nhỏ hơn 15 MB.`);
    const url = URL.createObjectURL(file);
    try {
      const dimensions = await withTimeout(new Promise<{ width: number; height: number }>((resolve, reject) => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = () => reject(new Error(`${name}: file ảnh bị hỏng.`)); image.src = url; }), 15_000, `${name}: đọc ảnh quá thời gian cho phép.`);
      if (!dimensions.width || !dimensions.height || dimensions.width * dimensions.height > MAX_IMAGE_PIXELS) throw new Error(`${name}: ảnh vượt giới hạn 24 megapixel.`);
      objectUrls.current.add(url); return { url, ...dimensions };
    } catch (error) { URL.revokeObjectURL(url); throw error; }
  }

  async function inspectPdf(file: File, limit: number) {
    const name = safeDisplayName(file.name);
    if (await detectUploadKind(file) !== "pdf") throw new Error(`${name}: nội dung file không phải PDF hợp lệ.`);
    if (!file.size || file.size > MAX_PDF_BYTES) throw new Error(`${name}: PDF phải nhỏ hơn 40 MB.`);
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    const pdf = await withTimeout(loadingTask.promise, 30_000, `${name}: PDF mất quá nhiều thời gian để mở.`).catch(async (error) => { await loadingTask.destroy(); throw error; });
    const results: Array<{ url: string; width: number; height: number; name: string; embeddedText?: string }> = [];
    try { for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, limit); pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(2.4, 2200 / Math.max(base.width, base.height));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error(`${file.name}: không thể dựng trang ${pageNumber}.`);
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await withTimeout(page.render({ canvas, canvasContext: context, viewport }).promise, 30_000, `${name}: trang ${pageNumber} mất quá nhiều thời gian để dựng.`);
      const textContent = await page.getTextContent();
      const embeddedText = sanitizeDocumentText(textContent.items.map((item) => "str" in item ? `${item.str}${item.hasEOL ? "\n" : " "}` : "").join("")).trim();
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Không thể tạo ảnh trang PDF.")), "image/jpeg", .95));
      const url = URL.createObjectURL(blob);
      objectUrls.current.add(url);
      results.push({ url, width: canvas.width, height: canvas.height, name: `${name} · trang ${pageNumber}`, embeddedText: embeddedText.length >= 12 ? embeddedText : undefined });
      page.cleanup();
    } return results; }
    catch (error) { results.forEach(({ url }) => { URL.revokeObjectURL(url); objectUrls.current.delete(url); }); throw error; }
    finally { await pdf.cleanup(); await loadingTask.destroy(); }
  }

  async function addFiles(files: FileList | File[]) {
    if (exporting) return;
    const candidates = Array.from(files);
    const room = Math.max(0, 20 - pages.length);
    let sessionPixels = pages.reduce((total, page) => total + (page.sourcePixels ?? 0), 0);
    const next: ScanPage[] = [];
    const errors: string[] = [];
    for (const file of candidates.slice(0, room)) {
      try {
        const kind = await detectUploadKind(file);
        const inspectedPages = kind === "pdf" ? await inspectPdf(file, room - next.length) : [{ ...(await inspectFile(file)), name: safeDisplayName(file.name) }];
        const incomingPixels = inspectedPages.reduce((total, inspected) => total + inspected.width * inspected.height, 0);
        if (sessionPixels + incomingPixels > MAX_SESSION_PIXELS) {
          inspectedPages.forEach(({ url }) => { URL.revokeObjectURL(url); objectUrls.current.delete(url); });
          throw new Error("Tổng độ phân giải của phiên vượt giới hạn an toàn. Hãy xuất hoặc xóa bớt trang trước khi thêm tiếp.");
        }
        for (const inspected of inspectedPages) {
          const sourcePixels = inspected.width * inspected.height;
          const quality = await analyzeImageQuality(inspected.url, inspected.width, inspected.height);
          sessionPixels += sourcePixels;
          next.push({ id: crypto.randomUUID(), name: inspected.name, url: inspected.url, rotation: 0, fineRotation: 0, dewarp: false, corners: defaultCorners.map((p) => ({ ...p })) as typeof defaultCorners, settings: { ...defaultSettings }, qualityWarning: quality.warning, embeddedText: inspected.embeddedText, sourcePixels });
        }
      }
      catch (error) { errors.push(error instanceof Error ? error.message : `${file.name}: không thể đọc ảnh.`); }
    }
    if (!next.length) { setMessage(errors[0] ?? "Hãy chọn ảnh JPG, PNG, WebP hoặc PDF hợp lệ."); return; }
    setPages((current) => [...current, ...next]);
    setActiveId((current) => current || next[0].id);
    setMessage(candidates.length > room ? "Đã đạt giới hạn 20 trang." : errors.length ? `${next.length} ảnh hợp lệ; ${errors[0]}` : `${next.length} ảnh đã sẵn sàng.`);
  }

  function updateActive(patch: Partial<ScanPage>) { if (active && !exporting) setPages((list) => list.map((page) => page.id === active.id ? { ...page, ...patch } : page)); }
  function updateSetting(key: keyof ScanPage["settings"], value: number | FilterName) { if (active) updateActive({ settings: { ...active.settings, [key]: value } }); }
  function selectFilter(filter: FilterName) {
    if (!active) return;
    if (filter === "original") updateActive({ settings: { ...defaultSettings } });
    else updateActive({ settings: { filter, brightness: 8, contrast: 22, whiten: 20, removeShadow: 28, sharpen: 18 } });
  }
  function applyToAll() { if (!active || exporting) return; setPages((list) => list.map((page) => ({ ...page, settings: { ...active.settings } }))); setMessage(`Đã áp dụng thiết lập cho ${pages.length} trang.`); }
  async function autoDetect() {
    if (!active || detecting || exporting) return;
    setDetecting(true); setShowOriginal(false); setMessage("Đang phân tích mép giấy…");
    try {
      const result = await detectDocumentCorners(active.url);
      if (result.confidence >= .58) { updateActive({ corners: result.corners }); setEditingCorners(true); setMessage(`Đã tìm thấy mép giấy · độ tin cậy ${Math.round(result.confidence * 100)}%. Hãy kiểm tra bốn góc.`); }
      else {
        const edgeWarning = "Kiểm tra 4 góc";
        const warning = active.qualityWarning?.includes(edgeWarning) ? active.qualityWarning : [active.qualityWarning, edgeWarning].filter(Boolean).join(" · ");
        updateActive({ qualityWarning: warning });
        setEditingCorners(true);
        setMessage(`Chưa đủ chắc chắn (${Math.round(result.confidence * 100)}%). Bốn góc hiện tại được giữ nguyên để bạn chỉnh tay.`);
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không thể tự dò mép giấy."); }
    finally { setDetecting(false); }
  }
  function removePage(id: string) { if (exporting) return; const index = pages.findIndex((p) => p.id === id); URL.revokeObjectURL(pages[index].url); objectUrls.current.delete(pages[index].url); const next = pages.filter((p) => p.id !== id); setPages(next); if (id === activeId) setActiveId(next[Math.max(0, index - 1)]?.id ?? ""); }
  function movePage(index: number, delta: number) { if (exporting) return; const to = index + delta; if (to < 0 || to >= pages.length) return; setPages(arrayMove(pages, index, to)); }
  function onDragEnd(event: DragEndEvent) { const { active: from, over } = event; if (over && from.id !== over.id) setPages((list) => arrayMove(list, list.findIndex((p) => p.id === from.id), list.findIndex((p) => p.id === over.id))); }

  async function createSearchablePdf(exportPages: ScanPage[], maxEdge: number) {
    const [{ createWorker }, { PDFDocument }] = await Promise.all([import("tesseract.js"), import("pdf-lib")]);
    const merged = await PDFDocument.create();
    let currentOcrPage = 0;
    const worker = await createWorker(["vie", "eng"], undefined, {
      logger: (status) => {
        setProgress(Math.min(99, Math.round((currentOcrPage + status.progress) / exportPages.length * 100)));
      },
    });
    try {
      for (let index = 0; index < exportPages.length; index++) {
        currentOcrPage = index;
        if (cancelExport.current) throw new DOMException("Đã hủy xuất PDF", "AbortError");
        setMessage(`Đang nhận diện chữ trang ${index + 1}/${exportPages.length}…`);
        const canvas = await renderPage(exportPages[index], maxEdge);
        const result = await worker.recognize(canvas, {}, { pdf: true, text: true });
        if (!result.data.pdf) throw new Error(`Không thể tạo lớp chữ cho trang ${index + 1}.`);
        const pagePdf = await PDFDocument.load(new Uint8Array(result.data.pdf));
        const copiedPages = await merged.copyPages(pagePdf, pagePdf.getPageIndices());
        copiedPages.forEach((page) => merged.addPage(page));
        setProgress(Math.round((index + 1) / exportPages.length * 100));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const bytes = await merged.save();
      const blob = new Blob([new Uint8Array(bytes).buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ak-scan-searchable-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      await worker.terminate();
    }
  }

  async function createWordDocument(exportPages: ScanPage[], maxEdge: number) {
    const [{ createWorker }, { Document, HighlightColor, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType }] = await Promise.all([import("tesseract.js"), import("docx")]);
    let currentOcrPage = 0;
    const worker = await createWorker(["vie", "eng"], undefined, {
      logger: (status) => setProgress(Math.min(99, Math.round((currentOcrPage + status.progress) / exportPages.length * 100))),
    });
    const paragraphs: Array<InstanceType<typeof Paragraph> | InstanceType<typeof Table>> = [
      new Paragraph({ children: [new TextRun({ text: "Các đoạn tô vàng có độ tin cậy OCR thấp và cần được kiểm tra lại với ảnh gốc.", italics: true })] }),
    ];
    try {
      for (let index = 0; index < exportPages.length; index++) {
        currentOcrPage = index;
        if (cancelExport.current) throw new DOMException("Đã hủy xuất Word", "AbortError");
        setMessage(`Đang đọc chữ trang ${index + 1}/${exportPages.length}…`);
        const sourcePage = exportPages[index];
        if (sourcePage.embeddedText) {
          sourcePage.embeddedText.split(/\r?\n/).filter((line) => line.trim()).forEach((line, lineIndex) => {
            paragraphs.push(new Paragraph({ pageBreakBefore: index > 0 && lineIndex === 0, children: [new TextRun(sanitizeDocumentText(line.trim()))] }));
          });
          setProgress(Math.round((index + 1) / exportPages.length * 100));
          continue;
        }
        const grayscalePage: ScanPage = {
          ...sourcePage,
          settings: { ...sourcePage.settings, filter: "grayscale", removeShadow: Math.max(42, sourcePage.settings.removeShadow), whiten: Math.max(24, sourcePage.settings.whiten), sharpen: Math.min(22, sourcePage.settings.sharpen) },
        };
        const grayscale = await renderPage(grayscalePage, maxEdge);
        let best = await worker.recognize(grayscale, {}, { text: true, blocks: true });

        if (best.data.confidence < 94) {
          const enhancedPage: ScanPage = { ...sourcePage, settings: { ...grayscalePage.settings, filter: "enhanced" } };
          const enhanced = await renderPage(enhancedPage, maxEdge);
          const alternative = await worker.recognize(enhanced, {}, { text: true, blocks: true });
          if (alternative.data.confidence > best.data.confidence) best = alternative;
        }

        const blocks = best.data.blocks ?? [];
        const lines = blocks.flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines));
        const words = lines.flatMap((line) => line.words);
        const tableGrid = detectTableGrid(grayscale);
        if (lines.length) {
          const tableTop = tableGrid?.yLines[0] ?? Number.POSITIVE_INFINITY;
          const tableBottom = tableGrid?.yLines.at(-1) ?? Number.NEGATIVE_INFINITY;
          const pushLines = (selected: typeof lines, allowPageBreak: boolean) => selected.forEach((line, lineIndex) => {
            paragraphs.push(new Paragraph({
              pageBreakBefore: allowPageBreak && index > 0 && lineIndex === 0,
              children: [new TextRun({ text: sanitizeDocumentText(line.text.trim()), highlight: line.confidence < 82 ? HighlightColor.YELLOW : undefined })],
            }));
          });
          pushLines(lines.filter((line) => (line.bbox.y0 + line.bbox.y1) / 2 < tableTop), true);
          if (tableGrid) {
            const rows = [];
            for (let row = 0; row < tableGrid.yLines.length - 1; row++) {
              const cells = [];
              for (let column = 0; column < tableGrid.xLines.length - 1; column++) {
                const x0 = tableGrid.xLines[column], x1 = tableGrid.xLines[column + 1];
                const y0 = tableGrid.yLines[row], y1 = tableGrid.yLines[row + 1];
                const cellWords = words.filter((word) => {
                  const x = (word.bbox.x0 + word.bbox.x1) / 2, y = (word.bbox.y0 + word.bbox.y1) / 2;
                  return x > x0 && x < x1 && y > y0 && y < y1;
                }).sort((first, second) => first.bbox.y0 - second.bbox.y0 || first.bbox.x0 - second.bbox.x0);
                const lowConfidence = cellWords.some((word) => word.confidence < 82);
                cells.push(new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sanitizeDocumentText(cellWords.map((word) => word.text).join(" ")), highlight: lowConfidence ? HighlightColor.YELLOW : undefined })] })] }));
              }
              rows.push(new TableRow({ children: cells }));
            }
            paragraphs.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
          }
          if (tableGrid) pushLines(lines.filter((line) => (line.bbox.y0 + line.bbox.y1) / 2 > tableBottom), false);
        } else {
          best.data.text.split(/\r?\n/).filter((line) => line.trim()).forEach((line, lineIndex) => {
            paragraphs.push(new Paragraph({ pageBreakBefore: index > 0 && lineIndex === 0, children: [new TextRun(sanitizeDocumentText(line.trim()))] }));
          });
        }
        setProgress(Math.round((index + 1) / exportPages.length * 100));
      }
      const wordDocument = new Document({ sections: [{ children: paragraphs }] });
      const blob = await Packer.toBlob(wordDocument);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ak-scan-ocr-${new Date().toISOString().slice(0, 10)}.docx`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      await worker.terminate();
    }
  }

  async function exportPdf() {
    if (!pages.length || exporting) return;
    const exportPages = pages.map((page) => ({ ...page, corners: page.corners.map((p) => ({ ...p })) as typeof page.corners, settings: { ...page.settings } }));
    cancelExport.current = false; setExportOpen(false); setExporting(true); setProgress(0); setMessage("Đang tạo PDF trên thiết bị…");
    try {
      const maxEdge = exportOptions.quality === "compact" ? 1800 : exportOptions.quality === "high" ? 4800 : 3200;
      const jpegQuality = exportOptions.quality === "compact" ? .82 : exportOptions.quality === "high" ? .98 : .93;
      const margin = exportOptions.margin === "none" ? 0 : exportOptions.margin === "large" ? 15 : 8;
      if (exportOptions.format === "docx") {
        await createWordDocument(exportPages, Math.max(2800, maxEdge));
        setMessage("File Word đã được tạo · hãy kiểm tra các đoạn được tô vàng.");
        return;
      }
      if (exportOptions.searchable) {
        await createSearchablePdf(exportPages, maxEdge);
        setMessage("PDF tìm kiếm đã được tạo · OCR tiếng Việt + Anh chạy trên thiết bị.");
        return;
      }
      let pdf: jsPDF | null = null;
      for (let i = 0; i < exportPages.length; i++) {
        if (cancelExport.current) throw new DOMException("Đã hủy xuất PDF", "AbortError");
        const canvas = await renderPage(exportPages[i], maxEdge);
        const standard = exportOptions.pageSize === "letter" ? [215.9, 279.4] : [210, 297];
        const fitScale = 297 / Math.max(canvas.width, canvas.height);
        const dimensions = exportOptions.pageSize === "fit" ? [canvas.width * fitScale, canvas.height * fitScale] : standard;
        const [sheetW, sheetH] = dimensions;
        if (!pdf) pdf = new jsPDF({ unit: "mm", format: dimensions, orientation: sheetW > sheetH ? "landscape" : "portrait", compress: true });
        else pdf.addPage(dimensions, sheetW > sheetH ? "landscape" : "portrait");
        const pageW = sheetW - margin * 2, pageH = sheetH - margin * 2;
        const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
        const w = canvas.width * ratio, h = canvas.height * ratio;
        const lossless = exportPages[i].settings.filter === "bw";
        const imageData = lossless ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", jpegQuality);
        pdf.addImage(imageData, lossless ? "PNG" : "JPEG", (sheetW - w) / 2, (sheetH - h) / 2, w, h, undefined, "MEDIUM");
        setProgress(Math.round(((i + 1) / exportPages.length) * 100));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      if (!pdf) throw new Error("Không có trang hợp lệ để xuất.");
      pdf.save(`ak-scan-${new Date().toISOString().slice(0, 10)}.pdf`);
      setMessage("PDF đã được tạo. Ảnh vẫn chỉ nằm trên thiết bị này.");
    } catch (error) { setMessage(error instanceof DOMException && error.name === "AbortError" ? "Đã hủy xuất PDF. Bạn có thể tiếp tục chỉnh sửa." : error instanceof Error ? error.message : "Không thể tạo PDF."); }
    finally { setExporting(false); }
  }

  function clearSession() {
    if (exporting) return;
    pages.forEach((p) => { URL.revokeObjectURL(p.url); objectUrls.current.delete(p.url); });
    setPages([]);
    setActiveId("");
    setMessage("Đã xóa toàn bộ phiên làm việc.");
  }

  return (
    <main className="app-shell">
      <AppHeader hasPages={pages.length > 0} exporting={exporting} onClearSession={clearSession} />

      {!pages.length ? (
        <HomeUpload dragging={dragging} fileRef={fileRef} pdfRef={pdfRef} cameraRef={cameraRef} onDraggingChange={setDragging} onFiles={(files) => void addFiles(files)} />
      ) : (
        <section className={`workbench ${exporting ? "exporting" : ""}`} aria-label="Bàn chỉnh sửa tài liệu" aria-busy={exporting}>
          <aside className="pages-panel">
            <div className="panel-heading">
              <div><span>TRANG</span><strong>{pages.length}/20</strong></div>
              <div className="panel-add-actions">
                <button onClick={() => fileRef.current?.click()} aria-label="Thêm ảnh" title="Thêm ảnh"><ImagePlus size={18} /></button>
                <button onClick={() => pdfRef.current?.click()} aria-label="Thêm PDF" title="Thêm PDF"><FileText size={17} /></button>
              </div>
            </div>
            <input ref={fileRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ""; }} />
            <input ref={pdfRef} className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ""; }} />
            <DndContext sensors={sensors} onDragStart={() => setDragging(true)} onDragCancel={() => setDragging(false)} onDragEnd={(e) => { setDragging(false); onDragEnd(e); }}>
              <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <ol className="page-list">
                  {pages.map((page, index) => <SortablePage key={page.id} page={page} index={index} last={index === pages.length - 1} active={active?.id === page.id} onSelect={() => setActiveId(page.id)} onDelete={() => removePage(page.id)} onMove={(delta) => movePage(index, delta)} />)}
                </ol>
              </SortableContext>
            </DndContext>
          </aside>

          <section className="canvas-panel">
            <div className="canvas-toolbar">
              <div className="crop-tools">
                <button className={`crop-toggle ${editingCorners ? "selected" : ""}`} onClick={() => { setEditingCorners((value) => !value); setShowOriginal(false); }} aria-pressed={editingCorners}>
                  <Crop size={16} /> {editingCorners ? "Xong chỉnh góc" : "Chỉnh 4 góc"}
                </button>
                <button className="detect-button" onClick={() => void autoDetect()} disabled={detecting}>
                  {detecting ? <LoaderCircle className="detect-spinner" size={16} /> : <ScanSearch size={16} />} {detecting ? "Đang dò…" : "Tự dò mép"}
                </button>
              </div>
              <div>
                {editingCorners && <button onClick={() => updateActive({ corners: defaultCorners.map((p) => ({ ...p })) as typeof defaultCorners })}>Đặt lại</button>}
                <button className={showOriginal ? "selected" : ""} onClick={() => { setShowOriginal((value) => !value); setEditingCorners(false); }} aria-pressed={showOriginal}>
                  <Eye size={17} /> {showOriginal ? "Đang xem gốc" : "Xem ảnh gốc"}
                </button>
                <button onClick={() => updateActive({ rotation: (active.rotation + 270) % 360 })} aria-label="Xoay trái"><RotateCw className="flip" size={17} /></button>
                <button onClick={() => updateActive({ rotation: (active.rotation + 90) % 360 })} aria-label="Xoay phải"><RotateCw size={17} /></button>
              </div>
            </div>
            {active && <ScanPreview page={active} editing={editingCorners} showOriginal={showOriginal} onCornersChange={(corners) => updateActive({ corners })} />}
          </section>

          <aside className="controls-panel">
            <div>
              <div className="panel-title">
                <SlidersHorizontal size={16} />
                <h2>Chỉnh bản scan</h2>
              </div>
              {active.qualityWarning && <div className="quality-alert"><AlertTriangle size={15} /><div><span>{active.qualityWarning}</span></div>{active.qualityWarning.includes("4 góc") && <button onClick={() => { setEditingCorners(true); setShowOriginal(false); }}>Xem</button>}</div>}
              
              <p className="control-section-label">Chế độ trang</p>
              <div className="filter-grid">{filters.map((filter) => <button key={filter.id} className={active.settings.filter === filter.id ? "selected" : ""} onClick={() => selectFilter(filter.id)} aria-pressed={active.settings.filter === filter.id}><span className={`filter-swatch ${filter.id}`} />{filter.label}</button>)}</div>
              
              <div className="adjustment-group">
                <p className="control-section-label">Căn trang</p>
                <div className="sliders">
                  <label><span>Căn thẳng<output>{(active.fineRotation ?? 0).toFixed(1)}°</output></span><input type="range" min={-3} max={3} step={.1} value={active.fineRotation ?? 0} onChange={(event) => updateActive({ fineRotation: Number(event.target.value) })} /></label>
                </div>
                <button className={`dewarp-toggle ${active.dewarp ? "selected" : ""}`} aria-pressed={Boolean(active.dewarp)} title="Chỉ nắn ảnh khi phát hiện đường chữ cong đủ tin cậy" onClick={() => {
                  const enabled = !active.dewarp;
                  updateActive({ dewarp: enabled });
                  setShowOriginal(false);
                  setEditingCorners(false);
                  setMessage(enabled ? "Đã bật làm phẳng an toàn · ảnh chỉ được nắn khi phát hiện đường chữ cong đủ tin cậy." : "Đã tắt làm phẳng giấy cong.");
                }}>
                  <span><ScanLine size={16} /> <strong>Làm phẳng giấy cong</strong></span>
                  <span className="toggle-state">{active.dewarp ? "Bật" : "Tắt"}</span>
                </button>
              </div>

              <div className={`adjustment-group ${active.settings.filter === "original" ? "disabled" : ""}`}>
                <p className="control-section-label">Làm sạch &amp; tăng nét</p>
                <div className="sliders">{([ ["brightness", "Độ sáng", -30, 40], ["contrast", "Tương phản", 0, 60], ["whiten", "Trắng nền", 0, 80], ["removeShadow", "Xóa bóng", 0, 80], ["sharpen", "Sắc nét", 0, 60] ] as const).map(([key,label,min,max]) => <label key={key}><span>{label}<output>{active.settings[key]}</output></span><input type="range" min={min} max={max} value={active.settings[key]} disabled={active.settings.filter === "original"} onChange={(e) => updateSetting(key, Number(e.target.value))} /></label>)}</div>
              </div>

              <div className="control-actions">
                <button className="reset" onClick={() => updateActive({ settings: { ...defaultSettings }, fineRotation: 0, dewarp: false })}>Đặt lại</button>
                <button className="reset" onClick={applyToAll}>Áp dụng mọi trang</button>
              </div>
            </div>

            <div className="export-box">
              <div><strong>Sẵn sàng xuất</strong><span>{pages.length} trang · {exportOptions.pageSize === "fit" ? "Vừa ảnh" : exportOptions.pageSize.toUpperCase()}</span></div>
              <button className="button primary export" onClick={() => setExportOpen(true)} disabled={exporting}>
                {exporting ? <><span className="spinner light" /> Đang tạo {progress}%</> : <><Download size={18} /> Tùy chọn & tải PDF</>}
              </button>
              {exporting && <><div className="progress"><span style={{ transform: `scaleX(${progress / 100})` }} /></div><button className="cancel-export" onClick={() => { cancelExport.current = true; }}>Hủy xuất</button></>}
            </div>
          </aside>
        </section>
      )}

      <ExportDialog open={exportOpen} pageCount={pages.length} options={exportOptions} onChange={setExportOptions} onClose={() => setExportOpen(false)} onExport={() => void exportPdf()} />
      <p className="live-message" aria-live="polite">{message}</p>

      <HomeGuide />
      <AppFooter />
      <DonateWidget inWorkbench={pages.length > 0} />
    </main>
  );
}
