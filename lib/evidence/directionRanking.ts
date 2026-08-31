import { getActivityDefinition, type ActivityCategory } from "@/data/activityCatalog";
import { getCareerActivity, getCareerModel, type CareerId, type CareerImportance } from "@/data/careers";
import type { ContradictionCause } from "@/types/experiment";
import type { PreferenceFinding } from "@/lib/evidence/preferenceShift";

/**
 * The Direction: the single most useful thing to explore next.
 *
 * Ranked by how much exploring an Unknown would distinguish the two Career
 * Options, per docs/adr/0003-rank-by-what-separates-the-options.md. An Unknown
 * both careers treat the same way teaches the User nothing about the choice in
 * front of them, however curious they are about it.
 *
 * Nothing here reads experiment performance (ADR 0002).
 */

const importanceRank: Record<CareerImportance, number> = { Core: 3, Important: 2, Supporting: 1, Limited: 0 };

export type RankedUnknown = {
  activityId: string;
  label: string;
  category?: ActivityCategory;
  /** 0-3. How differently the two Career Options treat this work. */
  separation: number;
  importanceByCareer: Partial<Record<CareerId, CareerImportance>>;
  /** The Career Option that rates it higher. Absent when they agree. */
  leansToward?: CareerId;
};

export type RankUnknownsInput = {
  careers: CareerId[];
  /** Canonical ids of activities the User has Confirmed Evidence for. */
  confirmedActivityIds: string[];
};

export function rankUnknownsBySeparation({ careers, confirmedActivityIds }: RankUnknownsInput): RankedUnknown[] {
  const [careerA, careerB] = careers;
  if (!careerA || !careerB) return [];

  const confirmed = new Set(confirmedActivityIds);
  const candidateIds = new Set(
    [careerA, careerB]
      .flatMap((careerId) => getCareerModel(careerId)?.activities ?? [])
      .filter((activity) => activity.importance === "Core" || activity.importance === "Important")
      .map((activity) => activity.id)
      .filter((activityId) => !confirmed.has(activityId)),
  );

  const ranked = [...candidateIds].map((activityId) => {
    const inA = getCareerActivity(careerA, activityId).importance;
    const inB = getCareerActivity(careerB, activityId).importance;
    const separation = Math.abs(importanceRank[inA] - importanceRank[inB]);
    const definition = getActivityDefinition(activityId);
    return {
      activityId,
      label: definition?.label ?? getCareerActivity(careerA, activityId).label,
      category: definition?.category,
      separation,
      importanceByCareer: { [careerA]: inA, [careerB]: inB } as Partial<Record<CareerId, CareerImportance>>,
      leansToward: separation === 0 ? undefined : importanceRank[inA] > importanceRank[inB] ? careerA : careerB,
    };
  });

  // Separation first. Then how much is at stake for the career that cares more
  // about it. Then label, so the order is stable rather than incidental.
  //
  // ADR 0003 breaks ties by what a User can realistically arrange next term.
  // The career models carry no accessibility data yet, so that tie-break is
  // not applied; add a field per activity to enable it.
  return ranked.sort((a, b) => {
    if (b.separation !== a.separation) return b.separation - a.separation;
    const stake = (unknown: RankedUnknown) => Math.max(...Object.values(unknown.importanceByCareer).map((importance) => importanceRank[importance!]));
    if (stake(b) !== stake(a)) return stake(b) - stake(a);
    return a.label.localeCompare(b.label);
  });
}

export type Direction =
  /** A Contradiction the User attributed to the task, not the work. Unresolved. */
  | { kind: "retest"; category: string; reason: string }
  | { kind: "explore"; unknown: RankedUnknown }
  | { kind: "nothing-left"; reason: string };

/**
 * A Contradiction blamed on the particular task left the question open, so
 * retesting it beats exploring something new. A Contradiction blamed on the
 * work itself is settled and needs no retest.
 * See docs/adr/0005-contradictions-are-questioned-not-resolved.md.
 */
export function buildDirection({
  rankedUnknowns,
  findings,
  contradictionCauses,
}: {
  rankedUnknowns: RankedUnknown[];
  findings: PreferenceFinding[];
  contradictionCauses: Partial<Record<string, ContradictionCause>>;
}): Direction {
  const unresolvedContradiction = findings.find(
    (finding) => finding.kind === "shift" && finding.isContradiction && contradictionCauses[finding.category] === "this-task",
  );
  if (unresolvedContradiction) {
    return {
      kind: "retest",
      category: unresolvedContradiction.category,
      reason: "You put this down to the particular task rather than the work itself, so the question is still open.",
    };
  }

  const [top] = rankedUnknowns;
  if (!top) return { kind: "nothing-left", reason: "Your evidence already covers the important work in both careers." };
  return { kind: "explore", unknown: top };
}
