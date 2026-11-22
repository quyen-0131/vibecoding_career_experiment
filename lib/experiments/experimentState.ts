import { createExperimentQuestions, getExperimentScenario, learnLoopScenario, roleTrials } from "@/data/experiments";
import type { CareerId } from "@/data/careers";
import type { CareerExperimentState, CareerTaskId, ExperimentMode, RoleTrialState } from "@/types/experiment";

export const minimumMeaningfulResponseLength = 8;

export function createRoleTrialState(role: CareerTaskId): RoleTrialState {
  return { role, primerViewed: false, initialResponses: {}, initialEvaluationStatus: "idle", revisionResponse: "", revisionEvaluationStatus: "idle", workReactions: [], completed: false };
}

export function createInitialExperimentState(careers: CareerId[]): CareerExperimentState {
  return {
    stage: "question",
    selectedCareers: careers,
    completedCareerTasks: [],
    roleTrials: Object.fromEntries(careers.map((career) => [career, createRoleTrialState(career)])),
    activityReflections: {},
    contradictionCauses: {},
    comparisonReflection: "",
    completedScenarioIds: [],
  };
}

export function createPostEvaluationPreviewState(careers: CareerId[], scenarioId = learnLoopScenario.id): CareerExperimentState {
  const state = createInitialExperimentState(careers);
  const scenario = getExperimentScenario(scenarioId) ?? learnLoopScenario;
  const roleTrialStates = Object.fromEntries(careers.map((role, index) => {
    const definition = roleTrials[role];
    const focus = definition.rubric[0];
    const initialEvaluation = {
      criteria: definition.rubric.map((criterion, index) => ({
        criterion: criterion.label,
        rating: index === 0 ? "developing" as const : "strong" as const,
        gapType: index === 0 ? "reasoning" as const : "none" as const,
        evidence: index === 0 ? "The sample first attempt identified a direction but did not fully connect it to the scenario evidence." : "The sample response made a clear choice and explained the reasoning behind it.",
        feedback: index === 0 ? "Connect the decision more explicitly to one scenario fact." : "This part of the reasoning is clear enough to evaluate.",
      })),
      strongestEvidence: "The sample response made a clear " + definition.roleTitle + " decision.",
      revisionTarget: focus.label,
      instruction: "Tie the revised answer to a specific piece of scenario evidence.",
      revisionPrompt: "Revise the " + focus.label.toLowerCase() + " response using one concrete fact from " + scenario.name + ".",
    };
    const learningResponse = { category: "clear_improvement" as const, explanation: "The sample revision used the feedback and connected the decision to a specific scenario fact." };
    return [role, {
      ...createRoleTrialState(role),
      primerViewed: true,
      initialResponses: Object.fromEntries(definition.fields.map((field) => [field.id, "Sample response for " + field.label.toLowerCase() + " using the " + scenario.name + " evidence."])),
      initialEvaluation,
      initialEvaluationStatus: "success" as const,
      revisionTarget: focus.label,
      revisionResponse: "Sample revised response for " + focus.label.toLowerCase() + ", now connected to " + scenario.name + " scenario evidence.",
      revisionEvaluation: {
        criterion: { criterion: focus.label, rating: "strong" as const, gapType: "none" as const, evidence: "The sample revision connected its reasoning to a specific scenario fact.", feedback: "The relationship between evidence and decision is now clear." },
        learningResponse,
      },
      revisionEvaluationStatus: "success" as const,
      learningResponse,
      // Sample reaction + sufficiency so the summary renders fully from one click.
      preferenceEvidence: { preference: index === 0 ? ("more" as const) : ("same" as const) },
      workReactions: [index === 0 ? ("enjoyed_problem_and_learning" as const) : ("liked_parts_not_overall" as const)],
      evidenceSufficiency: index === 0 ? ("enough" as const) : ("need_more" as const),
      completed: true,
    }];
  }));
  // Sample activity reactions for every activity across both roles.
  const activityReflections = Object.fromEntries(
    careers.flatMap((role, index) =>
      roleTrials[role].activities.map((activity) => [activity.id, index === 0 ? ("more" as const) : ("same" as const)]),
    ),
  );
  return {
    ...state,
    stage: "summary",
    selectedQuestionId: "direct-comparison",
    mode: "comparison",
    scenarioId: scenario.id,
    activeRole: undefined,
    completedCareerTasks: [...careers],
    roleTrials: roleTrialStates,
    activityReflections,
    directComparisonChoice: careers[0],
    comparisonReflection: "Sample reflection: the framework felt unfamiliar at first, but the decision-making became clearer after the primer.",
    isDevelopmentPreview: true,
  };
}
export function createNextScenarioState(
  current: CareerExperimentState,
): CareerExperimentState {
  const next = createInitialExperimentState(current.selectedCareers);
  return {
    ...next,
    stage: "scenario-choice",
    selectedQuestionId: current.selectedQuestionId,
    mode: current.mode,
    completedScenarioIds: [
      ...new Set([
        ...current.completedScenarioIds,
        ...(current.scenarioId ? [current.scenarioId] : []),
      ]),
    ],
  };
}
export function isSupportedExperimentPair(careers: CareerId[]) {
  return careers.length === 2 && careers[0] !== careers[1] && careers.every((career) => Boolean(roleTrials[career]));
}

export function getTaskSequence(mode: ExperimentMode | undefined, careers: CareerId[]): CareerTaskId[] {
  if (mode === "careerA") return careers[0] ? [careers[0]] : [];
  if (mode === "careerB") return careers[1] ? [careers[1]] : [];
  if (mode === "comparison") return careers.filter((career) => Boolean(roleTrials[career]));
  return [];
}

export function getNextRole(mode: ExperimentMode | undefined, careers: CareerId[], completed: CareerTaskId[]) {
  return getTaskSequence(mode, careers).find((role) => !completed.includes(role));
}

export function isInitialAttemptReady(role: CareerTaskId, responses: Record<string, string>) {
  return roleTrials[role].fields.filter((field) => field.required).every((field) => (responses[field.id] ?? "").trim().length >= minimumMeaningfulResponseLength);
}

export function getExperimentQuestionText(state: CareerExperimentState) {
  const questions = createExperimentQuestions(state.selectedCareers);
  if (state.selectedQuestionId === "guided" && state.mode === "comparison") return questions.find((question) => question.id === "direct-comparison")?.evidenceQuestion ?? "How the two work trials feel on the same problem.";
  return questions.find((question) => question.id === state.selectedQuestionId)?.evidenceQuestion ?? "A decision-relevant career uncertainty.";
}

export function usesSharedScenario(state: CareerExperimentState) {
  return Boolean(getExperimentScenario(state.scenarioId)) && getTaskSequence(state.mode, state.selectedCareers).every((role) => Boolean(roleTrials[role]));
}

export function hasCompletedRoleTrial(trial: RoleTrialState) {
  return Boolean(trial.primerViewed && trial.initialEvaluation && trial.revisionEvaluation && trial.preferenceEvidence && trial.workReactions.length && trial.evidenceSufficiency && trial.completed);
}
