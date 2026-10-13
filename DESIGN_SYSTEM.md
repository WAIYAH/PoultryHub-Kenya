# Design System: PoultryHub Kenya

> **Version:** 0.1 (Phase 0) · **Date:** 2026-10-13
> **Visual reference:** `Reference image.jpeg` (layer-farm landing page). It is inspiration, not a template (§2).
> **Implementation:** Tailwind CSS 4 `@theme` tokens + shadcn/ui on Radix primitives (§15). Contrast ratios in §3 were **computed** (WCAG 2.x relative luminance), not estimated.

---

## 1. Design principles

1. **Trust before flourish.** Real photos, honest facts, clear prices and units. Anything that can't be verified is left out (BR-31).
2. **Calm, premium, agricultural.** Deep greens and warm creams, generous whitespace, one confident accent (gold) kept for the moments that matter.
3. **Mobile first and data-light.** Every pattern is designed at 360 px first. Images and motion earn their bytes.
4. **Commerce clarity.** Price, unit, availability and next action are always visible together.
5. **Accessible by construction.** Contrast, focus, target sizes and reduced motion are tokens and rules, not afterthoughts.

## 2. Reference analysis

What the reference does well: a strong deep-green / cream / gold palette; pill buttons with arrow icons; rounded "panel" sections; small eyebrow labels above headings; icon-in-tinted-circle feature cards; split image/panel sections; a calm FAQ accordion.

What it lacks or gets wrong for us: no commerce features at all; unverifiable claims (statistics, "hormone-free", "100% natural"); stock-style testimonial avatars; very small, low-contrast body text in places; battery-cage imagery that may not match our actual practice.

| Reference element | Keep | Adapt for PoultryHub | Avoid |
|---|---|---|---|
| Header: logo, 6 links, "Get a Quote" pill | White bar, pill call to action | Add search, account and a **cart with live count**. Sticky, turning to frosted glass on scroll. Mobile: logo, search, cart, menu sheet | Hiding the cart inside the menu on mobile |
| Hero: dark-green rounded panel, eyebrow chips, one highlighted word in gold, hen photo blending into green | Panel, highlighted word, two calls to action, photo blend | A shorter headline, a primary call to action to the shop, and a micro-row of **service facts** (M-Pesa, delivery areas, farm pick-up). On mobile the text comes first and the image is cropped 4:5 | Unverifiable claims in the chips |
| Statistics strip (10+, 50K+, 100%) | Layout and dividers | A **trust strip** fed by admin-entered, verified facts, falling back to service facts | Invented numbers |
| 4 product/service icon cards | Tinted icon circles, card rhythm | **Shop by category** cards with a photo, "From KSh X" (computed from real prices) and a link to the category | Generic "Learn more" everywhere |
| — | — | **New:** featured products grid (commerce) | — |
| Split: worker photo + dark panel | Split composition, leaf motif | An about-the-farm teaser from editable content, using a **real farm photo** | Stock people presented as our staff |
| Fresh-eggs promo: basket, round badge, 4 benefit icons | Composition and badge | Only verifiable benefits (e.g., *collected daily*, *graded by size*, *trays of 30*). Call to action goes to the Eggs category | "No added hormones", "100% natural" unless verified |
| "Why choose us" checklist + photo | Check-circle list | A **How we farm** practices list, editable | Imagery that contradicts our housing system |
| Impact statistics grid | Card style | Shown **only** when verified statistics exist; otherwise hidden | — |
| Testimonials carousel with avatars | Card design | Consented testimonials only; an initials avatar unless there's photo consent; CSS scroll-snap carousel | Fabricated quotes, stock faces |
| FAQ with hen illustration | Accordion style, supporting image | Admin-managed FAQs grouped by topic | — |
| "Partner with us" call-to-action band | Photo-overlay band + benefit list | A **Bulk & wholesale** band → quote form or WhatsApp | — |
| Dark-green footer | Structure | Add shop categories, policies, hours, payment-methods note; real social links only | Placeholder social icons |
| Typography | Bold geometric sans headings | Same feel (Plus Jakarta Sans) with a **16 px minimum body size** | ~11 px grey body copy |

## 3. Colour

### 3.1 Palette tokens

The user-proposed palette is kept as the anchor (forest `#064E3B`, deep green `#022C22`, primary green `#047857`, gold `#FACC15`, cream `#FAF8F1`, text `#17211C`, muted `#647067`). Refinements after studying the reference:

