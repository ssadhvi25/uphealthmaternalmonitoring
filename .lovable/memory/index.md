# Memory: index.md
Updated: today

UP Maternal Mortality News Agent — design system, tech decisions, architecture

## Design
- Font: Public Sans (Google Fonts import in index.css)
- Background: hsl(340 60% 96%) — soft baby pink (user confirmed)
- Card: hsl(0 0% 100%) — pure white for contrast against pink bg
- Primary: hsl(221 83% 53%) — strong official blue
- Destructive: hsl(0 84% 60%), Warning: hsl(38 92% 50%), Success: hsl(142 71% 45%)
- Cards use box-shadow (var(--shadow-card)) NOT borders
- All metric numbers use tabular-nums (.tabular class)
- NO dark mode — light mode only by design decision

## Architecture
- Mock data in src/data/mockData.ts — swap with Supabase queries when Cloud enabled
- Pipeline logic in src/lib/pipeline.ts — modular adapter pattern
- Email digest HTML generator in src/lib/emailDigest.ts
- Types in src/types/index.ts
- computeMetrics uses dynamic new Date() — NOT hardcoded dates

## Pages
- / → Overview (metrics + charts + recent articles)
- /articles → Filterable articles table + slide-in detail panel
- /runs → Run logs + "Run Now" button
- /settings → Keywords, email, source adapters

## Constraints
- No purple gradients
- No dark mode toggle
- framer-motion spring: { type: "spring" as const, duration: 0.3, bounce: 0 }
- LucideReact icons do NOT accept `title` prop — use wrapper `<span title="">` instead
- All sourceUrls must use https://www. prefixed real domain pages (not fake article paths)
