# SHANEnetwork development status — 2026-10-31

## North star
One persistent conversational intelligence across homepage, creator, dashboard, endeavors, discovery, profiles, relationships, messaging, communities, campaigns, events, publishing and growth. Vision → interpretation → working creation → conversational refinement → collaboration → operation and growth. Pages are views into the same endeavor, not separate chatbots.

## Phase
**Phase 1: experience transformation, in progress.** Do not claim phase completion from route handoffs alone. Phase 2 capability integration, phase 3 page-by-page verification, and phase 4 launch readiness remain pending.

## Evidence inspected
Recent commits through 32e563e connect conversational arrivals and editable drafts on builder, dashboard, network, my-network and community workflows. Commits 93d77d2 and 22194bad address stale history overriding edits/endeavor selection. Inspected index.html, builder.html, network.html and dashboard.html on default branch.

## Observed progress
- Homepage has a prominent free-form idea entry.
- Creator has a vision-first area and real preview elements; it still contains layered legacy style rules and advanced builder controls.
- Discovery offers conversational search alongside optional manual filters.
- Dashboard resumes conversation and displays endeavors, collaborations, campaigns and websites.
- Shared navigation and continuity scripts exist in multiple pages.

## Gaps and unknowns
- Cross-device authenticated full-history retention, export, archive, restore and explicit deletion are not established by this review.
- Shared AI agent and tool orchestration that actually creates and updates endeavor-specific Network services is not established.
- AI provider availability, end-to-end generation, rollback, publication, and permission enforcement require verification.
- Appearance remains inconsistent and CSS accumulates overrides; unify through shared design components, not more page-specific patches.
- Audit remaining pages: members, profiles, messaging, messenger, chat rooms, video meetings, communities, campaigns, events, publishing, growth, AI professionals, Analyst and Game Master.
- No changes to SHONnetwork.

## Next Phase 1 priorities
1. Inventory all SHANE pages and identify old independent conversational controls.
2. Establish one shared conversation shell and endeavor context contract, preserving current features.
3. Apply a coherent warm visual system to all views and replace redundant UI, without altering service behavior.
4. Ensure each view presents its relevant capabilities inside the same ongoing conversation.
5. After experience coverage, integrate real tool execution, persistence and permissions in Phase 2; verify page by page in Phase 3.

## Acceptance test
Describe a festival on homepage; continue in creator; refine actual working draft; discover collaborators; create endeavor-specific community and event with authorization; return signed in on another device with complete history and undo. Do not mark done until demonstrated.

## Development pass — continuous endeavor identity
- Added a shared contextual endeavor identity to `shane-unified-navigation.js` and matching responsive styling in `shane-unified-experience.css`.
- It displays the most recent relevant vision from the existing conversation brief or journal, links to conversation history, and refreshes when endeavor/conversation context events fire.
- Reuses existing context services; no new independent chatbot, private-form write, publishing action or SHONnetwork modification.
- Applicable to pages already loading both shared assets. Other pages require inventory and adoption; not a claim of full-site completion.
- Bakery example reinforces one living endeavor record, real network matches, optional forms and permission before external actions.
- Runtime/browser integration and authenticated cross-device continuity remain unverified.

## Phase 1 continuation — community and appearance views
- Added the existing shared navigation/conversation script to community-feed.html, community-conversations.html, and appearance.html; all three already loaded the shared visual stylesheet.
- These pages now participate in the same contextual endeavor identity and navigation as the other integrated pages, without replacing community publishing, conversations, or theme controls.
- Checked community-opportunities.html, community-history.html, workspace.html, growth.html, my-network.html, campaigns.html, members.html, and conversation-history.html: each already references shared navigation and styling.
- Messenger, chat-room, video-meeting, profile, event, and publish pages were **not** found at the guessed standalone filenames; their actual implementations need discovery before editing. Do not invent replacement applications.
- This pass is source-level integration only. Runtime behavior, persistence, and cross-page flows are not yet browser-verified. Phase 1 remains in progress.

## Repository-wide page inventory — current pass
Inspected the actual default-branch Git tree (rather than guessing filenames). There are **25 HTML entry points**: appearance, builder, campaigns, communities, community-conversations, community-feed, community-history, community-members, community-opportunities, contact, conversation-history, dashboard, growth, index, members, my-network, network, payments, recover, request-build, site, sports-district, system-health, vision, workspace.

All 25 now reference both the shared SHANE visual stylesheet and the shared navigation/endeavor-context script, after connecting community-members.html in this pass. This is **shared-shell coverage**, not proof of complete interface transformation or functional integration. Some systems (messenger, chat rooms, meetings, profiles, events, publishing) may be embedded in existing pages or scripts rather than separate HTML files; their actual implementations still need tracing.

Next: transform page content and workflows, not merely shared links. Make each capability a view of the same endeavor and conversation while preserving existing services and user permissions. Do not count this shell coverage as Phase 1 completion. No SHONnetwork changes.

## Conversation-first community publishing
- Added a free-form community update idea composer to community-feed.html.
- The explicit **Prepare an update** action converts the idea into the existing editable title/body publication form, only when the existing owner/coordinator permission gate exposes it.
- Existing unpublished drafts require confirmation before replacement; no automatic publishing or private-record sharing.
- The conversation journal is updated on explicit preparation; the existing Supabase publishing implementation is untouched.
- No invented AI generation or automated event scheduling is claimed. This is an honest transitional conversation-to-working-draft path, not a full AI agent.

## Community conversations continuity
- Updated the existing community discussion composer to respect disabled discussion rooms, request confirmation before overwriting an unpublished message, and record an explicitly prepared message in the shared conversation journal.
- Existing organization membership and room-setting checks, private discussion loading, and posting remain unchanged.
- No automatic post or unauthorized room enablement. Browser verification remains pending.

## Payment and published-site experience
- Added a conversation-first payment planning experience to payments.html. The member describes what they want to sell; the page produces an editable-by-conversation starting checklist and a continuation link to the creator while retaining the original provider reference in a disclosure.
- This is deterministic planning, not AI service execution or live payment processing; the page clearly says so.
- Shared navigation now explicitly avoids site.html, because published customer websites must not inherit the creator's private conversation or SHANE editor navigation. Published site rendering logic is unchanged.
- Both changes are committed; browser-level verification remains pending.

## Shared conversation continuity expansion
- Repaired a malformed literal newline in the shared navigation source introduced by the published-site guard. The guard now has an actual line break and the subsequent navigation initialization is reachable.
- Added payment and community conversational idea fields to the existing per-endeavor draft restoration and cross-page continuity selectors. These are draft ideas, not private administrative notes or published content.
- The published-site privacy exclusion remains intact. Browser verification still pending.
