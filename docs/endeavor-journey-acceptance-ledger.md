# SHANE endeavor journey acceptance ledger

**Purpose:** Measure one complete, real-account endeavor, not a collection of isolated website-builder features. SHON remains independent. Every row needs evidence tied to a commit, test run, and account-scoped record before it can be marked PASS.

## Standing development directive (updated 2026-11-05)

When the owner says "Proceed my love", continue this priority without requiring the full instruction to be repeated:

Build **one complete, visually coherent, AI-first endeavor journey**. A person describes an intention; SHANE creates exactly one owned endeavor, retains the original vision, proposes necessary components, obtains confirmation before external or public actions, creates and saves approved components under that endeavor, remembers conversation and revisions, and allows the person to return, continue, and privately collaborate. Websites, associations, communities, events, and other creations serve the endeavor, not replace it. Preserve existing functionality and SHON's independence.

**Build, debug, and test together:** When verification exposes a broken capability, repair it. When it exposes an essential missing capability or dependency, implement it in the same development pass rather than making a test pass by weakening the requirement. When it exposes needless complexity or repeated GitHub Actions runs, simplify safely. Prevent broken navigation, redundant failure emails, orphaned test data, unsafe permissions, and destructive deployment. Do not spend development passes polishing peripheral systems while the core journey remains incomplete.

**Evidence discipline:** Differentiate static audits, mocked Playwright scenarios, signed-in database integration, and real deployed browser tests. None substitutes for the others. Do not mark a gate PASS without its specified real-account and deployed-browser evidence. Record commit and workflow run for each verified gate; report new usable capabilities and remaining blockers. Do not fabricate completion percentages. The final acceptance target is 12/12 endeavor gates and 4/4 link/navigation gates verified, with reliable deployment and no regression to SHON.

**Current known baseline:** Static internal-link audit previously passed; its workflow runs on push, pull request and manual dispatch. The dedicated-account database test is manual and does not constitute browser E2E. No complete deployed journey has yet been demonstrated. Baseline EJ: 0 PASS, 11 UNVERIFIED, 1 BLOCKED. LINK browser/navigation checks remain unverified; static link audit evidence must be distinguished from deployed checks.

## Status rules
- **PASS:** an automated signed-in integration/browser test has completed successfully against the deployed version, with persisted database evidence and no unapproved public action.
- **FAIL:** a reproducible test failed; include reproduction, failing assertion, and issue/commit.
- **UNVERIFIED:** code or mock tests exist, but the real-account operation has not been demonstrated.
- **BLOCKED:** prerequisites are missing; identify exactly what.
- **N/A:** explicitly justified, never counted as passed.

**Score:** verified PASS / 12 required gates. Report FAIL and BLOCKED counts separately; never treat unrun tests as PASS. A deployment green check is not an endeavor journey PASS.

| ID | Required observable outcome | Baseline (2026-11-05) | Verification and evidence to record |
| --- | --- | --- | --- |
| EJ-01 | Signed-in person describes an endeavor and SHANE retains exact intent | UNVERIFIED | Real browser submits vision; stored intent matches |
| EJ-02 | SHANE establishes exactly one private endeavor for that intent | UNVERIFIED | Owned DB record exists; repeat/refresh does not duplicate |
| EJ-03 | Returning user sees same endeavor and its original purpose | UNVERIFIED | Sign out/in, reopen via My Endeavors and dashboard; same ID |
| EJ-04 | Person requests a necessary component within that endeavor | UNVERIFIED | Conversation produces preview and requires explicit approval |
| EJ-05 | Approved website creation saves an owner-scoped private draft | UNVERIFIED | DB ID and endeavor artifact association verified; no publication |
| EJ-06 | Approved community/association creation saves under endeavor | UNVERIFIED | DB ID and durable endeavor artifact association verified |
| EJ-07 | Approved event/campaign creation saves under endeavor | UNVERIFIED | DB ID and durable endeavor artifact association verified |
| EJ-08 | Endeavor inventory shows all saved components without borrowing unrelated account creations | UNVERIFIED | Compare dashboard snapshot to owner-scoped DB relationships |
| EJ-09 | Conversation, revisions, decisions and milestones survive sign-out and return | UNVERIFIED | Original and revised history retrieved by endeavor ID |
| EJ-10 | Failed or interrupted creation is recoverable without duplicates | UNVERIFIED | Simulate failure; retry/repair; verify exactly one artifact |
| EJ-11 | Owner can request, accept and resume private collaboration in endeavor context | UNVERIFIED | Two authorized test accounts; persisted request and messages |
| EJ-12 | A complete real-account journey passes on the deployed site | BLOCKED | Dedicated account, approved test execution, browser evidence and all above gates |

