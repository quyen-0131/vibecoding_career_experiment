import type { DetectedExperience } from "@/types/prototype";

export const sampleCvText = `
Decision Lab — Consultant
Designed qualitative and quantitative behavioural research.
Analysed customer and experimental data to understand decision patterns.
Synthesised behavioural insights and created reports for client teams.
Presented recommendations, communicated with clients and managed stakeholders.
`;

export const sampleExperiences: DetectedExperience[] = [
  {
    id: "decision-lab-consultant",
    organisation: "Decision Lab",
    title: "Consultant",
    activities: [
      { id: "decision-lab-quant-data", activityId: "quantitative-data-analysis", label: "Analysing quantitative data", confirmed: true },
      { id: "decision-lab-research-design", activityId: "research-design", label: "Designing research", confirmed: true },
      { id: "decision-lab-insights", activityId: "insight-synthesis", label: "Synthesising behavioural insights", confirmed: true },
      { id: "decision-lab-reports", activityId: "report-creation", label: "Creating reports", confirmed: true },
      { id: "decision-lab-clients", activityId: "client-communication", label: "Communicating with clients", confirmed: true },
      { id: "decision-lab-stakeholders", activityId: "stakeholder-management", label: "Managing stakeholders", confirmed: true },
    ],
  },
];
