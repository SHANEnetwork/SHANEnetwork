# SHANE / SHON Vision Alignment and Integration Audit

Status: baseline in progress. This document records audit criteria, not verified product completion. Audit branch only; no changes to SHON or live deployments.

## Source of truth
- SHANE-PRODUCT-CONTRACT.md and the owner-supplied SHANEnetwork Vision Gospel (2026-11-03).
- SHANE is an endeavor-centered network; website building is optional.
- The person describes the vision; SHANE composes existing capabilities, creates a working result, preserves continuity, and refines it through conversation.
- SHONnetwork remains independently governed and operated; integration requires authorization and must not disclose private housing or member data.

## Audit domains
1. Preservation, provenance, deployment inventory, recoverable baseline.
2. Authentication, authorization, RLS, secrets, uploads, abuse prevention.
3. Privacy, consent, data ownership, export, deletion, cross-network isolation.
4. Recovery, rollback, backup restoration, migration compatibility.
5. Complete real-account user journeys.
6. AI interpretation, authorized execution, and honest operation reporting.
7. Endeavor identity, complete conversation history, persistence, versions.
8. Distinctive artwork, presentation, accessibility, responsiveness.
9. Discovery, invitations, collaboration, messaging, moderation.
10. Cross-network service contracts and independent operation.
11. Reliability, performance, concurrency, browser behavior.
12. Observability, diagnostics, deduplicated alerts, controlled repair.
13. Accuracy of claims and evidence.
14. Domain-specific safeguards for housing, minors, sensitive listings.
15. Costs, quotas, sustainability and limits.
16. Release readiness and live/source parity.

## Additional acceptance gates
A. Vision fidelity: endeavors and people first, no website prerequisite.
B. Real AI execution: actual persisted outcomes, not instructions or decorative controls.
C. One endeavor identity across creation, network discovery, revision, and collaboration.
D. Original artwork and one welcoming, immersive conversation-led experience.
E. Independent specialized networks connected only through authorized, revocable integration.

## Composition-engine audit
Evaluate separately:
- **Behavior:** tested, versioned services (identity, membership, permissions, messaging, events, projects, discovery).
- **Configuration and content:** endeavor-specific names, data, workflows, roles, relationships and permissions populated by SHANE.
- **Presentation:** distinctive artwork, writing, layout and responsive identity.
Reuse proven behavior first; configure it second; add new reusable programming only when genuinely necessary. Verify module-to-endeavor association and isolation.

## End-to-end acceptance scenario
A new member describes an unconventional endeavor. SHANE interprets it and produces a substantive working creation with a real preview and supported, endeavor-scoped capabilities. The member revises it conversationally without losing unrelated work, saves, signs out, returns in a later session, restores or rolls back a version, discovers a collaborator, and sends an invitation only with explicit consent. The endeavor identity remains stable. A second member cannot access private records without authorization. No publication or charges occur without approval.

## Evidence and status rules
For each finding record: repository and exact source reference, live deployment/version if known, action attempted, observed result, impact, proposed correction, and retest.
Statuses: Verified; Partially verified; Not implemented; Blocked; Not yet assessed. Unassessed is not a failure. Do not assign numerical completion scores without measurements.
Preserve working behavior; avoid destructive rewrites; use scoped reversible changes and test them. Audit findings do not authorize deployment or production data migrations.

## Baseline evidence (source inspection only)
- SHANE source: SHANEnetwork/SHANEnetwork, main. Product contract and vision.html inspected.
- SHON source: SHONnetwork/shon-website, main. README.md and index.html inspected.
- Both home/network pages reference distinct Supabase endpoints; this does not verify production database configuration or permissions.
- SHANE network.html queries published shane_listings and supports discovery UI; complete user journey unverified.
- SHON index.html references shon_conversations, shon_messages, shon_blocks for notification counts; live behavior unverified.
- SHANE builder.html contains conversation, preview, save, and collaborator discovery controls; their end-to-end results remain unverified.
- SHANE database/shane-initial-schema.sql enables RLS on initial tables and explicitly calls for production security tests. Later migrations and live policies not yet inspected.
- shane-arrival-draft.js prepares carried ideas but explicitly avoids triggering final submission, invitations, publication or external search. This is a preparatory capability, not proof of AI execution.

## Next verification
Inspect existing migrations, endeavor data services, conversation-to-operation wiring, per-endeavor access controls, deployment versions, and real-account persistence before choosing implementation changes. Never run SHANE migrations against SHON.

## Follow-up source trace: saved endeavor to collaboration (2026-11-02)
- `shane-creative-continuity.js` now includes the active endeavor ID in intent and listing handoffs (branch commit `237f11c2`). This is a browser-level handoff, not authorization.
- `members.html` receives `shane-network-draft-v1`, copies `endeavor_id` to the listing form, and defaults the incoming listing to `draft`. On submit it authenticates the current user and checks `shane_endeavors.id` with `owner_id` equal to that user before inserting the linked listing. This is client-side evidence only; confirm RLS independently.
- `shane-endeavor-collaboration.js` filters accepted collaboration requests through listings whose `endeavor_id` matches the active endeavor and offers an existing workspace/private conversation. This confirms a source-level join path, not successful live messaging.
- Verification still required: database RLS for linked listing insertion, forged endeavor IDs, multi-account permissions, stale session identity, cross-page return, and real-account invitation/message tests.
