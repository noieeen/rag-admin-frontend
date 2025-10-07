import { apiFetch, createApiUrl } from './http';
import type { ChatRequest, ChatResponse, ChatStreamRequest } from '@/types/api';

export async function sendChat(payload: ChatRequest) {
  return apiFetch<ChatResponse>(`/chat/agent-chat`, {
    method: 'POST',
    body: payload
  });
}

export async function streamChat(
  payload: ChatStreamRequest,
  options: { signal?: AbortSignal } = {}
): Promise<Response> {
  const url = createApiUrl(`/chat/agent-chat/stream`);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    },
    body: JSON.stringify({
      ...payload,
      stream: payload.stream ?? true
    }),
    signal: options.signal,
    credentials: 'include'
  });

  if (!response.ok) {
    let message = 'Stream request failed';
    try {
      const text = await response.text();
      if (text) {
        try {
          const parsed = JSON.parse(text) as { message?: string };
          message = parsed.message ?? message;
        } catch {
          message = text;
        }
      }
    } catch (error) {
      message = (error as Error).message ?? message;
    }

    const err = new Error(message);
    (err as Error & { status?: number }).status = response.status;
    throw err;
  }

  if (!response.body) {
    throw new Error('Stream response is missing a body');
  }

  return response;
}

export async function triggerEmbeddingRefresh(resource: string, ids: string[]) {
  return apiFetch<{ jobId: string }>(`/ai/embeddings/refresh`, {
    method: 'POST',
    body: { resource, ids }
  });
}

export async function listEmbeddingJobs() {
  return apiFetch<{
    jobId: string;
    resource: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    submittedAt: string;
    completedAt?: string;
  }[]>(`/ai/embeddings/jobs`);
}

export async function listModels() {
  return apiFetch<{ name: string; label: string; family: string; default?: boolean }[]>(`/ai/models`);
}

export async function setDefaultModel(model: string) {
  return apiFetch<{ success: boolean }>(`/ai/models/default`, {
    method: 'POST',
    body: { model }
  });
}
