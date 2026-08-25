import { getActivityDefinition } from "@/data/activityCatalog";
import { getCareerModel, getRemainingEvidenceGaps, type CareerId, type CareerImportance } from "@/data/careers";
import { buildCareerEvidenceMatrix } from "@/lib/evidence/buildCareerEvidenceMatrix";
import type { ActivityEvidenceResponse, ActivityPreference, NormalizedActivity } from "@/types/prototype";

const importanceOrder: Record<CareerImportance, number> = { Core: 4, Important: 3, Supporting: 2, Limited: 1 };
const preferenceOrder: Record<ActivityPreference, number> = { more: 3, same: 2, less: 1 };

const activityGroupOrder = [
  "Research & discovery",
  "Analysis & measurement",
  "Communication & influence",
  "Strategy & decisions",
  "Execution & collaboration",
  "Other role activities",
] as const;

type ActivityGroupName = (typeof activityGroupOrder)[number];

function getActivityGroupName(activityId: string): ActivityGroupName {
  const category = getActivityDefinition(activityId)?.category;
  if (category === "Research") return "Research & discovery";
  if (category === "Analysis") return "Analysis & measurement";
  if (category === "Communication" || category === "Written Work") return "Communication & influence";
  if (category === "Product & Strategy") return "Strategy & decisions";
  if (category === "Execution" || category === "Planning & Design") return "Execution & collaboration";
  return "Other role activities";
}

function describePreference(preference?: ActivityPreference) {
  if (preference === "more") return "More";
  if (preference === "same") return "About the same";
  if (preference === "less") return "Less";
  return "Not reviewed";
}

export function buildStartingEvidence(
  careerId: CareerId,
  activities: NormalizedActivity[],
  responses: Record<string, ActivityEvidenceResponse>,
) {
  const career = getCareerModel(careerId);
  if (!career) return undefined;

  const matrix = buildCareerEvidenceMatrix(activities, [careerId], responses);
  const rankedTransfers = matrix
    .map((row) => {
      const response = responses[row.activity.id] ?? {};
      return {
        activity: row.activity,
        relevance: row.careerRelevance[careerId],
        response,
        preferenceLabel: describePreference(row.preference),
        preferenceContext: response.preferenceSource === "group" ? "Group preference" : "Preference",
      };
    })
    .filter((item) => item.relevance.relationship !== "unknown")
    .sort((a, b) =>
      importanceOrder[b.relevance.importance] - importanceOrder[a.relevance.importance] ||
      (b.response.preference ? preferenceOrder[b.response.preference] : 0) -
        (a.response.preference ? preferenceOrder[a.response.preference] : 0) ||
      b.activity.recurrenceCount - a.activity.recurrenceCount
    );
  const matchedCount = rankedTransfers.length;
  const transfers = rankedTransfers.slice(0, 5);

  const evidencedCareerActivityIds = activities.flatMap((activity) => {
    const transfer = activity.careerTransfers[careerId];
    return transfer && transfer.relationship !== "unknown" ? [transfer.careerActivityId] : [];
  });
  const evidencedActivityIds = new Set(evidencedCareerActivityIds);
  const gaps = getRemainingEvidenceGaps(careerId, evidencedCareerActivityIds, 5);
  const centralCareerActivities = career.activities.filter(
    (activity) => activity.importance === "Core" || activity.importance === "Important",
  );
  const coreActivities = centralCareerActivities
    .filter((activity) => activity.importance === "Core")
    .slice(0, 5);
  const activityGroups = activityGroupOrder
    .map((name) => {
      const groupActivities = centralCareerActivities
        .filter((activity) => getActivityGroupName(activity.id) === name)
        .map((activity) => {
          const supportingEvidence = rankedTransfers.find(
            ({ relevance }) => relevance.careerActivityId === activity.id,
          );
          return {
            ...activity,
            hasEvidence: evidencedActivityIds.has(activity.id),
            preferenceLabel: describePreference(supportingEvidence?.response.preference),
            hasPreference: Boolean(supportingEvidence?.response.preference),
          };
        });
      const representedCount = groupActivities.filter((activity) => activity.hasEvidence).length;
      const preferenceLabels = [...new Set(
        groupActivities
          .filter((activity) => activity.hasEvidence && activity.hasPreference)
          .map((activity) => activity.preferenceLabel),
      )];
      return {
        name,
        activities: groupActivities,
        representedCount,
        totalCount: groupActivities.length,
        coveragePercentage: groupActivities.length
          ? Math.round((representedCount / groupActivities.length) * 100)
          : 0,
        preferenceLabel: preferenceLabels.length === 1
          ? preferenceLabels[0]
          : preferenceLabels.length > 1
            ? "Mixed"
            : undefined,
      };
    })
    .filter((group) => group.totalCount > 0);

  const centralPositive = new Set(transfers
    .filter(({ relevance, response }) =>
      (relevance.importance === "Core" || relevance.importance === "Important") &&
      (response.preference === "more" || response.preference === "same")
    )
    .map(({ activity, response }) => response.groupId ?? activity.id)).size;
  const centralLess = new Set(transfers
    .filter(({ relevance, response }) =>
      (relevance.importance === "Core" || relevance.importance === "Important") &&
      response.preference === "less"
    )
    .map(({ activity, response }) => response.groupId ?? activity.id)).size;

  const interpretation = matchedCount === 0
    ? `Your selected experiences provide little mapped evidence for ${career.title}. This means the path is still largely untested.`
    : centralPositive > 0
      ? `You have ${centralPositive} ${centralPositive === 1 ? "central activity group" : "central activity groups"} that you want more or about the same of in ${career.title}.${centralLess ? ` You also want less of ${centralLess} central ${centralLess === 1 ? "activity group" : "activity groups"}, which may be useful to test in context.` : ""}`
      : `Some of your past work transfers to ${career.title}, but your preferences do not yet provide a clear direction. The unknown areas below are possible candidates for a future test.`;

  return { career, coreActivities, activityGroups, transfers, matchedCount, gaps, interpretation };
}
