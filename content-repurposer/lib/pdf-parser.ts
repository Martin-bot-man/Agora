// lib/pdf-parser.ts
// This file will ONLY ever be executed in the browser.

export const getPDFText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  // We use a nested, dynamic import here so the server never sees the 'pdfjs-dist' string
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

  const loadingTask = pdfjs.getDocument({ 
    data: arrayBuffer,
    useSystemFonts: true 
  });
  
  const pdf = await loadingTask.promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }

  return text.trim();
};