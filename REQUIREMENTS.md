# Requirements: PoultryHub Kenya

> **Version:** 1.0 (approved 2026-10-13) · **Date:** 2026-10-13
> **Priority (MoSCoW):** **M** = Must · **S** = Should · **C** = Could · **W** = Won't for now (recorded so it isn't forgotten).
> **Phase column:** `UI / backend`. For example, `2 / 4` means the screen is built on mock data in Phase 2 and becomes real in Phase 4 (see [PLAN.md](PLAN.md)).
> Statements marked **[Assumption]** must be confirmed by the business (§9).

---

## 1. Business context

- **The seller:** a single poultry business in Kenya selling directly to customers. It is not a marketplace.
- **What it likely sells:** table eggs (including kienyeji eggs), day-old chicks, point-of-lay (POL) pullets, live birds (broilers, kienyeji, spent layers), feeds and supplements, small equipment (feeders, drinkers), and possibly manure. It also offers bulk/wholesale supply and farming guidance **[Assumption]**.
- **How it sells today:** probably by phone, WhatsApp and walk-ins **[Assumption]**. The website must work *with* WhatsApp, not replace it.
- **Operational realities the software must respect:**
  - Eggs are fragile and perishable. Chicks and birds are live animals that need careful timing and transport.
  - Stock changes for reasons other than sales: mortality, breakage, culling.
  - Nearby deliveries go by the business's own riders or vehicles; farther areas need special arrangements or collection **[Assumption]**.
  - M-Pesa dominates payments, and many customers expect a confirmation call or WhatsApp before dispatch.
  - Customers mostly use mid-range Android phones on mobile data, and are cost-sensitive about data.

## 2. Users

| Persona | Typical needs | Design implications |
|---|---|---|
| **P1 Household buyer** (urban or peri-urban) | Buys eggs weekly and birds occasionally. Wants a clear price per tray or bird, the delivery fee up front, and M-Pesa or pay on delivery | Fast mobile pages, simple checkout, "Order again", WhatsApp help |
| **P2 Small-scale farmer** (county towns, rural) | Buys chicks (often 50–500), POL pullets and feeds. Needs breed or product details, availability dates, a minimum order, and a pick-up or transport option | Specification tables, availability and minimum-order hints, pick-up points, guidance content |
| **P3 Business buyer** (hotel, restaurant, school, shop) | Bulk eggs or broilers on a schedule. Needs reliability, quotes and invoices | Bulk/quote calls to action, recurring-supply enquiries, printable receipts |
| **P4 Owner / admin** | Manages products, prices, stock, orders, payments, content and reports, often from a phone | Mobile-capable admin, clear metrics, audit trail |
| **P5 Staff / dispatcher** | Processes and packs orders, dispatches them, records cash or M-Pesa on delivery, logs mortality and breakage | Focused permissions, fast status updates, stock adjustments |

## 3. Scope

### 3.1 In scope

- **Public site:** home, catalogue, product pages, cart, checkout, order tracking, about, services, contact, blog, FAQ, search, policies and error pages.
- **Customer accounts:** sign-up, sign-in, password reset, profile, saved addresses, order history.
- **Ordering:** guest checkout (approved, D4), with server-side pricing, stock and delivery rules.
- **Payments:** M-Pesa STK Push via Daraja, plus configurable offline methods (pay on delivery, pay on collection, manual Paybill).
- **Admin dashboard:** products, inventory, orders, customers, payments, delivery, promotions, content, blog, messages, reports, settings, team and audit log.
- **Engineering:** security (RLS, roles, MFA for admins), SEO, accessibility, performance, testing, deployment and handover documentation.

### 3.2 Out of scope (unless re-approved)

| Item | Reason / future path |
|---|---|
| Multi-vendor marketplace | Explicitly excluded. The schema doesn't block adding it later |
| Native mobile apps | The responsive web app covers mobile |
| Subscriptions or automatic recurring billing | Recurring supply is handled by enquiry. Automation could come later |
| Product reviews and ratings | Need moderation and real purchase verification. No fabricated ratings |
| Automated M-Pesa refunds (Reversal API / B2C) | Need extra Safaricom approvals. Refunds are executed in the M-Pesa org portal and recorded in admin |
| SMS notifications and phone-OTP sign-in | Cost per SMS. Planned later via Africa's Talking (Supabase "Send SMS" hook) |
| WhatsApp Business API automation | Cost and Meta verification. We use `wa.me` deep links |
| Swahili localisation | English at launch. Strings are kept centralised so it can be added later |
| KRA eTIMS integration | To confirm with an accountant (§8). Could be added via certified middleware |
| Editing an order after it's placed | Cancel and re-order, or record a partial refund |
| Live GPS delivery tracking | Status timeline with rider details instead |
| Newsletter | Only once double opt-in, unsubscribe and a sending provider exist (FR-SITE-12) |

