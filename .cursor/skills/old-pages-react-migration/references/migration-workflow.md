# Old Pages Migration Workflow

## Step 1: Lock behavior
1. Preserve API functions and response field access.
2. Preserve navigation callbacks and params (`onNavigate(page, params)`).
3. Preserve loading, empty, error, and popup states.

## Step 2: Align shell and header
1. Ensure the page uses `PageContainer`.
2. Do not mount `TopNavigation` directly inside old-page files.
3. Keep internal `PageNavBar` only when page-level back/title is needed.

## Step 3: Rebuild visual hierarchy
1. Hero/summary section first.
2. Core action section second.
3. List/table section third.
4. Helper tips or notes last.

## Step 4: Apply size/spacing constraints
1. Content horizontal spacing: `px-4`.
2. Section gaps: typically `mt-4` to `mt-6`.
3. Card radii: mostly `18/24`.
4. Avoid mixing too many font sizes in the same card.

## Step 5: Safety checks
1. Guard all potentially nullable API fields before string operations.
2. Convert uncertain primitive values with `String(...)` before calling string methods.
3. Keep defensive defaults for number/text render.

## Step 6: Verify
Run:
```bash
npm run lint
npm run build
```

## Step 7: Review output
Report:
1. Changed files
2. Visual changes (what was unified)
3. Behavior invariants (what stayed untouched)
4. Validation results and any remaining risk
