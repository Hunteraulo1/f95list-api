#!/usr/bin/env bash
set -euo pipefail

host="${MARIADB_HOST:?MARIADB_HOST is required}"
port="${MARIADB_PORT:-3306}"
user="${MARIADB_USER:?MARIADB_USER is required}"
password="${MARIADB_PASSWORD:-}"
ssl_mode="${MARIADB_SSL_MODE:-disable}"

ssl_args=()
if [[ "${ssl_mode}" != "disable" ]]; then
  ssl_args+=(--ssl)
fi

echo "Waiting for MariaDB at ${host}:${port}..."

until mariadb-admin ping \
  -h "${host}" \
  -P "${port}" \
  -u "${user}" \
  -p"${password}" \
  "${ssl_args[@]}" \
  --silent 2>/dev/null; do
  sleep 2
done

echo "MariaDB is up. Starting API..."
exec bun dist/index.js
