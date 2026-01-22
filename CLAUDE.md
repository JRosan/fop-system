# BVI Foreign Operator Permit (FOP) System

This is a full-stack application for the British Virgin Islands Civil Aviation Department to manage Foreign Operator Permit applications.

## Quick Reference

### Build & Run Commands

**Backend (.NET 10):**
```bash
# Build solution
dotnet build

# Run tests
dotnet test

# Run API (from src/FopSystem.Api)
dotnet run
```

**Frontend (pnpm + Turborepo):**
```bash
# Install dependencies (from frontend/)
pnpm install

# Run web app (from frontend/)
pnpm dev

# Run mobile app (from frontend/apps/mobile)
npm start
# Or for web browser
npx expo start --web
```

### API Endpoints
- API: http://localhost:5000
- Scalar API Docs: http://localhost:5000/scalar

### Frontend URLs
- Web App: http://localhost:5174
- Mobile Web: http://localhost:8085

## Architecture

### Backend Structure (Clean Architecture)
```
src/
├── FopSystem.Domain/           # Domain entities, value objects, services
├── FopSystem.Application/      # CQRS commands/queries (MediatR)
├── FopSystem.Infrastructure/   # EF Core, Azure services, background jobs
└── FopSystem.Api/              # .NET 10 Minimal APIs
```

### Frontend Structure (Monorepo)
```
frontend/
├── apps/
│   ├── web/                    # React + Vite web application
│   └── mobile/                 # Expo SDK 53 React Native app
└── packages/
    ├── api/                    # Axios API client
    ├── core/                   # Zustand state management
    ├── theme/                  # Design tokens
    ├── types/                  # Shared TypeScript types
    ├── ui/                     # Shared UI components
    └── validation/             # Zod schemas
```

## Key Patterns & Conventions

### Backend
- **CQRS**: Commands and Queries separated via MediatR
- **Domain-Driven Design**: Aggregates, value objects, domain events
- **Value Objects**: `Money`, `Weight`, `InsurancePolicy` for type safety
- **Fee Calculation**: `(Base + Seats × PerSeat + Weight × PerKg) × Multiplier`
  - One-Time: 1.0x, Blanket: 2.5x, Emergency: 0.5x

### Frontend
- **State Management**: Zustand stores in `packages/core`
- **Form Validation**: Zod schemas in `packages/validation`
- **API Client**: Axios with interceptors in `packages/api`
- **Environment Variables**: Use `import.meta.env.VITE_*` (not `process.env`)

## Database
- SQL Server (local instance: "Mattie")
- Connection string in `src/FopSystem.Api/appsettings.Development.json`

## Testing
```bash
# Run all backend tests
dotnet test

# Run specific test project
dotnet test tests/FopSystem.Domain.Tests
dotnet test tests/FopSystem.Api.Tests
```
