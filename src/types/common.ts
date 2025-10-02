export interface MultiLanguageValue {
  en: string;
  th: string;
  [key: string]: string;
}

export interface MultiLanguageKeywords {
  en: string[];
  th: string[];
  [key: string]: string[];
}

export interface Embedding {
  model: string;
  dimension: number;
  vector: number[];
  generated_at: string;
  source: string;
}

export interface AuditFields {
  created_at?: string;
  updated_at?: string;
  snapshot_version?: number;
}
