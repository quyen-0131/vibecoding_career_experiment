import type { CareerId } from "@/data/careers";
import type { ActivityEvidenceResponse, CareerTransfer, NormalizedActivity } from "@/types/prototype";

const unknownTransfer = (careerId: CareerId): CareerTransfer => ({
  careerId,
  careerActivityId: "unknown",
  relationship: "unknown",
  importance: "Limited",
  confidence: "low",
  rationale: "There is not enough information to map this activity responsibly yet.",
});

export type CareerEvidenceMatrixRow = {
  activity: NormalizedActivity;
  pastEvidence: { recurrenceCount: number; sourceExperienceIds: string[] };
  preference?: ActivityEvidenceResponse["preference"];
  careerRelevance: Record<CareerId, CareerTransfer>;
};

export function buildCareerEvidenceMatrix(
  activities: NormalizedActivity[],
  careers: CareerId[],
  responses: Record<string, ActivityEvidenceResponse>,
): CareerEvidenceMatrixRow[] {
  return activities.map((activity) => ({
    activity,
    pastEvidence: {
      recurrenceCount: activity.recurrenceCount,
      sourceExperienceIds: activity.sources.map((source) => source.experienceId),
    },
    preference: responses[activity.id]?.preference,
    careerRelevance: Object.fromEntries(careers.map((careerId) => [careerId, activity.careerTransfers[careerId] ?? unknownTransfer(careerId)])) as Record<CareerId, CareerTransfer>,
  }));
}
