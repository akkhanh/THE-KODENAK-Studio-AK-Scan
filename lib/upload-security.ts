export type SupportedUploadKind = "jpeg" | "png" | "webp" | "pdf";

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

export async function detectUploadKind(file: File): Promise<SupportedUploadKind | null> {
  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)) return "png";
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "webp";
  const marker = [0x25, 0x50, 0x44, 0x46, 0x2d];
  for (let offset = 0; offset <= bytes.length - marker.length; offset++) {
    if (marker.every((value, index) => bytes[offset + index] === value)) return "pdf";
  }
  return null;
}

export function safeDisplayName(name: string) {
  const cleaned = name.replace(CONTROL_CHARACTERS, "").trim();
  return (cleaned || "Tài liệu không tên").slice(0, 160);
}

export function sanitizeDocumentText(text: string) {
  const cleaned = text.replace(CONTROL_CHARACTERS, "");
  let result = "";
  for (const character of cleaned) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint < 0xd800 || codePoint > 0xdfff) result += character;
    if (result.length >= 2_000_000) break;
  }
  return result;
}

export function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), milliseconds);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}
