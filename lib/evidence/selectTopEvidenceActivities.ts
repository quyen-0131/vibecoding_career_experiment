import { getCareerActivity, type CareerId, type CareerImportance } from "@/data/careers";
import type { NormalizedActivity } from "@/types/prototype";

const importanceValue: Record<CareerImportance, number> = { Core: 4, Important: 3, Supporting: 2, Limited: 0 };

export function selectTopEvidenceActivities(activities: NormalizedActivity[], careerIds: CareerId[], limit = 10) {
  if (careerIds.length !== 2) return activities.slice(0, limit);

  const ranked = activities.map((activity) => {
    const [first, second] = careerIds.map((careerId) => importanceValue[getCareerActivity(careerId, activity.canonicalId).importance]);
    const relevance = first + second;
    const discrimination = Math.abs(first - second);
    const evidenceBreadth = Math.min(activity.sources.length, 3);
    return { activity, first, second, score: relevance * 4 + discrimination * 3 + evidenceBreadth };
  }).sort((a, b) => b.score - a.score || b.activity.sources.length - a.activity.sources.length || a.activity.label.localeCompare(b.activity.label));

  // When the user has ten or fewer credible activity records, keep every
  // separate activity available for review. Ranking only needs to remove items
  // when the evidence set is larger than the tunnel limit.
  if (ranked.length <= limit) return ranked.map(({ activity }) => activity);

  const credible = ranked.filter(({ activity }) => careerIds.some((careerId) => getCareerActivity(careerId, activity.canonicalId).importance !== "Limited") || activity.sources.length > 1);
  const pool = credible.length > 0 ? credible : ranked;
  const chosen = new Map<string, NormalizedActivity>();
  const take = (candidates: typeof pool, count: number) => candidates.slice(0, count).forEach(({ activity }) => chosen.set(activity.id, activity));

  // Product-discovery heuristic: create a useful comparison set rather than a
  // generic ranking — up to four shared activities and three leaning toward
  // each career, then fill any remaining places with the strongest evidence.
  take(pool.filter(({ first, second }) => first >= 2 && second >= 2 && Math.abs(first - second) <= 1), Math.min(4, limit));
  take(pool.filter(({ first, second }) => first >= 2 && first > second), Math.min(3, limit - chosen.size));
  take(pool.filter(({ first, second }) => second >= 2 && second > first), Math.min(3, limit - chosen.size));
  take(pool.filter(({ activity }) => !chosen.has(activity.id)), limit - chosen.size);

  return [...chosen.values()].slice(0, limit);
}
