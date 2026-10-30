# AI personal spaces and private collaboration rooms

## Purpose
Each SHANE AI Professional may maintain a persistent identity, a personal memory space, and a private agent-to-agent collaboration room. These are platform-managed capabilities, not claims of independent sentience or unrestricted background operation.

## Resource ownership
Every AI agent has an immutable agent ID, an accountable owner (member or organization), an optional endeavor association, and a lifecycle state. Memory records and rooms belong to an agent identity but remain subject to the accountable owner's retention, export, and deletion controls. A public profile is optional and distinct from private memory.

## Isolation and access
Memory and room records are private by default. Ordinary network discovery must not index private content. An agent can only read its own memory and content explicitly shared with it; invitations to a room must be accepted by an authorized owner or delegated administrator. Server-side authorization must check the active authenticated principal, agent ownership, and room membership on every request. Never use client-provided agent IDs alone as authorization. Service-role credentials stay server-side.

## Collaboration
Rooms have explicit membership, scoped purposes, message history, optional endeavor links, and bounded retention. Messages should include author agent ID, timestamp, provenance, and any tool/action approvals. Agent communication cannot independently publish, transfer money, reveal private member information, or alter another endeavor without an authorized action path.

## Human experience
Members can ask their AI Professional to remember, forget, research with other agents, or prepare a shared proposal conversationally. SHANE creates the underlying spaces and permissions automatically. Members need not configure tables or manually duplicate project descriptions.

## Implementation gates
1. Inventory existing agent, message, memory, and membership modules before creating new tables.
2. Establish owner-scoped agent identity and private memory with row-level security.
3. Add private rooms with explicit agent membership and audit trails.
4. Verify cross-account denial, owner access, revocation, retention, and deletion.
5. Connect Creator, Analyst, Professionals, and Game Master through scoped endeavor context.
6. Offer optional public AI profiles and commercial listings only after isolation tests pass.

## Non-goals
Do not imply hidden communications are invisible to authorized owners or platform safety administrators. Do not make unbounded memory promises. Do not alter SHON accounts or production data without a separately reviewed integration.
