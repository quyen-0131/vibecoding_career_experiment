import { getCareerModel, getRemainingEvidenceGaps, type CareerId } from "@/data/careers";
import { buildCareerEvidenceMatrix } from "@/lib/evidence/buildCareerEvidenceMatrix";
import type { ActivityEvidenceResponse, NormalizedActivity } from "@/types/prototype";

export function buildStartingEvidence(
  careerId: CareerId,
  activities: NormalizedActivity[],
  responses: Record<string, ActivityEvidenceResponse>,
  priorityIds: string[],
) {
  const career = getCareerModel(careerId);
  if (!career) return undefined;

  const matrix = buildCareerEvidenceMatrix(activities, [careerId], responses);
  const transfers = matrix
    .map((row) => ({
      activity: row.activity,
      relevance: row.careerRelevance[careerId],
      response: { preference: row.preference, confidence: row.confidence },
      priority: priorityIds.includes(row.activity.id),
    }))
    .filter((item) => item.relevance.importance !== "Limited")
    .sort((a, b) => Number(b.priority) - Number(a.priority) || b.activity.recurrenceCount - a.activity.recurrenceCount)
    .slice(0, 7);
  const gaps = getRemainingEvidenceGaps(careerId, activities.map((activity) => activity.canonicalId), 4);
  const interpretation = transfers.length >= 4
    ? `Your background provides several transferable foundations for ${career.title}, while the role-specific activities below remain relatively untested.`
    : transfers.length > 0
      ? `Your past experience provides some transferable foundations for ${career.title}, but several defining parts of the role remain untested.`
      : `Your selected experiences provide limited direct evidence about ${career.title}. That is an evidence gap, not a judgement about suitability.`;

  return { career, transfers, gaps, interpretation };
}
