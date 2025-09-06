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
echo "==> Installing workspace dependencies (pnpm i --frozen-lockfile)"
pnpm i --frozen-lockfile

#############################################
# Build frontend apps
#############################################
echo "==> Building frontend apps"
pnpm app:build

#############################################
# Build/publish .NET APIs
#############################################
echo "==> Publishing .NET APIs (Release)"
for PROJ in "${!APIS[@]}"; do
  OUT_DIR="${APIS[$PROJ]}"
  echo "  - ${PROJ} -> ${OUT_DIR}"
  mkdir_p "$OUT_DIR"
  dotnet publish "$PROJ" -c Release -o "$OUT_DIR"
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

echo "==> Restarting application services"
for svc in "${SERVICES[@]}"; do
  restart_if_exists "$svc"
done

echo "==> Deployment complete"






