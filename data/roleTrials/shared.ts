import { getCareerModel, type CareerId } from "@/data/careers";
import type { ExperimentScenario, PrimerConcept, PrimerStep, RoleTrialDefinition } from "@/types/experiment";

export const learnLoopScenario: ExperimentScenario = {
  id: "learnloop",
  name: "LearnLoop",
  industry: "Education technology",
  question: "Why do students stop using a study plan, and what should LearnLoop try next?",
  description: "LearnLoop is a study-planning product for university students. It helps students turn course obligations into weekly plans and return to those plans when circumstances change.",
  currentFeatures: [
    "A weekly plan builder for subjects, tasks and target study times",
    "A calendar for scheduling and rescheduling study sessions",
    "Reminders before planned sessions",
    "Completed, missed and rescheduled session states",
    "A weekly progress view comparing planned and completed sessions",
    "Onboarding that asks about courses, deadlines and preferred study times",
  ],
  metrics: ["10,000 new users last month", "72% created a weekly plan", "34% completed at least 3 planned sessions in week 1", "17% returned to use their plan in week 2"],
  userFeedback: ["When I miss one session, the whole plan feels broken.", "When deadlines change I stop opening the app.", "I know what I should study. The problem is actually starting."],
  businessGoal: "Increase meaningful week-2 study-plan usage.",
  constraint: "The organisation can fund or ship only one focused next step during the next two weeks.",
};

export const freshRouteScenario: ExperimentScenario = {
  id: "freshroute",
  name: "FreshRoute",
  industry: "Online grocery",
  question: "Why are first-time customers not placing a second order, and what should FreshRoute try next?",
  description: "FreshRoute is an online grocery service for busy urban households. Customers build a basket, choose a delivery window and approve or reject suggested substitutions when an item is unavailable.",
  currentFeatures: [
    "Search and category browsing for groceries and household products",
    "Saved favourites and one-tap reordering from a previous basket",
    "Scheduled delivery windows with estimated arrival updates",
    "Substitution preferences for unavailable products",
    "Refund requests and customer support inside the app",
  ],
  metrics: [
    "18,000 new customers placed a first order last month",
    "64% completed checkout after adding an item to their basket",
    "27% placed a second order within 30 days",
    "22% of first orders contained at least one substitution",
    "Customers receiving an unwanted substitution were 14 percentage points less likely to reorder",
  ],
  userFeedback: [
    "The delivery was convenient, but half the dinner I planned changed because of substitutions.",
    "I spent time building my basket and then several things were unavailable.",
    "Reordering is useful, but I do not trust that I will receive what I chose.",
  ],
  businessGoal: "Increase second-order purchases within 30 days without increasing refund costs.",
  constraint: "The company can test only one focused product or service change during the next four weeks.",
};

export const cityMoveScenario: ExperimentScenario = {
  id: "citymove",
  name: "CityMove",
  industry: "Urban mobility",
  question: "Why do trial-pass riders fail to renew, and what should CityMove try next?",
  description: "CityMove is a public-transport app that combines trip planning, digital tickets and monthly travel passes for buses and trains in one city.",
  currentFeatures: [
    "Door-to-door route planning across buses and trains",
    "Digital single tickets and monthly passes",
    "Live arrival estimates and service-disruption alerts",
    "Saved home, work and favourite destinations",
    "Trip history and monthly travel-spend summaries",
  ],
  metrics: [
    "25,000 riders started a discounted monthly-pass trial last quarter",
    "61% used the pass for a first trip within three days",
    "38% completed at least four trips during their first week",
    "24% renewed for a second month",
    "Riders affected by a major disruption were 11 percentage points less likely to renew",
  ],
  userFeedback: [
    "The pass seemed good value until two disrupted journeys made me pay for alternatives.",
    "I am never sure whether the app's arrival time is reliable.",
    "I travel enough some weeks, but other weeks the monthly pass feels wasteful.",
  ],
  businessGoal: "Increase second-month pass renewal while maintaining rider trust.",
  constraint: "CityMove can pilot one focused change with one rider group during the next six weeks.",
};

export type RoleProfileInput = {
  careerId: CareerId;
  context: string;
  introduction: string;
  steps: Array<[string, string]>;
  concepts?: PrimerConcept[];
  tasks: Array<[string, string, string]>;
  rubric: Array<[string, string]>;
  activities: string[];
  unknowns: string[];
};

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function createRoleTrial(input: RoleProfileInput): RoleTrialDefinition {
  const career = getCareerModel(input.careerId);
  if (!career) throw new Error(`Missing career profile: ${input.careerId}`);
  const steps: PrimerStep[] = input.steps.map(([label, explanation]) => ({ label, explanation }));
  return {
    id: input.careerId,
    roleTitle: career.title,
    scenarioId: learnLoopScenario.id,
    context: input.context,
    primer: {
      title: `How a ${career.title} approaches this problem`,
      introduction: input.introduction,
      mentalModel: steps.map(({ label }) => label),
      steps,
      concepts: input.concepts,
      closingNote: "This is a supported work sample, not a framework-memory test. Use the structure to experience the reasoning and notice how the work feels.",
    },
    fields: input.tasks.map(([label, prompt, placeholder], index) => ({ id: `task-${index + 1}`, label, prompt, kind: "text", required: true, placeholder })),
    rubric: input.rubric.map(([label, question]) => ({ id: slug(label), label, question })),
    activities: input.activities.map((label, index) => ({ id: `${input.careerId}-activity-${index + 1}`, label, role: input.careerId })),
    remainingUnknowns: input.unknowns,
  };
}
