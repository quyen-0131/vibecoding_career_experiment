import { canonicalSkills } from "@/data/skillTaxonomy";
import type { CanonicalSkill, ResumeEvidence, SkillInference } from "@/types/skillEvidence";

const normalise = (value: string) =>
  value
    .toLowerCase()
    .replace(/behaviour/g, "behavior")
    .replace(/optimisation/g, "optimization")
    .replace(/analyse/g, "analyze")
    .replace(/synthesise/g, "synthesize")
    .replace(/[^a-z0-9%+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const containsSignal = (text: string, signal: string) => {
  const target = normalise(signal);
  if (!target) return false;
  if (text.includes(target)) return true;
  const root = target.replace(/(?:ing|ed|es|s)$/i, "");
  return root.length >= 5 && text.split(" ").some((word) => word.startsWith(root));
};

function scoreSkill(evidence: ResumeEvidence, skill: CanonicalSkill) {
  const text = normalise(evidence.rawText);
  const matched: string[] = [];
  let score = 0;

  if ([skill.label, ...skill.aliases].some((alias) => containsSignal(text, alias))) {
    const alias = [skill.label, ...skill.aliases].find((item) => containsSignal(text, item))!;
    matched.push(`named work: ${alias}`);
    score += 6;
  }

  const groups = [
    { values: skill.signals.actions, weight: 1.5, name: "action" },
    { values: skill.signals.objects, weight: 2, name: "object" },
    { values: skill.signals.outcomes, weight: 1, name: "outcome" },
    { values: skill.signals.contexts ?? [], weight: 0.75, name: "context" },
  ];

  groups.forEach(({ values, weight, name }) => {
    const match = values.find((signal) => containsSignal(text, signal));
    if (match) {
      matched.push(`${name}: ${match}`);
      score += weight;
    }
  });

  if (evidence.metrics.length && skill.signals.outcomes.some((item) =>
    ["efficiency", "performance", "impact", "improvement", "time saved"].includes(item)
  )) {
    score += 0.75;
    matched.push("measurable outcome");
  }

  return { score, matched };
}

export function inferSkills(evidence: ResumeEvidence, limit = 4): SkillInference[] {
  return canonicalSkills
    .map((skill) => ({ skill, ...scoreSkill(evidence, skill) }))
    .filter(({ score, matched }) => score >= 3.25 && matched.length >= 2)
    .sort((a, b) => b.score - a.score || a.skill.label.localeCompare(b.skill.label))
    .slice(0, limit)
    .map(({ skill, score, matched }) => {
      const explicit = matched.some((item) => item.startsWith("named work:")) ||
        (matched.some((item) => item.startsWith("action:")) && matched.some((item) => item.startsWith("object:")));
      const confidence = score >= 7 ? "high" : score >= 4.5 ? "medium" : "low";
      return {
        skillId: skill.id,
        label: skill.label,
        category: skill.category,
        confidence,
        basis: explicit ? "explicit" : "inferred",
        reason: `Matched ${matched.join(", ")}. This is an explainable prototype inference, not proof of ability.`,
        matchedSignals: matched,
        sourceEvidenceIds: [evidence.id],
      };
    });
}
