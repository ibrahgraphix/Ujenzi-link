# Step 5: Search & Location Filter - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Supabase database with listings, locations tables
- Sample listings and location data in database

## Test Cases

### 1. Search Listings by Keyword
```bash
curl -X GET "http://localhost:3001/api/search/listings?keyword=cement"
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
        "description": "High-quality cement for construction",
        "price": 15000,
        "status": "active",
        "categories": { "name": "Cement" },
        "locations": { "region": "Dar es Salaam", "district": "Ilala" },
        "provider_profiles": {
          "business_name": "Build Right Construction",
          "users": { "name": "Jane Smith" }
        },
        "listing_images": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### 2. Search Listings by Category
```bash
curl -X GET "http://localhost:3001/api/search/listings?categoryId=CATEGORY_ID"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [...],
    "pagination": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
  }
}
```

### 3. Search Listings by Region
```bash
curl -X GET "http://localhost:3001/api/search/listings?region=Dar%20es%20Salaam"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [...],
    "pagination": { "page": 1, "limit": 20, "total": 15, "totalPages": 1 }
  }
}
```

### 4. Search Listings by District
```bash
curl -X GET "http://localhost:3001/api/search/listings?district=Ilala"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [...],
    "pagination": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 }
  }
}
```

### 5. Search Listings by Price Range
```bash
curl -X GET "http://localhost:3001/api/search/listings?minPrice=10000&maxPrice=50000"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [...],
    "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
  }
}
```

### 6. Combined Search (Multiple Filters)
```bash
curl -X GET "http://localhost:3001/api/search/listings?keyword=steel&region=Dar%20es%20Salaam&minPrice=20000&maxPrice=30000"
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

### 7. Search with Pagination
```bash
curl -X GET "http://localhost:3001/api/search/listings?page=2&limit=10"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [...],
    "pagination": {
      "page": 2,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 8. Get All Regions
```bash
curl -X GET "http://localhost:3001/api/search/locations/regions"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "regions": [
      "Dar es Salaam",
      "Arusha",
      "Mwanza",
      "Dodoma"
    ]
  }
}
```

### 9. Get Districts by Region
```bash
curl -X GET "http://localhost:3001/api/search/locations/regions/Dar%20es%20Salaam/districts"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "districts": [
      "Ilala",
      "Kinondoni",
      "Temeke",
      "Ubungo"
    ]
  }
}
```

### 10. Get Wards by District
```bash
curl -X GET "http://localhost:3001/api/search/locations/regions/Dar%20es%20Salaam/districts/Ilala/wards"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "wards": [
      "Ilala Municipal",
      "Kariakoo",
      "Gerezani",
      "Mchikichini"
    ]
  }
}
```

### 11. Get Streets by Ward
```bash
curl -X GET "http://localhost:3001/api/search/locations/regions/Dar%20es%20Salaam/districts/Ilala/wards/Ilala%20Municipal/streets"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "streets": [
      "Morogoro Street",
      "Sokoine Drive",
      "Ohio Street"
    ]
  }
}
```

### 12. Get Full Location Hierarchy
```bash
curl -X GET "http://localhost:3001/api/search/locations/hierarchy"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "hierarchy": {
      "Dar es Salaam": {
        "Ilala": {
          "Ilala Municipal": ["Morogoro Street", "Sokoine Drive"],
          "Kariakoo": ["India Street", "Msimbazi Street"]
        },
        "Kinondoni": {
          "Masaki": ["Haile Selassie Road"],
          "Mlimani": ["University Road"]
        }
      },
      "Arusha": {
        "Arusha Urban": {
          "Central": ["Sokoine Road"]
        }
      }
    }
  }
}
```

### 13. Search with No Results
```bash
curl -X GET "http://localhost:3001/api/search/listings?keyword=nonexistent"
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

### 14. Search Invalid Region
```bash
curl -X GET "http://localhost:3001/api/search/locations/regions/InvalidRegion/districts"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "districts": []
  }
}
```

### 15. Test Invalid Price Range
```bash
curl -X GET "http://localhost:3001/api/search/listings?minPrice=invalid"
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Invalid price range parameters"
}
```

## Verification Checklist
- [ ] Keyword search matches title and description (case-insensitive)
- [ ] Category filter works correctly
- [ ] Region filter works correctly
- [ ] District filter works correctly
- [ ] Price range (min/max) filter works correctly
- [ ] Multiple filters can be combined
- [ ] Pagination works correctly
- [ ] Only active listings are returned
- [ ] Results are ordered by created_at (newest first)
- [ ] Regions endpoint returns unique regions
- [ ] Districts endpoint returns unique districts for a region
- [ ] Wards endpoint returns unique wards for a district
- [ ] Streets endpoint returns unique streets for a ward
- [ ] Full hierarchy endpoint returns nested structure
- [ ] Empty results return empty array with correct pagination
- [ ] Invalid parameters are handled gracefully
