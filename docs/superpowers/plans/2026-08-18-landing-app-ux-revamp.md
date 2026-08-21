# Landing and App UX Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Separate AmanPay marketing navigation from app navigation and add a one-shot escrow lifecycle animation to the landing hero.

**Architecture:** Keep one shared `Header`, but derive its mode from the current pathname. Add a focused client `LifecyclePreview` component for timer-driven visual state; keep blockchain and wallet flows unchanged. Use CSS classes for transitions and a reduced-motion media query.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS, lucide-react.

**Spec:** `docs/superpowers/specs/2026-08-18-landing-app-ux-revamp-design.md`

## Global Constraints

- Landing navigation must link `Launch App` to `/dashboard`.
- App navigation must retain `My Deals`, `Create Deal`, and wallet controls.
- Lifecycle animation plays once, supports replay, and respects `prefers-reduced-motion`.
- No animation dependency and no blockchain behavior changes.

### Task 1: Split Shared Navigation Modes

**Files:**
- Modify: `fe/src/components/layout/header.tsx`

- [ ] Use `usePathname()` to identify `pathname === "/"` as landing mode.
- [ ] Render landing links `How It Works`, `Use Cases`, `Security`, and `Launch App` to `/dashboard`.
- [ ] Render app links `My Deals`, `Create Deal`, and existing wallet controls on non-landing routes.
- [ ] Preserve wallet copy, connect, disconnect, and simulator compatibility.

### Task 2: Add Lifecycle Preview Component

**Files:**
- Create: `fe/src/features/landing/components/lifecycle-preview.tsx`
- Modify: `fe/src/app/page.tsx`

- [ ] Add client component with states `Created`, `Funded`, `Delivered`, and `Settled`.
- [ ] Advance states once using timed `useEffect`; clean up timeout on unmount.
- [ ] Add `Replay walkthrough` button after completion.
- [ ] Render final `Settled` state immediately when reduced motion is enabled.
- [ ] Replace static receipt-card hero preview with component while preserving landing CTA.

### Task 3: Style Motion and Landing Anchors

**Files:**
- Modify: `fe/src/app/globals.css`
- Modify: `fe/src/app/page.tsx`

- [ ] Add lifecycle transition classes, progress indicator, status dots, and subtle fade/slide motion.
- [ ] Add `@media (prefers-reduced-motion: reduce)` fallback that disables transitions.
- [ ] Add stable `id` anchors for `#how-it-works`, `#use-cases`, and `#security`.
- [ ] Keep hero CTA visible above the fold on desktop and mobile.

### Task 4: Verify and Release

**Files:**
- No additional files.

- [ ] Run `npm run build` from `fe`.
- [ ] Run `npm run test` from `fe`.
- [ ] Inspect `git diff` and `git status`.
- [ ] Commit with `feat: separate landing and app experience`.
- [ ] Push `main` and deploy with `vercel --prod`.
