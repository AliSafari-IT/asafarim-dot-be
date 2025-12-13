#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SECRETS="$ROOT/tools/secrets/asafarim.secrets"
OUT="$ROOT/tools/secrets/generated"

if [[ ! -f "$SECRETS" ]]; then
  echo "❌ Missing secrets file: $SECRETS"
  exit 1
fi

source "$SECRETS"
mkdir -p "$OUT"

apply_dev() {
  local api_path="$1"; shift
  echo "[DEV] $api_path"

  pushd "$ROOT/$api_path" >/dev/null

  if ! dotnet user-secrets list >/dev/null 2>&1; then
    dotnet user-secrets init >/dev/null
  fi

  for kv in "$@"; do
    dotnet user-secrets set "${kv%%=*}" "${kv#*=}"
  done

  popd >/dev/null
}

write_env() {
  local file="$1"; shift
  echo "[PROD] $file"
  {
    echo "ASPNETCORE_ENVIRONMENT=Production"
    for kv in "$@"; do echo "$kv"; done
  } > "$file"
}

# =========================
# Identity.Api
# =========================
apply_dev "apis/Identity.Api" \
  "ConnectionStrings:DefaultConnection=$IDENTITY_DB" \
  "ConnectionStrings:JobsConnection=$IDENTITY_JOBSCONN" \
  "ConnectionStrings:SharedConnection=$IDENTITY_SHAREDCONN" \
  "AuthJwt:Key=$JWT_KEY" \
  "Smtp:Password=$SMTP_PASSWORD"

write_env "$OUT/identity-api.env" \
  "ConnectionStrings__DefaultConnection=$IDENTITY_DB" \
  "ConnectionStrings__JobsConnection=$IDENTITY_JOBSCONN" \
  "ConnectionStrings__SharedConnection=$IDENTITY_SHAREDCONN" \
  "AuthJwt__Key=$JWT_KEY" \
  "Smtp__Password=$SMTP_PASSWORD"

# =========================
# Ai.Api
# =========================
apply_dev "apis/Ai.Api" \
  "ConnectionStrings:SharedConnection=$IDENTITY_SHAREDCONN" \
  "AuthJwt:Key=$JWT_KEY" \
  "OpenAI:ApiKey=$OPENAI_KEY"

write_env "$OUT/ai-api.env" \
  "ConnectionStrings__SharedConnection=$IDENTITY_SHAREDCONN" \
  "AuthJwt__Key=$JWT_KEY" \
  "OpenAI__ApiKey=$OPENAI_KEY"

# =========================
# Core.Api
# =========================
apply_dev "apis/Core.Api" \
  "ConnectionStrings:DefaultConnection=$CORE_DB" \
  "ConnectionStrings:JobsConnection=$IDENTITY_JOBSCONN" \
  "ConnectionStrings:SharedConnection=$IDENTITY_SHAREDCONN" \
  "AuthJwt:Key=$JWT_KEY"

write_env "$OUT/core-api.env" \
  "ConnectionStrings__DefaultConnection=$CORE_DB" \
  "ConnectionStrings__JobsConnection=$IDENTITY_JOBSCONN" \
  "ConnectionStrings__SharedConnection=$IDENTITY_SHAREDCONN" \
  "AuthJwt__Key=$JWT_KEY"

# =========================
# FreelanceToolkit.Api
# =========================
apply_dev "apis/FreelanceToolkit.Api" \
  "ConnectionStrings:DefaultConnection=$FT_DB" \
  "AuthJwt:Key=$JWT_KEY"

write_env "$OUT/freelance-toolkit-api.env" \
  "ConnectionStrings__DefaultConnection=$FT_DB" \
  "AuthJwt__Key=$JWT_KEY"

# =========================
# Restaurant.Api
# =========================
write_env "$OUT/restaurant-api.env" \
  "SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/rms" \
  "SPRING_DATASOURCE_USERNAME=postgres" \
  "SPRING_DATASOURCE_PASSWORD=Ali+123456/" \
  "JWT_SECRET=$JWT_KEY"

# =========================
# TestAutomation.Api
# =========================
apply_dev "apis/TestAutomation.Api" \
  "ConnectionStrings:DefaultConnection=$TESTAUTO_DB" \
  "AuthJwt:Key=$JWT_KEY"

write_env "$OUT/testautomation-api.env" \
  "ConnectionStrings__DefaultConnection=$TESTAUTO_DB" \
  "AuthJwt__Key=$JWT_KEY"

# =========================
# Showcases
# =========================
apply_dev "showcases/TaskManagement/TaskManagement.Api" \
  "ConnectionStrings:DefaultConnection=$TASKMGMT_DB" \
  "AuthJwt:Key=$JWT_KEY"

write_env "$OUT/taskmanagement-api.env" \
  "ConnectionStrings__DefaultConnection=$TASKMGMT_DB" \
  "AuthJwt__Key=$JWT_KEY"

apply_dev "showcases/SmartOperationsDashboard/SmartOps.Api" \
  "ConnectionStrings:DefaultConnection=$SMARTOPS_DB" \
  "AuthJwt:Key=$JWT_KEY"

write_env "$OUT/smartops-api.env" \
  "ConnectionStrings__DefaultConnection=$SMARTOPS_DB" \
  "AuthJwt__Key=$JWT_KEY"

echo "✅ Secrets initialized for ALL APIs"
