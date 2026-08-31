"use client";

import { useState } from "react";
import { ChoiceGroup } from "@/components/ChoiceGroup";
import {
  activityReactionLabels,
  createExperimentQuestions,
  experimentScenarios,
  getDirectComparisonChoices,
  getExperimentScenario,
  learnLoopScenario,
  learningLabels,
  preferenceLabels,
  ratingLabels,
  roleTrials,
  workReactionOptions,
} from "@/data/experiments";
import { getCareerModel, type CareerId } from "@/data/careers";
import { evaluateInitialAttempt, evaluateRevision } from "@/lib/experiments/evaluateExperiment";
import { interpretComparisonReflection } from "@/lib/experiments/interpretReflection";
import { computePreferenceFindings, selectHeadlineFinding, type PreferenceFinding } from "@/lib/evidence/preferenceShift";
import type { ContradictionCause } from "@/types/experiment";
import { buildDirection, rankUnknownsBySeparation } from "@/lib/evidence/directionRanking";
import { findCoreTensions, type CoreTension } from "@/lib/evidence/coreTension";
import type { ActivityEvidenceResponse, NormalizedActivity } from "@/types/prototype";
import {
  createInitialExperimentState,
  createNextScenarioState,
  createPostEvaluationPreviewState,
  getExperimentQuestionText,
  getNextRole,
  getTaskSequence,
  isInitialAttemptReady,
  isSupportedExperimentPair,
} from "@/lib/experiments/experimentState";
import type {
  ActivityReaction,
  CareerExperimentState,
  CareerTaskId,
  DirectComparisonChoice,
  EvidenceSufficiency,
  ExperimentPreference,
  ExperimentScenario,
  ExperimentStage,
  RoleTrialState,
  WorkReaction,
} from "@/types/experiment";

const preferenceOptions = ["more", "same", "less", "need_more_experience"] as const;
const activityOptions = ["more", "same", "less", "not_sure"] as const;
const stageLabels: Partial<Record<ExperimentStage, string>> = {
  question: "Choose a question",
  guided: "Choose the evidence",
  "scenario-choice": "Choose a case",
  scenario: "Shared scenario",
  "role-primer": "Role primer",
  "initial-attempt": "First attempt",
  evaluation: "Evidence review",
  feedback: "Targeted feedback",
  revision: "Focused revision",
  "revision-result": "Response to feedback",
  "role-reaction": "Work reaction",
  "activity-reflection": "Activity reflection",
  "comparison-reflection": "Direct comparison",
  summary: "Evidence synthesis",
};

function applyScenarioName(value: string, scenario: ExperimentScenario) {
  return value.replaceAll("LearnLoop", scenario.name);
}

function getScenarioFields(role: CareerTaskId, scenario: ExperimentScenario) {
  return roleTrials[role].fields.map((field) => ({
    ...field,
    prompt: applyScenarioName(field.prompt, scenario),
    placeholder: field.placeholder
      ? applyScenarioName(field.placeholder, scenario)
      : undefined,
  }));
}
function getScenarioContext(role: CareerTaskId, scenario: ExperimentScenario) {
  if (role === "product-manager") {
    return "You are the Product Manager responsible for deciding what " +
      scenario.name +
      " should do next. Use the case evidence to make one product decision under the stated constraint.";
  }
  if (role === "behavioural-science-consultant") {
    return "You are the Behavioural Science Consultant advising " +
      scenario.name +
      ". Explain the behaviour, propose a mechanism and design a focused test.";
  }
  return "You are the " +
    roleTrials[role].roleTitle +
    " helping " +
    scenario.name +
    " answer this question: " +
    scenario.question;
}

function StageMeta({ stage }: { stage: ExperimentStage }) {
  return <div className="experiment-stage-meta"><span>Phase 3 · Plan a career experiment</span><strong>{stageLabels[stage]}</strong></div>;
}

function QuestionScreen({ state, onChange, onBack, onContinue, onPreview, showPreview }: { state: CareerExperimentState; onChange: (state: CareerExperimentState) => void; onBack: () => void; onContinue: () => void; onPreview: () => void; showPreview: boolean }) {
  const questions = createExperimentQuestions(state.selectedCareers);
  return (
    <section className="screen wide-screen experiment-screen">
      <StageMeta stage="question" />
      <div className="eyebrow">The app designs the trial. You choose the question.</div>
      <h1>What would you like to learn next?</h1>
      <p className="lead compact">Your past experience can only tell us so much. Choose the question you want new firsthand evidence about.</p><p className="purpose-note"><strong>Why we&apos;re asking</strong><span>The app designs the experiment. You choose what you want to learn. Selecting a question does not commit you to either career.</span></p>
      <div className="experiment-question-grid">
        {questions.map((question) => (
          <button
            className={"experiment-question-card" + (state.selectedQuestionId === question.id ? " selected" : "") + (question.featured ? " featured" : "")}
            type="button"
            key={question.id}
            onClick={() => onChange({ ...state, selectedQuestionId: question.id, mode: question.mode })}
          >
            <span>{question.featured ? "Direct comparison" : question.careerId ? getCareerModel(question.careerId)?.title : "Guided"}</span>
            <strong>{question.title}</strong>
            <p>{question.helperText}</p>
          </button>
        ))}
      </div>
      {showPreview && (
        <aside className="development-shortcut">
          <div><span>Guided demo shortcut</span><strong>Preview the evidence synthesis without using API credit.</strong><p>This inserts clearly labelled sample answers and evaluation results for both roles.</p></div>
          <button className="button secondary" type="button" onClick={onPreview}>Use sample evaluation</button>
        </aside>
      )}
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back to evidence map</button><button className="button primary" type="button" disabled={!state.selectedQuestionId} onClick={onContinue}>Choose a case for this question <span aria-hidden="true">→</span></button></div>
    </section>
  );
}

