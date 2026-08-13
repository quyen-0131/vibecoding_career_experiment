# AGENTS.md

## Project

This repository contains an early-stage product discovery prototype called **The Career Experiment**.

The product helps students and early-career professionals who are considering multiple plausible career paths but do not have enough opportunities or resources to experience all of them.

The intended product loop is:

Past experiences
→ extract work activities
→ identify evidence about what the user enjoys or dislikes
→ compare that evidence with future career activities
→ identify important unknowns
→ generate realistic career experiments
→ collect new evidence
→ update the user's understanding of their career options.

## Current product stage

We are in PRODUCT DISCOVERY, not production development.

Optimise for:
- fast iteration
- simple architecture
- easy-to-change UX
- readable code
- small, reversible decisions

Do not optimise for scale yet.

## Product principles

1. Do not calculate or display a generic career-fit score.
2. Clearly distinguish:
   - existing evidence
   - inferred evidence
   - unknowns
3. Do not assume that a user likes an activity simply because they have performed it before.
4. Career experiments should generate evidence, not claim to perfectly simulate a real career.
5. AI should support the product mechanism, not become a generic career chatbot.
6. Prefer experiential evidence over simply giving users more career information.
7. The product should help reduce decision-relevant uncertainty.

## MVP scope

For the current prototype:

Use:
- Next.js
- TypeScript
- local state
- mock/local data

Do NOT add unless explicitly requested:
- authentication
- databases
- backend APIs
- external APIs
- LLM integrations
- vector databases
- dashboards
- complex analytics
- production infrastructure

## UX principles

- The product should feel like a clean consumer product.
- Avoid dashboard-style interfaces unless clearly necessary.
- Keep onboarding lightweight.
- Use plain language instead of technical or psychological jargon.
- Every screen should have one clear purpose.
- Do not add features that are not explicitly requested.

## Engineering principles

- Keep components small and understandable.
- Prefer simple implementations over clever abstractions.
- Avoid unnecessary dependencies.
- Keep mock product data separate from UI components where practical.
- Use clear file and variable names.
- Do not prematurely create abstractions for features that do not yet exist.

## How to work on tasks

Before coding:
1. Read the task carefully.
2. Inspect the existing repository.
3. Do not expand the scope beyond the request.

After coding:
1. Run relevant lint/type/build checks if available.
2. Briefly explain what changed.
3. Explain any important technical decision in beginner-friendly language.
4. Mention assumptions or unresolved questions.
5. Do not automatically begin the next feature.

## Product discovery rule

If a requested feature conflicts with the current product hypothesis or requires a major architectural commitment, flag the trade-off instead of silently implementing additional complexity.
