import type { ActivityCategory } from "@/data/activityCatalog";
import type { ActivityReaction, ExperimentActivity } from "@/types/experiment";
import type { ActivityEvidenceResponse, ActivityPreference, NormalizedActivity } from "@/types/prototype";

/**
 * The Preference Shift: the difference between what a User predicted they
 * wanted (Phase 2, recalling work from their CV) and what they wanted after
 * actually doing it (Phase 3).
 *
 * See CONTEXT.md ("Findings") and docs/adr/0006-experiments-are-role-shaped.md.
 * Experiment Aspects are fixed by the role, so a role naturally covers some
 * Activity Groups the User has evidence for and some they do not. The first
 * kind yields a Shift; the second yields First Evidence. Neither is a lesser
 * result.
 */

export type ShiftDirection = "confirmed" | "cooled" | "warmed";

type Base = { category: ActivityCategory; aspectLabels: string[] };

export type PreferenceFinding =
  | (Base & {
      kind: "shift";
      imagined: ActivityPreference;
      informed: ActivityPreference;
      direction: ShiftDirection;
      /** Wanted more beforehand, wanted less or the same after doing it. */
      isContradiction: boolean;
    })
  | (Base & { kind: "first-evidence"; informed: ActivityPreference })
  /** They did the work and still cannot say. A real answer, not a gap. */
  | (Base & { kind: "unresolved"; imagined?: ActivityPreference })
  /** Aspects in one group disagreed. We do not average a person. */
  | (Base & { kind: "mixed"; imagined?: ActivityPreference });

/** The single value a set of answers agrees on, or undefined if they disagree. */
function agreedValue<T>(values: T[]): T | undefined {
  if (values.length === 0) return undefined;
  const [first] = values;
  return values.every((value) => value === first) ? first : undefined;
}

function byCategory<T>(items: T[], category: (item: T) => ActivityCategory) {
  const groups = new Map<ActivityCategory, T[]>();
  for (const item of items) {
    const key = category(item);
    const existing = groups.get(key);
    if (existing) existing.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

function directionOf(imagined: ActivityPreference, informed: ActivityPreference): ShiftDirection {
  if (imagined === informed) return "confirmed";
  const rank = { less: 0, same: 1, more: 2 } as const;
  return rank[informed] > rank[imagined] ? "warmed" : "cooled";
}

export type PreferenceShiftInput = {
  /** Phase 1 evidence, carrying the Activity Group of each confirmed activity. */
  normalizedActivities: NormalizedActivity[];
  /** Phase 2 answers, keyed by normalized activity id. */
  evidenceResponses: Record<string, ActivityEvidenceResponse>;
  /** The Experiment Aspects the User actually worked through. */
  experimentActivities: ExperimentActivity[];
  /** Phase 3 reactions, keyed by experiment activity id. */
  activityReflections: Partial<Record<string, ActivityReaction>>;
};

export function computePreferenceFindings({
  normalizedActivities,
  evidenceResponses,
  experimentActivities,
  activityReflections,
}: PreferenceShiftInput): PreferenceFinding[] {
  const imaginedByCategory = new Map<ActivityCategory, ActivityPreference | undefined>();
  for (const [category, activities] of byCategory(normalizedActivities, (activity) => activity.category)) {
    const stated = activities
      .map((activity) => evidenceResponses[activity.id]?.preference)
      .filter((preference): preference is ActivityPreference => Boolean(preference));
    imaginedByCategory.set(category, agreedValue(stated));
  }

  const findings: PreferenceFinding[] = [];

  for (const [category, aspects] of byCategory(experimentActivities, (activity) => activity.category)) {
    const reactions = aspects
      .map((aspect) => activityReflections[aspect.id])
      .filter((reaction): reaction is ActivityReaction => Boolean(reaction));
    if (reactions.length === 0) continue;

    const aspectLabels = aspects.map((aspect) => aspect.label);
    const imagined = imaginedByCategory.get(category);

    // "not_sure" is a legitimate answer and never averaged away.
    if (reactions.every((reaction) => reaction === "not_sure")) {
      findings.push({ kind: "unresolved", category, aspectLabels, imagined });
      continue;
    }

    const decided = reactions.filter((reaction): reaction is ActivityPreference => reaction !== "not_sure");
    const informed = agreedValue(decided);
    if (!informed) {
      findings.push({ kind: "mixed", category, aspectLabels, imagined });
      continue;
    }

    if (!imagined) {
      findings.push({ kind: "first-evidence", category, aspectLabels, informed });
      continue;
    }

    const direction = directionOf(imagined, informed);
    findings.push({
      kind: "shift",
      category,
      aspectLabels,
      imagined,
      informed,
      direction,
      isContradiction: imagined === "more" && informed !== "more",
    });
  }

  return findings;
}

/**
 * The headline: a Contradiction first, then any other change of mind, then a
 * first-time reaction. A confirmed preference is real evidence but it is not
 * news, so it is never the headline while something changed.
 */
export function selectHeadlineFinding(findings: PreferenceFinding[]): PreferenceFinding | undefined {
  const rank = (finding: PreferenceFinding) => {
    if (finding.kind === "shift" && finding.isContradiction) return 0;
    if (finding.kind === "shift" && finding.direction !== "confirmed") return 1;
    if (finding.kind === "first-evidence") return 2;
    if (finding.kind === "shift") return 3;
    return 4;
  };
  return [...findings].sort((a, b) => rank(a) - rank(b))[0];
}
