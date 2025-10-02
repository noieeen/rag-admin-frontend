import type { AuditFields, Embedding, MultiLanguageKeywords, MultiLanguageValue } from './common';

export type DatabaseDialect = 'SQLServer' | 'PostgreSQL' | 'BigQuery' | string;

export interface DatabaseMetadata extends AuditFields {
  database_id: string;
  type: 'database' | string;
  database_name: string;
  brand_ref?: string;
  structure?: string;
  display_name: MultiLanguageValue;
  description: MultiLanguageValue;
  connection_string_ref?: string;
  dialect?: DatabaseDialect;
  tags?: MultiLanguageKeywords;
  last_synced_at?: string;
  metadata?: Record<string, unknown>;
  lang_available?: string[];
  embedding?: Embedding;
}

export type TableType = 'table' | 'view' | 'materialized_view' | string;

export interface TableMetadata extends AuditFields {
  table_id: string;
  type: TableType;
  database_id: string;
  brand_ref?: string;
  structure?: string;
  schema?: string;
  table_name: string;
  display_name: MultiLanguageValue;
  description: MultiLanguageValue;
  tags?: MultiLanguageKeywords;
  row_estimate?: number;
  storage_bytes?: number;
  ddl_snippet?: string;
  common_query_patterns?: string[];
  relevant_column_ids?: string[];
  related_template_ids?: string[];
  sensitivity?: string;
  access_control?: {
    required_roles?: string[];
    masking_policies?: string[];
  };
  usage_frequency?: number;
  last_used?: string;
  lang_available?: string[];
  embedding?: Embedding;
}

export type ColumnSensitivity = 'pii' | 'phi' | 'financial' | 'internal' | 'public' | string;

export interface ColumnMetadata extends AuditFields {
  column_id: string;
  type: 'column' | string;
  database_id: string;
  table_id: string;
  table_name: string;
  brand_ref?: string;
  structure?: string;
  column_name: string;
  ordinal_position?: number;
  display_name: MultiLanguageValue;
  description: MultiLanguageValue;
  data_type: string;
  max_length?: number | null;
  numeric_precision?: number | null;
  numeric_scale?: number | null;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  references?: {
    table?: string;
    column?: string;
    relationship_id?: string;
  };
  tags?: MultiLanguageKeywords;
  value_examples?: MultiLanguageKeywords;
  enum_values?: string[] | null;
  default_value?: string | number | boolean | null;
  is_sensitive_data?: boolean;
  sensitivity?: ColumnSensitivity;
  masking_policy?: string;
  lang_available?: string[];
  profiling_statistics?: {
    distinct_count?: number;
    null_fraction?: number;
    max_value?: string | number;
    min_value?: string | number;
  };
  embedding?: Embedding;
}

export interface TypicalRange {
  min: number;
  median: number;
  p95: number;
  max: number;
}

export type RefreshSchedule = 'daily' | 'hourly' | 'weekly' | 'monthly' | 'yearly';

export interface BusinessMetricName extends MultiLanguageValue {}

export interface BusinessMetricMetadata extends AuditFields {
  metric_id: string;
  type: 'business_metric' | string;
  database_id: string;
  metric_name: BusinessMetricName;
  short_name: string;
  description: MultiLanguageValue;
  business_domain: string;
  calculation_logic: string;
  sql_expression: string;
  relevant_table_ids: string[];
  relevant_column_ids: string[];
  unit_of_measure: string;
  aggregation_type: string;
  grain: 'customer' | 'order' | 'program' | 'product' | 'channel' | 'promotion' | 'basket' | 'item' | 'transaction' | string;
  business_owner: string;
  refresh_schedule: RefreshSchedule;
  refreshed_at: string;
  typical_range: TypicalRange;
  related_metrics: string[];
  common_filters: string[];
  tags: string[];
  usage_frequency: number;
  last_queried: string;
  model?: string;
  structure?: string;
  brand_ref?: string;
  embedding?: Embedding;
}

export interface QueryTemplateParameter {
  name: string;
  type: string;
  required: boolean;
  default_value: number | string | null;
  description: MultiLanguageValue;
  validation: {
    min?: number;
    max?: number;
    pattern?: string;
    allowed_values?: string[];
  };
}

export type QueryComplexity = 'SIMPLE' | 'MEDIUM' | 'COMPLEX';

export interface QueryTemplateMetadata extends AuditFields {
  query_template_id: string;
  type: 'query_template' | string;
  database_id?: string;
  brand_ref?: string;
  structure?: string;
  natural_language_question: MultiLanguageValue;
  sql_statement: string;
  relevant_table_ids: string[];
  relevant_column_ids: string[];
  relevant_view_ids?: string[];
  relevant_relationship_ids?: string[];
  parameters?: QueryTemplateParameter[];
  query_complexity?: QueryComplexity;
  estimated_rows_returned?: number;
  tags?: string[];
  performance_notes?: string;
  usage_frequency?: number;
  last_used?: string;
  lang_available?: string[];
  embedding?: Embedding;
}

export interface SynonymMapping {
  canonical_term: string;
  aliases: string[];
  entity_type: 'database' | 'table' | 'column' | 'metric' | 'template' | string;
  entity_id: string;
  brand_ref: string;
  structure?: string;
}
