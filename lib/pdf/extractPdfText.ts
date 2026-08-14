import { reconstructPdfPageText } from "@/lib/pdf/reconstructPdfPageText";

export async function extractPdfText(file: File): Promise<string> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Please choose a PDF file.");
  }

  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();

    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data }).promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const textItems = content.items.filter((item): item is typeof item & { str: string } => "str" in item);
      pages.push(reconstructPdfPageText(textItems));
    }

    const extractedText = pages.join("\n").trim();
    if (!extractedText) {
      throw new Error("We could not find selectable text in this PDF. Try another CV or use the sample data.");
    }
    return extractedText;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("We could not")) throw error;
    throw new Error("We could not read this PDF. Try exporting your CV as a new PDF or use the sample data.");
  }
}
