import { getActivityDefinition } from "@/data/activityCatalog";

export type CareerImportance = "Core" | "Important" | "Supporting" | "Limited";

export type CareerActivity = {
  id: string;
  label: string;
  importance: CareerImportance;
  description: string;
  aliases?: string[];
  underlyingCapabilities?: string[];
  typicalDeliverables?: string[];
};

export type CareerId =
  | "product-manager"
  | "behavioural-science-consultant"
  | "data-scientist"
  | "product-analyst"
  | "ux-researcher"
  | "management-consultant"
  | "consumer-insights-researcher"
  | "business-analyst"
  | "service-designer"
  | "policy-analyst"
  | "organisational-development-consultant"
  | "marketing-strategist";

export type CareerUncertainty = {
  title: string;
  question: string;
  explores: string[];
};

export type CareerModel = {
  id: CareerId;
  title: string;
  family?: string;
  activities: CareerActivity[];
  uncertainty: CareerUncertainty;
};

const activity = (
  id: string,
  label: string,
  importance: CareerImportance,
  description: string,
  aliases: string[] = [],
  underlyingCapabilities: string[] = [label],
  typicalDeliverables: string[] = [],
): CareerActivity => ({ id, label: getActivityDefinition(id)?.label ?? label, importance, description, aliases, underlyingCapabilities, typicalDeliverables });

