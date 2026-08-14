import type { ActivityCategory } from "@/data/activityCatalog";
import type { CareerId, CareerImportance } from "@/data/careers";

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

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

export type ActivitySource = {
  experienceId: string;
  title: string;
  organisation?: string;
};

export type NormalizedActivity = {
  id: string;
  canonicalId: string;
  label: string;
  category: ActivityCategory;
  sources: ActivitySource[];
  recurrenceCount: number;
  userAdded?: boolean;
};

export type ActivityPreference = "more" | "same" | "less";
export type SkillConfidence = "low" | "medium" | "high";

export type ActivityEvidenceResponse = {
  preference?: ActivityPreference;
  confidence?: SkillConfidence;
};

export type CareerRelevance = {
  importance: CareerImportance;
  description: string;
};

export type CareerRelevanceByActivity = Record<
  string,
  Partial<Record<CareerId, CareerRelevance>>
>;

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
  priorityActivityIds: string[];
  minimizedActivityIds: string[];
  availableUncertaintyChoices: UncertaintyChoice[];
  selectedUncertaintyId?: string;
};
