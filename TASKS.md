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

## Phase 1: Foundation & design system

**Setup**
- [ ] **P1-01** Create the `phase/1-foundation` branch. Add `.gitignore` covering `node_modules`, `build`, `.react-router`, `.env*` (but not `.env.example`), `supabase/.temp`, `supabase/functions/.env`, and Playwright and Vitest reports
- [ ] **P1-02** Handle `Reference image.jpeg` per D2: move it to `docs/design/` or keep it out of version control
- [ ] **P1-03** Scaffold the React Router 8 framework app with pnpm (Vite 8, React 19.3, TypeScript 6.0.3), using `appDirectory: "src"`, `ssr: false` and `prerender`
- [ ] **P1-04** Set up `package.json`: exact versions, `packageManager`, `engines` (`node >= 22.22`) and scripts (TESTING §3). Add `.nvmrc` (24) and `pnpm-workspace.yaml` with `onlyBuiltDependencies`
- [ ] **P1-05** TypeScript: strict mode plus `noUncheckedIndexedAccess`, `@/*` and `@contracts/*` aliases, React Router typegen wired into `typecheck`
- [ ] **P1-06** Linting and formatting: ESLint 9 flat config (typed typescript-eslint, react-hooks, jsx-a11y, the import-boundary rules from [ARCHITECTURE §5](ARCHITECTURE.md#5-project-structure)), and Prettier with the Tailwind plugin
- [ ] **P1-07** Vitest config (kept separate from the React Router plugin), Testing Library setup, and a first passing unit test
- [ ] **P1-08** Playwright config (projects per TESTING §4; `webServer` builds and previews), plus an axe smoke test
- [ ] **P1-09** GitHub Actions `ci.yml`. Pushing it depends on D6

**Design system**
- [ ] **P1-10** Tailwind 4 tokens ([DESIGN_SYSTEM §15](DESIGN_SYSTEM.md#15-implementation)) with the default palette disabled. Base layer: typography, focus ring, reduced motion
- [ ] **P1-11** Self-hosted Plus Jakarta Sans Variable (preloaded), Lucide, and local brand SVGs (WhatsApp and social)
- [ ] **P1-12** shadcn/ui (Radix) primitives, themed: button, input, textarea, select, checkbox, radio-group, switch, label, form, dialog, alert-dialog, sheet, popover, dropdown-menu, tooltip, tabs, accordion, badge, avatar, separator, skeleton, sonner, breadcrumb, pagination, scroll-area
- [ ] **P1-13** Shared components: Container, Section, SectionHeading, Eyebrow, PageHeader, PriceDisplay, StockBadge, StatusBadge, EmptyState, ErrorState, QuantitySelector, ResponsiveImage, WhatsAppLink, Reveal, JsonLd, DemoModeBanner
- [ ] **P1-14** Motion: `LazyMotion` + `MotionConfig reducedMotion="user"`; CSS hero keyframes; `useHydrated()` hook
- [ ] **P1-15** Placeholder logo, wordmark and favicon set (replaced if D2 provides a real logo)

**App shell**
- [ ] **P1-16** `routes.ts` with every route from [ARCHITECTURE §6](ARCHITECTURE.md#6-route-map) as a clearly labelled placeholder. `/dev/design-system` exists in development builds only
- [ ] **P1-17** Layouts: Public (header, mobile nav sheet, footer, announcement bar), Checkout (minimal chrome), Account, and an Admin shell
- [ ] **P1-18** Root ErrorBoundary, 404, access-denied, HydrateFallback, route announcer and focus management
- [ ] **P1-19** Providers: TanStack Query client with the defaults in ARCHITECTURE §7.2; validated env (`src/lib/env.ts`)
- [ ] **P1-20** Domain modules with unit tests: `money`, `phone`, `units`, `counties` (47), `dates` (EAT), `whatsapp`
- [ ] **P1-21** Service contracts, mock service skeleton, and implementation selection (`services/index.ts`). Cart store skeleton (persist, `skipHydration`)

**Spikes & verification**
- [ ] **P1-22** Spike S1: dynamic pre-render plus SPA fallback for product slugs that weren't pre-rendered
- [ ] **P1-23** Spike S2: hydration-safe cart badge and signed-in header
- [ ] **P1-24** Spike S3: `sitemap.xml` and `robots.txt` as pre-rendered resource routes
- [ ] **P1-25** Spike S4: measure Motion's bundle impact; add the bundle-budget script
- [ ] **P1-26** Check every Phase 1 exit criterion ([PLAN §4](PLAN.md#4-phases)) and write the Phase 1 summary

## Phase 2: Customer-facing frontend on mock data 🔒

**Data**
- [ ] **P2-01** Typed fixtures, all marked `SAMPLE`: categories; about 20 products across every type (variants, units, MOQ, step, availability); zones, areas and pick-up points; settings; content blocks; FAQs; testimonials (empty by default); blog posts; example orders
- [ ] **P2-02** Mock services: simulated latency, errors and empty results (`?mock=`); stock-aware cart quote; demo order placement; demo payment state machine; mock auth with demo accounts
- [ ] **P2-03** Source illustrative images (licensed, recorded in `public/images/CREDITS.md`) and generate responsive variants of static assets

**Pages & features**
- [ ] **P2-04** Home: every section in [DESIGN_SYSTEM §10.1](DESIGN_SYSTEM.md#101-home-page-blueprint)
- [ ] **P2-05** Shop and category pages: grid, filters (a sheet on mobile), search, sort, pagination, URL state, removable filter chips
- [ ] **P2-06** Product details: gallery, variant picker, quantity rules, sticky mobile buy bar, specifications, delivery info, related products, WhatsApp enquiry
- [ ] **P2-07** Cart: drawer and page, quantity rules, price-change notices, delivery estimate, promo field, "Order again"
- [ ] **P2-08** Checkout: sections; Kenyan phone and address model; fulfilment and payment rules; draft persistence; error summary; idempotent submit; recovery screens (`PRICE_CHANGED`, `INSUFFICIENT_STOCK`, `AREA_NOT_SERVED`)
- [ ] **P2-09** Order page: confirmation, demo M-Pesa panel states, timeline, printable receipt. Track Order page
- [ ] **P2-10** Auth screens (sign in, sign up, forgot and reset password, callback) on mock auth. Account overview, orders, profile, addresses, security
- [ ] **P2-11** About, Services, Contact (validated form, mock submit), FAQ, Blog index and post, Search, Policies (templates marked as drafts)
- [ ] **P2-12** Announcement bar, floating WhatsApp button (hidden on checkout), footer content
- [ ] **P2-13** Loading, empty, error, success and offline states on every data view
- [ ] **P2-14** Motion and micro-interactions per [DESIGN_SYSTEM §12](DESIGN_SYSTEM.md#12-motion-system)
- [ ] **P2-15** SEO: meta per route, canonical URLs, OG images, JSON-LD (known fields only), sitemap, robots, `noindex` rules

**Verification**
- [ ] **P2-16** Unit and component tests (TESTING §6.1–6.2). E2E: J1, J4 and J5 (mock), J7, J13, J14, plus the link crawl
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
