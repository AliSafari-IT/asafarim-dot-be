#!/usr/bin/env bash

# Script to update Nginx configurations to prepare for Let's Encrypt certificates
# This script:
# 1) Updates Nginx site configurations to use Let's Encrypt certificate paths
# 2) Creates backup of original configurations
# 3) Reloads Nginx to apply changes

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

# Process each site configuration
echo "==> Updating Nginx configurations for Let's Encrypt"

for config_file in "$NGINX_SITES_DIR"/*.conf; do
  domain=$(basename "$config_file" .conf)
  echo "Processing $domain..."
  
  # Create backup
  cp "$config_file" "$BACKUP_DIR/$(basename "$config_file")"
  
  # Update SSL certificate paths
  # Let's Encrypt will manage these paths automatically, but we'll update the config
  # to point to the standard locations that certbot will use
  
  # Only update if the file contains the self-signed certificate paths
  if grep -q "asafarim-selfsigned" "$config_file"; then
    echo "  Updating SSL certificate paths for $domain"
    
    # Replace certificate paths with Let's Encrypt paths
    # Note: certbot will actually manage these files, this is just to prepare the configs
    sed -i 's|ssl_certificate .*asafarim-selfsigned\.crt;|ssl_certificate /etc/letsencrypt/live/'"$domain"'/fullchain.pem;|g' "$config_file"
    sed -i 's|ssl_certificate_key .*asafarim-selfsigned\.key;|ssl_certificate_key /etc/letsencrypt/live/'"$domain"'/privkey.pem;|g' "$config_file"
    
    # Uncomment HSTS header if commented
    sed -i 's|# add_header Strict-Transport-Security|add_header Strict-Transport-Security|g' "$config_file"
    
    echo "  ✓ Updated $domain configuration"
  else
    echo "  ✓ No changes needed for $domain (already using Let's Encrypt or custom configuration)"
  fi
done

echo "==> Nginx configurations updated"
echo "Original configurations backed up to: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Run the setup-letsencrypt.sh script to obtain Let's Encrypt certificates"
echo "2. Reload Nginx to apply changes: systemctl reload nginx"
