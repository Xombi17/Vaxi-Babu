#!/usr/bin/env bash
# Render post-deploy script - runs after service starts
set -e

echo "Running database migrations..."
cd /opt/render/project/src/Backend
alembic upgrade head

echo "Migrations complete!"
