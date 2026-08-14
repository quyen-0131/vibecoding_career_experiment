export type PdfTextItem = {
  str: string;
  transform?: number[];
  width?: number;
  hasEOL?: boolean;
};

export function reconstructPdfPageText(items: PdfTextItem[]) {
  const positioned = items
    .filter((item) => item.str.trim())
    .map((item, order) => ({
      ...item,
      order,
      x: item.transform?.[4] ?? 0,
      y: item.transform?.[5] ?? -order,
    }));
  const lines: Array<typeof positioned> = [];

  positioned.forEach((item) => {
    const line = lines.find((candidate) => Math.abs(candidate[0].y - item.y) <= 2);
    if (line) line.push(item);
    else lines.push([item]);
  });

  return lines
    .sort((a, b) => b[0].y - a[0].y || a[0].order - b[0].order)
    .map((line) => {
      const sorted = [...line].sort((a, b) => a.x - b.x || a.order - b.order);
      return sorted.map((item, index) => {
        if (index === 0) return item.str.trim();
        const previous = sorted[index - 1];
        const previousEnd = previous.x + (previous.width ?? 0);
        const gap = item.x - previousEnd;
        return `${gap > 24 ? " | " : " "}${item.str.trim()}`;
      }).join("");
    })
    .filter(Boolean)
    .join("\n");
}