function GuidedScreen({ careers, onChoose, onUse }: { careers: CareerId[]; onChoose: () => void; onUse: () => void }) {
  return <section className="screen confirmation-screen experiment-screen"><StageMeta stage="guided" /><div className="eyebrow">A suggestion about evidence, not a career</div><h1>Compare both roles on the same underlying problem.</h1><p className="lead compact">Your current evidence contains important unknowns in both {getCareerModel(careers[0])?.title} and {getCareerModel(careers[1])?.title}. Keeping the scenario constant can help separate your reaction to the work from your reaction to the topic.</p><div className="actions"><button className="button ghost" type="button" onClick={onChoose}>Choose myself</button><button className="button primary" type="button" onClick={onUse}>Use this comparison</button></div></section>;
}

function ScenarioChoiceScreen({
  state,
  onBack,
  onSelect,
}: {
  state: CareerExperimentState;
  onBack: () => void;
  onSelect: (scenarioId: string) => void;
}) {
  return (
    <section className="screen wide-screen experiment-screen">
      <StageMeta stage="scenario-choice" />
      <div className="eyebrow">Same company, different role work</div>
      <h1>Which case would you like to try?</h1>
      <p className="lead compact">
        Each case gives both roles the same company, industry and evidence.
        Only the nature of the work changes.
      </p>
      <div className="scenario-choice-grid">
        {experimentScenarios.map((scenario) => {
          const completed = state.completedScenarioIds.includes(scenario.id);
          return (
            <button
              className="scenario-choice-card"
              disabled={completed}
              key={scenario.id}
              onClick={() => onSelect(scenario.id)}
              type="button"
            >
              <span>{scenario.industry}</span>
              <strong>{scenario.name}</strong>
              <p>{scenario.question}</p>
              <small>{completed ? "Already tried in this session" : "View this case"}</small>
            </button>
          );
        })}
      </div>
      <p className="experiment-note">
        These are original fictional cases. The case structure is informed by
        product and consulting practice materials, but the facts and companies
        were created for this prototype.
      </p>
      <div className="actions">
        <button className="button ghost" type="button" onClick={onBack}>Back</button>
      </div>
    </section>
  );
}

