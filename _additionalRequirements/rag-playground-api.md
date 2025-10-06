# RAG Playground API Requirements

The frontend RAG Playground relies on dedicated endpoints to execute test queries, preview metadata filters, and retrieve diagnostic data. The following contract extends the existing metadata and AI APIs.

## 1. Preview Filtered Metadata (Non-AI)
- **Endpoint**: `POST /rag/metadata/preview`
- **Purpose**: Perform semantic filtering over metadata entities without calling the LLM. Used in Preview mode to validate context before sending to AI.
- **Query Parameters**: `brandRef` (required), `structure` (optional).
- **Request Body**:
```json
{
  "query": "How many active loyalty members this month?",
  "scoreThreshold": 0.72,
  "topK": 10,
  "include": {
    "databases": true,
    "tables": ["b1c181fd-3af6-4af9-9ce8-bb0fdd5ef884"],
    "columns": true,
    "businessMetrics": ["7c5a3d91-4b2e-4f19-a8c7-9e2f1b8d6c4a"],
    "queryTemplates": false,
    "synonymMappings": false
  },
  "tags": ["loyalty", "kpi"]
}
```
- **Response (200)**:
```json
{
  "items": [
    {
      "entityType": "business_metric",
      "entityId": "7c5a3d91-4b2e-4f19-a8c7-9e2f1b8d6c4a",
      "score": 0.89,
      "title": "Active Loyalty Members",
      "snippet": "Count of customers who have made at least one purchase in the last 90 days..."
    },
    {
      "entityType": "table",
      "entityId": "b1c181fd-3af6-4af9-9ce8-bb0fdd5ef884",
      "score": 0.81,
      "title": "CRM_Customer",
      "snippet": "Customer master table for loyalty analytics..."
    }
  ]
}
```
- **Notes**:
  - Reuses vector search infrastructure, but skips LLM calls.
  - Supports pagination/cursor in future versions for large result sets.

## 2. Execute RAG Query (Ask AI)
- **Endpoint**: `POST /rag/metadata/query`
- **Purpose**: Run the generative cycle using either stored filters or explicit preview selections.
- **Query Parameters**: `brandRef`, `structure`.
- **Request Body**:
```json
{
  "query": "How many active loyalty members this month?",
  "model": "gpt-4.1-mini",
  "useHistory": true,
  "scoreThreshold": 0.72,
  "topK": 6,
  "include": {
    "databases": true,
    "tables": ["b1c181fd-3af6-4f9-9ce8-bb0fdd5ef884"],
    "columns": [],
    "businessMetrics": ["7c5a3d91-4b2e-4f19-a8c7-9e2f1b8d6c4a"],
    "queryTemplates": true,
    "synonymMappings": false
  },
  "tags": ["loyalty", "kpi"],
  "history": [
    { "role": "user", "content": "Show me yesterday sales" },
    { "role": "assistant", "content": "Yesterday sales were 1.5M THB" }
  ],
  "contextIds": [
    "business_metric:7c5a3d91-4b2e-4f19-a8c7-9e2f1b8d6c4a",
    "table:b1c181fd-3af6-4af9-9ce8-bb0fdd5ef884"
  ]
}
```
- **Response (200)**:
```json
{
  "answer": "There are 182,000 active loyalty members in the current month.",
  "latencyMs": 1843,
  "usage": {
    "promptTokens": 1123,
    "completionTokens": 65
  },
  "retrieval": {
    "topK": 6,
    "scoreThreshold": 0.72,
    "items": [
      {
        "entityType": "business_metric",
        "entityId": "7c5a3d91-4b2e-4f19-a8c7-9e2f1b8d6c4a",
        "score": 0.89,
        "title": "Active Loyalty Members",
        "snippet": "Count of customers who have made at least one purchase in the last 90 days..."
      }
    ]
  }
}
```
- **Notes**:
  - `contextIds` optional; when provided, generation must rely on the supplied identifiers (from preview results).
  - If omitted, the service should internally re-run preview logic.

## 3. Saved Sessions
- **Endpoint**: `GET /rag/playground/sessions`
- **Purpose**: Fetch recent playground runs per tenant for history sidebar.
- **Query Parameters**: `brandRef`, `structure`, optional `limit` (default 10).
- **Response (200)**: _unchanged from previous version_

### 3.1 Save Session
- **Endpoint**: `POST /rag/playground/sessions`
- **Request Body**: same structure as query request plus optional `name`.
- **Response (201)**: `{ "sessionId": "rag-20241001-001" }`.

### 3.2 Delete Session
- **Endpoint**: `DELETE /rag/playground/sessions/{sessionId}`.

## 4. Metadata Toggle Options
- **Endpoint**: `GET /rag/metadata/options`
- **Purpose**: Provide grouped entity lists for toggle panels. _Response unchanged._

## 5. Diagnostics Endpoint (Optional)
- **Endpoint**: `POST /rag/metadata/diagnostics`
- **Purpose**: Return low-level retrieval data (vector scores, SQL queries, latency breakdown) when `diagnostics: true` is present.

## Validation Rules
- `topK`: 1–20.
- `scoreThreshold`: 0–1 inclusive.
- At least one metadata category must be selected.
- `tags` limited to 20 strings.

## Security & Telemetry
- Apply tenant RBAC; log every query with user ID for auditing.
- Capture latency, model usage, and retrieval breakdown metrics to feed observability dashboards.

## OpenAPI
- Update `_referenceAPIs/api-doc.json` with these endpoints for frontend code generation.
