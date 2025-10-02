# RAG Admin Frontend

A Vue 3 + Vite admin console for managing RAG metadata, embeddings, and AI orchestration backed by the NestJS API at `http://localhost:3001`.

## Tech Stack

- Vue 3 (Composition API)
- Vite + TypeScript
- Tailwind CSS + shadcn-vue style primitives
- Pinia for state management
- TanStack Query for server state
- Radix Vue + lucide icons for polished UI

## Getting Started

```bash
pnpm install
pnpm dev
```

Create a `.env` file based on `.env.example` to configure the API base URL.

The frontend expects the backend API (Nest `nest-rag-ai`) to be running locally and serving the endpoints described in `/_referenceAPIs/api-doc.json`.

## Scripts

- `pnpm dev` – start the Vite dev server
- `pnpm build` – type-check and build
- `pnpm preview` – preview the production build
- `pnpm lint` – run ESLint
- `pnpm test` – run unit/component tests via Vitest

## Project Structure

- `src/layouts` – global shells and navigation
- `src/views` – route-aligned pages (overview, metadata entities, AI control)
- `src/components` – reusable UI pieces (cards, command palette, tenant switcher)
- `src/api` – typed API clients wrapping the Nest backend endpoints
- `src/composables` – TanStack Query hooks for data access and AI controls
- `src/stores` – Pinia stores for tenant context
- `src/types` – domain entities derived from `_referenceModels`

## Next Steps

- Integrate form validation and full CRUD flows for all metadata entities
- Expand testing coverage with @testing-library/vue scenarios
- Polish SQL Patterns module once backend endpoint is available

## Notes

Package installation currently requires network access to npm. If you run `pnpm install` inside a restricted environment, mirror the packages or provide offline tarballs.
