import type { ActivityEvidenceResponse, NormalizedActivity } from "@/types/prototype";

export const MIN_PRIORITY_ACTIVITIES = 5;
export const MAX_PRIORITY_ACTIVITIES = 8;

export function getActivitiesByPreference(activities: NormalizedActivity[], responses: Record<string, ActivityEvidenceResponse>, preference: "more" | "less") {
  return activities.filter((activity) => responses[activity.id]?.preference === preference);
}

export function needsForcedPriorityChoice(activities: NormalizedActivity[], responses: Record<string, ActivityEvidenceResponse>) {
  return getActivitiesByPreference(activities, responses, "more").length > MAX_PRIORITY_ACTIVITIES;
}

export function canContinuePrioritySelection(activities: NormalizedActivity[], responses: Record<string, ActivityEvidenceResponse>, priorityIds: string[]) {
  const validMoreIds = new Set(getActivitiesByPreference(activities, responses, "more").map((activity) => activity.id));
  const validPriorityIds = priorityIds.filter((id) => validMoreIds.has(id));
  return !needsForcedPriorityChoice(activities, responses) || (validPriorityIds.length >= MIN_PRIORITY_ACTIVITIES && validPriorityIds.length <= MAX_PRIORITY_ACTIVITIES);
}
