# Endeavor collaboration activation checklist

This document is a deployment gate, not a claim that collaboration is live.

1. Verify the SHANE project and its existing endeavor ownership policies.
2. Review database/shane-endeavor-collaboration-draft.sql before any migration.
3. Implement invitee acceptance and decline through an authenticated, narrow server-side operation that can only change the invitee's own pending invitation status.
4. Verify invited users cannot update role, ownership identifiers, or other members' records.
5. Verify existing endeavor content remains owner-private until explicit, narrowly scoped access policies are reviewed and deployed.
6. Confirm revocation, declined invitations, duplicate invites, and the owner-only publication rule.
7. Test the full journey with separate owner and invited accounts before public release.

Do not deploy the draft membership table alone and describe shared editing as functional. The pure access-policy module is advisory, not database authorization.
