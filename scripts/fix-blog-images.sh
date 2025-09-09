#!/usr/bin/env bash

# Script to fix image loading issues in the blog
# This script:
# 1) Updates the Content-Security-Policy header in the Nginx configuration
# 2) Reloads Nginx to apply changes

set -euo pipefail

# Check if running as root
if [[ $(id -u) -ne 0 ]]; then
  echo "This script must be run as root" >&2
  exit 1
fi

# Backup the current configuration
BACKUP_FILE="/etc/nginx/snippets/asafarim/common.conf.bak"
echo "==> Creating backup of current configuration to $BACKUP_FILE"
cp /etc/nginx/snippets/asafarim/common.conf "$BACKUP_FILE"

# Update the Content-Security-Policy header
echo "==> Updating Content-Security-Policy header"

# Create a temporary file with the updated content
cat /etc/nginx/snippets/asafarim/common.conf | grep -v "Content-Security-Policy" > /tmp/common.conf.tmp

# Add the new Content-Security-Policy header
echo 'add_header Content-Security-Policy "default-src * data: blob: \'unsafe-inline\' \'unsafe-eval\'";' >> /tmp/common.conf.tmp

# Replace the original file
mv /tmp/common.conf.tmp /etc/nginx/snippets/asafarim/common.conf

# Add cache control headers for static files
echo "==> Adding cache control headers for static files"
cat >> /etc/nginx/snippets/asafarim/common.conf << 'EOF'
# Cache control for static files
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
  expires 7d;
  add_header Cache-Control "public, max-age=604800";
}
EOF

# Test Nginx configuration
echo "==> Testing Nginx configuration"
nginx -t

if [ $? -eq 0 ]; then
  echo "==> Reloading Nginx"
  systemctl reload nginx
  echo "✓ Blog image loading has been fixed"
else
  echo "❌ Nginx configuration test failed. Restoring backup..."
  cp "$BACKUP_FILE" /etc/nginx/snippets/asafarim/common.conf
  echo "Original configuration restored. Please check the error and try again."
  exit 1
fi
