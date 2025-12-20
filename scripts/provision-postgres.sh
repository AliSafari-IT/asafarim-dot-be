#!/usr/bin/env bash
set -euo pipefail

# Provision PostgreSQL for ASafariM services.
#
# Usage (on VPS):
#   sudo bash scripts/provision-postgres.sh
#
# This script is idempotent:
# - Installs PostgreSQL if missing
# - Ensures service is enabled and running
# - Creates an application role and databases if missing

APP_DB_USER="${APP_DB_USER:-asafarim}"
APP_DB_PASSWORD="${APP_DB_PASSWORD:-}"
APP_DB_HOST="${APP_DB_HOST:-localhost}"
APP_DB_PORT="${APP_DB_PORT:-5432}"

DBS=(
  "asafarim"
  "jobs"
  "shared_db"
  "kidcode"
  "testautomation"
  "taskmanagement"
  "smartops"
)

need_root() {
  if [[ $(id -u) -ne 0 ]]; then
    echo "Please run this script with sudo/root" >&2
    exit 1
  fi
}

need_bin() { command -v "$1" >/dev/null 2>&1 || { echo "Error: missing dependency '$1'" >&2; exit 1; }; }

install_postgres_if_missing() {
  if command -v psql >/dev/null 2>&1; then
    return 0
  fi

  need_bin apt-get
  apt-get update
  apt-get install -y postgresql postgresql-contrib
}

ensure_service_running() {
  need_bin systemctl
  systemctl enable --now postgresql
}

ensure_role_and_dbs() {
  if [[ -z "$APP_DB_PASSWORD" ]]; then
    echo "APP_DB_PASSWORD is not set."
    echo "Set it like: APP_DB_PASSWORD='your-strong-password' sudo -E bash scripts/provision-postgres.sh" >&2
    exit 1
  fi

  # Create role if missing + set password; create databases if missing.
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${APP_DB_USER}') THEN
    CREATE ROLE ${APP_DB_USER} LOGIN PASSWORD '${APP_DB_PASSWORD}';
  ELSE
    ALTER ROLE ${APP_DB_USER} WITH LOGIN PASSWORD '${APP_DB_PASSWORD}';
  END IF;
END\$\$;
SQL

  for db in "${DBS[@]}"; do
    sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${db}') THEN
    CREATE DATABASE ${db} OWNER ${APP_DB_USER};
  END IF;
END\$\$;
SQL
  done
}

main() {
  need_root
  install_postgres_if_missing
  ensure_service_running
  ensure_role_and_dbs

  echo "PostgreSQL provisioned."
  echo "Role: ${APP_DB_USER}"
  echo "Databases: ${DBS[*]}"
  echo "Host/Port: ${APP_DB_HOST}:${APP_DB_PORT}"
}

main "$@"