- **Add tints** for the reference's mint-cream sections and icon circles (`forest-50`, `forest-100`).
- **Make `forest-900` the primary button colour on light backgrounds.** The reference uses dark green there, and white on it scores 9.72:1. `forest-700` (`#047857`) becomes the link and focus colour.
- **Add an earth tone** for straw and eggshell accents, and darker text tones where contrast required them.

| Token | Hex | Role |
|---|---|---|
| `forest-950` | `#022C22` | Footer, admin sidebar, deepest backgrounds, primary hover |
| `forest-900` | `#064E3B` | **Primary** buttons on light; dark section panels (hero, about, call-to-action band) |
| `forest-800` | `#065F46` | Eyebrow text, primary pressed state, headings accent |
| `forest-700` | `#047857` | Links, focus ring on light surfaces, selected states |
| `forest-600` | `#059669` | Icons on light (non-text) |
| `forest-300` | `#6EE7B7` | Icons and accents on dark |
| `forest-200` | `#C9DDD0` | Body text on dark panels |
| `forest-100` | `#DDEEE3` | Icon circles, eyebrow pill backgrounds, selected rows |
| `forest-50` | `#EEF5EF` | Alternate section background (mint cream), `muted` |
| `gold-500` | `#EAB308` | Gold pressed |
| `gold-400` | `#FACC15` | **Accent:** primary call to action on dark, highlighted headline word, focus ring on dark |
| `gold-300` | `#FDE047` | Gold hover (on dark) |
| `gold-800` | `#854D0E` | Text on gold-100 badges |
| `gold-100` | `#FEF6C7` | Promo and "Featured" badge backgrounds, highlight panels |
| `cream-100` | `#F4EFE1` | Straw-tinted panels, image placeholders |
| `cream-50` | `#FAF8F1` | **Page background** |
| `white` | `#FFFFFF` | Cards, inputs, header |
| `earth-700` | `#8A4F24` | Rare accent text (eggshell/straw contexts) |
| `earth-100` | `#F3E6D8` | Eggs promo background, warm tints |
| `ink-900` | `#17211C` | **Body and heading text** |
| `ink-700` | `#3A463F` | Secondary text on tinted backgrounds |
| `ink-600` | `#647067` | Muted text (white, cream-50 and forest-50 backgrounds only) |
| `ink-500` | `#6B776F` | Placeholder text |
| `ink-400` | `#8A968D` | Input borders, decorative icons |
| `line` | `#DCE3DC` | Decorative borders and dividers |
| `success-fg` / `success-bg` | `#166534` / `#DCFCE7` | Paid, delivered, in stock |
| `warning-fg` / `warning-bg` | `#92400E` / `#FEF3C7` | Pending, low stock, needs review |
| `danger-fg` / `danger-bg` / `danger` | `#B42318` / `#FEE4E2` / `#B42318` | Errors, cancelled, destructive buttons |
| `info-fg` / `info-bg` | `#1D4ED8` / `#DBEAFE` | Informational notices, dispatched |

Tailwind's default palette is **disabled** (`--color-*: initial`) so only these tokens can be used.

### 3.2 Measured contrast

| Pair | Ratio | Use | Result |
|---|---|---|---|
| ink-900 on white / cream-50 | 16.53 / 15.55 | Body text | AAA |
| ink-600 on white / cream-50 / forest-50 | 5.18 / 4.87 / 4.67 | Muted text | AA |
| **ink-600 on forest-100** | **4.29** | — | **Fails. Use ink-700 (13.7) instead** |
| ink-600 on cream-100 | 4.51 | — | Borderline. Prefer ink-700 |
| forest-700 on white / cream-50 | 5.48 / 5.16 | Links | AA |
| forest-800 on forest-100 | 6.37 | Eyebrow pill text | AA |
| white on forest-900 / forest-950 / forest-700 | 9.72 / 15.15 / 5.48 | Primary button / dark sections | AA–AAA |
| forest-200 on forest-900 / forest-950 | 6.82 / 10.63 | Body text on dark | AA |
| gold-400 on forest-900 / forest-950 | 6.35 / 9.89 | Highlighted word on dark | AA |
| ink-900 on gold-400 / gold-300 | 10.79 / 12.54 | Gold button label | AAA |
| **gold-400 on white** | **1.53** | — | **Never use gold as text or icons on light** |
| gold-800 on gold-100 | 6.27 | Featured / promo badge | AA |
| success / warning / danger / info fg on bg | 6.49 / 6.37 / 5.45 / 5.49 | Status badges | AA |
| white on danger | 6.57 | Destructive button | AA |
| ink-500 on white | 4.67 | Placeholder | AA |
| ink-400 (input border) vs white | 3.08 | Form control boundary (non-text, ≥ 3:1) | Pass |
| forest-600 icon vs white | 3.77 | Meaningful icons (≥ 3:1) | Pass |
| forest-700 focus ring vs white; gold-400 ring vs forest-900 | 5.48; 6.35 | Focus indicators | Pass |
| line `#DCE3DC` vs white | 1.31 | **Decorative only.** Never the sole boundary of a control | — |