export const careerModels: CareerModel[] = [
  {
    id: "product-manager",
    title: "Product Manager",
    family: "Product",
    uncertainty: {
      title: "I want to know whether I enjoy making product decisions",
      question: "Do I enjoy making product decisions under competing user, business and technical constraints?",
      explores: ["product-prioritisation", "technical-tradeoffs", "product-delivery"],
    },
    activities: [
      activity("problem-framing", "Problem framing", "Core", "Product managers turn ambiguous user and business needs into clear product problems."),
      activity("product-prioritisation", "Product prioritisation", "Core", "Product managers choose which opportunities deserve attention and make trade-offs across competing needs."),
      activity("product-strategy", "Product strategy development", "Core", "Product managers develop and communicate a product direction by connecting user problems, market context, business goals and product capabilities. Strategy work helps teams decide which outcomes to pursue, which opportunities to defer and how near-term choices support a coherent direction.", ["strategy development", "product direction"], ["strategic reasoning", "opportunity framing"], ["product strategy", "strategy narrative"]),
      activity("strategic-recommendations", "Strategic recommendations", "Important", "Product managers turn user, market, business and product evidence into a recommended direction. They explain the trade-offs and why the team should pursue that course of action.", ["product recommendation", "recommended direction"], ["evidence synthesis", "strategic reasoning", "trade-off communication"], ["decision recommendation", "strategy memo"]),
      activity("stakeholder-communication", "Stakeholder communication", "Core", "Product managers align design, engineering and business partners around decisions and priorities."),
      activity("client-presentation", "Stakeholder presentations", "Important", "Product managers present evidence, decisions and recommendations to stakeholders so teams can align and move work forward."),
      activity("product-delivery", "Product delivery and iteration", "Core", "Product managers guide work from an initial decision through delivery, learning and iteration."),
      activity("user-research", "User research", "Important", "Product managers use user evidence to understand problems, needs and product opportunities."),
      activity("insight-synthesis", "Insight synthesis", "Important", "Product managers combine user, market and product evidence to clarify priorities."),
      activity("metrics-analysis", "Metrics analysis", "Important", "Product managers use product metrics to understand behaviour, performance and outcomes."),
      activity("quantitative-data-analysis", "Quantitative data analysis", "Important", "Product managers use quantitative evidence to spot product-performance patterns, compare options and judge whether a change worked."),
      activity("behavioural-analysis", "Behavioural analysis", "Supporting", "Product managers examine behaviour patterns to understand user problems and identify product opportunities."),
      activity("programming", "Programming and data tooling", "Supporting", "Technical fluency helps product managers discuss feasibility, data and trade-offs with engineering."),
      activity("product-launch-planning", "Product launch planning", "Important", "This work aligns the launch goal, target users, team readiness and measures of success before a product or feature reaches users."),
      activity("enablement-materials", "Product decision and launch materials", "Supporting", "Product managers create briefs, recommendations and launch materials that help teams understand a product direction."),
      activity("technical-tradeoffs", "Technical trade-offs", "Important", "Product managers balance user value, business goals and engineering constraints."),
      activity("engineering-collaboration", "Working with engineering", "Important", "Product managers work closely with engineers to shape feasible solutions and delivery choices."),
      activity("experimentation", "Experimentation", "Supporting", "Product managers use experiments to reduce uncertainty before or after product decisions."),
      activity("research-design", "Research design", "Supporting", "Product managers help shape research questions and methods when evidence is needed for a product decision.", ["study planning"], ["evidence planning"], ["research brief"]),
      activity("requirements-clarification", "Requirements clarification", "Important", "Product managers clarify user and business needs before a team commits to a solution.", ["requirements gathering"], ["needs translation"], ["problem brief"]),
      activity("user-story-development", "Creating user stories", "Supporting", "Product managers may express user needs as concise stories or acceptance-oriented requirements.", ["user stories"], ["written product communication"], ["user story", "acceptance criteria"]),
      activity("proposal-development", "Product proposals and business cases", "Important", "Product managers write proposals and business cases to connect a problem, evidence and proposed direction.", ["product proposal", "business case"], ["recommendation development", "persuasive writing"], ["product proposal", "decision memo"]),
      activity("roadmap-planning", "Roadmap planning", "Core", "Product managers sequence outcomes and initiatives while making dependencies and uncertainty visible.", ["product roadmap"], ["planning", "prioritisation"], ["roadmap"]),
      activity("success-measures", "Defining success measures", "Important", "Product managers define what observable outcome would show whether a product decision worked.", ["success metrics"], ["measurement reasoning"], ["measurement plan"]),
      activity("report-writing", "Strategic product reports and decision writing", "Important", "Product managers turn research, data, strategic reasoning and product decisions into clear written narratives. Strategic reports, product briefs and decision memos help cross-functional teams understand the evidence, proposed direction, trade-offs and measures of success.", ["product brief", "decision memo", "strategic report"], ["evidence synthesis", "strategic communication", "recommendation writing"], ["product brief", "decision memo", "strategy narrative"]),
    ],
  },
  {
    id: "behavioural-science-consultant",
    title: "Behavioural Science Consultant",
    family: "Research & advisory",
    uncertainty: {
      title: "I want to know whether I enjoy deeper behavioural problem-solving",
      question: "Do I enjoy developing behavioural hypotheses and turning them into testable interventions?",
      explores: ["behavioural-hypothesis", "intervention-design", "experimentation"],
    },
    activities: [
      activity("behavioural-analysis", "Behavioural analysis", "Core", "Behavioural consultants diagnose the behavioural mechanisms behind observed decisions."),
      activity("research-design", "Research design", "Core", "Behavioural consultants design research that reveals barriers and tests explanations."),
      activity("behavioural-hypothesis", "Behavioural hypothesis development", "Core", "Behavioural consultants form theory-informed hypotheses about why people behave as they do."),
      activity("intervention-design", "Intervention design", "Core", "Behavioural consultants translate behavioural hypotheses into practical interventions."),
      activity("experimentation", "Experimental design", "Important", "Experiments are used to test whether an intervention changes behaviour."),
      activity("causal-evaluation", "Causal evaluation", "Important", "Consultants assess whether observed effects are plausibly caused by an intervention."),
      activity("quantitative-data-analysis", "Data analysis", "Important", "Behavioural data is analysed to understand patterns and evaluate interventions."),
      activity("insight-synthesis", "Insight synthesis", "Important", "Research evidence and behavioural theory are combined into a clear explanation."),
      activity("stakeholder-communication", "Stakeholder and client communication", "Important", "Behavioural consultants gather context from clients and explain evidence, limitations and recommendations."),
      activity("strategic-recommendations", "Strategic recommendations", "Supporting", "Behavioural findings are translated into choices a client can implement."),
    ],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    family: "Data",
    uncertainty: {
      title: "I want to know whether I enjoy technical model-building",
      question: "Do I enjoy building and validating analytical models deeply enough for it to be central to my work?",
      explores: ["programming", "data-modelling", "research-design"],
    },
    activities: [
      activity("programming", "Programming and data tooling", "Core", "Data scientists write code to obtain, transform, analyse and model data."),
      activity("data-modelling", "Statistical and predictive modelling", "Core", "Data scientists build and test models that explain or predict outcomes."),
      activity("quantitative-data-analysis", "Quantitative data analysis", "Core", "Data scientists explore quantitative data to uncover patterns and answer questions."),
      activity("causal-evaluation", "Causal evaluation", "Important", "Some data science roles estimate causal effects and evaluate interventions."),
      activity("research-design", "Analytical design", "Important", "Data scientists choose methods and validation approaches that fit the question."),
      activity("data-visualisation", "Data visualisation", "Important", "Clear visualisation helps others understand patterns, uncertainty and model results."),
      activity("insight-synthesis", "Insight synthesis", "Important", "Technical findings are translated into implications that others can act on."),
      activity("stakeholder-communication", "Stakeholder communication", "Supporting", "Data scientists work with stakeholders to frame questions and explain limitations."),
      activity("metrics-analysis", "Metrics analysis", "Supporting", "Data scientists define and analyse performance measures in product and business contexts."),
    ],
  },
  {
    id: "product-analyst",
    title: "Product Analyst",
    family: "Product & data",
    uncertainty: {
      title: "I want to know whether I enjoy turning product data into decisions",
      question: "Do I enjoy investigating product behaviour and using the findings to influence product decisions?",
      explores: ["metrics-analysis", "experimentation", "problem-framing"],
    },
    activities: [
      activity("metrics-analysis", "Product metrics analysis", "Core", "Product analysts examine funnels, retention and feature behaviour to understand product performance."),
      activity("quantitative-data-analysis", "Quantitative data analysis", "Core", "Product analysts use behavioural data to answer product questions."),
      activity("experimentation", "Experiment analysis", "Core", "Product analysts design measurement plans and interpret product experiments."),
      activity("programming", "SQL and data tooling", "Important", "Product analytics work often relies on SQL and reproducible analytical workflows."),
      activity("insight-synthesis", "Product insight synthesis", "Important", "Analysts turn patterns in data into a clear product implication."),
      activity("problem-framing", "Analytical problem framing", "Important", "Product analysts translate product questions into answerable analytical work."),
      activity("data-visualisation", "Data visualisation", "Important", "Visual analysis helps teams monitor performance and explore product behaviour."),
      activity("stakeholder-communication", "Product stakeholder communication", "Important", "Analysts partner with product teams to shape questions and decisions."),
      activity("user-research", "User research", "Limited", "Qualitative user research may add context, but is rarely the central activity."),
    ],
  },
  {
    id: "ux-researcher",
    title: "UX Researcher",
    family: "Research & design",
    uncertainty: {
      title: "I want to know whether I enjoy focused user research",
      question: "Do I enjoy planning and conducting user research deeply enough for it to be central to my work?",
      explores: ["user-research", "research-design", "usability-testing"],
    },
    activities: [
      activity("user-research", "User research", "Core", "UX researchers investigate user needs, behaviours and experiences."),
      activity("research-design", "Research design", "Core", "UX researchers choose methods that produce credible evidence for a product question."),
      activity("qualitative-analysis", "Qualitative analysis", "Core", "Interview and observation evidence is analysed to identify patterns and meaning."),
      activity("usability-testing", "Usability testing", "Core", "UX researchers test how people understand and use product experiences."),
      activity("insight-synthesis", "Insight synthesis", "Important", "Researchers turn multiple observations into clear, defensible findings."),
      activity("client-presentation", "Research presentations", "Important", "Researchers communicate evidence in ways product teams can use."),
      activity("stakeholder-communication", "Stakeholder communication", "Important", "UX researchers align research questions and implications with product partners."),
      activity("survey-design", "Survey design", "Supporting", "Surveys can extend qualitative learning or measure user attitudes at scale."),
      activity("quantitative-data-analysis", "Quantitative analysis", "Supporting", "Some UX research roles include survey or behavioural data analysis."),
    ],
  },
  {
    id: "management-consultant",
    title: "Management Consultant",
    family: "Advisory",
    uncertainty: {
      title: "I want to know whether I enjoy structuring ambiguous client problems",
      question: "Do I enjoy turning an ambiguous client problem into a clear analysis and recommendation?",
      explores: ["problem-framing", "strategic-recommendations", "client-presentation"],
    },
    activities: [
      activity("problem-framing", "Problem structuring", "Core", "Consultants break ambiguous business questions into a tractable work plan."),
      activity("strategic-recommendations", "Strategy development and recommendations", "Core", "Management consultants develop a defensible strategic point of view by integrating client objectives, qualitative and quantitative evidence, alternatives and implementation constraints. They explain what the client should do, why that direction is preferable and what trade-offs or risks it creates.", ["strategy development", "recommendation development"], ["structured problem-solving", "evidence synthesis", "option evaluation"], ["strategic recommendation", "executive memo"]),
      activity("stakeholder-communication", "Stakeholder and client communication", "Core", "Consultants gather evidence from clients and stakeholders, align expectations and communicate recommendations."),
      activity("client-presentation", "Client presentations", "Core", "Consultants present evidence and persuade senior stakeholders to act."),
      activity("quantitative-data-analysis", "Business data analysis", "Important", "Market, financial and operational data is analysed to support recommendations."),
      activity("metrics-analysis", "Metrics and performance analysis", "Important", "Consultants use organisational, operational and outcome metrics to diagnose performance and assess whether recommendations are working."),
      activity("behavioural-analysis", "Behavioural analysis", "Important", "Consultants examine customer, employee or organisational behaviour to diagnose problems and shape recommendations."),
      activity("programming", "Programming and data tooling", "Supporting", "Data tools can support consulting analysis, automation and evidence-based recommendations."),
      activity("market-sizing", "Market sizing", "Important", "Consultants estimate market opportunities and the assumptions behind them."),
      activity("financial-analysis", "Financial analysis", "Important", "Business cases and financial implications often shape strategic choices."),
      activity("insight-synthesis", "Insight synthesis", "Important", "Consultants combine interviews, data and market evidence into a coherent answer."),
      activity("project-coordination", "Engagement coordination", "Supporting", "Consultants manage workstreams, interviews and deadlines across a project."),
      activity("research-design", "Research planning", "Supporting", "Consultants plan efficient research to answer a strategic question."),
      activity("enablement-materials", "Decision materials and toolkits", "Important", "Consultants turn research and recommendations into clear toolkits, reports and materials that support client decisions or implementation."),
      activity("programme-design", "Programme and initiative design", "Important", "Consultants may design programmes or initiatives that translate a diagnosis into coordinated action."),
      activity("programme-evaluation", "Programme evaluation", "Important", "Consultants assess whether programmes achieved intended outcomes and what should change."),
      activity("user-research", "Customer and user research", "Important", "Management consultants use customer and user research to understand needs, behaviour and market context before diagnosing a client problem or developing recommendations."),
      activity("qualitative-research", "Qualitative research", "Important", "Consultants use interviews and qualitative evidence to understand markets, organisations and stakeholder perspectives.", ["interview research"], ["evidence gathering"], ["interview guide", "research notes"]),
      activity("interviewing", "Client and stakeholder interviews", "Important", "Consultants conduct interviews to develop and test an understanding of the client problem.", ["expert interviews", "client interviews"], ["questioning", "active listening"], ["interview notes"]),
      activity("structured-problem-solving", "Structured problem-solving", "Core", "Consultants break an ambiguous problem into clear questions and testable lines of analysis.", ["issue tree", "structured framework"], ["problem structuring"], ["workplan"]),
      activity("proposal-development", "Proposal development", "Core", "Consultants turn an understanding of a problem into a persuasive scope, approach or recommendation.", ["consulting proposal", "pitch"], ["recommendation development", "persuasive writing"], ["proposal", "statement of work"]),
      activity("report-writing", "Strategic reports and slide creation", "Core", "Management consultants structure complex analysis into concise reports, executive memos and presentations that lead a client from evidence to implications and recommended action. The work requires synthesis, a clear storyline and writing that supports a decision rather than merely documenting information.", ["slide deck", "client report", "strategic report"], ["evidence synthesis", "storylining", "recommendation writing"], ["strategic report", "executive memo", "slide deck"]),
      activity("process-design", "Implementation planning", "Important", "Consultants translate recommendations into a practical sequence of actions, owners and dependencies.", ["implementation roadmap"], ["planning"], ["implementation plan"]),
    ],
  },
  {
    id: "consumer-insights-researcher",
    title: "Consumer Insights Researcher",
    family: "Research",
    uncertainty: {
      title: "I want to know whether I enjoy investigating consumer behaviour deeply",
      question: "Do I enjoy designing consumer research and translating it into decisions for brands or products?",
      explores: ["market-research", "research-design", "insight-synthesis"],
    },
    activities: [
      activity("market-research", "Market and consumer research", "Core", "Researchers investigate markets, audiences and changing consumer needs."),
      activity("research-design", "Research design", "Core", "Researchers design studies that answer brand, market and customer questions."),
      activity("user-research", "Customer interviews", "Important", "Direct conversations reveal motivations, language and unmet needs."),
      activity("survey-design", "Survey design", "Important", "Surveys measure consumer attitudes and behaviours across larger samples."),
      activity("quantitative-data-analysis", "Quantitative analysis", "Important", "Survey and market data is analysed to identify meaningful patterns."),
      activity("qualitative-analysis", "Qualitative analysis", "Important", "Interview and focus-group evidence is interpreted for themes and motivations."),
      activity("insight-synthesis", "Consumer insight synthesis", "Core", "Researchers combine evidence into a clear account of what consumers need and why."),
      activity("client-presentation", "Insight presentations", "Important", "Findings are communicated to marketing, innovation or client teams."),
      activity("strategic-recommendations", "Market recommendations", "Supporting", "Consumer evidence informs brand, product and go-to-market choices."),
    ],
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    family: "Business analysis",
    uncertainty: {
      title: "I want to know whether I enjoy improving business processes",
      question: "Do I enjoy investigating business needs and turning them into practical process or system changes?",
      explores: ["problem-framing", "process-improvement", "stakeholder-communication"],
    },
    activities: [
      activity("problem-framing", "Business problem framing", "Core", "Business analysts clarify ambiguous operational or system needs before defining a change."),
      activity("process-improvement", "Process improvement", "Core", "Business analysts map current processes and identify practical improvements."),
      activity("stakeholder-communication", "Stakeholder communication", "Core", "Business analysts gather requirements and align people affected by a proposed change."),
      activity("quantitative-data-analysis", "Business data analysis", "Important", "Operational data is analysed to understand problems and evaluate possible changes."),
      activity("insight-synthesis", "Requirements synthesis", "Important", "Evidence from users, data and processes is combined into clear requirements."),
      activity("project-coordination", "Change coordination", "Important", "Business analysts coordinate decisions and dependencies across a change initiative."),
      activity("report-writing", "Business documentation", "Important", "Requirements, process findings and decisions are documented clearly."),
      activity("client-presentation", "Recommendation presentations", "Supporting", "Findings and proposed changes are presented to decision-makers."),
    ],
  },
  {
    id: "service-designer",
    title: "Service Designer",
    family: "Design",
    uncertainty: {
      title: "I want to know whether I enjoy redesigning end-to-end services",
      question: "Do I enjoy combining research and systems thinking to improve an end-to-end service experience?",
      explores: ["user-research", "problem-framing", "process-improvement"],
    },
    activities: [
      activity("user-research", "User research", "Core", "Service designers investigate how people experience a service across multiple touchpoints."),
      activity("problem-framing", "Service problem framing", "Core", "Service designers define experience and system problems that span teams or channels."),
      activity("process-improvement", "Service process improvement", "Core", "Current service journeys are redesigned to reduce friction and improve outcomes."),
      activity("research-design", "Research design", "Important", "Service designers select methods that reveal user needs and operational constraints."),
      activity("insight-synthesis", "Service insight synthesis", "Important", "Research and operational evidence are combined into a coherent service opportunity."),
      activity("facilitation", "Co-design facilitation", "Important", "Workshops help users and stakeholders shape possible service improvements together."),
      activity("stakeholder-communication", "Cross-service stakeholder communication", "Important", "Service designers align teams responsible for different parts of the experience."),
      activity("usability-testing", "Prototype testing", "Supporting", "Service concepts and touchpoints are tested before wider implementation."),
    ],
  },
  {
    id: "policy-analyst",
    title: "Policy Analyst",
    family: "Policy",
    uncertainty: {
      title: "I want to know whether I enjoy evidence-based policy work",
      question: "Do I enjoy weighing research, stakeholder needs and implementation constraints to develop policy advice?",
      explores: ["research-design", "quantitative-data-analysis", "strategic-recommendations"],
    },
    activities: [
      activity("market-research", "Policy and landscape research", "Core", "Policy analysts investigate the context, precedents and affected populations around an issue."),
      activity("quantitative-data-analysis", "Policy data analysis", "Core", "Administrative, survey or population data is analysed to understand a policy problem."),
      activity("insight-synthesis", "Evidence synthesis", "Core", "Research, stakeholder evidence and implementation realities are combined into policy advice."),
      activity("strategic-recommendations", "Policy recommendations", "Core", "Analysts develop options and explain their likely consequences and trade-offs."),
      activity("research-design", "Policy research design", "Important", "Analysts plan evidence gathering that is proportionate to a policy question."),
      activity("stakeholder-communication", "Stakeholder consultation", "Important", "Policy analysts gather and communicate perspectives from affected groups and delivery partners."),
      activity("report-writing", "Policy writing", "Important", "Evidence and options are expressed in clear briefs, reports and recommendations."),
      activity("causal-evaluation", "Policy evaluation", "Supporting", "Evaluation methods help assess whether a policy contributed to intended outcomes."),
    ],
  },
  {
    id: "organisational-development-consultant",
    title: "Organisational Development Consultant",
    family: "People advisory",
    uncertainty: {
      title: "I want to know whether I enjoy changing how organisations work",
      question: "Do I enjoy diagnosing people and organisational challenges and designing practical change interventions?",
      explores: ["behavioural-analysis", "facilitation", "intervention-design"],
    },
    activities: [
      activity("behavioural-analysis", "Organisational behaviour analysis", "Core", "OD consultants diagnose behavioural and cultural patterns affecting how an organisation works."),
      activity("intervention-design", "Change intervention design", "Core", "Evidence is translated into interventions that support behaviour, capability or culture change."),
      activity("facilitation", "Workshop facilitation", "Core", "OD work frequently involves facilitating leaders and teams through diagnosis and change."),
      activity("stakeholder-communication", "Stakeholder communication", "Core", "Consultants align leaders, employees and delivery partners around change goals."),
      activity("research-design", "Organisational research design", "Important", "Surveys, interviews and workshops are designed to understand organisational needs."),
      activity("qualitative-analysis", "Qualitative organisational analysis", "Important", "Interview and workshop evidence is analysed for recurring cultural and behavioural themes."),
      activity("insight-synthesis", "Organisational insight synthesis", "Important", "Multiple evidence sources are combined into a clear diagnosis."),
      activity("strategic-recommendations", "Change recommendations", "Important", "Consultants recommend practical changes to structures, processes or leadership behaviour."),
    ],
  },
  {
    id: "marketing-strategist",
    title: "Marketing Strategist",
    family: "Marketing",
    uncertainty: {
      title: "I want to know whether I enjoy turning customer evidence into market strategy",
      question: "Do I enjoy combining consumer insight, positioning and performance evidence to make marketing choices?",
      explores: ["market-research", "insight-synthesis", "strategic-recommendations"],
    },
    activities: [
      activity("market-research", "Market and competitor research", "Core", "Marketing strategists investigate audiences, competitors and changing market conditions."),
      activity("insight-synthesis", "Customer insight synthesis", "Core", "Customer, market and performance evidence is combined into a strategic point of view."),
      activity("strategic-recommendations", "Marketing recommendations", "Core", "Strategists recommend positioning, audience and channel choices."),
      activity("quantitative-data-analysis", "Campaign and customer analysis", "Important", "Quantitative evidence is used to understand audience behaviour and marketing performance."),
      activity("user-research", "Customer research", "Important", "Direct customer evidence helps explain needs, language and motivations."),
      activity("metrics-analysis", "Marketing performance analysis", "Important", "Strategists use performance measures to understand what is working and what needs adjustment."),
      activity("client-presentation", "Strategy presentations", "Important", "Marketing recommendations are communicated to clients or internal decision-makers."),
      activity("stakeholder-communication", "Marketing stakeholder communication", "Supporting", "Strategists coordinate decisions across creative, commercial and delivery teams."),
    ],
  },
];

export const careers = careerModels.map(({ id, title }) => ({ id, title }));

export function getCareerModel(id: CareerId) {
  return careerModels.find((career) => career.id === id);
}

export function getCareerActivity(careerId: CareerId, activityId: string): CareerActivity {
  const career = getCareerModel(careerId);
  return career?.activities.find((item) => item.id === activityId) ?? {
    id: activityId,
    label: getActivityDefinition(activityId)?.label ?? "Activity without a specific mapping",
    importance: "Limited",
    description: `The current prototype does not yet have a specific ${career?.title ?? "career"} mapping for this activity.`,
  };
}

export function getRemainingEvidenceGaps(careerId: CareerId, existingCanonicalIds: string[], limit = 4) {
  const career = getCareerModel(careerId);
  if (!career) return [];
  return career.activities
    .filter((item) => (item.importance === "Core" || item.importance === "Important") && !existingCanonicalIds.includes(item.id))
    .slice(0, limit);
}
