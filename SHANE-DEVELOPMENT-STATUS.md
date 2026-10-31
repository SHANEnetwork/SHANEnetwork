# SHANE development continuity
Updated 2026-10-31. Source of truth: current GitHub files and commits, not conversation claims.

## Product contract
SHANE is an imaginative, welcoming, AI-first, conversation-centered creation and collaboration environment. Vision → interpretation → working creation → refinement → collaboration → operation and growth. Keep optional manual controls, preserve working features and data, and NEVER modify SHONnetwork.

## Development order
1. Transform the experience across ALL pages, not only the builder.
2. Connect working programs and fill functional gaps.
3. Verify and repair pages and permissions systematically.
4. Cross-program testing, security, launch.

## Implemented in repository (not live-browser verified)
- Shared warm visual stylesheet `shane-unified-experience.css` referenced on the principal site and many secondary pages.
- Shared navigation `shane-unified-navigation.js` integrated into 20 pages (10 in each of two development passes); headerless pages receive a top bar.
- Homepage carries an idea into the builder using `shane-home-bridge.js`.
- Dashboard accepts a natural-language goal and chooses a starting path with a simple keyword heuristic; manual override remains.
- Network directory now has conversational discovery input that translates a person's description into search terms and invokes the existing public directory loader. Manual directory filters remain.
- Builder includes earlier endeavor memory, collaboration, and messaging scripts. Their full end-to-end behavior has not been established by live testing.

## Important limitations
Keyword routing/search is NOT a functioning AI reasoning engine or complete cross-program orchestration. Shared navigation and styling are NOT complete page redesigns. No claim of live-browser verification or comprehensive test coverage.

## Next priority
Transform actual interaction and layout on member, community, collaboration, campaign, growth and builder experiences into one consistent conversation-led journey. Reuse real underlying actions rather than inventing inert chat interfaces. Track per-page progress and preserve existing workflows.

## User involvement
No action requested as of this update.

## 2026-10-31: conversational creation across Network
- Added `shane-conversational-drafts.js` to `campaigns.html`, `communities.html`, and `members.html`. A natural-language description prepares a draft in each page's existing form, preserves existing save/publish handlers, and leaves required-field review and final submission to the member.
- Added shared conversation-intake styling to `shane-unified-experience.css`.
- These are deterministic draft helpers, NOT AI-generated campaigns or automated publishing. Existing permissions and publication actions remain authoritative.
- Next: transform collaboration, member relationships and ongoing endeavor operation; ultimately connect real AI interpretation and orchestration, then verify page by page.

## 2026-10-31: collaborative endeavor workflows
- `workspace.html`: added natural-language goal intake that prepares existing shared-purpose, next-step and task fields; saving and assigning remain deliberate member actions.
- `community-conversations.html`: added natural-language message preparation using the existing community message form; posting remains explicit.
- Neither workflow uses an AI provider or automatically commits data. Both preserve existing authorization and form submission code.
- Still to transform: actual relationship/member flows, deeper creator and published-site operations, cross-program orchestration. Continue phase 1 before full debugging.

## 2026-10-31: member and relationship experience
- `members.html`: member welcome now begins with a natural-language ambition; existing manual choices are optional. Intent is routed to existing discovery, campaigns, communities, builder or member listing workflows, with local session handoff where supported.
- `my-network.html`: conversational connection search delegates to the existing published-listings search. Manual keyword search is retained.
- These are heuristic intent and keyword interpreters, not an AI agent; downstream page handoff and account-dependent actions still need end-to-end verification.
- Next: unify ongoing endeavors, member conversation context and creator actions; keep building actual UX before comprehensive page-by-page testing.

## 2026-10-31: creator and Network continuity
- Added `shane-creative-handoff.js` to the builder: carries a person's own vision from local Network/dashboard session handoff into the existing creator's `visionPrompt` when it is empty. It never auto-submits, publishes, or overwrites nonempty editor text.
- `my-network.html` now saves the exact text from its vision form before the "Let SHANE bring it to life" link. A new bridge retrieves it in the builder.
- This is a local-session handoff, not persistent AI memory. Full cross-device endeavor continuity and program orchestration still require implementation and testing.

## 2026-10-31: growth and custom build requests
- `growth.html` and `shane-growth-conversation.js`: conversational growth intake prepares existing local project and collaboration fields. Outreach drafts, tracking, and sending remain user-controlled.
- `request-build.html` and `shane-build-request-conversation.js`: conversational custom-build intake prepares existing request details; email draft submission remains explicit.
- Both use deterministic text parsing, not AI provider interpretation. Browser and end-to-end testing remain outstanding.
