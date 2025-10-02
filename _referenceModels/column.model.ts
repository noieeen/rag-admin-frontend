import {EmbeddingModel} from './embedding.model';
import {
    MultiLanguageKeywordsModel,
    MultiLanguageModel,
} from './metadata.model';

export type ColumnSensitivity = 'pii' | 'phi' | 'financial' | 'internal' | 'public' | string;

export class ColumnModel {
    column_id: string;
    type: 'column' | string;
    database_id: string;
    table_id: string;
    table_name: string;
    brand_ref?: string;
    structure?: string;
    column_name: string;
    ordinal_position?: number;
    display_name: MultiLanguageModel;
    description: MultiLanguageModel;
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
    tags?: MultiLanguageKeywordsModel;
    value_examples?: MultiLanguageKeywordsModel;
    enum_values?: string[] | null;
    default_value?: string | number | boolean | null;
    is_sensitive_data?: boolean;
    sensitivity?: ColumnSensitivity;
    masking_policy?: string;
    created_at?: string;
    updated_at?: string;
    snapshot_version?: number;
    lang_available?: string[];
    profiling_statistics?: {
        distinct_count?: number;
        null_fraction?: number;
        max_value?: string | number;
        min_value?: string | number;
    };
    embedding?: EmbeddingModel;

    [key: string]: any;
}

export class ColumnWithVectorModel extends ColumnModel {
    declare embedding: EmbeddingModel;
}

export const sampleColumn: ColumnWithVectorModel = {
    column_id: 'f3d3a3df-6c4a-4dba-b1b9-2d4cb1122334',
    type: 'column',
    database_id: '46cb1ce1-848b-4561-bed7-1f35c1a81a5c',
    table_id: 'b1c181fd-3af6-4af9-9ce8-bb0fdd5ef884',
    table_name: 'CRM_Customer',
    brand_ref: 'BL6ZLW8PXBXD',
    structure: 'L4',
    column_name: 'Point_Balance',
    ordinal_position: 32,
    display_name: {
        en: 'Current Point Balance',
        th: 'ยอดคะแนนสะสมปัจจุบัน',
    },
    description: {
        en: 'Total loyalty points currently available for a customer after accrual and redemption.',
        th: 'ยอดคะแนนสะสมที่ลูกค้าสามารถใช้ได้หลังจากสะสมและแลกแต้ม.',
    },
    data_type: 'INT',
    max_length: null,
    numeric_precision: 10,
    numeric_scale: 0,
    is_nullable: false,
    is_primary_key: false,
    is_foreign_key: false,
    tags: {
        en: ['loyalty', 'points', 'balance', 'kpi'],
        th: ['สะสมแต้ม', 'คะแนน', 'ยอดคงเหลือ'],
    },
    value_examples: {
        en: ['15420', '9850', '2375'],
        th: ['15420', '9850', '2375'],
    },
    enum_values: null,
    is_sensitive_data: false,
    sensitivity: 'internal',
    created_at: '2025-01-15T09:30:00Z',
    updated_at: '2025-09-20T11:05:00Z',
    snapshot_version: 4,
    lang_available: ['en', 'th'],
    profiling_statistics: {
        distinct_count: 18234,
        null_fraction: 0.0,
        max_value: 254000,
        min_value: 0,
    },
    embedding: {
        model: 'openai/text-embedding-3-small',
        dimension: 1536,
        vector: [],
        generated_at: '2025-09-29T10:25:00Z',
        source: 'display_name + description + tags + data_type',
    },
};
