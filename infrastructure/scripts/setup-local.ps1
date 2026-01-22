# BVI FOP System - Local Development Setup Script (PowerShell)
# This script sets up the local development environment on Windows

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "BVI FOP System - Local Development Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check prerequisites
Write-Host ""
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$prerequisites = @(
    @{ Name = "Docker"; Command = "docker" },
    @{ Name = ".NET SDK"; Command = "dotnet" },
    @{ Name = "Node.js"; Command = "node" },
    @{ Name = "pnpm"; Command = "pnpm" }
)

foreach ($prereq in $prerequisites) {
    try {
        $null = Get-Command $prereq.Command -ErrorAction Stop
        Write-Host "  [OK] $($prereq.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "  [MISSING] $($prereq.Name) is required but not installed." -ForegroundColor Red
        if ($prereq.Command -eq "pnpm") {
            Write-Host "    Run: npm install -g pnpm" -ForegroundColor Yellow
        }
        exit 1
    }
}

Write-Host "All prerequisites found!" -ForegroundColor Green

# Start Docker containers
Write-Host ""
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for SQL Server to be ready
Write-Host ""
Write-Host "Waiting for SQL Server to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

$maxAttempts = 30
for ($i = 1; $i -le $maxAttempts; $i++) {
    try {
        $result = docker exec fop-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'FopSystem@Dev2024!' -C -Q "SELECT 1" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SQL Server is ready!" -ForegroundColor Green
            break
        }
    }
    catch {}

    Write-Host "Waiting for SQL Server... ($i/$maxAttempts)" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

# Restore .NET packages
Write-Host ""
Write-Host "Restoring .NET packages..." -ForegroundColor Yellow
dotnet restore FopSystem.sln

# Install EF Core tools if not present
$efToolInstalled = dotnet tool list -g | Select-String "dotnet-ef"
if (-not $efToolInstalled) {
    Write-Host "Installing EF Core tools..." -ForegroundColor Yellow
    dotnet tool install --global dotnet-ef
}

# Run database migrations
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
dotnet ef database update `
    --project src/FopSystem.Infrastructure/FopSystem.Infrastructure.csproj `
    --startup-project src/FopSystem.Api/FopSystem.Api.csproj

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
pnpm install

# Build shared packages
Write-Host ""
Write-Host "Building shared packages..." -ForegroundColor Yellow
pnpm run build --filter=@fop/*

Pop-Location

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Local development environment is ready!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the API:" -ForegroundColor Yellow
Write-Host "  cd src\FopSystem.Api; dotnet run" -ForegroundColor White
Write-Host ""
Write-Host "To start the web app:" -ForegroundColor Yellow
Write-Host "  cd frontend\apps\web; pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "To start the mobile app:" -ForegroundColor Yellow
Write-Host "  cd frontend\apps\mobile; npx expo start" -ForegroundColor White
Write-Host ""
Write-Host "API will be available at: " -ForegroundColor Yellow -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor White
Write-Host "Web app will be available at: " -ForegroundColor Yellow -NoNewline
Write-Host "http://localhost:5173" -ForegroundColor White
Write-Host "Swagger UI: " -ForegroundColor Yellow -NoNewline
Write-Host "http://localhost:5000/swagger" -ForegroundColor White
Write-Host ""
