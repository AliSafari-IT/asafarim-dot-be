#!/usr/bin/env bash

# End-to-end deployment script for the ASafariM monorepo
# Usage (on the VPS after cloning):
#   chmod +x scripts/deploy.sh
#   sudo scripts/deploy.sh [branch]
#
# This script:
# 1) Pulls the specified branch (default: main) in /var/repos/asafarim-dot-be
# 2) Installs dependencies and builds all frontend apps and .NET APIs
# 3) Publishes artifacts into /var/www/{apps,apis}
# 4) Restarts systemd services and reloads Nginx

set -euo pipefail

#############################################
# Configuration
#############################################
BRANCH="${1:-main}"
REPO_DIR="/var/repos/asafarim-dot-be"
WWW_ROOT="/var/www"
SITE_ROOT="$WWW_ROOT/asafarim-dot-be"

# Frontend targets (output subfolders under SITE_ROOT/apps)
FRONTENDS=(
  "web:apps/web/dist"
  "core-app:apps/core-app/dist"
  "ai-ui:apps/ai-ui/dist"
  "identity-portal:apps/identity-portal/dist"
  # Docusaurus outputs to build
  "blog:apps/blog/build"
  # Angular jobs-ui (try common outputs)
  "jobs-ui:apps/jobs-ui/dist/apps/jobs-ui"
  "jobs-ui-alt:apps/jobs-ui/dist/jobs-ui"
)

# .NET APIs (project path => output directory)
declare -A APIS=(
  ["apis/Identity.Api/Identity.Api.csproj"]="$SITE_ROOT/apis/identity"
  ["apis/Core.Api/Core.Api.csproj"]="$SITE_ROOT/apis/core"
  ["apis/Ai.Api/Ai.Api.csproj"]="$SITE_ROOT/apis/ai"
)

# Systemd service names (must exist on the server)
SERVICES=(
  "dotnet-identity"
  "dotnet-core"
  "dotnet-ai"
  "dotnet-jobs"
  "dotnet-blog"
  "dotnet-web"
)

#############################################
# Helpers
#############################################
need_bin() { command -v "$1" >/dev/null 2>&1 || { echo "Error: missing dependency '$1'" >&2; exit 1; }; }

restart_if_exists() {
  local svc="$1"
  if systemctl list-units --type=service --all | grep -q "^${svc}\.service"; then
    echo "Restarting ${svc}..."
    systemctl restart "$svc"
  else
    echo "(skip) Service ${svc}.service not found"
  fi
}

mkdir_p() { mkdir -p "$1"; }

#############################################
# Pre-flight checks
#############################################
need_bin git
need_bin pnpm
need_bin node
need_bin rsync
need_bin dotnet
need_bin systemctl

if [[ $(id -u) -ne 0 ]]; then
  echo "This script should be run with sudo/root (needed for systemctl and writing /var/www)" >&2
  exit 1
fi

#############################################
# Pull latest code
#############################################
echo "==> Updating repository in ${REPO_DIR} (branch: ${BRANCH})"
mkdir_p "$REPO_DIR"
cd "$REPO_DIR"

if [[ -d .git ]]; then
  git fetch origin
  git checkout "$BRANCH"
  git reset --hard "origin/${BRANCH}"
else
  echo "Cloning repository into ${REPO_DIR}..."
  # NOTE: replace <origin_url> with your actual Git remote URL (SSH recommended)
  echo "Error: ${REPO_DIR} is not a git repo. Please clone it first (git clone <origin_url> ${REPO_DIR})" >&2
  exit 1
fi

#############################################
# Install dependencies
#############################################
echo "==> Installing workspace dependencies"
# First remove node_modules to ensure clean build
rm -rf "$REPO_DIR/apps/blog/node_modules"
rm -rf "$REPO_DIR/apps/core-app/node_modules"
rm -rf "$REPO_DIR/apps/ai-ui/node_modules"
rm -rf "$REPO_DIR/apps/identity-portal/node_modules"
rm -rf "$REPO_DIR/apps/jobs-ui/node_modules"
rm -rf "$REPO_DIR/apps/web/node_modules"

pnpm i --frozen-lockfile

#############################################
# Build frontend apps
#############################################
echo "==> Building frontend apps"
# First remove build folder to ensure clean build
rm -rf "$REPO_DIR/apps/blog/build"
rm -rf "$REPO_DIR/apps/core-app/dist"
rm -rf "$REPO_DIR/apps/ai-ui/dist"
rm -rf "$REPO_DIR/apps/identity-portal/dist"
rm -rf "$REPO_DIR/apps/jobs-ui/dist"
rm -rf "$REPO_DIR/apps/web/dist"

