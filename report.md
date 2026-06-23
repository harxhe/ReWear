# ReWear Project Report

## 1. Project overview

ReWear is a second-hand clothing marketplace built as a monorepo with a React frontend and an Express backend. The app is centered around a sustainability engine that gives each listed item an eco score, estimates water savings, estimates CO2 diversion, and then uses those values in the marketplace, the buyer experience, and profile/dashboard views.

The current project supports two account types:

- `buyer`
- `seller`

The backend now uses MongoDB with Mongoose. The frontend uses React Router for navigation, TanStack Query for data fetching/caching, and Tailwind CSS for styling.

## 2. High-level architecture

### Frontend

The frontend lives in `client/` and is responsible for:

- public landing page and auth form
- authenticated marketplace browsing
- seller listing creation and editing
- buyer purchase confirmation and wishlist actions
- role-specific account/profile pages
- role-specific dashboard pages

### Backend

The backend lives in `server/` and is responsible for:

- JWT authentication
- MongoDB data persistence
- account role enforcement
- sustainability score calculation
- buyer purchase and wishlist logic
- seller listing CRUD logic
- profile/dashboard aggregation
- badge unlocking logic

### Database

MongoDB stores all app data using Mongoose models for:

- users
- materials
- products
- purchases
- badge definitions
- user badges
- wishlist items

## 3. Functional features implemented

### 3.1 Public landing page

Path: `/`

Implemented in `client/src/pages/login-page.jsx`

Features:

- merged login and signup in one page
- seller/buyer role selection during signup
- feature showcase explaining eco scoring, circularity, and impact tracking
- demo account autofill for quick testing
- authenticated users are redirected away from this page to `/marketplace`

### 3.2 Authentication system

Frontend pieces:

- `client/src/pages/login-page.jsx`
- `client/src/state/auth.jsx`
- `client/src/state/auth-context.js`

Backend pieces:

- `server/src/routes/auth.routes.js`
- `server/src/lib/auth.js`

Features:

- signup with `fullName`, `email`, `password`, `role`
- login with `email`, `password`
- JWT token generation
- auth session persistence in local storage
- auto-refresh of current user via `/api/auth/me`
- logout support

### 3.3 Marketplace

Path: `/marketplace`

Frontend pieces:

- `client/src/pages/marketplace-page.jsx`
- `client/src/components/product-card.jsx`
- `client/src/components/section-heading.jsx`

Backend pieces:

- `server/src/routes/products.routes.js`
- `server/src/routes/materials.routes.js`

Features:

- authenticated product browsing
- category filter
- eco grade filter
- material filter
- product cards with:
  - image
  - title
  - category
  - material
  - seller
  - price
  - eco grade
  - water saved
  - CO2 diverted
- seller clicking own listing opens edit flow
- seller clicking another seller's listing opens view-only detail page
- buyer clicking another seller's listing opens purchase page
- wishlist badge state shown in marketplace cards for buyers

### 3.4 Seller listing studio

Path: `/sell`

Frontend piece:

- `client/src/pages/sell-page.jsx`

Backend piece:

- `server/src/routes/products.routes.js`

Features:

- seller-only route
- create listing flow
- edit listing flow via `/sell?listing=<id>`
- delete listing flow for active listings
- live preview panel on the right side
- real-time eco grade, score, water saved, and CO2 diverted preview before submit
- success message after publish/update

### 3.5 Purchase confirmation page

Path: `/purchase/:productId`

Frontend piece:

- `client/src/pages/purchase-page.jsx`

Backend pieces:

- `server/src/routes/products.routes.js`
- `server/src/routes/purchases.routes.js`
- `server/src/routes/wishlist.routes.js`

Features:

- full product detail display
- product description
- listing detail summary
- buyer can confirm purchase
- buyer can add/remove wishlist item
- seller can open another seller's listing in read-only mode
- seller cannot buy or wishlist
- seller can edit their own listing from this page

### 3.6 Wishlist

Frontend pieces:

- `client/src/pages/purchase-page.jsx`
- `client/src/pages/marketplace-page.jsx`
- `client/src/pages/account-page.jsx`

