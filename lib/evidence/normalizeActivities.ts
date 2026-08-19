import { getActivityDefinition, makeCustomActivityId } from "@/data/activityCatalog";
import { careerModels, type CareerId } from "@/data/careers";
import { mapNormalizedActivity } from "@/lib/evidence/semanticActivityMapping";
import type { CareerTransfer, DetectedExperience, NormalizedActivity } from "@/types/prototype";

const transferStrength = (transfer: CareerTransfer) => {
  const relationship = { direct: 4, transferable: 3, adjacent: 2, unknown: 0 }[transfer.relationship];
  const importance = { Core: 4, Important: 3, Supporting: 2, Limited: 0 }[transfer.importance];
  const confidence = { high: 3, medium: 2, low: 1 }[transfer.confidence];
  return relationship * 100 + importance * 10 + confidence;
};

export function normalizeActivities(experiences: DetectedExperience[], careerIds: CareerId[] = []): NormalizedActivity[] {
  const targetCareerIds = careerIds.length ? careerIds : careerModels.map((career) => career.id);
  const rawActivities: NormalizedActivity[] = [];

  experiences.forEach((experience) => {
    experience.activities.filter((activity) => activity.label.trim()).forEach((activity) => {
      // CV extraction may already identify a canonical activity label. Keep the
      // supporting resume wording as provenance while using the canonical
      // definition for the concise activity shown to the user.
      const originalLabel = activity.supportingText.trim() || activity.label.trim();
      const originalCanonicalId = activity.canonicalId || makeCustomActivityId(originalLabel);
      const definition = getActivityDefinition(originalCanonicalId);
      const base: NormalizedActivity = {
        id: `evidence-${originalCanonicalId}-${activity.id}`,
        canonicalId: originalCanonicalId,
        originalLabel,
        originalLabels: [originalLabel],
        label: definition?.label ?? originalLabel,
        category: definition?.category ?? activity.category,
        sources: [{ experienceId: experience.id, title: experience.title, organisation: experience.organisation }],
        recurrenceCount: 1,
        components: [],
        careerTransfers: {},
        mappingStatus: "unknown",
        userAdded: originalCanonicalId.startsWith("custom-"),
      };
      const mapped = mapNormalizedActivity(base, targetCareerIds);
      rawActivities.push({
        ...base,
        // If extraction already identified a catalogue activity, keep that
        // identity as the merge key. Semantic components enrich the evidence;
        // they should not silently replace a confirmed canonical activity.
        canonicalId: definition?.id ?? mapped.components[0]?.canonicalActivityId ?? originalCanonicalId,
        label: mapped.normalizedLabel,
        category: mapped.category,
        components: mapped.components,
        careerTransfers: mapped.careerTransfers,
        mappingStatus: mapped.mappingStatus,
      });
    });
  });

  const merged = new Map<string, NormalizedActivity>();
  rawActivities.forEach((activity) => {
    const key = activity.canonicalId;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...activity, id: `evidence-${key}` });
      return;
    }
    activity.originalLabels.forEach((label) => {
      if (!existing.originalLabels.some((item) => item.toLowerCase() === label.toLowerCase())) existing.originalLabels.push(label);
    });
    activity.sources.forEach((source) => {
      if (!existing.sources.some((item) => item.experienceId === source.experienceId)) existing.sources.push(source);
    });
    activity.components.forEach((component) => {
      if (!existing.components.some((item) => item.canonicalActivityId === component.canonicalActivityId)) existing.components.push(component);
    });
    Object.entries(activity.careerTransfers).forEach(([careerId, transfer]) => {
      if (!transfer) return;
      const typedCareerId = careerId as CareerId;
      const current = existing.careerTransfers[typedCareerId];
      if (!current || transferStrength(transfer) > transferStrength(current)) existing.careerTransfers[typedCareerId] = transfer;
    });
    existing.recurrenceCount = existing.sources.length;
    existing.mappingStatus = existing.components.length ? (targetCareerIds.some((careerId) => existing.careerTransfers[careerId]?.relationship === "unknown") ? "partial" : "mapped") : "unknown";
  });

  return [...merged.values()];
}
