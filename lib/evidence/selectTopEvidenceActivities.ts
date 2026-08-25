import type { CareerId, CareerImportance } from "@/data/careers";
import type {
  ActivityEvidenceResponse,
  ActivityPreference,
  CareerTransfer,
  NormalizedActivity,
  SemanticConfidence,
} from "@/types/prototype";

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

const communicationActivityIds = new Set([
  "client-presentation",
  "stakeholder-communication",
  "report-writing",
  "proposal-development",
  "enablement-materials",
]);

const reviewGroups = [
  { id: "research", label: "Research" },
  { id: "analysis", label: "Analysis" },
  { id: "communication", label: "Communication" },
  { id: "strategy-planning", label: "Strategy & planning" },
  { id: "execution-collaboration", label: "Execution & collaboration" },
  { id: "other", label: "Other work" },
] as const;

export type EvidenceActivityGroup = {
  id: string;
  label: string;
  activities: NormalizedActivity[];
};

function getReviewGroupId(activity: NormalizedActivity) {
  if (communicationActivityIds.has(activity.canonicalId)) return "communication";
  if (activity.category === "Research") return "research";
  if (activity.category === "Analysis") return "analysis";
  if (activity.category === "Communication" || activity.category === "Written Work") return "communication";
  if (activity.category === "Product & Strategy" || activity.category === "Planning & Design") return "strategy-planning";
  if (activity.category === "Execution") return "execution-collaboration";
  return "other";
}

export function getEvidenceActivityGroups(activities: NormalizedActivity[]): EvidenceActivityGroup[] {
  return reviewGroups
    .map((definition) => ({
      ...definition,
      activities: activities.filter((activity) => getReviewGroupId(activity) === definition.id),
    }))
    .filter((group) => group.activities.length > 0);
}

export function applyPreferenceToActivityGroup(
  responses: Record<string, ActivityEvidenceResponse>,
  group: EvidenceActivityGroup,
  preference: ActivityPreference,
) {
  const next = { ...responses };
  group.activities.forEach((activity) => {
    next[activity.id] = {
      preference,
      preferenceSource: "group",
      groupId: group.id,
    };
  });
  return next;
}

export function sortActivitiesForGroupedReview(activities: NormalizedActivity[]) {
  const groupOrder = new Map(reviewGroups.map((group, index) => [group.id, index]));
  return [...activities].sort((a, b) => {
    const groupDifference = (groupOrder.get(getReviewGroupId(a)) ?? 99) - (groupOrder.get(getReviewGroupId(b)) ?? 99);
    return groupDifference || a.label.localeCompare(b.label);
  });
}
