/**
 * Extract text from a PDF buffer.
 * Uses pdf-parse's PDFParse class (which wraps pdfjs-dist internally).
 * Preserves row structure by using getText() which returns per-page text.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParse = await import('pdf-parse');
  const PDFParseClass = (pdfParse as any).PDFParse;
  const parser = new PDFParseClass({ data: new Uint8Array(buffer), verbosity: 0 });
  await parser.load();
  const result = await parser.getText();

  // getText() returns { pages: [{text}], text?: string, total: number }
  if (typeof result.text === 'string' && result.text.length > 0) {
    return result.text;
  }
  if (Array.isArray(result.pages)) {
    return result.pages.map((p: { text: string }) => p.text).join('\n');
  }
  return '';
}
