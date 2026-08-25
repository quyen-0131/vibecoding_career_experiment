import { getActivityDefinition, makeCustomActivityId } from "@/data/activityCatalog";
import { careerModels, getCareerModel, type CareerId, type CareerImportance } from "@/data/careers";
import { analyzeResumeEvidence } from "@/lib/analysis/analyzeResumeEvidence";
import { logResumeAnalysis } from "@/lib/debug/logResumeAnalysis";
import { mapNormalizedActivity } from "@/lib/evidence/semanticActivityMapping";
import type { CareerTransfer, DetectedExperience, NormalizedActivity } from "@/types/prototype";
import type { SkillInference, SkillRoleRelevance } from "@/types/skillEvidence";

const importanceValue: Record<CareerImportance | "Unknown", number> = {
  Core: 4, Important: 3, Supporting: 2, Limited: 1, Unknown: 0,
};

const transferStrength = (transfer: CareerTransfer) => {
  const relationship = { direct: 4, transferable: 3, adjacent: 2, unknown: 0 }[transfer.relationship];
  const confidence = { high: 3, medium: 2, low: 1 }[transfer.confidence];
  return relationship * 100 + importanceValue[transfer.importance] * 10 + confidence;
};

const inferenceStrength = (inference: SkillInference) =>
  ({ high: 3, medium: 2, low: 1 }[inference.confidence]);

function mergeSkillInferences(existing: SkillInference[], incoming: SkillInference[]) {
  const merged = new Map(existing.map((item) => [item.skillId, { ...item, sourceEvidenceIds: [...item.sourceEvidenceIds] }]));
  incoming.forEach((item) => {
    const current = merged.get(item.skillId);
    if (!current) {
      merged.set(item.skillId, { ...item, sourceEvidenceIds: [...item.sourceEvidenceIds] });
      return;
    }
    item.sourceEvidenceIds.forEach((id) => {
      if (!current.sourceEvidenceIds.includes(id)) current.sourceEvidenceIds.push(id);
    });
    if (inferenceStrength(item) > inferenceStrength(current)) {
      merged.set(item.skillId, { ...item, sourceEvidenceIds: current.sourceEvidenceIds });
    }
  });
  return [...merged.values()];
}

function relevanceTransfers(
  relevance: SkillRoleRelevance[],
  careerIds: CareerId[],
): Partial<Record<CareerId, CareerTransfer>> {
  const transfers: Partial<Record<CareerId, CareerTransfer>> = {};
  careerIds.forEach((careerId) => {
    const title = getCareerModel(careerId)?.title;
    const best = relevance
      .filter((item) => item.roleTitle === title && item.importance !== "Unknown")
      .sort((a, b) => importanceValue[b.importance] - importanceValue[a.importance])[0];
    if (!best || best.importance === "Unknown") return;
    transfers[careerId] = {
      careerId,
      careerActivityId: best.skillId,
      relationship: best.relationship,
      importance: best.importance,
      confidence: best.confidence,
      rationale: best.explanation,
    };
  });
  return transfers;
}

function combineTransfers(
  current: Partial<Record<CareerId, CareerTransfer>>,
  incoming: Partial<Record<CareerId, CareerTransfer>>,
) {
  const combined = { ...current };
  Object.entries(incoming).forEach(([careerId, transfer]) => {
    if (!transfer) return;
    const typedId = careerId as CareerId;
    const existing = combined[typedId];
    if (!existing || transferStrength(transfer) > transferStrength(existing)) {
      combined[typedId] = transfer;
    }
  });
  return combined;
}

