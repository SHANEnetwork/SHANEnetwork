# SHANEnetwork: network-first architecture and implementation contract

SHANE means Shared Human Ambitions, Networks & Enterprises. **From Idea to Endeavor.**

## Non-negotiable mission
SHANE is a participatory network that helps people, groups, organizations and endeavors find one another, create things together, coordinate activity, promote one another, and grow. It is **not merely a business starter, website generator, rental platform, or marketplace**. A website is an optional output of the network, not the network's purpose.

SHONnetwork is a separate, independent, people-centered network. Do not modify SHON infrastructure as part of SHANE implementation. SHANE intends to contribute 20% of qualifying gross revenue to SHON, subject to published definitions and actual reporting; do not claim transfers occurred.

## Foundation: bottom-up data model
1. **Identity**: people and organizations, optional public profiles, privacy settings, capabilities, interests, and consent.
2. **Endeavor**: an ambition or existing activity with goals, description, milestones, resources, members and independently controlled visibility. An endeavor can be commercial, artistic, scientific, civic, social, educational, charitable, experimental, or another form.
3. **Relationship**: invitations, connections, memberships, roles, and consent-based communication. Private collaboration must never become public through directory queries.
4. **Discovery**: opt-in searchable listings for people, endeavors, services, skills, needs, opportunities, organizations, groups, and events. Respect unlisted participants.
5. **Cooperation**: collaboration requests, teams, discussions, shared tasks, and project coordination.
6. **Collective promotion**: partner discovery, cross-promotion proposals, joint campaigns, sponsorships, referrals, and authorized advertising exchanges.
7. **Events**: event proposals, venues, organizers, partners, schedules, participation, outreach, and consent-based coordination. Payment/ticketing only after separate safeguards and provider review.
8. **Creation engine**: reusable, configurable modules for websites, public pages, communications, directories, media, scheduling, and specialized functions. Sites remain linked to their endeavors and the broader network when their owners choose.
9. **Trust**: ownership, role permissions, row-level security, abuse reporting, blocking, auditability, privacy, moderation, accessible keyboard-first UX.

## Essential user journeys
- A person with an undefined idea joins, explores, receives suggestions, creates an endeavor, and discovers relevant collaborators before needing a website.
- A musician discovers a venue and designer, organizes a performance, coordinates a shared promotion campaign, and optionally publishes an event site.
- Two independent organizations propose and approve a joint event, coordinate participants, and communicate without exposing private data.
- A researcher discovers a compatible project and offers collaboration without creating a business or commercial listing.
- An existing enterprise finds cross-promotion partners and event opportunities, then optionally uses the site builder and business modules.
- A participant can remain unlisted, decline invitations, and leave collaborations without surrendering ownership of unrelated endeavors.

## Implementation principles
- **Network first**: every new feature should identify which relationships or network activities it enables, not only which page it adds.
- **Reuse, do not duplicate**: shared engine and modular features; configurable per endeavor, independently deployable sites.
- **Preserve existing work**: inspect live schema, RLS, and current pages before migrations or replacement; avoid destructive updates.
- **No pretend functionality**: distinguish concept, code, deployed feature, and tested end-to-end behavior.
- **No unauthorized actions**: AI may advise, draft and preview but may not publish, contact, invite, charge, or spend without explicit user authorization.
- **Consent and safety**: explicit participation, private-by-default collaboration, moderation, blocking, and revocable access.
- **Revenue through ongoing value**: useful services, hosting, promotion, and coordination, not artificially trapping users or their content.

## Build order and acceptance gates
**A. Verify foundation**: map actual tables and policies to existing pages; inspect all current features and keep them working.
**B. Endeavor lifecycle**: sign up, create/edit private endeavor, opt into discovery, see endeavor dashboard, invite collaborator, manage access.
**C. Network discovery**: searchable public listings, partner/opportunity discovery, collaboration requests, accepted connections, private messaging with authorization.
**D. Joint activity**: campaign and event proposals, partner invitations, approvals, shared planning, clear responsibilities and promotion.
**E. Creation engine**: optional conversational planning, modular site generation, live preview, save, publish, and edit; integrate with endeavors.
**F. Production gates**: cross-account RLS tests, accessibility, abuse handling, publishing and privacy tests, clear operational status.

Existing live tables as inspected 2026-10-28 include shane_profiles, shane_endeavors, shane_endeavor_milestones, shane_listings, shane_collaboration_requests, shane_collaboration_messages, shane_campaigns, shane_campaign_partners, shane_campaign_support, shane_campaign_budget, shane_ticket_interest, shane_ticket_tiers, shane_sites. Presence of a table does not mean its end-user workflow is complete.

## Scope guard
Before prioritizing a website builder improvement, ask: does this strengthen the network's ability to connect people and endeavors? If not, prioritize missing network foundations and end-to-end flows first.

## Delivery sequence agreed 2026-10-30

**Build SHANEnetwork and the SHANE Network together. Defer SHONnetwork changes until both are finished and their interoperability has been tested.** SHONnetworking v1 is an existing independent implementation and must remain untouched during this phase. A future SHON upgrade will use the completed network protocol and a separately reviewed, opt-in integration. SHANEnetwork is the creation and member-facing website; SHANE Network is the interoperable connective layer, not merely a second name for the website.

### Parallel implementation tracks
- **SHANEnetwork experience:** original illustrated identity across pages; vision- and document-first conversation; real extraction for supported documents; durable endeavor notes, conversation continuity, editing, preview and publishing; accessible interaction without compulsory technical questionnaires.
- **SHANE Network foundation:** destination registry and public discovery; verified destination ownership; opt-in registration, update and removal; versioned protocol; consent-scoped identities and connections; invitation and collaboration permissions; independent deployment and data boundaries.
- **Integration and release verification:** connect SHANEnetwork as the first network destination, exercise the full create-save-discover-connect-collaborate lifecycle across accounts, verify RLS and revocation, run browser tests and document what remains incomplete.
- **After these pass:** review SHONnetworking v1 against the stable connector, propose non-destructive SHON upgrades, and request explicit approval before any SHON production change.

A standalone descriptor validator is not a live destination registry. No member federation, automatic account transfer, or cross-network messaging may be advertised until independently implemented and tested.
