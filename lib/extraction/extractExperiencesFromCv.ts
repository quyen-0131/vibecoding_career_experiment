import type { DetectedActivity, DetectedExperience } from "@/types/prototype";

type ActivityRule = { activityId: string; label: string; patterns: RegExp[] };

const activityRules: ActivityRule[] = [
  { activityId: "quantitative-data-analysis", label: "Analysing quantitative data", patterns: [/quantitative/i, /data analys/i, /analytics/i, /statistic/i] },
  { activityId: "research-design", label: "Designing research", patterns: [/research design/i, /designed research/i, /qualitative research/i, /experiment/i] },
  { activityId: "user-research", label: "Researching users", patterns: [/user research/i, /customer research/i, /interview/i] },
  { activityId: "insight-synthesis", label: "Synthesising insights", patterns: [/synthesi/i, /insight/i, /findings/i] },
  { activityId: "report-creation", label: "Creating reports", patterns: [/report/i, /written recommendation/i, /deck/i] },
  { activityId: "client-communication", label: "Communicating with clients", patterns: [/client/i, /presented/i, /presentation/i] },
  { activityId: "stakeholder-management", label: "Managing stakeholders", patterns: [/stakeholder/i, /cross-functional/i, /collaborat/i] },
];

function makeActivity(rule: ActivityRule, index: number): DetectedActivity {
  return { id: `detected-${rule.activityId}-${index}`, activityId: rule.activityId, label: rule.label, confirmed: true };
}

export function extractExperiencesFromCv(cvText: string): DetectedExperience[] {
  // Product-discovery placeholder: replace this deterministic rule set with an
  // AI extraction adapter later. The UI consumes DetectedExperience objects, so
  // changing the extractor will not require rewriting the review screens.
  const detected = activityRules.filter((rule) => rule.patterns.some((pattern) => pattern.test(cvText)));
  const activities = (detected.length > 0 ? detected : activityRules.slice(0, 5)).map(makeActivity);

  const firstUsefulLine = cvText.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? "CV experience";
  const [organisation, title] = firstUsefulLine.split(/\s+[—–-]\s+/, 2);

  return [{
    id: "detected-experience-1",
    organisation: title ? organisation : "From your CV",
    title: title ?? firstUsefulLine.slice(0, 60),
    activities,
  }];
}
