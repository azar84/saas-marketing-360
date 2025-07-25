#!/bin/bash

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    echo "Waiting for PostgreSQL to be ready..."
    while ! pg_isready -h localhost -p 5432 -U saas_cms_user; do
        sleep 1
    done
    echo "PostgreSQL is ready!"
}

# Start PostgreSQL in the background
echo "Starting PostgreSQL..."
postgres -c config_file=/etc/postgresql/postgresql.conf &

# Wait for PostgreSQL to be ready
wait_for_postgres

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Run seed script to create default admin user
echo "Running seed script..."
node ./prisma/seed.js

# Start the Next.js application
echo "Starting Next.js application..."
exec node server.js 