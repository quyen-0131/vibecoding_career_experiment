import type { AttemptEvaluation, CriterionEvaluation, CriterionRating, GapType, LearningChange, RevisionEvaluation } from "@/types/experiment";

const ratings: CriterionRating[] = ["strong", "developing", "emerging", "not_enough_evidence"];
const gapTypes: GapType[] = ["knowledge", "reasoning", "communication", "insufficient_evidence", "none"];
const learningChanges: LearningChange[] = ["clear_improvement", "some_improvement", "little_visible_change", "not_enough_evidence"];

const criterionProperties = {
  criterion: { type: "string" },
  rating: { type: "string", enum: ratings },
  gapType: { type: "string", enum: gapTypes },
  evidence: { type: "string" },
  feedback: { type: "string" },
} as const;

export const initialEvaluationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    criteria: { type: "array", items: { type: "object", additionalProperties: false, properties: criterionProperties, required: Object.keys(criterionProperties) } },
    strongestEvidence: { type: ["string", "null"] },
    revisionTarget: { type: "string" },
    instruction: { type: ["string", "null"] },
    revisionPrompt: { type: "string" },
  },
  required: ["criteria", "strongestEvidence", "revisionTarget", "instruction", "revisionPrompt"],
} as const;

export const revisionEvaluationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    criterion: { type: "object", additionalProperties: false, properties: criterionProperties, required: Object.keys(criterionProperties) },
    learningResponse: {
      type: "object",
      additionalProperties: false,
      properties: { category: { type: "string", enum: learningChanges }, explanation: { type: "string" } },
      required: ["category", "explanation"],
    },
  },
  required: ["criterion", "learningResponse"],
} as const;

export function createInitialEvaluationJsonSchema(rubricLabels: string[]) {
  return {
    ...initialEvaluationJsonSchema,
    properties: {
      ...initialEvaluationJsonSchema.properties,
      revisionTarget: { type: "string", enum: rubricLabels },
    },
  };
}

export function createRevisionEvaluationJsonSchema(revisionTarget: string) {
  return {
    ...revisionEvaluationJsonSchema,
    properties: {
      ...revisionEvaluationJsonSchema.properties,
      criterion: {
        ...revisionEvaluationJsonSchema.properties.criterion,
        properties: {
          ...criterionProperties,
          criterion: { type: "string", enum: [revisionTarget] },
        },
      },
    },
  };
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid evaluator field: ${field}`);
  return value.trim();
}

function parseCriterion(value: unknown): CriterionEvaluation {
  if (!isRecord(value)) throw new Error("Invalid evaluator criterion");
  const rating = requiredString(value.rating, "rating") as CriterionRating;
  const gapType = requiredString(value.gapType, "gapType") as GapType;
  if (!ratings.includes(rating) || !gapTypes.includes(gapType)) throw new Error("Invalid evaluator rating or gap type");
  return {
    criterion: requiredString(value.criterion, "criterion"),
    rating,
    gapType,
    evidence: requiredString(value.evidence, "evidence"),
    feedback: requiredString(value.feedback, "feedback"),
  };
}

export function parseAttemptEvaluation(value: unknown): AttemptEvaluation {
  if (!isRecord(value) || !Array.isArray(value.criteria) || value.criteria.length === 0) throw new Error("Invalid initial evaluation");
  if (value.strongestEvidence !== null && typeof value.strongestEvidence !== "string") throw new Error("Invalid strongest evidence");
  if (value.instruction !== null && typeof value.instruction !== "string") throw new Error("Invalid evaluator instruction");
  return {
    criteria: value.criteria.map(parseCriterion),
    strongestEvidence: value.strongestEvidence === null ? null : value.strongestEvidence.trim(),
    revisionTarget: requiredString(value.revisionTarget, "revisionTarget"),
    instruction: value.instruction === null ? null : value.instruction.trim(),
    revisionPrompt: requiredString(value.revisionPrompt, "revisionPrompt"),
  };
}

export function parseRevisionEvaluation(value: unknown): RevisionEvaluation {
  if (!isRecord(value) || !isRecord(value.learningResponse)) throw new Error("Invalid revision evaluation");
  const category = requiredString(value.learningResponse.category, "learningResponse.category") as LearningChange;
  if (!learningChanges.includes(category)) throw new Error("Invalid learning response category");
  return {
    criterion: parseCriterion(value.criterion),
    learningResponse: { category, explanation: requiredString(value.learningResponse.explanation, "learningResponse.explanation") },
  };
}
