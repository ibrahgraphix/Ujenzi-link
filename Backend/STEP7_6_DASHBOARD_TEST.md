# Step 7.6: Admin Dashboard Overview - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Admin user registered and logged in (get JWT token)
- Supabase database with all required tables (users, provider_profiles, listings, inquiries, adverts, site_visits)

## Test Cases

### 1. Get Dashboard Overview (Admin Only)
```bash
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "users": {
      "total": 150,
      "buyers": 100,
      "providers": 45,
      "admins": 5
    },
    "providers": {
      "total": 45,
      "byType": {
        "contractor": 15,
        "retailer_supplier": 12,
        "manufacturer_wholesaler": 8,
        "technician": 5,
        "consultant": 3,
        "freelancer": 2
      }
    },
    "listings": {
      "total": 320,
      "byStatus": {
        "active": 280,
        "inactive": 35,
        "sold": 5
      }
    },
    "inquiries": {
      "total": 85,
      "byStatus": {
        "new": 30,
        "responded": 45,
        "closed": 10
      }
    },
    "adverts": {
      "totalActive": 3
    },
    "visits": {
      "today": 150,
      "thisWeek": 850
    },
    "generatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 2. Test Dashboard with New Data
```bash
# Create a new user (buyer)
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newbuyer@example.com",
    "password": "password123",
    "name": "New Buyer",
    "phone": "+255700000999",
    "role": "buyer",
    "buyerType": "developer"
  }'

# Get dashboard overview - should reflect new user count
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:** users.total should increase by 1, users.buyers should increase by 1

### 3. Test Dashboard with New Listing
```bash
# Create a new listing (as provider or admin)
curl -X POST "http://localhost:3001/api/listings" \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "CATEGORY_ID",
    "title": "New Test Listing",
    "description": "Test listing for dashboard verification",
    "price": 10000,
    "locationId": "LOCATION_ID"
  }'

# Get dashboard overview - should reflect new listing
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:** listings.total should increase by 1, listings.byStatus.active should increase by 1

### 4. Test Dashboard with New Inquiry
```bash
# Create a new inquiry
curl -X POST "http://localhost:3001/api/inquiries" \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "LISTING_ID",
    "providerId": "PROVIDER_ID",
    "message": "Test inquiry for dashboard"
  }'

# Get dashboard overview - should reflect new inquiry
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:** inquiries.total should increase by 1, inquiries.byStatus.new should increase by 1

### 5. Test Dashboard with New Active Advert
```bash
# Create a new active advert
curl -X POST "http://localhost:3001/api/adverts" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Advert",
    "imageUrl": "https://example.com/test.jpg",
    "linkUrl": "https://example.com",
    "isActive": true,
    "startsAt": "2024-01-01T00:00:00.000Z",
    "endsAt": "2025-12-31T23:59:59.000Z"
  }'

# Get dashboard overview - should reflect new active advert
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:** adverts.totalActive should increase by 1

### 6. Test Dashboard with New Visit
```bash
# Track a new visit
curl -X POST "http://localhost:3001/api/analytics/track" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_test123",
    "pagePath": "/dashboard-test"
  }'

# Get dashboard overview - should reflect new visit
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:** visits.today should increase by 1 (if run today), visits.thisWeek should increase by 1

### 7. Test Unauthorized Access (Non-Admin)
```bash
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Only admins can view dashboard overview"
}
```

### 8. Test Unauthorized Access (Provider)
```bash
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Only admins can view dashboard overview"
}
```

### 9. Test Dashboard with No Data (Fresh Database)
```bash
# If database is empty, dashboard should return zeros
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "users": {
      "total": 0,
      "buyers": 0,
      "providers": 0,
      "admins": 0
    },
    "providers": {
      "total": 0,
      "byType": {}
    },
    "listings": {
      "total": 0,
      "byStatus": {}
    },
    "inquiries": {
      "total": 0,
      "byStatus": {}
    },
    "adverts": {
      "totalActive": 0
    },
    "visits": {
      "today": 0,
      "thisWeek": 0
    },
    "generatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 10. Verify Provider Type Breakdown Accuracy
```bash
# Get all providers to verify breakdown
curl -X GET "http://localhost:3001/api/admin/providers" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get dashboard overview
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Verification:** The sum of provider_type breakdown should equal providers.total

### 11. Verify Listing Status Breakdown Accuracy
```bash
# Get all listings to verify breakdown
curl -X GET "http://localhost:3001/api/admin/listings" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get dashboard overview
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Verification:** The sum of listing status breakdown should equal listings.total

### 12. Verify Inquiry Status Breakdown Accuracy
```bash
# Get all inquiries to verify breakdown (via provider endpoint or direct query)
curl -X GET "http://localhost:3001/api/inquiries/received" \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN"

# Get dashboard overview
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Verification:** The sum of inquiry status breakdown should equal inquiries.total

### 13. Verify Active Adverts Count
```bash
# Get active adverts
curl -X GET "http://localhost:3001/api/adverts/active"

# Get dashboard overview
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Verification:** The count from /active endpoint should match adverts.totalActive

### 14. Verify Visit Counts
```bash
# Get traffic stats for today
curl -X GET "http://localhost:3001/api/analytics/traffic-stats" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get dashboard overview
curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Verification:** The pageViews from traffic stats should match or be greater than visits.today (since traffic-stats counts all page views, dashboard counts visits)

### 15. Test Response Time
```bash
# Measure response time
time curl -X GET "http://localhost:3001/api/admin/dashboard/overview" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected:** Response should be reasonably fast (< 2 seconds for typical dataset)

## Verification Checklist
- [ ] Admins can view dashboard overview
- [ ] Dashboard returns total users count
- [ ] Dashboard breaks down users by role (buyers, providers, admins)
- [ ] Dashboard returns total providers count
- [ ] Dashboard breaks down providers by provider_type
- [ ] Provider type breakdown sum equals total providers
- [ ] Dashboard returns total listings count
- [ ] Dashboard breaks down listings by status (active, inactive, sold)
- [ ] Listing status breakdown sum equals total listings
- [ ] Dashboard returns total inquiries count
- [ ] Dashboard breaks down inquiries by status (new, responded, closed)
- [ ] Inquiry status breakdown sum equals total inquiries
- [ ] Dashboard returns total active adverts count
- [ ] Active adverts count matches /api/adverts/active endpoint
- [ ] Dashboard returns today's visit count
- [ ] Dashboard returns this week's visit count
- [ ] Visit counts match analytics endpoints
- [ ] Dashboard includes generatedAt timestamp
- [ ] Non-admin users cannot access dashboard
- [ ] Dashboard handles empty database (returns zeros)
- [ ] Dashboard updates in real-time after data changes
- [ ] Response time is acceptable for admin dashboard use
