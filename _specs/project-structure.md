# Project Structure

```
ai-admin-management/
├─ src/
│  ├─ api/                  # Typed API clients (metadata, AI services)
│  ├─ assets/               # Global styles (Tailwind entry)
│  ├─ components/           # Reusable UI pieces + tests
│  │  ├─ ui/                # shadcn-style primitives (Card, etc.)
│  │  └─ __tests__/         # Component unit tests (Vitest + @testing-library)
│  ├─ composables/          # TanStack Query hooks (metadata, AI controls)
│  ├─ layouts/              # Application shell(s)
│  ├─ router/               # Route definitions
│  ├─ stores/               # Pinia stores (tenant context)
│  ├─ types/                # Domain typing from `_referenceModels`
│  ├─ utils/                # Formatting helpers
│  └─ views/                # Route-aligned pages (dashboard, metadata, AI)
│     └─ metadata/dialogs/  # CRUD modals (e.g., create database)
├─ _referenceAPIs/          # OpenAPI contract supplied by backend
├─ _referenceModels/        # TypeScript reference models for entities
├─ _referenceUI/            # PNG mockups for dashboard & SQL pattern flows
├─ _specs/                  # Project specifications (this folder)
├─ public/ (future)         # Static assets if needed
├─ package.json             # pnpm scripts and dependencies
├─ pnpm-lock.yaml           # Locked dependency graph
├─ vite.config.ts           # Vite + dev proxy (API)
├─ tailwind.config.ts       # Tailwind theme tokens and plugins
├─ tsconfig.*               # TypeScript compiler configs
├─ vitest.config.ts         # Vitest setup (jsdom + Vue plugin)
└─ README.md                # Quick start documentation
```

## Routing Overview
- `/` → `src/views/dashboard/OverviewView.vue`
- `/databases` → `src/views/metadata/DatabasesView.vue`
- `/tables` → `src/views/metadata/TablesView.vue`
- `/columns` → `src/views/metadata/ColumnsView.vue`
- `/relationships` → `src/views/metadata/RelationshipsView.vue`
- `/templates` → `src/views/templates/TemplatesView.vue`
- `/sql-patterns` → `src/views/templates/SqlPatternsView.vue`
- `/metrics` → `src/views/metrics/BusinessMetricsView.vue`
- `/ai-control` → `src/views/ai/AiControlView.vue`

## State Management
- `useTenantStore` provides active tenant context (brandRef, structure) persisted in memory.
- TanStack Query composables pull backend data and auto-invalidate when the tenant changes.

## Styling System
- Tailwind CSS with CSS variables defined in `src/assets/main.css` for light/dark modes.
- Component sizing and spacing derived from shadcn defaults; dark theme variables already present for future toggle.
