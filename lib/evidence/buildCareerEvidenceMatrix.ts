import { getCareerActivity, type CareerId } from "@/data/careers";
import type { ActivityEvidenceResponse, NormalizedActivity } from "@/types/prototype";

export type CareerEvidenceMatrixRow = {
  activity: NormalizedActivity;
  pastEvidence: {
    recurrenceCount: number;
    sourceExperienceIds: string[];
  };
  preference?: ActivityEvidenceResponse["preference"];
  confidence?: ActivityEvidenceResponse["confidence"];
  careerRelevance: Record<CareerId, ReturnType<typeof getCareerActivity>>;
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
    confidence: responses[activity.id]?.confidence,
    careerRelevance: Object.fromEntries(
      careers.map((careerId) => [careerId, getCareerActivity(careerId, activity.canonicalId)]),
    ) as Record<CareerId, ReturnType<typeof getCareerActivity>>,
  }));
}
