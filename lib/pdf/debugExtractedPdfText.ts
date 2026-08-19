export function debugExtractedPdfText(filename: string, text: string) {
  if (process.env.NODE_ENV !== "development") return;

  // CV text can be sensitive. Keep this diagnostic local to the developer
  // console and ensure production builds remove the development branch.
  console.groupCollapsed(`[CV text extraction] ${filename}`);
  console.debug(text);
  console.groupEnd();
}
