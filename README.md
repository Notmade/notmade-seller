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

## Backend gaps

The panel works on the backend as it is. Features that need a route it does not serve are off, and `NEXT_PUBLIC_SELLER_FEATURES` (comma-separated, read at build time) turns them on. See `app/lib/features.ts`.

| Feature | Panel calls | Backend today | While off |
|---|---|---|---|
| `quick_stock` | `POST /seller/products/:id/stock` | Not served. The backend has `PATCH /seller/inventory` instead | Inventory is read-only, stock is changed in Catalogue |
| `low_stock_setting` | `POST /seller/settings` | Not served. The backend has `PUT /seller/inventory/threshold` instead | Alert level is kept in the browser |
| `tracking` | `POST /seller/orders/:ref/tracking` | Not served. The backend has `POST /seller/orders/:ref/ship` with `{courier, tracking_id}` instead | No tracking button |
| `drafts` | `POST /seller/products/drafts` | Not served | No draft button or filter |
| `store_analytics` | `GET /seller/analytics` for `{product_views, orders}` | Served with a different shape and no store views | Store conversion says Coming soon |
| `sku` | `sku` on product forms | Not stored | No SKU field or column |

Turning on `quick_stock`, `low_stock_setting`, `tracking` or `store_analytics` needs the client in `app/lib/seller-api.ts` moved to the backend's route first.