# Build all apps
pnpm app:build

# Verify that blog app was built correctly
echo "==> Verifying blog app build"
if [ ! -d "$REPO_DIR/apps/blog/build" ]; then
  echo "ERROR: Blog app build directory not found!"
  echo "Running specific blog build command..."
  cd "$REPO_DIR/apps/blog"
  pnpm build
  cd "$REPO_DIR"
fi

#############################################
# Verify .NET project files
#############################################
echo "==> Verifying .NET project files"
for PROJ in "${!APIS[@]}"; do
  echo "  - Checking $PROJ"
  if grep -q "net9.0" "$REPO_DIR/$PROJ"; then
    echo "    ERROR: $PROJ still contains net9.0 references!"
    exit 1
  else
    echo "    OK: $PROJ is targeting .NET 8.0"
  fi
done

#############################################
# Build/publish .NET APIs
#############################################
echo "==> Publishing .NET APIs (Release)"
for PROJ in "${!APIS[@]}"; do
  OUT_DIR="${APIS[$PROJ]}"
  echo "  - Building ${PROJ} to verify it compiles successfully"
  
  # First verify the build succeeds
  if dotnet build "$REPO_DIR/$PROJ" -c Release --no-restore; then
    # If build succeeded, then remove the current published directory
    if [ -d "$OUT_DIR" ] && [ -d "$REPO_DIR/$PROJ" ]; then
      echo "  - Build successful, removing existing $OUT_DIR"
      rm -rf "$OUT_DIR"
    fi
    
    echo "  - Publishing ${PROJ} -> ${OUT_DIR}"
    mkdir_p "$OUT_DIR"
    dotnet publish "$REPO_DIR/$PROJ" -c Release -o "$OUT_DIR"
  else
    echo "  - ERROR: Build failed for ${PROJ}, skipping publish to preserve existing deployment"
  fi
done

#############################################
# Sync frontend build artifacts
#############################################
echo "==> Syncing frontend artifacts to ${SITE_ROOT}/apps"
mkdir_p "$SITE_ROOT/apps"

copy_frontend() {
  local name="$1"; shift
  local path="$1"; shift
  if [[ -d "$path" ]]; then
    echo "  - ${name}: ${path} -> ${SITE_ROOT}/apps/${name}"
    mkdir_p "$SITE_ROOT/apps/${name}"
    rsync -a --delete "$path"/ "$SITE_ROOT/apps/${name}"/
    
    # Add verification for blog app
    if [[ "$name" == "blog" ]]; then
      echo "    Verifying blog app deployment..."
      if [[ -f "$SITE_ROOT/apps/${name}/index.html" ]]; then
        echo "    ✓ Blog app index.html found"
        grep -q "docusaurus" "$SITE_ROOT/apps/${name}/index.html" || echo "    ⚠️ WARNING: Blog app index.html may not be correct Docusaurus content"
      else
        echo "    ❌ ERROR: Blog app index.html not found!"
      fi
    fi
  else
    echo "  (skip) ${name}: build path not found: ${path}"
  fi
}

for entry in "${FRONTENDS[@]}"; do
  IFS=":" read -r name path <<<"$entry"
  copy_frontend "$name" "$REPO_DIR/$path"
done

#############################################
# Nginx and services
#############################################
echo "==> Reloading Nginx (if installed)"
if command -v nginx >/dev/null 2>&1; then
  systemctl reload nginx || systemctl restart nginx || true
else
  echo "(info) nginx not installed. Skipping web server reload."
fi

echo "==> Managing application services"

# Check if any services are missing
missing_services=false
for svc in "${SERVICES[@]}"; do
  if ! systemctl list-units --type=service --all | grep -q "^${svc}\.service"; then
    echo "Service ${svc}.service not found"
    missing_services=true
  fi
done

# If any services are missing, run the install script
if $missing_services; then
  echo "Some services are missing. Running install-services.sh to install them..."
  if [[ -f "$REPO_DIR/scripts/install-services.sh" ]]; then
    bash "$REPO_DIR/scripts/install-services.sh"
  else
    echo "ERROR: install-services.sh not found at $REPO_DIR/scripts/install-services.sh"
  fi
fi

# Restart all services
echo "Restarting application services..."
for svc in "${SERVICES[@]}"; do
  restart_if_exists "$svc"
done

echo "==> Deployment complete"