### 3.3 Usage rules

- **Light surfaces** (white, cream-50, forest-50): text ink-900 or ink-600; primary action forest-900; links forest-700.
- **Dark surfaces** (forest-900, forest-950): text white or forest-200; primary action gold-400 with ink-900 label; secondary action outlined in `white/40`.
- **Gold is rare.** At most one gold call to action per viewport, plus the highlighted headline word. Never a large background except small badges (gold-100).
- **Status colour is never the only signal.** Badges always include a text label and, where helpful, an icon.

## 4. Typography

- **Family:** *Plus Jakarta Sans Variable* (self-hosted via `@fontsource-variable/plus-jakarta-sans`, Latin subset) for everything. It is close to the reference's geometric sans, friendly but premium, and highly legible at small sizes. Fallback: `ui-sans-serif, system-ui, sans-serif`.
- **Numerals:** `font-variant-numeric: tabular-nums` for prices, quantities and tables.

| Token | Use | Size (mobile → desktop) | Line height | Weight | Tracking |
|---|---|---|---|---|---|
| `display` | Hero H1 | `clamp(2.25rem, 1.6rem + 3.2vw, 3.5rem)` 36 → 56 px | 1.08 | 800 | −0.025em |
| `h1` | Page titles | `clamp(2rem, 1.6rem + 2vw, 2.75rem)` 32 → 44 px | 1.12 | 700 | −0.02em |
| `h2` | Section titles | `clamp(1.625rem, 1.35rem + 1.4vw, 2.25rem)` 26 → 36 px | 1.18 | 700 | −0.015em |
| `h3` | Card and sub-section titles | 18 → 20 px | 1.3 | 650 | −0.01em |
| `h4` | Small headings, table titles | 16 px | 1.4 | 600 | 0 |
| `lead` | Intro paragraphs | 18 px | 1.65 | 400 | 0 |
| `body` | Default | **16 px** | 1.6 | 400 | 0 |
| `small` | Meta, helper text | 14 px | 1.5 | 400–500 | 0 |
| `eyebrow` | Section eyebrows, badges | 13 px | 1.2 | 600 | 0.01em |
| `price` | Prices | 20 → 24 px (cards 18 px) | 1.2 | 700 | tabular |

**Rules**

- One `h1` per page; headings follow document order.
- Paragraph measure is 45–75 characters (`max-w-prose`).
- Headlines are short: about 8–10 words in the hero.
- Sentence case everywhere (no ALL-CAPS headings). Eyebrows are sentence case, as in the reference.

## 5. Layout & spacing

- **Spacing:** 4 px base (Tailwind scale). Common steps: 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- **Container:** `max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8` (a **16 px gutter on phones**).
- **Section rhythm:** `py-14 sm:py-20 lg:py-24`. Backgrounds alternate white → forest-50 → white, with dark panels as focal breaks (at most 3 dark sections on the home page).
- **Breakpoints:** Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Designs are checked at **360, 390, 768, 1024, 1280 and 1440 px**.
- **Grids:**

  | Grid | Columns |
  |---|---|
  | Products | 2 (≥ 360) → 3 (`md`) → 4 (`xl`) |
  | Categories | 2 → 4 |
  | Blog | 1 → 2 → 3 |
  | Admin KPIs | 2 → 4 |

- **No horizontal page scrolling at 360 px.** Wide tables scroll inside their own container or switch to card lists.

## 6. Shape & depth

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 8 px | Badges (non-pill), small chips, table cells |
| `--radius-md` | 12 px | Inputs, selects, small cards, dropdowns |
| `--radius-lg` | 16 px | Cards, dialogs, product images |
| `--radius-xl` | 24 px | Section panels (hero, about, call-to-action band), large media |
| `--radius-full` | 9999 px | Buttons (pill), icon circles, avatars, eyebrow pills |

