# Tasks: PoultryHub Kenya

> **Legend:** `[x]` done · `[ ]` to do · ⏳ blocked on external input (owner in brackets).
> Task IDs are stable. Reference them in commit messages, e.g. `feat(cart): enforce quantity rules (P2-07)`.
> This file is updated in the same change as the work it tracks.

---

## Phase 0: Discovery & planning ✅ (2026-10-13)

- [x] **P0-01** Inspect the repository, git history and local toolchain (Node 24.15, pnpm 10.28.2, Git 2.54, Docker 29.4; no Supabase CLI)
- [x] **P0-02** Study the design reference; document what to keep, adapt and avoid ([DESIGN_SYSTEM §2](DESIGN_SYSTEM.md#2-reference-analysis))
- [x] **P0-03** Verify current package versions and peer compatibility (npm registry). Outcome: TypeScript 6.0.3, ESLint 9.39, no `vaul`
- [x] **P0-04** Verify docs for React Router 8 SPA + pre-rendering, Supabase API keys, Edge Function secrets, regions and plan limits
- [x] **P0-05** Compute WCAG contrast ratios for the palette ([DESIGN_SYSTEM §3.2](DESIGN_SYSTEM.md#32-measured-contrast))
- [x] **P0-06** Write PLAN, REQUIREMENTS, ARCHITECTURE, DESIGN_SYSTEM, DATABASE, API_AND_INTEGRATIONS, TASKS, TESTING and `.env.example`
- [x] **P0-07** Plan approved 2026-10-13 with the recommended defaults for D1–D5; pushing authorised (D6) ([PLAN §9](PLAN.md#9-decisions-needed-from-you))

## Phase 1: Foundation & design system ✅ (2026-10-13)

**Setup**
- [x] **P1-01** `phase/1-foundation` branch. `.gitignore` covers dependencies, build output, generated route types, `.env*` (except `.env.example`), Supabase local files and test reports
- [x] **P1-02** The repository is public, so `Reference image.jpeg` stays out of version control (git-ignored) per D2
- [x] **P1-03** React Router 8.4 framework app (Vite 8.3, React 19.3, TypeScript 6.0.3) with `appDirectory: "src"`, `ssr: false` and `prerender`. Every static route must be classified in `src/config/prerender.ts`, or the build fails
- [x] **P1-04** `package.json` with exact versions, `packageManager`, `engines` and scripts; `.nvmrc`; `pnpm-workspace.yaml` (holds the jsx-a11y peer-range rule; no dependency build scripts were needed yet)
- [x] **P1-05** TypeScript strict mode plus `noUncheckedIndexedAccess`; `@/*` and `@contracts/*` aliases (resolved natively by Vite 8); typegen runs inside `typecheck`
- [x] **P1-06** Linting and formatting. ESLint **10** flat config (ADR-003 revised, because npm marks ESLint 9 unsupported), with typed typescript-eslint, react-hooks 7 (React Compiler rules), jsx-a11y and the layering rules. Prettier with the Tailwind plugin
- [x] **P1-07** Vitest 5 (separate config) with Testing Library and jsdom: 12 files, 90 tests
- [x] **P1-08** Playwright 1.64 + axe. `mobile-360` and `desktop-chrome` run by default; `E2E_FULL_MATRIX=1` adds WebKit, Firefox and tablet. 154 tests (152 passed, 2 skipped by design)
- [x] **P1-09** `.github/workflows/ci.yml`: quality job (lint, format, types, tests, build, bundle budget, secret scan) and E2E job. **Green on GitHub** (PR #2): quality 35 s, E2E 1 min 18 s on Linux Chromium. The first run caught lint depending on locally generated route types; fixed with a `typegen` step before `lint` and `typecheck`

**Design system**
- [x] **P1-10** Tailwind 4 tokens with the default palette disabled. Base layer covers typography utilities, the focus ring (gold on dark surfaces) and reduced motion
- [x] **P1-11** Plus Jakarta Sans Variable, self-hosted with the Latin file preloaded. Lucide icons. Brand icons generated from Simple Icons 16.35 (CC0)
- [x] **P1-12** shadcn/ui (Radix) primitives, themed. Focus rings at full contrast, 44 px controls, 16 px inputs, brand button and badge variants. `sonner` is hand-written, because shadcn's version needs next-themes. The CLI's `cn` package was replaced by our local `cn()`
- [x] **P1-13** Shared components: Container, Section, SectionHeading, Eyebrow, PageHeader, PriceDisplay, StockBadge, EmptyState, ErrorState, QuantitySelector, ResponsiveImage, WhatsAppLink, Reveal, DemoModeBanner, PlaceholderNotice, MotionScope. JSON-LD goes through the React Router `meta` descriptor (`src/lib/seo.ts`), so no component is needed; status badges are Badge tones
- [x] **P1-14** Motion per spike S4: CSS hero keyframes, CSS + IntersectionObserver reveals, and `<MotionScope>` (async LazyMotion, `reducedMotion="user"`) for on-demand components; `useHydrated()`
- [x] **P1-15** Placeholder egg-and-sprout mark, wordmark and SVG favicon, replaced when the business supplies a logo (D2)

**App shell**
- [x] **P1-16** `routes.ts` registers all 59 routes in ARCHITECTURE §6. Unbuilt pages share a placeholder titled from `src/config/pages.ts`. `/dev/design-system` is excluded when `VITE_APP_ENV=production`
- [x] **P1-17** Layouts: Public (sticky frosted header, lazy mobile menu sheet, footer, demo banner), Checkout (minimal chrome), Account (tabs), Admin (sticky, scrollable sidebar plus mobile sheet). The announcement bar component is ready but not shown until content exists
- [x] **P1-18** Root ErrorBoundary (development-only config diagnostics), 404 route (`noindex`), access-denied route, HydrateFallback, route announcer with focus moved to the page heading, skip link
- [x] **P1-19** TanStack Query client (defaults per §7.2). Environment validation in `src/lib/env.ts` is hand-written, keeping 22 KB of Zod off every page. It rejects secret keys and mock data in production
- [x] **P1-20** Domain modules with tests: `money`, `phone`, `units` (BR-06), `counties` (47), `dates` (EAT), `whatsapp`, `availability`
- [x] **P1-21** Catalogue service contract with mock implementation and build-time implementation selection; cart store (persist v1, `skipHydration`). The remaining contracts (orders, payments, content, account) arrive with their Phase 2 screens

**Spikes & verification**
- [x] **P1-22** Spike S1 passed. See ARCHITECTURE §14.2
- [x] **P1-23** Spike S2 passed
- [x] **P1-24** Spike S3 passed
- [x] **P1-25** Spike S4 failed the budget as designed, then fixed: public pages went from 230 KB to 136–155 KB (ADR-014, ADR-015). Bundle-budget script in CI
- [x] **P1-26** All Phase 1 exit criteria verified (PLAN §4). Responsive review via screenshots at 360, 768 and 1280 px

## Phase 2: Customer-facing frontend on mock data 🔒

**Data**
- [x] **P2-01** Typed fixtures, all marked `SAMPLE`: 4 categories; 20 products across every type (variants, units, MOQ, step, pre-order batches, enquiry-only, pick-up-only, Swahili keywords); 3 zones, 17 areas and 2 pick-up points; settings; content blocks; 12 FAQs; testimonials (empty by default); 5 blog posts; 4 policy templates; 3 promo codes; a demo account with 3 example orders
- [x] **P2-02** Mock services for all nine contracts, each loaded on first use (`src/services/lazy.ts`) so fixtures stay out of initial bundles. Fixed 250 ms latency; `?mock=slow|empty|error` plus checkout scenarios `price-changed|low-stock|area-closed`; stock-aware quote with promos and zone fees; idempotent order placement with every recovery error; hold expiry; demo M-Pesa state machine; mock auth with email-link codes. Demo writes persist in `localStorage` (`phk-demo-state`). 47 tests named by rule ID
- [x] **P2-03** 12 illustrative photos, CC0 or Public Domain Mark only, each licence checked at the source; 3 are from Kenya. No identifiable people, no cages. `pnpm images` (sharp) downloads sources from `scripts/images/manifest.mjs`, writes 480/960 WebP crops, an AVIF art-directed hero and JPEGs for link previews, and generates `public/images/CREDITS.md` and the typed rendition list. Cards ≤ 40 KB at 480 px; desktop hero 62 KB AVIF

**Pages & features**
- [x] **P2-04** Home: every section in [DESIGN_SYSTEM §10.1](DESIGN_SYSTEM.md#101-home-page-blueprint). Content from the build-time loader; category prices and featured products revalidate in the browser. Testimonials are hidden while none are published (their carousel loads on demand)
- [x] **P2-05** Shop and category pages: grid, filters (sidebar on desktop, a lazy sheet on mobile), search, sort, numbered pagination, removable filter chips. Filters live in the URL (unit-tested); pre-rendered pages show the unfiltered view until hydration. Loading, empty and error states
- [x] **P2-06** Product details: gallery, variant picker, quantity rules (BR-06), sticky mobile buy bar, specifications, delivery and pick-up info, product FAQs, related products, WhatsApp enquiry; quote requests for enquiry-only products. Product and BreadcrumbList JSON-LD. Price and stock revalidate after hydration; related products load after the buy box
- [x] **P2-07** Cart: drawer and page, quantity rules, server-checked lines with one-tap fixes (price change, stock, quantity rule, unavailable), delivery estimate by county and area, promo field. Cart store v2 with migration saves the promo code and area. "Order again" is on the order page for orders that are no longer pending (P2-10)
- [x] **P2-08** Checkout: four numbered sections (details, delivery or pick-up, payment, review), with a sticky summary on desktop and a collapsible summary bar on mobile. County → configured area → town (prefilled from the area) → estate, street or building → directions → instructions, or a pick-up point. Pick-up-only items force pick-up (BR-14); only valid payment methods are offered (BR-17). React Hook Form with `zod/mini`: inline errors and a focused error summary that shrinks as fields are fixed. A session draft keeps the form and the idempotency key, which survives a network error and is renewed after a definite rejection. M-Pesa orders send the prompt straight away. Recovery screens for `PRICE_CHANGED`, `INSUFFICIENT_STOCK`/`QUANTITY_RULE`, `AREA_NOT_SERVED` and `TOO_MANY_OPEN_ORDERS`; inline fixes for promo codes and minimum orders. Signed-in customers get their profile and default address filled in, plus a saved-address picker (P2-10)
- [x] **P2-09** Order page: confirmation with next steps by payment method; M-Pesa panel (waiting with the hold countdown; cancelled, failed or timed out with retry and a changeable number; paid with the receipt), polling 3 s → 15 s → manual; Paybill instructions and code submission; TEST controls in non-production builds only; timeline, items and totals, delivery or pick-up details, copyable secret link, WhatsApp help, cancel while pending (ORD-02), printable receipt. Without access it shows "not found" (BR-28). Track Order page (pre-rendered): number + phone, status and timeline only
- [x] **P2-10** Auth screens on mock auth: sign in (demo account shortcut in demo builds), sign up with an emailed confirmation link (shown on screen in the demo), callback (each code used once), forgot and reset password. `?next=` only returns to pages on this site. The account area redirects to sign-in when signed out. Account overview (greeting, quick links, recent orders, default address), paginated order history, profile, saved addresses (up to 10, one default, any county with served areas only for delivery), security (change password, sign out here or everywhere, deletion requests). Checkout prefill and "Order again" (`OrderItem.variantId` added to the contract). Turnstile waits for Phase 3
- [ ] **P2-11** About, Services, Contact (validated form, mock submit), FAQ, Blog index and post, Search, Policies (templates marked as drafts)
- [x] **P2-12** Announcement bar (in the pre-rendered HTML, so no layout shift), floating WhatsApp button (not in checkout or admin; lifts above sticky bars), footer with hours, payment methods and real social links only. Site settings load in the root loader. Without a configured number, demo builds use WhatsApp's share link and real builds hide WhatsApp
- [ ] **P2-13** Loading, empty, error, success and offline states on every data view. Done so far: offline banner; home, shop, category, product, cart, checkout, order, track order, auth and account pages
- [ ] **P2-14** Motion and micro-interactions per [DESIGN_SYSTEM §12](DESIGN_SYSTEM.md#12-motion-system)
- [ ] **P2-15** SEO: meta per route, canonical URLs, OG images, JSON-LD (known fields only), sitemap, robots, `noindex` rules

**Verification**
- [ ] **P2-16** Unit and component tests (TESTING §6.1–6.2). E2E: J1, J4 and J5 (mock), J7, J13, J14, plus the link crawl. Done so far: J1, J4, J5, J6 (demo email links in place of Mailpit) and J7, plus the checkout recovery screens
- [ ] **P2-17** Lighthouse, axe and responsive screenshots (360–1440 px); fix what they find
- [ ] **P2-18** Phase 2 summary and demo walkthrough → 🔒 **your approval**

## Phase 3: Supabase backend & authentication

- [ ] **P3-01** Add the `supabase` CLI as a dev dependency (approve its build script in pnpm), run `supabase init`, and configure `config.toml`: auth redirect URLs, captcha, email templates, and `verify_jwt = false` per function
- [ ] **P3-02** ⏳ Create the staging Supabase project and measure latency from Kenyan networks to the candidate regions *(business account; I run the test)*
- [ ] **P3-03** Migrations 1–8 ([DATABASE §13](DATABASE.md#13-migration-plan)), with RLS in the same file as each table
- [ ] **P3-04** `seed.sql` mirroring the Phase 2 fixtures (all `SAMPLE`)
- [ ] **P3-05** pgTAP helpers, meta-tests, and the RLS matrix for Phase 3 tables
- [ ] **P3-06** Generated types; Supabase service implementations (catalogue, content, delivery, account, auth) with mappers and tests
- [ ] **P3-07** Auth: sign-up (profile trigger), email confirmation, sign-in, PKCE password reset, sign-out (this device / all devices), Turnstile captcha
- [ ] **P3-08** Profiles and saved addresses under RLS; account pages wired to real data
- [ ] **P3-09** Storage buckets and policies; image URL and `srcset` helper
- [ ] **P3-10** Pre-render builds from Supabase (publishable key). The build fails loudly if Supabase is unreachable
- [ ] **P3-11** `db.yml` CI workflow
- [ ] **P3-12** Advisors clean and secret scan passing; Phase 3 summary

## Phase 4: Orders, inventory, checkout & payments

- [ ] **P4-01** Migrations 9–12: promotions, orders (with functions), payments (with functions), scheduled jobs
- [ ] **P4-02** SQL: `quote_cart`, `place_order` (locking, pricing, reservation, idempotency, token), status transitions, cancellation, expiry, stock release
- [ ] **P4-03** `storefront` function (orders, track, contact): shared contracts, Turnstile, CORS, error model
- [ ] **P4-04** `payments` function: STK push (mock and Daraja), reconciliation, mock simulation
- [ ] **P4-05** `payments-webhook` function: secret path, raw event storage, background verification and apply
- [ ] **P4-06** Daraja client: OAuth caching, password and timestamp (EAT), STK Push, STK Query, timeouts, result-code mapping
- [ ] **P4-07** Frontend on real data: cart quote, checkout submit, order page (session or token), payment polling, cancellation, account order history
- [ ] **P4-08** pg_cron jobs, plus documentation for setting up Vault secrets in each environment
- [ ] **P4-09** ⏳ Choose an email provider, then build transactional emails (Should) *(you)*
- [ ] **P4-10** Integration tests (oversell, idempotency, expiry, webhook suite) and pgTAP tests for order and payment functions
- [ ] **P4-11** ⏳ Daraja sandbox round trip on staging *(needs sandbox credentials and deployed functions)*
- [ ] **P4-12** Phase 4 summary, separating verified from unverified

## Phase 5: Admin dashboard

- [ ] **P5-01** Admin shell; guards (roles, plus `aal2` if approved); MFA enrol and verify screens
- [ ] **P5-02** Overview: metrics (`admin_dashboard_summary`), charts, "needs attention" queues
- [ ] **P5-03** Products: CRUD, variants, specifications, SEO, activation rules. Image uploader with browser-side resizing, required alt text and reordering
- [ ] **P5-04** Categories
- [ ] **P5-05** Inventory: overview, adjustments, movement history, CSV export
- [ ] **P5-06** Orders: filters, detail view, status transitions, notes, delivery details, cancellation, payment recording, refunds, print, CSV export, realtime new-order alerts
- [ ] **P5-07** Customers: list, detail, ban and unban, deletion procedure (via the `admin` function)
- [ ] **P5-08** Payments: list, detail, raw events, review and unmatched queues, reinstate and link actions
- [ ] **P5-09** Delivery configuration: zones, areas, pick-up points
- [ ] **P5-10** Promotions
- [ ] **P5-11** Content (blocks, FAQs, testimonials with consent, policy pages with last-reviewed date), blog editor, site settings
- [ ] **P5-12** Messages inbox and notifications
- [ ] **P5-13** Reports with CSV export; team and roles; audit log viewer
- [ ] **P5-14** Permission-matrix tests; E2E J2, J3, J8–J12; mobile admin review; Phase 5 summary

## Phase 6: Integration, security & testing

- [ ] **P6-01** Full E2E matrix against the local stack; Slow-4G checkout; link crawl
- [ ] **P6-02** Security review ([TESTING §10](TESTING.md#10-pre-release-checklist)); evaluate a hash-based CSP
- [ ] **P6-03** Accessibility audit: axe on every template, plus manual NVDA and TalkBack passes
- [ ] **P6-04** Performance and SEO audit: budgets, Lighthouse, structured data, sitemap
- [ ] **P6-05** ⏳ Decide on error monitoring and analytics (optional) *(you)*
- [ ] **P6-06** Fix findings, publish the known-issues list, write the Phase 6 summary

## Phase 7: Deployment & handover

- [ ] **P7-01** ⏳ Production Supabase (Pro) in the measured region: migrations applied with the CLI; Vault and function secrets; Auth URLs; SMTP; storage; cron *(business account)*
- [ ] **P7-02** ⏳ Static host, domain and HTTPS: rewrites, security headers, deploy hook, `request-rebuild` job, nightly build *(business account and domain)*
- [ ] **P7-03** First-admin provisioning script and procedure; a second admin
- [ ] **P7-04** ⏳ Daraja production go-live, a live low-value transaction and its refund, or the documented fallback *(business, Safaricom)*
- [ ] **P7-05** Confirm backups and run a restore drill
- [ ] **P7-06** Enter real content with the business; check that no `SAMPLE` content remains
- [ ] **P7-07** Handover: README; runbooks (deploy, migrations, secret rotation, payment reconciliation, incidents, data-subject requests, admin recovery); troubleshooting; final checklist sign-off
