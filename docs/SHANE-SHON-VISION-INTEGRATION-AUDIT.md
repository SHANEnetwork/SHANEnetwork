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

## Live SHANE Supabase security baseline (read-only, 2026-11-02)
- Connected to the named `SHANEnetwork` project (`ufxzogeixdwvbpdypojb`), not SHON. Read-only catalog queries found RLS enabled on `shane_endeavors`, `shane_listings`, `shane_conversation_entries`, `shane_collaboration_requests`, and `shane_collaboration_messages`.
- `shane_listings` UPDATE has a **restrictive** linked-endeavor ownership policy (`polpermissive=false`, `USING true`, `WITH CHECK` owner-linked endeavor) and a **permissive** owner-only UPDATE policy. The broad `USING true` does not itself grant edit access.
- Listing INSERT checks owner identity plus a restrictive policy requiring any linked endeavor to belong to that owner. Conversation entries check owner identity and endeavor ownership. Collaboration messages require an accepted request and participant identity.
- Security advisor reported nine callable `SECURITY DEFINER` functions and leaked-password protection disabled. Inspected all nine definitions: `shane_incident_history`, `shane_invited_organization_names`, `shane_manage_incident`, `shane_record_health_check`, `shane_respond_to_endeavor_invite`, `shane_restore_organization_config`, `shane_revoke_endeavor_member`, `shane_verify_incident`, and `shane_verify_incident_from_check`. Each contains caller identity or ownership checks; no obvious absent caller check in this source review. This is **not** proof of safety against all paths or a substitute for multi-account execution tests.
- Remaining security work: isolated authenticated two-account negative/positive tests; inspect effective grants and related tables; assess password protection setting. No production data or policies modified.
- Initial audit can close with explicit `not yet verified` entries for browser experience, artwork installation, real AI generation, account persistence, and cross-network permissions. These are implementation/acceptance milestones, not reasons to keep the baseline audit open indefinitely.

## Integration audit continuation: creator, account save and return (2026-11-02)

Scope: source inspection of `builder.html`, `shane-unified-private-save.js`, product contract, and earlier live security baseline. **Not a completed runtime audit or release certification.** SHON repository and production deployments unchanged.

### Observed code paths
- Conversation outcome `shaneChatSave` now invokes `saveEndeavorAccount`; account save writes an owner-scoped `shane_endeavors` record and dispatches `shane:endeavor-account-saved` only after a successful insert/update.
- `shane-unified-private-save.js` listens for that event. If the editor contains a named, nonempty website draft and no selected saved website, it clicks the existing private `saveSite` action. It deliberately does not overwrite a selected existing website.
- The `saveSite` handler inserts a `shane_sites` record with `status:"draft"`. The new link operation updates the active, owner-scoped endeavor's `linked_site_id` only after website insert succeeds; failure is reported separately.
- The account save event now exposes an endeavor-specific return link. The endeavor open handler loads owner-scoped fields and fires `shane:endeavor-changed`; conversation memory switches by endeavor ID and attempts account restoration. The conversation offers a linked-website continuation control using the existing owner-checked loader.
- New source contract: `tests/unified-private-save-contract.cjs`. **Committed, not yet executed in CI or a real browser.** Static assertions do not prove database or UI behavior.

### Findings and corrections
| ID | Domain | Finding | Status | Required verification |
| --- | --- | --- | --- | --- |
| INT-01 | Creation / persistence | Endeavor save and private new-site save are now wired through an event and owner-scoped link, but the operations are sequential, not atomic. A website can be saved without its endeavor link. | Partially verified (source) | Two-account authenticated create/save/return; failure injection for link and retry behavior |
| INT-02 | Revision | Existing selected websites are intentionally not auto-updated, preventing silent overwrite but leaving conversational revision-to-persistence incomplete. | Partially verified (source) | Safe update/restore workflow with explicit published-site approval |
| INT-03 | Continuity | Endeavor-specific return URL and account conversation load are present. Conversation, website, and versions are not yet demonstrated as a single restored session. | Partially verified (source) | Sign out/in, reload, two distinct endeavors, cross-device, version restore |
| INT-04 | Security | Owner filters and draft-only insert are present in client code; earlier live RLS inspection was favorable but runtime denial tests remain outstanding. | Partially verified | Unauthorized linked ID, second-account reads/writes, published-site safety |
| INT-05 | Experience / artwork | Product contract requires immersive original artwork and AI-operated creation; neither has been certified in a deployed browser journey. | Not yet verified | Original-asset inventory, screenshot comparison, actual AI generation and revision |
| INT-06 | Collaboration / discovery | Source supports endeavor handoff and invitation flow; no accepted two-account invitation/message evidence recorded. | Not yet verified | Consent-gated listing, invitation, acceptance, private messaging, rejection tests |
| INT-07 | Operations / release | Development commits are on `audit/vision-alignment-baseline-20261103`, not certified as deployed; test suite and rollback need evidence. | Not yet verified | Execute Node/browser/CI suite, compare main/deployment, rollback rehearsal |
| INT-08 | SHON isolation | No SHON repository or database mutation in this audit continuation. | Verified for audited writes | Confirm any future integration remains separately authorized |

### Full-audit completion criteria
Close each of the original 16 domains with a dated evidence record, observed runtime result, regression test, and explicit owner decision where authorization is required. Run the complete signed-in creation → generated preview → conversational revision → private save/link → sign out → return/restore → opt-in discovery → two-account collaboration scenario. Test negative permission cases, accessibility, responsiveness, performance, alert handling, rollback, and SHON isolation. Only then mark release readiness verified. No unmeasured numerical completion score.
