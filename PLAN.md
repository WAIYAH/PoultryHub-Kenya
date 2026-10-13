# PoultryHub Kenya: Project Plan

| | |
|---|---|
| **Status** | Phase 0 **approved on 2026-10-13** with the recommended defaults for D1–D5; pushing authorised (D6). **Phase 1 is next.** |
| **Last updated** | 2026-10-13 |
| **Repository** | `github.com/WAIYAH/PoultryHub-Kenya` |
| **Related documents** | [REQUIREMENTS](REQUIREMENTS.md) · [ARCHITECTURE](ARCHITECTURE.md) · [DESIGN_SYSTEM](DESIGN_SYSTEM.md) · [DATABASE](DATABASE.md) · [API_AND_INTEGRATIONS](API_AND_INTEGRATIONS.md) · [TASKS](TASKS.md) · [TESTING](TESTING.md) · [.env.example](.env.example) |

---

## 1. What we are building

PoultryHub Kenya (working name) is a direct-to-customer online shop for **one** Kenyan poultry business. Three groups buy from it:

- **Households:** eggs and birds.
- **Small-scale farmers:** chicks, point-of-lay pullets, feeds and equipment.
- **Businesses** such as hotels, restaurants and shops: bulk eggs and birds, usually on a repeat basis.

Customers browse products with clear units and prices in KES. They order with or without an account, pay with M-Pesa (STK Push) or on delivery or collection, and track their order. The business runs everything from an admin dashboard: products, stock (including mortality and breakage), orders, payments, delivery rules, website content and reports.

The architecture leaves room to add outlets or farms later. Multi-vendor marketplace features are **out of scope** unless you add them to the approved scope.

## 2. Discovery findings

