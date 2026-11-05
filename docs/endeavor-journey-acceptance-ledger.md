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
