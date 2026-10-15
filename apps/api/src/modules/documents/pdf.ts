// Extracción REAL de texto de PDF con pdf-parse (motor JavaScript, sin inventar).
// Reglas Fase 00:
// - Validar tipo real por magic bytes (%PDF-), no solo extensión.
// - Detectar documentos escaneados (sin texto extraíble) -> estado needs_ocr, NUNCA inventar texto.
// - Conservar referencia de página (pdf-parse devuelve pageIndex cuando está disponible).
// - Registrar errores de extracción; no declarar procesado si falló.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PDFParse } from "pdf-parse";

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractionResult {
  ok: boolean;
  status: "extracted" | "failed" | "needs_ocr";
  pages: ExtractedPage[];
  pagesCount: number;
  totalChars: number;
  error?: string;
}

export function isRealPdf(filePath: string): boolean {
  const fd = fs.openSync(filePath, "r");
  try {
    const buf = Buffer.alloc(5);
    const read = fs.readSync(fd, buf, 0, 5, 0);
    return read === 5 && buf.toString("latin1") === "%PDF-";
  } finally {
    fs.closeSync(fd);
  }
}

export async function extractPdfText(filePath: string): Promise<ExtractionResult> {
  if (!fs.existsSync(filePath)) {
    return { ok: false, status: "failed", pages: [], pagesCount: 0, totalChars: 0, error: "ARCHIVO_NO_ENCONTRADO" };
  }
  if (!isRealPdf(filePath)) {
    return { ok: false, status: "failed", pages: [], pagesCount: 0, totalChars: 0, error: "NO_ES_PDF_REAL" };
  }

  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  try {
    const info = await parser.getInfo();
    const pageCount = Number(info?.total?.numPages ?? 0);

    // Texto por página (referencias reales de página)
    const load = await parser.load();
    const perPage: ExtractedPage[] = [];
    for (let i = 0; i < load.pages.length; i++) {
      const p = load.pages[i];
      const text = await p.text();
      perPage.push({ pageNumber: i + 1, text: text ?? "" });
    }
    const totalChars = perPage.reduce((s, p) => s + p.text.trim().length, 0);

    if (pageCount > 0 && totalChars === 0) {
      // Documento sin texto extraíble: probablemente escaneado. OCR NO está disponible.
      return {
        ok: false,
        status: "needs_ocr",
        pages: perPage,
        pagesCount: pageCount,
        totalChars: 0,
        error: "SIN_TEXTO_EXTRAIBLE: el documento parece escaneado. OCR registrado como dependencia externa (no disponible en Fase 00).",
      };
    }

    return { ok: true, status: "extracted", pages: perPage, pagesCount: pageCount || perPage.length, totalChars };
  } catch (e) {
    return {
      ok: false,
      status: "failed",
      pages: [],
      pagesCount: 0,
      totalChars: 0,
      error: `EXTRACCION_FALLIDA: ${(e as Error).message}`,
    };
  } finally {
    await parser.destroy().catch(() => {});
  }
}

export function sha256File(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export function storageKeyFor(ownerId: string, originalName: string): string {
  const safe = path.basename(originalName).replace(/[^\w.\-]+/g, "_").slice(0, 80);
  const id = crypto.randomUUID();
  return `${ownerId}/${id}-${safe}`;
}