| Shadow | Value | Use |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgb(2 44 34 / 0.05)` | Inputs, small chips |
| `--shadow-card` | `0 1px 2px rgb(2 44 34 / 0.04), 0 8px 24px -12px rgb(2 44 34 / 0.14)` | Cards at rest |
| `--shadow-raised` | `0 2px 4px rgb(2 44 34 / 0.05), 0 18px 40px -16px rgb(2 44 34 / 0.24)` | Card hover, sticky bars |
| `--shadow-overlay` | `0 24px 64px -24px rgb(2 44 34 / 0.35)` | Drawers, dialogs, menus |

**Glass (used sparingly, at most 2 surfaces per page)**

- **Header after scrolling:** `bg-white/80 backdrop-blur-md border-b border-white/60`.
- **Floating chip over the hero photo:** `bg-forest-950/55 backdrop-blur-sm`, with white text.
- **Fallback:** solid backgrounds when `backdrop-filter` is unsupported or `prefers-reduced-transparency: reduce`.
- **Contrast:** text on glass must still meet 4.5:1 against the *worst-case* image area. Otherwise add a scrim.

**Soft depth (neumorphic hints).** Only on tactile controls: the quantity stepper, segmented controls and selected radio cards get `inset 0 1px 0 rgb(255 255 255 / 0.6)` plus `--shadow-xs`. Never on primary buttons; they need unambiguous affordance.

**Backgrounds.** Subtle layered radial gradients (forest-50 → transparent) and a faint leaf or egg motif at 4–6 % opacity in hero and call-to-action panels. No busy patterns behind text.

## 7. Iconography

- **Library:** **Lucide** at `strokeWidth={1.75}`. Sizes 16 (inline), 20 (buttons, inputs), 24 (feature icons).
- **Icon circles:** 40 or 48 px, `bg-forest-100`, icon `forest-800`. On dark: `bg-white/10`, icon `forest-300`.
- **Brand icons:** WhatsApp, Facebook, Instagram, TikTok, YouTube and X are **local SVGs** (Lucide has no brand icons), used within each brand's guidelines. M-Pesa is referred to by **text**, not logo, unless Safaricom's guidelines are followed.
- **Decorative vs meaningful:** decorative icons get `aria-hidden="true"`. Icon-only buttons get an `aria-label`.

## 8. Imagery & photography

- **Direction**
  - **Lighting and subjects:** warm natural light; real birds, eggs and people on **our** farm; clean handling and hygiene visible; Kenyan context (trays of 30, local packaging, landscapes).
  - **Accuracy:** images must match the actual housing system (no cages unless that's the practice).
  - **Excluded:** AI-generated images depicting "our farm".
- **Aspect ratios:**

  | Image | Ratio |
  |---|---|
  | Hero | 4:5 on mobile, 16:10 inside the desktop panel |
  | Product | **1:1** |
  | Category | 4:3 |
  | Blog cover | 16:9 |
  | Open Graph | 1200×630 |

- **Delivery:**
  - **Products:** uploaded at ≥ 1600 px, then resized **in the browser** to 480 / 960 / 1600 px WebP (JPEG fallback when WebP encoding isn't supported) and served with `srcset`.
  - **Hero:** 640 / 960 / 1440 / 1920 px in AVIF + WebP.
  - **Layout:** every `<img>` has `width`/`height` (or an aspect-ratio box) to prevent layout shift.
- **Alt text:**
  - **Product images:** what's in the photo, specifically, e.g., *"Tray of 30 brown eggs, large grade"*.
  - **Decorative images:** `alt=""`.
  - **Admin:** the image uploader **requires** alt text.
- **Licensing:** development images come only from sources whose licence allows commercial use (e.g., Unsplash, Pexels). Each is recorded in `public/images/CREDITS.md` (source URL, author, licence) and labelled *illustrative* until replaced with real photos (A-15).
- **Missing image:** a cream-100 tile with a subtle egg/hen glyph and the product name. Never a broken image icon.

## 9. Components

Built on shadcn/ui (Radix). All interactive components have hover, active, **focus-visible**, disabled and loading states.

### 9.1 Core

| Component | Variants / notes |
|---|---|
| **Button** | `primary` (forest-900, white) · `accent` (gold-400, ink-900; for dark surfaces and the single hero call to action) · `secondary` (outline forest-900) · `outline-inverse` (on dark, `white/40` border) · `ghost` · `link` (with trailing arrow) · `destructive` (danger). Sizes `sm` 36 px, `md` 44 px, `lg` 52 px, `icon` 44 px. Active `scale(0.98)`. Loading shows a spinner, sets `aria-busy` and keeps its width |
| **Input / Textarea / Select / Checkbox / RadioGroup / Switch** | 44 px minimum height; ink-400 border; forest-700 focus ring; error state with danger border and message linked by `aria-describedby` |
| **FormField** | Label + control + hint + error. Required marked in text ("required"), not only by `*` |
| **RadioCard** | For fulfilment and payment choices: big tap target, icon, title, description, price note |
| **Dialog / AlertDialog / Sheet / Popover / DropdownMenu / Tooltip / Tabs / Accordion** | Radix behaviour (focus trap, escape, return focus). Tooltips never carry essential information (they don't exist on touch screens) |
| **Badge** | `neutral`, `success`, `warning`, `danger`, `info`, `featured` (gold-100 / gold-800), `outline` |
| **Toast** (sonner) | Bottom-centre on mobile, bottom-right on desktop. Polite live region. Never the only place a critical error appears |
| **Skeleton** | Matches final layout dimensions. Static shimmer when reduced motion is on |
| **Breadcrumb, Pagination, Separator, Avatar (initials fallback), ScrollArea, Progress** | — |

### 9.2 Layout & content

| Component | Notes |
|---|---|
| **SiteHeader** | Transparent over the hero on Home only when contrast allows; otherwise white. Sticky with glass after 24 px of scroll |
| **MobileNav** | Left sheet: nav, account, WhatsApp, Call, "Get a quote". Body scroll locked, focus trapped |
| **AnnouncementBar, SiteFooter** | — |
| **Section** | Background variants: white, cream, mint (forest-50), forest (dark) |
| **SectionHeading** | Eyebrow pill + title + lead + optional right-aligned link ("View all products →"), as in the reference |
| **Eyebrow, PageHeader** | — |
| **Hero, TrustStrip, FeatureCard, CategoryCard, SplitFeature** | SplitFeature: image + dark panel |
| **PromoPanel** | Eggs promo with round badge |
| **ChecklistBlock, StatCard, HowToOrderSteps, CTABand** | — |
| **TestimonialCard** + carousel | CSS scroll-snap, previous/next buttons, dots as tabs |
| **FAQAccordion** | — |
| **BlogCard, Prose** | Prose is Markdown typography |
| **MapEmbed** | Click-to-load facade to save data |
| **ContactCard, WhatsAppButton** | WhatsAppButton has floating and inline variants |

### 9.3 Commerce

| Component | Notes |
|---|---|
| **ProductCard** (`default`, `compact`) | 1:1 image, badges top-left, category eyebrow (default only), name (2-line clamp), `PriceDisplay`, availability line, MOQ hint ("Min. 50 chicks"), add button (adds the MOQ). The whole card is a link to the product; the button is a separate control |
| **PriceDisplay** | `KSh 520` + `/ tray`. Optional compare-at price (struck through, with the saving), shown only for a genuine previous price |
| **StockBadge** | In stock · Low stock ("Only 4 left" when allowed) · Out of stock · Pre-order ("Ready from 24 Oct") · Enquire |
| **QuantitySelector** | −/+ buttons (44 px) plus a numeric input. Respects MOQ, step and max; long-press to repeat; announces changes; shows the reason when a limit is hit |
| **VariantPicker** | Pill radio group ("Tray of 30" · "Half tray"), each showing its price |
| **ProductGallery** | Swipe and scroll-snap on mobile, thumbnails on desktop, keyboard arrows, image counter |
| **SpecList, DeliveryInfoCard** | — |
| **CartDrawer, CartLine, CartSummary, PromoCodeField** | CartSummary shows subtotal, discount, delivery and total, with an explicit "calculated at checkout" state |
| **CheckoutSection** | Numbered, collapsible after completion on mobile |
| **AreaSelector** | County select → area select (only configured areas) → "Not listed?" link to pick-up/WhatsApp |
| **FulfilmentOptions, PaymentMethodOptions** | RadioCards |
| **OrderSummary** | Sticky on desktop; collapsible "Show order summary" bar on mobile |
| **MpesaPaymentPanel** | States: `ready` → `sending` → `awaiting PIN` (countdown) → `paid` / `cancelled` / `failed` / `timeout`. Resend, change number, Paybill instructions, anti-fraud note |
| **OrderStatusBadge, OrderTimeline** | — |

### 9.4 Feedback & state

**EmptyState** · **ErrorState** · **OfflineBanner** · **DemoModeBanner** (gold-100, "Demo data, not real prices or stock") · **InlineAlert** · **SuccessPanel** · **ConfirmDialog** (destructive confirmations name the object: "Cancel order PH001234?").

### 9.5 Admin

**AdminSidebar** (forest-950) · **AdminTopbar** · **DataTable** (sort, filter, paginate; becomes a card list below `md`) · **FilterBar** · **KpiCard** · **ChartCard** (recharts, brand palette, text alternative and data table) · **StatusSelect** (offers only valid transitions) · **ImageUploader** (drag and drop, browser resize, progress, reorder, required alt) · **MarkdownEditor** (textarea + preview) · **MoneyInput** (KSh, whole shillings) · **StockAdjustDialog** (reason required) · **AuditTrail**.

Admin density: base 14 px for tables, 16 px for forms; row height 48 px; sticky table headers; primary page actions top-right on desktop, sticky bottom bar on mobile.

## 10. Page patterns

### 10.1 Home page blueprint

Order is mobile-first. Each section maps to the reference where one exists.

1. **Announcement bar** (optional, admin)
2. **Header**
3. **Hero.** Dark panel, eyebrow chips (service facts), headline with one gold word, lead, `accent` "Shop now" + `outline-inverse` "Chat on WhatsApp", hero photo with a gradient blend. *(ref: hero)*
4. **Trust strip.** 4 items: verified stats if entered, else service facts. *(ref: stats strip)*
5. **Shop by category.** 4 cards with "From KSh X". *(ref: products & services cards)*
6. **Featured products.** 4–8 ProductCards plus "View all products →". *(new)*
7. **About the farm.** Real photo + dark panel + "Our story →". *(ref: split section)*
8. **Fresh eggs promotion.** Earth-100 panel, egg photo, round "Farm fresh" badge, verified benefits, "Order eggs". *(ref: eggs section)*
9. **How we farm.** Checklist + photo. *(ref: why choose us)*
10. **How ordering works.** 3 steps (Choose → Pay with M-Pesa or on delivery → Delivered or picked up) + delivery summary and areas link. *(new)*
11. **Testimonials.** Only if published. *(ref: testimonials)*
12. **FAQ.** Home-flagged FAQs + "All FAQs →". *(ref: FAQ)*
13. **Bulk & wholesale band.** Photo overlay, benefits, "Request a quote" + WhatsApp. *(ref: partner band)*
14. **Footer.**

### 10.2 Other key templates

- **Shop / category:**
  - **Top of page:** page header with breadcrumbs and intro, then a filter bar (a sheet on mobile, a sidebar on `lg`), a result count and sort.
  - **Results:** the grid, then pagination. Active filters appear as removable chips.
- **Product:**
  - **Layout:** gallery on the left (desktop) or top (mobile); the buy box (name, price/unit, variant, quantity, add to cart, availability, MOQ, delivery note, WhatsApp enquiry) beside it.
  - **Below:** tabs or sections (Description, Specifications, Delivery & pick-up, FAQs), then related products.
  - **Mobile:** a sticky buy bar.
- **Cart:**
  - **Lines:** image, name, variant, unit price, quantity, line total, remove. Price-change notices inline.
  - **Summary:** subtotal, discount, delivery estimate and total, plus "Checkout".
- **Checkout:** a single column on mobile; two columns on desktop (form plus sticky summary). Placing the order shows a full-screen confirmation step for M-Pesa.
- **Order page:** status header, timeline, payment panel (when pending), items, delivery or pick-up details, help (WhatsApp with the order number), printable receipt.
- **Account:** an overview with recent orders and quick actions; tabs for Orders, Profile, Addresses and Security.
- **Admin:** page header (title, description, primary action) → filter bar → table or cards → detail page with a side panel for metadata and actions.

## 11. States

| State | Pattern | Example copy |
|---|---|---|
| **Loading** | Layout-matched skeletons; spinners only inside buttons | — |
| **Empty (search)** | Illustration glyph, message, actions | "No products match "kienyeji tray". Try another word or clear your filters." **[Clear filters] [Browse all products]** |
| **Empty (cart)** | Glyph + categories | "Your cart is empty. Fresh eggs, chicks and more are a tap away." |
| **Error (load)** | Message + retry + WhatsApp fallback | "We couldn't load products. Check your connection and try again." **[Try again]** · "Or order on WhatsApp" |
| **Error (form)** | Inline per field + summary at top on submit | "Please fix 2 fields: Phone number, Delivery area." |
| **Offline** | Top banner, cart still works | "You're offline. Your cart is saved on this device." |
| **Success (order)** | SuccessPanel with next steps | "Order PH001234 received. Complete payment on your phone to confirm it." |
| **M-Pesa waiting** | Panel with countdown | "Check your phone: enter your M-Pesa PIN to pay **KSh 2,450** to PoultryHub Kenya. We will never ask for your PIN by call or SMS." |
| **Demo mode** | Persistent banner | "Demo mode: sample products and prices. No real orders or payments." |

## 12. Motion system

Motion for React (`motion/react`) through `LazyMotion` + `m` components. CSS handles simple hovers and transitions.

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 120 ms | Hover, press, colour changes |
| `--duration-base` | 200 ms | Toggles, dropdowns, badges |
| `--duration-medium` | 320 ms | Drawers, sheets, accordions, dialogs |
| `--duration-slow` | 560 ms | Hero entrance, section reveals |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | General UI |
| `--ease-out-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances, reveals |
| Spring (cart badge) | `stiffness: 500, damping: 30` | Count bump |

