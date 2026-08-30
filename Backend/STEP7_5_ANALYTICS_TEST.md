# Step 7.5: Site Visits & Traffic Dashboard - Verification Tests

## Prerequisites
- Backend server running on port 3001
- Admin user registered and logged in (get JWT token)
- Supabase database with site_visits table and daily_visit_counts view

## Test Cases

### 1. Track Visit (Public - Called by Frontend on Page Load)
```bash
curl -X POST "http://localhost:3001/api/analytics/track" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_abc123",
    "pagePath": "/home",
    "referrer": "https://google.com",
    "userId": "USER_ID"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Visit tracked successfully"
}
```

**Verification:** Check site_visits table:
```sql
SELECT * FROM site_visits ORDER BY visited_at DESC LIMIT 1;
```
Should show the new visit record with session_id, page_path, referrer, user_id, and visited_at

### 2. Track Visit Without User ID (Anonymous User)
```bash
curl -X POST "http://localhost:3001/api/analytics/track" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_xyz789",
    "pagePath": "/listings",
    "referrer": "https://facebook.com"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Visit tracked successfully"
}
```

### 3. Track Visit Without Referrer
```bash
curl -X POST "http://localhost:3001/api/analytics/track" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_def456",
    "pagePath": "/categories"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Visit tracked successfully"
}
```

### 4. Get Traffic Summary (Admin Only) - All Time
```bash
curl -X GET "http://localhost:3001/api/analytics/traffic-summary" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "trafficData": [
      {
        "visit_date": "2024-01-15",
        "unique_visitors": 150,
        "page_views": 450
      },
      {
        "visit_date": "2024-01-14",
        "unique_visitors": 120,
        "page_views": 380
      },
      {
        "visit_date": "2024-01-13",
        "unique_visitors": 100,
        "page_views": 320
      }
    ]
  }
}
```

### 5. Get Traffic Summary with Date Range
```bash
curl -X GET "http://localhost:3001/api/analytics/traffic-summary?startDate=2024-01-10&endDate=2024-01-15" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "trafficData": [
      {
        "visit_date": "2024-01-15",
        "unique_visitors": 150,
        "page_views": 450
      },
      {
        "visit_date": "2024-01-14",
        "unique_visitors": 120,
        "page_views": 380
      }
    ]
  }
}
```

### 6. Get Traffic Stats (Admin Only) - All Time
```bash
curl -X GET "http://localhost:3001/api/analytics/traffic-stats" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "uniqueVisitors": 500,
    "pageViews": 2500,
    "dateRange": {
      "startDate": null,
      "endDate": null
    }
  }
}
```

### 7. Get Traffic Stats with Date Range
```bash
curl -X GET "http://localhost:3001/api/analytics/traffic-stats?startDate=2024-01-01&endDate=2024-01-15" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "uniqueVisitors": 350,
    "pageViews": 1800,
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-15"
    }
  }
}
```

### 8. Get Traffic Stats - Today Only
```bash
curl -X GET "http://localhost:3001/api/analytics/traffic-stats?startDate=2024-01-15&endDate=2024-01-15" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "uniqueVisitors": 50,
    "pageViews": 120,
    "dateRange": {
      "startDate": "2024-01-15",
      "endDate": "2024-01-15"
    }
  }
}
```

### 9. Get Top Pages (Admin Only)
```bash
curl -X GET "http://localhost:3001/api/analytics/top-pages" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "topPages": [
      {
        "page_path": "/home",
        "views": 500
      },
      {
        "page_path": "/listings",
        "views": 350
      },
      {
        "page_path": "/categories",
        "views": 200
      },
      {
        "page_path": "/search",
        "views": 150
      },
      {
        "page_path": "/about",
        "views": 100
      }
    ]
  }
}
```

### 10. Get Top Pages with Date Range and Limit
```bash
curl -X GET "http://localhost:3001/api/analytics/top-pages?startDate=2024-01-01&endDate=2024-01-15&limit=5" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "topPages": [
      {
        "page_path": "/home",
        "views": 300
      },
      {
        "page_path": "/listings",
        "views": 200
      }
    ]
  }
}
```

### 11. Test Unauthorized Access (Non-Admin Viewing Traffic Summary)
```bash
curl -X GET "http://localhost:3001/api/analytics/traffic-summary" \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Only admins can view traffic summary"
}
```

### 12. Test Unauthorized Access (Non-Admin Viewing Traffic Stats)
```bash
curl -X GET "http://localhost:3001/api/analytics/traffic-stats" \
  -H "Authorization: Bearer PROVIDER_JWT_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Only admins can view traffic stats"
}
```

### 13. Test Missing Required Fields for Track Visit
```bash
curl -X POST "http://localhost:3001/api/analytics/track" \
  -H "Content-Type: application/json" \
  -d '{
    "pagePath": "/home"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Missing required fields: sessionId, pagePath"
}
```

### 14. Test Invalid Date Range Format
```bash
curl -X GET "http://localhost:3001/api/analytics/traffic-summary?startDate=invalid-date" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:** May return empty data or error depending on Supabase response

### 15. Test Empty Date Range (No Visits)
```bash
curl -X GET "http://localhost:3001/api/analytics/traffic-stats?startDate=2050-01-01&endDate=2050-12-31" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "uniqueVisitors": 0,
    "pageViews": 0,
    "dateRange": {
      "startDate": "2050-01-01",
      "endDate": "2050-12-31"
    }
  }
}
```

## Verification Checklist
- [ ] Public users can track visits without authentication
- [ ] Visit tracking requires sessionId and pagePath
- [ ] Visit tracking accepts optional referrer
- [ ] Visit tracking accepts optional userId (for logged-in users)
- [ ] Visits are recorded with timestamp (visited_at)
- [ ] Admins can view traffic summary from daily_visit_counts view
- [ ] Traffic summary can be filtered by date range
- [ ] Traffic summary returns visit_date, unique_visitors, page_views
- [ ] Admins can view total unique visitors count
- [ ] Admins can view total page views count
- [ ] Traffic stats can be filtered by date range
- [ ] Traffic stats returns date range in response
- [ ] Admins can view top pages by view count
- [ ] Top pages can be filtered by date range
- [ ] Top pages limit parameter works correctly
- [ ] Non-admin users cannot access analytics endpoints
- [ ] Missing required fields for track visit are rejected
- [ ] Empty date ranges return zero counts
