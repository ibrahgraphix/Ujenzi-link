# Ujenzi Link Backend API

Backend API for Ujenzi Link - Construction Marketplace by Plan Moja Company Ltd.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your Supabase credentials:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (from Supabase dashboard)
- `JWT_SECRET`: Generate a secure random string for JWT signing
- `PORT`: Server port (default: 3001)

4. Run in development:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── config/          # Configuration files (Supabase client)
├── middleware/      # Express middleware (auth, error handling)
├── models/          # TypeScript interfaces/types
├── routes/          # API route definitions
├── controllers/     # Business logic handlers
├── services/        # Database operations
└── index.ts         # Application entry point
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/register` - Register new user (buyer/provider)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current authenticated user (protected)

### Categories
- `GET /api/categories` - Get all categories (public)
- `GET /api/categories/hierarchy` - Get categories with subcategories (public)
- `GET /api/categories/:categoryId` - Get single category (public)
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:categoryId` - Update category (admin only)
- `DELETE /api/categories/:categoryId` - Delete category (admin only)

### Listings
- `GET /api/listings/:listingId` - Get single listing with full details (public)
- `POST /api/listings` - Create listing (provider/admin)
- `PUT /api/listings/:listingId` - Update listing (provider/admin)
- `DELETE /api/listings/:listingId` - Delete listing (provider/admin)
- `GET /api/listings/provider/:providerId` - Get provider's listings (provider/admin)

### Search & Location
- `GET /api/search/listings` - Search listings with filters (public)
- `GET /api/search/locations/regions` - Get all regions (public)
- `GET /api/search/locations/regions/:region/districts` - Get districts by region (public)
- `GET /api/search/locations/regions/:region/districts/:district/wards` - Get wards by district (public)
- `GET /api/search/locations/regions/:region/districts/:district/wards/:ward/streets` - Get streets by ward (public)
- `GET /api/search/locations/hierarchy` - Get full location hierarchy (public)

### Inquiries
- `POST /api/inquiries` - Submit inquiry (buyer only)
- `GET /api/inquiries/my-inquiries` - Get buyer's sent inquiries (buyer only)
- `GET /api/inquiries/received` - Get provider's received inquiries (provider only)
- `GET /api/inquiries/:inquiryId` - Get single inquiry (buyer/provider)
- `PUT /api/inquiries/:inquiryId/status` - Update inquiry status (provider only)
- `DELETE /api/inquiries/:inquiryId` - Delete inquiry (buyer/provider)

### Admin - User Management
- `GET /api/admin/users` - List all users with filters (admin only)
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user (admin only)
- `PUT /api/admin/users/:userId/reactivate` - Reactivate user (admin only)

### Admin - Provider Management
- `GET /api/admin/providers` - List all providers with listing counts (admin only)
- `GET /api/admin/providers/:providerId/full-profile` - Get provider full profile with listings (admin only)

### Admin - Listing Management
- `GET /api/admin/listings` - List ALL listings with filters (admin only)
- `PUT /api/admin/listings/:listingId/status` - Change listing status (admin only)

### Adverts
- `GET /api/adverts/active` - Get active adverts for homepage (public)
- `GET /api/adverts` - Get all adverts with filters (admin only)
- `POST /api/adverts` - Create advert (admin only)
- `PUT /api/adverts/:advertId` - Update advert (admin only)
- `DELETE /api/adverts/:advertId` - Delete advert (admin only)

### Analytics
- `POST /api/analytics/track` - Track site visit (public)
- `GET /api/analytics/traffic-summary` - Get traffic summary from daily_visit_counts (admin only)
- `GET /api/analytics/traffic-stats` - Get unique visitors and page views (admin only)
- `GET /api/analytics/top-pages` - Get top pages by view count (admin only)

### Admin Dashboard
- `GET /api/admin/dashboard/overview` - Get dashboard overview with summary stats (admin only)

## Tech Stack

- Node.js + TypeScript
- Express.js
- Supabase (PostgreSQL)
- JWT Authentication
- bcryptjs for password hashing

## Database Tables

The backend connects to existing Supabase tables:
- `users` - User accounts
- `buyer_profiles` - Buyer-specific profiles
- `provider_profiles` - Provider-specific profiles
- `locations` - Location hierarchy (country/region/district/ward/street)
- `categories` - Product/service categories with subcategories
- `listings` - Product/service listings
- `listing_images` - Listing images
- `inquiries` - Buyer inquiries on listings
- `adverts` - Advertisements (not yet implemented)
- `site_visits` - Site visit tracking (not yet implemented)
- `admin_logs` - Admin activity logs (not yet implemented)

## User Roles

- **buyer** - Can search listings, submit inquiries, manage favorites
- **provider** - Can create/manage listings, respond to inquiries
- **admin** - Full access to all resources, can manage categories and listings

## Verification Tests

Each module includes comprehensive test documentation:
- `STEP2_AUTH_TEST.md` - Authentication module tests
- `STEP3_CATEGORIES_TEST.md` - Categories module tests
- `STEP4_LISTINGS_TEST.md` - Listings module tests
- `STEP5_SEARCH_TEST.md` - Search & Location module tests
- `STEP6_INQUIRIES_TEST.md` - Inquiries module tests

## Security Notes

- Supabase service role key is used for backend database access
- JWT tokens are used for authentication with configurable expiration
- Passwords are hashed using bcryptjs before storage
- Role-based access control (RBAC) enforced on all protected endpoints
- CORS enabled for cross-origin requests
- All admin actions that modify data are logged to admin_logs table
- Admin logging includes: admin_id, action, target_table, target_id, details, timestamp
