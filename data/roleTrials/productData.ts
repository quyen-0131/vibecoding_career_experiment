import { createRoleTrial, type RoleProfileInput } from "@/data/roleTrials/shared";

const profiles: RoleProfileInput[] = [
  {
    careerId: "product-manager",
    context: "You are the Product Manager deciding what LearnLoop should do next to improve meaningful week-2 usage.",
    introduction: "Product management is decision work under uncertainty: frame the problem, use imperfect evidence, choose a direction, make trade-offs and define success.",
    steps: [["Problem", "Name the user problem before proposing a feature."], ["Evidence", "Connect it to observed behaviour and feedback."], ["Decision", "Choose one response under the constraint."], ["Trade-off", "State what you are not solving yet."], ["Measurement", "Choose an outcome close to the target behaviour."]],
    tasks: [["Problem framing", "What problem would you prioritise first, and what evidence supports it?", "Connect one problem to specific scenario evidence..."], ["Product decision", "What single change would you make first, and why?", "Describe one focused intervention..."], ["Trade-off", "Which other reasonable option would you leave for later, and why?", "Explain why you are not choosing that option now..."], ["Metric and unintended effects", "What metric would tell you whether your decision worked? What possible unintended effect would you also watch for?", "Name one primary metric and one possible unintended effect..."]],
    rubric: [["Problem framing", "Does the response separate the problem from a symptom or solution?"], ["Evidence use", "Does the decision use supplied evidence?"], ["Prioritisation and trade-offs", "Does it make a meaningful constrained choice?"], ["Measurement reasoning", "Do the measures correspond to the problem and intervention?"]],
    activities: [["Framing product problems", "Product & Strategy"], ["Prioritising competing options", "Product & Strategy"], ["Making explicit trade-offs", "Product & Strategy"], ["Defining success measures", "Analysis"]],
    unknowns: ["Working closely with engineers", "Handling stakeholder disagreement", "Sustained product ownership", "Shipping and iterating in a live product"],
  },
  {
    careerId: "data-scientist",
    context: "You are the Data Scientist investigating LearnLoop's retention problem and proposing an analytical next step.",
    introduction: "Data science turns a decision question into measurable variables, a suitable analytical design and a result that can be checked rather than merely asserted.",
    steps: [["Decision question", "Clarify the decision the analysis must inform."], ["Data", "Identify needed observations and variables."], ["Method", "Choose analysis proportionate to the question."], ["Validation", "Check alternative explanations and failure modes."], ["Communication", "Translate results into a bounded implication."]],
    tasks: [["Analytical question", "What precise question would you investigate first?", "Frame a decision-relevant question..."], ["Data plan", "What data and variables would you need, and how would you define them?", "Name observations, outcomes and useful segments..."], ["Analysis", "What analysis or model would you use, and why?", "Explain the analytical logic without relying on jargon..."], ["Validation and decision", "How would you check the result, and what decision could it responsibly support?", "Describe validation, limitations and a bounded implication..."]],
    rubric: [["Question formulation", "Is the question precise and decision-relevant?"], ["Data definition", "Are variables and observations clear?"], ["Method reasoning", "Does the method fit the question and evidence?"], ["Validation and communication", "Are limitations tested and implications bounded?"]],
    activities: [["Formulating analytical questions", "Analysis"], ["Defining data and variables", "Analysis"], ["Selecting analytical methods", "Analysis"], ["Validating and communicating findings", "Communication"]],
    unknowns: ["Messy production data", "Maintainable data pipelines", "Model monitoring", "Longer technical collaboration"],
  },
  {
    careerId: "product-analyst",
    context: "You are the Product Analyst deciding where LearnLoop's week-2 journey breaks and what should be measured next.",
    introduction: "Product analytics connects behaviour to decisions through a clear journey, meaningful metrics and segments, disciplined interpretation and an actionable next analysis.",
    steps: [["Journey", "Define meaningful user progression."], ["Metric", "Choose measures representing real progress."], ["Segment", "Find where or for whom patterns differ."], ["Interpret", "Separate patterns from causal claims."], ["Decision", "Recommend one next analytical action."]],
    tasks: [["Journey definition", "How would you define the steps from plan creation to meaningful week-2 usage?", "Describe the behaviours forming the journey..."], ["Metrics", "Which metric and segments would you analyse first, and why?", "Choose measures and groups that clarify the drop-off..."], ["Interpretation", "What patterns would support different explanations?", "Distinguish observations from causes..."], ["Decision support", "What analysis or instrumentation should the team prioritise next?", "Recommend one next step and its decision value..."]],
    rubric: [["Journey logic", "Does the journey represent meaningful progression?"], ["Metric selection", "Do measures and segments illuminate the decision?"], ["Interpretation discipline", "Does the response avoid causal overclaiming?"], ["Decision relevance", "Does analysis lead to a focused action?"]],
    activities: [["Defining product journeys", "Planning & Design"], ["Choosing product metrics", "Analysis"], ["Segmenting user behaviour", "Analysis"], ["Turning analysis into product decisions", "Product & Strategy"]],
    unknowns: ["Production instrumentation", "Large event datasets", "Ongoing experimentation", "Influencing a live product team"],
  },
  {
    careerId: "business-analyst",
    context: "You are the Business Analyst clarifying LearnLoop's retention problem and requirements for one feasible improvement.",
    introduction: "Business analysis connects stakeholder needs, current processes, information requirements and constraints so a team changes the right problem.",
    steps: [["Stakeholders", "Identify needs and conflicts."], ["Current state", "Describe the process before the solution."], ["Requirements", "Translate needs into testable conditions."], ["Options", "Compare feasible responses and dependencies."], ["Acceptance", "Define intended behaviour and success."]],
    tasks: [["Current state", "What current user process appears to break down?", "Describe the steps and failure point..."], ["Stakeholder needs", "Which stakeholder needs or constraints must be clarified?", "Include student, product and delivery perspectives..."], ["Requirements", "Write the essential requirements for one focused improvement.", "State user, business and operational requirements..."], ["Acceptance", "What acceptance conditions and dependencies would you document?", "Make expected behaviour testable..."]],
    rubric: [["Process understanding", "Is the current state and failure point clear?"], ["Stakeholder analysis", "Are needs and constraints distinguished?"], ["Requirements quality", "Are requirements clear without overprescribing?"], ["Acceptance reasoning", "Are success conditions and dependencies testable?"]],
    activities: [["Mapping current processes", "Analysis"], ["Clarifying stakeholder needs", "Research"], ["Defining requirements", "Planning & Design"], ["Writing acceptance conditions", "Written Work"]],
    unknowns: ["Live requirements workshops", "Scope changes", "Technical constraints", "Implementation handoffs"],
  },
];

export const productDataTrials = profiles.map(createRoleTrial);
