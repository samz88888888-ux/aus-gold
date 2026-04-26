---
name: old-pages-react-migration
description: Migrate Vue-copied pages under src/features/old-pages/pages to the current React visual language (home/subscription/community), while preserving existing business logic, API fields, route params, and navigation behavior. Use when fixing odd old-page layouts, unifying typography/card/button styles, adding shared header behavior, or batch-migrating legacy old-pages UI.
---

Use this skill to migrate or restyle `old-pages` without breaking behavior.

## Required references
1. Read `references/react-visual-baseline.md` before editing styles.
2. Read `references/migration-workflow.md` before editing structure.

## Non-negotiables
1. Preserve behavior: keep API calls, state transitions, event handlers, and `onNavigate` payload semantics.
2. Keep routing stable: do not rename page keys or route params.
3. Use shared old-pages header path: `PageContainer` + provider flow. Avoid page-local `TopNavigation` wiring.
4. Apply visual ladder from React baseline pages instead of ad-hoc sizes/colors.

## Execution checklist
1. Identify target files under `src/features/old-pages/pages`.
2. Separate logic layer from view layer.
3. Refactor only the view layer first, then patch null-safety if runtime issues exist.
4. Align sections/cards/buttons/typography with baseline references.
5. Run:
```bash
npm run lint
npm run build
```
6. Report changed files, behavior guarantees, and validation results.

## Fast commands
```bash
rg -n "text-\\[[0-9]+px\\]" src/features/figma/pages/HomeScreen.tsx src/features/figma/pages/SubscriptionCenterScreen.tsx src/features/figma/pages/CommunityScreen.tsx
rg -n "TopNavigation|PageContainer|PageNavBar" src/features/old-pages/pages -g '*.tsx'
```
