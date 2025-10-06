# Backend API Gaps & Requirements

This document captures backend endpoints that are referenced by the frontend implementation but are not yet implemented. Each section outlines the purpose, contract expectations, and business logic needed to unlock the corresponding UI flows.

---

## 1. Metadata Overview Summary
- **Endpoint**: `GET /metadata/overview`
- **Purpose**: Provide aggregate counts for catalog entities to populate dashboard summary cards and quick metrics.
- **Query Parameters**:
  - `brandRef` (string, required) – Tenant identifier; filters records to the active brand.
  - `structure` (string, optional) – Hierarchy node for additional scoping.
- **Response (200)**:
```json
{
  "databases": 2,
  "tables": 29,
  "columns": 780,
  "templates": 9,
  "metrics": 12,
  "metadataCoverage": 86.5
}
```
  - `metadataCoverage` (number, optional) represents percentage coverage of documented entities; return `null` if unavailable.
- **Error States**: Standard Nest error payload (`statusCode`, `message`, `error`). Return `403` when tenant is unauthorized, `500` for internal errors.
- **Implementation Notes**:
  - Data sources: Count rows across metadata tables filtered by `brandRef` / `structure`.
  - Cache results per tenant to reduce load; refresh on write operations or every 5 minutes.

---

## 2. Embedding Job Queue
- **Endpoint**: `GET /ai/embeddings/jobs`
- **Purpose**: Display current and recent embedding refresh jobs in the AI Control Center.
- **Query Parameters**:
  - `brandRef` (string, required)
  - `structure` (string, optional)
  - `limit` (number, optional, default 20) – Max number of jobs to return.
- **Response (200)**:
```json
[
  {
    "jobId": "emb-20241001-001",
    "resource": "columns",
    "status": "running",
    "submittedAt": "2025-10-01T10:15:00Z",
    "completedAt": null,
    "progress": 42
  },
  {
    "jobId": "emb-20240930-007",
    "resource": "tables",
    "status": "completed",
    "submittedAt": "2025-09-30T15:20:00Z",
    "completedAt": "2025-09-30T15:21:31Z",
    "progress": 100
  }
]
```
  - `status`: `queued` | `running` | `completed` | `failed`.
  - `progress`: integer 0-100 (optional but recommended).
- **Implementation Notes**:
  - Source data from job queue (BullMQ, custom scheduler, etc.).
  - Include tenant metadata associations for multi-tenant isolation.
  - Consider pagination or streaming updates in future versions.

---

## 3. Trigger Embedding Refresh
- **Endpoint**: `POST /ai/embeddings/refresh`
- **Purpose**: Frontend sends specific resource IDs for re-embedding when admins request regenerations.
- **Query Parameters**: `brandRef`, `structure` (same behavior as above).
- **Request Body**:
```json
{
  "resource": "columns",
  "ids": ["col-123", "col-456"]
}
```
- **Response (202)**:
```json
{
  "jobId": "emb-20241001-002",
  "status": "queued"
}
```
- **Validation Rules**:
  - `resource` limited to known entity types: `databases`, `tables`, `columns`, `metrics`, `templates`.
  - `ids` array must contain at least one ID, max 100 per request.
- **Implementation Notes**:
  - Enqueue background job and return reference ID immediately.
  - Enforce tenant scoping when selecting entities to embed.

---

## 4. Model Directory
- **Endpoint**: `GET /ai/models`
- **Purpose**: Populate model selector in AI Control Center.
- **Response (200)**:
```json
[
  { "name": "gpt-4.1-mini", "label": "GPT 4.1 Mini", "family": "openai", "default": true },
  { "name": "gpt-4o", "label": "GPT-4o", "family": "openai", "default": false }
]
```
- **Implementation Notes**:
  - Should read from configuration store; mark the current default via `default: true`.
  - Provide additional metadata as necessary (token limits, provider, etc.).

---

## 5. Set Default Model
- **Endpoint**: `POST /ai/models/default`
- **Purpose**: Allow admin to change default model for chat generation.
- **Request Body**:
```json
{ "model": "gpt-4o" }
```
- **Response (200)**:
```json
{ "success": true, "defaultModel": "gpt-4o" }
```
- **Implementation Notes**:
  - Persist selection per tenant (if required) or globally.
  - Validate model exists in `/ai/models` list.

---

## 6. Chat Completion Endpoint (Enhancements)
- **Endpoint**: `POST /chat/agent-chat`
- **Purpose**: Already partially implemented; ensure support for request body used in frontend.
- **Requirements**:
  - Accept `{ brandRef, structure, content, model, history }` with `history` as array of `{ role, content }`.
  - Return `{ content, usage: { promptTokens, completionTokens } }`.
  - Enrich response with references to RAG sources when available (future work).

---

## Delivery Notes
- Provide OpenAPI definitions for each endpoint (update `_referenceAPIs/api-doc.json`).
- Implement integration tests validating tenant scoping and expected payload schemas.
- Coordinate deployment with frontend integration to avoid runtime errors from missing routes.
