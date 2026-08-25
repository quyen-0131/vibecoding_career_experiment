# Portfolio publishing checklist

## Recommended package

Publish:

1. A live guided demo with fictional sample data.
2. A concise case-study page.
3. A two-minute walkthrough video.
4. A public GitHub repository.

Describe the project as an interactive product-discovery prototype, not a finished career platform.

## Live demo

- Use a host that supports the Next.js application and server route.
- Make the guided demo the default reviewer path.
- Test desktop and mobile widths.
- Verify that Start over resets the flow.
- Keep sample evaluation clearly labelled.
- Do not require a CV or live AI call.

## API and privacy

- Store OPENAI_API_KEY only as a server-side environment variable.
- Never commit the local environment file.
- Rotate any key shown publicly.
- Protect or disable public live evaluation if usage limits are unavailable.
- Explain that the prototype has no database.
- Prefer fictional sample data for review.

## GitHub

- Confirm the local environment file is ignored.
- Include screenshots, setup instructions and limitations.
- Link the case study, algorithm guide and walkthrough script.
- Check history for previously committed secrets before publishing.

## Final quality gate

- A reviewer understands the product from the welcome screen.
- The guided flow requires no personal information.
- No dead ends remain.
- Back navigation preserves answers.
- Mobile and keyboard interactions work.
- Lint, tests, TypeScript and production build pass.
- No API key is tracked.
- A video exists as a fallback.