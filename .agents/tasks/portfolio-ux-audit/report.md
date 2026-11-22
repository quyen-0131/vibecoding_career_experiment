# Portfolio UX + Product-Thinking Audit — The Career Experiment

Read-only audit. Nothing in the codebase was modified. Every finding below cites a file I read.

## Executive summary

This is close to LinkedIn-publishable as a portfolio piece. The guided-demo path is coherent end to end, the product-thinking is genuinely legible (the "not a fit score / not a quiz" boundary is restated on almost every result screen), and the sample-evaluation shortcut removes the two things that would otherwise break a cold demo: typing long answers and spending API credit. The single highest-leverage fix is the **ending**: the demo currently terminates by sending the viewer "back to the evidence map" (`CareerExperimentScreenV2.tsx`, `SummaryScreen` → `onBackToMap`), so a 90-second reviewer loops backward into a dense screen they already saw instead of landing on a clear "so what." Yes, the one-page summary should be added — it is the missing payoff, and crucially almost all the data it needs is already held in component state, so it is a low-plumbing change. The second real risk is that the sample-evaluation "shortcut" is not actually a shortcut to the payoff: it still drops the user into `revision-result` and makes them click through role-reaction, activity-reflection and comparison-reflection before any synthesis appears, which is several decision screens too many for a cold viewer. Fix those two things and it is ready to post.

---

## A. Guided-demo path integrity

The guided demo is triggered by `startGuidedDemo()` in `app/page.tsx`. It sets `isGuidedDemo = true`, hard-selects the pair `["product-manager", "management-consultant"]`, loads `sampleExperiences` from `data/prototype.ts`, pre-selects the first 3 experiences, and jumps straight to **step 4** (`goTo(4)`), skipping career selection (step 2) and CV upload (step 3). A persistent banner then renders on every subsequent step: `"You are using fictional sample data. Edit any choice, or select Start over to use your own CV."` (`app/page.tsx`), plus a `Guided demo` badge in the brand bar. Both are good cold-viewer signals.

Walking each screen the demo actually lands on:

**Step 4 — Experience selection (`ExperienceSelectionScreen.tsx`).**
Purpose: pick up to 5 past experiences to learn from. On the demo path 3 of 5 sample experiences arrive pre-selected, so the screen is non-empty and the primary button is immediately enabled. Copy is plain ("Which experiences should we learn from?"). The empty/parse-failure state (`experiences.length === 0 → "We read the file, but couldn't separate its experience layout."`) cannot trigger on the demo path because sample data is injected directly, so there is no empty-state risk here for a cold viewer.
Weak point: this is the viewer's **first** screen (they never saw steps 1–3 unless they read the welcome), and it opens mid-flow with a fairly dense multi-card editor (inline "Edit details", "Paste several activities", manual-activity rows). A cold viewer dropped here may not realise work was already done for them. It is functional, not broken.

**Step 5 — Activity overview / confirm (`ActivityOverviewScreen.tsx`).**
Purpose: confirm the activities extracted from the experiences, grouped by category. Good: the lead copy pre-empts misreading — "These groups are navigation aids, not core career values or fit criteria" — and the `purpose-note` states "A CV suggestion is not yet a fact about you." A `useEffect` re-runs semantic mapping on mount (`mapNormalizedActivity`, `mergeNormalizedActivities`); on the demo this produces a populated, categorised list. `EvidenceProvenance` and a "See original CV wording" `<details>` expose provenance. No empty state is reachable with sample data. Solid screen.

**Step 6 (tunnel) — Evidence tunnel (`EvidenceTunnelScreen.tsx`).**
Purpose: for each *group* of related activities, capture one preference (More / About the same / Less). Good design decision, well executed: it reviews groups, not every activity, and the group-career comparison panel shows "N of M activities mapped" with per-activity relationship labels (`Direct match` / `Transferable` / `Adjacent` / `Not yet mapped`) and a rationale line. The `Next`/`See my evidence map` button is correctly disabled until a group preference is chosen (`disabled={!groupPreference}`). `if (!group) return null` is a silent guard — not reachable on the demo because `topEvidenceActivities` is populated by `startEvidenceTunnel()`, but worth noting it renders nothing rather than a fallback if it ever were empty.
Friction: a cold viewer must answer *every* group to advance (no skip). With ~4–6 groups this is the first point where the 90-second viewer may feel the demo getting long.