Backend pieces:

- `server/src/routes/wishlist.routes.js`
- `server/src/models/wishlist-item.model.js`

Features:

- buyer-only wishlist APIs
- add listing to wishlist
- remove listing from wishlist
- wishlist visibility in buyer profile
- wishlist navigation into the purchase page

### 3.7 Profile page

Path: `/account`

Frontend piece:

- `client/src/pages/account-page.jsx`

Backend piece:

- `server/src/routes/users.routes.js`

Features:

- role-specific profile experience
- member since date
- seller profile shows:
  - total listings
  - sold listings
  - active listings
  - recent listings
  - manage links for editable listings
- buyer profile shows:
  - total purchases
  - water saved
  - CO2 diverted
  - recent purchases
  - wishlist summary and wishlist items

### 3.8 Dashboard

Path: `/dashboard`

Frontend piece:

- `client/src/pages/dashboard-page.jsx`

Backend piece:

- `server/src/routes/users.routes.js`

Features:

- role-specific dashboard experience
- seller dashboard shows:
  - total listings
  - active listings
  - sold listings
  - total sales value
  - active listing cards
  - sales history
- buyer dashboard shows:
  - purchase count
  - water saved
  - CO2 diverted
  - unlocked badges
  - purchase history
  - quick purchase test panel

### 3.9 Sustainability engine

Backend piece:

- `server/src/services/sustainability.service.js`

Features:

- condition weighting system
- eco score numeric calculation
- eco grade A-E calculation
- water saved calculation
- CO2 diverted calculation
- reused for preview and persisted listing values

## 4. MongoDB models and data design

### 4.1 `User`

File: `server/src/models/user.model.js`

Fields:

- `fullName`
- `email`
- `passwordHash`
- `role`
- `avatarUrl`
- `totalWaterSavedLiters`
- `totalCo2DivertedKg`
- timestamps

Purpose:

- stores auth identity
- stores account role
- stores cumulative impact totals for buyer accounts

### 4.2 `Material`

File: `server/src/models/material.model.js`

Fields:

- `name`
- `category`
- `description`
- `waterCostLiters`
- `carbonCostKg`
- `baseValue`

Purpose:

- canonical sustainability reference table, now as a Mongo collection

### 4.3 `Product`

File: `server/src/models/product.model.js`

Fields:

- `sellerId`
- `materialId`
- `materialNameCache`
- `title`
- `description`
- `category`
- `price`
- `conditionLabel`
- `conditionWeight`
- `ecoScoreNumeric`
- `ecoScoreGrade`
- `waterSavedLiters`
- `co2DivertedKg`
- `imageUrl`
- `status`
- timestamps

Purpose:

- stores everything required to render a listing without recalculating every time

### 4.4 `Purchase`

File: `server/src/models/purchase.model.js`

Fields:

- `buyerId`
- `productId`
- `purchasePrice`
- `waterSavedLiters`
- `co2DivertedKg`
- `purchasedAt`

Purpose:

- stores completed purchases
- unique `productId` ensures one product is only sold once

### 4.5 `BadgeDefinition`

File: `server/src/models/badge-definition.model.js`

Fields:

- `slug`
- `title`
- `description`
- `ruleType`
- `ruleThreshold`
- `materialName`

Purpose:

- defines badge unlock rules

### 4.6 `UserBadge`

File: `server/src/models/user-badge.model.js`

Fields:

- `userId`
- `badgeId`
- `unlockedAt`

Purpose:

- stores badge unlock results per user

### 4.7 `WishlistItem`

File: `server/src/models/wishlist-item.model.js`

Fields:

- `userId`
- `productId`
- `createdAt`

Purpose:

- stores buyer wishlist entries

## 5. Backend infrastructure and helper functions

### 5.1 `connectToDatabase()`

File: `server/src/db/mongoose.js`

Purpose:

- opens a shared Mongoose connection using `MONGODB_URI`
- ensures the app connects before the HTTP server begins serving requests

### 5.2 `disconnectFromDatabase()`

File: `server/src/db/mongoose.js`

Purpose:

