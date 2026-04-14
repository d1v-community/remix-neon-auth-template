# Goal: Turn Remix Neon Auth Into a Sharper Auth-First Foundation

## Design Thinking And Demand Background

- ICP: SaaS teams that need a production-credible auth and database starter without payment complexity on day one.
- Core pain: auth starters often feel generic, under-explain trust, and leave first-run state quality unclear.
- Desired outcome: a starter that communicates safety, speed, and product value before the builder writes custom business logic.
- Product standard for this cycle: benefit-led copy, safe schema bootstrap, and clean signed-out to signed-in transitions.

## Validators For This Cycle

- Reuse the validator registry from `AGENTS.md`.
- Selected validators: `@cro-copy-qa`, `@frontend-ui-qa`, `@api-backend-qa`, `@data-schema-qa`, `@auth-state-qa`, `@responsive-accessibility-qa`, `@performance-seo-qa`.

## Todo List

- [ ] Ideate a short, creative product name and replace `D1V DEMO` globally.
  - Owner: main agent
  - Verification: choose a final name, run `rg -n "D1V DEMO" .`, and confirm only intentional planning references remain
  - Status: pending
  - Evidence: pending
  - Notes: update header, metadata, pricing/product labels, and any other user-visible brand references together.

- [ ] Rewrite the original landing-page and onboarding copy so the foundation sells trust and speed, not just features. `@cro-copy-qa` `@frontend-ui-qa` `@performance-seo-qa`
  - Owner: main agent
  - Verification: `pnpm run lint`; manual review of hero, proof, CTA, onboarding, and empty-state copy
  - Status: pending
  - Evidence: pending
  - Notes: apply the CRO-copy standard with clear Promise / Proof / Push and benefit-first wording.

- [ ] Run `pnpm run db:migrate`, repair any backend issues, and record a real API smoke test. `@data-schema-qa` `@api-backend-qa` `@auth-state-qa`
  - Owner: main agent
  - Verification: `pnpm run db:migrate`; local API smoke request covering success path, auth/error path, and expected data shape
  - Status: pending
  - Evidence: pending
  - Notes: if schema or seed fixes are required, document them before re-running the smoke test.

- [ ] Re-validate the core auth journey after the copy and backend pass. `@frontend-ui-qa` `@auth-state-qa` `@responsive-accessibility-qa`
  - Owner: main agent
  - Verification: manual walkthrough of entry -> sign up/login -> signed-in state -> guarded state
  - Status: pending
  - Evidence: pending
  - Notes: loading, empty, and error states must feel intentional, not placeholder-level.
