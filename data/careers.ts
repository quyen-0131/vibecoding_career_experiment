export type CareerImportance = "Core" | "Important" | "Supporting" | "Limited";

export type CareerActivity = {
  activityId: string;
  label: string;
  importance: CareerImportance;
  description: string;
};

export type CareerModel = {
  id: CareerId;
  name: string;
  activities: CareerActivity[];
  unknowns: string[];
};

export type CareerId =
  | "product-management"
  | "behavioural-science-consulting"
  | "data-science"
  | "management-consulting";

export const careerModels: CareerModel[] = [
  {
    id: "product-management",
    name: "Product Management",
    activities: [
      { activityId: "user-research", label: "User research", importance: "Important", description: "Product managers use user research to understand problems, needs and product opportunities." },
      { activityId: "research-design", label: "Research design", importance: "Supporting", description: "Product managers help shape discovery research, although they may partner with dedicated researchers." },
      { activityId: "quantitative-data-analysis", label: "Data analysis", importance: "Supporting", description: "Product managers use data to understand funnels, user behaviour, experiments and product performance, but analysis supports product decisions rather than being the entire role." },
      { activityId: "insight-synthesis", label: "Insight synthesis", importance: "Important", description: "Product managers combine user, market and product evidence to clarify priorities and decisions." },
      { activityId: "report-creation", label: "Creating reports", importance: "Limited", description: "Clear written updates are useful, but formal report creation is not usually a defining part of product management." },
      { activityId: "client-communication", label: "Client communication", importance: "Supporting", description: "Some product roles involve customer communication, though the audience is often users and internal partners rather than clients." },
      { activityId: "stakeholder-management", label: "Stakeholder communication", importance: "Core", description: "Product managers align design, engineering and business stakeholders around priorities and trade-offs." },
    ],
    unknowns: ["Product prioritisation", "Balancing user, business and technical constraints", "Product delivery and iteration", "Working closely with engineering"],
  },
  {
    id: "behavioural-science-consulting",
    name: "Behavioural Science Consulting",
    activities: [
      { activityId: "user-research", label: "User research", importance: "Important", description: "Behavioural consultants research how people make decisions in specific contexts." },
      { activityId: "research-design", label: "Research design", importance: "Core", description: "Behavioural consultants design research that reveals behavioural barriers and tests interventions." },
      { activityId: "quantitative-data-analysis", label: "Data analysis", importance: "Core", description: "Behavioural consultants frequently analyse research and behavioural data to understand decision patterns and evaluate interventions." },
      { activityId: "insight-synthesis", label: "Behavioural insight synthesis", importance: "Core", description: "Consultants turn research findings and behavioural theory into clear explanations and intervention opportunities." },
      { activityId: "report-creation", label: "Creating reports", importance: "Important", description: "Client work often requires concise reports that explain evidence, reasoning and recommendations." },
      { activityId: "client-communication", label: "Client communication", importance: "Core", description: "Behavioural consultants explain findings, recommendations and research limitations to client teams." },
      { activityId: "stakeholder-management", label: "Stakeholder management", importance: "Important", description: "Consultants coordinate with client stakeholders to access evidence, shape research and move recommendations forward." },
    ],
    unknowns: ["Deep behavioural hypothesis development", "Experimental intervention design", "Causal evaluation", "Whether you enjoy sustained research work"],
  },
  {
    id: "data-science",
    name: "Data Science",
    activities: [
      { activityId: "research-design", label: "Research design", importance: "Supporting", description: "Data scientists help frame testable questions and sound analytical approaches." },
      { activityId: "quantitative-data-analysis", label: "Data analysis", importance: "Core", description: "Data scientists spend substantial time exploring, modelling and interpreting quantitative data." },
      { activityId: "insight-synthesis", label: "Insight synthesis", importance: "Important", description: "Data scientists translate technical findings into implications that others can act on." },
      { activityId: "report-creation", label: "Creating reports", importance: "Supporting", description: "Written analysis is useful, though the form varies from notebooks to short decision memos." },
      { activityId: "client-communication", label: "Client communication", importance: "Limited", description: "Some data science roles are client-facing, but many primarily support internal teams." },
      { activityId: "stakeholder-management", label: "Stakeholder communication", importance: "Important", description: "Data scientists work with stakeholders to frame questions and explain uncertainty in results." },
    ],
    unknowns: ["Writing and debugging production code", "Building statistical or machine-learning models", "Working with messy datasets for long periods", "Explaining technical uncertainty"],
  },
  {
    id: "management-consulting",
    name: "Management Consulting",
    activities: [
      { activityId: "research-design", label: "Research design", importance: "Supporting", description: "Consultants structure research to answer a client's strategic question quickly." },
      { activityId: "quantitative-data-analysis", label: "Data analysis", importance: "Important", description: "Consultants analyse market, financial and operational data to support recommendations." },
      { activityId: "insight-synthesis", label: "Insight synthesis", importance: "Core", description: "Consultants turn varied evidence into a clear point of view and practical recommendation." },
      { activityId: "report-creation", label: "Creating reports", importance: "Core", description: "Consulting work relies heavily on producing clear, persuasive client materials." },
      { activityId: "client-communication", label: "Client communication", importance: "Core", description: "Consultants regularly present findings and work directly with client teams." },
      { activityId: "stakeholder-management", label: "Stakeholder management", importance: "Important", description: "Consultants manage interviews, feedback and alignment across client stakeholders." },
    ],
    unknowns: ["Solving ambiguous business problems at pace", "Working across unfamiliar industries", "Building financial or operational recommendations", "Sustaining a client-service work rhythm"],
  },
];

export const careers = careerModels.map(({ id, name }) => ({ id, name }));

export function getCareerModel(id: CareerId) {
  return careerModels.find((career) => career.id === id);
}

export function getCareerActivity(careerId: CareerId, activityId: string) {
  const career = getCareerModel(careerId);
  return career?.activities.find((activity) => activity.activityId === activityId) ?? {
    activityId,
    label: "Transferable activity",
    importance: "Limited" as const,
    description: `This activity may still be useful in ${career?.name ?? "this career"}, but it is not currently mapped as a defining part of the role.`,
  };
}
