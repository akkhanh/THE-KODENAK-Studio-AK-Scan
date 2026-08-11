"use client";

import { useEffect, useRef, useState } from "react";
import type { Corners, ScanPage } from "@/lib/scan";
import { renderPage } from "@/lib/scan";

const cornerNames = ["trên trái", "trên phải", "dưới phải", "dưới trái"];

export function ScanPreview({ page, editing, showOriginal, onCornersChange }: { page: ScanPage; editing: boolean; showOriginal: boolean; onCornersChange: (corners: Corners) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const renderKey = `${page.id}:${page.rotation}:${page.fineRotation ?? 0}:${page.dewarp ? 1 : 0}:${JSON.stringify(page.corners)}:${JSON.stringify(page.settings)}:${editing}:${showOriginal}`;
  const [result, setResult] = useState({ key: "", error: "" });
  const loading = result.key !== renderKey;
  const error = result.key === renderKey ? result.error : "";

  useEffect(() => {
    let live = true;
    const task = editing || showOriginal ? new Promise<HTMLCanvasElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
        const raw = document.createElement("canvas");
        raw.width = Math.round(image.naturalWidth * scale); raw.height = Math.round(image.naturalHeight * scale);
        raw.getContext("2d")?.drawImage(image, 0, 0, raw.width, raw.height); resolve(raw);
      };
      image.onerror = () => reject(new Error("Không thể đọc ảnh này.")); image.src = page.url;
    }) : renderPage(page, 1000);
    task.then((rendered) => {
      if (!live || !canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = rendered.width;
      canvas.height = rendered.height;
      canvas.getContext("2d")?.drawImage(rendered, 0, 0);
      setResult({ key: renderKey, error: "" });
    }).catch((err: Error) => { if (live) setResult({ key: renderKey, error: err.message }); });
    return () => { live = false; };
  }, [page, editing, renderKey, showOriginal]);

  function setCorner(index: number, x: number, y: number) {
    const next = page.corners.map((point) => ({ ...point })) as Corners;
    const pad = .005;
    next[index] = { x: Math.max(pad, Math.min(1 - pad, x)), y: Math.max(pad, Math.min(1 - pad, y)) };
    onCornersChange(next);
  }

  function moveFromPointer(index: number, clientX: number, clientY: number) {
    const rect = documentRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCorner(index, (clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height);
  }

  return (
    <div className="preview-stage" aria-busy={loading}>
      {loading && <div className="preview-status"><span className="spinner" />Đang dựng bản scan…</div>}
      {error && <div className="preview-error" role="alert">{error}</div>}
      <div className="preview-document" ref={documentRef}>
        <canvas ref={canvasRef} role="img" aria-label={editing ? `Ảnh gốc để chỉnh bốn góc: ${page.name}` : `Bản xem trước ${page.name}`}>Trình duyệt không hỗ trợ Canvas.</canvas>
        {editing && <>
          <svg className="crop-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points={page.corners.map((p) => `${p.x * 100},${p.y * 100}`).join(" ")} /></svg>
          {page.corners.map((point, index) => <button key={index} className="corner-handle" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} aria-label={`Chỉnh góc ${cornerNames[index]}`} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); moveFromPointer(index, event.clientX, event.clientY); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveFromPointer(index, event.clientX, event.clientY); }} onKeyDown={(event) => {
            const step = event.shiftKey ? .02 : .004; let { x, y } = point;
            if (event.key === "ArrowLeft") x -= step; else if (event.key === "ArrowRight") x += step; else if (event.key === "ArrowUp") y -= step; else if (event.key === "ArrowDown") y += step; else return;
            event.preventDefault(); setCorner(index, x, y);
          }}><span>{index + 1}</span></button>)}
        </>}
      </div>
      <span aria-hidden="true" className="preview-corner top-left" /><span aria-hidden="true" className="preview-corner top-right" />
      <span aria-hidden="true" className="preview-corner bottom-left" /><span aria-hidden="true" className="preview-corner bottom-right" />
    </div>
  );
}
