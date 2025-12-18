#!/bin/bash

##############################################################################
# AI-VAP Login Fix - Verification Script
# Tests if the login API is working correctly
##############################################################################

echo "======================================"
echo "AI-VAP Login - Verification Test"
echo "======================================"
echo ""

# Configuration
API_URL="${1:-https://stcsolutions.online/api/auth/login}"
TEST_EMAIL="${2:-admin@example.com}"
TEST_PASSWORD="${3:-Admin@12345}"

echo "Testing: $API_URL"
echo "Email: $TEST_EMAIL"
echo ""

# Test 1: Check if endpoint is reachable
echo "Test 1: Checking endpoint availability..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")
if [ "$HTTP_CODE" = "405" ] || [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    echo "✅ Endpoint is reachable (HTTP $HTTP_CODE)"
else
    echo "❌ Endpoint returned unexpected code: HTTP $HTTP_CODE"
fi
echo ""

# Test 2: Test login with credentials
echo "Test 2: Testing login with credentials..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

# Extract HTTP code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract body (everything except last line)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS! Login returned HTTP 200"
    echo ""
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo "======================================"
    echo "✅ All Tests Passed!"
    echo "======================================"
    exit 0
elif [ "$HTTP_CODE" = "401" ]; then
    echo "⚠️  HTTP 401 - Invalid credentials"
    echo "   The API is working, but credentials are incorrect"
    echo ""
    echo "Response:"
    echo "$BODY"
    echo ""
    echo "======================================"
    echo "✅ API is Working (credentials issue)"
    echo "======================================"
    exit 0
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ FAILED! HTTP 500 Server Error"
    echo "   The fix was not applied correctly"
    echo ""
    echo "Response:"
    echo "$BODY"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if DEPLOY.sh was run successfully"
    echo "2. Verify .env has CACHE_STORE=file and SESSION_DRIVER=file"
    echo "3. Check Laravel logs:"
    echo "   tail -50 apps/cloud-laravel/storage/logs/laravel.log"
    echo "4. Verify storage permissions:"
    echo "   ls -la apps/cloud-laravel/storage/framework/"
    echo ""
    exit 1
else
    echo "❌ Unexpected HTTP code: $HTTP_CODE"
    echo ""
    echo "Response:"
    echo "$BODY"
    echo ""
    exit 1
fi
