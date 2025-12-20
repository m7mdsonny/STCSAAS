# Authentication & Authorization Fix

## Issues Fixed

### 1. Backend Error Response Format
**Problem:** Backend was returning HTTP 200 with error codes in the response body (e.g., `{ code: 403, message: "permission error" }`).

**Fix:**
- Updated `ExceptionHandler` to properly return HTTP status codes (403, 404, etc.)
- Added proper handling for AuthorizationException and NotFoundHttpException
- API endpoints now return correct HTTP status codes

### 2. Non-existent Endpoints
**Problem:** Non-existent API endpoints were not returning proper 404 responses.

**Fix:**
- Added fallback route handler in `routes/api.php` that returns 404 for non-existent API endpoints
- Prevents endpoints from falling through to web routes

### 3. Frontend Error Handling
**Problem:** Frontend was not properly handling HTTP status codes vs. application-level error codes.

**Fix:**
- Updated `apiClient.ts` to prioritize HTTP status codes over application-level codes
- Added warning for improper error response format (HTTP 200 with error codes)
- Improved error handling in `AuthContext` to clear state on login errors

### 4. Token Storage & Sending
**Problem:** Token might not be properly stored or sent immediately after login.

**Fix:**
- Added small delay after login to ensure token is stored before subsequent requests
- Improved error handling to clear partial authentication state on errors

## Changes Made

### Backend (`apps/cloud-laravel/`)

1. **`app/Exceptions/Handler.php`**
   - Added `render()` method to handle 403 and 404 exceptions properly
   - Returns correct HTTP status codes for API requests

2. **`routes/api.php`**
   - Added fallback route handler for non-existent API endpoints
   - Returns 404 JSON response instead of falling through to web routes

### Frontend (`apps/web-portal/src/`)

1. **`lib/apiClient.ts`**
   - Updated error handling to prioritize HTTP status codes
   - Added warning for improper error response format
   - Better handling of 401 errors (clears token)

2. **`contexts/AuthContext.tsx`**
   - Added delay after login to ensure token is stored
   - Improved error handling to clear partial state on login errors

## Testing

### Test Login Flow

1. **Clear browser storage:**
   ```javascript
   localStorage.clear();
   ```

2. **Login with credentials:**
   - Super Admin: `superadmin@stc.local` / `SuperAdmin@123`
   - Organization Admin: `admin@democorp.local` / `Admin@123`

3. **Verify:**
   - Token is stored in `localStorage` as `auth_token`
   - User is stored in `localStorage` as `auth_user`
   - No console errors
   - Redirect works correctly based on role

### Test Error Handling

1. **Test non-existent endpoint:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:8000/api/v1/non-existent-endpoint
   ```
   Should return: `{"message": "API endpoint not found."}` with HTTP 404

2. **Test unauthorized access:**
   - Try accessing super admin endpoint with regular user
   - Should return HTTP 403 with proper error message

## About `/site_integration/template_list`

This endpoint does **not exist** in the codebase. If you're seeing this error:

1. **Check browser console** for the full error stack trace
2. **Check Network tab** to see what's making this request
3. **Clear browser cache** - might be a cached request from old code
4. **Check for browser extensions** that might be injecting requests

If the error persists, it might be:
- A legacy API call from old code
- An external service
- A browser extension injecting requests

## Next Steps

If login still fails:

1. **Check browser console** for full error details
2. **Check Network tab** to see:
   - What endpoint is being called
   - What headers are being sent
   - What response is received
3. **Verify token storage:**
   ```javascript
   console.log(localStorage.getItem('auth_token'));
   ```
4. **Test API directly:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"superadmin@stc.local","password":"SuperAdmin@123"}'
   ```

## Verification Checklist

- [ ] Backend returns proper HTTP status codes (not 200 with error codes)
- [ ] Non-existent endpoints return 404
- [ ] Token is stored correctly after login
- [ ] Token is sent in Authorization header for subsequent requests
- [ ] Login redirects work correctly
- [ ] No console errors after login
- [ ] Authentication state is cleared on errors