function ScenarioScreen({
  scenario,
  onBack,
  onContinue,
  onPreview,
  showPreview,
}: {
  scenario: ExperimentScenario;
  onBack: () => void;
  onContinue: () => void;
  onPreview: () => void;
  showPreview: boolean;
}) {
  return (
    <section className="screen wide-screen experiment-screen">
      <StageMeta stage="scenario" />
      <div className="eyebrow">One problem, different kinds of work</div>
      <h1>{scenario.question}</h1>
      <p className="lead compact">
        Both role trials use the same company and evidence so you can pay
        attention to how the work itself feels.
      </p>
      <article className="scenario-brief">
        <header>
          <span>{scenario.industry}</span>
          <h2>{scenario.name}</h2>
          <p>{scenario.description}</p>
        </header>
        <section className="scenario-features">
          <h3>What the product already does</h3>
          <ul>{scenario.currentFeatures.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <div className="scenario-sections">
          <section>
            <h3>Recent evidence</h3>
            <ul>{scenario.metrics.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section>
            <h3>What users said</h3>
            <div className="scenario-quotes">
              {scenario.userFeedback.map((quote) => <blockquote key={quote}>“{quote}”</blockquote>)}
            </div>
          </section>
        </div>
        <div className="scenario-constraints">
          <p><span>Goal</span><strong>{scenario.businessGoal}</strong></p>
          <p><span>Constraint</span><strong>{scenario.constraint}</strong></p>
        </div>
      </article>
      <p className="experiment-note">
        This is not a career-knowledge test. The facts stay fixed for both
        roles; the role-specific activities are what change.
      </p>
      {showPreview && (
        <aside className="development-shortcut">
          <div>
            <span>Guided demo shortcut</span>
            <strong>See the post-revision flow for this case without using API credit.</strong>
            <p>This inserts clearly labelled sample answers and evaluation results for both roles.</p>
          </div>
          <button className="button secondary" type="button" onClick={onPreview}>
            Use sample evaluation for this case
          </button>
        </aside>
      )}
      <div className="actions">
        <button className="button ghost" type="button" onClick={onBack}>Choose another case</button>
        <button className="button primary" type="button" onClick={onContinue}>
          Begin the supported work trial <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
function PrimerScreen({ role, onBack, onContinue }: { role: CareerTaskId; onBack: () => void; onContinue: () => void }) {
  const definition = roleTrials[role];
  return <section className="screen wide-screen experiment-screen"><StageMeta stage="role-primer" /><div className="eyebrow">A short primer before you try</div><h1>{definition.primer.title}</h1><p className="lead compact">{definition.primer.introduction}</p><div className="primer-model">{definition.primer.mentalModel.map((item, index) => <span key={item}>{item}{index < definition.primer.mentalModel.length - 1 && <i>→</i>}</span>)}</div><div className="primer-steps">{definition.primer.steps.map((step) => <article key={step.label}><h2>{step.label}</h2><p>{step.explanation}</p></article>)}</div>{definition.primer.concepts?.length ? <section className="primer-toolkit"><h2>A tiny toolkit</h2><div>{definition.primer.concepts.map((concept) => <article key={concept.title}><strong>{concept.title}</strong><p>{concept.explanation}</p></article>)}</div></section> : null}<p className="experiment-note">{definition.primer.closingNote}</p><div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" onClick={onContinue}>Try the work <span aria-hidden="true">→</span></button></div></section>;
}

function AttemptScreen({
  role,
  scenario,
  trial,
  onChange,
  onBack,
  onSubmit,
}: {
  role: CareerTaskId;
  scenario: ExperimentScenario;
  trial: RoleTrialState;
  onChange: (responses: Record<string, string>) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const definition = roleTrials[role];
  const fields = getScenarioFields(role, scenario);
  return (
    <section className="screen wide-screen experiment-screen">
      <StageMeta stage="initial-attempt" />
      <div className="eyebrow">Supported first attempt</div>
      <h1>{definition.roleTitle} lens</h1>
      <p className="lead compact">{getScenarioContext(role, scenario)}</p>
      <div className="trial-fields">
        {fields.map((field) => (
          <label className="trial-field" key={field.id}>
            <span>{field.label}</span>
            <strong>{field.prompt}</strong>
            <textarea
              rows={5}
              value={trial.initialResponses[field.id] ?? ""}
              placeholder={field.placeholder}
              onChange={(event) =>
                onChange({ ...trial.initialResponses, [field.id]: event.target.value })
              }
            />
          </label>
        ))}
      </div>
      <p className="experiment-note">
        Make a genuine first attempt. The evaluator looks only at the reasoning
        you provide and does not calculate a career-fit score.
      </p>
      <div className="actions">
        <button className="button ghost" type="button" onClick={onBack}>Back to primer</button>
        <button
          className="button primary"
          type="button"
          disabled={!isInitialAttemptReady(role, trial.initialResponses)}
          onClick={onSubmit}
        >
          Review my first attempt <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
function EvaluationScreen({ role, trial, onBack, onRetry }: { role: CareerTaskId; trial: RoleTrialState; onBack: () => void; onRetry: () => void }) {
  const revising = trial.revisionEvaluationStatus === "evaluating" || trial.revisionEvaluationStatus === "failed";
  const status = revising ? trial.revisionEvaluationStatus : trial.initialEvaluationStatus;
  const error = revising ? trial.revisionEvaluationError : trial.initialEvaluationError;
  return <section className="screen confirmation-screen experiment-screen"><StageMeta stage="evaluation" /><div className="eyebrow">Qualitative rubric review</div><h1>{status === "evaluating" ? "Reviewing the evidence in your response…" : "The review could not be completed."}</h1>{status === "evaluating" ? <p className="lead compact">We are separating current reasoning, possible knowledge gaps and unclear evidence for the {roleTrials[role].roleTitle} task.</p> : <><p className="lead compact">{error}</p><p>Your answers are still saved. Retry when you are ready.</p></>}<div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back to my answer</button>{status === "failed" && <button className="button primary" type="button" onClick={onRetry}>Retry evaluation</button>}</div></section>;
}

function FeedbackScreen({ role, tone, trial, onBack, onContinue }: { role: CareerTaskId; tone: 1 | 2; trial: RoleTrialState; onBack: () => void; onContinue: () => void }) {
  const evaluation = trial.initialEvaluation;
  if (!evaluation) return null;
  return (
    <section className="screen wide-screen experiment-screen">
      <StageMeta stage="feedback" />
      <div className={`role-review-banner tone-${tone}`}><span>Role review</span><strong>{roleTrials[role].roleTitle}</strong></div>
      <div className="eyebrow">Evidence so far</div>
      <h1>What your first attempt tells us</h1>
      <p className="lead compact">These are qualitative observations about this response, not a verdict about your ability or career.</p>
      <div className="rubric-results">{evaluation.criteria.map((criterion) => <article key={criterion.criterion}><header><strong>{criterion.criterion}</strong><span className={`rubric-rating rating-${criterion.rating}`}>{ratingLabels[criterion.rating]}</span></header><p>{criterion.evidence}</p><small>{criterion.feedback}</small>{criterion.gapType !== "none" && <em>{criterion.gapType.replace("_", " ")} gap</em>}</article>)}</div>
      <section className="revision-focus"><span>One useful development opportunity</span><h2>{evaluation.revisionTarget}</h2>{evaluation.instruction && <><h3>A useful idea before you try again</h3><p>{evaluation.instruction}</p></>}<strong>{evaluation.revisionPrompt}</strong></section>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back to first attempt</button><button className="button primary" type="button" onClick={onContinue}>Revise this part <span aria-hidden="true">→</span></button></div>
    </section>
  );
}

function RevisionScreen({
  scenario,
  trial,
  onChange,
  onBack,
  onSubmit,
}: {
  scenario: ExperimentScenario;
  trial: RoleTrialState;
  onChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  if (!trial.initialEvaluation) return null;
  return (
    <section className="screen confirmation-screen experiment-screen">
      <StageMeta stage="revision" />
      <div className="eyebrow">Focused revision</div>
      <h1>Try one part again</h1>
      <section className="revision-scenario-reminder">
        <span>Scenario reminder</span>
        <h2>{scenario.name}</h2>
        <p>{scenario.description}</p>
        <div>
          <p><strong>Goal</strong>{scenario.businessGoal}</p>
          <p><strong>Constraint</strong>{scenario.constraint}</p>
        </div>
        <ul>{scenario.metrics.map((metric) => <li key={metric}>{metric}</li>)}</ul>
      </section>
      <section className="revision-prompt">
        <span>What to revise</span>
        <h2>{trial.initialEvaluation.revisionTarget}</h2>
        <p>{trial.initialEvaluation.revisionPrompt}</p>
        {trial.initialEvaluation.instruction && (
          <div className="instruction-card">
            <span>Useful concept</span>
            <p>{trial.initialEvaluation.instruction}</p>
          </div>
        )}
        <label className="trial-field">
          <span>Your revised response</span>
          <textarea
            rows={8}
            value={trial.revisionResponse}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Use the feedback, while keeping the answer your own..."
          />
        </label>
      </section>
      <div className="actions">
        <button className="button ghost" type="button" onClick={onBack}>Back to feedback</button>
        <button
          className="button primary"
          type="button"
          disabled={trial.revisionResponse.trim().length < 8}
          onClick={onSubmit}
        >
          Review my revision <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
function RevisionResultScreen({ trial, onBack, onContinue }: { trial: RoleTrialState; onBack: () => void; onContinue: () => void }) {
  const result = trial.revisionEvaluation;
  if (!result) return null;
  return <section className="screen confirmation-screen experiment-screen"><StageMeta stage="revision-result" /><div className="eyebrow">Response to feedback</div><h1>{learningLabels[result.learningResponse.category]}</h1><p className="lead compact">{result.learningResponse.explanation}</p><article className="revision-evidence"><header><strong>{result.criterion.criterion}</strong><span className={`rubric-rating rating-${result.criterion.rating}`}>{ratingLabels[result.criterion.rating]}</span></header><p>{result.criterion.evidence}</p><small>{result.criterion.feedback}</small></article><p className="experiment-note">One revision is evidence about this response to feedback, not a learning-potential score.</p><div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back to revision</button><button className="button primary" type="button" onClick={onContinue}>Reflect on the work <span aria-hidden="true">→</span></button></div></section>;
}

function RoleReactionScreen({ role, trial, onPreference, onToggleReaction, onEvidenceSufficiency, onBack, onContinue }: { role: CareerTaskId; trial: RoleTrialState; onPreference: (value: ExperimentPreference) => void; onToggleReaction: (value: WorkReaction) => void; onEvidenceSufficiency: (value: EvidenceSufficiency) => void; onBack: () => void; onContinue: () => void }) {
  return (
    <section className="screen wide-screen experiment-screen">
      <StageMeta stage="role-reaction" />
      <div className="eyebrow">Preference after support and revision</div>
      <h1>How did the {roleTrials[role].roleTitle} work feel?</h1>
      <div className="reaction-card">
        <ChoiceGroup label="Now that you better understand how this work is approached, would you want to spend more time doing work like this?" options={preferenceOptions} labels={preferenceLabels} value={trial.preferenceEvidence?.preference} onChange={onPreference} />
        <fieldset className="work-reaction-list">
          <legend>Which statements describe your experience?</legend>
          <p>Select all that apply.</p>
          {workReactionOptions.map((option) => {
            const selected = trial.workReactions.includes(option.id);
            return <button aria-pressed={selected} className={selected ? "selected" : ""} type="button" key={option.id} onClick={() => onToggleReaction(option.id)}><span className="reaction-check" aria-hidden="true">{selected ? "✓" : ""}</span><span>{option.label}</span></button>;
          })}
        </fieldset>
        <fieldset className="evidence-sufficiency-options">
          <legend>Do you have enough evidence to judge how this work feels?</legend>
          <div>
            <button aria-pressed={trial.evidenceSufficiency === "enough"} className={trial.evidenceSufficiency === "enough" ? "selected" : ""} type="button" onClick={() => onEvidenceSufficiency("enough")}>Yes, enough for a starting view</button>
            <button aria-pressed={trial.evidenceSufficiency === "need_more"} className={trial.evidenceSufficiency === "need_more" ? "selected" : ""} type="button" onClick={() => onEvidenceSufficiency("need_more")}>Not yet — I need more experience</button>
          </div>
          <p>You can have a clear reaction to this task and still need more evidence about the wider role.</p>
        </fieldset>
      </div>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={!trial.preferenceEvidence || !trial.workReactions.length || !trial.evidenceSufficiency} onClick={onContinue}>Save this evidence <span aria-hidden="true">→</span></button></div>
    </section>
  );
}

function ActivityReflectionScreen({ state, onChange, onBack, onContinue }: { state: CareerExperimentState; onChange: (id: string, value: ActivityReaction) => void; onBack: () => void; onContinue: () => void }) {
  const activities = getTaskSequence(state.mode, state.selectedCareers).flatMap((role) => roleTrials[role].activities);
  const answered = activities.every((activity) => state.activityReflections[activity.id]);
  return <section className="screen wide-screen experiment-screen"><StageMeta stage="activity-reflection" /><div className="eyebrow">Career → activities → evidence</div><h1>Which kinds of work would you want more or less of?</h1><p className="lead compact">React to the activities, not the career titles. Preference and performance remain separate.</p><div className="activity-reflection-list">{activities.map((activity) => <article key={activity.id}><span>{roleTrials[activity.role].roleTitle}</span><strong>{activity.label}</strong><ChoiceGroup label="Future preference" options={activityOptions} labels={activityReactionLabels} value={state.activityReflections[activity.id]} onChange={(value: ActivityReaction) => onChange(activity.id, value)} /></article>)}</div><div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={!answered} onClick={onContinue}>Compare the work <span aria-hidden="true">→</span></button></div></section>;
}

function ComparisonReflectionScreen({ state, onChange, onBack, onContinue }: { state: CareerExperimentState; onChange: (patch: Partial<CareerExperimentState>) => void; onBack: () => void; onContinue: () => void }) {
  const choices = getDirectComparisonChoices(state.selectedCareers);
  return <section className="screen confirmation-screen experiment-screen"><StageMeta stage="comparison-reflection" /><div className="eyebrow">Compare the work, not the careers</div><h1>If you repeated one task tomorrow, which would you choose?</h1><div className="comparison-choice-list">{choices.map((choice) => <button className={state.directComparisonChoice === choice.id ? "comparison-choice selected" : "comparison-choice"} type="button" key={choice.id} onClick={() => onChange({ directComparisonChoice: choice.id as DirectComparisonChoice })}>{choice.label}</button>)}</div><label className="reflection-field"><span>Optional reflection</span><strong>What made one kind of work more or less appealing?</strong><textarea rows={5} value={state.comparisonReflection} onChange={(event) => onChange({ comparisonReflection: event.target.value })} /></label><p className="experiment-note">This is preference evidence from one controlled exercise, not a career decision.</p><div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={!state.directComparisonChoice} onClick={onContinue}>See the evidence <span aria-hidden="true">→</span></button></div></section>;
}

function RoleEvidenceSection({ role, tone, trial, state }: { role: CareerTaskId; tone: 1 | 2; trial: RoleTrialState; state: CareerExperimentState }) {
  const definition = roleTrials[role];
  const reactions = trial.workReactions.flatMap((reactionId) => {
    const label = workReactionOptions.find((option) => option.id === reactionId)?.label;
    return label ? [label] : [];
  });
  const activityEvidence = definition.activities.filter((activity) => state.activityReflections[activity.id] && state.activityReflections[activity.id] !== "not_sure");
  const developmental = trial.initialEvaluation?.criteria.filter((criterion) => criterion.gapType === "knowledge" || criterion.gapType === "reasoning") ?? [];
  return <article className={`role-trial-synthesis role-synthesis-tone-${tone}`}><header><span>Supported work trial</span><h2>{definition.roleTitle}</h2></header><section><h3>Preference evidence</h3><p>{trial.preferenceEvidence ? `After support and revision, you chose “${preferenceLabels[trial.preferenceEvidence.preference]}” for work like this.` : "Preference evidence is incomplete."}</p>{reactions.length > 0 && <ul>{reactions.map((reaction) => <li key={reaction}>{reaction}</li>)}</ul>}<p>{trial.evidenceSufficiency === "need_more" ? "You said you still need more experience before judging the wider role." : trial.evidenceSufficiency === "enough" ? "You said this was enough evidence for a starting view." : "Evidence certainty was not recorded."}</p>{activityEvidence.length > 0 && <ul>{activityEvidence.map((activity) => <li key={activity.id}><strong>{activity.label}</strong> — {activityReactionLabels[state.activityReflections[activity.id]!]}</li>)}</ul>}</section><section><h3>Current performance evidence</h3>{trial.initialEvaluation ? <ul>{trial.initialEvaluation.criteria.map((criterion) => <li key={criterion.criterion}><strong>{criterion.criterion}: {ratingLabels[criterion.rating]}</strong><span>{criterion.evidence}</span></li>)}</ul> : <p>No evaluated performance evidence was generated.</p>}</section><section><h3>Response to feedback</h3><p>{trial.learningResponse ? `${learningLabels[trial.learningResponse.category]}. ${trial.learningResponse.explanation}` : "No revision evidence was generated."}</p></section><section><h3>What appears developmental</h3>{developmental.length ? <ul>{developmental.map((criterion) => <li key={criterion.criterion}>{criterion.criterion}: {criterion.gapType === "knowledge" ? "unfamiliarity affected the first attempt" : "the reasoning was partly developed"}.</li>)}</ul> : <p>No developmental interpretation is justified from this short trial.</p>}</section><section className="unknown-section"><h3>What remains unknown</h3><ul>{definition.remainingUnknowns.map((item) => <li key={item}>{item}</li>)}</ul></section></article>;
}

type DirectionalSignal = { heading: string; explanation: string };

function buildDirectionalSignal(state: CareerExperimentState, testedRoles: CareerTaskId[]): DirectionalSignal {
  if (testedRoles.length < 2) return {
    heading: "This trial adds evidence about one role, but it cannot compare the two roles yet",
    explanation: "Your preference and work reaction describe this task only. A direct comparison would be needed before the experiment could show a role-level direction.",
  };

  const [roleA, roleB] = testedRoles;
  const repeatedRole = state.directComparisonChoice && testedRoles.includes(state.directComparisonChoice as CareerTaskId)
    ? state.directComparisonChoice as CareerTaskId
    : undefined;
  let leaningRole = repeatedRole;
  let reason = repeatedRole
    ? `You said you would choose the ${roleTrials[repeatedRole].roleTitle} task if you repeated one tomorrow.`
    : "";

  if (!leaningRole) {
    const preferenceRank: Record<ExperimentPreference, number> = { more: 3, same: 2, need_more_experience: 1, less: 0 };
    const preferenceA = state.roleTrials[roleA]?.preferenceEvidence?.preference;
    const preferenceB = state.roleTrials[roleB]?.preferenceEvidence?.preference;
    if (preferenceA && preferenceB && preferenceRank[preferenceA] !== preferenceRank[preferenceB]) {
      leaningRole = preferenceRank[preferenceA] > preferenceRank[preferenceB] ? roleA : roleB;
      reason = `Your stated desire for more or less work was more positive for the ${roleTrials[leaningRole].roleTitle} task.`;
    }
  }

  if (!leaningRole) {
    const activityBalance = (role: CareerTaskId) => roleTrials[role].activities.reduce((total, activity) => {
      const reaction = state.activityReflections[activity.id];
      return total + (reaction === "more" ? 1 : reaction === "less" ? -1 : 0);
    }, 0);
    const balanceA = activityBalance(roleA);
    const balanceB = activityBalance(roleB);
    if (Math.abs(balanceA - balanceB) >= 2) {
      leaningRole = balanceA > balanceB ? roleA : roleB;
      reason = `Your activity-level reactions were more positive for the kinds of work included in the ${roleTrials[leaningRole].roleTitle} trial.`;
    }
  }

  if (!leaningRole) return {
    heading: "This experiment does not yet point clearly toward either role",
    explanation: "Your repeat choice, task preference and activity reactions were mixed or similar. That is useful evidence: this exercise does not justify forcing a direction.",
  };

  // The observation leads and the career name appears inside it as something
  // the User said, not as a verdict we reached. See ADR 0001.
  return {
    heading: reason,
    explanation: "That is one preference, from one exercise, on one day. It is evidence about the work you just did - not a conclusion about which career suits you.",
  };
}

// Two forms: one before a noun ("more analysis work"), one standing alone
// after a pronoun ("you wanted more of it").
const preferenceWord = { more: "more", same: "about the same amount of", less: "less" } as const;
const preferenceWordAlone = { more: "more of it", same: "about the same amount of it", less: "less of it" } as const;

function describeFinding(finding: PreferenceFinding) {
  const work = `${finding.category.toLowerCase()} work`;
  if (finding.kind === "shift" && finding.direction === "confirmed") return `Before trying it you wanted ${preferenceWord[finding.imagined]} ${work}. After doing it, you still did.`;
  if (finding.kind === "shift") return `Before trying it you wanted ${preferenceWord[finding.imagined]} ${work}. After doing it, you wanted ${preferenceWordAlone[finding.informed]}.`;
  if (finding.kind === "first-evidence") return `You had no ${work} in your evidence. Having now done some, you want ${preferenceWordAlone[finding.informed]}.`;
  if (finding.kind === "unresolved") return `You did ${work} and still need more experience before judging it. That is a real answer, not a gap.`;
  return `Your reactions to ${work} differed across tasks, so we are not summarising them as one preference.`;
}

const contradictionCauseOptions = ["kind-of-work", "this-task"] as const;
const contradictionCauseLabels = {
  "kind-of-work": "This kind of work",
  "this-task": "Something about this particular task",
};

function CoreTensionSection({ tensions }: { tensions: CoreTension[] }) {
  if (tensions.length === 0) return null;
  return (
    <section className="cross-career-synthesis core-tension">
      <span>Worth noticing</span>
      {tensions.map((tension) => (
        <div className="core-tension-note" key={`${tension.careerId}-${tension.category}`}>
          <h2>
            {tension.category} work is core to a {tension.careerTitle}, and after doing it you wanted less of it.
          </h2>
          <p>
            For a {tension.careerTitle} this includes {tension.coreActivityLabels.join(", ").toLowerCase()}.
            Core work is the part of a job you cannot avoid by picking a different team or employer.
          </p>
        </div>
      ))}
      <small>
        Not wanting one kind of work does not settle whether the career suits you, and we are not
        counting these up. It is one thing worth weighing yourself.
      </small>
    </section>
  );
}

function DirectionSection({
  direction,
  careers,
}: {
  direction: ReturnType<typeof buildDirection>;
  careers: CareerId[];
}) {
  if (direction.kind === "nothing-left") {
    return (
      <section className="cross-career-synthesis direction-next">
        <span>What to explore next</span>
        <h2>{direction.reason}</h2>
      </section>
    );
  }

  if (direction.kind === "retest") {
    return (
      <section className="cross-career-synthesis direction-next">
        <span>What to explore next</span>
        <h2>Try {direction.category.toLowerCase()} work again, in a different setting.</h2>
        <p>{direction.reason}</p>
      </section>
    );
  }

  const { unknown } = direction;
  const leaning = unknown.leansToward ? getCareerModel(unknown.leansToward)?.title : undefined;
  const other = careers.find((career) => career !== unknown.leansToward);
  const otherTitle = other ? getCareerModel(other)?.title : undefined;

  return (
    <section className="cross-career-synthesis direction-next">
      <span>What to explore next</span>
      <h2>Get some experience of {unknown.label.toLowerCase()}.</h2>
      {leaning && otherTitle && (
        <p>
          It is {unknown.importanceByCareer[unknown.leansToward!]?.toLowerCase()} work for a {leaning} and
          much less central for a {otherTitle}, and you have no evidence of it yet. Whatever you find
          out, you learn something about the choice itself &mdash; which is why it comes before work you
          are simply curious about.
        </p>
      )}
      <p className="direction-caveat">
        This is a suggestion about what to try next, not a recommendation to become a {leaning ?? "particular role"}.
      </p>
    </section>
  );
}

function PreferenceShiftSection({

  findings,
  contradictionCauses,
  onContradictionCause,
}: {
  findings: PreferenceFinding[];
  contradictionCauses: Partial<Record<string, ContradictionCause>>;
  onContradictionCause: (category: string, cause: ContradictionCause) => void;
}) {
  const headline = selectHeadlineFinding(findings);
  if (!headline) return null;
  const isContradiction = headline.kind === "shift" && headline.isContradiction;
  const cause = contradictionCauses[headline.category];
  return (
    <section className="cross-career-synthesis preference-shift">
      <span>What changed when you did the work</span>
      <h2>{describeFinding(headline)}</h2>
      {isContradiction && (
        <p>This is the most useful thing you learned today. Recall and experience disagreed &mdash; which does not mean your earlier answer was wrong, only that doing the work told you something reading about it could not.</p>
      )}
      {isContradiction && (
        <div className="contradiction-question">
          <ChoiceGroup
            label="Which was it?"
            options={contradictionCauseOptions}
            labels={contradictionCauseLabels}
            value={cause}
            onChange={(next: ContradictionCause) => onContradictionCause(headline.category, next)}
          />
          {cause === "kind-of-work" && <p>Recorded as evidence about the work itself.</p>}
          {cause === "this-task" && <p>Recorded as evidence about this task, not about the work. A different case may feel different.</p>}
        </div>
      )}
      {headline.kind === "first-evidence" && (
        <p>This is the first firsthand evidence you have about this kind of work. There was no earlier answer to compare it against.</p>
      )}
      {findings.length > 1 && (
        <ul>{findings.filter((finding) => finding !== headline).map((finding) => <li key={finding.category}><strong>{finding.category}</strong> &mdash; {describeFinding(finding)}</li>)}</ul>
      )}
      <small>This compares what you predicted in your evidence review with how the work actually felt. It does not use your rubric performance.</small>
    </section>
  );
}

function SummaryScreen({
  state,
  normalizedActivities,
  evidenceResponses,
  onContradictionCause,
  onBackToMap,
  onTryAnotherCase,
}: {
  state: CareerExperimentState;
  normalizedActivities: NormalizedActivity[];
  evidenceResponses: Record<string, ActivityEvidenceResponse>;
  onContradictionCause: (category: string, cause: ContradictionCause) => void;
  onBackToMap: () => void;
  onTryAnotherCase: () => void;
}) {
  const testedRoles = getTaskSequence(state.mode, state.selectedCareers);
  const directionalSignal = buildDirectionalSignal(state, testedRoles);
  const rankedUnknowns = rankUnknownsBySeparation({
    careers: state.selectedCareers,
    confirmedActivityIds: normalizedActivities.map((activity) => activity.canonicalId),
  });
  const preferenceFindings = computePreferenceFindings({
    normalizedActivities,
    evidenceResponses,
    experimentActivities: testedRoles.flatMap((role) => roleTrials[role].activities),
    activityReflections: state.activityReflections,
  });
  const reflection = interpretComparisonReflection(
    state.comparisonReflection,
    state.selectedCareers,
  );
  return (
    <section className="screen wide-screen experiment-screen">
      <StageMeta stage="summary" />
      <div className="eyebrow">Experiment evidence, not a verdict</div>
      <h1>What this supported work trial added</h1>
      <p className="lead compact">
        You tested {getExperimentQuestionText(state).replace(/.$/, "").toLowerCase()}.
        Preference, current performance and response to feedback stay separate.
      </p>
      {state.isDevelopmentPreview && (
        <p className="experiment-note">
          Development preview: the task answers and evaluations below are sample
          data and should not be treated as your evidence.
        </p>
      )}
      <div className="role-trial-synthesis-grid">
        {testedRoles.map((role, index) => (
          <RoleEvidenceSection
            key={role}
            role={role}
            tone={index === 0 ? 1 : 2}
            trial={state.roleTrials[role]!}
            state={state}
          />
        ))}
      </div>
      <PreferenceShiftSection
        findings={preferenceFindings}
        contradictionCauses={state.contradictionCauses}
        onContradictionCause={onContradictionCause}
      />
      <section className="directional-signal">
        <span>What you said during the experiment</span>
        <h2>{directionalSignal.heading}</h2>
        <p>{directionalSignal.explanation}</p>
        <small>
          This summarises your repeat-task choice, post-support preference and
          activity reactions. Rubric performance remains separate above.
        </small>
      </section>
      {reflection && (
        <section className="cross-career-synthesis reflection-interpretation simple-reflection">
          <span>From your reflection</span>
          <h2>{reflection.interpretation}</h2>
          <p><strong>Next step:</strong> {reflection.nextQuestion}</p>
        </section>
      )}
      <CoreTensionSection
        tensions={findCoreTensions({ careers: state.selectedCareers, findings: preferenceFindings, contradictionCauses: state.contradictionCauses })}
      />
      <DirectionSection
        direction={buildDirection({ rankedUnknowns, findings: preferenceFindings, contradictionCauses: state.contradictionCauses })}
        careers={state.selectedCareers}
      />
      <p className="experiment-verdict">
        This is not a career recommendation. A different case can add another
        piece of evidence, but it still will not represent sustained real work.
      </p>
      <div className="actions">
        <button className="button secondary" type="button" onClick={onTryAnotherCase}>
          Try another case
        </button>
        <button className="button primary" type="button" onClick={onBackToMap}>
          Finish and return to evidence map <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
export function CareerExperimentScreen({
  careers,
  normalizedActivities = [],
  evidenceResponses = {},
  isGuidedDemo = false,
  onBackToEvidenceMap,
}: {
  careers: CareerId[];
  /** Phase 1 evidence, so Phase 3 reactions can be compared with Phase 2 preferences. */
  normalizedActivities?: NormalizedActivity[];
  evidenceResponses?: Record<string, ActivityEvidenceResponse>;
  isGuidedDemo?: boolean;
  onBackToEvidenceMap: () => void;
}) {
  const [state, setState] = useState<CareerExperimentState>(() =>
    createInitialExperimentState(careers),
  );
  const scenario = getExperimentScenario(state.scenarioId) ?? learnLoopScenario;
  const moveTo = (
    stage: ExperimentStage,
    patch: Partial<CareerExperimentState> = {},
  ) => {
    setState((current) => ({ ...current, ...patch, stage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const getTrial = (role: CareerTaskId) => state.roleTrials[role]!;
  const updateTrial = (
    role: CareerTaskId,
    patch: Partial<RoleTrialState>,
    stage?: ExperimentStage,
  ) =>
    setState((current) => ({
      ...current,
      ...(stage ? { stage } : {}),
      roleTrials: {
        ...current.roleTrials,
        [role]: { ...current.roleTrials[role]!, ...patch },
      },
    }));
  const currentRole = state.activeRole;
  const beginTrials = () => {
    const first = getTaskSequence(state.mode, careers)[0];
    if (first) moveTo("role-primer", { activeRole: first });
  };

  const submitInitial = async (role: CareerTaskId) => {
    const trial = getTrial(role);
    const taskQuestions = getScenarioFields(role, scenario);
    updateTrial(
      role,
      { initialEvaluationStatus: "evaluating", initialEvaluationError: undefined },
      "evaluation",
    );
    try {
      const evaluation = await evaluateInitialAttempt({
        role,
        attempt: "initial",
        scenario,
        taskQuestions,
        answers: trial.initialResponses,
        rubric: roleTrials[role].rubric,
      });
      updateTrial(
        role,
        {
          initialEvaluationStatus: "success",
          initialEvaluation: evaluation,
          revisionTarget: evaluation.revisionTarget,
        },
        "feedback",
      );
    } catch (error) {
      updateTrial(
        role,
        {
          initialEvaluationStatus: "failed",
          initialEvaluationError:
            error instanceof Error ? error.message : "Evaluation failed.",
        },
        "evaluation",
      );
    }
  };

  const submitRevision = async (role: CareerTaskId) => {
    const trial = getTrial(role);
    if (!trial.initialEvaluation) return;
    const taskQuestions = getScenarioFields(role, scenario);
    updateTrial(
      role,
      { revisionEvaluationStatus: "evaluating", revisionEvaluationError: undefined },
      "evaluation",
    );
    try {
      const revisionEvaluation = await evaluateRevision({
        role,
        attempt: "revision",
        scenario,
        taskQuestions,
        answers: trial.initialResponses,
        rubric: roleTrials[role].rubric,
        revisionContext: {
          revisionTarget: trial.initialEvaluation.revisionTarget,
          instruction: trial.initialEvaluation.instruction,
          revisionPrompt: trial.initialEvaluation.revisionPrompt,
          initialEvaluation: trial.initialEvaluation,
          revisionResponse: trial.revisionResponse,
        },
      });
      updateTrial(
        role,
        {
          revisionEvaluationStatus: "success",
          revisionEvaluation,
          learningResponse: revisionEvaluation.learningResponse,
        },
        "revision-result",
      );
    } catch (error) {
      updateTrial(
        role,
        {
          revisionEvaluationStatus: "failed",
          revisionEvaluationError:
            error instanceof Error ? error.message : "Evaluation failed.",
        },
        "evaluation",
      );
    }
  };

  const completeRole = (role: CareerTaskId) => {
    const completed = state.completedCareerTasks.includes(role)
      ? state.completedCareerTasks
      : [...state.completedCareerTasks, role];
    const next = getNextRole(state.mode, careers, completed);
    updateTrial(role, { completed: true });
    if (next) {
      moveTo(state.isDevelopmentPreview ? "revision-result" : "role-primer", {
        completedCareerTasks: completed,
        activeRole: next,
      });
    } else {
      moveTo(state.mode === "comparison" ? "activity-reflection" : "summary", {
        completedCareerTasks: completed,
        activeRole: undefined,
      });
    }
  };

  if (!isSupportedExperimentPair(careers)) {
    return (
      <section className="screen confirmation-screen">
        <h1>This role pair is not available.</h1>
        <button className="button primary" type="button" onClick={onBackToEvidenceMap}>
          Return to evidence map
        </button>
      </section>
    );
  }
  if (state.stage === "question") {
    return (
      <QuestionScreen
        state={state}
        onChange={setState}
        onBack={onBackToEvidenceMap}
        onContinue={() =>
          state.selectedQuestionId === "guided"
            ? moveTo("guided")
            : moveTo("scenario-choice", { scenarioId: undefined })
        }
        onPreview={() => {
          setState(createPostEvaluationPreviewState(careers));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        showPreview={isGuidedDemo || process.env.NODE_ENV === "development"}
      />
    );
  }
  if (state.stage === "guided") {
    return (
      <GuidedScreen
        careers={careers}
        onChoose={() =>
          moveTo("question", { selectedQuestionId: undefined, mode: undefined })
        }
        onUse={() =>
          moveTo("scenario-choice", { mode: "comparison", scenarioId: undefined })
        }
      />
    );
  }
  if (state.stage === "scenario-choice") {
    return (
      <ScenarioChoiceScreen
        state={state}
        onBack={() =>
          moveTo(state.selectedQuestionId === "guided" ? "guided" : "question")
        }
        onSelect={(scenarioId) => moveTo("scenario", { scenarioId })}
      />
    );
  }
  if (state.stage === "scenario") {
    return (
      <ScenarioScreen
        scenario={scenario}
        onBack={() => moveTo("scenario-choice")}
        onContinue={beginTrials}
        onPreview={() => {
          setState(createPostEvaluationPreviewState(careers, scenario.id));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        showPreview={isGuidedDemo || process.env.NODE_ENV === "development"}
      />
    );
  }
  if (currentRole && state.stage === "role-primer") {
    return (
      <PrimerScreen
        role={currentRole}
        onBack={() => moveTo("scenario")}
        onContinue={() => {
          updateTrial(currentRole, { primerViewed: true });
          moveTo("initial-attempt");
        }}
      />
    );
  }
  if (currentRole && state.stage === "initial-attempt") {
    return (
      <AttemptScreen
        role={currentRole}
        scenario={scenario}
        trial={getTrial(currentRole)}
        onChange={(initialResponses) => updateTrial(currentRole, { initialResponses })}
        onBack={() => moveTo("role-primer")}
        onSubmit={() => void submitInitial(currentRole)}
      />
    );
  }
  if (currentRole && state.stage === "evaluation") {
    const trial = getTrial(currentRole);
    const revising =
      trial.revisionEvaluationStatus === "evaluating" ||
      trial.revisionEvaluationStatus === "failed";
    return (
      <EvaluationScreen
        role={currentRole}
        trial={trial}
        onBack={() => moveTo(revising ? "revision" : "initial-attempt")}
        onRetry={() =>
          void (revising ? submitRevision(currentRole) : submitInitial(currentRole))
        }
      />
    );
  }
  if (currentRole && state.stage === "feedback") {
    return (
      <FeedbackScreen
        role={currentRole}
        tone={state.selectedCareers[0] === currentRole ? 1 : 2}
        trial={getTrial(currentRole)}
        onBack={() => moveTo("initial-attempt")}
        onContinue={() => moveTo("revision")}
      />
    );
  }
  if (currentRole && state.stage === "revision") {
    return (
      <RevisionScreen
        scenario={scenario}
        trial={getTrial(currentRole)}
        onChange={(revisionResponse) =>
          updateTrial(currentRole, { revisionResponse })
        }
        onBack={() => moveTo("feedback")}
        onSubmit={() => void submitRevision(currentRole)}
      />
    );
  }
  if (currentRole && state.stage === "revision-result") {
    return (
      <RevisionResultScreen
        trial={getTrial(currentRole)}
        onBack={() => moveTo("revision")}
        onContinue={() => moveTo("role-reaction")}
      />
    );
  }
  if (currentRole && state.stage === "role-reaction") {
    return (
      <RoleReactionScreen
        role={currentRole}
        trial={getTrial(currentRole)}
        onPreference={(preference) =>
          updateTrial(currentRole, { preferenceEvidence: { preference } })
        }
        onToggleReaction={(workReaction) => {
          const trial = getTrial(currentRole);
          updateTrial(currentRole, {
            workReactions: trial.workReactions.includes(workReaction)
              ? trial.workReactions.filter((item) => item !== workReaction)
              : [...trial.workReactions, workReaction],
          });
        }}
        onEvidenceSufficiency={(evidenceSufficiency) =>
          updateTrial(currentRole, { evidenceSufficiency })
        }
        onBack={() => moveTo("revision-result")}
        onContinue={() => completeRole(currentRole)}
      />
    );
  }
  if (state.stage === "activity-reflection") {
    return (
      <ActivityReflectionScreen
        state={state}
        onChange={(id, value) =>
          setState((current) => ({
            ...current,
            activityReflections: {
              ...current.activityReflections,
              [id]: value,
            },
          }))
        }
        onBack={() => {
          const role = state.completedCareerTasks.at(-1);
          if (role) moveTo("role-reaction", { activeRole: role });
        }}
        onContinue={() => moveTo("comparison-reflection")}
      />
    );
  }
  if (state.stage === "comparison-reflection") {
    return (
      <ComparisonReflectionScreen
        state={state}
        onChange={(patch) => setState((current) => ({ ...current, ...patch }))}
        onBack={() => moveTo("activity-reflection")}
        onContinue={() => moveTo("summary")}
      />
    );
  }
  return (
    <SummaryScreen
      state={state}
      normalizedActivities={normalizedActivities}
      evidenceResponses={evidenceResponses}
      onContradictionCause={(category, cause) =>
        setState((current) => ({ ...current, contradictionCauses: { ...current.contradictionCauses, [category]: cause } }))
      }
      onBackToMap={onBackToEvidenceMap}
      onTryAnotherCase={() => {
        setState(createNextScenarioState(state));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}
