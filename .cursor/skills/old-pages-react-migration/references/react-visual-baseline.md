# React Visual Baseline

## Canonical files
- `src/features/figma/pages/HomeScreen.tsx`
- `src/features/figma/pages/SubscriptionCenterScreen.tsx`
- `src/features/figma/pages/CommunityScreen.tsx`
- `src/features/figma/components/shared.tsx`

## Shared layout primitives
- Page background: `bg-[#f8f8f5]` + top radial gold gradient + fade overlay.
- Main content: `px-4` and `pt-[70px]` under `TopNavigation`.
- Standard cards:
  - Section: `rounded-[24px] border border-black/5 bg-white shadow-[0_8px_24px_rgba(200,164,54,0.18)]`
  - Soft: `rounded-[18px] border border-black/5 bg-[#fffdf7] shadow-[0_6px_18px_rgba(200,164,54,0.12)]`

## Typography ladder (practical)
- Micro label: `text-[10px] font-semibold uppercase tracking-[0.2~0.25em]`
- H1: `text-[28px]~text-[29px] font-black`
- H2: `text-[20px]~text-[22px] font-black`
- Card title: `text-[15px]~text-[18px] font-bold/font-black`
- Body: `text-[12px]~text-[13px]` with `leading-[20px]~leading-[22px]`
- Meta/helper: `text-[9px]~text-[11px]`
- Primary CTA: `text-[16px]~text-[17px] font-bold`

## Color ladder
- Gold accent: `#fad933`, `#d7ab1e`, `#c58b1f`
- Text base: `text-black` and opacity levels `/30 /35 /45 /58 /65`
- Do not introduce neon blocks or heavy saturated gradients unrelated to baseline.

## Header baseline
From `TopNavigation` in `shared.tsx`:
- absolute top overlay header, white translucent background, 3 controls (wallet / language / menu)
- mobile-first sizing (`h-9` controls, compact spacing)

## Button baseline
- Primary CTA: rounded `14px`, height around `50~52px`, clear foreground/background contrast.
- Card action buttons: soft border + subtle shadow + `active:scale` feedback.

## Data-display baseline
- Info cards prefer tabular alignment and concise helper text.
- Empty/loading states must remain visible and explicit.
