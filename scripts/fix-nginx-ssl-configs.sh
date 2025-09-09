#!/usr/bin/env bash

# Script to fix Nginx configurations for SSL
# This script:
# 1) Updates all site configurations to include SSL settings
# 2) Adds HTTP to HTTPS redirects
# 3) Creates missing www.asafarim.be configuration if needed

set -euo pipefail

# Configuration
NGINX_SITES_DIR="/var/repos/asafarim-dot-be/scripts/nginx/sites"
BACKUP_DIR="/var/repos/asafarim-dot-be/scripts/nginx/backup-$(date +%Y%m%d-%H%M%S)"

# Check if running as root
if [[ $(id -u) -ne 0 ]]; then
  echo "This script must be run as root" >&2
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "==> Created backup directory: $BACKUP_DIR"

# Function to update a site configuration for SSL
update_site_config() {
  local config_file="$1"
  local domain="$(basename "$config_file" .conf)"
  
  echo "Updating $domain configuration..."
  
  # Create backup
  cp "$config_file" "$BACKUP_DIR/$(basename "$config_file")"
  
  # Check if the config already has SSL configuration
  if grep -q "listen 443 ssl" "$config_file"; then
    echo "  ✓ $domain already has SSL configuration"
    return
  fi
  
  # Create a new configuration with SSL support
  local temp_file="$(mktemp)"
  
  # Extract the server_name directive
  local server_name=$(grep "server_name" "$config_file" | sed 's/server_name\s*//g' | sed 's/;//g')
  
  # Extract the root directive
  local root_dir=$(grep "root" "$config_file" | head -1 | sed 's/root\s*//g' | sed 's/;//g')
  
  # Create HTTP -> HTTPS redirect server block
  cat > "$temp_file" << EOF
# $domain - with SSL configuration
# HTTP -> HTTPS redirect
server {
  listen 80;
  listen [::]:80;
  server_name $server_name;
  
  # Redirect all HTTP requests to HTTPS
  return 301 https://\$host\$request_uri;
}

# HTTPS server
server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name $server_name;

  # SSL configuration
  ssl_certificate /etc/ssl/certs/asafarim-selfsigned.crt;
  ssl_certificate_key /etc/ssl/private/asafarim-selfsigned.key;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;
  ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
  ssl_session_timeout 1d;
  ssl_session_cache shared:SSL:10m;
  ssl_session_tickets off;

  # HSTS (uncomment when ready for production)
  # add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

  root $root_dir;

EOF

  # Copy over the include directives and log settings
  grep "include" "$config_file" >> "$temp_file"
  grep "access_log\|error_log" "$config_file" >> "$temp_file"
  
  # Close the server block
  echo "}" >> "$temp_file"
  
  # Replace the original file with the new one
  mv "$temp_file" "$config_file"
  
  echo "  ✓ Updated $domain configuration with SSL support"
}

# Check if www.asafarim.be configuration exists separately
if [[ ! -f "${NGINX_SITES_DIR}/www.asafarim.be.conf" ]]; then
  echo "==> Creating www.asafarim.be configuration"
  
  # Create a configuration that redirects www.asafarim.be to asafarim.be
  cat > "${NGINX_SITES_DIR}/www.asafarim.be.conf" << EOF
# www.asafarim.be - redirect to non-www version
# HTTP -> HTTPS redirect
server {
  listen 80;
  listen [::]:80;
  server_name www.asafarim.be;
  
  # Redirect all HTTP requests to HTTPS
  return 301 https://\$host\$request_uri;
}

# HTTPS server
server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name www.asafarim.be;

  # SSL configuration
  ssl_certificate /etc/ssl/certs/asafarim-selfsigned.crt;
  ssl_certificate_key /etc/ssl/private/asafarim-selfsigned.key;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;
  ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
  ssl_session_timeout 1d;
  ssl_session_cache shared:SSL:10m;
  ssl_session_tickets off;

  # Redirect to non-www version
  return 301 https://asafarim.be\$request_uri;
  
  access_log /var/log/nginx/www.asafarim.be.access.log;
  error_log  /var/log/nginx/www.asafarim.be.error.log warn;
}
EOF

  echo "  ✓ Created www.asafarim.be configuration"
  
  # Remove www.asafarim.be from asafarim.be server_name
  if grep -q "www.asafarim.be" "${NGINX_SITES_DIR}/asafarim.be.conf"; then
    sed -i 's/server_name asafarim.be www.asafarim.be;/server_name asafarim.be;/g' "${NGINX_SITES_DIR}/asafarim.be.conf"
    echo "  ✓ Removed www.asafarim.be from asafarim.be configuration"
  fi
fi

# Update all site configurations
echo "==> Updating site configurations for SSL"
for config_file in "$NGINX_SITES_DIR"/*.conf; do
  update_site_config "$config_file"
done

echo "==> Nginx configurations updated for SSL"
echo "Original configurations backed up to: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Test the Nginx configuration: nginx -t"
echo "2. Run setup-letsencrypt.sh to obtain Let's Encrypt certificates"
echo "3. Reload Nginx to apply changes: systemctl reload nginx"
