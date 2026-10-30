# SHANE Supabase advisor triage (2026-10-30)

Read-only review of connected SHANEnetwork project. **Do not treat an advisor warning as a proven exploit or a successful policy test.** No production records, privileges, or functions were changed.

## Security advisor: 10 warnings
- Nine `authenticated_security_definer_function_executable` findings. These are privileged RPC entry points, not necessarily errors; inspect identity checks and all reachable operations before changing grants.
- One `auth_leaked_password_protection` warning: leaked-password protection disabled. Enable in Supabase Auth settings after confirming plan availability and user impact. [Supabase guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

### Privileged function source inspected
All nine flagged functions were retrieved from `pg_get_functiondef`:
- `shane_invited_organization_names`: filters pending invitations by `auth.uid()`.
- `shane_respond_to_endeavor_invite`: authenticated invited member only; updates own invited row.
- `shane_revoke_endeavor_member`: endeavor owner only; excludes self.
- `shane_restore_organization_config`: checks organization ownership and saved version.
- `shane_incident_history`: filters through organization ownership.
- `shane_manage_incident`: locks incident through owner organization, checks transitions.
- `shane_record_health_check`: checks organization ownership; can create incident records.
- `shane_verify_incident`: checks organization ownership and resolved status.
- `shane_verify_incident_from_check`: checks owner, resolved status, and passing follow-up check.

**Preliminary assessment:** all nine contain an identity/ownership restriction, and all set an empty search_path. That is encouraging but insufficient for clearance. Next verify actual invoker behavior, constraints, and indirect function effects with two distinct authenticated test identities in an isolated environment. Avoid blanket REVOKE of functions used by legitimate clients.

## Performance advisor
- Reports 36 foreign keys without covering indexes, plus additional performance warnings. Prioritize frequently queried collaboration and endeavor foreign keys using query plans and index inspection, not blanket migrations.
- [Supabase unindexed FK guidance](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys).

## Acceptance gates
1. Isolated real-Postgres two-user RLS tests, including outsiders and role changes.
2. Validate SECURITY DEFINER RPC calls as owner, invitee, outsider, and anonymous user.
3. Confirm authentication password protection setting and enable when supported.
4. Re-run security/performance advisors after approved changes.

[Privileged RPC advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
