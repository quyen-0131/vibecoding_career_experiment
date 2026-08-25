# How The Career Experiment works

This guide explains the product algorithms without assuming a coding background.

An algorithm is a repeatable recipe: information goes in, a set of rules is applied, and a result comes out.

## The complete evidence pipeline

    CV or sample data
    → structured experiences
    → detected work activities
    → canonical activity vocabulary
    → relevance to two careers
    → maximum 10 informative activities
    → activity groups
    → one preference per group
    → resume activity coverage and unknowns
    → supported career work trial
    → new evidence

The application does not calculate a career-fit score. Each stage preserves the difference between what the user has done, what the product infers, what the user prefers, and what remains unknown.

## 1. Find experiences

**Input:** Text extracted from a PDF or Word CV.

**Rules:** Look for experience sections, role-like titles, organisations and action statements. Exclude likely education, awards, scholarships and certifications.

**Output:** Structured experiences containing a title, organisation, type, description and activities.

**Important limitation:** This is a deterministic parser, not human-level document understanding. Unusual layouts can still be misread.

**Code:** lib/extraction/extractExperiencesFromCv.ts

## 2. Detect work activities

**Input:** The description belonging to one experience.

**Rules:** Compare the description with a local activity catalogue.

| CV wording | Canonical activity |
| --- | --- |
| Analysed survey data | Quantitative data analysis |
| Interviewed customers | User and customer research |
| Improved a reporting workflow | Process optimisation |
| Presented recommendations to clients | Client presentations |
| Liaised with government authorities | Stakeholder communication |

If a meaningful sentence has no catalogue match, preserve it as a custom activity instead of deleting it.

**Output:** Multiple activities belonging to the same experience.

**Code:** data/activityCatalog.ts and lib/extraction/extractExperiencesFromCv.ts

## 3. Translate detailed wording into transferable work

**Input:** A detected activity or user-entered sentence.

**Rules:** Identify one or more activity components. A component can be explicit, meaning directly stated, or inferred, meaning reasonably implied.

Example:

    Created a launch toolkit with a survey and recommendation

can support product launch planning, enablement materials, research design and recommendation development.

**Output:** A concise transferable activity, its category, supporting components and confidence.

**Code:** lib/evidence/semanticActivityMapping.ts

## 4. Merge duplicates without losing provenance

**Input:** Activities from all selected experiences.

**Rules:** Activities with the same canonical identity are merged. Keep every unique source experience and every original piece of wording.

Example:

    Analysed employee survey data — Trulioo
    Conducted quantitative analysis — Decision Lab

becomes:

    Quantitative data analysis
    Seen across 2 experiences

The original sentences and organisations remain available.

**Output:** A deduplicated activity list with recurrence and source evidence.

**Code:** lib/evidence/normalizeActivities.ts

## 5. Relate one activity to two careers

**Input:** A canonical activity and two selected career profiles.

**Rules:** Describe the relationship as direct, transferable, adjacent or unknown. Use the career profile to attach importance and a career-specific explanation.

The activity label stays the same, but its use in each career is described differently.

**Output:** Career relevance for both roles. This is local model inference, not confirmed evidence about the user.

**Code:** data/careers.ts and lib/evidence/semanticActivityMapping.ts

## 6. Choose a maximum of 10 activities

Reviewing every extracted activity would create unnecessary effort. The hidden ranking considers:

1. relevance to the two careers;
2. how much the activity distinguishes the careers;
3. how many experiences support it;
4. confidence in the mapping.

The current sorting formula is:

    combined career relevance × 4
    + difference between careers × 3
    + evidence breadth
    + mapping confidence

The numerical result is never shown and is not a fit score. It only decides which activities are most useful to ask about.

The algorithm then tries to include up to four activities relevant to both careers, around three that particularly inform Career A, and around three that particularly inform Career B.

**Product assumption to test:** Whether these weights select activities that users consider representative and useful.

**Code:** lib/evidence/selectTopEvidenceActivities.ts

## 7. Group activities before asking preference

The selected activities are placed into familiar types of work: Research, Analysis, Communication, Strategy and planning, Execution and collaboration, and Other work.

The user sees every activity and source inside one group, then answers once for the group overall: More, About the same, or Less.

**Trade-off:** Grouping reduces fatigue but can hide meaningful differences between activities. This needs user validation.

**Code:** lib/evidence/selectTopEvidenceActivities.ts and components/screens/EvidenceTunnelScreen.tsx

## 8. Build the Career Evidence Matrix

The conceptual model still keeps four questions separate:

| Evidence dimension | Example |
| --- | --- |
| Have I done it? | Seen across two experiences |
| What type of work is it? | Analysis |
| Do I want more of the group? | More |
| How relevant is it to Career A and B? | Core versus Supporting |

**Code:** lib/evidence/buildCareerEvidenceMatrix.ts

## 9. Calculate resume activity coverage

For each career group, the app counts how many Core and Important career activities appear in the reviewed resume evidence.

    coverage =
    represented Core and Important activities
    divided by
    total Core and Important activities in the career group

The visible count and denominator explain the percentage. It measures past activity coverage, not skill, ability, performance, or career fit.

Preference is shown only when matching past evidence exists for that career group. Otherwise the map says "No preference evidence" and explains that none of those career activities appeared in the reviewed resume.

**Code:** lib/evidence/buildStartingEvidence.ts and components/screens/StartingEvidenceMapScreen.tsx

## 10. Identify evidence gaps

**Input:** The user’s existing activities and a career profile.

**Rules:** Compare career-defining activities with the activities supported by the user’s past experiences.

**Output:** Existing transferable evidence and important areas that remain untested.

Unknown does not mean incapable. It means the available experience does not provide enough evidence.

**Code:** lib/evidence/buildStartingEvidence.ts

## 11. Run a supported career work trial

The user chooses the question they want evidence about. The application supplies a scenario, role primer, first attempt, feedback, revision and reflection.

The trial keeps current response quality, possible knowledge gaps, response to feedback, preference for the work and reaction to individual activities separate.

AI is used only for structured qualitative evaluation of free-text work-trial responses. It is not used as a generic chatbot or career recommender.

**Code:** types/experiment.ts, data/experiments.ts, lib/experiments/experimentState.ts and app/api/evaluate-experiment/route.ts

## How a product manager should review an algorithm

For each stage, ask:

1. What information enters?
2. What rule does the product apply?
3. What result comes out?
4. Which part is confirmed by the user?
5. Which part is inferred by the product?
6. What could go wrong?
7. How would we test the assumption with users?

A useful exercise is tracing one sentence through the complete flow:

    Created proposals using customer research
    → proposal development and user research
    → merged with equivalent experience evidence
    → mapped differently to both careers
    → selected for preference review
    → included in the evidence map
    → used to clarify what remains unknown