# A Core Tension is stated, never resolved

When a Career Option treats an Activity Group as Core and the User wanted less
of that work after doing it, we say so. Core work is the part of a job that
cannot be avoided by choosing a different team or employer, so a stated dislike
of it is the most decision-relevant thing a Preference can produce.

We present it as two facts placed side by side - "this is core to a Management
Consultant" and "after doing it you wanted less of it" - and stop there. We do
not conclude that the career suits the User less. That inference is theirs to
make, and drawing it for them from one work sample would be the verdict ADR
0001 refuses.

Four constraints keep it honest:

- **Core only.** Not Important or Supporting. Core is where the claim is strong
  and the work unavoidable; anything looser generates noise.
- **A clear "less" only.** "About the same" is not a tension, and mixed or
  unresolved reactions are not evidence about the work at all.
- **Not when they blamed the task.** If the User attributed a Contradiction to
  the particular exercise rather than the work, it says nothing about the work.
  See ADR 0005.
- **Never aggregated.** One note per group. No counting across groups, no
  proportion, no summary per career. Counting tensions would be a career-fit
  score with extra steps, which `AGENTS.md` principle 1 forbids.

The screen also states the limit in the User's own terms: not wanting one kind
of work does not settle whether a career suits them. A test asserts that
sentence is present, and another asserts the module contains no scoring
arithmetic.

Related: the Direction is gated by the same reactions. Work the User has just
done and wanted less of is not recommended for further exploration; the next
eligible Unknown is offered instead. Preference gates the Direction; experiment
performance never does (ADR 0002).
