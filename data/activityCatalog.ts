export type ActivityCategory = "Research" | "Analysis" | "Communication" | "Execution" | "Product & Strategy" | "Other";

export type ActivityDefinition = {
  id: string;
  label: string;
  category: ActivityCategory;
  patterns: RegExp[];
};

export const activityCatalog: ActivityDefinition[] = [
  { id: "user-research", label: "User and customer research", category: "Research", patterns: [/user research/i, /customer research/i, /customer interview/i, /user interview/i, /interviewed\s+(users|customers)/i] },
  { id: "research-design", label: "Research design", category: "Research", patterns: [/research design/i, /design(?:ed|ing)?\s+.*(study|research|survey)/i, /research method/i] },
  { id: "market-research", label: "Market research", category: "Research", patterns: [/market research/i, /competitive research/i, /market landscape/i, /competitor analysis/i] },
  { id: "usability-testing", label: "Usability testing", category: "Research", patterns: [/usability test/i, /prototype test/i, /user test/i] },
  { id: "behavioural-analysis", label: "Behavioural analysis", category: "Research", patterns: [/behavioural analys/i, /behavioral analys/i, /decision pattern/i, /behavioural insight/i, /behavioral insight/i] },
  { id: "behavioural-hypothesis", label: "Behavioural hypothesis development", category: "Research", patterns: [/behavioural hypothes/i, /behavioral hypothes/i, /behavioural mechanism/i, /behavioral mechanism/i] },
  { id: "survey-design", label: "Survey design", category: "Research", patterns: [/survey design/i, /designed\s+.*survey/i, /questionnaire design/i] },
  { id: "quantitative-data-analysis", label: "Quantitative data analysis", category: "Analysis", patterns: [/quantitative analys/i, /data analys/i, /analy[sz](?:e|ed|ing)\s+.*data/i, /statistical analys/i, /survey data/i] },
  { id: "qualitative-analysis", label: "Qualitative analysis", category: "Analysis", patterns: [/qualitative analys/i, /thematic analys/i, /coded\s+interview/i] },
  { id: "metrics-analysis", label: "Metrics and performance analysis", category: "Analysis", patterns: [/product metric/i, /performance metric/i, /funnel/i, /retention/i, /conversion/i, /kpi/i] },
  { id: "data-modelling", label: "Statistical and predictive modelling", category: "Analysis", patterns: [/predictive model/i, /machine learning/i, /regression/i, /statistical model/i] },
  { id: "data-visualisation", label: "Data visualisation", category: "Analysis", patterns: [/data visuali/i, /dashboard/i, /tableau/i, /power bi/i] },
  { id: "insight-synthesis", label: "Insight synthesis", category: "Analysis", patterns: [/synthesi/i, /combined findings/i, /translated\s+.*insight/i, /identified\s+.*insight/i] },
  { id: "causal-evaluation", label: "Causal evaluation", category: "Analysis", patterns: [/causal evaluat/i, /causal inference/i, /impact evaluat/i, /randomi[sz]ed control/i] },
  { id: "market-sizing", label: "Market sizing", category: "Analysis", patterns: [/market siz/i, /total addressable market/i, /tam analysis/i] },
  { id: "financial-analysis", label: "Financial analysis", category: "Analysis", patterns: [/financial analys/i, /financial model/i, /business case/i, /revenue model/i] },
  { id: "client-presentation", label: "Client presentations", category: "Communication", patterns: [/presented\s+.*client/i, /client presentation/i, /presented findings/i, /presented recommendations/i] },
  { id: "client-communication", label: "Client communication", category: "Communication", patterns: [/client communication/i, /work(?:ed|ing)?\s+with\s+.*clients?/i, /advised clients/i, /client-facing/i] },
  { id: "stakeholder-communication", label: "Stakeholder communication", category: "Communication", patterns: [/stakeholder/i, /cross-functional/i, /aligned\s+.*team/i, /communicated\s+.*team/i] },
  { id: "report-writing", label: "Report and recommendation writing", category: "Communication", patterns: [/wrote\s+.*report/i, /creat(?:e|ed|ing)\s+.*report/i, /report writing/i, /recommendation report/i, /research report/i] },
  { id: "facilitation", label: "Workshop and meeting facilitation", category: "Communication", patterns: [/facilitat/i, /workshop/i, /moderated/i] },
  { id: "project-coordination", label: "Project coordination", category: "Execution", patterns: [/project coordinat/i, /programme coordinat/i, /program coordinat/i, /managed\s+.*project/i, /project plan/i] },
  { id: "process-improvement", label: "Process improvement", category: "Execution", patterns: [/process improvement/i, /improved\s+.*process/i, /workflow improvement/i, /operational improvement/i] },
  { id: "product-delivery", label: "Product delivery and iteration", category: "Execution", patterns: [/product delivery/i, /shipped\s+.*product/i, /product iteration/i, /release plan/i] },
  { id: "programming", label: "Programming and data tooling", category: "Execution", patterns: [/python/i, /sql/i, /javascript/i, /programming/i, /software development/i] },
  { id: "problem-framing", label: "Problem framing", category: "Product & Strategy", patterns: [/problem fram/i, /defined\s+.*problem/i, /structured\s+.*problem/i, /problem statement/i] },
  { id: "product-prioritisation", label: "Product prioritisation", category: "Product & Strategy", patterns: [/product priorit/i, /roadmap priorit/i, /prioritised\s+.*feature/i, /prioritized\s+.*feature/i] },
  { id: "strategic-recommendations", label: "Strategic recommendations", category: "Product & Strategy", patterns: [/strategic recommendation/i, /strategy recommendation/i, /recommended\s+.*strategy/i, /business recommendation/i] },
  { id: "product-strategy", label: "Product strategy", category: "Product & Strategy", patterns: [/product strategy/i, /product vision/i, /product roadmap/i] },
  { id: "opportunity-sizing", label: "Opportunity sizing", category: "Product & Strategy", patterns: [/opportunity siz/i, /estimated\s+.*opportunity/i, /business opportunity/i] },
  { id: "experimentation", label: "Experiment design and iteration", category: "Product & Strategy", patterns: [/experiment design/i, /designed\s+.*experiment/i, /a\/b test/i, /hypothesis test/i] },
  { id: "intervention-design", label: "Behavioural intervention design", category: "Product & Strategy", patterns: [/intervention design/i, /designed\s+.*intervention/i, /behavioural intervention/i, /behavioral intervention/i] },
  { id: "growth-strategy", label: "Growth strategy", category: "Product & Strategy", patterns: [/growth strategy/i, /acquisition strategy/i, /activation strategy/i, /growth initiative/i] },
  { id: "technical-tradeoffs", label: "Technical trade-off decisions", category: "Product & Strategy", patterns: [/technical trade.?off/i, /technical constraint/i, /engineering constraint/i] },
  { id: "engineering-collaboration", label: "Working with engineering", category: "Execution", patterns: [/worked with engineering/i, /engineering team/i, /software engineer/i, /developer collaboration/i] },
];

export function getActivityDefinition(id: string) {
  return activityCatalog.find((activity) => activity.id === id);
}

export function makeCustomActivityId(label: string) {
  return `custom-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "activity"}`;
}
