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

`SELLER_SIGNUP_COUNTRIES` (comma-separated, default `IN`, read at request time) lists the business countries open for new seller sign-ups. It is the same variable the backend reads. Set it on both services to open a country. Without `AE`, `/uae` shows the rate card and an email form, and login and onboarding will not start a UAE account. `NEXT_PUBLIC_SELLER_MARKETS_OPEN` cannot open sign-ups on its own.

## Country pages

Each country has one file: `app/landing/content/in.ts` and `app/landing/content/ae.ts`. Rates, copy, company details and the legal footer live there, and `app/lib/seller-config.ts` re-exports what the rest of the site quotes. Neither file imports the other.

- **Rates:** the page reads `GET /seller/commission-rates`. That public route has one general rate per country and no category lines, so it only sets the `standard` line; every other line comes from the country file.
- **UAE payment methods:** read live from `GET /app/config?store=ae` and never written in a file. A method shows only if the config enables it (`app/lib/landing-data.ts`).
- **The flip:** a cross-document view transition (`app/components/landing/flip.ts`), so neither page carries the other country's content. Browsers without it get a CSS half-flip. Reduced motion and low-end devices get a plain link.

## Tests

`npm test` runs the unit tests. For the browser tests: `npm run build && npm run test:e2e`, which audit every panel page at 360, 390, 768 and 1280px against a fake backend limited to `docs/seller-api.md` in the backend repo.

## Backend gaps

The panel works on the backend as it is. Features that need a route it does not serve are off, and `NEXT_PUBLIC_SELLER_FEATURES` (comma-separated, read at build time) turns them on. See `app/lib/features.ts`.

| Feature | Panel calls | Backend today | While off |
|---|---|---|---|
| `quick_stock` | `POST /seller/products/:id/stock` | Not served. The backend has `PATCH /seller/inventory` instead | Inventory is read-only, stock is changed in Catalogue |
| `low_stock_setting` | `POST /seller/settings` | Not served. The backend has `PUT /seller/inventory/threshold` instead | Alert level is kept in the browser |
| `drafts` | `POST /seller/products/drafts` | Not served | The edit form has no draft button |
| `store_analytics` | `GET /seller/analytics` for `{product_views, orders}` | Served with a different shape and no store views | Store conversion says Coming soon |
| `sku` | `sku` on product forms | Not stored | No SKU field or column |

Turning on `quick_stock`, `low_stock_setting` or `store_analytics` needs the client in `app/lib/seller-api.ts` moved to the backend's route first.

Other gaps the panel works around:

| Gap | Panel today |
|---|---|
| No drafts route | The listing wizard keeps drafts in the browser (IndexedDB), per seller, on that device only |
| No bulk route | Bulk upload checks the CSV in the browser, then sends each good row to `POST /seller/products` one at a time |
| No India bank fields on the seller | The missing-bank banner covers UAE sellers (IBAN) only |
| Orders do not return `tracking_id` | A seller's own tracking shows only if the backend sends it |
| Orders have no street address | The packing slip shows customer name, city and pincode |