**Step 6 (map) — Starting evidence map (`StartingEvidenceMapScreen.tsx`).**
Purpose: show what past experience can and cannot tell you, per career. This is the strongest product-thinking screen. It leads with "This is not a career recommendation", carries an explicit `evidence-state-key` definition list (Confirmed experience / Your group preference / Career relevance / Unknown), and every coverage bar is labelled "resume activity coverage … It measures past activity coverage, not ability or career fit." The missing-preference case is handled honestly ("No preference evidence" + an explanatory note distinguishing "no matching activity" from "no response recorded"). `buildStartingEvidence` drives it; if it returns null for a career the card is skipped (`if (!narrative) return null`).
Weak point: it is **dense** — two full career columns, coverage groups, expandable activity lists, and an "important work still untested" list. It is the heaviest screen in the flow, and (see section C) it is also where the demo currently dumps the user at the *end*.

**Step 7 — Career experiment (`CareerExperimentScreenV2.tsx`, exported via `CareerExperimentScreen.tsx`).**
This is a multi-stage sub-machine (`stage`: question → guided → scenario-choice → scenario → role-primer → initial-attempt → evaluation → feedback → revision → revision-result → role-reaction → activity-reflection → comparison-reflection → summary). The guided-demo affordance is the `showPreview` aside ("Use sample evaluation"), shown when `isGuidedDemo || NODE_ENV === "development"`, on both the `QuestionScreen` and `ScenarioScreen`.

The **single weakest moment in the first 90 seconds** lives here. The "Use sample evaluation" shortcut calls `createPostEvaluationPreviewState` (`lib/experiments/experimentState.ts`), which returns `stage: "revision-result"` with `activeRole: careers[0]`. So instead of jumping to the synthesis, it drops the viewer into a mid-trial *revision-result* screen for role A, after which they must click: `revision-result → role-reaction` (role A, with required preference + work-reaction + sufficiency choices), then `completeRole` advances to role B's `role-primer`/`revision-result`, another `role-reaction` for role B, then `activity-reflection` (a required reaction for every activity across both roles), then `comparison-reflection` (a required repeat-task choice), and only then `summary`. That is at least four more required-input screens after the viewer clicked a button labelled as a shortcut. A cold reviewer expecting a preview of the result will instead hit a wall of forms. This is the place the demo is most likely to lose a 90-second viewer.

Other demo-path integrity notes:
- `isSupportedExperimentPair` (`experimentState.ts`) requires both careers to have a `roleTrials` entry. All 12 careers in `data/careers.ts` have trials (`data/roleTrials/{advisory,productData,research}.ts`), and the demo pair PM + Management Consultant is supported, so the "This role pair is not available" dead-end cannot trigger on the demo path. It *can* trigger on the free path for any pair the user picks — but all 12 are covered, so in practice it is unreachable. Fine for a portfolio piece.
- Evaluation loading/error states exist (`EvaluationScreen` with `status === "evaluating"` and a `failed` + retry branch). The demo's sample path bypasses the live evaluator, so a cold viewer never sees a spinner or an API error — good.

---

## B. Product-thinking legibility

Assessed against the four principles, from the UI a cold viewer actually sees.

