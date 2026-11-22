# The Career Experiment

**Do not choose a career from a quiz. Test it.**

The Career Experiment is an early-stage product-discovery prototype for people comparing two plausible careers. It turns past experience into activity-level evidence, separates experience from preference, identifies unknowns and uses supported work trials to generate new evidence.

It does not calculate a career-fit score or recommend a career.

## Try the prototype

The welcome screen offers:

- **A five-minute guided demo:** Fictional sample experiences and sample evaluation results. No CV or API credit is required.
- **The full local flow:** Upload a PDF or Word resume and optionally use live qualitative evaluation.

Open http://localhost:3000 after starting the app.

## Product flow

    Choose two careers
    -> add a resume or sample data
    -> select experiences
    -> confirm and normalise activities
    -> select at most 10 informative activities
    -> review related activities in groups
    -> compare resume activity coverage and unknowns
    -> choose a question
    -> complete a supported work trial
    -> reflect on new evidence

## Design and decisions

Why the product is built this way, and what it deliberately refuses to do.

- [The case](docs/the-case.md) - the problem, why quizzes, information and counsellors do not answer it, and the honest limits
- [CONTEXT.md](CONTEXT.md) - the glossary: what each term means and which distinctions the product depends on
- [Architecture decision records](docs/adr/) - the decisions, and why the alternatives were rejected
- [Known issues](docs/known-issues.md) - bugs found, trade-offs taken deliberately, and what is still open

The decisions in short:

| ADR | Decision |
| --- | --- |
| [0001](docs/adr/0001-direction-not-verdict.md) | The product ends with a direction, never a verdict |
| [0002](docs/adr/0002-performance-never-routes.md) | Experiment performance never routes the recommendation |
| [0003](docs/adr/0003-rank-by-what-separates-the-options.md) | A direction ranks by what separates the two career options |
| [0004](docs/adr/0004-pairwise-comparison.md) | A comparison is always exactly two career options |
| [0005](docs/adr/0005-contradictions-are-questioned-not-resolved.md) | A contradiction is surfaced and questioned, never overwritten |
| [0006](docs/adr/0006-experiments-are-role-shaped.md) | An experiment is shaped by the role, not by a user's evidence gaps |

## Portfolio materials

- [Current case study](docs/PORTFOLIO_CASE_STUDY.md)
- [Plain-language algorithm guide](docs/ALGORITHM_GUIDE.md)
- [Latest product update](docs/PORTFOLIO_LATEST_UPDATE.md)
- [Walkthrough script](docs/WALKTHROUGH_SCRIPT.md)
- [Publishing checklist](docs/PUBLISHING_CHECKLIST.md)
- [Illustrated portfolio report](output/pdf/the-career-experiment-portfolio-report.pdf)

## Run locally

    npm install
    npm run dev

Quality checks:

    npm run lint
    npm test
    npx tsc --noEmit
    npm run build

## Optional evaluation

The guided demo does not need an API call. The full work-trial path reads OPENAI_API_KEY and OPENAI_EVALUATOR_MODEL from the local environment file. Restart the development server after changing environment variables.

Never commit the local environment file or expose an API key in client-side code.

## Main logic

| Location | Purpose |
| --- | --- |
| app/page.tsx | Journey and local state |
| components/screens | Product screens |
| data/activityCatalog.ts | Canonical activities |
| data/skillTaxonomy.ts | Broader local skill vocabulary |
| data/careers.ts | Career profiles |
| data/generated and data/raw | Local O*NET-derived role references |
| lib/extraction | Resume experience extraction |
| lib/evidence | Mapping, ranking, grouping, coverage, and synthesis |
| lib/evidence/preferenceShift.ts | Imagined preference against informed preference |
| data/roleTrials | Tasks and rubrics |
| lib/experiments | Experiment state |
| app/api/evaluate-experiment | Server evaluator |

## Important interpretation boundary

Resume activity coverage describes how many Core and Important activities in a career group appear in reviewed past evidence. It is not an ability, performance, or career-fit score.

A missing preference label means no matching preference evidence exists for that career group. It does not mean the user skipped the question or disliked the work.

## Limitations

Deterministic resume parsing can struggle with unusual layouts. The activity taxonomy, transfer mappings, grouping model, attention-ranking weights, and career profiles are product hypotheses that require further validation. One short work trial cannot establish objective ability or sustained career preference.
