// Categories are navigation aids for the review screen. They are not career
// values, traits, or fit dimensions.
export type ActivityCategory = "Research" | "Analysis" | "Communication" | "Execution" | "Planning & Design" | "Product & Strategy" | "Written Work" | "Other";

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
  { id: "behavioural-analysis", label: "Behavioural analysis", category: "Analysis", patterns: [/behavioural analys/i, /behavioral analys/i, /decision pattern/i, /behavioural insight/i, /behavioral insight/i] },
  { id: "behavioural-hypothesis", label: "Behavioural hypothesis development", category: "Research", patterns: [/behavioural hypothes/i, /behavioral hypothes/i, /behavioural mechanism/i, /behavioral mechanism/i] },
  { id: "survey-design", label: "Survey design", category: "Research", patterns: [/survey design/i, /designed\s+.*survey/i, /questionnaire design/i] },
  { id: "quantitative-data-analysis", label: "Quantitative data analysis", category: "Analysis", patterns: [/quantitative analys/i, /data analys/i, /analy[sz](?:e|ed|ing)\s+.*data/i, /statistical analys/i, /survey data/i] },
  { id: "qualitative-analysis", label: "Qualitative analysis", category: "Analysis", patterns: [/qualitative analys/i, /qualitative\s+(?:data\s+)?analys/i, /thematic analys/i, /coded\s+interview/i] },
  { id: "qualitative-research", label: "Qualitative research", category: "Research", patterns: [/qualitative research/i, /in-depth interview/i, /\bidi\b/i, /focus group/i] },
  { id: "interviewing", label: "User, customer and stakeholder interviews", category: "Research", patterns: [/conduct(?:ed|ing)?\s+.*interview/i, /in-depth interview/i, /\bidi\b/i, /stakeholder interview/i] },
  { id: "metrics-analysis", label: "Metrics and performance analysis", category: "Analysis", patterns: [/product metric/i, /performance metric/i, /funnel/i, /retention/i, /conversion/i, /kpi/i] },
  { id: "data-modelling", label: "Statistical and predictive modelling", category: "Analysis", patterns: [/predictive model/i, /machine learning/i, /regression/i, /statistical model/i] },
  { id: "data-visualisation", label: "Data visualisation", category: "Analysis", patterns: [/data visuali/i, /dashboard/i, /tableau/i, /power bi/i] },
  { id: "insight-synthesis", label: "Insight synthesis", category: "Analysis", patterns: [/synthesi/i, /combined findings/i, /translated\s+.*insight/i, /identified\s+.*insight/i] },
  { id: "causal-evaluation", label: "Causal evaluation", category: "Analysis", patterns: [/causal evaluat/i, /causal inference/i, /impact evaluat/i, /randomi[sz]ed control/i] },
  { id: "market-sizing", label: "Market sizing", category: "Analysis", patterns: [/market siz/i, /total addressable market/i, /tam analysis/i] },
  { id: "financial-analysis", label: "Financial analysis", category: "Analysis", patterns: [/financial analys/i, /financial model/i, /business case/i, /revenue model/i] },
  { id: "client-presentation", label: "Client presentations", category: "Communication", patterns: [/presented\s+.*client/i, /client presentation/i, /presented findings/i, /presented recommendations/i] },
  { id: "stakeholder-communication", label: "Stakeholder and client communication", category: "Communication", patterns: [/client communication/i, /work(?:ed|ing)?\s+with\s+.*clients?/i, /advised clients/i, /client-facing/i, /stakeholder/i, /cross-functional/i, /aligned\s+.*team/i, /communicated\s+.*team/i, /liais(?:e|ed|ing)/i, /government authorit/i, /external partner/i] },
  { id: "programme-design", label: "Programme design", category: "Planning & Design", patterns: [/program(?:me)? development/i, /design(?:ed|ing)?\s+.*program(?:me)?/i, /course design/i, /learning design/i] },
  { id: "programme-implementation", label: "Programme implementation", category: "Execution", patterns: [/program(?:me)?\s+(?:implementation|delivery)/i, /implement(?:ed|ing)?\s+.*program(?:me)?/i, /deliver(?:ed|ing)?\s+.*program(?:me)?/i] },
  { id: "programme-evaluation", label: "Programme evaluation", category: "Analysis", patterns: [/program(?:me)? evaluation/i, /evaluat(?:e|ed|ing)\s+.*program(?:me)?/i] },
  { id: "product-launch-planning", label: "Product launch planning", category: "Product & Strategy", patterns: [/product launch/i, /go-to-market launch/i, /launch toolkit/i] },
  { id: "enablement-materials", label: "Enablement and decision materials", category: "Written Work", patterns: [/launch toolkit/i, /toolkit/i, /one[- ]pager/i, /recommendation brief/i] },
  { id: "learning-design", label: "Learning and onboarding design", category: "Planning & Design", patterns: [/onboarding course/i, /learning strategy/i, /learning process/i, /learning programme/i, /learning program/i] },
  { id: "partnership-development", label: "Partnership development", category: "Product & Strategy", patterns: [/partnership/i, /partner strategy/i, /partner development/i] },
  { id: "report-writing", label: "Report and recommendation writing", category: "Communication", patterns: [/wrote\s+.*report/i, /writ(?:e|ing|ten)\s+.*report/i, /creat(?:e|ed|ing)\s+.*report/i, /report writing/i, /recommendation report/i, /research report/i, /strategic report/i] },
  { id: "proposal-development", label: "Proposal development", category: "Product & Strategy", patterns: [/proposals?/i, /grant application/i, /business case/i] },
  { id: "persuasive-writing", label: "Persuasive business writing", category: "Written Work", patterns: [/grant application/i, /persuasive writ/i, /proposal writ/i] },
  { id: "needs-assessment", label: "Needs assessment", category: "Research", patterns: [/needs assessment/i, /understand(?:ing)?\s+.*(?:community|customer|user|organisation|organization)(?:s['â€™]|['â€™]s|s)?\s+(?:needs?|problems?|pain points?)/i, /(?:customer|user)(?:s['â€™]|['â€™]s|s)?\s+(?:needs?|problems?|pain points?)\s+(?:identification|discovery|assessment)/i] },
  { id: "facilitation", label: "Workshop and meeting facilitation", category: "Communication", patterns: [/facilitat/i, /workshop/i, /moderated/i] },
  { id: "project-coordination", label: "Project coordination", category: "Execution", patterns: [/project coordinat/i, /programme coordinat/i, /program coordinat/i, /managed\s+.*project/i, /project plan/i] },
  {
    id: "process-improvement",
    label: "Process optimisation",
    category: "Execution",
    patterns: [
      /process (?:improvement|optimisation|optimization)/i,
      /workflow (?:improvement|optimisation|optimization)/i,
      /operational (?:improvement|efficiency|optimisation|optimization)/i,
      /(?:improv(?:e|ed|ing)|enhanc(?:e|ed|ing)|optimis(?:e|ed|ing)|optimiz(?:e|ed|ing)|streamlin(?:e|ed|ing)|simplif(?:y|ied|ying)|automat(?:e|ed|ing))\b.{0,120}\b(?:process(?:es|ing)?|workflow(?:s)?|procedure(?:s)?|operations?|case[- ]processing|reporting)\b/i,
      /\b(?:process(?:es|ing)?|workflow(?:s)?|procedure(?:s)?|operations?|case[- ]processing|reporting)\b.{0,120}\b(?:improv(?:e|ed|ing)|enhanc(?:e|ed|ing)|optimis(?:e|ed|ing)|optimiz(?:e|ed|ing)|streamlin(?:e|ed|ing)|simplif(?:y|ied|ying)|automat(?:e|ed|ing))\b/i,
      /(?:improv(?:e|ed|ing)|enhanc(?:e|ed|ing)|increas(?:e|ed|ing))\b.{0,80}\b(?:efficiency|throughput|turnaround|cycle time)\b.{0,120}\b(?:process(?:es|ing)?|workflow(?:s)?|procedure(?:s)?|operations?|case[- ]processing|reporting)\b/i,
    ],
  },
  { id: "product-delivery", label: "Product delivery and iteration", category: "Execution", patterns: [/product delivery/i, /shipped\s+.*product/i, /product iteration/i, /release plan/i] },
  { id: "programming", label: "Programming and data tooling", category: "Analysis", patterns: [/python/i, /sql/i, /javascript/i, /programming/i, /software development/i] },
  { id: "problem-framing", label: "Problem framing", category: "Product & Strategy", patterns: [/problem fram/i, /defined\s+.*problem/i, /structured\s+.*problem/i, /problem statement/i, /(?:customer|user)(?:s['â€™]|['â€™]s|s)?\s+(?:needs?|problems?|pain points?)\s+(?:identification|discovery)/i] },
  { id: "product-prioritisation", label: "Product prioritisation", category: "Product & Strategy", patterns: [/product priorit/i, /roadmap priorit/i, /prioritised\s+.*feature/i, /prioritized\s+.*feature/i] },
  { id: "strategic-recommendations", label: "Strategic recommendations", category: "Product & Strategy", patterns: [/strategic recommendation/i, /strategy recommendation/i, /recommended\s+.*strategy/i, /business recommendation/i] },
  { id: "product-strategy", label: "Product strategy", category: "Product & Strategy", patterns: [/product strategy/i, /product vision/i, /product roadmap/i] },
  { id: "strategy-development", label: "Strategy development", category: "Product & Strategy", patterns: [/strategy development/i, /develop(?:ed|ing)?\s+.*strategy/i, /strategy roadmap/i, /learning strategy/i] },
  { id: "roadmap-planning", label: "Roadmap planning", category: "Planning & Design", patterns: [/roadmap/i] },
  { id: "process-design", label: "Process design", category: "Planning & Design", patterns: [/process design/i, /systemis(?:e|ed|ing)/i, /systemiz(?:e|ed|ing)/i] },
  { id: "requirements-clarification", label: "Requirements clarification", category: "Planning & Design", patterns: [/requirements?/i, /clarif(?:y|ied|ying)\s+.*needs/i] },
  { id: "user-story-development", label: "Creating user stories", category: "Written Work", patterns: [/user stor(?:y|ies)/i] },
  { id: "structured-problem-solving", label: "Structured problem-solving", category: "Analysis", patterns: [/structured framework/i, /framework\s+to\s+diagnos/i, /structured problem/i] },
  { id: "organisational-analysis", label: "Organisational analysis", category: "Analysis", patterns: [/organi[sz]ational problem/i, /organi[sz]ational analys/i, /organi[sz]ational diagnos/i] },
  { id: "stakeholder-alignment", label: "Stakeholder alignment", category: "Communication", patterns: [/stakeholder alignment/i, /align(?:ed|ing)?\s+.*stakeholder/i, /align(?:ed|ing)?\s+.*team/i] },
  { id: "success-measures", label: "Defining success measures", category: "Analysis", patterns: [/success metric/i, /success measure/i, /measure(?:d|ment)?\s+.*success/i] },
  { id: "opportunity-sizing", label: "Opportunity sizing", category: "Product & Strategy", patterns: [/opportunity siz/i, /estimated\s+.*opportunity/i, /business opportunity/i] },
  { id: "experimentation", label: "Experiment design and iteration", category: "Product & Strategy", patterns: [/experiment design/i, /designed\s+.*experiment/i, /a\/b test/i, /hypothesis test/i] },
  { id: "intervention-design", label: "Behavioural intervention design", category: "Product & Strategy", patterns: [/intervention design/i, /designed\s+.*intervention/i, /behavioural intervention/i, /behavioral intervention/i] },
  { id: "growth-strategy", label: "Growth strategy", category: "Product & Strategy", patterns: [/growth strategy/i, /acquisition strategy/i, /activation strategy/i, /growth initiative/i] },
  { id: "technical-tradeoffs", label: "Technical trade-off decisions", category: "Product & Strategy", patterns: [/technical trade.?off/i, /technical constraint/i, /engineering constraint/i] },
  { id: "engineering-collaboration", label: "Working with engineering", category: "Execution", patterns: [/worked with engineering/i, /engineering team/i, /software engineer/i, /developer collaboration/i] },
  // Building, scoping and client-brief work. A single CV sentence can match
  // several of these: the catalogue is applied to the whole text, so one
  // achievement breaks into the activities it actually contains.
  { id: "prototyping-building", label: "Prototyping and building", category: "Execution", patterns: [/prototype/i, /\bmvp\b/i, /demo[- ]ready/i, /(?:built|build|building|shipped|shipping)\b[^.]{0,40}\b(?:app|application|prototype|demo|feature|website|platform)\b/i, /vibe[- ]cod/i] },
  { id: "scoping-under-constraint", label: "Scoping work under constraint", category: "Product & Strategy", patterns: [/scoping\s+a/i, /scoped\s+(?:a|the)/i, /time[- ]?boxed/i, /in (?:one|a single|1) (?:day|week|sprint)/i, /within (?:a|one) (?:day|week|sprint)/i, /from brief to/i] },
  { id: "client-brief-work", label: "Working to a client brief", category: "Product & Strategy", patterns: [/(?:live|real|real[- ]world|client|industry)\s+brief/i, /against a .{0,30}brief/i, /brief from a/i] },
];

export function getActivityDefinition(id: string) {
  const canonicalId = id === "client-communication" ? "stakeholder-communication" : id;
  return activityCatalog.find((activity) => activity.id === canonicalId);
}

export function makeCustomActivityId(label: string) {
  return `custom-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "activity"}`;
}