**Principle 1 — no generic career-fit score (and its absence is deliberate).**
Perceivable, and repeatedly reinforced. The welcome screen states the result is "Not a fit score, personality verdict, or definitive career answer" (`WelcomeScreen.tsx`, `welcome-outcome`). The evidence map says "This is not a career recommendation" and every coverage bar is captioned "not an ability, performance, or career-fit score" (`StartingEvidenceMapScreen.tsx`). The experiment summary leads with the eyebrow "Experiment evidence, not a verdict" and closes with "This is not a career recommendation" (`SummaryScreen` in `CareerExperimentScreenV2.tsx`). A cold viewer would clearly perceive the deliberate absence of a score.
One watch-item: the summary's `directional-signal` block ("the preference signal leaned toward [role]") computed by `buildDirectionalSignal` could be *misread* as a soft verdict. It is well-hedged in copy ("a direction from one supported exercise, not a conclusion about the whole career") and is explicitly built only from the user's own preference/repeat-choice/activity reactions, not performance — so it does not violate principle 1. But it is the one spot a careless reader could mistake for a recommendation. Worth keeping the hedge copy prominent if a one-pager reuses this.

**Principle 2 — distinguish existing vs inferred vs unknown evidence.**
Partly legible, and this is the weakest of the four at a glance. The *unknown* dimension is very visible: "Important work still untested" on the evidence map, "What remains unknown" in the experiment synthesis (`RoleEvidenceSection`), and the `evidence-state-key` legend. The *existing* dimension is clear too ("Confirmed experience", "Evidence found" / "Not yet seen" per activity). The *inferred* dimension — the semantic mapping that decides a resume activity is "Transferable"/"Adjacent" to a career — is present (the relationship labels + rationale in `EvidenceTunnelScreen.tsx`, and `EvidenceProvenance.tsx` on the overview screen) but is **not** named as "inferred" in a single at-a-glance key. A viewer sees "Transferable" and a rationale, but the three-way existing/inferred/unknown taxonomy from AGENTS.md is never shown as one unified legend. It is legible if you read carefully; it is not legible at a glance. (Verify against rendered layout — I read the JSX, not the running DOM.)

**Principle 3 — performing an activity ≠ liking it.**
Clearly perceivable. Stated on the welcome screen ("Doing something before does not mean you enjoyed it"), on the overview screen ("Everything you leave on this screen will count as confirmed experience. We'll ask what you want more or less of later"), and structurally enforced: the evidence tunnel asks preference *separately* from coverage, and `StartingEvidenceMapScreen` keeps "resume activity coverage" and "Preference" as visibly distinct rows, including the "No preference evidence" state that explicitly means "no evidence", not "disliked". Strong.

**Principle 4 — an experiment generates evidence, it does not simulate a real career.**
Clearly perceivable. The `experiment-note`s repeat it ("This is not a career-knowledge test", "Make a genuine first attempt. The evaluator … does not calculate a career-fit score"), and the summary's closing `experiment-verdict`: "A different case can add another piece of evidence, but it still will not represent sustained real work." Strong.

Bottom line: a cold viewer would correctly read principles 1, 3 and 4. Principle 2's three-way taxonomy is the one that is present but not surfaced as a single legible model — the best candidate for reinforcement in the one-page summary.

---

## C. End-of-app one-page summary

**Does a closing summary already exist?** There is a `SummaryScreen`, but it is **inside** the experiment sub-machine (`CareerExperimentScreenV2.tsx`, rendered when `stage === "summary"`), and it is scoped to the *work trial*, not the whole journey. It shows, per role: preference evidence, rubric performance, response to feedback, "what appears developmental", and "what remains unknown" (`RoleEvidenceSection`), plus the `directional-signal` block and an optional reflection interpretation. Its two exits are "Try another case" and "Finish and return to evidence map" (`onBackToMap` → `showEvidenceStage("map")` in `app/page.tsx`).

**Where it falls short for a portfolio reviewer:** (1) It only summarises the work trial — it does not tie the trial back to the *starting evidence map*, so the product's whole thesis (past evidence → unknown → experiment → new evidence) is never shown on one screen. (2) Its terminal action sends the viewer **backward** into the dense evidence map (step 6), which is a confusing place to "end" a demo — there is no forward-facing closing screen and no "what I'd test next" framing aimed at the reviewer. (3) It is written for the *user* ("How did the work feel?"), not for a *portfolio audience* who wants the "so what".

