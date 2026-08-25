import type { ActivityCategory } from "@/data/activityCatalog";
import type { CareerImportance } from "@/data/careers";

export type EvidenceStrength = "strong" | "moderate" | "limited";
export type InferenceConfidence = "high" | "medium" | "low";
export type InferenceBasis = "explicit" | "inferred";

export type ResumeEvidence = {
  id: string;
  rawText: string;
  action?: string;
  object?: string;
  methods: string[];
  stakeholders: string[];
  outcome?: string;
  metrics: string[];
  sourceExperienceId?: string;
  sourceExperienceTitle?: string;
  sourceOrganisation?: string;
  strength: EvidenceStrength;
};

export type SkillSignals = {
  actions: string[];
  objects: string[];
  outcomes: string[];
  contexts?: string[];
};

export type CanonicalSkill = {
  id: string;
  label: string;
  category: ActivityCategory;
  description: string;
  aliases: string[];
  signals: SkillSignals;
  onetTerms: string[];
};

export type SkillInference = {
  skillId: string;
  label: string;
  category: ActivityCategory;
  confidence: InferenceConfidence;
  basis: InferenceBasis;
  reason: string;
  matchedSignals: string[];
  sourceEvidenceIds: string[];
};

export type OnetSignal = {
  id: string;
  label: string;
  importance?: number;
  type?: string;
};

export type OnetOccupation = {
  id: string;
  title: string;
  description: string;
  tasks: OnetSignal[];
  workActivities: OnetSignal[];
  essentialSkills: OnetSignal[];
  transferableSkills: OnetSignal[];
};

export type RoleResolution = {
  requestedId?: string;
  requestedTitle: string;
  status: "curated" | "exact" | "related" | "provisional";
  confidence: InferenceConfidence;
  occupations: OnetOccupation[];
  reason: string;
};

export type SkillRoleRelevance = {
  skillId: string;
  roleTitle: string;
  importance: CareerImportance | "Unknown";
  confidence: InferenceConfidence;
  relationship: "direct" | "transferable" | "unknown";
  explanation: string;
  sources: {
    localCareerActivity?: string;
    onetOccupationIds: string[];
    onetTasks: string[];
    onetWorkActivities: string[];
    onetSkills: string[];
  };
};

export type ResumeEvidenceAnalysis = {
  evidence: ResumeEvidence;
  skills: SkillInference[];
  roleRelevance: SkillRoleRelevance[];
};
