#!/usr/bin/env bash

# Script to install systemd service files for ASafariM services
# This script:
# 1) Copies service files from scripts/systemd/ to /etc/systemd/system/
# 2) Reloads systemd daemon
# 3) Enables and starts the services

set -euo pipefail

# Configuration
REPO_DIR="/var/repos/asafarim-dot-be"
SYSTEMD_DIR="/etc/systemd/system"
SERVICE_FILES=(
  "dotnet-identity.service"
  "dotnet-core.service"
  "dotnet-ai.service"
)

# Check if running as root
if [[ $(id -u) -ne 0 ]]; then
  echo "This script must be run as root" >&2
  exit 1
fi

# Create environment file directory if it doesn't exist
mkdir -p /etc/asafarim

# Check if environment file exists, create a template if not
if [[ ! -f /etc/asafarim/env ]]; then
  echo "Creating template environment file at /etc/asafarim/env"
  cat > /etc/asafarim/env <<EOF
# Environment variables for ASafariM services
# Add your production environment variables here

# Database connection strings
DB_CONNECTION_STRING=Host=localhost;Database=asafarim;Username=postgres;Password=your_password

# JWT settings
JWT_SECRET=change_this_to_a_secure_random_string
JWT_ISSUER=asafarim
JWT_AUDIENCE=asafarim-clients

# Other settings
ENABLE_SWAGGER=false
EOF
  echo "Please edit /etc/asafarim/env with your actual configuration values"
fi

# Copy service files
echo "==> Installing systemd service files"
for svc in "${SERVICE_FILES[@]}"; do
  src="${REPO_DIR}/scripts/systemd/${svc}"
  dst="${SYSTEMD_DIR}/${svc}"
  
  if [[ -f "$src" ]]; then
    echo "  - Installing ${svc}"
    cp "$src" "$dst"
    chmod 644 "$dst"
  else
    echo "  (skip) Service file not found: ${src}"
  fi
done

# Reload systemd daemon
echo "==> Reloading systemd daemon"
systemctl daemon-reload

# Enable and start services
echo "==> Enabling and starting services"
for svc in "${SERVICE_FILES[@]}"; do
  name="${svc%.service}"
  if [[ -f "${SYSTEMD_DIR}/${svc}" ]]; then
    echo "  - Enabling and starting ${name}"
    systemctl enable "${name}"
    systemctl restart "${name}" || echo "    Warning: Failed to start ${name}. Check logs with 'journalctl -u ${name}'"
  fi
done

echo "==> Service installation complete"
echo "You can check service status with: systemctl status dotnet-*"
echo "View logs with: journalctl -u dotnet-identity -u dotnet-core -u dotnet-ai"
