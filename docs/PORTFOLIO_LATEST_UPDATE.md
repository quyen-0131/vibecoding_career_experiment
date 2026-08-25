# Latest portfolio update - 24 August 2026

This document records the changes made after the illustrated 32-page progress checkpoint.

## What changed

1. Preference review moved from individual activity cards to activity-group pages.
2. A maximum of 10 informative canonical activities is still selected, but related work is reviewed together.
3. The evidence map now displays resume activity coverage for each career group.
4. Coverage uses only Core and Important activities and is explicitly not an ability or fit score.
5. Group preference appears only when matching evidence exists for that career.
6. A neutral "No preference evidence" state explains why a preference is absent.
7. The duplicate "evidence found in your resume" list was removed.
8. The evidence map now leads with grouped career work and then shows important work still untested.
9. Strategic recommendations now map to Product Management.
10. Transfer mappings were broadened for metrics, client presentations, stakeholder communication, customer research, product strategy, and programming/data tooling.
11. Low/high semantic confidence, matched action/object details, and other implementation debugging labels were removed from the consumer UI.
12. The local skill and role knowledge layer now uses curated taxonomy plus generated O*NET-derived reference data.
13. Current domain coverage is 69 passing tests, with ESLint, TypeScript, and the production build passing.

## The revised decision model

    Reviewed past activity
    -> canonical activity
    -> activity group
    -> one group preference
    -> career-specific mapping
    -> resume activity coverage
    -> important work still untested
    -> user-selected experiment question

## Why the review changed

The earlier flow asked users to make similar preference decisions repeatedly. Grouping related work reduces fatigue while preserving the detailed activities as visible evidence.

The key product assumption is now:

> One group-level answer is easier to complete and still accurate enough to guide which unknown should be tested.

This must be validated with users rather than assumed.

## Why coverage remains

The coverage bar answers a factual question:

> How many of this career's Core and Important activities in this group appear in the resume evidence I reviewed?

It does not answer:

> How good am I at this career?

Every card shows the count and denominator so the percentage remains interpretable.

## Why preference can be absent

A user can have execution evidence relevant to one career but not the other. Preference should not be copied across activities simply because they share a broad group.

The interface now distinguishes:

- Preference: More / About the same / Less - matching past evidence exists.
- No preference evidence - none of that career's activities in the group appeared in the reviewed resume.

## Files behind the latest change

| Question | Main file |
| --- | --- |
| Which activities reach review? | lib/evidence/selectTopEvidenceActivities.ts |
| How are activities grouped? | lib/evidence/selectTopEvidenceActivities.ts |
| How is group preference stored? | components/screens/EvidenceTunnelScreen.tsx |
| How is coverage calculated? | lib/evidence/buildStartingEvidence.ts |
| How is the evidence map displayed? | components/screens/StartingEvidenceMapScreen.tsx |
| What work defines each career? | data/careers.ts |
| What is the canonical vocabulary? | data/activityCatalog.ts and data/skillTaxonomy.ts |
| What broadens the task language? | data/generated and data/raw/onet |

## Product questions still open

- Are Research, Analysis, Communication, Strategy and planning, and Execution and collaboration the right groups?
- Does one preference per group hide important differences?
- Do users interpret coverage correctly without thinking it is skill?
- Should coverage include Supporting activities later?
- Which career mappings do users dispute most?
- Which unknowns lead to the most useful work trials?
