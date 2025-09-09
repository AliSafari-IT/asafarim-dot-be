#!/usr/bin/env bash
set -euo pipefail

# This script provisions Nginx site configs and systemd services for ASafariM.
# Run on the server with sudo: bash scripts/provision-server.sh

REPO_DIR="/var/repos/asafarim-dot-be"
NGINX_SNIPPETS_DIR="/etc/nginx/snippets/asafarim"
NGINX_SITES_AVAIL="/etc/nginx/sites-available"
NGINX_SITES_ENABL="/etc/nginx/sites-enabled"
ENV_DIR="/etc/asafarim"

SITES=(
  "asafarim.be.conf"
  "identity.asafarim.be.conf"
  "ai.asafarim.be.conf"
  "core.asafarim.be.conf"
  "blog.asafarim.be.conf"
)

SYSTEMD_UNITS=(
  "dotnet-identity.service"
  "dotnet-core.service"
  "dotnet-ai.service"
)

need_root() {
  if [[ $(id -u) -ne 0 ]]; then
    echo "Please run this script with sudo/root" >&2
    exit 1
  fi
}

need_bin() { command -v "$1" >/dev/null 2>&1 || { echo "Error: missing dependency '$1'" >&2; exit 1; }; }

main() {
  need_root
  need_bin nginx
  need_bin systemctl

  mkdir -p "$NGINX_SNIPPETS_DIR"

  # Copy snippets
  install -m 0644 "$REPO_DIR/scripts/nginx/snippets/common.conf" "$NGINX_SNIPPETS_DIR/common.conf"
  install -m 0644 "$REPO_DIR/scripts/nginx/snippets/api-routes.conf" "$NGINX_SNIPPETS_DIR/api-routes.conf"
  install -m 0644 "$REPO_DIR/scripts/nginx/snippets/websocket-map.conf" "$NGINX_SNIPPETS_DIR/websocket-map.conf"
  
  # Add WebSocket map to http context
  if ! grep -q "include /etc/nginx/snippets/asafarim/websocket-map.conf;" /etc/nginx/nginx.conf; then
    sed -i '/http {/a \	include /etc/nginx/snippets/asafarim/websocket-map.conf;' /etc/nginx/nginx.conf
  fi

  # Copy sites and enable
  for site in "${SITES[@]}"; do
    install -m 0644 "$REPO_DIR/scripts/nginx/sites/$site" "$NGINX_SITES_AVAIL/$site"
    ln -sf "$NGINX_SITES_AVAIL/$site" "$NGINX_SITES_ENABL/$site"
  done

  # Test and reload Nginx
  nginx -t
  systemctl reload nginx || systemctl restart nginx

  # Create environment directory and install template
  mkdir -p "$ENV_DIR"
  if [ ! -f "$ENV_DIR/env" ]; then
    install -m 0600 "$REPO_DIR/scripts/env-template.sh" "$ENV_DIR/env"
    echo "Created environment file at $ENV_DIR/env. Please review and update with secure values."
  else
    echo "Environment file already exists at $ENV_DIR/env. Not overwriting."
    echo "Compare with template at $REPO_DIR/scripts/env-template.sh for any new variables."
  fi

  # Install systemd units
  for unit in "${SYSTEMD_UNITS[@]}"; do
    install -m 0644 "$REPO_DIR/scripts/systemd/$unit" "/etc/systemd/system/$unit"
    systemctl daemon-reload
    systemctl enable --now "$unit" || true
  done

  echo "Provisioning complete. Next steps:"
  echo "1. Review and update environment variables in $ENV_DIR/env"
  echo "2. Obtain Let's Encrypt certificates:"
  echo "   certbot --nginx -d asafarim.be -d www.asafarim.be"
  echo "   certbot --nginx -d identity.asafarim.be"
  echo "   certbot --nginx -d ai.asafarim.be"
  echo "   certbot --nginx -d core.asafarim.be"
  echo "   certbot --nginx -d blog.asafarim.be"
}

main "$@"