**Where a true end-of-app summary would slot in.** Two viable options, choose the second:
- Option A: add an 8th step in `app/page.tsx` (`step === 8`) and change the experiment's `onBackToMap` to advance forward to it instead of back to the map. Requires extending the `Step` type (`types/prototype.ts`) and the `Progress` component labels (`components/Progress.tsx`, which currently hardcodes 7 steps and `(step / 7) * 100`).
- **Option B (recommended, lower plumbing): add a new terminal `stage: "closing-summary"` inside `CareerExperimentScreenV2.tsx`**, reached from the existing `SummaryScreen` via a new "See the one-page summary" button, rendered by a new `ClosingSummaryScreen` component. This keeps all the experiment state in scope (no prop-threading back up to `app/page.tsx`) and avoids touching the top-level step machine and Progress bar. It is the smallest reversible change, which matches the AGENTS.md discovery-stage principle.

**What the one-page summary should contain** (reinforces the thesis without any fit score — principle 1):
1. **The two careers compared** — `state.selectedCareers` → `getCareerModel(id).title`.
2. **The question tested** — `getExperimentQuestionText(state)` (already used at the top of `SummaryScreen`).
3. **What the starting evidence showed**: which activity groups had existing evidence vs which were unknown. This is the one piece that currently lives *up* in `app/page.tsx` (`topEvidenceActivities`, `evidenceResponses`) and is computed by `buildStartingEvidence` — see the plumbing note below.
4. **What the work trial revealed** — per role: the post-support preference (`trial.preferenceEvidence.preference` via `preferenceLabels`), the work reactions (`trial.workReactions` via `workReactionOptions`), and the evidence-sufficiency answer (`trial.evidenceSufficiency`). All already in `state.roleTrials`.
5. **The direction, hedged** — reuse `buildDirectionalSignal(state, testedRoles)` (already defined in the same file) with its existing "not a conclusion about the whole career" caption.
6. **What remains unknown** — `roleTrials[role].remainingUnknowns` (already rendered in `RoleEvidenceSection`).
7. **An explicit "what I'd test next"** — can reuse `interpretComparisonReflection(...).nextQuestion` (already computed in `SummaryScreen`) and/or each career's `uncertainty.question` from `data/careers.ts`.

**Data already available at that point (no new plumbing needed):** inside `CareerExperimentScreenV2.tsx` the component already holds the full `CareerExperimentState`: `selectedCareers`, `mode`, `scenarioId`, `roleTrials[*]` (responses, both evaluations, `preferenceEvidence`, `workReactions`, `evidenceSufficiency`, `learningResponse`), `activityReflections`, `comparisonReflection`, `directComparisonChoice`. Helpers `getTaskSequence`, `getExperimentQuestionText`, `buildDirectionalSignal`, `interpretComparisonReflection`, and `roleTrials[*].remainingUnknowns` are all in scope. **The one gap:** items referencing the *starting* evidence map (point 3) — `topEvidenceActivities`, `evidenceResponses`, and the `buildStartingEvidence` output — live in `app/page.tsx` and are **not** currently passed into `CareerExperimentScreen` (it only receives `careers`, `isGuidedDemo`, `onBackToEvidenceMap`). To include the "existing vs unknown at the start" recap, a future step must thread those two state values (or the `buildStartingEvidence` result) down as new props. Everything else needs no new plumbing. Note: Option B would need `scenario.name` / the scenario object (`getExperimentScenario(state.scenarioId)`) which is also already in scope.

Scope guard: all of the above stays within the 12-career model, adds no dependency, no LLM, no backend, and computes no score — consistent with AGENTS.md and the task constraints.

---

## D. Portfolio polish punch list (highest leverage first)

### Worth doing before posting

