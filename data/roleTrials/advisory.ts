import { createRoleTrial, type RoleProfileInput } from "@/data/roleTrials/shared";

const profiles: RoleProfileInput[] = [
  {
    careerId: "management-consultant",
    context: "You are the Management Consultant advising LearnLoop's leadership on the retention problem and a focused strategic response.",
    introduction: "Management consulting structures an ambiguous question, builds a defensible evidence base, compares options and communicates a practical recommendation.",
    steps: [["Problem structure", "Break the question into answerable parts."], ["Hypotheses", "Identify explanations worth testing."], ["Evidence", "Combine data, interviews and context."], ["Recommendation", "Choose and justify a direction."], ["Implementation", "Translate advice into actions and risks."]],
    tasks: [["Problem structure", "How would you break LearnLoop's retention problem into focused questions?", "Create a small logical issue structure..."], ["Evidence plan", "What evidence would you gather first to test the important explanations?", "Prioritise useful analyses or interviews..."], ["Recommendation", "What initial strategic recommendation would you make, with what caveat?", "State a direction, rationale and uncertainty..."], ["Implementation", "How would you turn it into a two-week action plan?", "Name actions, owners, dependencies and risks..."]],
    rubric: [["Problem structuring", "Is ambiguity decomposed into useful questions?"], ["Evidence planning", "Is evidence prioritised against hypotheses?"], ["Recommendation quality", "Is the direction supported and appropriately cautious?"], ["Implementation thinking", "Is advice translated into practical action?"]],
    activities: ["Structuring ambiguous problems", "Planning strategic analysis", "Developing recommendations", "Planning implementation"],
    unknowns: ["Live client relationships", "Executive persuasion", "Long engagement pressure", "Several workstreams"],
  },
  {
    careerId: "policy-analyst",
    context: "You are the Policy Analyst advising a university consortium considering support for tools such as LearnLoop.",
    introduction: "Policy analysis defines the institutional problem, identifies affected groups, compares options and recommends proportionate action with evaluation safeguards.",
    steps: [["Policy problem", "Separate the problem from a preferred intervention."], ["Stakeholders", "Identify benefit, burden and exclusion."], ["Options", "Compare feasible responses."], ["Consequences", "Consider effectiveness, equity and implementation."], ["Evaluation", "Define evidence that would change policy."]],
    tasks: [["Policy problem", "What student-success problem could justify institutional action?", "Do not assume LearnLoop is the answer..."], ["Stakeholders and equity", "Who could benefit, be burdened or be missed?", "Consider students and institutional actors..."], ["Options", "Compare two plausible policy or programme options.", "Explain benefits, risks and implementation..."], ["Recommendation and evaluation", "What provisional recommendation would you make, and what evidence should trigger revision?", "State a cautious direction and evaluation plan..."]],
    rubric: [["Problem definition", "Is the policy problem separate from the tool?"], ["Stakeholder and equity analysis", "Are impacts across groups considered?"], ["Option analysis", "Are alternatives compared meaningfully?"], ["Recommendation and evaluation", "Is direction proportionate and revisable?"]],
    activities: ["Defining policy problems", "Analysing stakeholder impacts", "Comparing policy options", "Designing evaluation safeguards"],
    unknowns: ["Regulatory constraints", "Political negotiation", "Cost modelling", "Long implementation cycles"],
  },
  {
    careerId: "organisational-development-consultant",
    context: "You are the Organisational Development Consultant helping LearnLoop's cross-functional team organise around the retention challenge.",
    introduction: "Organisational development examines how structures, roles, routines and incentives shape collective performance, then designs participatory change.",
    steps: [["System", "Define the organisational outcome and actors."], ["Diagnosis", "Examine structural, behavioural and process causes."], ["Participation", "Involve people who enact the system."], ["Intervention", "Change a focused organisational condition."], ["Learning", "Observe changes in routines and outcomes."]],
    tasks: [["Organisational diagnosis", "What team conditions could prevent LearnLoop from responding well to this evidence?", "Make assumptions explicit because internal evidence is limited..."], ["Discovery", "What would you ask product, research, engineering and support teams?", "Plan a small diagnosis of roles and tensions..."], ["Intervention", "Design one team or process intervention.", "Target a diagnosed organisational condition..."], ["Learning plan", "How would you know whether ways of working improved?", "Describe observable behaviour and outcomes..."]],
    rubric: [["Systems diagnosis", "Are organisational causes separated from product symptoms?"], ["Participatory discovery", "Would discovery reveal relevant perspectives?"], ["Intervention alignment", "Does intervention target the diagnosis?"], ["Organisational learning", "Are observable changes defined without overclaiming?"]],
    activities: ["Diagnosing organisational systems", "Planning participatory discovery", "Designing organisational interventions", "Evaluating ways of working"],
    unknowns: ["Trust in real teams", "Leadership sponsorship", "Resistance to change", "Sustained culture change"],
  },
  {
    careerId: "marketing-strategist",
    context: "You are the Marketing Strategist deciding how LearnLoop should position and activate the product for students.",
    introduction: "Marketing strategy chooses an audience, develops a meaningful value proposition and designs a message or channel test that can update future decisions.",
    steps: [["Audience", "Choose a meaningfully distinct segment."], ["Insight", "Identify the tension shaping behaviour."], ["Positioning", "Explain why the offer matters."], ["Activation", "Create a focused message and channel choice."], ["Learning", "Define evidence that updates strategy."]],
    tasks: [["Audience", "Which student segment would you prioritise, and why?", "Use needs or behaviour, not demographics alone..."], ["Positioning", "What value proposition would make LearnLoop relevant?", "Connect tension, benefit and reason to believe..."], ["Activation", "Design one focused message and channel test.", "Describe message, context and intended action..."], ["Measurement", "What result would support or challenge the strategy?", "Choose behavioural evidence and an update rule..."]],
    rubric: [["Audience focus", "Is the segment specific and evidence-linked?"], ["Positioning quality", "Does proposition connect need, value and differentiation?"], ["Activation alignment", "Do message and channel fit?"], ["Learning design", "Would evidence update strategy?"]],
    activities: ["Prioritising audience segments", "Developing positioning", "Designing message activation", "Testing marketing strategy"],
    unknowns: ["Real campaign execution", "Budget allocation", "Creative collaboration", "Long-term brand effects"],
  },
];

export const advisoryTrials = profiles.map(createRoleTrial);