**Patterns**

- **Hero entrance:** **CSS keyframes** (fade + 12 px rise, staggered 80 ms across headline, text and calls to action). They run before hydration, so pre-rendered content animates without waiting for JS.
- **Section reveals:** a `<Reveal>` wrapper using `whileInView` (`once: true`, `amount: 0.2`), applied **only after hydration and only to elements below the fold at that moment**. Anything already visible is never hidden.
- **Product grids:** 40 ms stagger, capped at 8 items. Later items appear immediately.
- **Cart feedback:** badge bump (spring) + toast "Added 2 × Tray of 30 to cart" + a polite live-region announcement. On desktop, an optional 2-second drawer peek. No "fly to cart" effect.
- **Drawers and dialogs:** slide or fade over 320 ms with a backdrop fade. **Accordions:** height via the Radix CSS variable `--radix-accordion-content-height`.
- **Page transitions:** React Router `viewTransition` on links (cross-fade 150 ms, View Transitions API, progressive enhancement). No JS page-transition library.
- **Decorative motion:** a very slow drift (≥ 12 s loops) of hero leaf and egg shapes on desktop only. Never behind text.

**Rules**

1. `<MotionConfig reducedMotion="user">` wraps the app, and CSS animations sit under `@media (prefers-reduced-motion: no-preference)`. With reduced motion, everything is instant except opacity fades ≤ 120 ms.
2. **Animate only `transform` and `opacity`.** Layout-affecting properties are never animated, so animation adds zero CLS.
3. **Never hide content in pre-rendered HTML** (no `initial={{ opacity: 0 }}` on server-rendered content).
4. Motion must never delay or block checkout actions. Buttons respond within 100 ms.

