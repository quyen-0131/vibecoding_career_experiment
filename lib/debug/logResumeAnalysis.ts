import type { ResumeEvidenceAnalysis } from "@/types/skillEvidence";

export function logResumeAnalysis(analysis: ResumeEvidenceAnalysis) {
  if (process.env.NODE_ENV !== "development") return;
  console.groupCollapsed("[Career Experiment] Resume evidence analysis");
  console.table({
    evidence: analysis.evidence.rawText,
    action: analysis.evidence.action,
    object: analysis.evidence.object,
    outcome: analysis.evidence.outcome,
    strength: analysis.evidence.strength,
  });
  console.table(
    analysis.skills.map((skill) => ({
      skill: skill.label,
      confidence: skill.confidence,
      basis: skill.basis,
      reason: skill.reason,
    })),
  );
  console.table(
    analysis.roleRelevance.map((item) => ({
      skill: item.skillId,
      role: item.roleTitle,
      importance: item.importance,
      relationship: item.relationship,
      explanation: item.explanation,
    })),
  );
  console.groupEnd();
}
