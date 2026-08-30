# Step 3: Categories Module - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Admin user registered and logged in (get JWT token)
- Supabase database with categories table

## Test Cases

### 1. Get All Categories (Public)
```bash
curl -X GET http://localhost:3001/api/categories
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Building Materials",
        "description": "Raw materials for construction",
        "parent_id": null,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 2. Get Categories with Hierarchy (Public)
```bash
curl -X GET http://localhost:3001/api/categories/hierarchy
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Building Materials",
        "description": "Raw materials for construction",
        "parent_id": null,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "subcategories": [
          {
            "id": "uuid2",
            "name": "Cement",
            "description": "Various cement types",
            "parent_id": "uuid",
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

### 3. Get Single Category by ID (Public)
```bash
curl -X GET http://localhost:3001/api/categories/CATEGORY_ID
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "category": {
      "id": "uuid",
      "name": "Cement",
      "description": "Various cement types",
      "parent_id": "parent_uuid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Create Category (Admin Only)
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Steel Products",
    "description": "Steel bars, rods, and construction steel"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": "new_uuid",
      "name": "Steel Products",
      "description": "Steel bars, rods, and construction steel",
      "parent_id": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 5. Create Subcategory (Admin Only)
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Steel Bars",
    "description": "Reinforcement steel bars",
    "parentId": "PARENT_CATEGORY_ID"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": "new_uuid",
      "name": "Steel Bars",
      "description": "Reinforcement steel bars",
      "parent_id": "parent_uuid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 6. Update Category (Admin Only)
```bash
curl -X PUT http://localhost:3001/api/categories/CATEGORY_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Steel Products (Updated)",
    "description": "Updated description"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": "uuid",
      "name": "Steel Products (Updated)",
      "description": "Updated description",
      "parent_id": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### 7. Delete Category (Admin Only)
```bash
curl -X DELETE http://localhost:3001/api/categories/CATEGORY_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Category deleted successfully"
}
```

### 8. Test Unauthorized Access (Non-Admin)
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Category"
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

### 9. Test Missing Required Fields
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Category without name"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Category name is required"
}
```

### 10. Test Non-Existent Category
```bash
curl -X GET http://localhost:3001/api/categories/non-existent-id
```

**Expected Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Category not found"
}
```

## Verification Checklist
- [ ] Public users can view all categories
- [ ] Public users can view category hierarchy
- [ ] Public users can view single category by ID
- [ ] Admin can create parent categories
- [ ] Admin can create subcategories with parentId
- [ ] Admin can update category details
- [ ] Admin can delete categories
- [ ] Non-admin users cannot create/edit/delete categories
- [ ] Hierarchy structure correctly nests subcategories
- [ ] Required field validation works
