#!/usr/bin/env bash

# Script to obtain and configure Let's Encrypt certificates for asafarim.be domains
# This script:
# 1) Obtains Let's Encrypt certificates using certbot
# 2) Configures Nginx to use the certificates
# 3) Sets up auto-renewal

set -euo pipefail

# Domain configuration
# Add all domains that need certificates
DOMAINS=(
  "asafarim.be"
  "www.asafarim.be"
  "blog.asafarim.be"
  "core.asafarim.be"
  "ai.asafarim.be"
  "identity.asafarim.be"
)

# Email for Let's Encrypt notifications
EMAIL="asafarim@gmail.com"

# Check if running as root
if [[ $(id -u) -ne 0 ]]; then
  echo "This script must be run as root" >&2
  exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
  echo "Certbot not found. Installing..."
  apt-get update
  apt-get install -y certbot python3-certbot-nginx
fi

# Function to obtain certificates for a domain
obtain_cert() {
  local domain="$1"
  echo "==> Obtaining certificate for $domain"
  
  # Use the certbot nginx plugin to obtain and install the certificate
  # This will automatically configure Nginx
  certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --domains "$domain" \
    --redirect \
    --hsts
    
  echo "Certificate obtained for $domain"
}

# Main execution
echo "==> Starting Let's Encrypt certificate setup"

# Process each domain
for domain in "${DOMAINS[@]}"; do
  obtain_cert "$domain"
done

# Verify auto-renewal is set up
echo "==> Setting up auto-renewal"
if ! systemctl list-timers | grep -q certbot; then
  echo "Setting up certbot timer for auto-renewal"
  systemctl enable certbot.timer
  systemctl start certbot.timer
else
  echo "Certbot timer already configured"
fi

# Test auto-renewal
echo "==> Testing certificate renewal (dry run)"
certbot renew --dry-run

echo "==> Let's Encrypt setup complete!"
echo "Certificates have been obtained and Nginx has been configured."
echo "Auto-renewal is set up via systemd timer."
echo ""
echo "You can check the status of the renewal timer with:"
echo "  systemctl list-timers certbot.timer"
echo ""
echo "To force a renewal (if needed):"
echo "  certbot renew"
