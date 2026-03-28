# ReWear

ReWear is a PERN monorepo for the EcoThread Marketplace course project. It is a second-hand fashion marketplace with a sustainability engine that scores products, tracks water and carbon impact, and shows circular economy progress on a user dashboard.

## Tech stack

- `client/` - React, Vite, React Router, TanStack Query, Tailwind CSS v4, Lucide React
- `server/` - Node.js, Express, PostgreSQL, JWT auth, bcrypt
- root - npm workspaces and shared scripts

## Implemented features

### Frontend

- Marketplace homepage with earth-tone visual styling and live product feed
- Product cards with real eco metrics, price, seller, material, and marketplace imagery
- Product detail side sheet with purchase action
- Filterable marketplace feed by category, eco grade, and material
- Seller listing form with real-time eco-score preview before submit
- Login and signup flow backed by JWT auth
- Demo account autofill for seller and buyer testing
- Dedicated authenticated profile page at `/account`
- Protected dashboard route for authenticated users
- Public-only auth page that redirects logged-in users to their profile
- Logout redirect to the landing/login page
- Impact dashboard showing:
  - total purchases
  - total water saved
  - total CO2 diverted
  - unlocked sustainability badges
  - purchase history
  - quick purchase testing panel
- Session refresh from `/api/auth/me` so stored logins stay in sync with server data

### Backend

- JWT authentication with signup, login, and current-user lookup
- PostgreSQL schema for users, products, purchases, materials registry, badge definitions, and user badges
- Material registry seed data for sustainability calculations
- Sustainability engine with:
  - condition weights
  - eco-score numeric calculation
  - A-E eco grade mapping
  - water saved calculation
  - CO2 diverted calculation
- Product creation endpoint that calculates and stores sustainability metrics server-side
- Marketplace listing endpoint with SQL join-based product/material/seller data
- Product detail endpoint for individual listing views
- Live preview endpoint for seller-side eco-score updates
- Purchase endpoint with transaction safety and row locking to prevent duplicate purchase races
- Dashboard aggregation endpoint using SQL joins and sums
- Badge unlock syncing based on purchase count, water saved, CO2 diverted, and material-specific milestones

### Demo and seed data

- Demo seller account
- Demo buyer account
- Seeded materials and badge rules
- Seeded marketplace catalog with 9 demo listings and mock clothing photos

## Current routes in the app

- `/` - marketplace feed
- `/sell` - seller listing form with live sustainability preview
- `/login` - login/signup screen
- `/account` - authenticated profile page with role/activity summary
- `/dashboard` - authenticated impact dashboard

## API endpoints

Base URL: `http://localhost:4000/api`

### Health

- `GET /health` - API status check

### Auth

- `POST /auth/signup`
  - body: `fullName`, `email`, `password`
  - returns JWT token and created user
- `POST /auth/login`
  - body: `email`, `password`
  - returns JWT token and user
- `GET /auth/me`
  - auth required
  - returns the current authenticated user

### Materials

- `GET /materials`
  - returns all material registry entries with water cost, carbon cost, and base value

### Products

- `POST /products/preview-score`
  - body: `materialId`, `conditionLabel`
  - returns live sustainability preview metrics before listing submission
- `POST /products`
  - auth required
  - body: `title`, `description`, `category`, `price`, `materialId`, `conditionLabel`, `imageUrl`
  - creates a product and stores calculated eco metrics
- `GET /products`
  - query params supported: `category`, `ecoScore`, `material`, `search`, `status`
  - returns marketplace feed items with joined seller and material data
- `GET /products/:productId`
  - returns a single product detail record

### Purchases

- `POST /purchases`
  - auth required
  - body: `productId`
  - purchases an available item, marks it sold, updates impact totals, and syncs badges

### Users

- `GET /users/me/profile`
  - auth required
  - returns profile details, inferred marketplace roles, listing counts, and recent listings
- `GET /users/me/dashboard`
  - auth required
  - returns dashboard totals, purchase history, and unlocked badges

## Database scripts

- `npm run db:setup --workspace server` - creates all marketplace tables
- `npm run db:seed --workspace server` - seeds materials and badge definitions
- `npm run db:seed-demo --workspace server` - seeds demo buyer/seller accounts and sample listings
- `npm run db:reset --workspace server` - drops the ReWear tables

## App scripts

- `npm run dev` - runs client and server together
- `npm run dev:client` - runs the React app
- `npm run dev:server` - runs the Express API
- `npm run build` - builds the client and runs the server build placeholder
- `npm run lint` - runs client lint and server lint placeholder
- `npm run test` - runs server tests

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and update the PostgreSQL connection string.
3. Create the schema with `npm run db:setup --workspace server`.
4. Seed the material registry with `npm run db:seed --workspace server`.
5. Seed demo users and listings with `npm run db:seed-demo --workspace server`.
6. Start both apps with `npm run dev`.
7. Open `http://localhost:5173` for the client.
8. The API health check is available at `http://localhost:4000/api/health`.

## Demo accounts

- Seller: `seller@rewear.demo` / `demo12345`
- Buyer: `buyer@rewear.demo` / `demo12345`

## End-to-end verification

1. Log in as the seller and create a new listing from `/sell`.
2. Open the marketplace and confirm the listing appears with an eco badge and image.
3. Sign out and log in as the buyer.
4. Open a product from the marketplace or use the quick purchase panel on `/dashboard`.
5. Purchase an available item.
6. Confirm that purchase history, water saved, CO2 diverted, and badges update immediately.

## pgAdmin

Use the same credentials from `.env` when registering a PostgreSQL server in pgAdmin. Once connected, create or open the `rewear` database and run the repo scripts against it.

## Design references

The original static mockups remain in the repository root as design references while the production app is built in the monorepo.
