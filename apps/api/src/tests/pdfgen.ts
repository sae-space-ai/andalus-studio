// Generador determinista de PDFs válidos para pruebas (sin dependencias externas).
// Produce PDFs mínimos 1.4 con texto real extraíble, o sin texto (simula escaneado).
// Uso exclusivo en tests/seed: NO contiene material con derechos de terceros.

export function escapePdfString(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    // acentos -> octal escapes Latin-1
    .replace(/[À-ÿ]/g, (c) => "\\" + c.charCodeAt(0).toString(8).padStart(3, "0"));
}

export function wrapText(text: string, maxChars = 90): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

/** Construye un PDF de N páginas con texto real por página. */
export function buildPdf(pages: string[]): Buffer {
  const objects: (string | { stream: string })[] = [];
  const pageRefs: number[] = [];
  const firstPageObj = 4; // 1 catalog, 2 pages-tree, 3 font; luego pares (page, content) por página
  for (let i = 0; i < pages.length; i++) {
    pageRefs.push(firstPageObj + i * 2);
  }

  // obj 1: Catalog
  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  // obj 2: Pages tree
  objects[2] = `<< /Type /Pages /Kids [${pageRefs.map((r) => `${r} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  // obj 3: Font Helvetica
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;

  pages.forEach((text, i) => {
    const pageNum = firstPageObj + i * 2;
    const contentNum = pageNum + 1;
    objects[pageNum] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentNum} 0 R >>`;

    const lines = wrapText(text);
    let stream = "BT\n/F1 12 Tf\n";
    let y = 760;
    for (const line of lines) {
      stream += `1 0 0 1 50 ${y} Tm (${escapePdfString(line)}) Tj\n`;
      y -= 16;
      if (y < 40) break; // una página basta para las pruebas
    }
    stream += "ET";
    objects[contentNum] = { stream };
  });

  // Serializar con xref correcto
  let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [];
  for (let n = 1; n < objects.length; n++) {
    offsets[n] = Buffer.byteLength(out, "latin1");
    const o = objects[n];
    if (typeof o === "string") {
      out += `${n} 0 obj\n${o}\nendobj\n`;
    } else {
      const body = o.stream;
      out += `${n} 0 obj\n<< /Length ${Buffer.byteLength(body, "latin1")} >>\nstream\n${body}\nendstream\nendobj\n`;
    }
  }
  const xrefPos = Buffer.byteLength(out, "latin1");
  const total = objects.length; // obj 0 incluido como free
  out += `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let n = 1; n < total; n++) {
    out += String(offsets[n]).padStart(10, "0") + " 00000 n \n";
  }
  out += `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

/** PDF sin texto extraíble (simula documento escaneado). */
export function buildScannedPdf(): Buffer {
  // Página con solo un rectángulo dibujado: cero operadores de texto.
  let out = "%PDF-1.4\n";
  const objs: string[] = [];
  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objs[2] = "<< /Type /Pages /Kids [4 0 R] /Count 1 >>";
  objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objs[4] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>";
  const stream = "q\n1 0 0 rg\n100 500 400 200 re\nf\nQ";
  objs[5] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  const offsets: number[] = [];
  for (let n = 1; n <= 5; n++) {
    offsets[n] = Buffer.byteLength(out, "latin1");
    out += `${n} 0 obj\n${objs[n]}\nendobj\n`;
  }
  const xrefPos = Buffer.byteLength(out, "latin1");
  out += `xref\n0 6\n0000000000 65535 f \n`;
  for (let n = 1; n <= 5; n++) out += String(offsets[n]).padStart(10, "0") + " 00000 n \n";
  out += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}
