# Known issues and open questions

A record of everything found while building the evidence loop, written to be
read later without the conversation that produced it. Each entry says what the
problem is, why it matters, and whether it is fixed.

Nothing here is urgent. Several entries are deliberate trade-offs rather than
mistakes, and they are recorded so a future reader does not "fix" something
that was decided on purpose.

---

## Fixed

### 1. "You wanted less it" - copy that was not English

**What happened.** The preference-shift sentence is assembled from a word map:
`more` / `about the same amount of` / `less`. The sentence ends
"...you wanted WORD it." Only the middle option reads correctly, because its
phrase already ends in "of". The other two produced "you wanted less it" and
"you wanted more it".

**Why it matters beyond the typo.** Nine unit tests covered the shift *logic*
and every one passed. None of them read the *sentence*. Logic tests check that
the right branch was taken; they say nothing about whether the output is
English. This was found in about five seconds of running the app.

**The lesson.** Unit tests and running the thing catch different classes of
bug, and neither replaces the other. Where copy is assembled from fragments,
either test the assembled string or look at it.

**Fix.** A second word map for the standalone case ("more of it", "less of
it"), plus a regression test asserting the broken pattern cannot return.
See `components/screens/CareerExperimentScreenV2.tsx`.

### 2. A guard test tripped on its own comment

**What happened.** A test asserts that `directionRanking.ts` never mentions
rubrics, evaluations, ratings or criteria, enforcing ADR 0002 mechanically.
It failed - because a comment in that file used the word "criterion" to mean a
*ranking* criterion, not a rubric criterion.

**Why it matters.** The tempting fix was to loosen the test. That would have
been wrong: the guard exists precisely because "performance leaks into the
recommendation" is a failure nobody would notice by reading the code six
months later. The comment was reworded to say "tie-break" instead.

**The lesson.** When a strict guard produces a false positive, change the code
to be unambiguous rather than weakening the guard. A guard with exceptions
stops being a guard.

### 3. The README lost its link to the design docs

A rebase discarded an earlier README edit because upstream had rewritten the
same file. The design documents existed but nothing linked to them. Fixed in
commit 5144522.

---

## Open - worth fixing

### 4. The direction has no visual weight

**What "visual weight" means.** How strongly an element pulls the eye: size,
boldness, colour, spacing, position. It is how a page communicates importance
before anything is read.

**The problem.** The direction ("Get some experience of product delivery and
iteration") is the product's final output - the thing the whole flow exists to
produce. On screen its explanation renders in small grey text, *smaller than
the "This is not a career recommendation" disclaimer beneath it*, in a box
styled identically to its four neighbours. It reuses the
`cross-career-synthesis` class rather than having its own.

A user scanning the summary sees five interchangeable panels. Nothing says the
last one is the point, and the caveat currently looks more important than the
answer it qualifies.

**Where.** The `.direction-next` section in `CareerExperimentScreenV2.tsx`.
No rules for that class exist in `app/globals.css`.

### 5. Two sections both announce a conclusion, and the older one names a career

**The problem.** The summary now shows, in order:

- "What your preference evidence points to" - *In this experiment, the
  preference signal leaned toward Product Manager*
- "What to explore next" - *Get some experience of product delivery and
  iteration.*

The first is the pre-existing `buildDirectionalSignal`. The second implements
ADR 0001. Two conclusions in a row is confusing on its own, but the sharper
issue is that the older one puts **a career name in its headline**.

ADR 0001 says a career name may appear as evidence the user reasons from,
never as the conclusion we hand them. "The preference signal leaned toward
Product Manager" is close to the verdict the product is built to refuse. It
was written before that ADR existed, so this is a genuine inconsistency
between the code and its own stated rules.

**Options.** Merge the two sections; demote the older one to supporting
evidence beneath the direction; or reword its headline so the finding leads
and the career name follows.

### 6. Unknowns are ranked in one place and arbitrary in two others

**The problem.** `getRemainingEvidenceGaps` in `data/careers.ts` selects
untested activities with a plain truncation - that is, in whatever order they
happen to be declared in the career model. It is used by:

- `lib/evidence/buildStartingEvidence.ts` - the "Important work still
  untested" list on the evidence map
- `lib/evidence/generateUncertaintyChoices.ts` - the questions offered at the
  start of phase 3

Only the new `rankUnknownsBySeparation` orders unknowns by what actually
distinguishes the two careers. So the evidence map may show a user one set of
untested work, phase 3 may offer questions about another, and the final
direction may name a third - with no stated reason for any of it.

**Why it matters.** ADR 0003 argues that decision-relevant ordering is the
whole point. Applying it in the last screen but not in the two screens that
lead there undercuts the argument.

**Fix.** Have those two call sites rank before truncating.

### 7. The accessibility tie-break is specified but not implemented

ADR 0003 says ties break by what a student can realistically arrange next
term. No career activity carries accessibility data, so ties currently break
by stake, then alphabetically - deterministic, but not what the ADR says.

This is noted in a comment in `directionRanking.ts` rather than silently
diverging. Enabling it means adding one field per activity across twelve
careers: authoring work, not engineering.

---

## Open - deliberate, do not "fix" without deciding

### 8. Nothing persists; a page reload loses everything

All state lives in React `useState`. A refresh returns the user to the welcome
screen with no evidence, no preferences and no direction. This was hit twice
while testing.

This is consistent with the MVP scope in `AGENTS.md`, which excludes databases
and authentication. But note the tension: the product's output is "go and try
this next", which implies the user comes back. `AGENTS.md` describes a loop
ending in "collect new evidence, update the user's understanding", and there
is currently no return path. One honest session is a defensible product; it is
just worth saying out loud rather than discovering later.

### 9. Two vocabularies describe the same 23 things

`data/activityCatalog.ts` and `data/skillTaxonomy.ts` both name the same work.
Of the 26 canonical "skills", 23 have labels identical to activity catalogue
entries, and each carries the same `ActivityCategory`.

The skill layer is a better *detector* - richer matching signals plus O*NET
terms - not a capability model. `SkillInference` has no proficiency or level
field; its `confidence` measures how sure we are of the evidence, never how
good the user is.

The decision was to leave it alone: the naming comes from O*NET, where "skill"
means a named type of work. A guard test keeps the word out of anything a user
reads. But changing a label in one catalogue and not the other will cause a
silent disagreement, so collapse them if that ever bites.

### 10. Performance is shown but never routes anything

Deliberate, and load-bearing. See `docs/adr/0002-performance-never-routes.md`.
Two users with identical preferences get the same direction regardless of how
well they performed. Anyone tempted to "improve" the recommendation by
weighting it with rubric results should read that ADR first - a guard test
will fail if they try.

---

## Repository and environment

### 11. The real product does not live on `main`

`origin/main` is a 27-file skeleton from an early commit. The deployed
application, the API route, the tests and all recent work live on
`origin/codex/evidence-flow-refinements`, which is not the default branch.

Anyone cloning this repository and looking at `main` sees a different, much
smaller product. Merging the working branch into `main` is the fix.

The branch also moved twice during a single working session, which required
rebasing work in progress. Commit early when building on it.

### 12. Corepack is broken on this machine

`corepack pnpm` fails with "EXDEV: cross-device link not permitted" when it
tries to install pnpm across volumes. The workaround is:

    npx --yes pnpm@11 install

Tests run with `node --test tests/domain.test.mjs`. Passing the directory
(`node --test tests/`) does not work - it must be the file.

---

## Already fixed upstream, recorded for completeness

An early review read a stale branch and raised issues that had already been
fixed in the current code: CV activities arriving pre-confirmed, so users
opted out of machine guesses rather than in; a fallback that invented five
activities when a CV matched nothing; per-career unknown lists identical for
every user; and a career selector that silently ignored a third selection.
None of these are present now.
