# Backend Configuration & Connection Guide

## ✅ Backend Connection Status: SUCCESS

Backend is **successfully connected** and configured!

### Connection Details
- **Backend URL**: `http://10.68.23.55:8000`
- **Status**: ✅ **CONNECTED**
- **Test Endpoint**: `/test`
- **Response**: `{ "message": "backend is working" }`

---

## 📦 Environment Configuration

### Added to `.env`
```env
# Backend Configuration
NEXT_PUBLIC_API_URL=http://10.68.23.55:8000
```

**Why `NEXT_PUBLIC_` prefix?**
- Makes the variable available in browser (needed for client-side API calls)
- Still secure because the variable contains only the domain, not secrets
- Secrets like API keys should NOT use this prefix

---

## 🧪 Backend Connection Tester

### Test Page
**URL**: `http://localhost:3000/test-backend`

### Endpoint
**Endpoint**: `GET /api/test`

Returns:
```json
{
  "success": true,
  "message": "Backend connection successful",
  "backendResponse": {
    "message": "backend is working"
  },
  "backendUrl": "http://10.68.23.55:8000",
  "timestamp": "2025-11-26T06:16:18.436Z"
}
```

### Manual Test
```bash
# Using curl
curl http://localhost:3000/api/test | jq .

# Using Node.js
fetch('http://localhost:3000/api/test')
  .then(res => res.json())
  .then(data => console.log(data))
```

---

## 🔌 Files Created/Modified

### New Files
1. **`app/api/test/route.js`** - Backend connection test endpoint
   - Validates `NEXT_PUBLIC_API_URL` configuration
   - Calls backend `/test` endpoint
   - Returns success/error with details
   - Useful for debugging connection issues

2. **`app/test-backend/page.js`** - Interactive test page
   - Beautiful UI for testing backend connection
   - Shows connection status
   - Displays backend response
   - Error handling with hints
   - No authentication required (visible to all)

### Modified Files
1. **`.env`** - Added `NEXT_PUBLIC_API_URL=http://10.68.23.55:8000`

---

## 🚀 How to Use Backend Connection

### Method 1: Server-Side (Route Handlers)
```javascript
// app/api/example/route.js
export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const response = await fetch(`${backendUrl}/your-endpoint`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Method 2: Client-Side (JavaScript/React)
```javascript
// In React component
'use client';

import { useEffect, useState } from 'react';

export function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Call your Route Handler (which calls backend)
    fetch('/api/example')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, []);
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### Method 3: Direct Backend Call from Route Handler
```javascript
// app/api/login/route.js
export async function POST(request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const body = await request.json();
  
  const response = await fetch(`${backendUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  // Process JWT, set cookies, etc.
  return Response.json(data);
}
```

---

## 🔐 Security Best Practices

### ✅ DO
- ✅ Use Route Handlers for sensitive operations (auth, payments)
- ✅ Validate backend responses before using them
- ✅ Use HTTPS in production (will auto-upgrade from HTTP)
- ✅ Include auth tokens when calling protected backend endpoints
- ✅ Add error handling with specific error messages

### ❌ DON'T
- ❌ Call backend directly from client components (CORS issues)
- ❌ Store sensitive tokens in `NEXT_PUBLIC_` variables
- ❌ Trust all backend responses without validation
- ❌ Log sensitive data to console in production

---

## 📋 API Integration Checklist

When integrating new backend endpoints:

- [ ] **Define endpoint** in backend (e.g., POST `/api/login`)
- [ ] **Create Route Handler** in Next.js (e.g., `app/api/login/route.js`)
- [ ] **Add error handling** for network failures
- [ ] **Validate response** before processing
- [ ] **Update types** if using TypeScript
- [ ] **Add authentication** if endpoint is protected
- [ ] **Test** using test-backend page or curl
- [ ] **Update documentation** with endpoint details

---

## 🧠 Common Backend Endpoints Pattern

### For Login
```javascript
// app/api/auth/login/route.js
export async function POST(request) {
  const { username, password } = await request.json();
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }
  );
  
  const { access_token, refresh_token } = await response.json();
  
  // Set HTTP-only cookies
  const res = new Response(JSON.stringify({ success: true }));
  res.cookies.set('accessToken', access_token, { httpOnly: true, secure: true });
  res.cookies.set('refreshToken', refresh_token, { httpOnly: true, secure: true });
  return res;
}
```

### For Data Fetching
```javascript
// app/api/vehicles/route.js
export async function GET(request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Get auth token from request
  const token = request.cookies.get('accessToken')?.value;
  
  const response = await fetch(`${backendUrl}/vehicles`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const vehicles = await response.json();
  return Response.json(vehicles);
}
```

---

## 🐛 Troubleshooting

### Issue: "Failed to connect to backend"
**Cause**: Backend is not running or unreachable
**Solution**:
1. Check backend is running: `ping 10.68.23.55`
2. Verify URL is correct in `.env`
3. Check backend logs for errors
4. Ensure firewall allows port 8000

### Issue: "Backend returned 500"
**Cause**: Backend error
**Solution**:
1. Check backend logs for error details
2. Verify request body format
3. Check if all required fields are sent
4. Test endpoint directly: `curl http://10.68.23.55:8000/test`

### Issue: CORS Error in Console
**Cause**: Calling backend directly from browser
**Solution**:
1. Use Route Handler instead
2. Never call backend directly from client components
3. Backend can stay private (not exposed to client)

### Issue: "NEXT_PUBLIC_API_URL not configured"
**Cause**: Environment variable not set
**Solution**:
1. Add to `.env`: `NEXT_PUBLIC_API_URL=http://10.68.23.55:8000`
2. Restart dev server: `npm run dev`
3. Verify: `echo $NEXT_PUBLIC_API_URL`

---

## ✅ Verification Checklist

- [x] Backend URL configured in `.env`
- [x] Test endpoint created (`/api/test`)
- [x] Test page created (`/test-backend`)
- [x] Backend connection verified (working ✓)
- [x] Build passes (17 routes compiled)
- [x] Dev server running
- [x] Manual test successful: `{"message": "backend is working"}`

---

## 📞 Next Steps

1. **Test the connection**: Visit `http://localhost:3000/test-backend`
2. **Review backend endpoints**: Get list of available endpoints
3. **Implement login integration**: Use `/auth/login` endpoint
4. **Add protected routes**: Integrate JWT with backend validation
5. **Build features**: Use patterns from this guide

---

## 📚 Related Documentation

- **Security**: See `SECURITY_ARCHITECTURE.md`
- **Auth Flow**: See `ROLE_BASED_ACCESS_GUIDE.md`
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md`
- **Architecture**: See `FINAL_VERIFICATION.md`

---

**Status**: ✅ Ready for production integration

**Last Updated**: 2025-11-26