- closes the Mongoose connection for scripts and cleanup tasks

### 5.3 `createAccessToken(user)`

File: `server/src/lib/auth.js`

Purpose:

- signs a JWT with `email` and `sub`
- used in signup and login responses

### 5.4 `requireAuth()`

File: `server/src/lib/auth.js`

Purpose:

- checks the `Authorization` header
- verifies JWT
- attaches `request.auth.userId`

### 5.5 `requireAccountRole(allowedRoles)`

File: `server/src/middleware/require-account-role.js`

Purpose:

- loads the current user role from MongoDB
- blocks requests when the account role is not allowed

Used for:

- seller-only product create/update/delete
- buyer-only purchase and wishlist actions

### 5.6 `asyncHandler(handler)`

File: `server/src/lib/async-handler.js`

Purpose:

- wraps async route handlers and forwards thrown errors to Express error middleware

### 5.7 `errorHandler()`

File: `server/src/middleware/error-handler.js`

Purpose:

- standardizes JSON API errors
- handles custom `HttpError` instances

### 5.8 `mapUser()`, `mapMaterial()`, `mapProduct()`

File: `server/src/utils/mappers.js`

Purpose:

- converts Mongo documents into frontend-friendly API response shapes
- standardizes `id` as string
- keeps client contracts stable after Mongo migration

## 6. Sustainability logic functions

File: `server/src/services/sustainability.service.js`

### 6.1 `roundToTwo(value)`

Purpose:

- rounds numeric sustainability metrics to two decimals

### 6.2 `getConditionProfile(conditionLabel)`

Purpose:

- looks up the condition definition from the sustainability constants
- returns weight and impact multiplier

### 6.3 `getEcoGrade(score)`

Purpose:

- maps a numeric score to an eco grade from `A` to `E`

### 6.4 `calculateSustainabilityMetrics(input)`

Purpose:

- central sustainability engine used by preview and listing persistence

Calculates:

- `conditionWeight`
- `ecoScoreNumeric`
- `ecoScoreGrade`
- `waterSavedLiters`
- `co2DivertedKg`

Formula:

- `(materialBaseValue * 0.6) + (conditionWeight * 0.4)`

## 7. Badge logic functions

File: `server/src/services/badge.service.js`

### 7.1 `getUserBadgeStats(userId, session)`

Purpose:

- collects purchase count, total water saved, and total CO2 diverted for a user

### 7.2 `getMaterialPurchaseCount(userId, materialName, session)`

Purpose:

- counts how many purchases the user has made for a specific material

### 7.3 `badgeUnlocked(badge, stats, materialPurchaseCount)`

Purpose:

- evaluates whether a badge definition is unlocked

### 7.4 `syncUserBadges(userId, session)`

Purpose:

- checks all badge definitions
- inserts unlocked user badges if needed

### 7.5 `getUnlockedBadges(userId)`

Purpose:

- fetches all already-unlocked badges and formats them for the dashboard

## 8. Backend route behavior in detail

### 8.1 Auth routes

File: `server/src/routes/auth.routes.js`

#### `POST /api/auth/signup`

Flow:

1. reads `email`, `fullName`, `password`, `role`
2. validates required fields
3. validates role
4. checks whether the email already exists
5. hashes password with bcrypt
6. creates user document
7. maps user for API response
8. returns token + user

#### `POST /api/auth/login`

Flow:

1. reads `email`, `password`
2. validates required fields
3. looks up the user by email
4. compares password hash
5. returns token + user

#### `GET /api/auth/me`

Flow:

1. requires auth
2. loads current user by id
3. returns mapped user object

### 8.2 Materials route

File: `server/src/routes/materials.routes.js`

#### `GET /api/materials`

Flow:

1. loads all materials sorted by sustainability value
2. maps them with `mapMaterial`
3. returns them to the client

### 8.3 Product routes

File: `server/src/routes/products.routes.js`

Helper functions:

- `getMaterialById(materialId)`
- `getProductById(productId)`
- `calculateMetricsForMaterial(material, conditionLabel)`

#### `POST /api/products/preview-score`

