# ReWear

ReWear is a PERN monorepo for the EcoThread Marketplace course project. It is a second-hand fashion marketplace with a sustainability engine that scores products, tracks water and carbon impact, and shows circular economy progress on a user dashboard.

## Tech stack

- `client/` - React, Vite, React Router, TanStack Query, Tailwind CSS v4, Lucide React
- `server/` - Node.js, Express, MongoDB, Mongoose, JWT auth, bcrypt
- root - npm workspaces and shared scripts

## Implemented features

### Frontend

- Public landing page at `/` with merged login and signup flow
- Role-aware signup with `buyer` or `seller` account type
- Authenticated marketplace at `/marketplace` with earth-tone styling and live product feed
- Product cards with real eco metrics, seller info, category, material, and mock clothing imagery
- Filterable marketplace feed by category, eco grade, and material
- Purchase confirmation page at `/purchase/:productId` for buyers
- Seller listing studio at `/sell` with real-time eco-score preview before submit
- Seller listing management from the profile page, including edit and delete for active listings
- Buyer wishlist flow with save/remove actions and wishlist section on profile
- Dedicated authenticated profile page at `/account`
- Dedicated authenticated dashboard page at `/dashboard`
- Role-aware UI:
  - buyers see purchases, wishlist, impact, and badges
  - sellers see listings, sales history, active inventory, and sales totals
- Logout redirects back to the landing page
- Session refresh from `/api/auth/me` so stored logins stay in sync with server data

### Backend

- JWT authentication with signup, login, current-user lookup, and stored account role
- MongoDB collections for users, products, purchases, materials, badge definitions, user badges, and wishlist items
- Material registry seed data for sustainability calculations
- Sustainability engine with:
  - condition weights
  - eco-score numeric calculation
  - A-E eco grade mapping
  - water saved calculation
  - CO2 diverted calculation
- Product create, update, delete, list, detail, and live preview endpoints
- Purchase endpoint with transaction safety and row locking to prevent duplicate purchase races
- Wishlist create, delete, and fetch endpoints
- Profile endpoint with role-aware activity summaries
- Dashboard endpoint with buyer-specific and seller-specific aggregate data
- Badge unlock syncing based on purchase count, water saved, CO2 diverted, and material-specific milestones
- Backend role enforcement middleware for buyer-only and seller-only actions

### Demo and seed data

- Demo seller account
- Demo buyer account
- Seeded materials and badge rules
- Seeded marketplace catalog with 9 demo listings and mock clothing photos

## Current routes in the app

- `/` - public landing page with merged login/signup
- `/marketplace` - authenticated marketplace feed
- `/sell` - seller-only listing form and listing edit page
- `/purchase/:productId` - buyer-only purchase confirmation page
- `/account` - authenticated profile page with role-specific activity
- `/dashboard` - authenticated dashboard with role-specific metrics
- `/login` - redirects to `/`

## API endpoints

Base URL: `http://localhost:4000/api`

### Health

- `GET /health` - API status check

### Auth

- `POST /auth/signup`
  - body: `fullName`, `email`, `password`, `role`
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
  - auth required, seller only
  - body: `title`, `description`, `category`, `price`, `materialId`, `conditionLabel`, `imageUrl`
  - creates a product and stores calculated eco metrics
- `PUT /products/:productId`
  - auth required, seller only
  - body: `title`, `description`, `category`, `price`, `materialId`, `conditionLabel`, `imageUrl`
  - updates an active listing and recalculates stored sustainability metrics
- `DELETE /products/:productId`
  - auth required, seller only
  - deletes an active listing owned by the seller
- `GET /products`
  - query params supported: `category`, `ecoScore`, `material`, `status`
  - returns marketplace feed items with joined seller and material data
- `GET /products/:productId`
  - returns a single product detail record

### Purchases

- `POST /purchases`
  - auth required, buyer only
  - body: `productId`
  - purchases an available item, marks it sold, updates impact totals, and syncs badges

### Wishlist

- `GET /wishlist`
  - auth required, buyer only
  - returns wishlist items for the current user
- `POST /wishlist`
  - auth required, buyer only
  - body: `productId`
  - saves a product to the user's wishlist
- `DELETE /wishlist/:productId`
  - auth required, buyer only
  - removes a product from the user's wishlist

### Users

- `GET /users/me/profile`
  - auth required
  - returns profile details, account role, listing counts, recent listings, and recent purchases
- `GET /users/me/dashboard`
  - auth required
  - returns role-aware dashboard data:
    - buyers: purchases, impact totals, badges
    - sellers: listings, sales history, active listing summaries, sales totals

## Database scripts

- `npm run db:setup --workspace server` - initializes MongoDB collections and indexes
- `npm run db:seed --workspace server` - seeds materials and badge definitions
- `npm run db:seed-demo --workspace server` - seeds demo buyer/seller accounts and sample listings
- `npm run db:reset --workspace server` - drops the ReWear MongoDB database

## App scripts

- `npm run dev` - runs client and server together
- `npm run dev:client` - runs the React app
- `npm run dev:server` - runs the Express API
- `npm run build` - builds the client and runs the server build placeholder
- `npm run lint` - runs client lint and server lint placeholder
- `npm run test` - runs server tests

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and update the MongoDB connection string.
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
3. Confirm the seller profile and dashboard show listing and sales-oriented information.
4. Sign out and log in as the buyer.
5. Open a product from `/marketplace` or use the quick purchase panel on `/dashboard`.
6. Purchase an available item and optionally save/remove wishlist items.
7. Confirm that purchase history, water saved, CO2 diverted, wishlist, and badges update immediately.

## MongoDB

The default local connection string is `mongodb://127.0.0.1:27017/rewear`. ReWear now uses MongoDB for all app data, including auth, products, purchases, badges, and wishlists.

## Design references

The original static mockups remain in the repository root as design references while the production app is built in the monorepo.
