This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load its Google Fonts (Bebas Neue, Archivo, Inter, Space Mono).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

The app is deployed on [Railway](https://railway.com). The database and file storage are on [Supabase](https://supabase.com).

For more on deploying Next.js, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Seller sign-ups

`SELLER_SIGNUP_COUNTRIES` (comma-separated, default `IN`, read at request time) lists the business countries open for new seller sign-ups. It is the same variable the backend reads. Set it on both services to open a country. With `AE`, `/uae` shows the Register to sell button. Without it, `/uae` shows the rate card and an email form, and login and onboarding will not start a UAE account. `NEXT_PUBLIC_SELLER_MARKETS_OPEN` cannot open sign-ups on its own.

Flow: country, email code, country-specific details, documents, then the agreement. The agreement's title, text and rates are the backend's (`GET /seller/agreement`), shown unedited. The UAE details step shows the live rate card from `GET /seller/commission-rates` and never a rate of its own: with no card it shows no number.

A new seller is active as soon as they sign (`onboarding_status: approved`) and goes straight to the dashboard. The review screen stays for the sellers the backend still sends to an admin (`pending_review`). Each product still goes to admin review, and the panel never writes `is_live` or `approval_status`. Payouts stay blocked until bank details are saved: the notice follows `payout_blocked` from `GET /seller/payouts`, and sellers save them under Profile with `PUT /seller/bank-details`.

## Country pages

Each country has one file: `app/landing/content/in.ts` and `app/landing/content/ae.ts`. Rates, copy, company details and the legal footer live there, and `app/lib/seller-config.ts` re-exports what the rest of the site quotes. Neither file imports the other.

- **Rates:** the page reads `GET /seller/commission-rates`. That public route has one general rate per country and no category lines, so it only sets the `standard` line; every other line comes from the country file.
- **UAE payment methods:** read live from `GET /app/config?store=ae` and never written in a file. A method shows only if the config enables it (`app/lib/landing-data.ts`).
- **The flip:** a cross-document view transition (`app/components/landing/flip.ts`), so neither page carries the other country's content. Browsers without it get a CSS half-flip. Reduced motion and low-end devices get a plain link.

## Tests

`npm test` runs the unit tests. For the browser tests: `npm run build && npm run test:e2e`, which audit every panel page at 360, 390, 768 and 1280px against a fake backend limited to `docs/seller-api.md` in the backend repo. `e2e/signup.spec.ts` walks registration in both countries against a stateful fake on a second server with the UAE open. `SHOTS=1` saves its screens to `docs/pr-screenshots`. `E2E_LIVE=1` also renders the public rate card from the live backend, which is the only live call any test makes.

## Backend gaps

The panel works on the backend as it is. Features that need a route it does not serve are off, and `NEXT_PUBLIC_SELLER_FEATURES` (comma-separated, read at build time) turns them on. See `app/lib/features.ts`.

| Feature | Panel calls | Backend today | While off |
|---|---|---|---|
| `store_analytics` | `GET /seller/analytics` for `{product_views, orders}` | Served with a different shape and no store views | Store conversion says Coming soon |
| `sku` | `sku` on product forms | Not stored | No SKU field or column |

Turning on `store_analytics` needs the client in `app/lib/seller-api.ts` moved to the backend's route first.

Always on: Inventory saves stock with `PATCH /seller/inventory` (applied at once, no review) and the alert level with `PUT /seller/inventory/threshold`. Drafts of new products are kept on the device (`app/lib/listing-drafts.ts`); there is no server draft route.

Edits to an approved product (backend migration 080, `docs/product-changes.md` in the backend repo) never take it offline: the panel shows the change as pending, approved or not approved with the reason, and the seller can cancel a pending change. Catalogue > Add photos adds photos to existing products from a sheet or a pasted table; each row waits for approval the same way.

Other gaps the panel works around:

| Gap | Panel today |
|---|---|
| No drafts route | The listing wizard keeps drafts in the browser (IndexedDB), per seller, on that device only |
| No bulk route | Bulk upload checks the CSV in the browser, then sends each good row to `POST /seller/products` one at a time |
| Orders do not return `tracking_id` | A seller's own tracking shows only if the backend sends it |
| Orders have no street address | The packing slip shows customer name, city and pincode |
