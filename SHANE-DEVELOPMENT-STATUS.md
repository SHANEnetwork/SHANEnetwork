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

## 2026-10-31: community publishing and opportunities
- New `shane-community-publishing.js` is integrated into `community-feed.html` and `community-opportunities.html`.
- Natural-language descriptions prepare announcement/event or volunteer opportunity drafts using the existing authorized publishing forms; posting and permission checks remain unchanged.
- The script does not send, publish, or claim AI-generated content. End-to-end browser verification remains pending.

## 2026-10-31: contact and operational reports
- `shane-conversational-support.js` integrated into `contact.html` and `system-health.html` to prepare existing email and incident-report forms from natural language.
- The existing email-app handoff and incident-report authorization/submission code remain authoritative. No automatic sending or incident creation.
- This is heuristic form preparation, not a connected AI provider. End-to-end browser testing remains pending.

## 2026-10-31: sports district preview
- `sports-district.html` now accepts a natural-language description of a sports organization, interpreted by `shane-sports-conversation.js` into existing demonstration settings.
- The preview has no live security enforcement, and the changes do not involve actual students or school records.
- Browser verification remains outstanding; full AI orchestration is not yet connected.

## 2026-10-31: private member administration
- `community-members.html` now loads `shane-community-admin-conversation.js`, allowing an organization owner to prepare a private member note in ordinary language using the existing save workflow.
- Existing role changes, membership selection, authorization, and save behavior are preserved; the intake never submits automatically or overwrites a different unsaved note.
- No browser or authorization end-to-end verification has been performed.

## 2026-10-31: safer organization configuration continuity
- `community-history.html` now shows a field-by-field comparison of a historical configuration with the latest saved configuration before an owner elects to restore it.
- The existing restore RPC, owner-scoped organization lookup, and confirmation remain unchanged. This compares stored configuration snapshots; it does not inspect or alter community content.
- Browser verification remains pending.

## 2026-10-31: member-to-workflow continuity
- `members.html` now routes member intent using complete-word matching for collaboration, opportunities, fundraising and advertising, and stores a destination-scoped, timestamped session handoff.
- `shane-conversational-drafts.js` consumes the matching handoff on campaigns, communities and listings, preloading the person's original words for explicit draft preparation without automatically publishing.
- Existing builder handoff remains; this is same-tab, browser-session continuity rather than server-persisted endeavor memory. Browser verification pending.

## 2026-10-31: Network discovery continuity
- `network.html` now consumes the member welcome's destination-scoped, timestamped intent handoff into its existing conversational discovery input, without automatically querying or publishing.
- `my-network.html` accepts the same standardized handoff for its existing vision input, while preserving unfinished local drafts.
- These remain session-scoped bridges rather than authenticated cross-device endeavor memory. Browser verification pending.

## 2026-10-31: creator-to-community and campaign continuity
- `shane-creative-continuity.js` now connects the existing builder vision directly to the community and campaign creation workflows via destination-scoped, timestamped session handoff, consumed by `shane-conversational-drafts.js`.
- Existing manual save and publishing flows remain authoritative. No automatic publication or new panels were added.
- An additional attempted discovery-handoff update was blocked and is not counted as completed. Browser verification pending.

## 2026-10-31: listing preparation access guard
- `shane-conversational-drafts.js` now refuses to prepare a member listing when its existing listing section is hidden, directing the person to sign in and open the editor instead. This is a UI guard, not a substitute for existing database authorization.
- A further attempt to change builder-to-discovery handoff was blocked; it is not counted as implemented. Browser verification pending.

## 2026-10-31: creator to growth and custom work
- The builder's existing creative continuity surface now carries a vision directly to the Growth Center or custom build request workflow.
- `shane-growth-conversation.js` and `shane-build-request-conversation.js` accept a destination-scoped, timestamped browser-session handoff without replacing an existing draft or automatically sending anything.
- The original outreach and request workflows remain in place. No live browser test completed.

## 2026-10-31: creator listing and collaboration-to-campaign handoff
- The existing builder listing draft (`shane-network-draft-v1`) now preloads the member listing conversational intake without publishing or overwriting an existing prompt.
- The accepted-collaborator workspace's existing campaign link now carries the current shared intention or purpose into campaign draft preparation via the session-scoped handoff.
- These are workflow bridges, not server-side AI orchestration or automated publishing. Browser verification pending.

## 2026-10-31: creator to community publishing continuity
- `shane-creative-continuity.js` now offers direct handoffs from an existing builder vision into community announcement/event and opportunity drafting.
- `shane-community-publishing.js` consumes destination-scoped, timestamped session handoffs into its existing conversational draft input; existing publishing handlers and authorization checks remain unchanged.
- No publication occurs automatically. Browser verification pending.