Purpose:

- returns live preview metrics for the seller form right panel

#### `POST /api/products`

Purpose:

- seller-only create listing endpoint

Main steps:

1. validate listing payload
2. fetch material document
3. compute sustainability metrics
4. create product document with precomputed values
5. return populated/mapped product

#### `PUT /api/products/:productId`

Purpose:

- seller-only update listing endpoint

Main steps:

1. validate payload
2. fetch existing product
3. verify ownership
4. prevent edits to sold listings
5. fetch selected material
6. recompute sustainability metrics
7. update product fields
8. return mapped product

#### `DELETE /api/products/:productId`

Purpose:

- seller-only deletion of unsold listings

#### `GET /api/products`

Purpose:

- marketplace feed endpoint

Supports filters:

- `category`
- `ecoScore`
- `material`
- `status`

#### `GET /api/products/:productId`

Purpose:

- loads one product with seller and material populated

### 8.4 Purchase route

File: `server/src/routes/purchases.routes.js`

#### `POST /api/purchases`

Purpose:

- buyer-only purchase action

Main steps:

1. validate product id
2. load product
3. block buyer from purchasing own listing
4. atomically reserve the product by switching `status` from `available` to `sold`
5. create purchase document
6. recompute buyer impact totals
7. update user totals
8. sync badges
9. return purchase summary

This route is critical because it protects against double-buy behavior by reserving only products still marked `available`.

### 8.5 Wishlist routes

File: `server/src/routes/wishlist.routes.js`

#### `GET /api/wishlist`

Purpose:

- returns all wishlisted products for the current buyer

#### `POST /api/wishlist`

Purpose:

- saves a listing to wishlist

Checks:

- valid product id
- product exists
- buyer is not trying to wishlist their own listing

#### `DELETE /api/wishlist/:productId`

Purpose:

- removes a wishlist entry for the current buyer

### 8.6 User routes

File: `server/src/routes/users.routes.js`

#### `GET /api/users/me/profile`

Purpose:

- returns role-specific profile data

Data returned:

- core user profile fields
- listing totals
- purchase totals
- recent listings
- recent purchases

#### `GET /api/users/me/dashboard`

Purpose:

- returns dashboard data tailored to buyer or seller

Buyer data includes:

- purchases
- purchase count
- total spent
- total water saved
- total CO2 diverted
- badges

Seller data includes:

- total listings
- active listings
- sold listings
- total sales value
- active listing items
- recent sales

## 9. Frontend routing and app shell

### 9.1 `ProtectedRoute`

File: `client/src/App.jsx`

Purpose:

- prevents unauthenticated access
- optionally prevents access for the wrong role

### 9.2 Frontend routes

File: `client/src/App.jsx`

Defined routes:

- `/` -> landing page
- `/marketplace` -> authenticated marketplace
- `/sell` -> seller-only listing page
- `/purchase/:productId` -> authenticated detail/purchase page
- `/account` -> authenticated profile page
- `/dashboard` -> authenticated dashboard page
- `/login` -> redirect back to `/`

### 9.3 `AppShell`

File: `client/src/components/app-shell.jsx`

Purpose:

- global page wrapper
- authenticated header/navigation shell
- role-aware navigation visibility
- logout button
- buyer-only water-saved chip in the navbar
- hides the navbar entirely on the logged-out landing page

## 10. Frontend page and helper function breakdown

### 10.1 `LoginPage`

File: `client/src/pages/login-page.jsx`

Purpose:

- public landing page and auth page combined

Key behavior:

- stores `mode` (`login` or `signup`)
- stores `formState`
- runs auth mutation
- redirects authenticated users to `/marketplace`

Supporting components/functions inside file:

- `LandingCard()`
- `StepCard()`
- `DemoAccountCard()`
- `Field()`

### 10.2 `MarketplacePage`

File: `client/src/pages/marketplace-page.jsx`

Purpose:

- main marketplace feed and filters

Key behavior:

- loads materials for filter dropdown
- loads products with filter query string
- loads buyer wishlist to mark wishlisted items
- routes clicks depending on ownership:
  - own listing -> edit listing
  - someone else’s listing -> purchase/detail page

