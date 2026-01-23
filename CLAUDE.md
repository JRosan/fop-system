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

## UI/UX Design System (BVI Sovereign)

The design system reflects the British Virgin Islands' geography and establishes trust for government aviation operations. All components support multi-tenant white-labeling via theme tokens.

### Frameworks
- **Web**: Tailwind CSS with custom `bvi-*` color classes
- **Mobile**: StyleSheets with ThemeProvider pattern

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `bvi-atlantic` | `#002D56` | Primary buttons, navigation, headers — anchors authority |
| `bvi-turquoise` | `#00A3B1` | Success states, links, active indicators, progress bars |
| `bvi-sand` | `#F9FBFB` | Page backgrounds, surfaces — reduces eye strain |
| `bvi-granite` | `#4A5568` | Secondary text, muted content, borders |
| `bvi-gold` | `#C5A059` | High-value data, fees, premium accents, revenue highlights |

### Semantic Color Mapping

| Context | Color | Example |
|---------|-------|---------|
| Primary Actions | `bvi-atlantic-600` | Submit buttons, nav items |
| Success/Active | `bvi-turquoise-500` | "Verified", "Active" badges |
| Warning/Critical | `bvi-gold-500` | "Insurance Expiring" alerts |
| Revenue/Financial | `bvi-gold-400` | Fee displays, revenue metrics |
| Backgrounds | `bvi-sand-50` | Page canvas, card surfaces |

### Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display/Headings | Montserrat | 600-800 | Page titles, section headers — architectural authority |
| Body/Data | Inter | 400-600 | Forms, tables, descriptions — optimal legibility |
| Monospace/Code | JetBrains Mono | 400-600 | Fees, calculations, technical data |

### Component Patterns

- **Glassmorphism Cards**: `backdrop-blur-xl`, `bg-*/80` opacity, `border-*/20` borders
- **Glow Effects**: `box-shadow` with turquoise/atlantic at 15-25% opacity
- **Hover States**: Border color transitions to `bvi-turquoise-500/30`
- **Animations**: `float` (6s), `glow-pulse` (3s) for dashboard elements

### Multi-Tenant White-Labeling (SaaS Pattern)

All components receive colors via theme context to support territory customization:

```typescript
// Theme tokens structure (packages/theme/src/colors.ts)
const tenantThemes = {
  bvi: {
    primary: '#002D56',    // Deep Atlantic
    accent: '#00A3B1',     // Virgin Turquoise
    surface: '#F9FBFB',    // Coral White
    gold: '#C5A059',       // Prestige Gold
  },
  cayman: {
    primary: '#006847',    // Racing Green
    accent: '#00A3B1',     // Keep turquoise
    surface: '#F9FBFB',
    gold: '#C5A059',
  },
};
```

### AI/ML Visualization Patterns

- **Predictive UI**: Use `bvi-turquoise` to highlight ML-recommended actions
- **Revenue Heatmaps**: Use `bvi-gold` gradients against `bvi-atlantic` backgrounds
- **Risk Indicators**: Amber/gold for expiring insurance, turquoise for compliant

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
