import type { CareerId, CareerImportance } from "@/data/careers";

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type DetectedActivity = {
  id: string;
  activityId: string;
  label: string;
  confirmed: boolean;
};

export type DetectedExperience = {
  id: string;
  organisation: string;
  title: string;
  activities: DetectedActivity[];
};

export type ActivityPreference = "more" | "same" | "less";

export type CareerRelevance = {
  importance: CareerImportance;
  description: string;
};

export type CareerRelevanceByActivity = Record<
  string,
  Partial<Record<CareerId, CareerRelevance>>
>;

export type PrototypeState = {
  careers: CareerId[];
  uploadedCvFilename: string;
  extractedCvText: string;
  experiences: DetectedExperience[];
  preferences: Record<string, ActivityPreference>;
  careerRelevance: CareerRelevanceByActivity;
};
