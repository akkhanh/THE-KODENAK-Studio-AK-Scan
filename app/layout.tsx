import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AK Scan — Ảnh thành PDF scan",
  description: "Làm trắng nền, tăng độ nét và ghép ảnh tài liệu thành PDF ngay trên thiết bị.",
  authors: [{ name: "akkhanh — THE KODENAK" }],
  creator: "akkhanh — THE KODENAK",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
