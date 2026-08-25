import { extractResumeEvidence } from "@/lib/evidence/extractResumeEvidence";
import { inferSkills } from "@/lib/skills/inferSkills";
import { assessSkillRoleRelevance } from "@/lib/roles/assessSkillRoleRelevance";
import { resolveRole } from "@/lib/roles/resolveRole";
import type { ResumeEvidenceAnalysis } from "@/types/skillEvidence";

export function analyzeResumeEvidence(input: {
  text: string;
  source?: {
    experienceId?: string;
    title?: string;
    organisation?: string;
  };
  roles?: { id?: string; title: string }[];
}): ResumeEvidenceAnalysis {
  const evidence = extractResumeEvidence(input.text, input.source);
  const skills = inferSkills(evidence);
  const resolvedRoles = (input.roles ?? []).map(resolveRole);
  return {
    evidence,
    skills,
    roleRelevance: skills.flatMap((skill) =>
      resolvedRoles.map((role) => assessSkillRoleRelevance(skill, role)),
    ),
  };
}
