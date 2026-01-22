# BVI Foreign Operator Permit (FOP) System

A comprehensive web and mobile application for the British Virgin Islands Civil Aviation Department to automate Foreign Operator Permit applications, document verification, fee calculation, and permit issuance.

## Overview

The FOP System streamlines the process for foreign aircraft operators to obtain permits for operating flights into or over BVI airspace. The system provides:

- **Online Application Submission** - Multi-step wizard for permit applications
- **Document Management** - Upload and verification of required documents (AOC, COA, Insurance, etc.)
- **Automated Fee Calculation** - Based on aircraft seats, MTOW, and permit type
- **Payment Processing** - Integrated payment gateway
- **Permit Issuance** - Automated permit generation upon approval
- **Insurance Monitoring** - Automated expiry notifications (30/14/7 days)
- **Role-Based Access** - Applicant, Reviewer, Approver, Finance Officer, Admin

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Web (React)   │  │ Mobile (Expo)   │  │ Shared Packages │ │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────┘ │
└───────────┼─────────────────────┼────────────────────────────────┘
            │                     │
            └──────────┬──────────┘
                       │ HTTPS
            ┌──────────▼──────────┐
            │   .NET 10 API       │
            │   (Minimal APIs)    │
            └──────────┬──────────┘
                       │
┌──────────────────────┼─────────────────────────────────────────┐
│                      │         Backend                          │
│  ┌───────────────────▼───────────────────┐                     │
│  │           Application Layer           │                     │
│  │   (CQRS with MediatR, Validation)     │                     │
│  └───────────────────┬───────────────────┘                     │
│  ┌───────────────────▼───────────────────┐                     │
│  │            Domain Layer               │                     │
│  │  (Entities, Value Objects, Services)  │                     │
│  └───────────────────────────────────────┘                     │
│  ┌───────────────────────────────────────┐                     │
│  │         Infrastructure Layer          │                     │
│  │  (EF Core, Azure Services, Jobs)      │                     │
│  └───────────────────────────────────────┘                     │
└────────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────┼─────────────────────────────────────────┐
│                      │      Azure Services                      │
│  ┌──────────┐  ┌─────▼─────┐  ┌───────────┐  ┌──────────────┐ │
│  │ SQL DB   │  │   Blob    │  │  Service  │  │    Key       │ │
│  │          │  │  Storage  │  │    Bus    │  │   Vault      │ │
│  └──────────┘  └───────────┘  └───────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Backend
- **.NET 10** - Latest LTS framework
- **Entity Framework Core 10** - ORM with SQL Server
- **MediatR** - CQRS pattern implementation
- **FluentValidation** - Input validation
- **Minimal APIs** - Lightweight HTTP endpoints

### Frontend
- **React 19** - Web application
- **Expo SDK 53** - React Native mobile app
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Tailwind CSS** - Styling (web)
- **Zod** - Schema validation

### Infrastructure
- **Azure SQL Database** - Relational data storage
- **Azure Blob Storage** - Document storage
- **Azure Service Bus** - Message queue
- **Azure Key Vault** - Secrets management
- **Azure App Service** - API hosting
- **Azure Static Web Apps** - Frontend hosting
- **Bicep** - Infrastructure as Code

## Project Structure

```
Foreign Operator Permit (FOP) System/
├── src/
│   ├── FopSystem.Domain/           # Domain entities, value objects, services
│   ├── FopSystem.Application/      # CQRS commands, queries, DTOs
│   ├── FopSystem.Infrastructure/   # EF Core, Azure services, jobs
│   └── FopSystem.Api/              # Minimal API endpoints
├── tests/
│   ├── FopSystem.Domain.Tests/
│   ├── FopSystem.Application.Tests/
│   ├── FopSystem.Infrastructure.Tests/
│   └── FopSystem.Api.Tests/
├── frontend/
│   ├── apps/
│   │   ├── web/                    # React web application
│   │   └── mobile/                 # Expo mobile application
│   └── packages/
│       ├── ui/                     # Shared UI components
│       ├── theme/                  # Design tokens
│       ├── core/                   # Shared business logic
│       ├── api/                    # API client
│       ├── types/                  # TypeScript types
│       └── validation/             # Zod schemas
├── infrastructure/
│   ├── bicep/                      # Azure IaC templates
│   └── scripts/                    # Setup and deployment scripts
├── .github/workflows/              # CI/CD pipelines
├── docker-compose.yml
└── FopSystem.sln
```

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) - `npm install -g pnpm`
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (for deployment)

### Local Development Setup

#### Option 1: Using the setup script (recommended)

**Windows (PowerShell):**
```powershell
.\infrastructure\scripts\setup-local.ps1
```

