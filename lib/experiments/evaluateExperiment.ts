import { parseAttemptEvaluation, parseRevisionEvaluation } from "@/lib/experiments/evaluationSchema";
import type { AttemptEvaluation, EvaluationRequest, RevisionEvaluation } from "@/types/experiment";

async function requestEvaluation(request: EvaluationRequest) {
  const response = await fetch("/api/evaluate-experiment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body === "object" && body && "error" in body && typeof body.error === "string" ? body.error : "The evaluation could not be completed.";
    throw new Error(message);
  }
  if (typeof body !== "object" || !body || !("evaluation" in body)) throw new Error("The evaluator returned an incomplete response.");
  return body.evaluation;
}

export async function evaluateInitialAttempt(request: EvaluationRequest): Promise<AttemptEvaluation> {
  return parseAttemptEvaluation(await requestEvaluation({ ...request, attempt: "initial" }));
}

export async function evaluateRevision(request: EvaluationRequest): Promise<RevisionEvaluation> {
  return parseRevisionEvaluation(await requestEvaluation({ ...request, attempt: "revision" }));
}
