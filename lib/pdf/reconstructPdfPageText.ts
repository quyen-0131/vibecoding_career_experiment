export type PdfTextItem = {
  str: string;
  transform?: number[];
  width?: number;
  hasEOL?: boolean;
};

type PositionedPdfTextItem = PdfTextItem & {
  order: number;
  x: number;
  y: number;
  lineTolerance: number;
};

function getLineTolerance(item: PdfTextItem) {
  const fontHeight = Math.abs(item.transform?.[3] ?? 0);
  return Math.max(1.5, Math.min(3.5, fontHeight * 0.25 || 2));
}

function joinLineFragments(items: PositionedPdfTextItem[]) {
  const sorted = [...items].sort((a, b) => a.x - b.x || a.order - b.order);

  return sorted.reduce((line, item, index) => {
    const text = item.str.replace(/\s+/g, " ").trim();
    if (index === 0) return text;

    const previous = sorted[index - 1];
    const previousText = previous.str.replace(/\s+/g, " ").trim();
    const previousEnd = previous.x + (previous.width ?? 0);
    const gap = item.x - previousEnd;
    const explicitWhitespace = /\s$/.test(previous.str) || /^\s/.test(item.str);
    const punctuationContinuesPreviousFragment = /^[,.;:!?%\])}]/.test(text);
    const previousOpensPunctuation = /[([{]$/.test(previousText);
    const fragmentsTouch = previous.width !== undefined && gap <= 0.75;
    const separator = punctuationContinuesPreviousFragment || previousOpensPunctuation || (fragmentsTouch && !explicitWhitespace) ? "" : " ";

    return `${line}${separator}${text}`;
  }, "").trim();
}

export function reconstructPdfPageText(items: PdfTextItem[]) {
  const positioned = items
    .filter((item) => item.str.trim())
    .map((item, order) => ({
      ...item,
      order,
      x: item.transform?.[4] ?? 0,
      // pdfjs text items normally have coordinates. If one does not, keep it
      // on its own fallback line instead of accidentally flattening the page.
      y: item.transform?.[5] ?? -order * 100,
      lineTolerance: getLineTolerance(item),
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x || a.order - b.order);
  const lines: Array<{ baselineY: number; tolerance: number; items: PositionedPdfTextItem[] }> = [];

  positioned.forEach((item) => {
    const line = lines.find((candidate) => Math.abs(candidate.baselineY - item.y) <= Math.max(candidate.tolerance, item.lineTolerance));
    if (line) {
      line.items.push(item);
      line.baselineY = line.items.reduce((total, lineItem) => total + lineItem.y, 0) / line.items.length;
      line.tolerance = Math.max(line.tolerance, item.lineTolerance);
    } else {
      lines.push({ baselineY: item.y, tolerance: item.lineTolerance, items: [item] });
    }
  });

  return lines
    .sort((a, b) => b.baselineY - a.baselineY || a.items[0].order - b.items[0].order)
    .map((line) => joinLineFragments(line.items))
    .filter(Boolean)
    .join("\n");
}

export function joinPdfPageTexts(pages: string[]) {
  return pages.map((page) => page.trim()).filter(Boolean).join("\n\n").trim();
}