1. **(M) Add the end-of-app one-page summary (the "so what").** Implement Option B: a terminal `closing-summary` stage + `ClosingSummaryScreen` in `components/screens/CareerExperimentScreenV2.tsx`, reached from the existing `SummaryScreen`. Contents per section C. Thread `topEvidenceActivities` + `evidenceResponses` (or the `buildStartingEvidence` result) from `app/page.tsx` into `CareerExperimentScreen` if you want the start-of-journey recap. Files: `components/screens/CareerExperimentScreenV2.tsx`, `app/page.tsx` (props only), possibly a new `components/screens/ClosingSummaryScreen.tsx`. This is the single highest-leverage change — it gives the demo a forward-facing ending instead of looping back to the evidence map.

2. **(S) Make the "Use sample evaluation" shortcut actually skip to the synthesis.** Today `createPostEvaluationPreviewState` returns `stage: "revision-result"`, forcing four more required-input screens before any summary (`lib/experiments/experimentState.ts`). For the guided demo specifically, have the preview land on `stage: "summary"` (or the new `closing-summary`) with the reaction/reflection fields pre-filled with clearly-labelled sample values, so a cold viewer who clicks the shortcut actually sees the payoff in one click. Files: `lib/experiments/experimentState.ts` (`createPostEvaluationPreviewState`), and the summary copy already flags preview data via `state.isDevelopmentPreview`. This is the fix for the weakest-moment identified in section A.

3. **(S) Surface the existing / inferred / unknown taxonomy as one at-a-glance key.** Principle 2 is present but scattered. Add the three-way legend (reusing the existing `evidence-state-key` pattern in `StartingEvidenceMapScreen.tsx`) and explicitly label the semantic relationship labels ("Transferable"/"Adjacent") as *inferred* evidence where they appear (`EvidenceTunnelScreen.tsx`, `EvidenceProvenance.tsx`). Copy-only change, no logic. Files: `components/screens/StartingEvidenceMapScreen.tsx`, `components/screens/EvidenceTunnelScreen.tsx`, `components/EvidenceProvenance.tsx`.

4. **(S) Orient the cold viewer when the demo drops them into step 4.** The demo starts mid-flow at experience selection; add one line on `ExperienceSelectionScreen.tsx` (shown when the demo banner is active) making clear the sample experiences were chosen for them and they can just continue. Lowers the "what am I looking at" cost in the first 10 seconds. Files: `components/screens/ExperienceSelectionScreen.tsx` (or the banner in `app/page.tsx`).

### Nice but skippable (do not block posting)

5. **(S) Trim required inputs on the demo path.** The evidence tunnel requires a preference for every group and the experiment requires reactions for every activity. For a portfolio demo these could be optional or pre-filled, but this overlaps with items 1–2 and is not worth a separate pass. Files: `EvidenceTunnelScreen.tsx`, `ActivityReflectionScreen` in `CareerExperimentScreenV2.tsx`.

6. **(S) Soften the `directional-signal` wording one notch.** It is already well-hedged; only revisit if the new one-pager reuses it prominently, to be sure it never reads as a verdict. File: `CareerExperimentScreenV2.tsx` (`buildDirectionalSignal`, `SummaryScreen`).

7. **(XS) Replace silent `return null` guards with nothing-to-show fallbacks.** `EvidenceTunnelScreen` (`if (!group) return null`) and skipped narrative cards are unreachable on the demo, so this is robustness polish only, not a demo-path fix. Files: `EvidenceTunnelScreen.tsx`, `StartingEvidenceMapScreen.tsx`.

### Explicitly out of scope (consistent with the brief)
No new careers (12-career model is complete), no auth/persistence/analytics, no robust-parsing overhaul, no design-system, no new dependencies, no LLM/backend, and no fit score. All recommendations above are copy or small state/stage changes within the existing architecture.

---

### Verification note
Findings are grounded in the source files listed (read, not executed). I did not run the app or inspect the rendered DOM, so claims about exact on-screen layout/visual density (e.g. "densest screen") are inferred from the JSX structure and should be confirmed in a browser before acting on the copy-placement items.
