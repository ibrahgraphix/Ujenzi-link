# Step 7.4: Adverts - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Admin user registered and logged in (get JWT token)
- Supabase database with adverts table

## Test Cases

### 1. Get Active Adverts (Public - for Homepage)
```bash
curl -X GET "http://localhost:3001/api/adverts/active"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "adverts": [
      {
        "id": "uuid",
        "title": "Special Offer: Cement at Discount",
        "image_url": "https://example.com/advert1.jpg",
        "link_url": "https://example.com/promo",
        "is_active": true,
        "starts_at": "2024-01-01T00:00:00.000Z",
        "ends_at": "2024-12-31T23:59:59.000Z",
        "provider_id": "provider_uuid",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Note:** Only returns adverts where:
- is_active = true
- starts_at <= current time
- ends_at >= current time

### 2. Create Advert (Admin Only)
```bash
curl -X POST "http://localhost:3001/api/adverts" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Construction Sale",
    "imageUrl": "https://example.com/summer-sale.jpg",
    "linkUrl": "https://example.com/summer-promo",
    "isActive": true,
    "startsAt": "2024-06-01T00:00:00.000Z",
    "endsAt": "2024-08-31T23:59:59.000Z",
    "providerId": "PROVIDER_ID"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Advert created successfully",
  "data": {
    "advert": {
      "id": "new_uuid",
      "title": "Summer Construction Sale",
      "image_url": "https://example.com/summer-sale.jpg",
      "link_url": "https://example.com/summer-promo",
      "is_active": true,
      "starts_at": "2024-06-01T00:00:00.000Z",
      "ends_at": "2024-08-31T23:59:59.000Z",
      "provider_id": "provider_uuid",
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

**Verification:** Check admin_logs table for new entry:
```sql
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 1;
```
Should show: action='create_advert', target_table='adverts', target_id='new_uuid', details='Created advert: Summer Construction Sale'

### 3. Get All Adverts (Admin Only)
```bash
curl -X GET "http://localhost:3001/api/adverts" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "adverts": [
      {
        "id": "uuid",
        "title": "Special Offer: Cement at Discount",
        "image_url": "https://example.com/advert1.jpg",
        "link_url": "https://example.com/promo",
        "is_active": true,
        "starts_at": "2024-01-01T00:00:00.000Z",
        "ends_at": "2024-12-31T23:59:59.000Z",
        "provider_id": "provider_uuid",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
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

### 4. Filter Adverts by Active Status
```bash
curl -X GET "http://localhost:3001/api/adverts?isActive=true" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "adverts": [...],
    "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
  }
}
```

### 5. Filter Adverts by Provider
```bash
curl -X GET "http://localhost:3001/api/adverts?providerId=PROVIDER_ID" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "adverts": [...],
    "pagination": { "page": 1, "limit": 20, "total": 2, "totalPages": 1 }
  }
}
```

### 6. Update Advert (Admin Only)
```bash
curl -X PUT "http://localhost:3001/api/adverts/ADVERT_ID" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Construction Sale (Updated)",
    "isActive": false,
    "endsAt": "2024-09-30T23:59:59.000Z"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Advert updated successfully",
  "data": {
    "advert": {
      "id": "uuid",
      "title": "Summer Construction Sale (Updated)",
      "is_active": false,
      "ends_at": "2024-09-30T23:59:59.000Z",
      "updated_at": "2024-01-01T13:00:00.000Z"
    }
  }
}
```

**Verification:** Check admin_logs table for new entry with action='update_advert'

### 7. Delete Advert (Admin Only)
```bash
curl -X DELETE "http://localhost:3001/api/adverts/ADVERT_ID" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Advert deleted successfully"
}
```

**Verification:** Check admin_logs table for new entry with action='delete_advert'

### 8. Test Expired Advert Not Returned in Active List
```bash
# Create an advert with past end date
curl -X POST "http://localhost:3001/api/adverts" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Expired Advert",
    "imageUrl": "https://example.com/expired.jpg",
    "linkUrl": "https://example.com/expired",
    "isActive": true,
    "startsAt": "2023-01-01T00:00:00.000Z",
    "endsAt": "2023-12-31T23:59:59.000Z"
  }'

