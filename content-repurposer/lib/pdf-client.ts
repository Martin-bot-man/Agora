export const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  // 1. Only load the library when this function is called (on the client)
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  // 2. Point to the worker on a CDN so Next.js doesn't try to bundle it
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const loadingTask = pdfjs.getDocument({
    data: arrayBuffer,
    disableFontFace: true, // Prevents DOM-related font loading errors
    useSystemFonts: true,
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
