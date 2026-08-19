import type { CareerId } from "@/data/careers";

export type ExperimentStage =
  | "question"
  | "guided"
  | "scenario-choice"
  | "scenario"
  | "role-primer"
  | "initial-attempt"
  | "evaluation"
  | "feedback"
  | "revision"
  | "revision-result"
  | "role-reaction"
  | "activity-reflection"
  | "comparison-reflection"
  | "summary";

export type ExperimentQuestionId = "career-a" | "career-b" | "direct-comparison" | "guided";
export type ExperimentMode = "careerA" | "careerB" | "comparison";
export type CareerTaskId = CareerId;
export type EvaluationStatus = "idle" | "evaluating" | "success" | "failed";
export type CriterionRating = "strong" | "developing" | "emerging" | "not_enough_evidence";
export type GapType = "knowledge" | "reasoning" | "communication" | "insufficient_evidence" | "none";
export type LearningChange = "clear_improvement" | "some_improvement" | "little_visible_change" | "not_enough_evidence";
export type ExperimentPreference = "more" | "same" | "less" | "need_more_experience";
export type ActivityReaction = "more" | "same" | "less" | "not_sure";

export type WorkReaction =
  | "enjoyed_problem_and_learning"
  | "enjoyed_more_after_learning"
  | "liked_parts_not_overall"
  | "capable_not_more"
  | "less_appealing_after_learning";

export type EvidenceSufficiency = "enough" | "need_more";

export type DirectComparisonChoice = CareerId | "either" | "neither" | "unclear";

export type ExperimentQuestion = {
  id: ExperimentQuestionId;
  mode?: ExperimentMode;
  careerId?: CareerId;
  title: string;
  helperText: string;
  evidenceQuestion: string;
  featured?: boolean;
};

export type ExperimentScenario = {
  id: string;
  name: string;
  industry: string;
  question: string;
  description: string;
  currentFeatures: string[];
  metrics: string[];
  userFeedback: string[];
  businessGoal: string;
  constraint: string;
};

export type ExperimentTaskOption = { id: string; label: string };
export type ExperimentTaskField = {
  id: string;
  label: string;
  prompt: string;
  kind: "choice" | "text";
  options?: ExperimentTaskOption[];
  placeholder?: string;
  required?: boolean;
};

export type PrimerConcept = { title: string; explanation: string };
export type PrimerStep = { label: string; explanation: string };
export type RubricCriterion = { id: string; label: string; question: string };

export type RoleTrialDefinition = {
  id: CareerTaskId;
  roleTitle: string;
  scenarioId: string;
  context: string;
  primer: {
    title: string;
    introduction: string;
    mentalModel: string[];
    steps: PrimerStep[];
    concepts?: PrimerConcept[];
    closingNote: string;
  };
  fields: ExperimentTaskField[];
  rubric: RubricCriterion[];
  activities: ExperimentActivity[];
  remainingUnknowns: string[];
};

export type ExperimentActivity = { id: string; label: string; role: CareerTaskId };
export type CriterionEvaluation = { criterion: string; rating: CriterionRating; gapType: GapType; evidence: string; feedback: string };
export type AttemptEvaluation = { criteria: CriterionEvaluation[]; strongestEvidence: string | null; revisionTarget: string; instruction: string | null; revisionPrompt: string };
export type LearningResponse = { category: LearningChange; explanation: string };
export type RevisionEvaluation = { criterion: CriterionEvaluation; learningResponse: LearningResponse };
export type PreferenceEvidence = { preference: ExperimentPreference };

export type RoleTrialState = {
  role: CareerTaskId;
  primerViewed: boolean;
  initialResponses: Record<string, string>;
  initialEvaluation?: AttemptEvaluation;
  initialEvaluationStatus: EvaluationStatus;
  initialEvaluationError?: string;
  revisionTarget?: string;
  revisionResponse: string;
  revisionEvaluation?: RevisionEvaluation;
  revisionEvaluationStatus: EvaluationStatus;
  revisionEvaluationError?: string;
  learningResponse?: LearningResponse;
  preferenceEvidence?: PreferenceEvidence;
  workReactions: WorkReaction[];
  evidenceSufficiency?: EvidenceSufficiency;
  completed: boolean;
};

export type EvaluationRequest = {
  role: CareerTaskId;
  attempt: "initial" | "revision";
  scenario: ExperimentScenario;
  taskQuestions: ExperimentTaskField[];
  answers: Record<string, string>;
  rubric: RubricCriterion[];
  revisionContext?: {
    revisionTarget: string;
    instruction: string | null;
    revisionPrompt: string;
    initialEvaluation: AttemptEvaluation;
    revisionResponse: string;
  };
};

export type CareerExperimentState = {
  stage: ExperimentStage;
  selectedCareers: CareerId[];
  selectedQuestionId?: ExperimentQuestionId;
  mode?: ExperimentMode;
  scenarioId?: string;
  activeRole?: CareerTaskId;
  completedCareerTasks: CareerTaskId[];
  roleTrials: Partial<Record<CareerTaskId, RoleTrialState>>;
  activityReflections: Partial<Record<string, ActivityReaction>>;
  directComparisonChoice?: DirectComparisonChoice;
  comparisonReflection: string;
  completedScenarioIds: string[];
  isDevelopmentPreview?: boolean;
};
