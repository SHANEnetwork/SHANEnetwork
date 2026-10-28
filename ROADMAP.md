# SHANEnetwork implementation roadmap (2026-10-28)

This is an implementation plan, not a claim that these features are deployed.

## Mission
SHANE: Shared Human Ambitions, Networks & Enterprises. From Idea to Endeavor. SHONnetwork remains a separate independent people-centered community network.

## Release 1: real shared network
- Authentication, email verification, account recovery, abuse controls, data access policies.
- Optional public listings for people, organizations, projects, services, events and opportunities. Search by type, place, skill and need. Owners can edit and delist.
- Public directory participation requires a visible SHANEnetwork symbol or link on the listed endeavor's website, with reasonable verification and appeals. Service customers may remain unlisted.
- Public endeavor proposals, private collaboration rooms, role-based membership and invitations.
- Opportunities clearly marked paid, volunteer or partnership, with dates, requirements and compensation.
- Messenger with consent-based invitations, blocking, reporting and moderation; protect private conversations.
- Accessible keyboard-first user interface, audit logs, privacy and retention rules.

## Scheduling consent
Default appointment state is pending until recipient accepts. Owner may opt into auto-booking of published slots or authorize a revocable delegate within specified constraints. Never publish private calendar details. Handle conflicts, time zones, cancellations, rescheduling and buffers.

## Cooperative collaboration
Opt-in cross-promotion, sponsorship, event proposals, budgets, vendor applications, task assignments and meeting coordination. AI recommendations are advisory and cannot commit money, publish or contact others without authorization.

## Conditional ticketing and financial protection (later release)
- Interest/commitments and viability thresholds first, with no collection of ticket money in Release 1.
- Verified organizer and venue/contract/permit evidence before accepting paid commitments.
- Provider-backed consented conditional charges, failed-payment handling, documented cancellation/refunds.
- Restricted disbursements with independent milestone approval and reserves; no automatic payout to organizers.
- Provider/legal review for funds handling, KYC, escrow claims, chargebacks and cancellation liability.
- Preserve participants' agreements, audit logs and authorized organizer succession.
- Proposed / Verified / Financially Protected labels disclose exactly what was checked; never guarantee fraud prevention or full refunds.

## Build sequence
1. Inspect and preserve existing homepage, builder and payments guide.
2. Choose and configure production backend, secrets and authentication. Never embed service-role keys in public HTML.
3. Create migration scripts and access-control tests.
4. Build listings, profile ownership and search.
5. Add collaboration rooms, messaging and opportunity posting.
6. Add consent-based scheduling and notifications.
7. Test across two separate accounts, verify moderation, accessibility and mobile/desktop operation.
8. Deploy and verify domain routing.
9. Only then add payment flows following external legal and provider approvals.

## SHON support
Intended 20% of qualifying gross SHANE revenue to SHON, subject to published definitions and reporting; no claim that transfers already occurred.
