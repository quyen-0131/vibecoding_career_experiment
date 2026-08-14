export async function extractWordText(file: File): Promise<string> {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".doc")) {
    throw new Error("Older .doc files cannot be read safely in the browser. Save the document as .docx and try again.");
  }
  if (!lowerName.endsWith(".docx") && file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    throw new Error("Please choose a Word .docx file.");
  }

  try {
    const mammothModule = await import("mammoth");
    const mammoth = mammothModule.default ?? mammothModule;
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    const extractedText = result.value.trim();
    if (!extractedText) throw new Error("We could not find readable text in this Word document.");
    return extractedText;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("We could not")) throw error;
    throw new Error("We could not read this Word document. Try saving it as a new .docx file.");
  }
}
