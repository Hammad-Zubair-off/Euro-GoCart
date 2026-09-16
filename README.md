<div align="center">
  <h1>Euro GoCart</h1>
  <p>
    A multi-vendor e-commerce platform built with Next.js and Tailwind CSS — customized and maintained by <a href="https://github.com/Hammad-Zubair-off">Hammad Zubair</a>.
  </p>
  <p>
    <a href="https://github.com/Hammad-Zubair-off/Euro-GoCart/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/Hammad-Zubair-off/Euro-GoCart?style=for-the-badge" alt="License"></a>
    <a href="https://github.com/Hammad-Zubair-off/Euro-GoCart/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome"></a>
    <a href="https://github.com/Hammad-Zubair-off/Euro-GoCart/issues"><img src="https://img.shields.io/github/issues/Hammad-Zubair-off/Euro-GoCart?style=for-the-badge" alt="GitHub issues"></a>
  </p>
</div>

---

## About

**Euro GoCart** is a modern multi-vendor marketplace template. Customers can browse and buy products, vendors manage their own stores, and admins oversee the platform — all from one Next.js app.

Based on the open-source [GoCart](https://github.com/GreatStackDev/gocart) project by GreatStackDev, rebranded and adapted for this repository.

---

## Features

- **Multi-vendor architecture** — vendors register, manage products, and sell on one platform
- **Customer storefront** — responsive shop, cart, orders, and product pages
- **Vendor dashboard** — products, orders, and store management
- **Admin panel** — approve stores, manage coupons, and oversee the marketplace

---

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 15 |
| Styling | Tailwind CSS 4 |
| State | Redux Toolkit |
| Icons | Lucide React |
| Charts | Recharts |
| ORM | Prisma |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm (recommended)

### Install

```bash
git clone https://github.com/Hammad-Zubair-off/Euro-GoCart.git
cd Euro-GoCart
npm install
```

### Environment

Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_CURRENCY_SYMBOL = '$'
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful entry points:

- Storefront: `app/(public)/page.jsx`
- Vendor dashboard: `/store`
- Admin panel: `/admin`

---

## Project Structure

```text
app/
  (public)/     # Customer-facing pages
  store/        # Vendor dashboard
  admin/        # Admin panel
components/     # Shared UI
assets/         # Images and dummy data
lib/            # Redux store and slices
prisma/         # Database schema
```

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run Next.js lint |

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT License. See [LICENSE.md](./LICENSE.md).

Original GoCart © GreatStackDev. Euro GoCart adaptations © Hammad Zubair.

---

## Author

**Hammad Zubair** ([@Hammad-Zubair-off](https://github.com/Hammad-Zubair-off))  
Software Engineer — COMSATS University, Lahore
