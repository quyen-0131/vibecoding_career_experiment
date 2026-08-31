import { createRoleTrial, type RoleProfileInput } from "@/data/roleTrials/shared";

const profiles: RoleProfileInput[] = [
  {
    careerId: "behavioural-science-consultant",
    context: "You are advising LearnLoop on why students abandon plans and how to test a behavioural intervention.",
    introduction: "Behavioural science starts with a mechanism: explain observed behaviour, derive a prediction, target the mechanism and design evidence that could change your mind.",
    steps: [["Behaviour", "Describe what people do without assuming why."], ["Mechanism", "Propose a specific explanation."], ["Prediction", "State what else should follow."], ["Intervention", "Target the mechanism directly."], ["Test", "Use a comparison and disconfirming evidence."]],
    concepts: [{ title: "Friction", explanation: "Small effort can prevent action." }, { title: "Present bias", explanation: "Immediate effort can outweigh future benefit." }, { title: "Perceived failure", explanation: "A setback can make continuing feel less achievable." }],
    tasks: [["Behavioural diagnosis", "What mechanism might explain an important part of the drop-off, and why?", "Connect a mechanism to a pattern or quotation..."], ["Prediction", "If that explanation is correct, what else should we observe?", "Describe a testable pattern..."], ["Intervention", "Design one small intervention targeting the mechanism and explain how it changes behaviour.", "Keep the intervention linked to the mechanism..."], ["Test and update", "How would you test causality, and what result would weaken your explanation?", "Describe a comparison and disconfirming evidence..."]],
    rubric: [["Behavioural diagnosis", "Does the mechanism plausibly explain behaviour?"], ["Hypothesis quality", "Is it specific enough to predict?"], ["Intervention alignment", "Does the intervention target the mechanism?"], ["Experimental reasoning", "Could the test distinguish explanations?"]],
    activities: [["Explaining human behaviour", "Research"], ["Generating testable predictions", "Research"], ["Designing behavioural interventions", "Planning & Design"], ["Designing credible tests", "Research"]],
    unknowns: ["Sustained behavioural research", "Real client constraints", "Intervention data", "Longer engagements"],
  },
  {
    careerId: "ux-researcher",
    context: "You are the UX Researcher planning a focused study into why students stop using LearnLoop plans.",
    introduction: "UX research starts with a decision-relevant learning goal, recruits people who can answer it, chooses an appropriate method and turns observations into bounded findings.",
    steps: [["Learning goal", "Define what the team needs to understand."], ["Participants", "Recruit relevant experiences."], ["Method", "Reduce leading and speculative answers."], ["Synthesis", "Find patterns and exceptions."], ["Implication", "Connect evidence to a bounded decision."]],
    tasks: [["Research question", "What should the study help the team understand?", "Write one focused learning question..."], ["Study design", "Who would you recruit and what would you ask or observe?", "Describe participants, method and key prompts..."], ["Bias and quality", "How would you reduce leading questions or misleading conclusions?", "Name practical safeguards..."], ["Synthesis", "How would you turn the research into findings the team could use?", "Represent patterns, exceptions and evidential limits..."]],
    rubric: [["Learning focus", "Is the question decision-relevant and scoped?"], ["Method fit", "Do participants and methods fit?"], ["Research quality", "Are bias and evidence limits addressed?"], ["Synthesis reasoning", "Would findings support a bounded implication?"]],
    activities: [["Framing research questions", "Research"], ["Designing qualitative studies", "Research"], ["Reducing research bias", "Research"], ["Synthesising user evidence", "Analysis"]],
    unknowns: ["Moderating real sessions", "Recruitment constraints", "Research operations", "Long-term decision influence"],
  },
  {
    careerId: "consumer-insights-researcher",
    context: "You are the Consumer Insights Researcher investigating students' motivations, routines and reactions to LearnLoop.",
    introduction: "Consumer insights combines behavioural and attitudinal evidence to explain what matters to an audience and translate that understanding into product or brand decisions.",
    steps: [["Decision", "Clarify the decision to inform."], ["Audience", "Identify meaningful groups and contexts."], ["Research", "Combine behaviour and meaning."], ["Insight", "Explain the underlying tension or need."], ["Implication", "Change a product or brand decision."]],
    tasks: [["Decision question", "What decision should this research help LearnLoop make?", "Name the decision before choosing a method..."], ["Research design", "Which student groups and methods would you use?", "Describe sampling and mixed evidence..."], ["Insight hypothesis", "What deeper need or tension might connect the feedback?", "Offer a grounded, testable interpretation..."], ["Implication", "How could the insight change product positioning or experience design?", "Connect it to a bounded choice..."]],
    rubric: [["Decision orientation", "Is research anchored to a decision?"], ["Audience and method", "Do participants and methods fit?"], ["Insight depth", "Does interpretation go beyond restating data?"], ["Commercial implication", "Does insight lead to a responsible choice?"]],
    activities: [["Framing consumer questions", "Research"], ["Designing mixed-method research", "Research"], ["Developing consumer insights", "Analysis"], ["Translating insight into decisions", "Product & Strategy"]],
    unknowns: ["Fieldwork operations", "Large-scale segmentation", "Stakeholder influence", "Repeated category research"],
  },
  {
    careerId: "service-designer",
    context: "You are the Service Designer examining LearnLoop's end-to-end study-planning experience across product and support touchpoints.",
    introduction: "Service design looks beyond one screen to the journey, frontstage interactions, backstage processes, breakdowns and coordinated improvements.",
    steps: [["Journey", "Trace the person's goal over time."], ["Touchpoints", "Identify interactions across moments."], ["Breakdown", "Find where needs and delivery diverge."], ["Backstage", "Consider people, processes and systems."], ["Prototype", "Test a small service change."]],
    tasks: [["Journey", "Map the important stages from planning to returning in week 2.", "Describe goals, actions and shifts..."], ["Breakdown", "Where does the service fail to support recovery after change?", "Connect frontstage experience to backstage causes..."], ["Service concept", "Design one coordinated service improvement.", "Include product and supporting process or communication..."], ["Prototype", "How would you prototype it before committing?", "Describe what you would simulate and observe..."]],
    rubric: [["Journey thinking", "Is the experience represented over time?"], ["System understanding", "Are frontstage and backstage connected?"], ["Service coherence", "Does the concept coordinate touchpoints?"], ["Prototype quality", "Would the prototype generate useful evidence?"]],
    activities: [["Mapping end-to-end journeys", "Planning & Design"], ["Diagnosing service breakdowns", "Analysis"], ["Designing coordinated services", "Planning & Design"], ["Prototyping service changes", "Planning & Design"]],
    unknowns: ["Real cross-channel operations", "Co-design facilitation", "Organisational implementation", "Longitudinal outcomes"],
  },
];

export const researchTrials = profiles.map(createRoleTrial);
