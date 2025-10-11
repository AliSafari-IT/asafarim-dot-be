#!/bin/bash

# Test script for sign-out functionality
echo "Testing sign-out functionality..."

# Test 1: Check if the identity service endpoint works
echo "Test 1: Testing identity service endpoint..."
curl -I http://localhost:3099/clear-cookies 2>/dev/null | head -3

# Test 2: Verify the updated useAuth.ts file has our changes
echo "Test 2: Checking if signOut function is updated..."
grep -q "COMPREHENSIVE COOKIE CLEARING" /var/repos/asafarim-dot-be/packages/shared-ui-react/hooks/useAuth.ts && echo "✅ Sign-out function updated" || echo "❌ Sign-out function not updated"

# Test 3: Check if the script file exists
echo "Test 3: Checking if cookie clearing script exists..."
test -f /var/repos/asafarim-dot-be/scripts/clear-cookies.js && echo "✅ Cookie clearing script exists" || echo "❌ Cookie clearing script missing"

echo "Tests completed."
