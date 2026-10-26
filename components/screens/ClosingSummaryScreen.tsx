import { preferenceLabels, roleTrials, workReactionOptions } from "@/data/experiments";
import { getCareerModel } from "@/data/careers";
import { buildStartingEvidence } from "@/lib/evidence/buildStartingEvidence";
import { interpretComparisonReflection } from "@/lib/experiments/interpretReflection";
import { getExperimentQuestionText, getTaskSequence } from "@/lib/experiments/experimentState";
import type { ActivityEvidenceResponse, NormalizedActivity } from "@/types/prototype";
import type { CareerExperimentState, CareerTaskId } from "@/types/experiment";

type DirectionalSignal = { heading: string; explanation: string };

type StartingRecap = {
  careerTitle: string;
  existing: string[];
  unknown: string[];
};

function buildStartingRecap(
  state: CareerExperimentState,
  startingActivities: NormalizedActivity[],
  startingResponses: Record<string, ActivityEvidenceResponse>,
): StartingRecap[] {
  return state.selectedCareers.flatMap((careerId) => {
    const narrative = buildStartingEvidence(careerId, startingActivities, startingResponses);
    if (!narrative) return [];
    const existing = narrative.activityGroups
      .filter((group) => group.representedCount > 0)
      .map((group) => group.name);
    const unknown = narrative.activityGroups
      .filter((group) => group.representedCount === 0)
      .map((group) => group.name);
    return [{ careerTitle: narrative.career.title, existing, unknown }];
  });
}

export function ClosingSummaryScreen({
  state,
  directionalSignal,
  startingActivities,
  startingResponses,
  onBackToTrialSummary,
  onStartOver,
}: {
  state: CareerExperimentState;
  directionalSignal: DirectionalSignal;
  startingActivities: NormalizedActivity[];
  startingResponses: Record<string, ActivityEvidenceResponse>;
  onBackToTrialSummary: () => void;
  onStartOver: () => void;
}) {
  const testedRoles = getTaskSequence(state.mode, state.selectedCareers) as CareerTaskId[];
  const careerTitles = state.selectedCareers.map((id) => getCareerModel(id)?.title ?? id);
  const questionText = getExperimentQuestionText(state);
  const startingRecap = buildStartingRecap(state, startingActivities, startingResponses);
  const reflection = interpretComparisonReflection(state.comparisonReflection, state.selectedCareers);
  const hasStartingRecap = startingRecap.length > 0;

  return (
    <section className="screen wide-screen experiment-screen closing-summary-screen">
      <div className="eyebrow">One-page summary · evidence, not a verdict</div>
      <h1>What this career experiment found</h1>
      <p className="lead compact">
        A single-screen recap of what {careerTitles[0]} and {careerTitles[1]} were compared on,
        what the starting evidence already showed, and what the supported work trial added.
      </p>
      {state.isDevelopmentPreview && (
        <p className="experiment-note">
          Sample run: the trial answers and reactions below use clearly labelled sample data,
          not a real person&apos;s responses.
        </p>
      )}

      <div className="closing-summary-sections">
        <section className="closing-summary-block">
          <span className="closing-summary-kicker">The question tested</span>
          <h2>{questionText}</h2>
          <p>Compared across two roles: {careerTitles[0]} and {careerTitles[1]}.</p>
        </section>

        {hasStartingRecap && (
          <section className="closing-summary-block">
            <span className="closing-summary-kicker">Where the journey started</span>
            <p>What past experience could and could not already tell us, before any new trial.</p>
            <div className="closing-recap-grid">
              {startingRecap.map((recap) => (
                <article key={recap.careerTitle}>
                  <h3>{recap.careerTitle}</h3>
                  <div>
                    <strong>Existing evidence</strong>
                    {recap.existing.length ? (
                      <ul>{recap.existing.map((name) => <li key={name}>{name}</li>)}</ul>
                    ) : (
                      <p>No activity groups were already covered by past experience.</p>
                    )}
                  </div>
                  <div>
                    <strong>Unknown at the start</strong>
                    {recap.unknown.length ? (
                      <ul>{recap.unknown.map((name) => <li key={name}>{name}</li>)}</ul>
                    ) : (
                      <p>Past experience touched every mapped activity group.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="closing-summary-block">
          <span className="closing-summary-kicker">What the work trial revealed</span>
          <div className="closing-recap-grid">
            {testedRoles.map((role) => {
              const trial = state.roleTrials[role];
              const definition = roleTrials[role];
              if (!trial || !definition) return null;
              const reactions = trial.workReactions.flatMap((reactionId) => {
                const label = workReactionOptions.find((option) => option.id === reactionId)?.label;
                return label ? [label] : [];
              });
              return (
                <article key={role}>
                  <h3>{definition.roleTitle}</h3>
                  <p>
                    <strong>After support and revision: </strong>
                    {trial.preferenceEvidence
                      ? `“${preferenceLabels[trial.preferenceEvidence.preference]}” for work like this.`
                      : "no preference recorded."}
                  </p>
                  {reactions.length > 0 && <ul>{reactions.map((reaction) => <li key={reaction}>{reaction}</li>)}</ul>}
                  <p>
                    {trial.evidenceSufficiency === "need_more"
                      ? "Said they still need more experience before judging the wider role."
                      : trial.evidenceSufficiency === "enough"
                        ? "Said this was enough evidence for a starting view."
                        : "Evidence certainty was not recorded."}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="directional-signal">
          <span>The direction, hedged</span>
          <h2>{directionalSignal.heading}</h2>
          <p>{directionalSignal.explanation}</p>
          <small>
            This is a direction from one supported exercise, not a conclusion about the whole
            career and not a fit score.
          </small>
        </section>

        <section className="closing-summary-block">
          <span className="closing-summary-kicker">What remains unknown</span>
          <div className="closing-recap-grid">
            {testedRoles.map((role) => {
              const definition = roleTrials[role];
              if (!definition) return null;
              return (
                <article key={role}>
                  <h3>{definition.roleTitle}</h3>
                  <ul>{definition.remainingUnknowns.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className="closing-summary-block closing-next-block">
          <span className="closing-summary-kicker">What I&apos;d test next</span>
          {reflection && <p><strong>From the reflection:</strong> {reflection.nextQuestion}</p>}
          <ul>
            {state.selectedCareers.map((careerId) => {
              const career = getCareerModel(careerId);
              if (!career) return null;
              return <li key={careerId}><strong>{career.title}:</strong> {career.uncertainty.question}</li>;
            })}
          </ul>
        </section>
      </div>

      <p className="experiment-verdict">
        This is not a career recommendation. It is a record of decision-relevant evidence
        gathered so far, and the questions worth testing next.
      </p>
      <div className="actions">
        <button className="button secondary" type="button" onClick={onBackToTrialSummary}>
          Back to the trial detail
        </button>
        <button className="button primary" type="button" onClick={onStartOver}>
          Start over <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
