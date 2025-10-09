#!/bin/bash

echo "🔍 Testing Authentication Endpoints"
echo "===================================="
echo ""

# Test 1: Health Check - Identity API
echo "1️⃣  Testing Identity.Api (Port 5101)..."
IDENTITY_HEALTH=$(curl -s http://localhost:5101/health)
if [ $? -eq 0 ]; then
    echo "✅ Identity.Api is running"
    echo "   Response: $IDENTITY_HEALTH"
else
    echo "❌ Identity.Api is NOT running on port 5101"
fi
echo ""

# Test 2: Health Check - Core API
echo "2️⃣  Testing Core.Api (Port 5102)..."
CORE_HEALTH=$(curl -s http://localhost:5102/health)
if [ $? -eq 0 ]; then
    echo "✅ Core.Api is running"
    echo "   Response: $CORE_HEALTH"
else
    echo "❌ Core.Api is NOT running on port 5102"
fi
echo ""

# Test 3: Auth endpoint without auth (should return 401)
echo "3️⃣  Testing /auth/me endpoint (should return 401 without auth)..."
AUTH_ME=$(curl -s -w "\n%{http_code}" http://localhost:5102/auth/me)
HTTP_CODE=$(echo "$AUTH_ME" | tail -n1)
if [ "$HTTP_CODE" == "401" ]; then
    echo "✅ /auth/me correctly returns 401 Unauthorized"
else
    echo "⚠️  Unexpected status code: $HTTP_CODE"
fi
echo ""

# Test 4: Auth token endpoint without auth (should return 401)
echo "4️⃣  Testing /auth/token endpoint (should return 401 without auth)..."
AUTH_TOKEN=$(curl -s -w "\n%{http_code}" http://localhost:5102/auth/token)
HTTP_CODE=$(echo "$AUTH_TOKEN" | tail -n1)
if [ "$HTTP_CODE" == "401" ]; then
    echo "✅ /auth/token correctly returns 401 Unauthorized"
else
    echo "⚠️  Unexpected status code: $HTTP_CODE"
fi
echo ""

echo "===================================="
echo "🎯 Summary:"
echo "   - Both APIs should be running"
echo "   - Auth endpoints should return 401 without cookies"
echo "   - Next: Test with browser login flow"
echo ""