Supporting function inside file:

- `FeedState()`

### 10.3 `SellPage`

File: `client/src/pages/sell-page.jsx`

Purpose:

- seller create/edit/delete experience

Key behavior:

- derives listing id from URL search params
- loads listing for edit mode
- maintains draft form state
- computes selected material id
- calls live preview query on material/condition changes
- submits create or update mutation depending on mode
- allows deletion in edit mode

Supporting functions/components inside file:

- `Input()`
- `Select()`
- `Metric()`

### 10.4 `PurchasePage`

File: `client/src/pages/purchase-page.jsx`

Purpose:

- shared detail page for buyers and sellers

Key behavior:

- loads one product
- resolves correct product id for Mongo requests
- buyers can purchase/wishlist
- sellers can view but not buy
- owners can jump to edit listing

Supporting functions/components inside file:

- `Row()`
- `Metric()`
- `State()`

### 10.5 `DashboardPage`

File: `client/src/pages/dashboard-page.jsx`

Purpose:

- role-aware dashboard

Key behavior:

- loads dashboard data
- loads available products for buyer quick-purchase testing
- lets buyer immediately purchase from dashboard
- renders seller and buyer views differently

Supporting functions/components inside file:

- `DashboardState()`
- `StatCard()`

### 10.6 `AccountPage`

File: `client/src/pages/account-page.jsx`

Purpose:

- role-aware profile page

Key behavior:

- loads profile data
- loads buyer wishlist if applicable
- shows role-specific profile metrics and recent activity

Supporting functions/components inside file:

- `ProfileMetric()`
- `ProfileState()`

### 10.7 `AuthProvider`

File: `client/src/state/auth.jsx`

Purpose:

- central auth/session state manager

Main responsibilities:

- load auth state from local storage
- persist auth state to local storage
- refresh `/auth/me` when a token exists
- expose `refreshUser()`
- expose `setAuth()`
- expose `signOut()`

## 11. API client helpers

File: `client/src/lib/api.js`

### `parseResponse(response)`

Purpose:

- parses JSON payloads
- throws normalized error messages on non-OK responses

### `apiRequest(path, options)`

Purpose:

- central fetch helper used across the client
- automatically applies the API base URL and JSON content type

### `authHeaders(token)`

Purpose:

- returns the JWT `Authorization` header object

## 12. Demo data and scripts

### Scripts

Located in `server/scripts/`

- `setup-db.js` - initializes indexes
- `seed-core.js` - inserts materials and badge definitions
- `seed-demo.js` - inserts demo users and demo listings
- `reset-db.js` - drops the entire Mongo database

### Demo accounts

- Seller: `seller@rewear.demo / demo12345`
- Buyer: `buyer@rewear.demo / demo12345`

### Demo catalog

The app seeds nine product listings with image URLs so the marketplace feels real immediately after setup.

## 13. Key business rules

- only sellers can create, update, and delete listings
- only buyers can purchase or use wishlist features
- sellers can still view other sellers’ listings in read-only mode
- sellers cannot edit listings they do not own
- buyers cannot purchase their own listing
- sold listings cannot be edited or deleted
- each product can only be purchased once
- eco score preview and persisted product metrics come from the same sustainability logic

## 14. Known implementation notes

- The project started on PostgreSQL but has now been migrated to MongoDB.
- API response mapping keeps frontend data shapes stable despite the database switch.
- Purchase protection in Mongo is handled by reserving the item only if it is still `available`.
- The seller form preview depends on the material id string returned by Mongo and the preview endpoint.

## 15. Complete feature summary

The current application supports the full course demo loop:

1. A user lands on a branded landing page.
2. They sign up as buyer or seller.
3. Sellers create listings with live eco feedback.
4. The marketplace shows visual cards and sustainability metrics.
5. Buyers open listings, wishlist them, and purchase them.
6. Buyer profiles and dashboards reflect impact and badges.
7. Seller profiles and dashboards reflect inventory and sales activity.

This report is intended as a complete implementation reference for the current ReWear project state.
