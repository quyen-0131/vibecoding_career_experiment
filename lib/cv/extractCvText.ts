import { extractPdfText } from "@/lib/pdf/extractPdfText";
import { extractWordText } from "@/lib/word/extractWordText";

export async function extractCvText(file: File) {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".pdf") || file.type === "application/pdf") return extractPdfText(file);
  if (lowerName.endsWith(".docx") || lowerName.endsWith(".doc") || file.type.includes("wordprocessingml")) return extractWordText(file);
  throw new Error("Please choose a PDF or Word .docx file.");
}
