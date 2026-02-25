# Bdo Beans (بدو بينز) - Specialty Coffee Marketplace

## Overview
Full-stack Arabic RTL marketplace for specialty coffee, tea, and matcha. Multi-role system (Buyer/Supplier/Admin) with Modern Bedouin design theme.

## Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: Supabase PostgreSQL via Drizzle ORM (SUPABASE_DATABASE_URL)
- **Auth**: Supabase Auth (JWT-based, Bearer token in Authorization header)
- **State Management**: Zustand (cart), TanStack Query (server state)
- **Routing**: wouter v3 (frontend, flat routing pattern)
- **i18n**: Custom context-based provider (AR/EN, RTL/LTR)
- **GitHub**: Connected via Replit integration (zayed1/bdo-beans)

## Design System (Apple Minimal Luxury × Bedouin Identity)
- **Background**: #F9F5F0 (warm near-white), Cards: #FFFFFF
- **Browns**: 950=#1A0E08, 900=#2C1810, 800=#3C2415, 700=#5C3D2E, 500=#8B6954, 300=#C4A882, 200=#DDD0C0, 100=#F0E8DE, 50=#F9F5F0
- **Gold**: #B8860B (CTAs/links), #D4A843 (hover), #F5ECD7 (subtle badges)
- **Fonts**: IBM Plex Sans Arabic + Inter (Google Fonts import)
- **Typography**: Large Apple-style headings, tight letter-spacing (-0.01em/-0.02em)
- **Direction**: RTL when locale=ar, LTR when locale=en
- **Animations**: Framer Motion — FadeUp/FadeIn/HoverScale/StaggerContainer/StaggerItem/SlideIn (components/ui/motion.tsx)
- **Navbar**: Fixed, transparent on homepage → white/blur on scroll (64px height)
- **Cards**: White, shadow-only (no border), 16px radius, hover lift + image zoom
- **Footer**: Dark brown-900 (#2C1810) background, gold accents
- **Buttons**: btn-gradient (brown gradient), btn-gold (gold CTA), rounded-full for CTAs
- **Global**: Custom scrollbar, gold text selection, focus-visible gold outline, smooth scroll

## Project Structure
```
client/src/
  App.tsx                     # Main router with flat routing (no nested Switch)
  lib/
    supabase.ts               # Supabase client (anon key, browser-side)
    queryClient.ts            # TanStack Query client with Supabase auth headers
  i18n/                       # Translation system
    ar.json, en.json          # Translation files
    i18nProvider.tsx           # I18n context provider
  components/
    layout/                   # Navbar, Footer, AppLayout, SupplierLayout, AdminLayout
    cart/CartDrawer.tsx        # Cart slide-out drawer
    guards/                   # AuthGuard, SupplierGuard, AdminGuard, GuestGuard
    ui/ProductCard.tsx         # Product card component
  hooks/
    use-auth.ts               # Supabase auth hooks (useUser, useLogin, useRegister, useLogout, authFetch)
    use-products.ts           # Product hooks with filter support
    use-orders.ts             # Order hooks
    use-categories.ts         # Category hooks
  pages/
    Home.tsx, Products.tsx, ProductDetails.tsx, Checkout.tsx, Auth.tsx, Orders.tsx
    supplier/                 # Dashboard, Products, ProductForm, Orders, Finances, Profile
    admin/                    # Dashboard, Suppliers, Orders, Products, Finances
  store/use-cart.ts           # Zustand cart store

shared/
  schema.ts                   # Drizzle schema + types (ProductWithDetails, etc.)
  routes.ts                   # API path definitions + Zod schemas

server/
  routes.ts                   # All Express routes + seed data + Supabase Auth migration
  storage.ts                  # Database storage layer (IStorage + DatabaseStorage)
  db.ts                       # Database connection (uses SUPABASE_DATABASE_URL)
  lib/
    supabase.ts               # Supabase admin client (service role key, server-side)
    github.ts                 # GitHub API client (Replit integration)
```

## Key Features
- **Buyer Flow**: Browse products -> filter/search -> add to cart -> checkout (COD) -> view orders
- **Supplier Flow**: Register (pending approval) -> manage products (attributes, price tiers, shipping zones) -> manage orders -> view finances
- **Admin Flow**: Approve/reject suppliers -> view all orders -> view finances with 5% platform fee breakdown
- **i18n**: Full Arabic/English support with zero hardcoded strings
- **Product Details**: Attributes, price tiers, shipping zones, COD availability badge
- **Platform Fee**: 5% internal fee (admin-only visibility, hidden from buyers)

## Auth System (Supabase)
- **Frontend**: Supabase JS client handles signInWithPassword/signUp, stores JWT in browser
- **Backend**: optionalAuth middleware extracts Bearer token, validates via supabaseAdmin.auth.getUser(), loads DB user by authId
- **Registration**: Creates Supabase Auth user (admin.createUser) + DB user with authId link
- **Login**: Frontend signs in via Supabase client, gets JWT; backend verifies JWT on each request
- **All authenticated API calls**: Use authFetch() or apiRequest() which inject Authorization header
- **Seed users**: supplier1@bdobeans.com, supplier2@bdobeans.com, admin@bdobeans.com (password: password123) — all linked to Supabase Auth

## Important: Routing
Uses flat routing in App.tsx (all routes in single Switch). Do NOT use nested Switch/Route with /:rest* pattern - it breaks with wouter v3.

## Database
- **Provider**: Supabase PostgreSQL (ap-northeast region)
- **Connection**: Uses SUPABASE_DATABASE_URL with ssl:{rejectUnauthorized:false}
- **Tables**: users, categories, products, productAttributes, shippingZones, priceTiers, supplierProfiles, orders, orderItems, addresses
- **CRITICAL**: Never use DATABASE_URL (Replit built-in); always use SUPABASE_DATABASE_URL

## Environment Secrets
- VITE_SUPABASE_URL — Supabase project URL (frontend)
- VITE_SUPABASE_ANON_KEY — Supabase anon/public key (frontend)
- SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (server only)
- SUPABASE_DATABASE_URL — PostgreSQL connection string (server only)
- SESSION_SECRET — Legacy (no longer used for auth)

## API Endpoints
- Public: GET /api/products (with filters), GET /api/products/:id, GET /api/categories
- Auth: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
- Buyer: POST /api/orders, GET /api/orders/me
- Supplier: GET/PUT /api/supplier/dashboard|products|orders|finances|profile
- Admin: GET /api/admin/dashboard|suppliers|orders|products|finances, POST approve/reject

## Running
`npm run dev` starts Express + Vite on port 5000
