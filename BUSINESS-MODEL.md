# SHANE commercial sustainability policy (draft, 2026-10-28)

This is a proposed financial policy, not an activated billing system or promise of profitability.

## Guardrails
- Default infrastructure budget: $0 paid AI spend until the owner explicitly approves a provider, budget, and payment method.
- Never embed payment or AI secret keys in client-side pages.
- Never provision unlimited paid AI calls. Enforce authenticated per-user and global quotas server-side before enabling any paid provider.
- A dashboard warning is not a hard cap. Prefer provider-side hard budgets where available, otherwise enforce a server-side allocation ledger and fail closed when allocations are exhausted.
- Do not auto-upgrade services or silently switch from free to paid models.
- Confirm provider-side billing limits, rate limits, and costs before enabling paid generation.
- All paid features require verified payment-provider events before fulfillment. Do not trust client-side payment success.
- Maintain reserves for refunds, chargebacks, hosting, support, and taxes.

## Revenue allocation and unit economics
- Intended SHON support: 20% of **qualifying gross SHANE revenue**, as defined in a public policy and subject to applicable legal/accounting review. Do not represent a contribution as completed without evidence.
- For each offering estimate: selling price P, SHON allocation S, payment fees F, AI cost A, hosting/storage H, refunds and chargeback reserve R, taxes and support T.
- Contribution margin = P - S - F - A - H - R - T.
- Require positive contribution margin under realistic heavy-use and refund scenarios before sale.
- Distinguish one-time website builds, recurring hosting subscriptions, and metered AI credits. Recurring costs need recurring revenue or a prepaid reserve.
- Publish clear prices, renewal terms, cancellation and refund policies before accepting payments.

## Launch gate
1. Price and costs validated for each paid plan, including worst-case model usage.
2. AI quota, abuse limits, and spending stop tested.
3. Provider payment integration and webhook signature verification tested.
4. Refund/chargeback and failure flows tested.
5. Privacy, accessibility, terms, and tax/legal obligations reviewed.
6. Full multi-account end-to-end test and production monitoring verified.

## Scaling
Use observed paid demand and margins to approve higher quotas and infrastructure capacity. Revenue does not automatically activate upgrades. Any provider change should preserve member data and exports.
