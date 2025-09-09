#!/usr/bin/env bash

# Script to test Nginx configuration before applying Let's Encrypt changes
# This script:
# 1) Tests the Nginx configuration syntax
# 2) Verifies that all required domains are configured
# 3) Checks for common SSL configuration issues

set -euo pipefail

# Domain configuration - should match setup-letsencrypt.sh
DOMAINS=(
  "asafarim.be"
  "www.asafarim.be"
  "blog.asafarim.be"
  "core.asafarim.be"
  "ai.asafarim.be"
  "identity.asafarim.be"
)

# Check if running as root
if [[ $(id -u) -ne 0 ]]; then
  echo "This script must be run as root" >&2
  exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
  echo "Nginx not found. Please install Nginx first." >&2
  exit 1
fi

# Test Nginx configuration syntax
echo "==> Testing Nginx configuration syntax"
nginx -t
if [ $? -ne 0 ]; then
  echo "Nginx configuration test failed. Please fix the errors before continuing." >&2
  exit 1
fi
echo "✓ Nginx configuration syntax is valid"

# Check if all domains have Nginx configurations
echo "==> Checking Nginx configurations for all domains"
NGINX_SITES_DIR="/var/repos/asafarim-dot-be/scripts/nginx/sites"
MISSING_DOMAINS=()

for domain in "${DOMAINS[@]}"; do
  config_file="${NGINX_SITES_DIR}/${domain}.conf"
  if [[ ! -f "$config_file" ]]; then
    MISSING_DOMAINS+=("$domain")
  else
    echo "✓ Found configuration for $domain"
  fi
done

if [ ${#MISSING_DOMAINS[@]} -gt 0 ]; then
  echo "Warning: Missing Nginx configurations for the following domains:"
  for domain in "${MISSING_DOMAINS[@]}"; do
    echo "  - $domain"
  done
  echo "You may need to create configurations for these domains before obtaining certificates."
fi

# Check for common SSL configuration issues
echo "==> Checking for common SSL configuration issues"
SSL_ISSUES=0

for domain in "${DOMAINS[@]}"; do
  config_file="${NGINX_SITES_DIR}/${domain}.conf"
  if [[ -f "$config_file" ]]; then
    # Check if SSL is configured
    if ! grep -q "listen 443 ssl" "$config_file"; then
      echo "Warning: $domain is not configured for SSL (missing 'listen 443 ssl')"
      SSL_ISSUES=$((SSL_ISSUES + 1))
    fi
    
    # Check if HTTP to HTTPS redirect is configured
    if ! grep -q "return 301 https://" "$config_file"; then
      echo "Warning: $domain may not have HTTP to HTTPS redirect configured"
      SSL_ISSUES=$((SSL_ISSUES + 1))
    fi
  fi
done

if [ $SSL_ISSUES -eq 0 ]; then
  echo "✓ No common SSL configuration issues found"
fi

echo "==> Nginx configuration test complete"
echo ""
echo "Next steps:"
echo "1. Run update-nginx-for-letsencrypt.sh to prepare Nginx configurations"
echo "2. Run setup-letsencrypt.sh to obtain Let's Encrypt certificates"
echo "3. Reload Nginx to apply changes: systemctl reload nginx"
