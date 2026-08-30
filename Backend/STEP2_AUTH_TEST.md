# Step 2: Auth Module - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Supabase database with required tables
- `.env` file configured with Supabase credentials

## Test Cases

### 1. Register as Buyer
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "+255700000001",
    "role": "buyer",
    "buyerType": "developer"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "buyer@example.com",
      "name": "John Doe",
      "phone": "+255700000001",
      "role": "buyer"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Register as Provider
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@example.com",
    "password": "password123",
    "name": "Jane Smith",
    "phone": "+255700000002",
    "role": "provider",
    "providerType": "contractor",
    "businessName": "Build Right Construction",
    "description": "Professional construction services",
    "locationId": "location_uuid"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "provider@example.com",
      "name": "Jane Smith",
      "phone": "+255700000002",
      "role": "provider"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "buyer@example.com",
      "name": "John Doe",
      "phone": "+255700000001",
      "role": "buyer"
    },
    "token": "jwt_token_here"
  }
}
```

### 4. Test Auth Middleware (Protected Route)
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "user": {
    "userId": "uuid",
    "email": "buyer@example.com",
    "role": "buyer"
  }
}
```

### 5. Test Role Guard (Admin Only)
```bash
curl -X GET http://localhost:3001/api/auth/admin-only \
  -H "Authorization: Bearer BUYER_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

### 6. Test Invalid Credentials
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

### 7. Test Duplicate Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "+255700000001",
    "role": "buyer",
    "buyerType": "developer"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "User with this email already exists"
}
```

## Verification Checklist
- [ ] Buyer registration creates user + buyer_profile
- [ ] Provider registration creates user + provider_profile
- [ ] Login returns valid JWT token
- [ ] JWT token contains userId, email, role
- [ ] Auth middleware validates tokens correctly
- [ ] Role guard restricts access by role
- [ ] Passwords are hashed before storage
- [ ] Duplicate emails are rejected
