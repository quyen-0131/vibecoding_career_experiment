import type { DetectedExperience } from "@/types/prototype";

export const sampleCvText = `
EXPERIENCE
Decision Lab | Consultant | Jan 2024 - Present
Designed qualitative and quantitative behavioural research for public-sector clients. Analysed survey and behavioural data, synthesised findings, presented recommendations and managed client stakeholders.

Trulioo | Product Strategy Intern | May 2023 - Aug 2023
Analysed product funnels and customer behaviour using SQL. Interviewed customers, worked with product and engineering stakeholders, and recommended product opportunities.

UBC Behavioural Science Lab | Research Assistant | Sep 2022 - Apr 2023
Designed surveys and behavioural experiments. Analysed experimental data, conducted literature reviews and wrote a research report.

Student Impact Consulting | Project Lead | Jan 2022 - Apr 2022
Coordinated a five-person consulting project, conducted market research, facilitated client workshops and presented strategic recommendations.

Campus Food Access Initiative | Volunteer Programme Coordinator | Sep 2021 - Dec 2021
Coordinated volunteers, improved programme processes and communicated with university stakeholders.

AWARDS
Future Leaders Scholarship | Sep 2023

PROGRAMMES
Career Design Seminar | Mar 2023
`;

export const sampleExperiences: DetectedExperience[] = [
  {
    id: "sample-decision-lab",
    title: "Consultant",
    organisation: "Decision Lab",
    type: "work",
    description: "Designed qualitative and quantitative behavioural research for public-sector clients. Analysed survey and behavioural data, synthesised findings, presented recommendations and managed client stakeholders.",
    activities: [
      { id: "sample-dl-research", canonicalId: "research-design", label: "Research design", category: "Research", supportingText: "Designed qualitative and quantitative behavioural research" },
      { id: "sample-dl-analysis", canonicalId: "quantitative-data-analysis", label: "Quantitative data analysis", category: "Analysis", supportingText: "Analysed survey and behavioural data" },
      { id: "sample-dl-behaviour", canonicalId: "behavioural-analysis", label: "Behavioural analysis", category: "Research", supportingText: "Analysed behavioural data" },
      { id: "sample-dl-synthesis", canonicalId: "insight-synthesis", label: "Insight synthesis", category: "Analysis", supportingText: "Synthesised findings" },
      { id: "sample-dl-presentation", canonicalId: "client-presentation", label: "Client presentations", category: "Communication", supportingText: "Presented recommendations" },
      { id: "sample-dl-client", canonicalId: "client-communication", label: "Client communication", category: "Communication", supportingText: "Managed client stakeholders" },
    ],
  },
  {
    id: "sample-trulioo",
    title: "Product Strategy Intern",
    organisation: "Trulioo",
    type: "internship",
    description: "Analysed product funnels and customer behaviour using SQL. Interviewed customers, worked with product and engineering stakeholders, and recommended product opportunities.",
    activities: [
      { id: "sample-trulioo-metrics", canonicalId: "metrics-analysis", label: "Metrics and performance analysis", category: "Analysis", supportingText: "Analysed product funnels" },
      { id: "sample-trulioo-analysis", canonicalId: "quantitative-data-analysis", label: "Quantitative data analysis", category: "Analysis", supportingText: "Analysed customer behaviour using SQL" },
      { id: "sample-trulioo-programming", canonicalId: "programming", label: "Programming and data tooling", category: "Execution", supportingText: "Using SQL" },
      { id: "sample-trulioo-research", canonicalId: "user-research", label: "User and customer research", category: "Research", supportingText: "Interviewed customers" },
      { id: "sample-trulioo-stakeholders", canonicalId: "stakeholder-communication", label: "Stakeholder communication", category: "Communication", supportingText: "Worked with product stakeholders" },
      { id: "sample-trulioo-engineering", canonicalId: "engineering-collaboration", label: "Working with engineering", category: "Execution", supportingText: "Worked with engineering stakeholders" },
      { id: "sample-trulioo-strategy", canonicalId: "product-strategy", label: "Product strategy", category: "Product & Strategy", supportingText: "Recommended product opportunities" },
    ],
  },
  {
    id: "sample-ubc",
    title: "Research Assistant",
    organisation: "UBC Behavioural Science Lab",
    type: "work",
    description: "Designed surveys and behavioural experiments. Analysed experimental data, conducted literature reviews and wrote a research report.",
    activities: [
      { id: "sample-ubc-survey", canonicalId: "survey-design", label: "Survey design", category: "Research", supportingText: "Designed surveys" },
      { id: "sample-ubc-experiment", canonicalId: "experimentation", label: "Experiment design and iteration", category: "Product & Strategy", supportingText: "Designed behavioural experiments" },
      { id: "sample-ubc-analysis", canonicalId: "quantitative-data-analysis", label: "Quantitative data analysis", category: "Analysis", supportingText: "Analysed experimental data" },
      { id: "sample-ubc-report", canonicalId: "report-writing", label: "Report and recommendation writing", category: "Communication", supportingText: "Wrote a research report" },
    ],
  },
  {
    id: "sample-consulting",
    title: "Project Lead",
    organisation: "Student Impact Consulting",
    type: "project",
    description: "Coordinated a five-person consulting project, conducted market research, facilitated client workshops and presented strategic recommendations.",
    activities: [
      { id: "sample-consulting-project", canonicalId: "project-coordination", label: "Project coordination", category: "Execution", supportingText: "Coordinated a five-person consulting project" },
      { id: "sample-consulting-market", canonicalId: "market-research", label: "Market research", category: "Research", supportingText: "Conducted market research" },
      { id: "sample-consulting-facilitation", canonicalId: "facilitation", label: "Workshop and meeting facilitation", category: "Communication", supportingText: "Facilitated client workshops" },
      { id: "sample-consulting-recommendations", canonicalId: "strategic-recommendations", label: "Strategic recommendations", category: "Product & Strategy", supportingText: "Presented strategic recommendations" },
      { id: "sample-consulting-presentation", canonicalId: "client-presentation", label: "Client presentations", category: "Communication", supportingText: "Presented strategic recommendations" },
    ],
  },
  {
    id: "sample-volunteer",
    title: "Volunteer Programme Coordinator",
    organisation: "Campus Food Access Initiative",
    type: "volunteer",
    description: "Coordinated volunteers, improved programme processes and communicated with university stakeholders.",
    activities: [
      { id: "sample-volunteer-project", canonicalId: "project-coordination", label: "Project coordination", category: "Execution", supportingText: "Coordinated volunteers" },
      { id: "sample-volunteer-process", canonicalId: "process-improvement", label: "Process improvement", category: "Execution", supportingText: "Improved programme processes" },
      { id: "sample-volunteer-stakeholders", canonicalId: "stakeholder-communication", label: "Stakeholder communication", category: "Communication", supportingText: "Communicated with university stakeholders" },
    ],
  },
];