# Check active adverts - should NOT include expired advert
curl -X GET "http://localhost:3001/api/adverts/active"
```

**Expected Response:** Should NOT include the expired advert

### 9. Test Future Advert Not Returned in Active List
```bash
# Create an advert with future start date
curl -X POST "http://localhost:3001/api/adverts" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Future Advert",
    "imageUrl": "https://example.com/future.jpg",
    "linkUrl": "https://example.com/future",
    "isActive": true,
    "startsAt": "2025-01-01T00:00:00.000Z",
    "endsAt": "2025-12-31T23:59:59.000Z"
  }'

# Check active adverts - should NOT include future advert
curl -X GET "http://localhost:3001/api/adverts/active"
```

**Expected Response:** Should NOT include the future advert

### 10. Test Inactive Advert Not Returned in Active List
```bash
# Create an inactive advert
curl -X POST "http://localhost:3001/api/adverts" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inactive Advert",
    "imageUrl": "https://example.com/inactive.jpg",
    "linkUrl": "https://example.com/inactive",
    "isActive": false,
    "startsAt": "2024-01-01T00:00:00.000Z",
    "endsAt": "2024-12-31T23:59:59.000Z"
  }'

# Check active adverts - should NOT include inactive advert
curl -X GET "http://localhost:3001/api/adverts/active"
```

**Expected Response:** Should NOT include the inactive advert

### 11. Test Unauthorized Access (Non-Admin Creating Advert)
```bash
curl -X POST "http://localhost:3001/api/adverts" \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Advert",
    "imageUrl": "https://example.com/unauth.jpg",
    "linkUrl": "https://example.com/unauth",
    "isActive": true,
    "startsAt": "2024-01-01T00:00:00.000Z",
    "endsAt": "2024-12-31T23:59:59.000Z"
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Only admins can create adverts"
}
```

### 12. Test Missing Required Fields
```bash
curl -X POST "http://localhost:3001/api/adverts" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Incomplete Advert"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Missing required fields: title, imageUrl, linkUrl, startsAt, endsAt"
}
```

### 13. Test Non-Existent Advert Update
```bash
curl -X PUT "http://localhost:3001/api/adverts/non-existent-id" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Failed to update advert"
}
```

### 14. Test Non-Existent Advert Delete
```bash
curl -X DELETE "http://localhost:3001/api/adverts/non-existent-id" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Advert not found"
}
```

### 15. Test Pagination
```bash
curl -X GET "http://localhost:3001/api/adverts?page=2&limit=5" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "adverts": [...],
    "pagination": {
      "page": 2,
      "limit": 5,
      "total": 15,
      "totalPages": 3
    }
  }
}
```

## Verification Checklist
- [ ] Public users can get active adverts for homepage
- [ ] Active adverts respect is_active flag
- [ ] Active adverts respect starts_at date (future adverts not shown)
- [ ] Active adverts respect ends_at date (expired adverts not shown)
- [ ] Admins can create adverts with all fields
- [ ] Admins can create adverts without provider_id (optional)
- [ ] Admins can view all adverts with pagination
- [ ] Adverts can be filtered by is_active status
- [ ] Adverts can be filtered by provider_id
- [ ] Admins can update advert details
- [ ] Admins can delete adverts
- [ ] Create action is logged to admin_logs
- [ ] Update action is logged to admin_logs
- [ ] Delete action is logged to admin_logs
- [ ] Non-admin users cannot create/edit/delete adverts
- [ ] Non-admin users cannot view all adverts
- [ ] Missing required fields are rejected
- [ ] Non-existent advert IDs are handled gracefully
- [ ] Pagination works correctly
