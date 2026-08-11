"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Heart } from "lucide-react";

const DONATE_BANK_ACC = "2000000089";
const DONATE_BANK_NAME = "Techcombank";
const DONATE_HOLDER = "TRAN NGUYEN NAM KHANH";
const DONATE_QR_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/techcombank-qr.png`;

export function DonateWidget({ inWorkbench = false }: { inWorkbench?: boolean }) {
  const [workbenchVisible, setWorkbenchVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const compact = inWorkbench && workbenchVisible;

  useEffect(() => {
    if (!inWorkbench) return;

    const workbench = document.querySelector(".workbench");
    if (!workbench) return;

    const observer = new IntersectionObserver(
      ([entry]) => setWorkbenchVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(workbench);
    return () => observer.disconnect();
  }, [inWorkbench]);

  function copyAccount() {
    void navigator.clipboard.writeText(DONATE_BANK_ACC);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside className="donate-floating-widget" aria-label="Ủng hộ tác giả">
      {compact ? (
        <div className="donate-compact-indicator" title="Đang thu gọn để không che khu vực chỉnh sửa">
          <Heart size={18} aria-hidden="true" />
          <span className="sr-only">Ủng hộ tác giả</span>
        </div>
      ) : (
        <div className="donate-popover-card">
          <div className="popover-head">
            <div>
              <strong>Ủng hộ tác giả ☕</strong>
              <p>Cảm ơn bạn đã sử dụng và đồng hành cùng AK Scan!</p>
            </div>
          </div>

          <div className="popover-body">
            {/* eslint-disable-next-line @next/next/no-img-element -- Giữ nguyên pixel ảnh QR để quét chính xác. */}
            <img src={DONATE_QR_URL} alt="Mã VietQR Techcombank 2000000089 - TRAN NGUYEN NAM KHANH" className="popover-qr-img" />

            <div className="popover-info-rows">
              <div className="info-row"><span>Ngân hàng:</span><strong>{DONATE_BANK_NAME}</strong></div>
              <div className="info-row highlight-row">
                <span>Số tài khoản:</span>
                <button className="copy-stk-btn" onClick={copyAccount} title="Bấm để sao chép số tài khoản">
                  <strong>{DONATE_BANK_ACC}</strong>
                  {copied ? <Check size={14} className="copied-icon" /> : <Copy size={13} />}
                </button>
              </div>
              <div className="info-row"><span>Chủ tài khoản:</span><strong>{DONATE_HOLDER}</strong></div>
            </div>

            <button className="copy-stk-main-btn" onClick={copyAccount}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? "Đã sao chép số tài khoản!" : "Sao chép số tài khoản"}</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