## 4. Functional requirements

### 4.1 Public site & content (FR-SITE)

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| SITE-01 | Responsive header: logo; nav (Home, Shop, About, Services, Blog, Contact); search; account; cart with a live item count; "Get a quote" call to action. Sticky on scroll. On mobile, a sheet menu that also offers WhatsApp and call | M | 2 / – |
| SITE-02 | Home page sections, in order ([DESIGN_SYSTEM §10.1](DESIGN_SYSTEM.md#101-home-page-blueprint)): hero, trust strip, shop by category, featured products, about the farm, fresh-eggs promotion, how we farm, how ordering works + delivery info, testimonials (only if published), FAQ, wholesale call to action, footer | M | 2 / 3 |
| SITE-03 | Statistics and certifications appear **only** when an admin has entered them. Otherwise the trust strip shows service facts (M-Pesa accepted, delivery areas served, farm pick-up, WhatsApp support) | M | 2 / 3 |
| SITE-04 | WhatsApp: a floating button (hidden on checkout and admin, and never covering sticky actions); product-specific prefilled messages; order-help messages with the order number; click-to-call links | M | 2 / – |
| SITE-05 | About page: story, mission and vision, farming methods, quality standards, commitments. Editable content blocks | M | 2 / 3 |
| SITE-06 | Services page showing only services marked "offered": poultry supply, eggs, chicks, bulk/wholesale, guidance, recurring supply, delivery and pick-up | M | 2 / 3 |
| SITE-07 | Footer: navigation, shop categories, policies, contact details, business hours, real social links only, accepted payment methods (text), © and legal links | M | 2 / 3 |
| SITE-08 | Admin-controlled announcement bar (e.g., holiday hours), dismissible per visitor | S | 2 / 5 |
| SITE-09 | Policy pages (privacy, terms, delivery & returns, payments): editable Markdown showing a "last reviewed" date. Templates are marked *draft for legal review* | M | 2 / 3 |
| SITE-10 | Custom 404, access-denied and error pages, each with recovery actions (home, shop, WhatsApp) | M | 1 / – |
| SITE-11 | Site-wide search page covering products, blog posts and FAQs | S | 2 / 3 |
| SITE-12 | Newsletter sign-up | W | – |

### 4.2 Catalogue (FR-CAT)

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| CAT-01 | Shop grid: 2 columns on phones, 3 on tablets, 4 on desktop. Product card shows image, name, price per unit ("KSh 520 / tray"), availability badge, minimum-order hint and add-to-cart | M | 2 / 3 |
| CAT-02 | Filters for category, availability (in stock / pre-order) and price range. Sort by featured, price ↑/↓, newest or name. Keyword search. All filter state lives in the URL so it can be shared | M | 2 / 3 |
| CAT-03 | Numbered pagination (24 per page) that keeps the filters | M | 2 / 3 |
| CAT-04 | Category landing pages (`/shop/:category`) with an intro and SEO metadata | M | 2 / 3 |
| CAT-05 | Product details: gallery (swipe and thumbnails), name, price and unit, variant picker, description, category, availability, quantity selector (respects minimum, step, maximum and stock), add-to-cart, specifications table, delivery and pick-up info, related products, WhatsApp enquiry, breadcrumbs. Mobile has a sticky add-to-cart bar | M | 2 / 3 |
| CAT-06 | Product types are expressed through variants and units: eggs (tray or crate), chicks (per chick, with minimum and step), live birds (per bird in weight bands), pullets (per bird), feeds (per bag size), equipment (per piece), manure (per bag) | M | 2 / 3 |
| CAT-07 | Enquiry-only products (no cart button; offer "Request a quote" or WhatsApp instead), for custom or bulk items | S | 2 / 3 |
| CAT-08 | Batch availability: an "available from" date and lead time (e.g., chick hatch batches), shown as "Ready from 24 Oct". Depends on D3 | S | 2 / 3 |
| CAT-09 | Compare up to 3 products in the same category side by side (specifications table) | C | – |
| CAT-10 | Loading skeletons; an empty-results state with "clear filters"; an error state with retry and a WhatsApp fallback | M | 2 / 3 |
| CAT-11 | Badges: Featured, Pre-order, Low stock (only when at or below the configured threshold), Out of stock | M | 2 / 3 |
| CAT-12 | Search understands Swahili synonyms (e.g., *mayai*, *kuku*, *vifaranga*, *kienyeji*), maintained per product | S | 2 / 3 |

### 4.3 Cart (FR-CART)

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| CART-01 | Add, remove and change quantities with minimum, step, maximum and stock validation, and clear messages ("Chicks are sold in multiples of 10, minimum 50") | M | 2 / 4 |
| CART-02 | The cart is stored on the device (localStorage) and survives refreshes, closing the browser and going offline | M | 2 / – |
| CART-03 | A cart drawer for a quick look, plus a full cart page | M | 2 / – |
| CART-04 | Server quote: authoritative prices, availability, discount and delivery fee. Any line whose price changed or that became unavailable is highlighted, with a one-tap fix | M | 2 / 4 |
| CART-05 | Delivery fee estimate once a county and area are chosen. Otherwise show "Delivery fee is calculated at checkout" | M | 2 / 4 |
| CART-06 | Promo code entry, validated on the server, with a clear reason when a code is rejected | S | 2 / 4 |
| CART-07 | Empty cart state with links to categories | M | 2 / – |
| CART-08 | "Order again" adds a past order's items to the cart, re-validated | S | 2 / 4 |

### 4.4 Checkout & orders (FR-CHK, FR-ORD)

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| CHK-01 | A single-page checkout in sections (Contact → Delivery/Pick-up → Payment → Review), built for one-handed mobile use. Works for guests (D4) and signed-in customers; signed-in details are prefilled from the profile and saved addresses | M | 2 / 4 |
| CHK-02 | Fields: name; phone (Kenyan formats); email (optional; needed for email receipts); delivery or pick-up. **Delivery:** county → configured area → estate, street or building → landmark and directions → instructions. **Pick-up:** pick-up location. Also payment method and an order note | M | 2 / 4 |
| CHK-03 | Inline validation plus an error summary on submit. A draft is kept for the session so a refresh on a flaky network doesn't lose input | M | 2 / – |
| CHK-04 | Only payment methods enabled in settings and valid for the chosen fulfilment are offered: pay on delivery only with delivery, pay on collection only with pick-up, and pay on delivery respects its maximum order value | M | 2 / 4 |
| CHK-05 | Submission is idempotent. The button is locked while sending. These outcomes get clear recovery screens: `PRICE_CHANGED`, `INSUFFICIENT_STOCK`, `AREA_NOT_SERVED`, `TOO_MANY_OPEN_ORDERS` | M | 2 / 4 |
| CHK-06 | Confirmation page: order number, summary, what happens next, payment panel (M-Pesa) or confirmation note (pay-later), a WhatsApp link quoting the order number, and a copyable tracking link | M | 2 / 4 |
| CHK-07 | Guest tracking: a secret link (`/orders/PH001234?token=…`), plus a Track Order form (order number + phone) that shows **status only**, never personal data | M | 2 / 4 |
| ORD-01 | Order states and customer-facing labels follow [DATABASE §5](DATABASE.md#5-order-lifecycle). A timeline shows timestamps and rider or pick-up details | M | 2 / 4 |
| ORD-02 | A customer can cancel their own order while it is *pending* | S | 2 / 4 |
| ORD-03 | Order history and order details in the account area | M | 2 / 4 |
| ORD-04 | Printable receipt and order summary | S | 2 / 4 |

### 4.5 Payments (FR-PAY)

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| PAY-01 | M-Pesa STK Push started from the order page. The phone is prefilled and can be changed. The amount always comes from the server, in whole shillings | M | 2 / 4 |
| PAY-02 | Live status with distinct states: prompt sent → waiting → paid / cancelled / failed / timed out. Includes resend and retry, and a switch to Paybill instructions. Copy reminds the customer: **"We will never ask for your M-Pesa PIN."** | M | 2 / 4 |
| PAY-03 | Manual Paybill: show the Paybill number with the order number as the account. The customer may submit their M-Pesa code, which staff then verify | S | 2 / 4 |
| PAY-04 | Pay on delivery and pay on collection: staff record the amount, method and reference when the money is received | M | 5 / 4 |
| PAY-05 | An order is marked paid **only** after verification (callback + STK Query) or a staff record. Processing is idempotent; duplicate and late payments are flagged for review | M | – / 4 |
| PAY-06 | A mock payment mode for development and tests, visibly labelled **TEST**, which refuses to run in production | M | 2 / 4 |
| PAY-07 | Refunds are recorded by an admin (amount, method, reference, reason). The customer sees refund events on their order | M | 5 / 5 |
| PAY-08 | Automated M-Pesa reversals or B2C refunds | W | – |

### 4.6 Customer accounts (FR-ACC)

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| ACC-01 | Sign up with email and password (name and phone collected), email confirmation, Turnstile | M | 2 / 3 |
| ACC-02 | Sign in, sign out, and "sign out of all devices" | M | 2 / 3 |
| ACC-03 | Password reset via an email link (PKCE flow) | M | 2 / 3 |
| ACC-04 | Edit profile: name, phone, marketing consent. Email changes go through Supabase's secure email-change flow | M | 2 / 3 |
| ACC-05 | Saved addresses (up to 10, one default) | S | 2 / 3 |
| ACC-06 | Order history and details | M | 2 / 4 |
| ACC-07 | Link past guest orders to the account (with verification) | C | – |
| ACC-08 | Phone-OTP sign-in | W | – |
| ACC-09 | Data and account deletion requests. Handled manually by an admin at launch, following the documented procedure | S | 2 / 5 |

### 4.7 Contact, blog & FAQ (FR-CNT)

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| CNT-01 | Contact form: name, phone and/or email, subject (general, order help, wholesale quote, farm visit, feedback), message, optional order number. Turnstile plus server-side validation; success and error states; saved to the admin inbox with an email alert if configured | M | 2 / 3 |
| CNT-02 | Contact details, WhatsApp, business hours, map (a click-to-load embed, to save data, or a plain map link) | M | 2 / 3 |
| CNT-03 | Blog: index with pagination and tags; post pages with cover image, reading time, related posts and a WhatsApp share link | M | 2 / 3 |
| CNT-04 | FAQ page grouped by topic. A reusable FAQ component also appears on the home, product, delivery and checkout help sections | M | 2 / 3 |

### 4.8 Admin dashboard (FR-ADM)

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| ADM-01 | Admin shell: collapsible sidebar (a sheet on mobile); top bar with search, notifications and profile; page titles and breadcrumbs; consistent tables and forms | M | 5 |
| ADM-02 | Overview: total orders, orders awaiting processing, net paid revenue, pending payments, low and out-of-stock products, recent orders, best sellers, sales trend, recent activity. Date-range filter. **Everything comes from the database** (definitions in [DATABASE §15](DATABASE.md#15-metric-definitions)) | M | 5 |
| ADM-03 | Products: list, search and filter. Create and edit details, category, variants (price, unit, minimum, step, maximum, low-stock threshold, availability dates), featured flag, specifications, Swahili keywords and SEO. Archive and restore. Images: upload, reorder, alt text. Per-product sales summary | M | 5 |
| ADM-04 | Categories: create, edit and reorder | M | 5 |
| ADM-05 | Inventory: stock overview, low-stock filter, adjustments with a reason (restock, mortality, damage, return, count correction) and a note, movement history with who made each change, CSV export | M | 5 |
| ADM-06 | Orders: filter by date, status, payment status, method and fulfilment, and search by order number, phone or name. Detail view shows items, customer, address, payments and timeline. Validated status updates, internal notes, delivery details (rider, ETA), cancellation (releases stock), record payment, refund (admin only), print packing slip or receipt, CSV export | M | 5 |
| ADM-07 | Customers (admin only): list and search, profile, order history and totals. Ban or unban an account through the Auth admin API | M (list) / S (ban) | 5 |
| ADM-08 | Payments: list and filter; details (method, amount, reference, status, timestamps, related order, raw provider events for admins); queues for payments needing review and unmatched payments; resolve actions | M | 5 |
| ADM-09 | Delivery: zones (fee, free-delivery threshold, minimum order, ETA, delivery days, cut-off time), areas (county + name), pick-up locations | M | 5 |
| ADM-10 | Promotions: discount codes with validity dates, usage limits and minimum spend | S | 5 |
| ADM-11 | Content: home blocks (hero, trust facts, about, eggs promotion, practices, call to action, announcement), About and Services blocks, FAQs, testimonials (consent required), policy pages, site settings (contact, hours, socials, payment methods, order settings) | M | 5 |
| ADM-12 | Blog: drafts, publish and schedule; cover images; tags; SEO fields | S | 5 |
| ADM-13 | Contact inbox with status (new, in progress, resolved, spam) | M | 5 |
| ADM-14 | Reports: sales by day, week or month, and by product, category, payment method and fulfilment method; inventory and movement reports; CSV export | S | 5 |
| ADM-15 | Team: invite staff, grant or revoke roles (admin only). The last admin cannot be removed | M | 5 |
| ADM-16 | Audit log viewer (admin only) | S | 5 |
| ADM-17 | Notifications: new orders (realtime), payments needing review, low stock, new messages | S | 5 |
| ADM-18 | MFA (TOTP) required for admin and staff accounts. Pending confirmation, recommended | S | 5 |

## 5. Business rules

These rules are authoritative. Each one is enforced **on the server** (SQL constraints and functions); the UI copies them only to give helpful feedback. Tests reference them by ID.

**Money & pricing**
- **BR-01:** All prices are in KES. Tax wording on the site waits for the accountant's confirmation (§8); until then the site makes no tax claims.
- **BR-02:** Money is stored as integer minor units. Prices, delivery fees and fixed discounts are whole shillings (M-Pesa accepts whole shillings only). Percentage discounts are rounded to the nearest whole shilling, half up.
- **BR-03:** The server computes every price, discount, fee and total. Values sent by the client are ignored. If the client's `expectedTotal` differs from the server total, the order is rejected with `PRICE_CHANGED` and the new quote, so the customer is never surprised.
- **BR-04:** Each order item records a snapshot: product name, variant name, SKU, unit, unit price and image as they were when the order was placed.

**Units & quantities**
- **BR-05:** Each variant has exactly one sale unit: tray, crate, dozen, piece, chick, bird, bag, kg, litre or pack. Quantities are whole numbers.
- **BR-06:** A quantity must be at least the minimum order quantity (MOQ). Above that it must go up in steps: (quantity − MOQ) must be divisible by the step. It must not exceed the per-order maximum, if one is set, or the available stock, if stock is tracked.
- **BR-07:** Live birds are sold per bird in weight bands. There are no price adjustments after weighing **[Assumption]**.

**Stock**
- **BR-08:** Stock is reserved (decremented) when an order is placed and released when it is cancelled or expires.
- **BR-09:** Unpaid M-Pesa orders expire after `unpaid_order_hold_minutes` (default 30), unless a payment attempt is still being verified.
- **BR-10:** Pay-later orders hold their stock until staff confirm or cancel them.
- **BR-11:** Stock can never go negative (database constraint). Every change is recorded in the movement ledger with a reason, the person who made it and the resulting balance.
- **BR-12:** Mortality and damage are recorded as their own movement reasons, never as silent corrections.

**Delivery**
- **BR-13:** Delivery is offered only to active, configured areas. The fee comes from the area's zone. It is free above the zone's threshold, if one is set. A zone may have a minimum order value.
- **BR-14:** An order containing a pick-up-only product cannot use delivery.
- **BR-15:** Unlisted locations get pick-up or a WhatsApp enquiry, never an implied fee.
- **BR-16:** The delivery time shown comes from the zone's configuration. Nothing beyond that is promised.

**Payments**
- **BR-17:** Payment methods are switched on and off in settings. Pay on delivery requires delivery; pay on collection requires pick-up. Pay on delivery has a configurable maximum order value.
- **BR-18:** An order becomes paid only through (a) a verified M-Pesa result (callback + STK Query) or (b) a staff-recorded payment with a reference. A signal from the browser never counts.
- **BR-19:** An order can have only one in-progress STK attempt at a time. The amount is the order total at the moment the attempt starts.
- **BR-20:** An M-Pesa receipt or transaction code can be used only once across the whole system.
- **BR-21:** A successful payment on a cancelled or expired order, or a duplicate payment, is flagged for admin review (reinstate or refund). It is never dropped silently.
- **BR-22:** Only admins can record refunds. A reason and reference are required, and total refunds cannot exceed the amount paid.
- **BR-23:** Mock and sandbox payments are tagged with their environment and excluded from revenue. Mock mode refuses to run when `APP_ENV=production`.

**Orders**
- **BR-24:** Status changes follow the state machine in [DATABASE §5](DATABASE.md#5-order-lifecycle), are enforced on the server, and record who made the change and when.
- **BR-25:** Customers can cancel only orders that are still *pending*.
- **BR-26:** An order can be marked *completed* only after payment has been recorded.
- **BR-27:** Order numbers are `PH` followed by at least 6 digits, sequential, and no longer than 12 characters, which fits the M-Pesa *AccountReference* field.
- **BR-28:** A guest order can be viewed only with its secret link. The order-number-plus-phone lookup shows status only.
- **BR-29:** A phone number can have at most `max_open_unpaid_orders_per_phone` open unpaid orders (default 3).

**Promotions**
- **BR-30:** A promo code works only while it is active, within its dates, within its usage limit and above its minimum subtotal. One code per order. A discount never exceeds the subtotal and is not applied to the delivery fee.

**Content & accounts**
- **BR-31:** Statistics, testimonials, certifications and farming claims appear only after an admin has entered them. A testimonial cannot be published unless consent has been recorded.
- **BR-32:** Policy pages show a "last reviewed" date. Drafts are never public.
- **BR-33:** Only admins can assign roles, through an audited function. No one can assign a role to themselves, and the last admin cannot be removed.
- **BR-34:** Admin and staff actions require MFA (`aal2`), if approved (D-later / ADM-18).

## 6. Non-functional requirements

| ID | Requirement |
|---|---|
| **NFR-PERF-1** | Public pages (Home, Shop, Category, Product, Blog): LCP ≤ 2.5 s at p75 on a mid-range Android phone over 4G. In lab tests, a Lighthouse mobile Performance score of at least 85, aiming for 90 |
| **NFR-PERF-2** | CLS ≤ 0.05 and INP ≤ 200 ms |
| **NFR-PERF-3** | Public routes load ≤ 170 KB of JavaScript (gzipped) initially. Admin, chart and table code never loads on public routes |
| **NFR-PERF-4** | Images use responsive `srcset` and lazy-load below the fold. The hero is ≤ 150 KB at 1280 px; card images ≤ 40 KB at 480 px |
| **NFR-PERF-5** | Catalogue queries take ≤ 300 ms on the server at p95 for up to 500 products. Public data is cached (pre-rendered on the CDN, plus query caching) |
| **NFR-REL-1** | Placing an order is safe to retry (idempotency key), so a dropped network never creates a duplicate order |
| **NFR-REL-2** | Payment status can be recovered after the browser closes. A lost callback is reconciled within 5 minutes |
| **NFR-REL-3** | If Supabase is unreachable, pre-rendered pages still display and offer WhatsApp and phone ordering |
| **NFR-REL-4** | Daily backups (Supabase Pro), and a restore drill completed before launch |
| **NFR-SEC-1** | RLS is enabled on every table in exposed schemas, verified by an automated test. No table is ever created without policies in the same migration |
| **NFR-SEC-2** | No privileged secret appears in client code or in `VITE_` variables. CI scans the build output |
| **NFR-SEC-3** | Privileged operations run only through `SECURITY DEFINER` functions (fixed `search_path`, explicit grants) or Edge Functions that verify the caller |
| **NFR-SEC-4** | Supabase Auth enforces password rules: at least 8 characters, with leaked-password protection where the plan supports it. Admins and staff use MFA (ADM-18). Sign-up, sign-in and reset have captchas |
| **NFR-SEC-5** | Security headers and a CSP on the static host. Content is rendered from Markdown with **no raw HTML** |
| **NFR-SEC-6** | Abuse controls: Turnstile on guest checkout, contact, order lookup and auth; a cap on open orders per phone; stock-hold expiry |
| **NFR-SEC-7** | Append-only audit logs for privileged actions |
| **NFR-SEC-8** | Dependency audit and secret scanning in CI |
| **NFR-PRIV-1** | Collect only what is needed: name, phone, optional email, delivery details |
| **NFR-PRIV-2** | Retention schedule enforced by a daily job ([DATABASE §12](DATABASE.md#12-deletion-archival--retention)) |
| **NFR-PRIV-3** | Requests to access, correct or delete personal data are handled through a documented admin procedure |
| **NFR-PRIV-4** | Phone numbers are masked in logs. No payment credentials are ever stored (no PINs, no card data) |
| **NFR-PRIV-5** | The privacy notice discloses that data is hosted outside Kenya (Supabase region) and the safeguards used |
| **NFR-A11Y-1** | WCAG 2.2 AA |
| **NFR-A11Y-2** | Fully keyboard operable, with visible focus. Targets are at least 24 px, and primary actions at least 44 px |
| **NFR-A11Y-3** | `prefers-reduced-motion` is respected. No content is hidden behind animations |
| **NFR-COMP-1** | Latest 2 versions of Chrome, Edge, Firefox and Safari; Chrome and Samsung Internet on Android 10+; iOS Safari 16+ |
| **NFR-COMP-2** | Minimum width 360 px with no horizontal scrolling |
| **NFR-COMP-3** | Pre-rendered pages are readable without JavaScript (e.g., proxy browsers). Cart and checkout require JavaScript and say so |
| **NFR-MAINT-1** | TypeScript strict mode. Lint and format are clean. Any `any` must be justified |
| **NFR-MAINT-2** | Database changes go through migrations only. Generated types are committed |
| **NFR-MAINT-3** | Business rules are referenced by ID in code and tests. Docs are updated in the same change |
| **NFR-SEO-1** | Unique titles and descriptions, canonical URLs, Open Graph, sitemap, robots and structured data. **Nothing fabricated** (no fake ratings, reviews or prices) |
| **NFR-OBS-1** | Edge Functions write structured logs with an execution ID. Payment events are stored. Admin "needs attention" queues surface problems |
| **NFR-COST-1** | Production baseline: Supabase Pro (from $25/month) + domain + free tiers (Cloudflare, Turnstile, an email provider's free tier). No paid SMS or WhatsApp API by default |

## 7. Kenyan market requirements

| ID | Requirement |
|---|---|
| KM-1 | KES only, displayed as `KSh 1,250` (no decimals for whole amounts), with the unit: `KSh 520 / tray` |
| KM-2 | Accept `0712 345 678`, `0112 345 678`, `+254 712 345 678`, `254712345678` and `712345678`, with or without spaces or dashes. Store as E.164 (`+254712345678`). The M-Pesa number can differ from the contact number. Network prefixes are **not** used to block numbers, because numbers can be ported between networks |
| KM-3 | Address model: county (all 47) → configured delivery area → estate, street or building → landmark and directions (how Kenyans actually describe locations) |
| KM-4 | M-Pesa STK Push is the main online payment once configured. Copy is familiar ("Pay with M-Pesa", "Enter your M-Pesa PIN on your phone"), anti-fraud messaging is visible, and Paybill instructions are the fallback |
| KM-5 | Pay on delivery and pay on collection, each configurable |
| KM-6 | WhatsApp help wherever it adds value (product enquiries, order help, wholesale), without covering checkout actions |
| KM-7 | Data-light pages (NFR-PERF), a cart that survives going offline, click-to-load maps, no autoplaying video |
| KM-8 | Familiar units: tray of 30 eggs, per chick, per bird, 70/50/10 kg bags (as configured) |
| KM-9 | Swahili search synonyms (CAT-12) |
| KM-10 | Wholesale and repeat buyers: quote requests, a bulk-enquiry prompt when a quantity crosses a threshold, "Order again" |
| KM-11 | Business hours and a holiday notice via the announcement bar |
| KM-12 | Times in EAT (`Africa/Nairobi`, UTC+3, no daylight saving). Dates shown as `13 Oct 2026` |

## 8. Compliance considerations (for professional review)

> These are **not legal or tax advice**. They are items the business should confirm with a Kenyan advocate and an accountant before launch. The software is designed so it can meet the likely requirements.

1. **Data Protection Act, 2019 and its regulations.** Lawful basis and privacy notice; rights to access, correct and delete data; retention; security safeguards. Data breaches must be reported to the ODPC within **72 hours**. Supabase hosts data **outside Kenya**, which triggers cross-border transfer conditions. Check whether the business must **register with the ODPC** (thresholds and sector rules in the Registration Regulations, 2021).
2. **Direct marketing.** Consent and opt-out are needed before any newsletter, SMS or WhatsApp marketing. This is why marketing consent is a separate, explicit field.
3. **Consumer Protection Act, 2012.** Accurate descriptions and prices, disclosure of terms for online sales, cancellation and refund obligations. These shape the Terms and the Delivery & Returns pages.
4. **Tax.** The VAT status of each product category; **KRA eTIMS** e-invoicing obligations; how long records must be kept (often 5 years). Retention is planned to match.
5. **Animal health & food safety.**
   - **Live birds:** veterinary movement permits for live birds, and rules on chick supply and hatcheries.
   - **Excluded until confirmed:**
     - **Veterinary medicines:** require Veterinary Medicines Directorate licensing.
     - **Dressed poultry:** requires licensed slaughter, cold chain and public-health licensing.
   - **Eggs:** egg handling and labelling standards where they apply.
6. **Marketing claims.** Terms like "organic", "free-range", "antibiotic-free", "hormone-free" and certifications are used only with evidence. The reference design's "No added hormones" is **not** copied.
7. **Payment brands.** "M-Pesa" appears as text. Logos are used only within Safaricom's brand guidelines.
8. **Cookies and storage.** Only strictly necessary storage (cart, session). Any analytics must be cookieless or consented.

## 9. Assumptions

| ID | Assumption | Impact if wrong | Status |
|---|---|---|---|
| A-01 | One business (single seller), possibly with several pick-up points | Marketplace would need vendor scoping across the schema | Given |
| A-02 | Trading name is "PoultryHub Kenya" (from the repo name) | Branding, domain and SEO copy | Working default (D2); name and logo still to confirm |
| A-03 | English only at launch | Swahili localisation later | To confirm |
| A-04 | Prices are whole shillings | Integer-shilling constraint would need relaxing | To confirm |
| A-05 | Launch range: eggs, chicks, live birds, POL pullets, feeds and equipment; no dressed meat or veterinary products | Categories, regulations | Adopted (D3) |
| A-06 | Live birds sold per bird in weight bands | Weighed pricing would need a final-weight adjustment flow | To confirm |
| A-07 | Chicks sold from batches with "available from" dates (batch capacity = stock) | A booking-with-deposit flow would be extra scope | Adopted default (D3); chick sales model still to confirm |
| A-08 | Guest checkout allowed | Checkout and RLS design | Adopted (D4) |
| A-09 | Payment methods: M-Pesa STK (after go-live), pay on delivery, pay on collection, manual Paybill | Checkout options and settings | Adopted (D5); Paybill/Till details pending |
| A-10 | Delivery uses zone-based flat fees for configured areas, plus farm pick-up | Weight- or distance-based fees would need a new rule type | To confirm |
| A-11 | 30-minute stock hold for unpaid M-Pesa orders; pay-later orders confirmed by staff by phone or WhatsApp | Stock availability, abuse risk | To confirm |
| A-12 | Roles: `admin` (owner/manager) and `staff` (operations) | Permission matrix | To confirm |
| A-13 | Email receipts via a transactional provider; SMS later | Notification scope and cost | To confirm |
| A-14 | Static hosting on a CDN, with Supabase Pro in production | Running cost (≈ $25+/month) | To confirm |
| A-15 | Real photos will be supplied before launch; licensed illustrative images are used until then | Trust and conversion | To confirm |
| A-16 | No statistics, testimonials or certifications until supplied and verified | Home trust sections stay minimal | Policy |
| A-17 | Timezone `Africa/Nairobi`; timestamps stored in UTC | Reports by day | Given |
| A-18 | Catalogue stays under 500 variants in the first year | Query and index design | Likely |
| A-19 | Policy pages are drafted from templates and reviewed by an advocate before launch | Legal exposure | To confirm |
| A-20 | The business can provide at least two admin users | Lock-out risk (R13) | To confirm |

## 10. Information needed from the business

Placeholders are used until each item arrives. **Bold** items block launch.

1. **Trading or legal name, logo, any existing brand colours** (D2)
2. **Location** (county and town; map pin) and whether farm visits or pick-ups are allowed
3. **Phone, WhatsApp number, email, business hours**, real social media links
4. **Products:** names, descriptions, units, variants (sizes or weight bands), prices, minimum orders and steps, approach to stock, photos
5. **Delivery:** areas served, fees, delivery days and cut-off times, pick-up points and their hours
6. **Payment methods; Paybill or Till number; Daraja go-live** (D5)
7. Farming practices you are comfortable publishing (housing system, feeds, vaccination programme, biosecurity), stated accurately
8. Statistics (years operating, flock size, daily egg output), only if they are real
9. Testimonials with written consent (name, descriptor, photo consent)
10. **Policies:** returns and refunds (broken eggs on delivery? chicks dead on arrival?), cancellations, delivery terms
11. **Who the admin and staff users are** (at least 2 admins)

## 11. Glossary

| Term | Meaning |
|---|---|
| **MOQ** | Minimum order quantity (e.g., 50 chicks) |
| **Step** | Quantity increment above the MOQ (e.g., chicks in tens) |
| **Variant** | A sellable option of a product: pack size or weight band, each with its own price, unit and stock |
| **POL** | Point-of-lay pullets: young hens about to start laying |
| **Kienyeji** | Indigenous or improved-indigenous chicken breeds and their eggs |
| **Pick-up / collection** | The customer collects the order. The UI says "Pick-up"; code and data say `collection` |
| **STK Push** | M-Pesa Express: a payment prompt sent to the customer's phone, which they confirm with their PIN |
| **Paybill / Till** | Safaricom business numbers for receiving M-Pesa payments (Paybill uses an account number; Till is "Buy Goods") |
| **Daraja** | Safaricom's M-Pesa developer API platform |
| **RLS** | Row Level Security: Postgres policies deciding which rows each user can read or write |
| **aal2** | Supabase "authenticator assurance level 2": the session has passed multi-factor authentication |
| **EAT** | East Africa Time (UTC+3) |
| **ODPC** | Office of the Data Protection Commissioner (Kenya) |