| Area | Finding | Consequence |
|---|---|---|
| Repository | `README.md` (2 lines), untracked `Reference image.jpeg` (1122×1402), one commit `8aa88aa`, GitHub remote configured | Nothing has been built yet, so there are no code conventions to preserve |
| Local toolchain | Node 24.15.0 (LTS), pnpm 10.28.2, Git 2.54, **Docker 29.4**. Supabase CLI is not installed | Docker means the full Supabase stack (Postgres, Auth, Storage, Edge Functions, mail viewer) runs locally. Phases 3–5 can be built and tested **before** any cloud credentials exist. The CLI becomes a project dev dependency |
| Design reference | A premium landing page for a layer farm: deep green, cream and gold; pill buttons; rounded panels; icon cards; stats; testimonials; FAQ. It has **no commerce features** and contains placeholder claims ("10+ years", "50K+ layers") and a Bangladesh address | We adopt its visual language, add the shopping experience, and replace every claim with data an admin has entered and verified ([DESIGN_SYSTEM §2](DESIGN_SYSTEM.md#2-reference-analysis)) |
| Ecosystem (npm registry, checked 2026-10-13) | TypeScript 7.0 is the latest, but typescript-eslint only supports `<6.1`. ESLint 10 is the latest, but eslint-plugin-jsx-a11y only declares support up to ESLint 9. `vaul` has not been published since Dec 2024. React Router 8.4 supports SPA mode with build-time pre-rendering. Supabase is deprecating its legacy `anon`/`service_role` keys by the end of 2026 | We pin **TS 6.0.3** and **ESLint 9.39**, use Radix Dialog instead of vaul, use React Router framework mode (ADR-001), and use Supabase's new publishable/secret keys from day one ([ARCHITECTURE §3](ARCHITECTURE.md#3-technology-stack)) |

## 3. Key decisions at a glance

| # | Topic | Decision | Why | Details |
|---|---|---|---|---|
| 1 | Framework & rendering | Vite 8 + React 19 + React Router 8 in **framework mode** with `ssr: false`. Public pages are **pre-rendered at build time**; cart, checkout, account and admin render in the browser | Search engines and WhatsApp/Facebook link previews get real HTML without a running server. It is still one framework, with no Astro | [ARCHITECTURE §4](ARCHITECTURE.md#4-rendering-strategy-adr-001), **decision D1** |
| 2 | UI ↔ data seam | Typed service contracts. Mock implementation in Phase 2, Supabase implementation from Phase 3 | The frontend can be finished first, and swapping the data source doesn't touch any pages | [ARCHITECTURE §7.1](ARCHITECTURE.md#71-data-access-seam) |
| 3 | Where business rules live | Postgres enforces them through constraints, RLS and `SECURITY DEFINER` functions (orders, stock, payments). Edge Functions only handle secrets, third-party APIs and bot checks | Money and stock have one authoritative, transactional home | [ARCHITECTURE §8](ARCHITECTURE.md#8-backend-architecture) |
| 4 | Money | `bigint` minor units (cents), KES only, whole-shilling prices | No floating-point errors, and M-Pesa only accepts whole shillings | [DATABASE §1](DATABASE.md#1-conventions) |
| 5 | Product model | Each product has one or more **variants** (pack size or weight band). Every variant has its own unit, price, minimum order, step and stock | Eggs sell per tray, chicks per chick with a minimum, feeds per bag size and birds per weight band. No single pricing model is hard-coded | [DATABASE §4.2](DATABASE.md#42-catalogue) |
| 6 | Stock | Stock is reserved (decremented) when an order is placed, under row locks, and released on cancellation or expiry. Every change goes into an append-only ledger, and a `CHECK (stock_quantity >= 0)` constraint backs it up | Prevents overselling and keeps a full trail, including mortality and breakage | [DATABASE §7](DATABASE.md#7-inventory-integrity) |
| 7 | Payment truth | An order counts as paid only after a **verified** M-Pesa result (the callback *and* an STK status query) or a staff-recorded payment with a reference | Daraja callbacks are unsigned, and signals from the browser are never trusted | [API_AND_INTEGRATIONS §7](API_AND_INTEGRATIONS.md#7-m-pesa-daraja-integration) |
| 8 | Guest checkout | Allowed. Guests get a secret tracking link; checkout has a Turnstile bot check, stock holds expire, and each phone number has a cap on open orders | Many customers won't create an account | **decision D4** |
| 9 | Roles | A `user_roles` table (`admin`, `staff`) checked in RLS. Profiles have no role field. MFA for admins is recommended | Revoking access takes effect immediately, and users can't promote themselves | [DATABASE §9](DATABASE.md#9-row-level-security) |
| 10 | Supabase keys | Publishable/secret keys only. Secret keys never reach the browser | The legacy keys are deprecated by the end of 2026 | [API_AND_INTEGRATIONS §2](API_AND_INTEGRATIONS.md#2-supabase-client-usage) |
| 11 | Images | Admin uploads are resized in the browser to 480/960/1600 px WebP | Pages stay fast on slow networks, and we don't depend on paid image transformations | [DESIGN_SYSTEM §8](DESIGN_SYSTEM.md#8-imagery--photography) |
| 12 | Hosting | A static CDN host (Cloudflare recommended), with Supabase **Pro** in production | Low running cost. The Free plan pauses a project after 1 week of inactivity and has no backups | [ARCHITECTURE §13](ARCHITECTURE.md#13-environments-deployment--cicd) |

## 4. Phases

Every phase ends with a written summary that separates **what was verified** from **what was not**, with evidence: command output, screenshots, test reports. [TASKS.md](TASKS.md) holds the task-level checklist.

### Phase 0: Discovery & planning ✅

- **Deliverables:** this plan; REQUIREMENTS, ARCHITECTURE, DESIGN_SYSTEM, DATABASE, API_AND_INTEGRATIONS, TASKS and TESTING; `.env.example`.
- **Gate 🔒:** your approval of the plan and answers to decisions D1–D6 (§9). ✅ **Approved 2026-10-13.**

### Phase 1: Foundation & design system

- **Goal:** a running, linted, tested skeleton. The design system exists, every route is stubbed, and the rendering architecture is proven.
- **Deliverables**
  - **Project setup:** pnpm project with pinned `packageManager` and `engines`, plus `.nvmrc`. React Router 8 framework mode (`ssr:false` + `prerender`), Vite 8, TypeScript 6 strict, `@/` alias.
  - **Styling and UI:** Tailwind 4 design tokens, self-hosted Plus Jakarta Sans, Lucide, Motion (LazyMotion), and shadcn/ui primitives themed to the brand.
  - **Layouts:** public, checkout, account and admin shells. Header with desktop navigation and a mobile sheet; footer; announcement bar; error boundary; 404; access denied.
  - **Routes:** every route in [ARCHITECTURE §6](ARCHITECTURE.md#6-route-map) registered with a titled placeholder page, clearly marked.
  - **Data plumbing:** service contracts and empty mock implementations, env validation, TanStack Query provider, cart store skeleton.
  - **Tooling:** ESLint 9 (typescript-eslint, react-hooks, jsx-a11y, import boundaries), Prettier (+ Tailwind plugin), Vitest + Testing Library, Playwright + axe smoke test, GitHub Actions CI.
  - **Design-system page:** a development-only `/dev/design-system` page showing every token, component and state.
  - **Spikes:** S1–S4 ([ARCHITECTURE §14.2](ARCHITECTURE.md#142-phase-1-spikes)).
- **Exit criteria**
  - [ ] From a fresh clone, `pnpm install --frozen-lockfile && pnpm build` succeeds, and `build/client` contains pre-rendered HTML for the static routes plus `__spa-fallback.html`.
  - [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` and `pnpm preview` all work.
  - [ ] Header, footer and mobile navigation work by keyboard and touch at 360, 768 and 1280 px, with no horizontal scroll at 360 px.
  - [ ] axe reports zero serious or critical violations on the design-system page and the home stub.
  - [ ] Spike results are recorded and ADR-001 is confirmed. If it needs revising, I'll come back to you first.

### Phase 2: Complete customer-facing frontend on mock data. Gate 🔒

- **Goal:** every customer-facing page is complete, polished and navigable, running on typed mock services.
- **Deliverables**
  - **Sample data:** typed fixtures (all flagged `SAMPLE`) for categories, about 20 products across every product type (with variants, units and minimum orders), delivery zones and areas, pick-up points, content blocks, FAQs, blog posts and example orders.
  - **Pages:**
    - **Home:** all sections.
    - **Shopping:** Shop and category pages (filters, search, sort and pagination in the URL); product details for every product type; cart (drawer and page); checkout (validation, delivery or pick-up, payment choice); order status page with a demo payment panel; Track order.
    - **Account:** sign in, sign up, password reset, profile, addresses and orders, using mock auth.
    - **Content:** About, Services, Contact (validated form), FAQ, Blog index and posts, Search, policy templates.
    - **Errors:** 404, 403 and a general error page.
  - **States and polish:**
    - **States:** loading, empty, error-with-retry, success and offline for every data view. A development switch (`?mock=slow|empty|error`) shows each one.
    - **Motion:** follows [DESIGN_SYSTEM §12](DESIGN_SYSTEM.md#12-motion-system), and reduced-motion settings are respected.
    - **SEO:** meta tags, canonical URLs, Open Graph, JSON-LD, sitemap and robots.
    - **Demo labelling:** a demo-mode banner shows whenever mock data is in use, and checkout is labelled **"Demo: no payment is processed."**
- **Exit criteria**
  - [ ] Every public and customer route works, and an automated link crawl finds no dead links or buttons.
  - [ ] E2E tests pass on mobile (360×800) and desktop for: browse → filter → product → cart → checkout (demo) → confirmation; the mobile menu; the mock account flows.
  - [ ] Unit and component tests cover money, phone numbers, units and minimum orders, the cart store, the checkout schema, the quantity selector, product cards and filters.
  - [ ] Lighthouse (mobile, preview build) on Home, Shop and Product scores Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95 and SEO ≥ 95, with CLS ≤ 0.05.
  - [ ] Responsive screenshots at 360, 390, 768, 1024, 1280 and 1440 px are attached to the phase summary.
  - [ ] 🔒 **You review and approve the frontend before backend work starts.**

### Phase 3: Supabase backend & authentication

- **Goal:** the real catalogue, content and accounts run on Supabase, with tested RLS.
- **Deliverables**
  - **Supabase setup:** CLI as a dev dependency, `supabase/config.toml`.
  - **Migrations:** extensions and types, identity and roles, catalogue, inventory ledger, delivery, content and settings, audit, storage buckets and policies. RLS is defined in the same migration as each table.
  - **Data and types:** `seed.sql` (sample data, clearly marked) and generated TypeScript types.
  - **Supabase services:** implementations for catalogue, content, delivery, account and auth.
  - **Auth:** email + password with confirmation, password reset, PKCE and Turnstile captcha; profiles and saved addresses.
  - **Build:** pre-rendering reads from Supabase at build time.
  - **Region measurement:** latency from Kenyan networks to the candidate Supabase regions.
- **Exit criteria**
  - [ ] `pnpm db:reset` rebuilds the database from migrations and seed data without errors.
  - [ ] pgTAP tests pass: a meta-test proves RLS is enabled on every exposed table, and the RLS matrix (anonymous, customer A, customer B, staff, admin) passes for the Phase 3 tables.
  - [ ] The Supabase security and performance advisors report no errors, and any warnings are triaged in DATABASE.md.
  - [ ] With `VITE_DATA_SOURCE=supabase` the experience is identical, and network failures still produce the correct states.
  - [ ] Auth flows are verified locally: confirmation email in the local mail viewer, sign-in, reset, sign-out.
  - [ ] A build scan shows no secret key or secret variable names anywhere in the client bundle.

### Phase 4: Orders, inventory, checkout & payments

- **Goal:** a trustworthy transaction workflow, from cart quote to verified payment.
- **Deliverables**
  - **Data:** tables for orders, order items, order events, promotions, payments, payment events and refunds.
  - **SQL functions:** `quote_cart`, `place_order`, status transitions, cancellation, payment application, expiry.
  - **Edge Functions:** `storefront`, `payments` and `payments-webhook`, with a mock provider and a Daraja client.
  - **Jobs:** pg_cron reconciliation and expiry.
  - **Customer side:** order history and tracking (session and token).
  - **Notifications:** transactional email, if a provider has been chosen.
- **Exit criteria**
  - [ ] Tampering with prices or totals in the request has no effect (tests send manipulated payloads).
  - [ ] A concurrency test sends 20 parallel orders for 5 units: exactly 5 succeed, stock never goes negative, and the ledger reconciles.
  - [ ] Unpaid M-Pesa orders expire after the hold window and release their stock. A payment that arrives late is flagged for review.
  - [ ] The webhook test suite passes: success, duplicate, unknown request, bad secret, amount mismatch, cancelled, timeout, malformed payload and late success.
  - [ ] Mock-mode E2E passes: place order → STK prompt → simulated callback → paid → confirmed, and the customer sees it.
  - [ ] A Daraja **sandbox** round trip has been executed and recorded. If sandbox credentials aren't available, this is listed as unverified.
  - [ ] Invalid status transitions are rejected, and every transition is logged with who made it and when.

### Phase 5: Admin dashboard

- **Goal:** the business can run day-to-day operations from a secure, mobile-capable dashboard.
- **Deliverables:** all modules in [REQUIREMENTS §4.8](REQUIREMENTS.md#48-admin-dashboard-fr-adm): overview, products and images, categories, inventory, orders, customers, payments and review queues, delivery, promotions, content and blog, messages, reports, settings, team and audit log. Includes realtime new-order notifications, and MFA for admins if you approve it.
- **Exit criteria**
  - [ ] The permission matrix (customer vs staff vs admin) is tested for every admin read and write path.
  - [ ] Dashboard metrics match values computed by hand on the seeded data.
  - [ ] Every module has an E2E happy path and a validation-error path.
  - [ ] The dashboard is usable at 360 px: tables collapse to cards and key actions stay reachable.

### Phase 6: Integration, security & testing

- **Goal:** prove the whole system end to end and fix what we find.
- **Exit criteria**
  - [ ] The full E2E suite passes against the local stack in Chromium, WebKit and Firefox, at mobile and desktop sizes.
  - [ ] The security checklist ([TESTING §10](TESTING.md#10-pre-release-checklist)) is complete; findings are fixed or documented.
  - [ ] axe is clean on every page template, and keyboard and screen-reader spot checks (NVDA, TalkBack) pass.
  - [ ] Performance budgets are met, and SEO is validated (structured data, sitemap, canonical URLs, robots).
  - [ ] The known-issues list is published, with nothing hidden.

### Phase 7: Deployment & handover

- **Goal:** a production deployment and everything the business needs to run it.
- **Exit criteria**
  - [ ] **Supabase production:** Pro plan in the measured region. Migrations applied with the CLI; secrets, Auth URLs, SMTP, storage and cron configured; backups confirmed.
  - [ ] **Frontend:** deployed with rewrites and security headers, on the custom domain over HTTPS, with a deploy hook that re-renders pages when content changes.
  - [ ] **Admin access:** the first admin is provisioned with a documented one-off script. There are no default credentials anywhere.
  - [ ] **M-Pesa:** Daraja production go-live is done and verified with a real low-value payment that is then refunded. Otherwise we launch with offline payment methods and document M-Pesa as pending.
  - [ ] **Handover:** runbooks and handover docs delivered, a restore drill performed, and the final checklist signed off by you.

## 5. Sequencing and critical path

1. **Daraja production approval** has the longest external lead time. Start it now (§8). Until then, development runs on the mock provider and the Daraja sandbox.
2. **Real content** (photos, product list, delivery rules, policies) is needed by Phase 6. Placeholders carry us through Phases 1–5.
3. **The frontend comes before the backend** (as you required). The service seam (decision 2) keeps that from causing rework.
4. **The schema is designed now** ([DATABASE.md](DATABASE.md)) even though it's built in Phases 3–5. The mock fixtures in Phase 2 follow the same shapes.

## 6. Working agreements

- **Branches:** one branch per phase (`phase/1-foundation`, …), small commits with conventional-commit messages, and CI green before review. Pushing and pull requests depend on decision D6.
- **Tracking:** each task in TASKS.md is ticked as it lands, and the docs are updated in the same change as the code.
- **Rule references:** business rules are cited by ID (e.g., BR-08) in code comments and test names.
- **Secrets:** none in the repository. `.env*` files stay git-ignored, except `.env.example`.
- **Honest reporting:** a phase summary never claims an integration or test I haven't actually run.

## 7. Risk register

| ID | Risk | Likelihood | Impact | Mitigation | Phase |
|---|---|---|---|---|---|
| R1 | Daraja production go-live is delayed (needs a Paybill/Till, an M-Pesa org-portal admin and Safaricom approval) | High | High | Start the paperwork now. Build on the mock provider and sandbox. Be launch-ready with pay on delivery/collection and manual Paybill | 1→7 |
| R2 | Payment callbacks are lost, delayed or forged (they are unsigned) | Med | High | Secret callback path; CheckoutRequestID and amount must match; STK Query confirmation; idempotent apply; scheduled reconciliation | 4 |
| R3 | Overselling during concurrent checkouts | Med | High | Row locks taken in a fixed order, `CHECK (stock_quantity >= 0)`, the ledger, and a concurrency test | 4 |
| R4 | Bots or abusers reserving stock with fake guest orders | Med | Med | Turnstile; 30-minute hold for unpaid M-Pesa orders; at most 3 open unpaid orders per phone; staff confirmation for pay-later orders | 4 |
| R5 | Pre-rendering edge cases (a new product page not yet built, hydration mismatches) | Med | Med | Spikes S1 and S2 in Phase 1; SPA fallback with client loaders; rebuild via deploy hook on publish | 1, 7 |
| R6 | Slow mobile networks degrade the experience | High | Med | Static HTML, budgets (≤ 170 KB JS), responsive images, skeletons, retries, a cart that survives going offline | 2, 6 |
| R7 | No Supabase region in Africa, so latency | Med | Med | Measure Nairobi latency to eu-central-1, eu-west-2 and ap-south-1 before creating production; cache public data; use aggregate RPCs | 3, 7 |
| R8 | Account and receipt emails don't arrive | Med | Med | Custom SMTP with SPF/DKIM/DMARC (Supabase's built-in sender is for development only) | 3, 7 |
| R9 | Unverified claims, testimonials or images go live | Med | High | Placeholder flags, facts entered only by admins, a consent field, a pre-launch content checklist | 2, 6 |
| R10 | Regulatory gaps (live-bird movement, veterinary products, dressed meat, ODPC registration, eTIMS) | Med | High | Exclude regulated products until confirmed; compliance list in [REQUIREMENTS §8](REQUIREMENTS.md#8-compliance-considerations-for-professional-review) | 0→7 |
| R11 | Dependency churn (React Router 8, TypeScript 7, the ESLint 10 ecosystem lagging) | Med | Low | Exact pinned versions, a lockfile, compatibility notes, scheduled upgrade reviews | all |
| R12 | Mock or sandbox payments mistaken for real ones | Low | High | An `environment` column; mock mode refused when `APP_ENV=production`; TEST badges; excluded from revenue | 4 |
| R13 | Admin lock-out (lost MFA device, only one admin) | Low | High | At least 2 admins, a documented recovery procedure, last-admin protection | 5, 7 |
| R14 | Scope creep (marketplace, subscriptions, SMS) | Med | Med | MoSCoW scope in REQUIREMENTS; change control (§10) | all |

## 8. External dependencies and lead times

| Dependency | Needed by | Lead time / notes | Owner |
|---|---|---|---|
| **Safaricom Daraja production go-live** (Paybill or Till, M-Pesa org-portal admin, Lipa Na M-Pesa Online passkey) | Phase 4 sandbox (no wait); production before launch | Days to weeks. **Start now** | Business |
| Supabase account: staging project (Free) and production project (Pro) | Staging by Phase 4 (for sandbox callbacks); production by Phase 7 | Minutes. Pro is billed monthly | Business + me |
| Domain (`.co.ke` via a KENIC-accredited registrar, or `.com`) and DNS | Phase 7 | Hours to days | Business |
| Transactional email / SMTP provider (e.g., Resend, Brevo, Amazon SES) and its DNS records | Phase 3 (locally a mail viewer is enough); Phase 7 | Hours | Business + me |
| Cloudflare account (Turnstile; hosting if chosen) | Phase 3 (test keys before then) | Minutes | Business |
| WhatsApp Business number | Phase 2 (link target, placeholder until then) | Existing number | Business |
| **Real photography** of the farm and products | Phase 6 (before launch) | 1–2 weeks to arrange | Business |
| Product list, prices, units, minimum orders, delivery areas and fees, policies, FAQs | Phases 4–6 | — | Business |
| Legal and accounting review (privacy, terms, tax/eTIMS, licensing) | Before launch | 1–3 weeks | Business (advocate/accountant) |

## 9. Decisions needed from you

**Resolved 2026-10-13.** You approved the plan without changes, so the recommendations below are now the working decisions for D1–D5. You also authorised pushing to GitHub (D6). The repository is public, so the reference image stays out of version control (D2).

Still needed from the business, though none of it blocks Phase 1:
- Confirmation of the trading name, and any existing logo (D2).
- Whether chicks are sold from stock or booked by hatch date (D3).
- The Paybill or Till details, and the start of Daraja go-live (D5).

**Decision record** (the recommendation column is what was adopted):

| ID | Question | My recommendation (used as the default if you approve without changes) | Blocks |
|---|---|---|---|
| **D1** | Rendering architecture | React Router 8 framework mode, `ssr:false`, public pages pre-rendered at build time. The alternative, a plain SPA, is simpler but slower to get indexed, and product links shared on WhatsApp/Facebook show only a generic preview | Phase 1 |
| **D2** | Brand. Is "PoultryHub Kenya" the trading name? Is there an existing logo or brand colours? | Use "PoultryHub Kenya" with a placeholder wordmark, both centralised in config so they're easy to change. The reference image is a third-party design: keep it out of a public repo, or move it to `docs/design/` if the repo is private | Phase 1 (logo) |
| **D3** | Launch product range. Are chicks sold from stock or by booking a hatch date? | Eggs, day-old chicks, live birds (sold per bird in weight bands), point-of-lay pullets, feeds and equipment. Dressed chicken and veterinary products are excluded until licensing is confirmed. Chicks use "available from" dates as batch capacity | Phase 2 (navigation, sample data) |
| **D4** | Guest checkout | **Yes**, with a secret tracking link, Turnstile, a 30-minute stock hold for unpaid M-Pesa orders, and at most 3 open unpaid orders per phone | Phase 2 (checkout) |
| **D5** | Payment methods at launch. Do you already have a Paybill or Till? | M-Pesa STK Push when Daraja is live, plus pay on delivery, pay on collection, and manual Paybill confirmed by staff, each switchable in settings. Start the Daraja go-live now | Phase 4 configuration |
| **D6** | Git workflow | Commit on phase branches. Push and open PRs on GitHub **only if you say so**; otherwise commits stay local | Phase 1 |

**Can wait until the phase shown:** delivery areas and fees (4) · email provider (3) · hosting provider and domain (7) · Supabase region after the latency test (3) · admin MFA (5, recommended on) · SMS notifications (after launch) · newsletter (after launch, needs double opt-in).

## 10. Change control

Any scope change (new feature, new integration, a different tech choice) goes in this file and in REQUIREMENTS.md, with a priority and its impact on the schedule, before it's built. Architecture changes get an ADR entry in [ARCHITECTURE §14](ARCHITECTURE.md#14-architecture-decision-records). Approved phases are never silently reworked. If later work forces a change to an approved phase, I'll tell you explicitly.
