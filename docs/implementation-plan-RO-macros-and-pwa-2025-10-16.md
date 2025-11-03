# Implementation Plan: RO Ingredients, Macros, Admin Load, PWA

Date: 2025-10-16
Owner: Cascade

## Step 1 — Repair `IngredientBreakdown` embedding and pass translations
- **File**: `src/app/admin/voedingsplannen/[id]/NutritionPlanDetailClient.tsx`
- **Goals**:
  - Restore a clean `<IngredientBreakdown />` call for each meal.
  - Pass `ingredientTranslations={planData?._ingredientTranslations || {}}`.
  - Remove leftover corrupted code (e.g., stray `handleUpdate()` calls, invalid `CookingInstructions` props) to fix TS/JSX errors.
- **Acceptance**:
  - Page compiles with no TypeScript errors.
  - `IngredientBreakdown` receives `ingredientTranslations` prop.

## Step 2 — Enforce RO ingredient display and RO-first DB matching
- **File**: `src/components/IngredientBreakdown.tsx`
- **Display (RO only)**:
  - Compute `nameRo = ingredientTranslations[nameEn] || nameEn`.
  - Use `nameRo` as `displayName` everywhere (read-only and editable views, JSON/API branches).
- **DB matching**:
  - Add `normalize(s)` (lowercase, strip diacritics, remove parentheses/punctuation, collapse spaces).
  - Build a normalized map from `/api/ingredients` including `name`, `nameRo`, and `aliases`.
  - Match using the normalized RO key.
- **Fallback**:
  - Keep DB-first; for unresolved indices, batch-call `/api/calculate-macros` and merge back.
- **Acceptance**:
  - EN inputs render in RO and pull macros from DB when present.
  - Significantly fewer zero-macro rows for JSON meals.

## Step 3 — Performance: dedupe macro calls and throttle autosave
- **Files**:
  - `src/components/IngredientBreakdown.tsx`
  - `src/utils/dailyTotalsV2.ts`
- **Actions**:
  - Add a per-meal/day in-memory cache for `/api/calculate-macros` results; reuse between `IngredientBreakdown` and `dailyTotalsV2`.
  - Throttle autosave to ~1200ms; reduce verbose console logs.
- **Acceptance**:
  - Fewer duplicate API calls; smoother UI during edits.

## Step 4 — Admin first-load fix on Vercel (no manual refresh)
- **Files**:
  - Admin APIs, e.g., `src/app/api/clients/overview/route.ts` (and any admin data endpoints): add headers `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`, `Pragma: no-cache`, `Expires: 0`.
  - Admin page or layout: `export const dynamic = 'force-dynamic'` (and optionally `export const fetchCache = 'force-no-store'`).
- **Acceptance**:
  - After login, navigating to `/admin` renders data immediately without a manual refresh.

## Step 5 — PWA: open app at /login when added to iPhone Home Screen
- **Files**:
  - `public/manifest.webmanifest` with:
    - `start_url: "/login?source=homescreen"`
    - `display: "standalone"`, icons, colors, etc.
  - `src/app/layout.tsx` head tags:
    - `<link rel="manifest" href="/manifest.webmanifest" />`
    - `apple-mobile-web-app-*` meta tags and `apple-touch-icon`.
  - Optional fallback: `StandaloneRedirect` client component that redirects to `/login` when running in standalone mode at `/`.
- **Acceptance**:
  - Re-adding to Home Screen opens `/login` by default on iOS.

## Validation Checklist
- [ ] No TS errors; admin page renders.
- [ ] Ingredient rows show RO names; macros filled for DB-backed ingredients.
- [ ] API calls are deduped and UI remains responsive during edits.
- [ ] Post-login, `/admin` loads without refresh on Vercel.
- [ ] Home Screen app opens at `/login` on iOS.
