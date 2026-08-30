# Step 7.3: Admin - Manage Listings - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Admin user registered and logged in (get JWT token)
- Supabase database with listings, categories, provider_profiles, users tables

## Test Cases

### 1. Get All Listings Across All Providers (Admin Only)
```bash
curl -X GET "http://localhost:3001/api/admin/listings" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "id": "uuid",
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
          "country": "Tanzania",
          "region": "Dar es Salaam",
          "district": "Ilala"
        },
        "provider_profiles": {
          "id": "provider_uuid",
          "business_name": "Build Right Construction",
          "users": {
            "id": "user_uuid",
            "name": "Jane Smith",
            "email": "provider@example.com"
          }
        },
        "listing_images": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

### 2. Filter Listings by Status
```bash
curl -X GET "http://localhost:3001/api/admin/listings?status=active" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "id": "uuid",
        "title": "Premium Cement 50kg",
        "status": "active"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 }
  }
}
```

### 3. Filter Listings by Category
```bash
curl -X GET "http://localhost:3001/api/admin/listings?categoryId=CATEGORY_ID" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [...],
    "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
  }
}
```

### 4. Filter Listings by Provider
```bash
curl -X GET "http://localhost:3001/api/admin/listings?providerId=PROVIDER_ID" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [...],
    "pagination": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
  }
}
```

### 5. Filter Listings by admin_created
```bash
curl -X GET "http://localhost:3001/api/admin/listings?adminCreated=true" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "id": "uuid",
        "title": "Construction Sand",
        "admin_created": true
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 2, "totalPages": 1 }
  }
}
```

### 6. Combined Filters (Status + Category + Provider + admin_created + Pagination)
```bash
curl -X GET "http://localhost:3001/api/admin/listings?status=active&categoryId=CATEGORY_ID&providerId=PROVIDER_ID&adminCreated=false&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [...],
    "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
}
```

### 7. Change Listing Status to Inactive
```bash
curl -X PUT "http://localhost:3001/api/admin/listings/LISTING_ID/status" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Listing status updated successfully",
  "data": {
    "listing": {
      "id": "uuid",
      "title": "Premium Cement 50kg",
      "status": "inactive",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

**Verification:** Check admin_logs table for new entry:
```sql
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 1;
```
Should show: action='change_listing_status', target_table='listings', target_id='LISTING_ID', details='Changed status to inactive'

### 8. Change Listing Status to Active
```bash
curl -X PUT "http://localhost:3001/api/admin/listings/LISTING_ID/status" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Listing status updated successfully",
  "data": {
    "listing": {
      "id": "uuid",
      "status": "active",
      "updated_at": "2024-01-01T13:00:00.000Z"
    }
  }
}
```

**Verification:** Check admin_logs table for new entry with details='Changed status to active'

### 9. Change Listing Status to Sold
```bash
curl -X PUT "http://localhost:3001/api/admin/listings/LISTING_ID/status" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "sold"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Listing status updated successfully",
  "data": {
    "listing": {
      "id": "uuid",
      "status": "sold",
      "updated_at": "2024-01-01T14:00:00.000Z"
    }
  }
}
```

### 10. Test Unauthorized Access (Non-Admin)
```bash
curl -X GET "http://localhost:3001/api/admin/listings" \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Only admins can view all listings"
}
```

### 11. Test Non-Existent Listing Status Change
```bash
curl -X PUT "http://localhost:3001/api/admin/listings/non-existent-id/status" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Listing not found"
}
```

### 12. Test Invalid Status Value
```bash
curl -X PUT "http://localhost:3001/api/admin/listings/LISTING_ID/status" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "invalid_status"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Invalid status value"
}
```

### 13. Test Pagination
```bash
curl -X GET "http://localhost:3001/api/admin/listings?page=2&limit=5" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [...],
    "pagination": {
      "page": 2,
      "limit": 5,
      "total": 25,
      "totalPages": 5
    }
  }
}
```

### 14. Test Empty Filter Results
```bash
curl -X GET "http://localhost:3001/api/admin/listings?status=sold" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

## Verification Checklist
- [ ] Admins can view ALL listings across all providers
- [ ] Listings can be filtered by status (active/inactive/sold)
- [ ] Listings can be filtered by category
- [ ] Listings can be filtered by provider
- [ ] Listings can be filtered by admin_created flag
- [ ] Multiple filters can be combined
- [ ] Pagination works correctly
- [ ] Admins can change listing status
- [ ] Status can be changed to active, inactive, or sold
- [ ] Status change action is logged to admin_logs
- [ ] Non-admin users cannot access admin listing management
- [ ] Non-existent listing IDs are handled gracefully
- [ ] Invalid status values are rejected
- [ ] Empty filter results return empty array with correct pagination
