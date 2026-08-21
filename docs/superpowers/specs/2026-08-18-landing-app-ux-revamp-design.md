# AmanPay Landing and App UX Revamp

## Goal

Separate AmanPay marketing discovery from product execution. Landing visitors understand the escrow lifecycle, then enter the product through one clear `Launch App` CTA.

## Navigation

Landing route `/` uses marketing navigation:

- `How It Works` anchor
- `Use Cases` anchor
- `Security` anchor
- `Launch App` linking to `/dashboard`

App routes use product navigation:

- `My Deals` linking to `/dashboard`
- `Create Deal` linking to `/deals/new`
- Wallet connect/address controls

Landing must not show `View My Deals` or wallet controls. App shell must not show marketing links.

## Hero Lifecycle Animation

Hero animation plays once on page load and ends at `Settled`:

1. `Created`: deal terms appear.
2. `Funded`: escrow lock indicator appears and progress advances.
3. `Delivered`: delivery proof appears.
4. `Settled`: verification seal and receipt link appear.

Animation duration: approximately 8 seconds. CTA `Launch App` remains visible throughout. A small `Replay walkthrough` control restarts animation after completion. `prefers-reduced-motion` skips animation and renders the final `Settled` state.

## Landing Content

- Hero: lifecycle animation, concise value proposition, `Launch App`, and `See How It Works`.
- Use cases: game accounts/items, subscriptions/licenses, and digital services.
- How it works: define terms, lock funds, deliver and settle.
- Security: non-custodial escrow, immutable terms hash, public settlement receipt.
- Final CTA: `Launch AmanPay` linking to `/dashboard`.

## Implementation Boundaries

- Keep blockchain and wallet behavior unchanged.
- Use CSS animation and a small client component for lifecycle state; avoid adding animation dependencies.
- Preserve existing app routes and action components.
- Keep responsive behavior: hero stacks on mobile, CTA remains above the fold, animation remains readable without hover.

## Acceptance Criteria

- `/` displays marketing navbar only.
- `Launch App` from landing opens `/dashboard`.
- `/dashboard`, `/deals/new`, and deal pages display app navbar with wallet controls.
- Hero lifecycle plays once and ends at `Settled`.
- Replay restarts animation.
- Reduced-motion users see stable final state.
- Existing build and app flows remain functional.
