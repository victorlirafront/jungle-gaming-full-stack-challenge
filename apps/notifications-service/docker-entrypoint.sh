#!/bin/sh
set -e

echo "Waiting for database..."
until nc -z ${DB_HOST:-db} ${DB_PORT:-5432}; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "Database is up"

if [ "$NODE_ENV" = "production" ]; then
  echo "Running migrations..."
  npm run migration:run || echo "Migrations failed or already applied"
fi

echo "Starting application..."
exec "$@"

