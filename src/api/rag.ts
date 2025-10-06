import { apiFetch } from './http';
import type { PreviewMetadataRequest, PreviewMetadataResponse } from '@/types/rag';

export async function previewMetadata(payload: PreviewMetadataRequest) {
  return apiFetch<PreviewMetadataResponse, PreviewMetadataRequest>(
    '/rag/metadata/preview',
    {
      method: 'POST',
      body: payload
    }
  );
}
