# Euro GoCart Backend API

Production-ready REST API for the Euro GoCart multi-vendor e-commerce frontend.

**Stack:** Node.js · Express · Prisma · PostgreSQL (Supabase) · Supabase Auth · Cloudinary · Stripe

Runs as a separate process on port `4000` (default) alongside the Next.js app on port `3000`.

---

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in all values in .env (Supabase Postgres URLs, JWT secret, Cloudinary, Stripe, ADMIN_EMAILS)
npx prisma migrate dev --name init
npm run dev
```

The API will listen on `http://localhost:4000`. Liveness check: `GET /api/health`.

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run migrations (`prisma migrate dev`) |
| `npm run prisma:studio` | Open Prisma Studio |

### Auth

The frontend signs users in with **Supabase Auth**. Authenticated requests must include:

```
Authorization: Bearer <supabase_access_token>
```

The backend verifies the JWT locally (HS256 + `SUPABASE_JWT_SECRET`) and upserts a mirrored `User` row. Admin access is granted when `user.email` is listed in `ADMIN_EMAILS`.

---

## API Reference

Response envelope:

- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "message": "...", "errors"?: [...] }`

List endpoints support `page` (default 1) and `limit` (default 20) and return `{ items, total, page, pages }` inside `data`.

### Public

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/health` | Liveness check, no auth |
| GET | `/api/products` | Query: `search`, `category`, `storeUsername`, `sort` (`newest\|price_asc\|price_desc\|rating`), `page`, `limit`. Only in-stock products from active approved stores |
| GET | `/api/products/:id` | Includes `store` and `rating` (with user name/image) |
| GET | `/api/stores/:username` | Approved + active store profile + in-stock products |

### Auth (`authenticate`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/auth/me` | `{ user, store, isAdmin }` |

### Cart (`authenticate`)

| Method | Path | Body | Notes |
|--------|------|------|-------|
| GET | `/api/cart` | — | `{ cartItems }` map of `{ [productId]: quantity }` |
| POST | `/api/cart/add` | `{ productId, quantity? }` | Increments |
| POST | `/api/cart/decrease` | `{ productId }` | Decrements; removes key at 0 |
| DELETE | `/api/cart/:productId` | — | Removes item |
| DELETE | `/api/cart` | — | Clears cart |

### Addresses (`authenticate`)

| Method | Path | Body |
|--------|------|------|
| GET | `/api/addresses` | — |
| POST | `/api/addresses` | `{ name, email, street, city, state, zip, country, phone }` |
| DELETE | `/api/addresses/:id` | — |

### Coupons

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/coupons/verify` | authenticate | `{ code }` |

### Orders

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/orders/checkout` | authenticate | `{ addressId, paymentMethod: 'COD'\|'STRIPE', couponCode? }`. Multi-vendor: one Order per store. COD returns orders; STRIPE returns `{ url }` Checkout Session |
| GET | `/api/orders` | authenticate | Current user's orders |
| GET | `/api/store/orders` | requireApprovedSeller | This store's orders |
| PATCH | `/api/store/orders/:id/status` | requireApprovedSeller | `{ status: OrderStatus }` |

### Ratings

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/ratings` | authenticate | `{ orderId, productId, rating (1-5), review }` — order must be DELIVERED |

### Seller / Store

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/store/me` | authenticate | Store + status (`none\|pending\|approved\|rejected`) |
| POST | `/api/store` | authenticate | Multipart: `logo` + `name, username, description, email, contact, address` |
| GET | `/api/store/products` | requireApprovedSeller | All products (any stock) |
| POST | `/api/products` | requireApprovedSeller | Multipart: `images` (≤4) + product fields |
| PATCH | `/api/products/:id` | requireApprovedSeller | Partial update; optional new images |
| PATCH | `/api/products/:id/stock` | requireApprovedSeller | Toggle `inStock` |
| DELETE | `/api/products/:id` | requireApprovedSeller | — |
| GET | `/api/store/dashboard` | requireApprovedSeller | `{ totalProducts, totalOrders, totalEarnings, ratings }` |

### Admin (`requireAdmin`)

| Method | Path | Body / Query |
|--------|------|--------------|
| GET | `/api/admin/dashboard` | `{ products, revenue, orders, stores, allOrders }` |
| GET | `/api/admin/stores` | `?status=pending\|approved\|rejected` |
| PATCH | `/api/admin/stores/:id/status` | `{ status: 'approved'\|'rejected' }` |
| PATCH | `/api/admin/stores/:id/toggle-active` | — |
| GET | `/api/admin/coupons` | — |
| POST | `/api/admin/coupons` | `{ code, description, discount, forNewUser, forMember, isPublic, expiresAt }` |
| DELETE | `/api/admin/coupons/:code` | — |

### Webhook

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/webhooks/stripe` | Raw body; verifies `STRIPE_WEBHOOK_SECRET`; on `checkout.session.completed` sets `isPaid: true` for `metadata.orderIds` |

---

## Stripe local testing

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Put the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.
