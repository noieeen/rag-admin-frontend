import { useTenantStore } from '@/stores/tenant';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

function resolveBaseUrl() {
  if (/^https?:\/\//i.test(RAW_BASE_URL)) {
    return RAW_BASE_URL;
  }

  const normalized = RAW_BASE_URL.startsWith('/') ? RAW_BASE_URL : `/${RAW_BASE_URL}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  return `${origin}${normalized}`;
}

export function createApiUrl(path: string, extraParams: Record<string, string | number | boolean | undefined | null> = {}) {
  const tenantStore = useTenantStore();
  const baseUrl = resolveBaseUrl().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  if (tenantStore?.activeTenant) {
    url.searchParams.set('brandRef', tenantStore.activeTenant.brandRef);
    if (tenantStore.activeTenant.structure) {
      url.searchParams.set('structure', tenantStore.activeTenant.structure);
    }
  }

  Object.entries(extraParams).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });

  return url;
}

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
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {})
  };

  const url = createApiUrl(path);

  const response = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: 'include'
  });

  if (!response.ok) {
    let errorPayload: unknown = null;
    try {
      errorPayload = await safeParseJson(response);
    } catch (parseError) {
      errorPayload = { message: (parseError as Error).message };
    }

    const message =
      typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload
        ? (errorPayload as { message?: string }).message ?? 'Request failed'
        : 'Request failed';

    const error = new Error(message);
    (error as Error & { status?: number; payload?: unknown }).status = response.status;
    (error as Error & { status?: number; payload?: unknown }).payload = errorPayload;
    throw error;
  }

  return (await safeParseJson(response)) as TResponse;
}

async function safeParseJson(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  if (!text) return null;

  if (!contentType.includes('application/json')) {
    return { message: text };
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { message: text };
  }
}
