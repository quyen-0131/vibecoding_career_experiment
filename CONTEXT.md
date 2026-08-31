# CONTEXT

Domain glossary for The Career Experiment. Terms only — no implementation
detail, no open questions, no spec. If a term here disagrees with the code,
one of them is wrong and it is worth finding out which.

## The product

**The Career Experiment** — the product. Helps a User choose between two
Career Options by turning what they have already done into reviewable
evidence, then generating firsthand experience of the work they have not done.

Note the collision: the product is *The Career Experiment*; a **career
experiment** (lowercase) is one unit of work inside it. Prefer "the product"
and "an experiment" in conversation.

## People

**User** — a third- or fourth-year undergraduate. Has already chosen a major,
and with it an implied set of job titles, but is not confident that path is
right for them. Two common shapes: they are interested in many things, or they
picked the path because others were picking it. Assumed to have little or no
access to institutional career guidance.

The User's question is therefore not "what career exists for me?" but "is the
track I am already on the one I want, and if not, what else?" They are not a
blank slate.

## Evidence

**Experience** — one role, job, or position the User has held. Sourced from
their CV. Contains Activities.

**Activity** — one type of work the User has done, named in short canonical
form ("Quantitative data analysis"), traceable back to the original CV
wording it was derived from.

**Activity Group** — a family of related Activities ("Analysis &
measurement", "Communication & influence"). A navigation aid for review, not
a career value or a fit criterion. Preference is expressed per Group, not per
Activity.

**Confirmed Evidence** — an Activity the User has reviewed and kept. A CV
suggestion is not Confirmed Evidence until the User confirms it. Doing
something is not evidence of enjoying it.

**Preference** — the User's stated wish for *more*, *about the same*, or
*less* of an Activity Group in their future work. Independent of Confirmed
Evidence: having done something says nothing about wanting it.

## Careers

**Career Option** — one of the two careers under comparison. Described by a
local model, not by live labour-market data.

**Career Relevance** — how central an Activity is to a Career Option: *Core*,
*Important*, *Supporting*, or *Limited*.

**Coverage** — the share of a Career Option's important Activities that
appear in the User's Confirmed Evidence. A measure of past activity overlap.
Not ability, not fit, not a prediction.

**Unknown** — an Activity a Career Option treats as important that the User
has no Confirmed Evidence for. The thing an experiment exists to resolve.

## Experiments

**Career Experiment** — a bounded piece of work the User does in order to
generate firsthand evidence about one Unknown. It produces evidence; it does
not simulate a career.

**Work Reaction** — the User's response to having done an experiment: whether
they want more, the same, or less of that work, and whether they yet have
enough evidence to say. "I still need more experience to tell" is a valid and
expected answer.

## Non-goals

**CV tailoring** — out of scope. The CV is an input for recall, not an
artefact the product improves.

**Career-fit score** — out of scope. See `AGENTS.md` principle 1.

**Pay and market demand** — out of scope, and said out loud to the User. Both
matter enormously to the real decision, and the product deliberately does not
answer them: it answers what work the User wants, and the User must weigh
earnings and hiring demand separately.

## Output

**Direction** — what the product gives the User at the end: a prioritised
next action, naming what to explore *first* and what to do about it. Concrete
by design; ambiguous advice is what the product exists to improve on.

**Verdict** — a statement of which Career Option the User should choose.
Never given. See `docs/adr/0001-direction-not-verdict.md`.

**Playground** — the product's stance toward a Career Option: somewhere to
try the different aspects of a job title before committing, rather than
somewhere to be assessed. Choosing to run an experiment for a Career Option
commits the User to nothing.

## Experiments, continued

**Experiment Aspect** — one of the small number of named elements a Career
Experiment decomposes into, fixed by the role rather than assembled from the
User. For a Management Consultant experiment: structuring an ambiguous
business problem; analysing evidence and synthesising insights; communicating
a recommendation and aligning stakeholders. The User gives a Work Reaction per
Aspect, not one reaction for the whole experiment — a single answer is too
coarse to recommend from.

**Skill to Build** — an area the User wants more of but handled shakily in an
experiment. Named in the Direction as something to strengthen. This is the
only place the product speaks about capability, and it is always
forward-looking: the User is never told what they are good at, only what to
work on next. Never called a weakness, a gap, or underperformance.

## Vocabulary rules

**Activities, not skills.** An Activity is something the User has done; a
Skill is something they are good at. The product never infers the second from
the first, so past work is always described as Activities and Activity
Groups. "Skill" is permitted only when looking forward, in **Skill to Build**.
The rule: *you have Activities; you build Skills.*

Activity Groups stay resume-shaped — Research, Analysis, Communication,
Execution — because that is the language the User already uses to describe
their own history.

## Findings

**Imagined Preference** — the Preference a User states in Phase 2, based on
recalling work from their CV. A prediction about how they would feel, not a
report of how they did feel.

**Informed Preference** — the Work Reaction a User gives in Phase 3, after
actually doing an Experiment Aspect.

**Preference Shift** — the difference between a User's Imagined Preference
for an Activity Group and their Informed Preference after an experiment. The
product's most valuable output: it is the one thing no counsellor, quiz, or
amount of reading can produce, and it is direct evidence that experience beats
speculation. A Shift of zero is a real and useful result, not a failure — a
Preference that survives contact with the work is worth something.

**Contradiction** — the notable case of a Preference Shift, where a User asked
for *more* of an Activity Group in Phase 2 and then wanted *the same* or
*less* after doing it. Surfaced to the User rather than silently resolved. It
is not evidence that the User was wrong; it is evidence that recall and
experience disagree, which is the point.

## Constraints

**Attention budget** — the User's attention is a scarce resource and the
product spends it deliberately. Every additional question after an experiment
buys information at the cost of the reflective quality that distinguishes this
from a quiz. When in doubt, ask less and accept a less complete picture.

**First Evidence** — a Work Reaction to an Experiment Aspect the User had no
Confirmed Evidence for. No Preference Shift can be computed, because there was
no Imagined Preference to compare against. Not a lesser result: it is the
first real datapoint the User has ever had about that kind of work, and it is
the reason experiments exist.

**"Skill" is an internal detection word.** The evidence pipeline borrows
O*NET's vocabulary, where a "skill" is a named type of work rather than a
competence — `canonicalSkills`, `SkillInference` and `skillRoleRelevance` all
describe *what the User has done*, and their `confidence` field measures how
sure we are of the evidence, never how good the User is. That naming is
allowed in code that reads CVs. It must never reach a screen: a User is shown
Activities and Activity Groups, and is told what they have done, never what
they are good at. A guard test enforces this.
