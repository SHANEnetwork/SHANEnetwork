# SHANE integration audit: launch-focused engineering decisions

Date: 2026-10-30. Scope: development branch only; no production or SHON changes.

## Competitive benchmark
Wix Harmony supports prompt-driven site creation, visual refinement, and collaboration. Replit Agent describes browser-based testing and repair. SHANE should not claim either is novel. Differentiate through the continuing endeavor-to-network journey, while matching the baseline for usability and reliability.

## Observed implementation, not assumed readiness
- `shane-composition.js` provides a pure, versioned module-specification foundation, but does not itself provision capabilities.
- `shane-capability-manifest.js` explicitly distinguishes integrated, planned, and unverified capabilities. Preserve these states in customer-facing promises.
- `shane-endeavor-orchestrator.js` derives status from persisted links; it does not automatically provision all modules. Its communication state is unverified.
- `shane-endeavor-diagnostics.js` performs local structural checks, not live remote health monitoring or automatic repair.
- `shane-network-connector.js` has listing preparation and an authenticated connector boundary. Verify the real database lifecycle rather than assuming all network features are integrated.
- The builder and public site currently embed the production Supabase URL. Test-only substitution must never change production pages.
- Browser smoke tests include mocked Supabase responses; they are not complete live-account acceptance tests.

## Architecture decisions
1. Keep **one persisted endeavor identity** and explicit links to site, organization, and network listings; do not merge unrelated services into one mutable object.
2. Use versioned capability contracts with `planned / configured / verified / degraded` states; never display a planned capability as operational.
3. Isolate each capability's failure. An AI or messaging failure must not overwrite a saved draft.
4. Use owner-scoped writes, optimistic revision checks, idempotent retries, and confirmed returned IDs. Record diagnostic codes without private message contents.
5. Make the main user journey vision → working preview → conversational refinement → save → publish. Advanced forms remain optional, not the entry experience.
6. Preserve SHON as a separate people-centered community, with independent data, permissions, and deployment. Audit compatibility without modifying SHON.
7. Prefer repair of current modules to a rewrite. Every architectural change requires a regression test and an explicit rollback path.

## Launch-blocking acceptance work, in order
A. Isolated browser configuration and test execution; explicitly run guard tests in CI.
B. Real test member: vision, generation, save, reload, refinement, publish, anonymous visibility, unpublish.
C. Two distinct test members: invitation, consent, private message, shared task; outsider denied.
D. Failure recovery: interrupted save, stale revision, retry without duplicate or lost draft.
E. Production readiness and design review: accessible, responsive, visually distinctive, AI-first landing and creator experience; verify domain/deployment.

Defer optional capabilities until the core experience passes. Batch related defects per acceptance journey instead of creating one commit per trivial assertion.

## Wix feature parity and differentiation check (2026-10-30)
Wix Harmony offers conversational AI creation, responsive visual editing and live site collaboration. Wix also offers groups, member chat, events, automations, business AI agents and marketing tools. These are competitive baseline features, **not** unique SHANE differentiators.
Sources:
- https://support.wix.com/en/article/introducing-the-wix-harmony-editor
- https://www.wix.com/features/main
- https://www.wix.com/business/community
- https://dev.wix.com/docs/develop-websites-sdk/get-started/overview/about-wix-harmony

SHANE's product hypothesis is **cross-endeavor continuity**: a person describes an ambition, AI creates a useful artifact, the endeavor can discover consenting collaborators across the network, and the same context coordinates work and refinement over time. This is a product hypothesis, not yet a demonstrated competitive advantage.

Acceptance criteria for differentiating experience:
1. One free-form vision creates a functioning editable preview without configuration forms.
2. A natural-language refinement changes only requested parts, preserving user changes.
3. A saved endeavor connects its site, opt-in discovery listing, invitation and shared task using verified IDs.
4. A second independent endeavor can discover and request collaboration, subject to permissions.
5. A failed AI call or network write preserves the last good draft, shows a recoverable error, and supports safe retry.
6. Independent SHON compatibility is documented and tested through contracts without sharing member data by default.

Do not prioritize feature-count parity with Wix before these journeys work.
