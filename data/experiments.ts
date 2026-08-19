import { getCareerModel, type CareerId } from "@/data/careers";
import { advisoryTrials } from "@/data/roleTrials/advisory";
import { productDataTrials } from "@/data/roleTrials/productData";
import { researchTrials } from "@/data/roleTrials/research";
import { cityMoveScenario, freshRouteScenario, learnLoopScenario } from "@/data/roleTrials/shared";
import type { DirectComparisonChoice, ExperimentQuestion, RoleTrialDefinition, WorkReaction } from "@/types/experiment";

export { cityMoveScenario, freshRouteScenario, learnLoopScenario };

export const experimentScenarios = [learnLoopScenario, freshRouteScenario, cityMoveScenario];
export function getExperimentScenario(id?: string) {
  return experimentScenarios.find((scenario) => scenario.id === id);
}

const allTrials = [...productDataTrials, ...researchTrials, ...advisoryTrials];
export const roleTrials = Object.fromEntries(allTrials.map((trial) => [trial.id, trial])) as Record<CareerId, RoleTrialDefinition>;
export const productManagementTrial = roleTrials["product-manager"];
export const behaviouralScienceTrial = roleTrials["behavioural-science-consultant"];
export const experimentTasks = roleTrials;
export const experimentActivities = allTrials.flatMap((trial) => trial.activities);

export function createExperimentQuestions(careers: CareerId[]): ExperimentQuestion[] {
  const [careerA, careerB] = careers;
  const profileA = careerA ? getCareerModel(careerA) : undefined;
  const profileB = careerB ? getCareerModel(careerB) : undefined;
  const helper = (careerId?: CareerId) => {
    const profile = careerId ? getCareerModel(careerId) : undefined;
    return profile ? `Explore ${profile.uncertainty.explores.map((item) => item.replace(/-/g, " ")).join(", ")}.` : "Explore one role-specific uncertainty.";
  };
  return [
    { id: "career-a", mode: "careerA", careerId: careerA, title: profileA?.uncertainty.title ?? "Test the first role", helperText: helper(careerA), evidenceQuestion: profileA?.uncertainty.question ?? "A role-specific uncertainty." },
    { id: "career-b", mode: "careerB", careerId: careerB, title: profileB?.uncertainty.title ?? "Test the second role", helperText: helper(careerB), evidenceQuestion: profileB?.uncertainty.question ?? "A role-specific uncertainty." },
    { id: "direct-comparison", mode: "comparison", title: "I want to experience both types of work on the same problem", helperText: `Compare ${profileA?.title ?? "Role A"} and ${profileB?.title ?? "Role B"} while keeping the scenario constant.`, evidenceQuestion: `How ${profileA?.title ?? "Role A"} and ${profileB?.title ?? "Role B"} work feel when applied to the same underlying problem.`, featured: true },
    { id: "guided", title: "I'm not sure what would be useful to test", helperText: "Let the prototype suggest a direct comparison, then decide whether to use it.", evidenceQuestion: "How the two role trials feel on the same underlying problem." },
  ];
}

export const preferenceLabels = { more: "More", same: "About the same", less: "Less", need_more_experience: "I still need more experience to tell" } as const;
export const activityReactionLabels = { more: "More", same: "About the same", less: "Less", not_sure: "Not sure yet" } as const;
export const ratingLabels = { strong: "Strong", developing: "Developing", emerging: "Emerging", not_enough_evidence: "Not enough evidence" } as const;
export const learningLabels = { clear_improvement: "Clear improvement", some_improvement: "Some improvement", little_visible_change: "Little visible change", not_enough_evidence: "Not enough evidence" } as const;

export const workReactionOptions: Array<{ id: WorkReaction; label: string }> = [
  { id: "enjoyed_problem_and_learning", label: "I enjoyed both solving the problem and learning how to approach it." },
  { id: "enjoyed_more_after_learning", label: "I enjoyed it more once I understood how to approach it." },
  { id: "liked_parts_not_overall", label: "I liked parts of the reasoning, but not the overall task." },
  { id: "capable_not_more", label: "I could do the work, but I would not want much more of it." },
  { id: "less_appealing_after_learning", label: "Understanding the work better made it less appealing." },

];

export function getDirectComparisonChoices(careers: CareerId[]): Array<{ id: DirectComparisonChoice; label: string }> {
  return [
    ...careers.map((careerId) => ({ id: careerId, label: `The ${getCareerModel(careerId)?.title ?? careerId} work trial` })),
    { id: "either", label: "I would happily repeat either" },
    { id: "neither", label: "I would rather repeat neither" },
    { id: "unclear", label: "I still don't have a clear preference" },
  ];
}
