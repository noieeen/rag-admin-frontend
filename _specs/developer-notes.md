# Developer Notes

## Environment Setup
1. Install Node.js 20+ and pnpm (`corepack enable pnpm`).
2. Copy `.env.example` to `.env` and adjust values (defaults to `/api` proxy).
3. Install dependencies: `pnpm install` (requires network access to npm registry).
4. Start backend (`nest-rag-ai`) on `http://localhost:3001`.
5. Run frontend dev server: `pnpm dev` (launches at `http://localhost:5173`).

## Available Scripts
- `pnpm dev` – Vite dev server with HMR and API proxy.
- `pnpm build` – Type check (`vue-tsc`) then bundle.
- `pnpm preview` – Serve production build locally.
- `pnpm lint` – ESLint (`.eslintrc.cjs`).
- `pnpm test` – Vitest with jsdom + @testing-library/vue setup.

## Data Flow & Querying
- Pinia `tenant` store holds active `brandRef` and `structure`; API wrapper automatically appends them to every request.
- TanStack Query caches metadata by tenant. Changing tenant invalidates relevant keys (see `useMetadataQueries.ts`).
- API errors bubble with enriched `Error` objects containing `status` and `payload` for toasts/logging.

## Coding Standards
- TypeScript strict mode; shared types under `src/types` to align with `_referenceModels`.
- Components favor `<script setup>`; keep functions/props typed.
- Avoid non-ASCII unless required (Thai content from reference models is acceptable).
- Use Tailwind utility classes; isolate repeated patterns into UI primitives under `src/components/ui`.

## UI/UX Considerations
- Maintain monochrome base with semantic accent colors (success, error, warning).
- Keep forms accessible: label + input pairing, focus states, descriptive error text.
- Provide skeleton or loading states for long-running fetches.
- Future: integrate detail views, pagination, and inline editing.

## Testing Strategy
- Unit/component tests with @testing-library/vue for critical components (e.g., TenantSwitcher).
- Plan integration tests validating store + API hook interactions (mock fetch with MSW or similar).
- E2E tests (Cypress or Playwright) recommended for CRUD flows once endpoints are stable.

## Deployment Notes
- Production build expects backend served under same origin or CORS-enabled domain; adjust `VITE_API_BASE_URL` accordingly.
- Consider enabling service worker or static hosting on Netlify/Vercel with rewrite rules for `/api` proxying to backend gateway.

## Pending Tasks
- Implement remaining CRUD dialogs (tables, columns, metrics, templates).
- Connect SQL Patterns view when backend endpoint is available.
- Add toast notifications + error boundary pattern.
- Expand test coverage beyond tenant switcher and ensure CI integration.
