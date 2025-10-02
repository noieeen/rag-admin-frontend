import { useTenantStore } from '@/stores/tenant';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const tenantStore = useTenantStore();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {})
  };

  const url = new URL(path, API_BASE_URL);
  if (tenantStore?.activeTenant) {
    url.searchParams.set('brandRef', tenantStore.activeTenant.brandRef);
    if (tenantStore.activeTenant.structure) {
      url.searchParams.set('structure', tenantStore.activeTenant.structure);
    }
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: 'include'
  });

  if (!response.ok) {
    const errorPayload = await safeParseJson(response);
    const error = new Error(errorPayload?.message ?? 'Request failed');
    (error as Error & { status?: number; payload?: unknown }).status = response.status;
    (error as Error & { status?: number; payload?: unknown }).payload = errorPayload;
    throw error;
  }

  return (await safeParseJson(response)) as TResponse;
}

async function safeParseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON response', error);
    return null;
  }
}
