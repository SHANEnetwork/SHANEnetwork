# SHANE V1 launch acceptance gates

This is a finite release checklist. Do not treat every enhancement or speculative edge case as a launch blocker.

## Essential user journeys

- [ ] **Vision to creation:** A new visitor describes an endeavor, receives a useful working creation, and can refine it conversationally without copying text between forms. Verify in a real browser with a representative vision, not only a source-code assertion.
- [ ] **Persistence and return:** A signed-in member saves a creation, leaves, returns, and resumes the same content without loss. Verify against an isolated test account and database.
- [ ] **Publishing:** A member reviews and publishes a saved website, visits its public URL, edits it, and unpublishes it. Confirm public access changes correctly, including anonymous visibility.
- [ ] **Collaboration:** Two separate test members exchange an invitation, accept it, communicate privately, and create/update/complete a shared task. Confirm unrelated members cannot read or alter the workspace.
- [ ] **Operational recovery:** Failed writes preserve drafts, clear error messages appear, and members can retry without duplicate actions.

## Evidence already available

- GitHub Actions integration regression, Endeavor Context Tests, and browser smoke tests all passed at commit `4b717acf` (2026-10-30).
- Existing browser smoke tests cover member draft creation with isolated mocks, invitation actions, private collaboration opening, and vision handoff.
- `tests/website-lifecycle.cjs` checks website save/publication code contracts. Static checks are not proof of database-backed publishing.

## Not yet demonstrated

- The five complete journeys above against an isolated database, including two real test identities and anonymous publication.
- Production deployment and domain readiness.
- End-to-end AI generation quality for multiple representative customer visions.

## Release decision

**V1 is ready when all five essential journeys are demonstrated, access checks pass, and a production deployment is verified.** Record the tested commit and environment. Defer optional themes, extra games, advanced messaging, new templates, and polish unless they block an essential journey.

Do not change SHONnetwork or production Supabase to satisfy this checklist. Run integration verification in isolated test infrastructure first.
