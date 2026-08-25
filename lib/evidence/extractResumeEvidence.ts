import type { ResumeEvidence } from "@/types/skillEvidence";

const actionWords = [
  "analyse", "analyze", "assess", "build", "code", "communicate", "conduct",
  "coordinate", "create", "define", "deliver", "design", "develop", "evaluate",
  "enhance", "facilitate", "gather", "identify", "implement", "improve",
  "interview", "launch", "lead", "liaise", "manage", "measure", "monitor",
  "optimise", "optimize", "plan", "prepare", "present", "recommend", "research",
  "review", "streamline", "synthesise", "synthesize", "test", "track", "write",
];

const stakeholderWords = [
  "client", "customer", "government", "authority", "partner", "stakeholder",
  "vendor", "user", "participant", "team", "leadership", "community",
];

const metricPattern = /(?:\b\d+(?:\.\d+)?%|\b\d[\d,]*(?:\+)?\b|\b(?:doubled|tripled|halved)\b)/gi;
const outcomeCue = /\b(?:resulting in|leading to|which improved|to improve|increasing|reducing|saving|achieving|so that)\b/i;
const methodCue = /\b(?:using|through|via|by applying|with)\b/gi;

function stableId(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function firstMatchingWord(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.find((word) => new RegExp(`\\b${word}(?:d|ed|ing|s)?\\b`, "i").test(lower));
}

export function extractResumeEvidence(
  rawText: string,
  source: { experienceId?: string; title?: string; organisation?: string } = {},
): ResumeEvidence {
  const text = rawText.replace(/^[\s\u2022*-]+/, "").replace(/\s+/g, " ").trim();
  const action = firstMatchingWord(text, actionWords);
  const stakeholders = stakeholderWords.filter((word) =>
    new RegExp(`\\b${word}s?\\b`, "i").test(text),
  );
  const metrics = [...text.matchAll(metricPattern)].map((match) => match[0]);
  const outcomeMatch = text.match(outcomeCue);
  const methodMatches = [...text.matchAll(methodCue)];
  const methods = methodMatches
    .map((match) => text.slice((match.index ?? 0) + match[0].length).split(/[.;]/)[0].trim())
    .filter(Boolean)
    .slice(0, 2);
  const outcome = outcomeMatch
    ? text.slice((outcomeMatch.index ?? 0) + outcomeMatch[0].length).split(/[.;]/)[0].trim()
    : undefined;
  const object = action
    ? text.slice(text.toLowerCase().indexOf(action) + action.length).split(/\b(?:using|through|via|resulting in|leading to|to improve)\b/i)[0].trim()
    : text;
  const strength =
    action && object && (metrics.length || outcome)
      ? "strong"
      : action && object
        ? "moderate"
        : "limited";

  return {
    id: `resume-evidence-${stableId([source.experienceId, text].filter(Boolean).join("|"))}`,
    rawText: text,
    action,
    object: object || undefined,
    methods,
    stakeholders,
    outcome,
    metrics,
    sourceExperienceId: source.experienceId,
    sourceExperienceTitle: source.title,
    sourceOrganisation: source.organisation,
    strength,
  };
}
