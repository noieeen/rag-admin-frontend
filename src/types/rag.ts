export type MetadataCategory =
  | 'databases'
  | 'tables'
  | 'columns'
  | 'businessMetrics'
  | 'queryTemplates'
  | 'synonymMappings';

export type PreviewIncludeValue = boolean | string[];

export type PreviewInclude = Partial<Record<MetadataCategory, PreviewIncludeValue>>;

export interface PreviewMetadataRequest {
  query: string;
  scoreThreshold?: number;
  topK?: number;
  include?: PreviewInclude;
  tags?: string[];
}

export interface PreviewMetadataItem {
  entityType: string;
  entityId: string;
  score: number;
  title: string;
  snippet?: string;
}

export interface PreviewMetadataResponse {
  items: PreviewMetadataItem[];
}
