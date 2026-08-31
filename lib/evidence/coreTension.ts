import { getActivityDefinition, type ActivityCategory } from "@/data/activityCatalog";
import { getCareerModel, type CareerId } from "@/data/careers";
import type { ContradictionCause } from "@/types/experiment";
import type { PreferenceFinding } from "@/lib/evidence/preferenceShift";

/**
 * A Core Tension: a Career Option treats an Activity Group as Core, and the
 * User wanted less of that work after doing it.
 *
 * Core work is the part of a job you cannot avoid by choosing a different team
 * or employer, so a stated dislike of it is the most decision-relevant thing a
 * Preference can produce. We state the two facts side by side and stop. We do
 * not conclude that the career is a poor fit, and we never count tensions
 * across groups: that would be the career-fit score AGENTS.md principle 1
 * forbids. See docs/adr/0007-core-tension-is-stated-not-resolved.md.
 */

export type CoreTension = {
  category: ActivityCategory;
  careerId: CareerId;
  careerTitle: string;
  /** The Core activities in this group, so the claim is concrete. */
  coreActivityLabels: string[];
};

/** Activity Groups a career treats as Core. */
function coreCategoriesOf(careerId: CareerId) {
  const career = getCareerModel(careerId);
  const byCategory = new Map<ActivityCategory, string[]>();
  for (const activity of career?.activities ?? []) {
    if (activity.importance !== "Core") continue;
    const category = getActivityDefinition(activity.id)?.category;
    if (!category) continue;
    byCategory.set(category, [...(byCategory.get(category) ?? []), activity.label]);
  }
  return byCategory;
}

export function findCoreTensions({
  careers,
  findings,
  contradictionCauses,
}: {
  careers: CareerId[];
  findings: PreferenceFinding[];
  contradictionCauses: Partial<Record<string, ContradictionCause>>;
}): CoreTension[] {
  const tensions: CoreTension[] = [];

  for (const finding of findings) {
    // Only a clear "less". "About the same" is not a tension, and a mixed or
    // unresolved reaction is not evidence about the work at all.
    if (finding.kind !== "shift" && finding.kind !== "first-evidence") continue;
    if (finding.informed !== "less") continue;

    // If they put the reaction down to the particular task, it says nothing
    // about the work itself. See ADR 0005.
    if (contradictionCauses[finding.category] === "this-task") continue;

    for (const careerId of careers) {
      const coreLabels = coreCategoriesOf(careerId).get(finding.category);
      if (!coreLabels?.length) continue;
      tensions.push({
        category: finding.category,
        careerId,
        careerTitle: getCareerModel(careerId)?.title ?? careerId,
        coreActivityLabels: coreLabels,
      });
    }
  }

  return tensions;
}
