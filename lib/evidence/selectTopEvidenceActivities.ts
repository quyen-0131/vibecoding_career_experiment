import type { CareerId, CareerImportance } from "@/data/careers";
import type { CareerTransfer, NormalizedActivity, SemanticConfidence } from "@/types/prototype";

const importanceValue: Record<CareerImportance, number> = { Core: 4, Important: 3, Supporting: 2, Limited: 0 };
const confidenceValue: Record<SemanticConfidence, number> = { high: 3, medium: 2, low: 1 };
const transferValue = (transfer?: CareerTransfer) => transfer && transfer.relationship !== "unknown" ? importanceValue[transfer.importance] : 0;

export function selectTopEvidenceActivities(activities: NormalizedActivity[], careerIds: CareerId[], limit = 10) {
  if (careerIds.length !== 2) return activities.slice(0, limit);

  const ranked = activities.map((activity) => {
    const [first, second] = careerIds.map((careerId) => transferValue(activity.careerTransfers[careerId]));
    const mappingConfidence = Math.max(0, ...activity.components.map((component) => confidenceValue[component.confidence]));
    const relevance = first + second;
    const discrimination = Math.abs(first - second);
    const evidenceBreadth = Math.min(activity.sources.length, 3);
    return { activity, first, second, score: relevance * 4 + discrimination * 3 + evidenceBreadth + mappingConfidence };
  }).sort((a, b) => b.score - a.score || b.activity.sources.length - a.activity.sources.length || a.activity.label.localeCompare(b.activity.label));

  if (ranked.length <= limit) return ranked.map(({ activity }) => activity);

  const credible = ranked.filter(({ activity }) => careerIds.some((careerId) => activity.careerTransfers[careerId]?.relationship !== "unknown") || activity.sources.length > 1);
  const pool = credible.length > 0 ? credible : ranked;
  const chosen = new Map<string, NormalizedActivity>();
  const take = (candidates: typeof pool, count: number) => candidates.slice(0, count).forEach(({ activity }) => chosen.set(activity.id, activity));

  take(pool.filter(({ first, second }) => first >= 2 && second >= 2 && Math.abs(first - second) <= 1), Math.min(4, limit));
  take(pool.filter(({ first, second }) => first >= 2 && first > second), Math.min(3, limit - chosen.size));
  take(pool.filter(({ first, second }) => second >= 2 && second > first), Math.min(3, limit - chosen.size));
  take(pool.filter(({ activity }) => !chosen.has(activity.id)), limit - chosen.size);

  return [...chosen.values()].slice(0, limit);
}