export function mergeNormalizedActivities(
  activities: NormalizedActivity[],
  careerIds: CareerId[] = [],
): NormalizedActivity[] {
  const targetCareerIds = careerIds.length ? careerIds : careerModels.map((career) => career.id);
  const merged = new Map<string, NormalizedActivity>();

  activities.forEach((activity) => {
    const definition = getActivityDefinition(activity.canonicalId);
    const canonicalId = definition?.id ?? activity.canonicalId;
    const key = canonicalId || makeCustomActivityId(activity.label);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, {
        ...activity,
        id: `evidence-${key}`,
        canonicalId,
        label: definition?.label ?? activity.label,
        category: definition?.category ?? activity.category,
        originalLabels: [...activity.originalLabels],
        originalEvidence: [...(activity.originalEvidence ?? [])],
        sources: [...activity.sources],
        components: [...activity.components],
        careerTransfers: { ...activity.careerTransfers },
        resumeEvidence: [...(activity.resumeEvidence ?? [])],
        skillInferences: [...(activity.skillInferences ?? [])],
        skillRoleRelevance: [...(activity.skillRoleRelevance ?? [])],
      });
      return;
    }

    activity.originalLabels.forEach((label) => {
      if (!existing.originalLabels.some((item) => item.toLowerCase() === label.toLowerCase())) {
        existing.originalLabels.push(label);
      }
    });
    (activity.originalEvidence ?? []).forEach((evidence) => {
      const included = existing.originalEvidence.some((item) =>
        item.experienceId === evidence.experienceId && item.label.toLowerCase() === evidence.label.toLowerCase(),
      );
      if (!included) existing.originalEvidence.push(evidence);
    });
    activity.sources.forEach((source) => {
      if (!existing.sources.some((item) => item.experienceId === source.experienceId)) {
        existing.sources.push(source);
      }
    });
    activity.components.forEach((component) => {
      if (!existing.components.some((item) => item.canonicalActivityId === component.canonicalActivityId)) {
        existing.components.push(component);
      }
    });
    (activity.resumeEvidence ?? []).forEach((evidence) => {
      if (!(existing.resumeEvidence ?? []).some((item) => item.id === evidence.id)) {
        existing.resumeEvidence = [...(existing.resumeEvidence ?? []), evidence];
      }
    });
    existing.skillInferences = mergeSkillInferences(existing.skillInferences ?? [], activity.skillInferences ?? []);
    (activity.skillRoleRelevance ?? []).forEach((item) => {
      const list = existing.skillRoleRelevance ?? [];
      const currentIndex = list.findIndex(
        (current) => current.skillId === item.skillId && current.roleTitle === item.roleTitle,
      );
      if (currentIndex < 0) {
        existing.skillRoleRelevance = [...list, item];
      } else if (importanceValue[item.importance] > importanceValue[list[currentIndex].importance]) {
        existing.skillRoleRelevance = list.map((current, index) => index === currentIndex ? item : current);
      }
    });
    existing.careerTransfers = combineTransfers(existing.careerTransfers, activity.careerTransfers);
    existing.recurrenceCount = existing.sources.length;
    existing.mappingStatus = existing.skillInferences?.length || existing.components.length
      ? targetCareerIds.some((careerId) => existing.careerTransfers[careerId]?.relationship === "unknown")
        ? "partial"
        : "mapped"
      : "unknown";
  });

  return [...merged.values()];
}

export function normalizeActivities(experiences: DetectedExperience[], careerIds: CareerId[] = []): NormalizedActivity[] {
  const targetCareerIds = careerIds.length ? careerIds : careerModels.map((career) => career.id);
  const roles = targetCareerIds.map((careerId) => ({
    id: careerId,
    title: getCareerModel(careerId)?.title ?? careerId,
  }));
  const rawActivities: NormalizedActivity[] = [];

  experiences.forEach((experience) => {
    experience.activities.filter((activity) => activity.label.trim()).forEach((activity) => {
      const originalLabel = activity.supportingText.trim() || activity.label.trim();
      const originalCanonicalId = activity.canonicalId || makeCustomActivityId(originalLabel);
      const definition = getActivityDefinition(originalCanonicalId);
      const source = { experienceId: experience.id, title: experience.title, organisation: experience.organisation };
      const analysis = analyzeResumeEvidence({ text: originalLabel, source, roles });
      logResumeAnalysis(analysis);
      const inferred = analysis.skills[0];
      const base: NormalizedActivity = {
        id: `evidence-${originalCanonicalId}-${activity.id}`,
        canonicalId: definition?.id ?? inferred?.skillId ?? originalCanonicalId,
        originalLabel,
        originalLabels: [originalLabel],
        originalEvidence: [{ ...source, label: originalLabel }],
        label: definition?.label ?? inferred?.label ?? originalLabel,
        category: definition?.category ?? inferred?.category ?? activity.category,
        sources: [source],
        recurrenceCount: 1,
        components: [],
        careerTransfers: {},
        mappingStatus: "unknown",
        userAdded: originalCanonicalId.startsWith("custom-"),
        resumeEvidence: [analysis.evidence],
        skillInferences: analysis.skills,
        skillRoleRelevance: analysis.roleRelevance,
      };
      const mapped = mapNormalizedActivity(base, targetCareerIds);
      // A sentence can imply several skills (for example, behavioural analysis
      // can also mention data). When extraction already supplied a known
      // canonical activity, only that activity may refine its role mapping.
      // This prevents a neighbouring inference from changing what the user is
      // actually reviewing.
      const relevantRoleEvidence = definition
        ? analysis.roleRelevance.filter((item) => item.skillId === definition.id)
        : analysis.roleRelevance;
      const careerTransfers = combineTransfers(
        mapped.careerTransfers,
        relevanceTransfers(relevantRoleEvidence, targetCareerIds),
      );
      const hasMapped = targetCareerIds.some((careerId) => careerTransfers[careerId]);
      const hasUnknown = targetCareerIds.some(
        (careerId) => !careerTransfers[careerId] || careerTransfers[careerId]?.relationship === "unknown",
      );
      rawActivities.push({
        ...base,
        canonicalId: definition?.id ?? inferred?.skillId ?? mapped.components[0]?.canonicalActivityId ?? originalCanonicalId,
        label: definition?.label ?? inferred?.label ?? mapped.normalizedLabel,
        category: definition?.category ?? inferred?.category ?? mapped.category,
        components: mapped.components,
        careerTransfers,
        mappingStatus: hasMapped ? (hasUnknown ? "partial" : "mapped") : "unknown",
      });
    });
  });

  return mergeNormalizedActivities(rawActivities, targetCareerIds);
}