## Link and navigation checks (tracked separately)
- **LINK-01:** All internal `href` and `src` targets resolve to existing repository files, ignoring dynamic routes and external URLs. **UNVERIFIED**.
- **LINK-02:** Dashboard, My Endeavors, creation studio, and collaboration navigation work in a real browser with a saved endeavor ID. **UNVERIFIED**.
- **LINK-03:** Every actionable control in the journey has a working destination/handler and a truthful success/error state. **UNVERIFIED**.
- **LINK-04:** External URLs and deployed dynamic links return expected responses and enforce permissions. **UNVERIFIED**.

## Incremental deployed navigation verification (2026-11-06)

A separate, credential-free deployed-browser probe is now defined in `tests/shane-deployed-public-navigation.cjs`, triggered by `.github/workflows/shane-deployed-public-navigation.yml` (manual dispatch and weekly schedule). It checks public route responses, same-page anchor targets, and homepage → Detangler → endeavor-builder navigation against `https://shanenetwork.org`.

**Acceptance boundary:** A successful public probe provides partial LINK-02/LINK-04 evidence only. It does **not** verify saved-endeavor navigation, authenticated controls, external destinations, dynamic permissions, or any EJ gate. The 0/12 and 0/4 scores remain unchanged until each full gate has the required evidence. An unrun probe is not a PASS.

**Real-account blocker:** `.github/workflows/shane-live-account-journey.yml` is explicitly gated by `SHANE_ENABLE_LIVE_E2E=true`, needs dedicated `SHANE_E2E_EMAIL` and `SHANE_E2E_PASSWORD` secrets, and requires manual dispatch. Do not use an owner's personal account or fabricate credentials. The existing deployed account script covers creation, website linking, revision and sign-out/return, not all 12 gates.

## Deployed signed-in dashboard navigation probe (2026-11-06)

The dedicated-account deployed browser test now exercises dashboard → saved endeavor → restored revised vision, using the actual rendered dashboard link and the exact database-backed endeavor ID. This extends its earlier direct-URL return checks and gives stronger future evidence for EJ-03 and LINK-02. It runs only with explicit live-test activation and dedicated test credentials. **No gate is marked PASS until the deployed workflow succeeds and its evidence is recorded.**

## Existing evidence and limitations
- Latest observed commit `60a48aec`: **Validate SHANE pages** and **pages build and deployment** succeeded. These are *not* a complete broken-link or real-account journey audit.
- `tests/shane-live-account-browser.cjs` currently verifies direct Supabase account authentication, endeavor insert/update, anonymous read isolation, sign-out/sign-in and reopening. It **does not** exercise browser UI, generated components, collaboration, or the full endeavor journey despite its filename.
- `.github/workflows/shane-live-account-journey.yml` runs only by manual dispatch and only if `SHANE_ENABLE_LIVE_E2E=true`; it also needs `SHANE_E2E_EMAIL` and `SHANE_E2E_PASSWORD` secrets. Do not expose credentials in reports.
- Existing Playwright `tests/endeavor-continuity.spec.cjs` includes local/browser and mocked-store checks. Mock-based passes must be labeled as such.

## Progress report template (update after every meaningful pass)
Date/commit: …
Automated workflows: passed … / failed … / pending …
Endeavor gates: PASS … / FAIL … / BLOCKED … / UNVERIFIED … (total 12)
Links: PASS … / FAIL … / BLOCKED … / UNVERIFIED … (total 4)
New verified capability: …
Newly discovered failure: ID, reproduction, evidence …
Next blocker to remove: …
Live account testing authorized and configured: yes/no/unknown

**Acceptance:** Do not call SHANE's endeavor journey complete until all 12 EJ gates are PASS and the four link/navigation checks are resolved, with any exception explicitly documented.
