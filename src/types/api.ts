import type {
  BusinessMetricMetadata,
  ColumnMetadata,
  DatabaseMetadata,
  QueryTemplateMetadata,
  SynonymMapping,
  TableMetadata
} from './metadata';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface MetadataListResponse {
  databases?: PaginatedResponse<DatabaseMetadata>;
  tables?: PaginatedResponse<TableMetadata>;
  columns?: PaginatedResponse<ColumnMetadata>;
  metrics?: PaginatedResponse<BusinessMetricMetadata>;
  templates?: PaginatedResponse<QueryTemplateMetadata>;
}

export interface VectorSearchParams {
  query: string;
  limit?: number;
  scoreThreshold?: number;
  withVector?: boolean;
}

export interface BaseMetadataRequest {
  brandRef: string;
  structure?: string;
}

export interface CreateDatabaseRequest extends BaseMetadataRequest {
  database: DatabaseMetadata;
}

export interface CreateTableRequest extends BaseMetadataRequest {
  table: TableMetadata;
}

export interface CreateColumnRequest extends BaseMetadataRequest {
  column: ColumnMetadata;
}

export interface CreateMetricRequest extends BaseMetadataRequest {
  metric: BusinessMetricMetadata;
}

export interface CreateTemplateRequest extends BaseMetadataRequest {
  template: QueryTemplateMetadata;
}

export interface SynonymMappingRequest extends BaseMetadataRequest {
  mapping: SynonymMapping;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest extends BaseMetadataRequest {
  content: string;
  model: string;
  history: ChatMessage[];
  temperature?: number;
  ragEnabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface ChatStreamRequest extends ChatRequest {
  stream?: boolean;
  reasoningMode?: 'default' | 'verbose';
}

export type AgentStreamEventType =
  | 'status'
  | 'tool_call'
  | 'tool_result'
  | 'metadata'
  | 'message'
  | 'thinking'
  | 'final'
  | 'error';

export interface AgentStreamEvent<TPayload = unknown> {
  type: AgentStreamEventType | (string & {});
  timestamp?: string;
  payload: TPayload;
  raw?: unknown;
}
