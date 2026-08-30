# Step 7.1: Admin - Manage Users - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Admin user registered and logged in (get JWT token)
- Supabase database with users table (including is_active column)

## Test Cases

### 1. Get All Users (Admin Only)
```bash
curl -X GET "http://localhost:3001/api/admin/users" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "buyer@example.com",
        "name": "John Doe",
        "phone": "+255700000001",
        "role": "buyer",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "uuid2",
        "email": "provider@example.com",
        "name": "Jane Smith",
        "phone": "+255700000002",
        "role": "provider",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

### 2. Filter Users by Role
```bash
curl -X GET "http://localhost:3001/api/admin/users?role=buyer" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "buyer@example.com",
        "name": "John Doe",
        "role": "buyer",
        "is_active": true
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
}
```

### 3. Search Users by Name
```bash
curl -X GET "http://localhost:3001/api/admin/users?search=John" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "buyer@example.com",
        "name": "John Doe",
        "role": "buyer",
        "is_active": true
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
}
```

### 4. Search Users by Email
```bash
curl -X GET "http://localhost:3001/api/admin/users?search=provider@example.com" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "uuid2",
        "email": "provider@example.com",
        "name": "Jane Smith",
        "role": "provider",
        "is_active": true
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
}
```

### 5. Search Users by Phone
```bash
curl -X GET "http://localhost:3001/api/admin/users?search=+255700000001" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "buyer@example.com",
        "name": "John Doe",
        "phone": "+255700000001",
        "role": "buyer",
        "is_active": true
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
}
```

### 6. Combined Filters (Role + Search + Pagination)
```bash
curl -X GET "http://localhost:3001/api/admin/users?role=provider&search=Jane&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "users": [...],
    "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
}
```

### 7. Deactivate User
```bash
curl -X PUT "http://localhost:3001/api/admin/users/USER_ID/deactivate" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "User deactivated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "buyer@example.com",
      "name": "John Doe",
      "is_active": false,
      "updated_at": "2024-2024-01-01T12:00:00.000Z"
    }
  }
}
```

**Verification:** Check admin_logs table for new entry:
```sql
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 1;
```
Should show: action='deactivate_user', target_table='users', target_id='USER_ID'

### 8. Reactivate User
```bash
curl -X PUT "http://localhost:3001/api/admin/users/USER_ID/reactivate" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "User reactivated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "buyer@example.com",
      "name": "John Doe",
      "is_active": true,
      "updated_at": "2024-01-01T13:00:00.000Z"
    }
  }
}
```

**Verification:** Check admin_logs table for new entry with action='reactivate_user'

### 9. Test Unauthorized Access (Non-Admin)
```bash
curl -X GET "http://localhost:3001/api/admin/users" \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Only admins can view all users"
}
```

### 10. Test Non-Existent User Deactivation
```bash
curl -X PUT "http://localhost:3001/api/admin/users/non-existent-id/deactivate" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "User not found"
}
```

### 11. Test Pagination
```bash
curl -X GET "http://localhost:3001/api/admin/users?page=2&limit=5" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "users": [...],
    "pagination": {
      "page": 2,
      "limit": 5,
      "total": 25,
      "totalPages": 5
    }
  }
}
```

### 12. Test Empty Search Results
```bash
curl -X GET "http://localhost:3001/api/admin/users?search=nonexistent" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "users": [],
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
- [ ] Admins can view all users
- [ ] Users can be filtered by role (buyer/provider/admin)
- [ ] Search works on name, email, and phone fields
- [ ] Search is case-insensitive
- [ ] Multiple filters can be combined
- [ ] Pagination works correctly
- [ ] Admins can deactivate users (sets is_active = false)
- [ ] Admins can reactivate users (sets is_active = true)
- [ ] Deactivate action is logged to admin_logs
- [ ] Reactivate action is logged to admin_logs
- [ ] Non-admin users cannot access user management
- [ ] Non-existent user IDs are handled gracefully
- [ ] Empty search results return empty array with correct pagination
