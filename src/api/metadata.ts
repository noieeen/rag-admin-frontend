import { apiFetch } from './http';
import type {
  BusinessMetricMetadata,
  ColumnMetadata,
  DatabaseMetadata,
  QueryTemplateMetadata,
  SynonymMapping,
  TableMetadata
} from '@/types/metadata';
import type {
  CreateColumnRequest,
  CreateDatabaseRequest,
  CreateMetricRequest,
  CreateTemplateRequest,
  CreateTableRequest,
  PaginatedResponse,
  SynonymMappingRequest,
  VectorSearchParams
} from '@/types/api';

export async function listDatabases(withVector = false) {
  const searchParams = new URLSearchParams({ withVector: String(withVector) });
  return apiFetch<DatabaseMetadata[]>(`/metadata/databases?${searchParams.toString()}`);
}

export async function createDatabase(payload: CreateDatabaseRequest) {
  return apiFetch<DatabaseMetadata>(`/metadata/databases`, {
    method: 'POST',
    body: payload
  });
}

export async function searchDatabases(params: VectorSearchParams) {
  const query = new URLSearchParams({
    query: params.query,
    limit: String(params.limit ?? 10),
    scoreThreshold: String(params.scoreThreshold ?? 0.75),
    withVector: String(params.withVector ?? false)
  });
  return apiFetch<DatabaseMetadata[]>(`/metadata/databases/search?${query.toString()}`);
}

export async function listTables(withVector = false) {
  const searchParams = new URLSearchParams({ withVector: String(withVector) });
  return apiFetch<TableMetadata[]>(`/metadata/tables?${searchParams.toString()}`);
}

export async function createTable(payload: CreateTableRequest) {
  return apiFetch<TableMetadata>(`/metadata/tables`, {
    method: 'POST',
    body: payload
  });
}

export async function listColumns(withVector = false) {
  const searchParams = new URLSearchParams({ withVector: String(withVector) });
  return apiFetch<ColumnMetadata[]>(`/metadata/columns?${searchParams.toString()}`);
}

export async function createColumn(payload: CreateColumnRequest) {
  return apiFetch<ColumnMetadata>(`/metadata/columns`, {
    method: 'POST',
    body: payload
  });
}

export async function listBusinessMetrics() {
  return apiFetch<BusinessMetricMetadata[]>(`/metadata/business-metrics`);
}

export async function createBusinessMetric(payload: CreateMetricRequest) {
  return apiFetch<BusinessMetricMetadata>(`/metadata/business-metrics`, {
    method: 'POST',
    body: payload
  });
}

export async function updateBusinessMetric(metricId: string, payload: CreateMetricRequest) {
  return apiFetch<BusinessMetricMetadata>(`/metadata/business-metrics/${metricId}`, {
    method: 'PUT',
    body: payload
  });
}

export async function deleteBusinessMetric(metricId: string) {
  return apiFetch<{ success: boolean }>(`/metadata/business-metrics/${metricId}`, {
    method: 'DELETE'
  });
}

export async function listQueryTemplates() {
  return apiFetch<QueryTemplateMetadata[]>(`/metadata/query-templates`);
}

export async function createQueryTemplate(payload: CreateTemplateRequest) {
  return apiFetch<QueryTemplateMetadata>(`/metadata/query-templates`, {
    method: 'POST',
    body: payload
  });
}

export async function updateQueryTemplate(templateId: string, payload: CreateTemplateRequest) {
  return apiFetch<QueryTemplateMetadata>(`/metadata/query-templates/${templateId}`, {
    method: 'PUT',
    body: payload
  });
}

export async function deleteQueryTemplate(templateId: string) {
  return apiFetch<{ success: boolean }>(`/metadata/query-templates/${templateId}`, {
    method: 'DELETE'
  });
}

export async function listSynonyms(withVector = false) {
  const searchParams = new URLSearchParams({ withVector: String(withVector) });
  return apiFetch<SynonymMapping[]>(`/metadata/synonym-mappings?${searchParams.toString()}`);
}

export async function createSynonymMapping(payload: SynonymMappingRequest) {
  return apiFetch<SynonymMapping>(`/metadata/synonym-mappings`, {
    method: 'POST',
    body: payload
  });
}

export async function updateSynonymMapping(id: string, payload: SynonymMappingRequest) {
  return apiFetch<SynonymMapping>(`/metadata/synonym-mappings/${id}`, {
    method: 'PUT',
    body: payload
  });
}

export async function deleteSynonymMapping(id: string) {
  return apiFetch<{ success: boolean }>(`/metadata/synonym-mappings/${id}`, {
    method: 'DELETE'
  });
}

export async function getOverviewSummary() {
  return apiFetch<{
    databases: number;
    tables: number;
    columns: number;
    templates: number;
    metrics: number;
    metadataCoverage?: number;
  }>(`/metadata/overview`);
}

export async function listRelationships() {
  return apiFetch<{
    relationship_id: string;
    type: string;
    from_table_id: string;
    to_table_id: string;
    join_type: string;
  }[]>(`/metadata/relationships`);
}
