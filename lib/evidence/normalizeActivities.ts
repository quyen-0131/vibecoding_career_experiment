import { getActivityDefinition, makeCustomActivityId } from "@/data/activityCatalog";
import type { DetectedExperience, NormalizedActivity } from "@/types/prototype";

export function normalizeActivities(experiences: DetectedExperience[]): NormalizedActivity[] {
  const normalized = new Map<string, NormalizedActivity>();

  experiences.forEach((experience) => {
    experience.activities.filter((activity) => activity.label.trim()).forEach((activity) => {
      const canonicalId = activity.canonicalId || makeCustomActivityId(activity.label);
      const definition = getActivityDefinition(canonicalId);
      const source = {
        experienceId: experience.id,
        title: experience.title,
        organisation: experience.organisation,
      };
      const existing = normalized.get(canonicalId);

      if (existing) {
        if (!existing.sources.some((item) => item.experienceId === experience.id)) {
          existing.sources.push(source);
          existing.recurrenceCount = existing.sources.length;
        }
        return;
      }

      normalized.set(canonicalId, {
        id: `evidence-${canonicalId}`,
        canonicalId,
        label: definition?.label ?? activity.label,
        category: definition?.category ?? activity.category,
        sources: [source],
        recurrenceCount: 1,
        userAdded: canonicalId.startsWith("custom-"),
      });
    });
  });

  return [...normalized.values()];
}