## 13. Accessibility rules

- **Standard:** WCAG 2.2 AA. Tests: axe in Playwright on every template, plus manual keyboard, NVDA and TalkBack checks ([TESTING.md](TESTING.md)).
- **Structure:** a "Skip to content" link; landmarks (`header`, `nav`, `main`, `footer`); `lang="en-KE"`.
- **Focus:** a visible 2 px ring with 2 px offset (forest-700 on light, gold-400 on dark). Never removed without a replacement. After client-side navigation, focus moves to the page `h1` and a route announcer reads the new title.
- **Targets:** at least 44×44 px for primary touch targets and at least 24×24 px everywhere else.
- **Forms:** visible labels (placeholders are not labels); errors in text linked by `aria-describedby`; `aria-invalid`; an error summary that takes focus on submit; `autocomplete` attributes (`name`, `tel`, `email`, `address-level1`/`level2`, `street-address`); `inputmode="tel"` for phone and `inputmode="numeric"` for quantities.
- **Dynamic updates:** live regions for cart changes, payment status and filter result counts.
- **Media:** meaningful alt text (§8). Carousels can be paused and operated by keyboard, with no autoplay.
- **Charts** (admin) have a data-table alternative.

## 14. Content style

- **Voice:** warm, clear and practical, in Kenyan English. Short sentences. No hype, no unverifiable superlatives. Explain what happens next at every step.
- **Terms:** customer-facing "Pick-up" (in code: `collection`); "Delivery"; "Pay with M-Pesa"; "Pay on delivery"; "Order number". Avoid "SKU" and "fulfilment" in customer copy.
- **Formats:**

  | Item | Format |
  |---|---|
  | Currency | `KSh 1,250` (no decimals when whole), `KSh 1,250.50` otherwise. Ranges `KSh 450–520`. Per unit `KSh 520 / tray`. Implemented once in `src/domain/money.ts`. `Intl` en-KE renders "Ksh", so the `KSh` prefix is applied manually |
  | Phone (display) | `0712 345 678`; stored as `+254712345678` |
  | Dates | `13 Oct 2026`, short form `Tue, 13 Oct`; times `2:30 pm` (EAT implied). Admin relative times ("5 min ago") with the exact time in a tooltip or title |
  | Units | "Tray of 30 eggs", "per chick", "70 kg bag", "per bird (2.0–2.5 kg)" |
  | Order numbers | `PH001234`, monospace-styled for easy reading aloud |

