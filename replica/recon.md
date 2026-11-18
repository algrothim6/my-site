# Recon Map — الدولة الجروبية (Al-Dawla Al-Jurubiya)

Source: https://al-dawla-al-jurubiya-5luv.whacka.app
Type: Web app (SPA, hash routing), Arabic RTL. Built with Whacka app generator (React + Tailwind).
Purpose: A fictional/hobby "virtual state" simulator — identity, wallet, central bank,
elections, parliament, court, markets, park games, news. All data is fictional ("للتسلية فقط").

## Scope decision
- Platform: Web only (responsive; desktop sidebar + mobile top bar).
- Slice: whole app — all 10 routes + global account/auth + theming + core interactions.
- Audience: user's own hobby/fun site (Arabic-speaking).

## Sources
| source | URL | value |
| --- | --- | --- |
| Live app (public, guest mode) | https://al-dawla-al-jurubiya-5luv.whacka.app | all screens, copy, states |
| Meta description | same | "استكشف وطنًا رقميًا يحاكي الواقع ويثري التسلية" |

Guest mode was used only. No login/paywall bypassed. No bundles/private APIs read or copied.

## Screen inventory (stable IDs)
| ID | screen | route | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Home | #/ | landing + all service shortcuts | hero card, election countdown strip, state symbols, 12-service grid, constitution card, parliament/news teaser, ID card, account card, theme switcher, footer | guest, card-issued, theme variants |
| S02 | Wallet & Identity | #/wallet | balance, identity, passport, licences | tabs (المحفظة/الهوية/جواز السفر/الرخص), balance card, stats, statement, salary claim | empty statement, guest |
| S03 | Central Bank | #/bank | currency, treasury, transfers | exchange rate, reserve stats, issuance ledger, treasury ledger, transfers, transfer modal | empty ledgers |
| S04 | Elections | #/elections | presidential election (Thursdays only) | countdown, status, candidates list, vote | closed, countdown running |
| S05 | Parliament | #/parliament | laws + members, open 24/7 | speaker, stats, members, law votes | empty |
| S06 | Court | #/court | cases, violations, judge | judge card, stats, violations list, case log | empty/clean record |
| S07 | Market & Offices | #/market | citizen businesses, 10% tax | business tabs, list, sales log, new business modal | empty |
| S08 | Groubia Park | #/park | group game rooms | new room, rooms list, 3 games | empty |
| S09 | News & Projects | #/news | official gazette | news list, projects list + totals | loading/empty |

Global components: sidebar nav (desktop), mobile top bar/bottom nav, auth button, balance chip,
modals (create account, login, ID card, transfer, new business, new room, constitution), toasts, theme switcher.

## User flows
- F01 Browse services from home → any section (1 click).
- F02 Create account / login → identity + balance persists (modal form).
- F03 Issue national ID card → card with JRB-xxxxxx number.
- F04 Claim monthly salary → wallet balance + bank issuance ledger + treasury decrease.
- F05 Transfer to another citizen → bank ledger + wallet statement + 3.75 currency.
- F06 Vote in presidential election (Thursday only) / vote on laws in parliament (anytime).
- F07 Open a shop/office, receive payments, 10% tax to treasury.
- F08 Create a game room in park, share 5-letter code.
- F09 Switch theme (gold / black-silver / royal blue), persisted locally.

## Inferred data model (localStorage-backed in clone)
- User: id, name, email, passwordHash, nationalId (JRB-xxxxxx), balance, role, createdAt, salaryClaimedAt
- Transaction: id, userId, type (salary|transfer|payment|fine|tax), amount, from, to, note, createdAt
- BankState: reserve, issued, collected, spent, exchangeRate (3.75)
- Candidate: id, name, slogan, votes
- Law: id, title, description, yes, no, status
- Violation/Case: id, citizen, type, amount, status, date
- Business: id, ownerId, name, type (shop|office), category, sales
- Room: id, code(5 letters), game, hostId, players
- Article: id, title, body, source, date; Project: id, name, value, status
- Theme: 'royal' | 'silver' | 'blue' (persisted)

## Feature matrix
See `features.csv`.

## Out of scope (cannot clone)
- The original's backend, real multi-user accounts, real-time sync across devices
  (the original uses a hosted DB). Clone uses browser localStorage as a faithful single-device simulation.
- Whacka branding/badge ("اصنع تطبيقك") — omitted intentionally (third-party platform chrome).
- The original's exact private assets (eagle/emblem/licensed font files). Clone draws its own
  emblem with inline SVG/CSS and uses free Google Fonts with system fallbacks.
- Real payments, real government/legal effect (the app itself states everything is fictional).

## Size
M (a few weeks) for the full thing; core vertical slice (shell + home + wallet + bank) is S.
Hard parts: 10-route state management, many modals/forms, live Thursday countdown, theme system.

## Next step
Build directly (single self-contained static SPA), then verify in browser with /replica-test.
