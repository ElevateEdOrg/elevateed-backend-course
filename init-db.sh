#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -U postgres; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

echo "PostgreSQL started. Restoring the database..."
pg_restore -U postgres -d elevatedb /docker-entrypoint-initdb.d/db_backup.dump || echo "Restore failed!"

echo "Database restoration completed!"
