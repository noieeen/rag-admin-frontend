# Agent Chat Stream API

This document captures the assumptions the frontend `ChatPlaygroundView` makes about the streaming chat controller introduced for the agent playground.

## Endpoint

- **Method**: `POST`
- **Path**: `/api/chat/agent-chat/stream`
- **Authentication**: Same session/cookie mechanism as existing admin APIs.
- **Query Parameters** (populated automatically):
  - `brandRef` — active tenant brand reference (string, required)
  - `structure` — optional tenant structure identifier

## Request Payload

```jsonc
{
  "brandRef": "brand_123",           // required, echoed for backend validation
  "structure": "enterprise",         // optional
  "model": "gpt-4.1-mini",           // required, one of listModels()
  "content": "Show 10 customers",    // latest user prompt
  "history": [                       // chronological chat history
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "temperature": 0.2,                // optional, number (0 - 2)
  "ragEnabled": true,                // optional, defaults true
  "stream": true,                    // optional, defaults true
  "metadata": {                      // optional free-form k/v for extra controls
    "conversationId": "uuid"
  },
  "reasoningMode": "default"         // optional, reserved for future CoT features
}
```

## Response

- `Content-Type`: `text/event-stream` or `application/x-ndjson`
- Each event is emitted either as proper SSE frames (`event:` + `data:`) or as single-line `<eventName>{...}` JSON objects.

### Supported Event Types

| Event        | Payload schema (examples)                                                                                    | Frontend usage                                     |
|--------------|--------------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| `status`     | `{ "executionId": "uuid", "state": "started\|completed\|failed" }`                                           | Updates status indicator                           |
| `message`    | `{ "delta": "string" }` or `{ "content": { "text": "..." } }`                                                | Appends streamed text to the assistant bubble      |
| `final`      | `{ "type": "text", "content": { "message": "..." }, "tokenBreakdown": { "promptTokens": 100, ... } }`        | Finalizes assistant reply & displays token usage   |
| `thinking`   | `{ "text": "chain of thought…" }`                                                                            | Adds to "Reasoning Trace" panel                    |
| `tool_call`  | `{ "toolName": "sqlPatternTool", "input": "{\"input\":\"show 10\"}" }`                                       | Creates/updates tool activity list                 |
| `tool_result`| `{ "toolName": "sqlPatternTool", "output": "{\"rows\": []}" }`                                               | Completes tool activity entry                      |
| `metadata`   | `{ "tokensUsed": 3536, "...": "..." }`                                                                       | Fallback token usage display                       |
| `error`      | `{ "message": "detail" }`                                                                                    | Shows inline error in assistant bubble             |

The response should remain open until the `final` (or `error`) event is sent, after which the connection can close.

### Markdown formatted responses

To support richer rendering (headers, lists, tables, inline callouts) the backend can return Markdown payloads without breaking existing clients.

- For incremental chunks emit:

  ```jsonc
  {
    "delta": {
      "format": "markdown",
      "text": "Partial **markdown** content..."
    }
  }
  ```

  When the delta is a string, consumers assume plain text. When an object is returned, clients should inspect the `format` field; unknown formats are ignored.

- `final` events should include the consolidated Markdown response:

  ```jsonc
  {
    "type": "text",
    "format": "markdown",
    "content": {
      "message": "# Heading\n\nFull assistant answer in markdown…"
    },
    "tokenBreakdown": { "promptTokens": 800, "completionTokens": 250 }
  }
  ```

- Tool and metadata events remain unchanged; they can optionally carry Markdown snippets using the same `{ format, text }` shape.

- Older clients that do not check `format` will continue to display the raw markdown (which is acceptable for the admin playground). New UIs may render it using a Markdown engine (e.g. `markdown-it`, `@tanstack/vue-markdown`, `marked`, etc.).

### Example Stream (mixed format)

```
status{"executionId":"abc","state":"started"}
message{"delta":"Working on it"}
tool_call{"toolName":"sqlPatternTool","input":"{\"input\":\"show 10 customer\"}"}
tool_result{"toolName":"sqlPatternTool","output":"[]"}
thinking{"text":"No customer table detected, asking for clarification."}
final{"type":"text","content":{"message":"I couldn't find a customer table..."}, "tokenBreakdown":{"promptTokens":800,"completionTokens":250}}
status{"executionId":"abc","state":"completed"}
```

The frontend tolerates either newline-delimited JSON or regulation SSE frames and gracefully ignores blank/heartbeat lines.
