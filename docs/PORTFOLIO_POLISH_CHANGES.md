# Portfolio polish changes

## 1. Why these changes were made

The Career Experiment is going on LinkedIn as a portfolio piece, so it needs to
make sense to a cold reviewer (a recruiter or hiring manager) who clicks through
in about 90 seconds and may never type anything.

Two things were holding the demo back:

1. **No forward-facing ending.** The guided demo used to finish by sending the
   viewer *backwards* into the dense "evidence map" screen they had already seen.
   There was no clear "so what" payoff at the end.
2. **The shortcut was not really a shortcut.** The "Use sample evaluation" button
   dropped the viewer into the middle of a work trial and still made them click
   through four more form screens before any summary appeared.

The changes below add a clean one-page summary at the end, make the sample
shortcut jump straight to that payoff, and sharpen a bit of copy so the
product's thinking reads at a glance. No new dependencies, no backend, no
"career-fit score" — all consistent with the product principles in `AGENTS.md`.

---

## 2. What changed, task by task

### Task 1 — New one-page closing summary (the end-of-app payoff)

**Files changed**
- `types/experiment.ts` — added a new stage value `"closing-summary"` to the
  `ExperimentStage` union.
- `components/screens/ClosingSummaryScreen.tsx` — **new** component that renders
  the one-page summary.
- `components/screens/CareerExperimentScreenV2.tsx` — added the forward button on
  the existing trial summary, rendered the new stage, and threaded the new props.
- `app/page.tsx` — passed the starting-evidence data and a "start over" handler
  down into the experiment screen.

**What the summary shows (one clean screen)**
- The two careers compared and the question that was tested.
- A **start-of-journey recap**: for each career, which activity groups already
  had existing evidence vs which were unknown at the start.
- What the supported work trial revealed per role (post-support preference, the
  work reactions selected, and whether the person felt they had enough evidence).
- The direction, **hedged** — it reuses the existing `buildDirectionalSignal`
  helper and keeps its "a direction from one supported exercise, not a
  conclusion about the whole career" wording. It is never a score or a verdict.
- What remains unknown per role.
- An explicit "What I'd test next", reusing the reflection's next question and
  each career's own open uncertainty question.

**Technical decisions, in plain language**
- *Why a new terminal stage instead of a new top-level step?* The experiment
  screen is a small internal state machine (`stage`). Adding one more stage value
  keeps all the trial data already in scope, so we avoid rewiring the app's
  top-level step counter and the progress bar. It is the smallest, most
  reversible change — which matches the product-discovery principle of small,
  easy-to-change decisions.
- *Why thread props from `app/page.tsx`?* The start-of-journey recap needs the
  activities and preferences the viewer reviewed earlier. That data lives higher
  up in `app/page.tsx` (`topEvidenceActivities` and `evidenceResponses`) and was
  not previously handed to the experiment screen. We pass those two values down
  as new, optional props (`startingActivities`, `startingResponses`) and compute
  the recap inside the summary using the existing `buildStartingEvidence` helper.
  The props are optional with safe defaults, so existing callers keep working.
- The existing in-trial summary now has a clear "See the one-page summary"
  button. Its old "return to the evidence map" button was removed as the primary
  ending; a "Start over" link remains on the closing summary so the demo can be
  re-run.

### Task 2 — Make "Use sample evaluation" jump straight to the payoff

**Files changed**
- `lib/experiments/experimentState.ts` — `createPostEvaluationPreviewState` now
  returns a state whose stage is `"summary"` instead of `"revision-result"`.
- `tests/domain.test.mjs` — updated the matching test to assert the new intended
  behaviour.

**What changed**
The sample state now also pre-fills the reaction and reflection fields with
clearly-labelled sample values: a post-support preference, one work reaction and
an evidence-sufficiency answer per role, sample activity reactions for every
activity, a direct-comparison choice and a short sample reflection. Each role
trial is also marked `completed`.

**Technical decisions, in plain language**
- *Why pre-fill sample values?* The one-page summary (and the in-trial summary)
  reads from these fields. If they were empty, the summary would render with
  gaps. Pre-filling them means a cold viewer who clicks the shortcut lands on a
  fully rendered summary in a single click, instead of being asked to fill in
  four screens of forms first.
- *Why keep it clearly labelled as sample?* The state keeps the existing
  `isDevelopmentPreview` flag, and both summaries show a note making clear these
  answers are sample data, not the viewer's real responses. This keeps the demo
  honest.
- The normal (non-preview) flow is untouched — people who answer for real still
  walk through every step as before.

### Task 3 — Surface existing / inferred / unknown as one at-a-glance legend

**Files changed**
- `components/screens/StartingEvidenceMapScreen.tsx` — rewrote the legend so it
  names the three evidence states directly: **Existing evidence**, **Inferred
  evidence**, **Unknown**.
- `components/screens/EvidenceTunnelScreen.tsx` — added one line clarifying that
  relationship labels like "Transferable" and "Adjacent" are *inferred* evidence
  (the local model's interpretation), not something the viewer confirmed.
- `components/EvidenceProvenance.tsx` — added a small "Existing evidence" label
  above the "seen in N experiences" provenance, so confirmed experience reads as
  one of the three evidence states at a glance.

**Technical decisions, in plain language**
These are copy and label changes only — no logic changed and nothing is scored.
The three-way taxonomy was already present in the product but scattered across
screens; naming the states consistently makes the product thinking legible at a
glance.

### Task 4 — Orient the cold viewer at the demo's first screen

**Files changed**
- `components/screens/ExperienceSelectionScreen.tsx` — added an optional
  `isGuidedDemo` prop and one short line (shown only in the guided demo)
  explaining that sample experiences were pre-selected and the viewer can simply
  continue.
- `app/page.tsx` — passed `isGuidedDemo` into that screen.

**Technical decision, in plain language**
The guided demo starts the viewer mid-flow on the experience-selection screen.
Without a cue, a first-time viewer may not realise work was already done for
them. One plain sentence removes that confusion. It only appears in demo mode.

---

## 3. Assumptions and limitations

- The start-of-journey recap groups activities using the existing
  `buildStartingEvidence` helper. A group counts as "existing evidence" when at
  least one of its activities was matched from the reviewed resume, and
  "unknown" when none were. This mirrors the existing evidence-map logic rather
  than introducing a new rule.
- The closing summary intentionally does **not** compute or display any career
  fit score, ranking or verdict, consistent with product principle 1. The
  hedged "direction" reuses the existing, already-hedged helper.
- Styling reuses the existing CSS patterns (the `directional-signal` block and
  card/legend conventions). A few small, scoped CSS classes were added in
  `app/globals.css` for the new summary layout; no design system was introduced.
- The summary is built for the two-career comparison path that the guided demo
  uses. Single-career modes were out of scope for this pass.

---

## 4. Verification results

Run from the repository root:

| Command | Result |
| --- | --- |
| `npm run lint` | Passed, no warnings |
| `npx tsc --noEmit` | Passed, no type errors |
| `npm test` | Passed — 72 of 72 tests |
| `npm run build` | Passed — production build compiled and generated pages |

One existing test (`development preview skips both AI evaluations...`) asserted
the old preview stage (`revision-result`). It was updated to assert the new
intended behaviour (stage `summary` with pre-filled, labelled sample reaction and
reflection fields), which is the point of Task 2.