**Linux/macOS:**
```bash
chmod +x infrastructure/scripts/setup-local.sh
./infrastructure/scripts/setup-local.sh
```

#### Option 2: Manual setup

1. **Start Docker containers:**
   ```bash
   docker-compose up -d
   ```

2. **Restore .NET packages:**
   ```bash
   dotnet restore FopSystem.sln
   ```

3. **Run database migrations:**
   ```bash
   dotnet ef database update \
     --project src/FopSystem.Infrastructure/FopSystem.Infrastructure.csproj \
     --startup-project src/FopSystem.Api/FopSystem.Api.csproj
   ```

4. **Install frontend dependencies:**
   ```bash
   cd frontend
   pnpm install
   pnpm run build --filter=@fop/*
   ```

### Running the Application

**API Server:**
```bash
cd src/FopSystem.Api
dotnet run
```
API available at: http://localhost:5000
Swagger UI: http://localhost:5000/swagger

**Web Application:**
```bash
cd frontend/apps/web
pnpm dev
```
Web app available at: http://localhost:5173

**Mobile Application:**
```bash
cd frontend/apps/mobile
npx expo start
```

## Fee Calculation

The system calculates permit fees using the following formula:

```
Total Fee = (Base Fee + Seat Fee + Weight Fee) × Multiplier

Where:
- Base Fee: $500 USD
- Seat Fee: $10 × Number of Seats
- Weight Fee: $0.05 × MTOW (kg)

Multipliers by Permit Type:
- One-Time Permit: 1.0×
- Blanket Permit: 2.5×
- Emergency Permit: 0.5×
```

**Example Calculation (Boeing 737-800):**
- Seats: 189
- MTOW: 79,000 kg
- Type: One-Time

```
Base Fee:   $500
Seat Fee:   189 × $10 = $1,890
Weight Fee: 79,000 × $0.05 = $3,950
Subtotal:   $6,340
Total:      $6,340 × 1.0 = $6,340 USD
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/applications` | GET | List applications |
| `/api/applications` | POST | Create application |
| `/api/applications/{id}` | GET | Get application details |
| `/api/applications/{id}/submit` | POST | Submit application |
| `/api/applications/{id}/approve` | POST | Approve application |
| `/api/applications/{id}/reject` | POST | Reject application |
| `/api/operators` | GET/POST | Manage operators |
| `/api/aircraft` | GET/POST | Manage aircraft |
| `/api/documents` | POST | Upload documents |
| `/api/documents/{id}/verify` | POST | Verify document |
| `/api/fees/calculate` | POST | Calculate fee estimate |
| `/api/permits` | GET | List permits |
| `/api/permits/{number}/verify` | GET | Verify permit |
| `/health` | GET | Health check |

## Testing

**Run all tests:**
```bash
dotnet test
```

**Run specific test project:**
```bash
dotnet test tests/FopSystem.Domain.Tests
```

**Frontend tests:**
```bash
cd frontend
pnpm test
```

## Deployment

### Azure Deployment

1. **Login to Azure:**
   ```bash
   az login
   ```

2. **Deploy infrastructure:**
   ```bash
   ./infrastructure/scripts/deploy-azure.sh dev eastus
   ```

### CI/CD

The project includes GitHub Actions workflows:

- **CI (`.github/workflows/ci.yml`):** Runs on push/PR to main/develop
  - Build and test backend
  - Build and test frontend
  - Security scanning
  - Generate EF migration bundle
  - Docker build verification

- **CD (`.github/workflows/cd.yml`):** Runs on push to main
  - Deploy Azure infrastructure
  - Run database migrations
  - Deploy API to App Service
  - Deploy web to Static Web Apps

- **Mobile Build (`.github/workflows/mobile-build.yml`):** Manual trigger
  - Build iOS/Android apps via EAS

## Environment Variables

### API (.NET)

| Variable | Description |
|----------|-------------|
| `ConnectionStrings__DefaultConnection` | SQL Server connection string |
| `AzureStorage__ConnectionString` | Azure Blob Storage connection |
| `ServiceBus__ConnectionString` | Azure Service Bus connection |
| `Authentication__Authority` | Microsoft Entra ID authority |
| `Authentication__Audience` | API audience/client ID |

### Web (Vite)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

### Mobile (Expo)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL |

## User Roles

| Role | Permissions |
|------|-------------|
| **Applicant** | Submit applications, upload documents, view status |
| **Reviewer** | Review applications, request info, verify documents |
| **Approver** | Approve/reject applications, issue permits |
| **Finance Officer** | View financial reports, process payments |
| **Admin** | Full system access, user management |

## License

Copyright © 2024 British Virgin Islands Civil Aviation Department. All rights reserved.

## Support

For technical support, contact: support@bvicad.vg
