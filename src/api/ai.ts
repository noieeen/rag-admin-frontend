import { apiFetch } from './http';
import type { ChatRequest, ChatResponse } from '@/types/api';

export async function sendChat(payload: ChatRequest) {
  return apiFetch<ChatResponse>(`/ai/chat`, {
    method: 'POST',
    body: payload
  });
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
