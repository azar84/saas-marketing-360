#!/bin/sh

# Set default environment variables if not provided
export DATABASE_URL=${DATABASE_URL:-"file:./data/saas_cms.db"}
export JWT_SECRET=${JWT_SECRET:-"default-jwt-secret-change-in-production"}
export NODE_ENV=${NODE_ENV:-"production"}
export PORT=${PORT:-3000}
export HOSTNAME=${HOSTNAME:-"0.0.0.0"}

# Create data directory and ensure SQLite database is accessible
DB_PATH=$(echo $DATABASE_URL | sed 's/file://')
mkdir -p $(dirname "$DB_PATH")
echo "Using SQLite database at: $DB_PATH"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Run seed script to create default admin user
echo "Running seed script..."
node ./prisma/seed.js

# Start the application
echo "Starting application..."
exec node server.js 