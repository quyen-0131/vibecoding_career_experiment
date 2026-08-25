# Portfolio case study: The Career Experiment

## Summary

The Career Experiment is an evidence-based career-decision prototype for students and early-career professionals comparing two plausible careers.

It uses past experience to identify activities the user has tried, separates experience from preference, shows how activities transfer differently to two careers, identifies important unknowns and creates a supported work trial.

It does not calculate a career-fit score or recommend a career.

## Product hypothesis

People often have career information but lack firsthand evidence about the work. If the product organises past experience into activity-level evidence and helps users test a meaningful unknown, they can make a better-informed next decision.

## Product mechanism

    Past experiences
    → work activities
    → confirmed evidence
    → preference
    → relevance to two careers
    → unknowns
    → supported work trial
    → new evidence

The app designs the trial. The user chooses the question.

## Current journey

### Find existing evidence

Choose two careers, upload a PDF or Word CV, review experiences, and confirm activities.

### Find uncertainty

Select a maximum of 10 informative activities, group related work, and ask once whether the user wants More, About the same or Less for each group. The evidence map then compares resume activity coverage, matching group preference, and important untested work for both careers.

### Plan and experience a career experiment

Choose a question, read a shared scenario and role primer, make a first attempt, receive qualitative feedback, revise one part, and reflect on the nature of the work.

## Major iterations

### Job descriptions became one activity

The manual-entry flow originally treated an entire paragraph as one task. Experiences now contain arrays of separate activities.

**Learning:** The unit of career evidence is an activity, not a job description.

### PDF extraction destroyed line structure

Text was reconstructed into approximate lines before experience parsing.

**Learning:** Document extraction and semantic interpretation are separate problems.

### Literal matching produced weak activities

A canonical catalogue and semantic transfer layer now translate detailed CV wording into transferable activities while preserving the original sentence.

**Learning:** Users need both recognition of their experience and a stable vocabulary.

### Duplicate activities reduced trust

Normalisation now merges canonical duplicates and preserves each source experience.

**Learning:** Provenance matters, but detail should be progressively disclosed.

### Preference review became too long

A hidden ranking still selects a balanced maximum of 10 activities using career relevance, discriminative value, evidence breadth and mapping confidence. Related activities are now reviewed together, and the user answers once per activity group.

**Learning:** Ranking manages attention, while grouping reduces repeated decisions. Neither is a fit score.

### Resume coverage looked like a score

The evidence map now shows the visible number of Core and Important career activities represented in each group, with explicit copy that coverage is not ability or fit.

**Learning:** A percentage is interpretable only when its denominator and meaning remain visible.

### Missing preference looked like a skipped answer

Preference appears only when matching past evidence exists for that career group. Otherwise the map says "No preference evidence" and explains why.

**Learning:** Absence of evidence needs an explicit reason.

### Career descriptions were generic

Canonical activity labels now remain stable while career profiles explain how the same activity functions in each role.

**Learning:** Transferability depends on how an activity is used, not only whether it appears.

### The first experiment was a questionnaire

The experiment now includes a primer, first attempt, qualitative feedback, focused revision and post-support reflection.

**Learning:** Missing knowledge is not low ability, and current performance is not preference.

## Guided portfolio demo

The five-minute guided demo uses fictional sample experiences, preselects Product Manager and Management Consultant, and follows the real evidence pipeline. It offers clearly labelled sample evaluation results, so no API call or personal CV is required.

The full upload and live-evaluation path remains available separately.

## Architecture

| Layer | Responsibility |
| --- | --- |
| app and components | Screens, navigation and local state |
| document libraries | Local PDF and Word extraction |
| extraction | Temporary deterministic experience parsing |
| activity catalogue | Canonical activity vocabulary |
| evidence libraries | Mapping, normalisation, ranking and synthesis |
| career data | Structured local career profiles |
| experiment data | Scenarios, primers, tasks and rubrics |
| evaluator route | Server-side structured AI evaluation |
| types | Contracts separating evidence dimensions |

## Key design decisions

| Decision | Why | Expected behaviour | Proposed measure |
| --- | --- | --- | --- |
| Three-phase roadmap | Reduce process uncertainty | Users understand why later work is needed | Welcome-to-demo continuation |
| Explain why the CV is used | Reduce privacy and evaluation anxiety | More users provide usable evidence | Upload or sample continuation |
| Separate experience and preference | Avoid performed-equals-liked assumptions | More deliberate preference answers | Comprehension interview |
| Canonical vocabulary | Improve continuity and trust | Fewer edits and backtracks | Activity edit rate |
| Maximum 10 activities | Reduce fatigue | More completed reviews | Preference-step completion |
| Shared scenario | Control for topic preference | Users compare work, not industries | Comparison completion |
| Primer before trial | Reduce knowledge confounding | More meaningful attempts | Answer completion |
| Sample evaluation | Remove cost and reliability barriers | Reviewers reach synthesis | Guided-demo completion |
| No fit score | Avoid false precision | Evidence is treated cautiously | Trust interview |

## What is deterministic

PDF and Word extraction, experience detection, activity mapping, duplicate merging, activity grouping, career profiles, Top-10 selection, resume activity coverage, evidence gaps, scenarios and task definitions are local or deterministic.

AI is used only for structured qualitative evaluation of free-text experiment responses. The guided demo uses pre-written sample evaluation results instead.

## Limitations

- Unusual CV layouts can still confuse deterministic parsing.
- The activity taxonomy cannot represent every form of work.
- Semantic mappings and ranking weights require user validation.
- Career profiles are prototype models, not universal definitions.
- One work trial cannot establish objective ability or sustained career preference.
- Live AI evaluation can vary and depends on an external provider.

## Suggested research

Test with five to eight people who are comparing two careers. Ask:

1. What does the product help you do?
2. Why does it ask for a CV?
3. What is the difference between work you have done and work you want more of?
4. What does the evidence map still not know?
5. What will the experiment help test?
6. Did the selected activities represent your useful experience?

## Portfolio framing

Present this as an interactive product-discovery prototype:

> An evidence-based career decision prototype that turns past work into testable career uncertainties. It separates experience, preference, career-model inference and unknowns instead of producing a generic fit score.

See [the algorithm guide](./ALGORITHM_GUIDE.md) for a non-technical explanation of the decision logic.