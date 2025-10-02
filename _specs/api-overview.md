# API Overview

## Base Configuration
- Base URL (dev): `http://localhost:3001`
- Frontend consumes through Vite proxy at `/api` (see `.env.example`).
- All requests require `brandRef` (query param) and optionally `structure` to enforce tenant scoping.
- JSON payloads; UTF-8 encoding; standard HTTP status codes.

## Authentication & Headers
- Backend currently expects session cookie (`credentials: include`); adjust when auth module is finalized.
- Requests should set `Content-Type: application/json` for body payloads.

## Primary Domains

### Metadata
| Endpoint | Method | Description |
| --- | --- | --- |
| `/metadata/overview` | GET | Summary counts for databases, tables, columns, templates, metrics, coverage. |
| `/metadata/databases` | GET/POST | List or create database metadata. Supports `withVector` flag (boolean string). |
| `/metadata/databases/{id}` | GET/PUT/DELETE | Retrieve or mutate single database record. |
| `/metadata/databases/search` | GET | Vector search over databases (`query`, `limit`, `scoreThreshold`, `withVector`). |
| `/metadata/tables` | GET/POST | Manage table catalog entries. |
| `/metadata/columns` | GET/POST | Manage column entries, includes profiling and sensitivity info. |
| `/metadata/relationships` | GET/POST | Retrieve or register join relationships. |
| `/metadata/business-metrics` | GET/POST | Manage business metrics with calculation logic and embeddings. |
| `/metadata/templates` | GET/POST | Manage query templates; payload aligns with `_referenceModels/query-template.model.ts`. |
| `/metadata/synonym-mappings` | GET/POST | CRUD operations for canonical term -> aliases mappings. |

### AI & RAG
| Endpoint | Method | Description |
| --- | --- | --- |
| `/ai/models` | GET | List available model options; response marks default model. |
| `/ai/models/default` | POST | Set default model `{ model: string }`. |
| `/ai/embeddings/jobs` | GET | Fetch embedding job queue/status. |
| `/ai/embeddings/refresh` | POST | Trigger refresh `{ resource: string, ids: string[] }`. |
| `/ai/chat` | POST | Chat completion with history, brand context, and target model. |

### Miscellaneous
- `/health` (if enabled) for uptime checks.
- Root `/` returns basic status (used by Nest starter).

## Common Query Parameters
- `brandRef` (string) – required tenant key.
- `structure` (string) – taxonomy/hierarchy context; optional.
- `withVector` (string) – `'true'`/`'false'`; determines payload embedding inclusion.
- Pagination parameters upcoming: `page`, `pageSize` (not yet implemented).

## Error Handling
- Error payload shape: `{ message: string, statusCode?: number, error?: string }` (NestJS default). Non-JSON responses will return raw text; frontend surfaces errors via toast/log.

## Versioning & Changes
- Current contract derived from `_referenceAPIs/api-doc.json` (OpenAPI 3.0). Keep docs in sync when backend changes operations or schemas.
- Future enhancements: add PATCH endpoints for partial updates, bulk import routes for CSV/JSON ingestion, streaming endpoints for chat.
