#!/usr/bin/env bash
# Render build script - runs during build phase
set -e

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build complete! Migrations will run after deployment."
