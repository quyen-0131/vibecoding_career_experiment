# Resume evidence and role relevance pipeline

The earlier prototype mainly matched literal words. The new pipeline keeps five questions separate:

1. What did the person actually do?
2. What structured evidence is present in the sentence?
3. Which reusable activity or skill may that evidence support?
4. Which occupation does the user's role most closely represent?
5. How relevant is that skill to this particular role?

## Data flow

```text
Original CV sentence
  -> structured resume evidence
  -> canonical skill candidates
  -> explainable skill inference
  -> selected role resolution
  -> role-specific relevance
  -> existing evidence map
```

The original CV sentence is preserved. Skill and role mappings include a reason and confidence, and uncertain results remain unknown. No combined career-fit score is calculated.

## Files to edit

- `data/custom/skill-enrichment.json`: canonical labels, aliases and evidence signals.
- `data/custom/role-occupation-map.json`: modern prototype roles mapped to one or more O*NET occupations.
- `data/fixtures/resume-evidence-cases.json`: human-reviewed example bullets and their expected canonical skill.
- `data/careers.ts`: concise product-specific role descriptions and importance.
- `scripts/generate-onet-taxonomy.py`: converts official workbooks into the local browser-safe index.

## O*NET use

The generator reads Occupation Data, Task Statements, Work Activities, Essential Skills and Transferable Skills. It creates `data/generated/onet-occupations.json` with 1,016 compact occupation profiles. Raw workbooks stay out of the browser bundle and Git.

Work context, interests and work styles were inspected but are not used as resume evidence. They describe conditions or preferences rather than demonstrated activity. The crosswalk and software files can support later refinements.

ESCO data was not supplied, so the prototype does not invent ESCO records. A later adapter can reconcile ESCO roles and skills with the same canonical vocabulary.

## Debugging

In development, `lib/debug/logResumeAnalysis.ts` logs structured evidence, inferred skills, reasons, confidence and role relevance in a collapsed console group. The activity confirmation screen also has a collapsed explanation. Raw CV text is not added to the normal consumer flow.

## Known limitations

- The parser is deterministic and will still miss unusual grammar or implicit work.
- Modern roles may span several O*NET occupations.
- O*NET describes occupations; it does not prove that one resume sentence demonstrates ability.
- Performing an activity does not mean the user enjoyed it or performed it well.

## Best resources for improving it

1. Anonymised CV bullets paired with a human-approved canonical activity.
2. Counterexamples showing what must not be inferred.
3. Role-task libraries from employers or professional bodies.
4. Examples where one activity has different importance in two roles.
5. ESCO occupation and skill exports if ESCO support is required.

Add a fixture before changing an alias or signal. That turns each correction into a repeatable regression test.
