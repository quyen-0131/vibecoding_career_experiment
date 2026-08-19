import { getCareerModel, getRemainingEvidenceGaps, type CareerId, type CareerImportance } from "@/data/careers";
import { buildCareerEvidenceMatrix } from "@/lib/evidence/buildCareerEvidenceMatrix";
import type { ActivityEvidenceResponse, ActivityPreference, NormalizedActivity, SkillConfidence } from "@/types/prototype";

const importanceOrder: Record<CareerImportance, number> = { Core: 4, Important: 3, Supporting: 2, Limited: 1 };
const preferenceOrder: Record<ActivityPreference, number> = { more: 3, same: 2, less: 1 };
const confidenceOrder: Record<SkillConfidence, number> = { high: 3, medium: 2, low: 1 };

function describeEvidenceCombination(importance: CareerImportance, preference?: ActivityPreference, confidence?: SkillConfidence) {
  const centralToRole = importance === "Core" || importance === "Important";
  const wantsSameOrMore = preference === "more" || preference === "same";
  const feelsReasonablyConfident = confidence === "high" || confidence === "medium";
  if (!preference || !confidence) return "You have past experience here, but have not reviewed how this work feels yet.";
  if (preference === "less") return "You have experience with this work, but would prefer less of it in your future role.";
  if (wantsSameOrMore && confidence === "low") return "You want the same or more of this work, while your current self-confidence is still developing.";
  if (centralToRole && wantsSameOrMore && feelsReasonablyConfident) return "You want the same or more of this work and currently feel reasonably confident doing it.";
  if (wantsSameOrMore && feelsReasonablyConfident) return "This is transferable experience you want the same or more of and currently feel reasonably confident doing.";
  return "Your experience transfers to this role, although the current evidence is not yet clear enough to interpret further.";
}

export function buildStartingEvidence(
  careerId: CareerId,
  activities: NormalizedActivity[],
  responses: Record<string, ActivityEvidenceResponse>,
) {
  const career = getCareerModel(careerId);
  if (!career) return undefined;

  const matrix = buildCareerEvidenceMatrix(activities, [careerId], responses);
  const transfers = matrix
    .map((row) => {
      const relevance = row.careerRelevance[careerId];
      return {
        activity: row.activity,
        relevance,
        response: { preference: row.preference, confidence: row.confidence },
        evidenceMeaning: describeEvidenceCombination(relevance.importance, row.preference, row.confidence),
      };
    })
    .filter((item) => item.relevance.relationship !== "unknown")
    .sort((a, b) => {
      const importanceDifference = importanceOrder[b.relevance.importance] - importanceOrder[a.relevance.importance];
      if (importanceDifference) return importanceDifference;
      const preferenceDifference = (b.response.preference ? preferenceOrder[b.response.preference] : 0) - (a.response.preference ? preferenceOrder[a.response.preference] : 0);
      if (preferenceDifference) return preferenceDifference;
      const confidenceDifference = (b.response.confidence ? confidenceOrder[b.response.confidence] : 0) - (a.response.confidence ? confidenceOrder[a.response.confidence] : 0);
      return confidenceDifference || b.activity.recurrenceCount - a.activity.recurrenceCount;
    })
    .slice(0, 7);

  const evidencedCareerActivityIds = activities.flatMap((activity) => {
    const transfer = activity.careerTransfers[careerId];
    return transfer && transfer.relationship !== "unknown" ? [transfer.careerActivityId] : [];
  });
  const gaps = getRemainingEvidenceGaps(careerId, evidencedCareerActivityIds, 4);
  const strongStartingSignals = transfers.filter(({ relevance, response }) =>
    (relevance.importance === "Core" || relevance.importance === "Important")
    && (response.preference === "more" || response.preference === "same")
    && (response.confidence === "high" || response.confidence === "medium"),
  ).length;
  const roleTensions = transfers.filter(({ relevance, response }) =>
    (relevance.importance === "Core" || relevance.importance === "Important") && response.preference === "less",
  ).length;

  const interpretation = strongStartingSignals > 0
    ? `For ${career.title}, ${strongStartingSignals} central mapped ${strongStartingSignals === 1 ? "activity matches" : "activities match"} work you want more or about the same of and currently rate at medium or high confidence.${roleTensions ? ` ${roleTensions} central ${roleTensions === 1 ? "activity has" : "activities have"} a preference tension worth testing.` : ""}`
    : transfers.length > 0
      ? `You have transferable experience for ${career.title}, but the current combination of role importance, preference and self-confidence does not yet create a strong starting signal.`
      : `Your selected experiences provide limited mapped evidence about ${career.title}. Unmapped evidence remains unknown rather than being treated as unimportant.`;

  return { career, transfers, gaps, interpretation };
}
