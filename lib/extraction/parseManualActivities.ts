import { activityCatalog, makeCustomActivityId } from "@/data/activityCatalog";
import type { DetectedActivity } from "@/types/prototype";

const bulletPrefix = /^\s*(?:[-*•]+|\d+[.)])\s*/;

export function parsePastedActivities(value: string) {
  const seen = new Set<string>();
  return value
    .replace(/\r/g, "")
    .split(/\n|;/)
    .map((item) => item.replace(bulletPrefix, "").trim())
    .filter((item) => {
      const key = item.toLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function createManualActivity(label: string, experienceId: string, activityId: string): DetectedActivity {
  const cleanLabel = label.trim();
  // One manual field always produces one activity. If several catalogue
  // patterns match (for example, data analysis using R), the first meaningful
  // work category is used rather than splitting a natural sentence by verbs.
  const definition = activityCatalog.find((candidate) => candidate.patterns.some((pattern) => pattern.test(cleanLabel)));

  return {
    id: activityId,
    canonicalId: definition?.id ?? makeCustomActivityId(cleanLabel),
    label: cleanLabel,
    category: definition?.category ?? "Other",
    supportingText: cleanLabel,
  };
}
