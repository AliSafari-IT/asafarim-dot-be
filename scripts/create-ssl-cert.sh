#!/usr/bin/env bash

# Script to create a self-signed SSL certificate for asafarim.be domains
# This script:
# 1) Creates a self-signed SSL certificate
# 2) Sets appropriate permissions
# 3) Reloads Nginx to apply changes

set -euo pipefail

# Certificate details
CERT_DIR="/etc/ssl/certs"
KEY_DIR="/etc/ssl/private"
CERT_FILE="$CERT_DIR/asafarim-selfsigned.crt"
KEY_FILE="$KEY_DIR/asafarim-selfsigned.key"
DAYS=3650  # 10 years

# Check if running as root
if [[ $(id -u) -ne 0 ]]; then
  echo "This script must be run as root" >&2
  exit 1
fi

# Create directories if they don't exist
mkdir -p "$CERT_DIR"
mkdir -p "$KEY_DIR"

# Generate self-signed certificate
echo "==> Generating self-signed SSL certificate"
openssl req -x509 -nodes -days $DAYS -newkey rsa:2048 \
  -keyout "$KEY_FILE" -out "$CERT_FILE" \
  -subj "/C=BE/ST=Brussels/L=Brussels/O=ASafariM/CN=*.asafarim.be" \
  -addext "subjectAltName=DNS:*.asafarim.be,DNS:asafarim.be"

# Set permissions
echo "==> Setting permissions"
chmod 644 "$CERT_FILE"
chmod 600 "$KEY_FILE"

# Reload Nginx
echo "==> Reloading Nginx"
if command -v nginx >/dev/null 2>&1; then
  systemctl reload nginx || systemctl restart nginx || true
  echo "SSL certificate installed and Nginx reloaded"
else
  echo "Nginx not found. Certificate created but you'll need to reload Nginx manually"
fi

echo "==> Certificate creation complete"
echo "Certificate: $CERT_FILE"
echo "Private key: $KEY_FILE"
echo ""
echo "Note: This is a self-signed certificate, so browsers will show a security warning."
echo "For production, consider using Let's Encrypt or a commercial SSL certificate."