- **Swahili:** used where customers naturally use it (e.g., *kienyeji*), always with clear English context.

## 15. Implementation

### 15.1 Tokens (Tailwind CSS 4, sketch for `src/styles/app.css`)

```css
@import "tailwindcss";
@import "@fontsource-variable/plus-jakarta-sans";

@theme {
  --color-*: initial;                       /* disable default palette */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-transparent: transparent;
  --color-current: currentColor;

  --color-forest-50: #eef5ef;  --color-forest-100: #ddeee3; --color-forest-200: #c9ddd0;
  --color-forest-300: #6ee7b7; --color-forest-600: #059669; --color-forest-700: #047857;
  --color-forest-800: #065f46; --color-forest-900: #064e3b; --color-forest-950: #022c22;
  --color-gold-100: #fef6c7;   --color-gold-300: #fde047;   --color-gold-400: #facc15;
  --color-gold-500: #eab308;   --color-gold-800: #854d0e;
  --color-cream-50: #faf8f1;   --color-cream-100: #f4efe1;
  --color-earth-100: #f3e6d8;  --color-earth-700: #8a4f24;
  --color-ink-400: #8a968d;    --color-ink-500: #6b776f;    --color-ink-600: #647067;
  --color-ink-700: #3a463f;    --color-ink-900: #17211c;    --color-line: #dce3dc;
  --color-success-fg: #166534; --color-success-bg: #dcfce7;
  --color-warning-fg: #92400e; --color-warning-bg: #fef3c7;
  --color-danger: #b42318;     --color-danger-bg: #fee4e2;
  --color-info-fg: #1d4ed8;    --color-info-bg: #dbeafe;

  --font-sans: "Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif;

  --radius-sm: 0.5rem; --radius-md: 0.75rem; --radius-lg: 1rem; --radius-xl: 1.5rem;

  --shadow-xs: 0 1px 2px rgb(2 44 34 / 0.05);
  --shadow-card: 0 1px 2px rgb(2 44 34 / 0.04), 0 8px 24px -12px rgb(2 44 34 / 0.14);
  --shadow-raised: 0 2px 4px rgb(2 44 34 / 0.05), 0 18px 40px -16px rgb(2 44 34 / 0.24);
  --shadow-overlay: 0 24px 64px -24px rgb(2 44 34 / 0.35);

  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
}
```

