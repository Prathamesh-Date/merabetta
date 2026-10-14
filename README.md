# Merabetta Storefront

Merabetta Storefront is a responsive Next.js frontend for a senior-focused healthcare and wellness shopping experience. It includes product browsing, lab-test browsing, a cart and checkout flow, profile screens, notifications, and informational pages.

> **Prototype status:** This repository currently contains demonstration content and local-only interactions. Products, prices, lab packages, orders, payment, authentication, and support actions are not connected to live services.

## Technology

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4 / CSS modules in `app/`

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm run start
```

The production build runs TypeScript validation as part of the Next.js build.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Home page |
| `/products` | Product catalogue and search |
| `/products/[id]` | Product details |
| `/cart` | Cart and demonstration checkout |
| `/labtest` | Lab tests and packages |
| `/profile` | Profile, saved people, orders, policies, and support |
| `/notifications` | Notifications |
| `/about` | About Merabetta |

## Project structure

```text
app/
  components/       Reusable UI and client-side flows
  data/             Demonstration catalogue and lab data
  products/         Product listing and detail routes
  labtest/          Lab-test routes
  *.css             Application styling
public/             Images and visual assets
```

## CMS and backend handoff

This frontend does **not** include a CMS or backend implementation. The CMS developer can begin by replacing the demonstration data in:

- `app/data/catalog.ts` — product categories, products, pricing, and promotions
- `app/data/lab-reference.ts` — laboratories, tests, packages, pricing, and preparation details
- `app/data/lab-flow.ts` — lab page content and user journey data

Before connecting a CMS, agree on API contracts for products, categories, stock, prices, labs, test packages, user accounts, carts, orders, notifications, and media. Keep CMS credentials only in local `.env` files; `.env*` is already excluded from Git. Add a safe `.env.example` when the integration variables are finalized.

The current cart, profile, and order behavior is designed for demonstration only. Replace those local browser interactions with authenticated backend APIs before production use. Do not process real payments, prescriptions, medical results, or personal health data until the required security, privacy, and compliance work is complete.

## Team workflow

1. Create a feature branch from `main`.
2. Run `npm install` after pulling dependency changes.
3. Run `npm run build` before opening a pull request.
4. Keep product and lab data changes separate from UI changes when practical.
5. Review changes through pull requests; do not commit `.next`, `node_modules`, or `.env` files.

## Repository hygiene

- `package-lock.json` is committed so every developer installs the same dependency versions.
- `.gitignore` excludes generated files, logs, dependency folders, and environment files.
- The repository remote is configured on GitHub. Give each team member repository access instead of passing the project as a ZIP whenever possible.

