# SHANE release gate: live database and member journeys

Audited 2026-10-30 on the connected SHANEnetwork Supabase project (read-only inspection). This is evidence and a release checklist, not a declaration of production readiness. Do not modify SHONnetwork as part of this work.

## Verified directly in connected database
- 31 public application tables were returned by Supabase table listing, with RLS enabled on all 31.
- Existing migration history includes collaboration invitation deduplication, membership consent/revocation, and request status transition guards.
- `shane_listings`: public/owner SELECT; owner-only INSERT/UPDATE/DELETE policies.
- `shane_collaboration_requests`: participants SELECT, sender INSERT with published listing ownership check, recipient UPDATE; authenticated role has UPDATE column privilege only on `status`.
- `shane_collaboration_messages`: SELECT and INSERT require an accepted invitation and a participating authenticated member.
- `shane_endeavors`: owner operations and active-member SELECT; `shane_endeavor_members` authenticated UPDATE column privilege is limited to `role` (membership response uses separately controlled functions).
- Current data: 3 listing rows, 1 profile row, 1 organization row; no collaboration requests or messages. Do not edit existing member data for tests.

## Browser verification, not live database verification
The existing Chromium tests use intercepted Supabase client modules and simulated member records. They pass for create/edit listings, publication permission, private invitation submission and duplicate prevention, invitation acceptance, and accepted-conversation messaging. They do not prove real cross-account RLS or persistence.

## Release-blocking acceptance gates
1. Use an isolated authenticated test environment or explicitly authorized test accounts to verify owner vs outsider listing access, publication, and persistence. Do not use existing user records without consent.
2. Verify two distinct authenticated users: sender requests collaboration, recipient accepts, both exchange messages, and outsider cannot read or write messages.
3. Verify workspace tasks, endeavor membership invitations, revocation, and cross-user authorization against actual Postgres policies and functions.
4. Verify AI vision -> working preview -> conversational revision -> durable save/reload -> explicit publish -> rollback; no manual configuration homework.
5. Verify domain deployment, accessibility, abuse/report/block controls, operational diagnostics, and recovery.
6. Independently complete SHON's release audit: profiles, consent-aware compatibility, discovery, messaging, blocking, reporting, and cross-account privacy. Keep its repository and database separate.

## Next implementation decision
Prefer a dedicated isolated test environment and scripted two-account acceptance journey. Never claim simulated tests are live end-to-end validation. Preserve existing pages, schema, and production data while closing these gates.

## Verified CI baseline and cross-account acceptance protocol (2026-10-30)

Commit `d0e8b77cbc7cff1a9e207fb6cf746064f23e3777` passed all three workflows: browser smoke (run 41123306478), integration regression (41123306190), and endeavor context (41123306346). These are simulated/browser-local tests, **not** a live two-account acceptance pass.

Use an isolated Supabase project or explicitly authorized disposable test accounts and records. Keep the live SHANE project and SHON unchanged until a separate deployment decision. For each scenario record the acting account, action, expected result, observed HTTP/database result, and cleanup confirmation. Never put passwords, access tokens, or service-role keys in workflow logs.

1. Create two independent test identities A (listing owner) and B (collaborator), plus outsider C. Verify C cannot edit A's draft or read unpublished listing content. Verify A can publish intentionally and B can request collaboration only through the permitted flow.
2. Before acceptance, B cannot read private workspace messages or tasks. A accepts B's request; then A and B can exchange messages and resume after a fresh login. C still cannot read, send, update, or delete any of their messages.
3. Verify invitation recipient-only decisions, rejection of duplicate/invalid status transitions, and inability for A to accept a request addressed to B. Test concurrent decisions and record whether one wins safely.
4. Verify endeavor invitations, role changes, revocation, and that removed collaborators immediately lose workspace read/write access. Only the owner may publish or perform owner-only destructive actions.
5. Save a long vision and multi-turn conversation; sign out, sign back in, reload and compare exact text. Refine a preview conversationally, explicitly publish, then restore a prior version. Verify that no intermediate draft became public.
6. Run accessibility keyboard and screen-reader checks, reporting/blocking checks, operational error visibility, domain and TLS verification, and backup/recovery rehearsal. Record unresolved gaps as release blockers.

**Gate:** A passing mocked browser test cannot replace these database-backed assertions. Do not declare the platform generally available until these checks are recorded with actual observations.