### 15.2 shadcn semantic mapping

```css
:root {
  --background: var(--color-cream-50);   --foreground: var(--color-ink-900);
  --card: var(--color-white);            --card-foreground: var(--color-ink-900);
  --popover: var(--color-white);         --popover-foreground: var(--color-ink-900);
  --primary: var(--color-forest-900);    --primary-foreground: var(--color-white);
  --secondary: var(--color-forest-100);  --secondary-foreground: var(--color-forest-900);
  --accent: var(--color-gold-400);       --accent-foreground: var(--color-ink-900);
  --muted: var(--color-forest-50);       --muted-foreground: var(--color-ink-600);
  --destructive: var(--color-danger);    --destructive-foreground: var(--color-white);
  --border: var(--color-line);           --input: var(--color-ink-400);
  --ring: var(--color-forest-700);       --radius: 0.75rem;
}
/* exposed to utilities via @theme inline { --color-background: var(--background); … } */
```

### 15.3 Locations

| What | Where |
|---|---|
| Tokens and base styles | `src/styles/app.css` |
| Primitives | `src/components/ui/*` (shadcn, themed) |
| Brand and app components | `src/components/shared`, `src/components/layout` |
| Formatters | `src/domain/money.ts`, `src/domain/phone.ts`, `src/domain/units.ts` |
| Living style guide | `/dev/design-system` (development builds only) |

**Theme:** light only at launch. Tokens are semantic, so a dark theme for admin can be added later without touching components.
