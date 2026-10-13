# PoultryHub Kenya

An online shop and admin dashboard for a Kenyan poultry business. It sells eggs, chicks, live birds and farm supplies, takes M-Pesa payments, offers delivery or pick-up, and lets customers track their orders.

> **Status (13 Oct 2026):** Phase 1 (foundation & design system) is **complete**. The app runs on sample data, with every route scaffolded and the design system in place. Phase 2 (the full customer-facing frontend) is next.

## What it will do

**For customers**

- Browse eggs, day-old chicks, live birds, point-of-lay pullets, feeds and equipment. Every price is in KSh with its unit (per tray, per chick, per bag) and any minimum order.
- Search, filter and sort, on fast pages built for phones and mobile data.
- Keep a cart that survives refreshes and dropped connections.
- Check out as a guest or with an account, and choose delivery to a served area or pick-up at the farm.
- Pay with M-Pesa (STK Push), on delivery or on pick-up.
- Track orders through a private link or an account, and get help on WhatsApp at any point.

**For the business**

- A secure admin dashboard covering:
  - **Catalogue:** products and photos, stock (including mortality and breakage), promotions.
  - **Sales:** orders, payments, customers, delivery zones.
  - **Content:** website content and the blog.
  - **Administration:** reports, staff roles, and an audit log of sensitive changes.

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 0 | Discovery & planning | ✅ Approved 2026-10-13 |
| 1 | Foundation & design system | ✅ Complete 2026-10-13 |
| 2 | Customer-facing frontend on mock data (approval gate) | Next |
| 3 | Supabase backend & authentication | Planned |
| 4 | Orders, inventory, checkout & M-Pesa payments | Planned |
| 5 | Admin dashboard | Planned |
| 6 | Integration, security & testing | Planned |
| 7 | Deployment & handover | Planned |

[PLAN.md](PLAN.md) has the goals and exit criteria for each phase. [TASKS.md](TASKS.md) tracks progress task by task.

## Tech stack

| Area | Choice |
|---|---|
| App | Vite 8, React 19, React Router 8 (framework mode; public pages pre-rendered at build time), TypeScript 6 |
| UI | Tailwind CSS 4, shadcn/ui on Radix, Lucide icons, Motion |
| Data & forms | TanStack Query, React Hook Form + Zod, Zustand (cart) |
| Backend | Supabase: Postgres with Row Level Security, Auth, Storage, Edge Functions, pg_cron |
| Payments | Safaricom Daraja (M-Pesa STK Push), plus pay on delivery or pick-up |
| Quality | Vitest, Testing Library, Playwright + axe, pgTAP, ESLint, Prettier |
| Tooling | pnpm, GitHub Actions |

Exact versions, and why each was chosen: [ARCHITECTURE.md §3](ARCHITECTURE.md#3-technology-stack).

## Documentation

| Document | Contents |
|---|---|
| [PLAN.md](PLAN.md) | Phases, exit criteria, risks, dependencies, decision record |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Functional and non-functional requirements, business rules, assumptions |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack and versions, rendering strategy, project structure, routes, security, decision records |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Colours (with measured contrast), typography, components, motion, accessibility |
| [DATABASE.md](DATABASE.md) | Schema, ER diagram, order and payment lifecycles, inventory integrity, access rules |
| [API_AND_INTEGRATIONS.md](API_AND_INTEGRATIONS.md) | Supabase usage, Edge Functions, M-Pesa Daraja, Turnstile, email, hosting |
| [TASKS.md](TASKS.md) | Task checklist by phase |
| [TESTING.md](TESTING.md) | Test strategy, acceptance criteria, CI gates |
| [.env.example](.env.example) | Every environment variable name, with no secrets |

## Getting started

**Prerequisites**

- **Node.js 24 LTS**
- **pnpm 10.28** (run `corepack enable` and the version pinned in `package.json` is used)
- **Docker Desktop**, for the local Supabase stack (from Phase 3)

**Run it**

```bash
pnpm install
pnpm dev        # http://localhost:5173, using sample data
```

No environment file is needed while the app runs on sample data. When you do need one, copy [.env.example](.env.example) to `.env.local`, and never commit real values.

**Commands**

| Command | What it does |
|---|---|
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Production build: public pages are pre-rendered into `build/client` |
| `pnpm preview` | Serves `build/client` the way the production host will (SPA fallback, caching) on port 4173 |
| `pnpm lint` / `pnpm format` | ESLint / Prettier |
| `pnpm typecheck` | Route type generation + TypeScript |
| `pnpm test` | Unit and component tests (Vitest) |
| `pnpm test:e2e` | End-to-end and accessibility tests (Playwright + axe). First run: `pnpm exec playwright install chromium` |
| `pnpm check:budget` | Fails if any public page's initial JavaScript exceeds 170 KB (gzip). Run after `pnpm build` |
| `pnpm check` | Lint, types, unit tests, build and the bundle budget, in one go |

**Living style guide:** `/dev/design-system` in development and staging builds.

## How we work

- **Branches:** one per phase (`phase/<number>-<name>`), merged into `main` through pull requests.
- **Commits:** conventional messages that reference task IDs, e.g. `feat(cart): enforce quantity rules (P2-07)`.
- **Safety:** no secrets in the repository; database changes only through migrations.
- **Reporting:** every phase ends with a summary separating what was verified from what wasn't.
