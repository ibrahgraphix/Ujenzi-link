# Step 4: Listings Module - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Provider user registered and logged in (get JWT token)
- Admin user registered and logged in (get JWT token)
- Supabase database with listings, listing_images, provider_profiles, categories, locations tables
- At least one category and location in the database

## Test Cases

### 1. Get Single Listing by ID (Public)
```bash
curl -X GET http://localhost:3001/api/listings/LISTING_ID
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listing": {
      "id": "uuid",
      "provider_id": "provider_uuid",
      "category_id": "category_uuid",
      "title": "Premium Cement 50kg",
      "description": "High-quality cement for construction",
      "price": 15000,
      "unit": "bag",
      "location_id": "location_uuid",
      "status": "active",
      "admin_created": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "categories": {
        "id": "category_uuid",
        "name": "Cement",
        "description": "Various cement types"
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
        "description": "Professional construction services",
        "users": {
          "id": "user_uuid",
          "name": "Jane Smith",
          "email": "provider@example.com",
          "phone": "+255700000002"
        }
      },
      "listing_images": [
        {
          "id": "image_uuid",
          "listing_id": "uuid",
          "image_url": "https://example.com/image.jpg",
          "display_order": 1
        }
      ]
    }
  }
}
```

### 2. Create Listing as Provider
```bash
curl -X POST http://localhost:3001/api/listings \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "CATEGORY_ID",
    "title": "Steel Bars 12mm",
    "description": "High-strength reinforcement steel bars",
    "price": 25000,
    "unit": "piece",
    "locationId": "LOCATION_ID",
    "imageUrls": ["https://example.com/steel1.jpg", "https://example.com/steel2.jpg"]
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Listing created successfully",
  "data": {
    "listing": {
      "id": "new_uuid",
      "provider_id": "provider_uuid",
      "category_id": "category_uuid",
      "title": "Steel Bars 12mm",
      "description": "High-strength reinforcement steel bars",
      "price": 25000,
      "unit": "piece",
      "location_id": "location_uuid",
      "status": "active",
      "admin_created": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Create Listing as Admin (on behalf of provider)
```bash
curl -X POST http://localhost:3001/api/listings \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "PROVIDER_ID",
    "categoryId": "CATEGORY_ID",
    "title": "Construction Sand",
    "description": "River sand for construction",
    "price": 5000,
    "unit": "cubic_meter",
    "locationId": "LOCATION_ID"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Listing created successfully",
  "data": {
    "listing": {
      "id": "new_uuid",
      "provider_id": "provider_uuid",
      "category_id": "category_uuid",
      "title": "Construction Sand",
      "description": "River sand for construction",
      "price": 5000,
      "unit": "cubic_meter",
      "location_id": "location_uuid",
      "status": "active",
      "admin_created": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Update Listing as Provider (own listing)
```bash
curl -X PUT http://localhost:3001/api/listings/LISTING_ID \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Steel Bars 12mm (Updated)",
    "price": 26000,
    "status": "active"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Listing updated successfully",
  "data": {
    "listing": {
      "id": "uuid",
      "provider_id": "provider_uuid",
      "category_id": "category_uuid",
      "title": "Steel Bars 12mm (Updated)",
      "description": "High-strength reinforcement steel bars",
      "price": 26000,
      "unit": "piece",
      "location_id": "location_uuid",
      "status": "active",
      "admin_created": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### 5. Update Listing as Admin (any listing)
```bash
curl -X PUT http://localhost:3001/api/listings/LISTING_ID \
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
  "message": "Listing updated successfully",
  "data": {
    "listing": {
      "id": "uuid",
      "provider_id": "provider_uuid",
      "status": "inactive",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### 6. Delete Listing as Provider (own listing)
```bash
curl -X DELETE http://localhost:3001/api/listings/LISTING_ID \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Listing deleted successfully"
}
```

### 7. Delete Listing as Admin (any listing)
```bash
curl -X DELETE http://localhost:3001/api/listings/LISTING_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Listing deleted successfully"
}
```

### 8. Get Provider Listings (as provider)
```bash
curl -X GET http://localhost:3001/api/listings/provider/PROVIDER_ID \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "id": "uuid",
        "title": "Steel Bars 12mm",
        "price": 25000,
        "status": "active",
        "categories": { "name": "Steel Products" },
        "locations": { "region": "Dar es Salaam" },
        "listing_images": []
      }
    ]
  }
}
```

### 9. Get Provider Listings (as admin)
```bash
curl -X GET http://localhost:3001/api/listings/provider/PROVIDER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [...]
  }
}
```

### 10. Test Unauthorized Access (buyer trying to create listing)
```bash
curl -X POST http://localhost:3001/api/listings \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "CATEGORY_ID",
    "title": "Unauthorized Listing",
    "description": "Test",
    "price": 1000,
    "locationId": "LOCATION_ID"
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Only providers and admins can create listings"
}
```

### 11. Test Provider Editing Another Provider's Listing
```bash
curl -X PUT http://localhost:3001/api/listings/OTHER_PROVIDER_LISTING_ID \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hacked Listing"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "You can only edit your own listings"
}
```

### 12. Test Missing Required Fields
```bash
curl -X POST http://localhost:3001/api/listings \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Incomplete Listing"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Missing required fields: categoryId, title, description, price, locationId"
}
```

### 13. Test Non-Existent Listing
```bash
curl -X GET http://localhost:3001/api/listings/non-existent-id
```

**Expected Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Listing not found"
}
```

## Verification Checklist
- [ ] Public users can view single listing with full details
- [ ] Providers can create listings for themselves
- [ ] Admins can create listings for any provider
- [ ] Admin-created listings have admin_created = true
- [ ] New listings default to status = 'active'
- [ ] Providers can only edit their own listings
- [ ] Admins can edit any listing
- [ ] Providers can only delete their own listings
- [ ] Admins can delete any listing
- [ ] Listing images are properly associated
- [ ] Buyers cannot create/edit/delete listings
- [ ] Provider listings include category, location, and image data
- [ ] Required field validation works
