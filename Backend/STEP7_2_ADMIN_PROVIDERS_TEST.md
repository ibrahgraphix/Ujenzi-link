# Step 7.2: Admin - Manage Providers - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Admin user registered and logged in (get JWT token)
- Supabase database with provider_profiles, users, locations, listings tables

## Test Cases

### 1. Get All Providers with Listing Counts (Admin Only)
```bash
curl -X GET "http://localhost:3001/api/admin/providers" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "providers": [
      {
        "id": "uuid",
        "user_id": "user_uuid",
        "provider_type": "contractor",
        "business_name": "Build Right Construction",
        "description": "Professional construction services",
        "location_id": "location_uuid",
        "is_verified": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "users": {
          "id": "user_uuid",
          "email": "provider@example.com",
          "name": "Jane Smith",
          "phone": "+255700000002"
        },
        "locations": {
          "id": "location_uuid",
          "country": "Tanzania",
          "region": "Dar es Salaam",
          "district": "Ilala"
        },
        "listings": [
          {
            "count": 5
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 2. Filter Providers by Type
```bash
curl -X GET "http://localhost:3001/api/admin/providers?providerType=contractor" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "providers": [
      {
        "id": "uuid",
        "provider_type": "contractor",
        "business_name": "Build Right Construction",
        "listings": [{ "count": 5 }]
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
}
```

### 3. Filter Providers by Verification Status
```bash
curl -X GET "http://localhost:3001/api/admin/providers?isVerified=true" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "providers": [...],
    "pagination": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
  }
}
```

### 4. Search Providers by Business Name
```bash
curl -X GET "http://localhost:3001/api/admin/providers?search=Build" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "providers": [
      {
        "business_name": "Build Right Construction",
        "provider_type": "contractor"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
}
```

### 5. Search Providers by User Name
```bash
curl -X GET "http://localhost:3001/api/admin/providers?search=Jane" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "providers": [
      {
        "users": { "name": "Jane Smith" }
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
}
```

### 6. Combined Filters (Type + Verification + Search + Pagination)
```bash
curl -X GET "http://localhost:3001/api/admin/providers?providerType=contractor&isVerified=false&search=Construction&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "providers": [...],
    "pagination": { "page": 1, "limit": 10, "total": 2, "totalPages": 1 }
  }
}
```

### 7. Get Provider Full Profile with All Listings
```bash
curl -X GET "http://localhost:3001/api/admin/providers/PROVIDER_ID/full-profile" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "provider": {
      "id": "uuid",
      "user_id": "user_uuid",
      "provider_type": "contractor",
      "business_name": "Build Right Construction",
      "description": "Professional construction services",
      "location_id": "location_uuid",
      "is_verified": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "users": {
        "id": "user_uuid",
        "email": "provider@example.com",
        "name": "Jane Smith",
        "phone": "+255700000002"
      },
      "locations": {
        "id": "location_uuid",
        "country": "Tanzania",
        "region": "Dar es Salaam",
        "district": "Ilala"
      },
      "buyer_profiles": null
    },
    "listings": [
      {
        "id": "listing_uuid",
        "provider_id": "provider_uuid",
        "category_id": "category_uuid",
        "title": "Premium Cement 50kg",
        "description": "High-quality cement for construction",
        "price": 15000,
        "unit": "bag",
        "location_id": "location_uuid",
        "status": "active",
        "admin_created": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "categories": {
          "id": "category_uuid",
          "name": "Cement"
        },
        "locations": {
          "id": "location_uuid",
          "region": "Dar es Salaam",
          "district": "Ilala"
        },
        "listing_images": []
      }
    ],
    "stats": {
      "totalListings": 5,
      "activeListings": 4,
      "inactiveListings": 1
    }
  }
}
```

### 8. Test Unauthorized Access (Non-Admin)
```bash
curl -X GET "http://localhost:3001/api/admin/providers" \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Only admins can view all providers"
}
```

### 9. Test Non-Existent Provider
```bash
curl -X GET "http://localhost:3001/api/admin/providers/non-existent-id/full-profile" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Provider not found"
}
```

### 10. Test Pagination
```bash
curl -X GET "http://localhost:3001/api/admin/providers?page=2&limit=5" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "providers": [...],
    "pagination": {
      "page": 2,
      "limit": 5,
      "total": 15,
      "totalPages": 3
    }
  }
}
```

### 11. Test Empty Search Results
```bash
curl -X GET "http://localhost:3001/api/admin/providers?search=nonexistent" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "providers": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

### 12. Test Provider with No Listings
```bash
curl -X GET "http://localhost:3001/api/admin/providers/NEW_PROVIDER_ID/full-profile" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "provider": { ... },
    "listings": [],
    "stats": {
      "totalListings": 0,
      "activeListings": 0,
      "inactiveListings": 0
    }
  }
}
```

## Verification Checklist
- [ ] Admins can view all providers with listing counts
- [ ] Providers can be filtered by provider_type
- [ ] Providers can be filtered by verification status (is_verified)
- [ ] Search works on business_name, user name, and user email
- [ ] Search is case-insensitive
- [ ] Multiple filters can be combined
- [ ] Pagination works correctly
- [ ] Admins can view single provider's full profile
- [ ] Full profile includes user details and location
- [ ] Full profile includes all listings with categories and images
- [ ] Full profile includes listing statistics (total, active, inactive)
- [ ] Non-admin users cannot access provider management
- [ ] Non-existent provider IDs are handled gracefully
- [ ] Empty search results return empty array with correct pagination
- [ ] Providers with no listings return correct stats (all zeros)
