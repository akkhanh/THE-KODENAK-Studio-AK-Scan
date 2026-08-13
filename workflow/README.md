# AK Scan workflows

The application is organized around three user-facing workflows:

- `scan-from-image`: phone photos → cleaned/scanned PDF, optional OCR → editable Word.
- `scan-from-pdf-images`: image-only PDF pages → the same scan pipeline and PDF export, optional OCR → Word.
- `pdf-to-word`: text-based PDF pages → editable Word without OCR.

Shared rendering, OCR, security, and document-layout primitives remain in `shared/core`.
The current workspace shell composes the three workflows through `workflow/index.ts`.
