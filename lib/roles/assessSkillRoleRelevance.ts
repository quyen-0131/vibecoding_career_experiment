import { getCanonicalSkill } from "@/data/skillTaxonomy";
import { getCareerModel, type CareerId, type CareerImportance } from "@/data/careers";
import type { RoleResolution, SkillInference, SkillRoleRelevance } from "@/types/skillEvidence";

const normalise = (value: string) =>
  value.toLowerCase().replace(/behaviour/g, "behavior").replace(/[^a-z0-9]+/g, " ").trim();

const includesTerm = (text: string, term: string) => {
  const haystack = normalise(text);
  const needle = normalise(term);
  if (needle.length < 4) return false;
  if (haystack.includes(needle)) return true;
  const words = needle.split(" ").filter((word) => word.length > 4);
  return words.length > 1 && words.every((word) => haystack.includes(word));
};

const importanceRank: Record<CareerImportance, number> = {
  Core: 4,
  Important: 3,
  Supporting: 2,
  Limited: 1,
};

const shortExample = (value: string) => {
  const clean = value.replace(/\s+/g, " ").trim().replace(/[.]+$/, "");
  const firstClause = clean.split(/[;,]/)[0];
  return (firstClause.length > 110 ? `${firstClause.slice(0, 107).trimEnd()}...` : firstClause).toLowerCase();
};

function roleSignals(skill: SkillInference, role: RoleResolution) {
  const definition = getCanonicalSkill(skill.skillId);
  const terms = definition
    ? [definition.label, ...definition.aliases, ...definition.onetTerms]
    : [skill.label];

  const tasks = role.occupations.flatMap((occupation) =>
    occupation.tasks.filter((item) => terms.some((term) => includesTerm(item.label, term))),
  );
  const activities = role.occupations.flatMap((occupation) =>
    occupation.workActivities.filter((item) => terms.some((term) => includesTerm(item.label, term))),
  );
  const skills = role.occupations.flatMap((occupation) =>
    [...occupation.essentialSkills, ...occupation.transferableSkills]
      .filter((item) => terms.some((term) => includesTerm(item.label, term))),
  );

  return {
    tasks: [...new Set(tasks.map((item) => item.label))].slice(0, 3),
    activities: [...new Set(activities.map((item) => item.label))].slice(0, 3),
    skills: [...new Set(skills.map((item) => item.label))].slice(0, 3),
    importance: Math.max(
      0,
      ...activities.map((item) => item.importance ?? 0),
      ...skills.map((item) => item.importance ?? 0),
    ),
  };
}

export function assessSkillRoleRelevance(
  skill: SkillInference,
  role: RoleResolution,
): SkillRoleRelevance {
  const localCareer = role.requestedId
    ? getCareerModel(role.requestedId as CareerId)
    : undefined;
  const localActivity = localCareer?.activities.find((activity) => activity.id === skill.skillId);
  const signals = roleSignals(skill, role);

  if (localActivity) {
    return {
      skillId: skill.skillId,
      roleTitle: role.requestedTitle,
      importance: localActivity.importance,
      confidence: skill.confidence === "low" ? "medium" : "high",
      relationship: "direct",
      explanation: localActivity.description,
      sources: {
        localCareerActivity: localActivity.id,
        onetOccupationIds: role.occupations.map((occupation) => occupation.id),
        onetTasks: signals.tasks,
        onetWorkActivities: signals.activities,
        onetSkills: signals.skills,
      },
    };
  }

  const signalCount = signals.tasks.length + signals.activities.length + signals.skills.length;
  if (!signalCount) {
    return {
      skillId: skill.skillId,
      roleTitle: role.requestedTitle,
      importance: "Unknown",
      confidence: "low",
      relationship: "unknown",
      explanation: `The current local model does not contain enough occupation evidence to map ${skill.label.toLowerCase()} to ${role.requestedTitle} responsibly.`,
      sources: {
        onetOccupationIds: role.occupations.map((occupation) => occupation.id),
        onetTasks: [],
        onetWorkActivities: [],
        onetSkills: [],
      },
    };
  }

  const importance: CareerImportance =
    signals.importance >= 4 ? "Important" : signals.importance >= 3 ? "Supporting" : "Limited";
  const example = signals.tasks[0] ?? signals.activities[0] ?? signals.skills[0];
  return {
    skillId: skill.skillId,
    roleTitle: role.requestedTitle,
    importance,
    confidence: signalCount >= 3 ? "medium" : "low",
    relationship: "transferable",
    explanation: `This can support ${role.requestedTitle} work involving ${shortExample(example)}.`,
    sources: {
      onetOccupationIds: role.occupations.map((occupation) => occupation.id),
      onetTasks: signals.tasks,
      onetWorkActivities: signals.activities,
      onetSkills: signals.skills,
    },
  };
}

export function compareRoleRelevance(a: SkillRoleRelevance, b: SkillRoleRelevance) {
  const rank = { Core: 4, Important: 3, Supporting: 2, Limited: 1, Unknown: 0 };
  return rank[b.importance] - rank[a.importance];
}

export function localImportanceValue(value: CareerImportance) {
  return importanceRank[value];
}
