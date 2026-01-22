#!/bin/bash

# BVI FOP System - Local Development Setup Script
# This script sets up the local development environment

set -e

echo "=========================================="
echo "BVI FOP System - Local Development Setup"
echo "=========================================="

# Check prerequisites
echo ""
echo "Checking prerequisites..."

command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
command -v dotnet >/dev/null 2>&1 || { echo ".NET SDK is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required but not installed. Run: npm install -g pnpm" >&2; exit 1; }

echo "All prerequisites found!"

# Start Docker containers
echo ""
echo "Starting Docker containers..."
docker-compose up -d

# Wait for SQL Server to be ready
echo ""
echo "Waiting for SQL Server to be ready..."
sleep 15

# Check if SQL Server is accepting connections
for i in {1..30}; do
    if docker exec fop-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'FopSystem@Dev2024!' -C -Q "SELECT 1" >/dev/null 2>&1; then
        echo "SQL Server is ready!"
        break
    fi
    echo "Waiting for SQL Server... ($i/30)"
    sleep 2
done

# Restore .NET packages
echo ""
echo "Restoring .NET packages..."
dotnet restore FopSystem.sln

# Install EF Core tools if not present
if ! dotnet tool list -g | grep -q "dotnet-ef"; then
    echo "Installing EF Core tools..."
    dotnet tool install --global dotnet-ef
fi

# Run database migrations
echo ""
echo "Running database migrations..."
dotnet ef database update \
    --project src/FopSystem.Infrastructure/FopSystem.Infrastructure.csproj \
    --startup-project src/FopSystem.Api/FopSystem.Api.csproj

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend
pnpm install

# Build shared packages
echo ""
echo "Building shared packages..."
pnpm run build --filter=@fop/*

cd ..

echo ""
echo "=========================================="
echo "Local development environment is ready!"
echo "=========================================="
echo ""
echo "To start the API:"
echo "  cd src/FopSystem.Api && dotnet run"
echo ""
echo "To start the web app:"
echo "  cd frontend/apps/web && pnpm dev"
echo ""
echo "To start the mobile app:"
echo "  cd frontend/apps/mobile && npx expo start"
echo ""
echo "API will be available at: http://localhost:5000"
echo "Web app will be available at: http://localhost:5173"
echo "Swagger UI: http://localhost:5000/swagger"
echo ""
