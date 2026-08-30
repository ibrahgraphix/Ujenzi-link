# Step 6: Inquiries Module - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Buyer user registered and logged in (get JWT token)
- Provider user registered and logged in (get JWT token)
- Supabase database with inquiries, listings, provider_profiles, buyer_profiles tables
- At least one active listing in the database

## Test Cases

### 1. Submit Inquiry as Buyer
```bash
curl -X POST http://localhost:3001/api/inquiries \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "LISTING_ID",
    "providerId": "PROVIDER_ID",
    "message": "I am interested in this listing. Please provide more details about availability and delivery options."
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Inquiry submitted successfully",
  "data": {
    "inquiry": {
      "id": "new_uuid",
      "buyer_id": "buyer_uuid",
      "provider_id": "provider_uuid",
      "listing_id": "listing_uuid",
      "message": "I am interested in this listing. Please provide more details about availability and delivery options.",
      "status": "new",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "listings": {
        "id": "listing_uuid",
        "title": "Premium Cement 50kg",
        "price": 15000
      },
      "provider_profiles": {
        "business_name": "Build Right Construction",
        "users": {
          "name": "Jane Smith",
          "email": "provider@example.com"
        }
      },
      "buyer_profiles": {
        "buyer_type": "developer",
        "users": {
          "name": "John Doe",
          "email": "buyer@example.com"
        }
      }
    }
  }
}
```

### 2. Get Provider's Received Inquiries
```bash
curl -X GET "http://localhost:3001/api/inquiries/received" \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "inquiries": [
      {
        "id": "uuid",
        "buyer_id": "buyer_uuid",
        "provider_id": "provider_uuid",
        "listing_id": "listing_uuid",
        "message": "I am interested in this listing...",
        "status": "new",
        "created_at": "2024-01-01T00:00:00.000Z",
        "listings": {
          "id": "listing_uuid",
          "title": "Premium Cement 50kg"
        },
        "buyer_profiles": {
          "users": {
            "name": "John Doe",
            "email": "buyer@example.com",
            "phone": "+255700000001"
          }
        }
      }
    ]
  }
}
```

### 3. Get Provider's Received Inquiries with Filters
```bash
curl -X GET "http://localhost:3001/api/inquiries/received?status=new&listingId=LISTING_ID" \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "inquiries": [...]
  }
}
```

### 4. Get Buyer's Sent Inquiries
```bash
curl -X GET "http://localhost:3001/api/inquiries/my-inquiries" \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "inquiries": [
      {
        "id": "uuid",
        "buyer_id": "buyer_uuid",
        "provider_id": "provider_uuid",
        "listing_id": "listing_uuid",
        "message": "I am interested in this listing...",
        "status": "responded",
        "created_at": "2024-01-01T00:00:00.000Z",
        "listings": {
          "id": "listing_uuid",
          "title": "Premium Cement 50kg"
        },
        "provider_profiles": {
          "business_name": "Build Right Construction",
          "users": {
            "name": "Jane Smith",
            "email": "provider@example.com"
          }
        }
      }
    ]
  }
}
```

### 5. Update Inquiry Status (Provider)
```bash
curl -X PUT http://localhost:3001/api/inquiries/INQUIRY_ID/status \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "responded"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Inquiry status updated successfully",
  "data": {
    "inquiry": {
      "id": "uuid",
      "status": "responded",
      "updated_at": "2024-01-01T12:00:00.000Z",
      "listings": { "title": "Premium Cement 50kg" },
      "buyer_profiles": {
        "users": { "name": "John Doe", "email": "buyer@example.com" }
      }
    }
  }
}
```

### 6. Get Single Inquiry by ID (Buyer)
```bash
curl -X GET http://localhost:3001/api/inquiries/INQUIRY_ID \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "inquiry": {
      "id": "uuid",
      "buyer_id": "buyer_uuid",
      "provider_id": "provider_uuid",
      "listing_id": "listing_uuid",
      "message": "I am interested in this listing...",
      "status": "responded",
      "created_at": "2024-01-01T00:00:00.000Z",
      "listings": { "title": "Premium Cement 50kg" },
      "provider_profiles": {
        "business_name": "Build Right Construction",
        "users": { "name": "Jane Smith" }
      },
      "buyer_profiles": {
        "buyer_type": "developer",
        "users": { "name": "John Doe" }
      }
    }
  }
}
```

### 7. Get Single Inquiry by ID (Provider)
```bash
curl -X GET http://localhost:3001/api/inquiries/INQUIRY_ID \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "inquiry": {...}
  }
}
```

### 8. Delete Inquiry (Buyer)
```bash
curl -X DELETE http://localhost:3001/api/inquiries/INQUIRY_ID \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Inquiry deleted successfully"
}
```

### 9. Delete Inquiry (Provider)
```bash
curl -X DELETE http://localhost:3001/api/inquiries/INQUIRY_ID \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Inquiry deleted successfully"
}
```

### 10. Test Unauthorized Access (Provider trying to submit inquiry)
```bash
curl -X POST http://localhost:3001/api/inquiries \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "LISTING_ID",
    "providerId": "PROVIDER_ID",
    "message": "Test message"
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Only buyers can submit inquiries"
}
```

### 11. Test Provider Updating Another Provider's Inquiry
```bash
curl -X PUT http://localhost:3001/api/inquiries/OTHER_PROVIDER_INQUIRY_ID/status \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "responded"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "You can only update inquiries for your listings"
}
```

### 12. Test Buyer Viewing Another Buyer's Inquiry
```bash
curl -X GET http://localhost:3001/api/inquiries/OTHER_BUYER_INQUIRY_ID \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "You can only view your own inquiries"
}
```

### 13. Test Inquiry on Inactive Listing
```bash
curl -X POST http://localhost:3001/api/inquiries \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "INACTIVE_LISTING_ID",
    "providerId": "PROVIDER_ID",
    "message": "Test message"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Cannot inquire on inactive listings"
}
```

### 14. Test Invalid Status Update
```bash
curl -X PUT http://localhost:3001/api/inquiries/INQUIRY_ID/status \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN" \
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

### 15. Test Missing Required Fields
```bash
curl -X POST http://localhost:3001/api/inquiries \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test message"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Missing required fields: listingId, providerId, message"
}
```

### 16. Test Non-Existent Inquiry
```bash
curl -X GET http://localhost:3001/api/inquiries/non-existent-id \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Inquiry not found"
}
```

## Verification Checklist
- [ ] Buyers can submit inquiries on active listings
- [ ] New inquiries default to status = 'new'
- [ ] Providers can view all inquiries received on their listings
- [ ] Providers can filter inquiries by status and listing
- [ ] Buyers can view their sent inquiries
- [ ] Providers can update inquiry status (new/responded/closed)
- [ ] Buyers can delete their own inquiries
- [ ] Providers can delete inquiries for their listings
- [ ] Buyers can only view their own inquiries
- [ ] Providers can only view inquiries for their listings
- [ ] Providers can only update inquiries for their listings
- [ ] Inquiries cannot be created on inactive listings
- [ ] Inquiry includes listing, provider, and buyer details
- [ ] Required field validation works
- [ ] Invalid status values are rejected
