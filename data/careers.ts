export type CareerImportance = "Core" | "Important" | "Supporting" | "Limited";

export type CareerActivity = {
  id: string;
  label: string;
  importance: CareerImportance;
  description: string;
};

export type CareerId =
  | "product-manager"
  | "behavioural-science-consultant"
  | "data-scientist"
  | "product-analyst"
  | "ux-researcher"
  | "management-consultant"
  | "consumer-insights-researcher";

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

const activity = (id: string, label: string, importance: CareerImportance, description: string): CareerActivity => ({ id, label, importance, description });

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
      activity("stakeholder-communication", "Stakeholder communication", "Core", "Product managers align design, engineering and business partners around decisions and priorities."),
      activity("product-delivery", "Product delivery and iteration", "Core", "Product managers guide work from an initial decision through delivery, learning and iteration."),
      activity("user-research", "User research", "Important", "Product managers use user evidence to understand problems, needs and product opportunities."),
      activity("insight-synthesis", "Insight synthesis", "Important", "Product managers combine user, market and product evidence to clarify priorities."),
      activity("metrics-analysis", "Metrics analysis", "Important", "Product managers use product metrics to understand behaviour, performance and outcomes."),
      activity("technical-tradeoffs", "Technical trade-offs", "Important", "Product managers balance user value, business goals and engineering constraints."),
      activity("engineering-collaboration", "Working with engineering", "Important", "Product managers work closely with engineers to shape feasible solutions and delivery choices."),
      activity("experimentation", "Experimentation", "Supporting", "Product managers use experiments to reduce uncertainty before or after product decisions."),
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
      activity("client-communication", "Client communication", "Important", "Consultants explain evidence, limitations and recommendations to client teams."),
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
      activity("strategic-recommendations", "Strategic recommendations", "Core", "Consultants develop a clear point of view and recommend practical choices."),
      activity("client-communication", "Client communication", "Core", "Consultants work directly with client teams throughout an engagement."),
      activity("client-presentation", "Client presentations", "Core", "Consultants present evidence and persuade senior stakeholders to act."),
      activity("quantitative-data-analysis", "Business data analysis", "Important", "Market, financial and operational data is analysed to support recommendations."),
      activity("market-sizing", "Market sizing", "Important", "Consultants estimate market opportunities and the assumptions behind them."),
      activity("financial-analysis", "Financial analysis", "Important", "Business cases and financial implications often shape strategic choices."),
      activity("insight-synthesis", "Insight synthesis", "Important", "Consultants combine interviews, data and market evidence into a coherent answer."),
      activity("project-coordination", "Engagement coordination", "Supporting", "Consultants manage workstreams, interviews and deadlines across a project."),
      activity("research-design", "Research planning", "Supporting", "Consultants plan efficient research to answer a strategic question."),
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
];

export const careers = careerModels.map(({ id, title }) => ({ id, title }));

export function getCareerModel(id: CareerId) {
  return careerModels.find((career) => career.id === id);
}

export function getCareerActivity(careerId: CareerId, activityId: string): CareerActivity {
  const career = getCareerModel(careerId);
  return career?.activities.find((item) => item.id === activityId) ?? {
    id: activityId,
    label: "Transferable activity",
    importance: "Limited",
    description: `This activity may transfer to ${career?.title ?? "this role"}, but it is not currently mapped as a defining part of the role.`,
  };
}

export function getRemainingEvidenceGaps(careerId: CareerId, existingCanonicalIds: string[], limit = 4) {
  const career = getCareerModel(careerId);
  if (!career) return [];
  return career.activities
    .filter((item) => (item.importance === "Core" || item.importance === "Important") && !existingCanonicalIds.includes(item.id))
    .slice(0, limit);
}
