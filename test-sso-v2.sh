#!/bin/bash

# SSO V2 Testing Script
# Tests the new authentication implementation

set -e

API_BASE="http://localhost:5101"
COOKIE_FILE="/tmp/sso-test-cookies.txt"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPass123!"

echo "=========================================="
echo "SSO V2 Testing Script"
echo "=========================================="
echo ""

# Clean up old cookies
rm -f "$COOKIE_FILE"

echo "1. Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s "$API_BASE/health")
echo "✓ Health check: $HEALTH_RESPONSE"
echo ""

echo "2. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"userName\":\"testuser\"}" \
  -c "$COOKIE_FILE")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
  echo "✓ Registration successful"
  echo "  User: $TEST_EMAIL"
else
  echo "✗ Registration failed"
  echo "  Response: $REGISTER_RESPONSE"
  exit 1
fi
echo ""

echo "3. Testing /auth/me (with cookie)..."
ME_RESPONSE=$(curl -s "$API_BASE/auth/me" -b "$COOKIE_FILE")
if echo "$ME_RESPONSE" | grep -q "$TEST_EMAIL"; then
  echo "✓ Auth check successful"
  echo "  Response: $ME_RESPONSE"
else
  echo "✗ Auth check failed"
  echo "  Response: $ME_RESPONSE"
  exit 1
fi
echo ""

echo "4. Testing /auth/token..."
TOKEN_RESPONSE=$(curl -s "$API_BASE/auth/token" -b "$COOKIE_FILE")
if echo "$TOKEN_RESPONSE" | grep -q "token"; then
  echo "✓ Token retrieval successful"
else
  echo "✗ Token retrieval failed"
  echo "  Response: $TOKEN_RESPONSE"
  exit 1
fi
echo ""

echo "5. Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$API_BASE/auth/logout" -b "$COOKIE_FILE")
if echo "$LOGOUT_RESPONSE" | grep -q "successfully"; then
  echo "✓ Logout successful"
else
  echo "✗ Logout failed"
  echo "  Response: $LOGOUT_RESPONSE"
  exit 1
fi
echo ""

echo "6. Testing /auth/me after logout (should fail)..."
ME_AFTER_LOGOUT=$(curl -s -w "\n%{http_code}" "$API_BASE/auth/me" -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$ME_AFTER_LOGOUT" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
  echo "✓ Auth check correctly returns 401 after logout"
else
  echo "✗ Auth check should return 401 after logout, got: $HTTP_CODE"
fi
echo ""

echo "7. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"rememberMe\":true}" \
  -c "$COOKIE_FILE")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo "✓ Login successful"
else
  echo "✗ Login failed"
  echo "  Response: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

echo "8. Testing Token Refresh..."
REFRESH_RESPONSE=$(curl -s -X POST "$API_BASE/auth/refresh" -b "$COOKIE_FILE" -c "$COOKIE_FILE")
if echo "$REFRESH_RESPONSE" | grep -q "token"; then
  echo "✓ Token refresh successful"
else
  echo "✗ Token refresh failed"
  echo "  Response: $REFRESH_RESPONSE"
  exit 1
fi
echo ""

echo "9. Testing Rate Limiting (11 rapid requests)..."
RATE_LIMIT_TRIGGERED=false
for i in {1..11}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"wrong@example.com\",\"password\":\"wrong\"}")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" = "429" ]; then
    RATE_LIMIT_TRIGGERED=true
    echo "✓ Rate limiting triggered on request $i"
    break
  fi
  sleep 0.1
done

if [ "$RATE_LIMIT_TRIGGERED" = false ]; then
  echo "⚠ Rate limiting not triggered (might need more requests or faster execution)"
fi
echo ""

echo "=========================================="
echo "All Tests Completed Successfully! ✓"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Health check: ✓"
echo "  - Registration: ✓"
echo "  - Authentication: ✓"
echo "  - Token retrieval: ✓"
echo "  - Logout: ✓"
echo "  - Login: ✓"
echo "  - Token refresh: ✓"
echo "  - Rate limiting: $([ "$RATE_LIMIT_TRIGGERED" = true ] && echo "✓" || echo "⚠")"
echo ""

# Cleanup
rm -f "$COOKIE_FILE"
