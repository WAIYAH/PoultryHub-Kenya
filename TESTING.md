# Testing Strategy: PoultryHub Kenya

> **Version:** 0.1 (Phase 0) · **Date:** 2026-10-13
> Business rules (BR-xx) are defined in [REQUIREMENTS §5](REQUIREMENTS.md#5-business-rules). Database behaviour is in [DATABASE.md](DATABASE.md), APIs in [API_AND_INTEGRATIONS.md](API_AND_INTEGRATIONS.md).

---

## 1. Principles

1. **Test rules where they live.** SQL rules are tested in Postgres (pgTAP and integration tests). UI behaviour is tested with Testing Library. Journeys are tested in real browsers (Playwright).
2. **Every business rule has at least one automated test**, and the rule ID is in the test name (e.g., `BR-06 rejects quantities off the step`).
3. **Evidence, not claims.** Phase summaries include the actual command output and reports. Tests that couldn't run are listed as **unverified**, with the reason.
4. **Deterministic.** Seeded data, mock payments, no sleeping on real time (expiry tests set `reserved_until` in the past), and Vitest fake timers for UI countdowns.
5. **Fail closed on missing external services.** Tests that need real credentials are separate and skip with an explicit message. They never pass silently.

## 2. Test layers & tools

| Layer | Tool | Scope | Runs | From phase |
|---|---|---|---|---|
| Static | TypeScript (`react-router typegen` + `tsc --noEmit`), ESLint (+ jsx-a11y, import boundaries), Prettier | All code | Every PR | 1 |
| Unit | Vitest | `src/domain`, cart store, data mappers, pure `supabase/functions/_shared` modules (Daraja password/timestamp, callback parser, result mapping) | Node | 1 |
| Component | Vitest + @testing-library/react + user-event + jest-dom (jsdom) | Shared and feature components on mock services | Node | 1 |
| Database | pgTAP via `supabase test db` | Constraints, **RLS matrix**, SQL functions, state transitions | Local Supabase (Docker) and CI | 3 |
| Integration | Vitest (node project) against the local stack + `supabase functions serve` | Concurrency (overselling), idempotency, expiry, Edge Functions in mock payment mode | Docker and CI | 4 |
| End-to-end | Playwright + @axe-core/playwright | Critical journeys across browsers and viewports | `pnpm preview` (mock) → local stack (Phase 3+) | 1 |
| Accessibility | axe (automated) + keyboard, NVDA, TalkBack (manual) | Every page template | CI + phase gates | 1 |
| Performance | Bundle-budget script; Lighthouse mobile | Public routes | CI (budget) + gates (Lighthouse) | 2 |
| Security | Build-output secret scan, `pnpm audit`, Supabase advisors, RLS meta-test, manual checklist (§10) | Whole system | CI + gates | 3 |

## 3. Commands

Scripts are added **only when the tool and config exist**, so there are no dead scripts.

| Script | Purpose | Added in |
|---|---|---|
| `pnpm lint` / `pnpm format:check` | ESLint / Prettier | Phase 1 |
| `pnpm typecheck` | Route type generation + `tsc --noEmit` | Phase 1 |
| `pnpm test` / `pnpm test:watch` | Vitest unit + component | Phase 1 |
| `pnpm test:coverage` | Vitest with coverage (`@vitest/coverage-v8`, added when first needed) | Phase 2 |
| `pnpm test:e2e` / `pnpm test:e2e:ui` | Playwright (its `webServer` builds and previews) | Phase 1 |
| `pnpm db:start` · `db:reset` · `db:test` · `db:types` | Local Supabase, pgTAP, type generation | Phase 3 |
| `pnpm test:integration` | Integration project (needs `pnpm db:start`) | Phase 4 |
| `pnpm preview` | Serves `build/client` like the production host (`scripts/serve-static.mjs`); also used by Playwright | Phase 1 |
| `pnpm check:budget` | Initial-JS budget per pre-rendered page (`scripts/check-bundle-budget.mjs`, NFR-PERF-3) | Phase 1 |
| `pnpm check` | lint + typecheck + test + build + budget (pre-push) | Phase 1 |

## 4. Environments, data & devices

- **Phases 1–2:** `VITE_DATA_SOURCE=mock`. Typed fixtures; mock services have deterministic latency and support development/test-only controls (`?mock=slow|empty|error`).
- **Phase 3+:** the local Supabase stack. `supabase db reset` runs before the database suites.
  - **Test users:** created by setup scripts, with passwords from local environment variables (never in seed data).
  - **Captcha:** Turnstile **test keys**.
  - **Email:** auth emails are read from **Mailpit** through its HTTP API, e.g. to click confirmation links in E2E tests.
- **Payments:** automated suites always use `PAYMENTS_MODE=mock`. The Daraja sandbox is exercised manually on staging (§9).
- **Playwright projects:**

  | Project | Browser | Viewport |
  |---|---|---|
  | `mobile-360` | Chromium | 360×800, touch, Android UA |
  | `mobile-safari` | WebKit | iPhone 13 |
  | `tablet` | Chromium | 768×1024 |
  | `desktop-chrome` | Chromium | 1280×800 |
  | `desktop-firefox` | Firefox | — |
  | `desktop-webkit` | WebKit | — |

  Pull requests run `mobile-360` and `desktop-chrome`. The full matrix runs nightly and at every phase gate.
- **Slow network:** one Chromium project uses CDP throttling ("Slow 4G") for the checkout journey.

## 5. Coverage of the 14 required areas

| # | Required area | Unit / component | Database / integration | End-to-end | Phase |
|---|---|---|---|---|---|
| 1 | Product listing & filtering | URL ⇄ filter/sort utils; ProductGrid loading/empty/error; FilterPanel | `storefront_products` hides drafts and archived items (RLS); search, availability and price filters | Filter by category + availability + price, sort, paginate. The URL can be shared, and Back restores state | 2 / 3 |
| 2 | Product details | VariantPicker, PriceDisplay, StockBadge, gallery keyboard support | Inactive variants hidden; enquiry-only has no cart path | Product page for each type: eggs (tray), chicks (MOQ and step), live birds (weight band), feeds (bag). Related products; WhatsApp link | 2 / 3 |
| 3 | Cart quantity updates | Cart store: add, merge, update, remove, persist, migrate. QuantitySelector min/step/max | — | Add, update and remove in the drawer and on the page; the cart survives a reload | 2 |
| 4 | Stock validation | Client clamps to available stock | `quote_cart` returns `INSUFFICIENT_STOCK`; `place_order` rejects more than is in stock (BR-08) | Cart shows "Only N left"; checkout recovery screen | 2 / 4 |
| 5 | Checkout validation | Checkout Zod schema: all phone formats (KM-2); county → area; fulfilment/payment combinations (BR-17); pay-on-delivery cap | `place_order` re-validates: bad phone, `AREA_NOT_SERVED`, `PAYMENT_METHOD_UNAVAILABLE`, `TOO_MANY_OPEN_ORDERS` | Error summary takes focus; guest and signed-in; draft survives a refresh | 2 / 4 |
| 6 | Price & delivery calculations | `formatKES`; rounding helpers; mock pricing | Subtotal; zone fee; free threshold; minimum order; promotions (% with cap, half-up rounding, BR-02/30); total invariant; **tampered client prices ignored (BR-03)** | Displayed totals equal the server quote | 2 / 4 |
| 7 | Authentication | AuthProvider/session hooks; auth form validation | Sign-up trigger creates the profile; `profiles.email` can't be updated through the API | Sign-up with the Mailpit link, sign-in, wrong password, reset, sign-out, protected redirect with `?next=` | 2 / 3 |
| 8 | Customer order access | — | RLS: customer A can't read B's orders, items, events or payments; guests need the token; a wrong token gives `NOT_FOUND`; internal events are hidden | Opening another customer's order URL shows not found | 3 / 4 |
| 9 | Administrator permissions | Admin route guard UI | RLS and function-grant matrix (customer, staff, admin) for every admin RPC and table write; no self-grant; last-admin protection; `aal2` (if enabled) | Staff blocked from admin-only modules; customers get access-denied at `/admin`; direct API calls rejected | 3 / 5 |
| 10 | Inventory updates & overselling | — | Ledger invariant; `adjust_stock` sign and note rules (BR-11/12); **20 parallel orders against 5 units**; cancellation and expiry release stock exactly once | Admin restock changes availability on the storefront | 4 / 5 |
| 11 | M-Pesa callbacks & duplicates | Callback parser (success, failure, missing items); result-code mapping | Webhook: bad secret → 404; unknown ID → unmatched; duplicate → no-op; amount mismatch → `needs_review`; codes 1032, 1037, 1, 2001 mapped; late success after expiry → `needs_review`; success that STK Query doesn't verify is **not** applied; reconciliation resolves a lost callback | Mock-mode payment success, cancel and timeout in the UI | 4 |
| 12 | Order status transitions | Status → label mapping (every enum value) | Every allowed transition succeeds and writes an event and an audit entry; every other transition raises; completion requires payment (BR-26); customers can cancel only pending orders (BR-25) | Admin moves an order through the lifecycle; the customer's timeline updates | 4 / 5 |
| 13 | Mobile navigation | MobileNav: open, close, focus trap, Escape, closes on navigation | — | At 360 px: menu, cart badge, search, sticky buy bar; **no horizontal scroll** on any template | 1 / 2 |
| 14 | Empty, loading & error states | Every data view in mock slow, empty and error modes | — | `?mock=empty\|error` (Phase 2) and route interception (Phase 3+) show the correct copy, and retry works | 2 |

## 6. Test catalogue

### 6.1 Unit tests (domain)

| Module | Cases |
|---|---|
| `money` | `formatKES`: whole → `KSh 1,250`; cents → `KSh 1,250.50`; 0; large values; negative (refund display). Minor-unit conversion never uses floating-point maths |
| `phone` | Normalises `0712 345 678`, `0112345678`, `+254 712-345-678`, `254712345678`, `712345678`. Rejects landlines (`020…`), wrong lengths and non-digits. Masks as `2547****678` |
| `units` | `isValidQuantity` / `nextValidQuantity` / `clampQuantity` with MOQ, step and max (BR-06). Unit labels for every `sale_unit` |
| `counties` | 47 unique counties, matching the DB enum (generated-type check) |
| `orderStatus` | A customer label for every status + method combination (ORD-01) |
| `whatsapp` | Correct `wa.me` number formatting and URL encoding of templates |
| `dates` | EAT formatting; day boundaries at 21:00 UTC |
| `env` | Rejects `sb_secret_` keys; rejects mock data in production; lists missing variable names without printing values |
| `_shared/mpesa` | Password and timestamp builder (EAT); callback parser; result-code mapper; amount whole-shilling guard |

### 6.2 Component tests (selection)

| Component | Assertions |
|---|---|
| ProductCard | Badges, MOQ hint, the add button adds the MOQ, link semantics (card link plus separate button) |
| QuantitySelector | Keyboard support, min/step/max limits, reason announced when a limit is hit |
| CartDrawer | Empty and filled states; price-change notice; checkout link |
| CheckoutForm | Validation messages; error summary takes focus; payment options change with fulfilment; draft persistence |
| AreaSelector | County filters the areas; "Not listed?" path to pick-up or WhatsApp |
| MpesaPaymentPanel | Full state machine with fake timers (sending → awaiting → paid/cancelled/failed/timeout) |
| Others | Retry callbacks in EmptyState and ErrorState; MobileNav; FAQAccordion; OrderTimeline; DemoModeBanner shown only in mock mode |

### 6.3 Database & RLS tests (pgTAP)

- **Meta-tests:**
  - Every `public` table has RLS enabled.
  - Every table with API grants has at least one policy.
  - Every `SECURITY DEFINER` function sets `search_path`.
  - Only allow-listed functions are executable by `anon` or `authenticated`.
- **RLS matrix:** each table × persona (anonymous, customer A, customer B, staff, admin, and admin without `aal2` if MFA is approved) × operation (select, insert, update, delete), asserted against [DATABASE §9.2](DATABASE.md#92-access-matrix).
- **Constraints:** stock ≥ 0; order total invariant; whole-shilling checks; phone format; testimonial consent; blog `published_at`; promo code format; ledger sign rules.
- **Functions:**
  - **Orders:** `place_order` validation paths; every transition in [DATABASE §5](DATABASE.md#5-order-lifecycle).
  - **Stock:** `adjust_stock`.
  - **Payments:** `record_manual_payment` (receipt is unique, BR-20); `record_refund` (refunds ≤ amount paid, BR-22).
  - **Roles:** `grant_role` / `revoke_role` (no self-grant, last admin, BR-33).

### 6.4 Integration tests

| Test | Expected |
|---|---|
| **Overselling** (BR-08, BR-11) | 20 concurrent `place_order` calls (separate connections, `Promise.all`) of 1 unit against a stock of 5 → exactly 5 orders, 15 `INSUFFICIENT_STOCK`, final stock 0, and the ledger sums to the stock |
| **Idempotency** (NFR-REL-1) | The same key twice gives one order; the replay returns a rotated token and the old token stops working. The same key with a different payload gives `IDEMPOTENCY_CONFLICT` |
| **Expiry** (BR-09) | A pending M-Pesa order past its hold with no in-flight attempt is cancelled and its stock released once. With an in-flight attempt it's untouched |
| **Storefront function** | Turnstile test secret: the pass key works; the fail key gives `CAPTCHA_FAILED`. Track returns no personal data. Contact message is stored |
| **Payments function** | Mock STK; one pending attempt per order; `PAYMENT_IN_PROGRESS` on repeat; reconcile requires the secret |
| **Webhook suite** | Every case in row 11 of §5 |

### 6.5 End-to-end journeys

| ID | Journey |
|---|---|
| J1 | **Browse & buy:** a guest orders for delivery and pays by M-Pesa (mock success). Mobile and desktop |
| J2 | **Pick-up** with pay on collection → staff confirm (Phase 5) → staff record payment → completed |
| J3 | **Stock race:** cart holds 3; admin lowers stock to 1 → checkout shows the `INSUFFICIENT_STOCK` recovery |
| J4 | **Price change** between cart and checkout → `PRICE_CHANGED` review screen |
| J5 | **M-Pesa failures:** cancelled, then timeout, then retry → success. Switch to Paybill instructions |
| J6 | **Account:** sign up → confirm via Mailpit → sign in → order history → order detail → sign out |
| J7 | **Guest tracking:** the token link works; the track form with number + phone works; a wrong phone shows not found |
| J8 | **Admin product lifecycle:** draft → variants → images (alt required) → activate → visible in the shop → archive → hidden |
| J9 | **Admin order processing:** confirmed → processing → dispatched (rider) → record pay-on-delivery → completed. The customer's timeline matches |
| J10 | **Admin inventory:** a mortality adjustment requires a note → ledger entry → storefront availability updates |
| J11 | **Permissions:** staff blocked from settings, refunds and team; customers see access-denied at `/admin`; direct API calls (`page.request`) rejected |
| J12 | **Content:** admin publishes an FAQ and a testimonial (consent required) → both visible on the home page |
| J13 | **Layout:** 360 px, no horizontal scroll on any template (`scrollWidth` assertion); menu focus trap |
| J14 | **States:** forced empty, error and slow responses show the correct copy, and retry works |
| Crawl | Visit every internal link from the navigation and the sitemap: no 404s and no console errors |

### 6.6 Accessibility

- axe on every template, with **zero serious or critical** violations.
- Keyboard-only runs of J1 and J8.
- Screen-reader spot checks at every gate: NVDA + Chrome/Firefox (Windows) and TalkBack (Android).
- Reduced-motion emulation: no animation, and all content visible.
- At 200 % zoom and with text-only zoom, no content is lost.

### 6.7 Performance & SEO

- **Bundle budget:** CI reads the build manifest and fails if any public route's initial JavaScript is over 170 KB gzipped (NFR-PERF-3).
- **Lighthouse (mobile)** at gates for Home, Shop, Product and Blog post, against the thresholds in [PLAN.md](PLAN.md).
- **DOM checks:** every `<img>` has `width`, `height` and `alt`; exactly one `h1` per page.
- **SEO checks:**
  - Each pre-rendered page has a unique title, description and canonical URL.
  - Private routes are `noindex`.
  - JSON-LD contains only real fields (no `aggregateRating`).
  - The sitemap lists every active product, category and post and **no** private routes.
  - `robots.txt` is correct.
  - A manual Rich Results check at Phase 6.

## 7. Acceptance criteria for critical flows

Prices and fees below are **sample values** for the test only.

| ID | Given | When | Then |
|---|---|---|---|
| **AC-1** Guest M-Pesa order | 10 trays in stock at KSh 520; area "Ruiru" in a zone with a KSh 200 fee | A guest orders 2 trays for delivery to Ruiru and pays with M-Pesa | Order `PH…` is created `pending` with total KSh 1,240; stock becomes 8 with an `order_reserved` movement; the customer sees "Check your phone"; after a verified success the order shows "Payment confirmed" and `payment_status = paid` |
| **AC-2** Tampered price | Variant price KSh 520 | A client submits a forged unit price of KSh 1 and an expected total of KSh 2 | Server returns `PRICE_CHANGED` with the true quote; no order is created |
| **AC-3** Overselling | Stock 5 | 20 customers order 1 unit concurrently | Exactly 5 orders; 15 `INSUFFICIENT_STOCK`; stock 0, never negative |
| **AC-4** Hold expiry | An unpaid M-Pesa order past its 30-minute hold, no in-flight attempt | The expiry job runs | Order cancelled (`payment_timeout`); stock released exactly once; customer sees "Cancelled: payment not received" |
| **AC-5** Late payment | An order cancelled by expiry | A verified successful payment arrives | Payment `succeeded`; order `needs_review` and shown in "Needs attention"; **not** confirmed automatically |
| **AC-6** Duplicate callback | Payment already succeeded | The same callback arrives again | Only a new `payment_events` row; no second confirmation, email or order event |
| **AC-7** Forged callback | — | A success callback is posted (a) to a wrong secret path, (b) to the right path for an attempt that STK Query says is unpaid | (a) `404`, nothing applied; (b) order stays unpaid and the event is recorded as unverified |
| **AC-8** Order privacy | Customers A and B each have orders | A requests B's order by number (API or UI) | `NOT_FOUND`; no personal data returned |
| **AC-9** No self-promotion | A customer account | It tries to insert into `user_roles`, update profile fields it doesn't own, or call `grant_role` | Every attempt fails; no privilege gained |
| **AC-10** Invalid transition | A `pending` pay-on-delivery order | Staff try to mark it `completed` | Rejected (not an allowed transition, and unpaid) |
| **AC-11** Mobile checkout | 360×800 viewport, Slow 4G | A guest completes J1 | No horizontal scroll; tap targets ≥ 44 px; "Place order" responds within 100 ms and can't double-submit |
| **AC-12** Demo honesty | Mock data source | Any page renders | The demo banner is visible; the checkout says no payment is processed; no "paid" state claims a real M-Pesa transaction |

## 8. CI pipeline & quality gates

| Workflow | Trigger | Steps | Blocking |
|---|---|---|---|
| `ci.yml` | PRs, pushes to `main` | Install (frozen) → lint → format check → typecheck → test → build (mock) → bundle budget + secret scan → E2E (`mobile-360`, `desktop-chrome`) with axe | Yes |
| `db.yml` | PRs touching `supabase/**` or `src/services/supabase/**`; nightly | `supabase start` → `db reset` → `db test` → integration tests → database lint/advisors | Yes |
| `nightly.yml` | Schedule | Full Playwright matrix, Slow-4G journey, link crawl | Reports and opens an issue on failure |

**Coverage:** at least 80 % lines for `src/domain` and the payment modules in `supabase/functions/_shared`. There's no global percentage target for UI code, because a vanity metric there would encourage shallow tests.

**Flaky tests** are quarantined with a tracked issue and fixed. They are never retried indefinitely.

## 9. Tests requiring external credentials or services

| Test | Needs | Until available |
|---|---|---|
| Daraja **sandbox** STK round trip | Sandbox consumer key/secret and passkey; a deployed staging function (public HTTPS callback) | Mock-mode tests only. Reported as **unverified** |
| Daraja **production** verification (low-value transaction + refund) | Go-live credentials, production project | Launch with offline methods; M-Pesa documented as pending |
| Real Turnstile behaviour | Cloudflare site and secret keys | Cloudflare test keys (always pass / always fail) |
| SMTP deliverability (SPF/DKIM/DMARC, inbox placement) | Email provider and domain DNS | Local Mailpit only |
| Hosted Supabase behaviour (region latency, hosted Vault and cron, backups, restore drill) | Staging and production projects | Local Docker stack |
| Static host rewrites and headers | Host account | `pnpm preview` (no host headers) |
| Real devices (low-end Android, iPhone) | Physical devices or a device cloud | Playwright emulation |

## 10. Pre-release checklist

**Security**
- [ ] RLS meta-test and matrix pass; Supabase security advisor clean.
- [ ] Only allow-listed RPCs can be executed by `anon` or `authenticated`.
- [ ] No secrets in git history, build output or logs; `.env*` git-ignored (except `.env.example`).
- [ ] Mock payment endpoint returns 404 in production; the production build uses `VITE_DATA_SOURCE=supabase`.
- [ ] Turnstile active on auth, guest checkout, contact and track-order.
- [ ] Security headers and CSP verified on the deployed site.
- [ ] `pnpm audit`: no high or critical issues (or documented exceptions).
- [ ] Admin MFA enforced (if approved); at least 2 admins; last-admin protection tested.
- [ ] Production webhook secret is fresh; reconciliation cron running.

**Data & privacy**
- [ ] Policy pages reviewed by an advocate, with `last_reviewed_at` set.
- [ ] Retention job enabled; data-subject request procedure documented.
- [ ] Backups confirmed; restore drill completed on a scratch project.

**Commerce**
- [ ] Real products, prices, units, MOQs, delivery zones, areas, fees and pick-up points entered and spot-checked.
- [ ] Live test order with each enabled payment method; a refund recorded.
- [ ] Order notification paths (email, WhatsApp) tested with the business.

**Content & SEO**
- [ ] No `SAMPLE`, placeholder or "lorem" content remains (automated grep, plus placeholder phone numbers).
- [ ] Real photos with alt text and credits; no unverified claims.
- [ ] Sitemap, robots, canonical URLs and structured data validated; sitemap submitted to Google Search Console.

**Quality**
- [ ] All CI workflows green; full E2E matrix green; Lighthouse thresholds met.
- [ ] Known issues documented for handover.

## 11. Defect management

| Severity | Definition | Rule |
|---|---|---|
| **S1** | Money, stock, security or data-loss defect | Fix before any other work; regression test required |
| **S2** | Blocks a core flow (browse, cart, checkout, pay, admin order processing) | Fix within the phase; regression test required |
| **S3** | Degraded experience with a workaround | Prioritised in the next phase |
| **S4** | Cosmetic | Batched |

Known issues are listed in each phase summary and, at handover, in `docs/KNOWN_ISSUES.md`.
