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
