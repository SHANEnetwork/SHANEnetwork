# SHANE AI-first Network conversion plan
Status: implementation roadmap, not a claim of feature completion.
Scope: SHANEnetwork/SHANEnetwork only. SHONnetwork is excluded from all writes.

## Product contract
The member supplies an intention in natural language. SHANE maintains an owner-scoped endeavor, reasons over existing work, chooses connected capabilities, executes permitted operations, saves artifacts and receipts, and converses about revisions. A member may use existing manual tools when desired. Never force copying AI text into configuration forms. Never publish, invite, send outreach, charge money, or change account permissions without explicit authorization.

## Non-destructive conversion protocol
1. Inventory each page's data, existing scripts, forms, backend operations, permissions and dependencies. Preserve existing routes and records.
2. Add reusable capability adapters around existing tested operations; do not replace their data models or existing forms.
3. Route natural-language intents through a common planner and operation registry with typed arguments, validation, ownership checks, and explicit review for consequential actions.
4. Save endeavor context, conversation, artifacts, execution receipts and revision history to existing owner-scoped persistence. Keep failures and partial completion visible, never claim a proposed operation happened.
5. Mount one shared conversational surface across applicable pages; keep specialist controls accessible but secondary. Avoid multiple competing composers and panels.
6. Introduce changes in independently reversible commits. Preserve existing HTML/JS functionality and avoid cross-project deployments.
7. Once the envisioned workflows exist, verify real account-backed end-to-end flows, database permissions, accessibility, responsive layout, and rollback before public launch.

## Major conversions, in implementation order
### A. First-contact to persistent endeavor
- Homepage input immediately starts conversation, creates a private endeavor for a signed-in member, or offers sign-in without losing their draft.
- SHANE names, remembers, switches and resumes endeavors conversationally.
- Avoid accidental duplicate endeavor creation and keep drafts tied to the correct endeavor.
Existing: shared composer, owner-scoped history, beginEndeavor, session continuity. Still requires authenticated browser verification and duplicate-submit protection.

### B. One SHANE operation engine
- Build a typed, versioned operation registry: capability, required inputs, ownership policy, side effects, preview, execute, verify, undo/compensate where feasible.
- Separate AI interpretation from execution; validate all model-proposed arguments on the server and in database RLS.
- Support dependent multi-step plans, resumable execution, idempotency keys, status and artifact links.
Existing: executeVision, inspectOperation, executeVisionSequence, creation receipts. Missing: comprehensive registry, dependencies, durable idempotency, broader capabilities.

### C. Website creation and editing
- Convert the existing builder into an AI-operated site authoring tool: generate pages, design, copy, navigation, content, saved versions, preview and revision.
- Make conversation the default; preserve the builder for optional manual adjustments.
- Explicit approval for publish, custom domains and external exposure.
Existing: private site generation, revisions, builder and versioning. Missing: complete conversational editing of all site components and verified publishing path.

### D. Network community and identity
- Conversationally create and configure organizations, member spaces, roles, membership and discoverability.
- Connect collaboration invitations, friend/contact pathways, rooms and member profiles to endeavor context.
- Enforce least-privilege permissions and privacy defaults.
Existing: private community drafts and separate community/member pages. Missing: full AI-driven lifecycle and cross-capability actions.

### E. Events, campaigns and commerce
- Create and revise event/campaign details, supporter goals, scheduling, registrations and relevant storefront/catalog content.
- Integrate existing commerce and event systems through adapters rather than rebuild them.
- Payments, charges, invitations and public launches require clear member authorization.
Existing: private campaign drafts with deadlines. Missing: full scheduling, ticketing, transactions and event management orchestration.

### F. Collaboration and communication
- Connect discovery -> invitation -> acceptance -> private message -> group coordination -> meeting -> follow-up.
- Let SHANE draft, prepare and organize actions; sending to others requires approval.
- Preserve existing messenger, chat rooms and video interfaces while connecting their supported APIs.
Existing: separate collaboration and messaging features. Integration and execution coverage must be audited.

### G. Discovery, growth and maintenance
- Search member-authorized Network resources and connect relevant opportunities to the active endeavor.
- Growth Center can prepare listings, outreach and analytics, without unapproved publication or sending.
- Coordinate diagnostics, repair suggestions, version history, controlled fixes and rollback.
Existing: partial discovery, growth and system health components. Missing: unified execution and verification.

### H. Unified experience and launch verification
- Consistent warm, imaginative, accessible design with one conversation front door across pages.
- No repetitive setup panels; contextual manual tools remain discoverable.
- End-to-end tests for sign-in, first vision, site creation/revision, community, event, collaboration, persistence, permissions, failure recovery and account separation.
- Roll out behind reversible feature gates, then retire redundant UI only after replacement works.

## Execution order and acceptance criteria
Wave 1: A+B foundation, homepage-to-first-saved-artifact journey, owner-scoped receipts.
Wave 2: C full website build/revise/preview flow, conversational controls.
Wave 3: D+E organizations, events, campaigns, listings, commerce adapters.
Wave 4: F cross-member discovery, invitations, messaging, rooms, meetings.
Wave 5: G growth, analytics, maintenance and recovery.
Wave 6: H coherent visual conversion and full account-backed testing.

A wave is complete only when a member can describe a goal, SHANE performs the supported operation, the resulting private artifact exists in the backend, it appears in the endeavor history, and SHANE can resume and revise it from another page. Proposals and UI mockups alone do not count.

## Risk register
- Data loss: never replace existing tables or migrate destructively without verified backup and migration plan.
- Unauthorized access: owner-scoped queries plus RLS and server-side validation.
- Accidental public actions: private-by-default and separate approval.
- AI hallucinated completion: only confirmed persistence produces completion receipts.
- Cross-endeavor contamination: immutable endeavor context per operation and cancellation before remaining steps.
- Partial multi-step failure: durable progress and explicit resume rather than rerunning confirmed operations.
- Regression: small reversible adapters, route preservation, targeted tests after the main conversion.
- SHON isolation: never write to SHONnetwork repository, deployment, database or domain.

## Immediate next implementation pass
Introduce a shared capability registry consumed by conversation planning, UI and execution; audit current programs and identify which operations are actually callable. Expand the engine with typed operations rather than more panels. Then build the first complete end-to-end path, followed by remaining adapters.