## 2026-10-31: unfinished conversational draft continuity
- `shane-conversational-drafts.js` now retains unfinished campaign, community, and listing descriptions within the browser session across reloads, without overwriting a destination handoff or automatically submitting.
- `shane-community-publishing.js` adds the same session-scoped draft retention for announcements/events and opportunities. Drafts expire from automatic restoration after seven days and are not cross-device records.
- Existing publishing controls and forms are preserved; live browser verification remains pending.

## 2026-10-31: outreach and custom-build conversation continuity
- Growth Center and custom-build request conversation inputs now restore unfinished text from session-scoped drafts across reloads (up to seven days), while preserving incoming handoff precedence and the existing submission flows.
- No messages or requests are sent automatically. Browser verification remains pending.

## 2026-10-31: builder-to-discovery continuity
- Builder discovery now additionally writes the destination-scoped `shane-intent-handoff-v1` before following its existing Network discovery navigation, allowing the Network's conversational discovery input to receive the full original idea.
- Member listing intake clarifies when the existing listing editor is unavailable; existing access and publishing paths are unchanged.
- No new server AI or publishing actions were introduced. Live browser verification pending.

## 2026-10-31: homepage intent continuity
- The existing homepage journey links now carry a visitor's entered vision to Network discovery, community creation, and the personal Network page through the same destination-scoped session handoff as other SHANE flows.
- This is client-side continuity, not autonomous AI orchestration or completed transformation of all pages. Live browser verification remains pending.

## 2026-10-31: cross-page conversation continuity foundation
- Shared navigation now remembers the most recent populated conversational input when a person follows a SHANE navigation link and exposes a return-to-creator link on another page, carrying the remembered text through the existing creator handoff.
- This is a browser-session continuity foundation, not an AI transcript, persistent account-wide conversation, or an intelligent agent. The latter remain product work to implement. Live browser verification pending.

## 2026-10-31: shared navigation intent routing
- SHANE's shared navigation now routes remembered conversational intent to existing destination-specific intake bridges for builder, discovery, personal Network, communities, campaigns, and members, rather than requiring a separate return-to-creator step.
- This remains browser-session text transfer, not a shared AI conversation history or account-wide intelligence. Live browser verification pending.

## 2026-10-31: shared conversation journal foundation
- The common SHANE navigation module now maintains a bounded 30-turn browser-session conversation journal, recording the current page, text, kind, and time of preserved ideas. A read/remember interface (`window.SHANEConversation`) and `shane:conversation-updated` event allow existing SHANE modules to share conversational context without adding new panels.
- Creator handoffs now record their incoming text in this journal. This is not yet a server-backed transcript or AI inference engine. Live verification pending.

## 2026-10-31: authenticated persistent conversation storage foundation
- Applied migration `create_owner_scoped_persistent_conversation_entries` to the SHANEnetwork Supabase project only. New `shane_conversation_entries` table stores individual entries without a 30-turn retention cap, with owner-scoped SELECT/INSERT/UPDATE/DELETE RLS, optional owner-validated endeavor ID, and archive timestamp. Verified four policies exist.
- Shared navigation now emits entry text in its conversation event and attempts to save entries through the existing authenticated `window.shaneAccountDb` client where present. If the client is unavailable or saving fails, session continuity still works but account persistence is not guaranteed. No cross-device history reader, export, or user deletion interface yet; no automatic AI replies.
- Browser and multi-account security testing still pending. Existing endeavors, SHONnetwork, and other site programs unchanged.

## 2026-10-31: shared account history service
- Added `shane-conversation-store.js`, dynamically loaded by shared SHANE navigation across its pages. The pinned Supabase client uses the existing public publishable key and authenticated RLS, replacing the previous builder-only optional client dependency and avoiding duplicate write listeners.
- The store exposes account-scoped paginated history retrieval, archive/unarchive, explicit deletion, JSON export, and pending-entry flush methods. The database remains the source of truth and has no 30-entry cap. Archive is distinct from delete.
- These are service methods, not yet a finished history-management UI or AI context retrieval/orchestration. Browser and two-user RLS verification remain pending; unsigned visitors only have temporary session continuity.

## 2026-10-31: shared chronological conversation context
- The authenticated shared conversation store now exposes a `context(options)` reader that returns paginated owner-authorized history in chronological order for future shared AI interpretation and page context.
- This is a retrieval API, not a working AI agent; user-facing integration and end-to-end tests remain outstanding.
