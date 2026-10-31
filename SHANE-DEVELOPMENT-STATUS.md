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
