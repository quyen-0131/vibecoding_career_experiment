import type { ActivityCategory } from "@/data/activityCatalog";
import type { CareerId, CareerImportance } from "@/data/careers";
import type { ResumeEvidence, SkillInference, SkillRoleRelevance } from "@/types/skillEvidence";

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ExperienceType = "work" | "internship" | "project" | "volunteer";

export type DetectedActivity = {
  id: string;
  canonicalId: string;
  label: string;
  category: ActivityCategory;
  supportingText: string;
};

export type Experience = {
  id: string;
  title: string;
  organisation?: string;
  type: ExperienceType;
  description?: string;
  activities: DetectedActivity[];
};

export type DetectedExperience = Experience;
export type ActivitySource = { experienceId: string; title: string; organisation?: string };
export type ActivityOriginalEvidence = ActivitySource & { label: string };

export type NormalizedActivity = {
  id: string;
  canonicalId: string;
  /** The user's/CV's wording is evidence and is never silently discarded. */
  originalLabel: string;
  originalLabels: string[];
  originalEvidence: ActivityOriginalEvidence[];
  label: string;
  category: ActivityCategory;
  sources: ActivitySource[];
  recurrenceCount: number;
  components: SemanticActivityComponent[];
  careerTransfers: Partial<Record<CareerId, CareerTransfer>>;
  mappingStatus: "mapped" | "partial" | "unknown" | "mapping" | "failed";
  mappingError?: string;
  userAdded?: boolean;
  /** Structured source evidence, kept separate from inferred canonical skills. */
  resumeEvidence?: ResumeEvidence[];
  /** Explainable canonical skill inferences supported by this evidence. */
  skillInferences?: SkillInference[];
  /** Role relevance is an inference backed by local career data and O*NET signals. */
  skillRoleRelevance?: SkillRoleRelevance[];
};

export type SemanticEvidenceType = "explicit" | "inferred";
export type SemanticConfidence = "high" | "medium" | "low";
export type SemanticActivityComponent = {
  canonicalActivityId: string;
  label: string;
  evidenceType: SemanticEvidenceType;
  confidence: SemanticConfidence;
  rationale: string;
  confirmedByUser?: boolean;
};

export type CareerTransferRelationship = "direct" | "transferable" | "adjacent" | "unknown";
export type CareerTransfer = {
  careerId: CareerId;
  careerActivityId: string;
  relationship: CareerTransferRelationship;
  importance: CareerImportance;
  confidence: SemanticConfidence;
  rationale: string;
};

export type ActivityPreference = "more" | "same" | "less";
export type ActivityEvidenceResponse = {
  preference?: ActivityPreference;
  preferenceSource?: "activity" | "group";
  groupId?: string;
};
export type CareerRelevance = { importance: CareerImportance; description: string };
export type CareerRelevanceByActivity = Record<string, Partial<Record<CareerId, CareerRelevance>>>;

export type UncertaintyType = "careerA" | "careerB" | "comparison" | "guided";
export type UncertaintyChoice = {
  id: string;
  type: UncertaintyType;
  careerId?: CareerId;
  label: string;
  title: string;
  question: string;
  supportingText: string;
  explores: string[];
  whyInformative: string;
};

export type PrototypeState = {
  selectedCareers: CareerId[];
  uploadedCvFilename: string;
  extractedCvText: string;
  detectedExperiences: DetectedExperience[];
  selectedExperienceIds: string[];
  normalizedActivities: NormalizedActivity[];
  topEvidenceActivities: NormalizedActivity[];
  evidenceResponses: Record<string, ActivityEvidenceResponse>;
  availableUncertaintyChoices: UncertaintyChoice[];
  selectedUncertaintyId?: string;
};
