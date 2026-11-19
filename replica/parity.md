# Parity report — الدولة الجروبية

Date: 2026-11-19

## Scores
- **Feature parity: 100 / 100** (measured with `parity.py replica/features.csv`)
  - 20 counted features, all done. Must-haves: 7 / 7.
  - Excluded on purpose: Whacka platform badge (third-party hosting chrome),
    real money/legal effect (the original itself is a fictional demo).
  - Extra, not scored: Owner control panel (publishing tools added in our clone).
- **Layout parity: not measured automatically.** Browser screenshots were
  unavailable in this session, so `imgdiff.py` could not be run.
  Qualitative estimate from DOM inspection: ~90–95% — same fonts (Tajawal +
  Amiri), same royal palette, same RTL sidebar, same section order and copy.

## What matches
- All 10 routes + owner panel, hash routing, RTL shell, 3 themes.
- Homepage hero, badges, countdown, symbols, 12 services, constitution,
  parliament/news teasers, ID card, account card, theme switcher, footer.
- Wallet / bank / elections / parliament / court / market / park / news flows.
- Shared Supabase database, email/password + Google sign-in, auto-refresh.
- Thursday-only election rule, 10% market tax, 6000 salary, 3.75 exchange rate.

## Deliberate differences
1. **Emblem** — redrawn as inline SVG (golden eagle) instead of using the
   original's hosted PNG asset. Same role and colour, not the same pixels.
2. **Whacka badge** — omitted (platform branding, not part of the app).
3. **Mobile bottom nav** — 5 items + "المزيد" sheet instead of the original's
   exact bar.
4. **Real-time sync** — 15s polling instead of the original's live subscription.

## Verdict
**Shippable.** All must-haves done, feature score 100%, no known blocking bugs.
Not "better than the original" yet — that would need fixes from
`/replica-entrepreneur` based on real user complaints.

## Top five things to build next (optional)
1. Replace 15s polling with Supabase Realtime subscriptions.
2. Add favicon + manifest so the PWA install looks like the original.
3. Add the Whacka-style corner badge if exact visual matching is wanted.
4. Add real multiplayer turn state to park games.
5. Add a print-style view for the constitution and ID card.
