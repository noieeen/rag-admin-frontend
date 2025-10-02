import {EmbeddingModel} from './embedding.model';
import {
    MultiLanguageKeywordsModel,
    MultiLanguageModel,
} from './metadata.model';
import {QueryTemplateModel} from './query-template.model';

export type TableType = 'table' | 'view' | 'materialized_view' | string;

export class TableModel {
    table_id: string;
    type: TableType;
    database_id: string;
    brand_ref?: string;
    structure?: string;
    schema?: string;
    table_name: string;
    display_name: MultiLanguageModel;
    description: MultiLanguageModel;
    tags?: MultiLanguageKeywordsModel;
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
    created_at?: string;
    updated_at?: string;
    snapshot_version?: number;
    lang_available?: string[];
    usage_frequency?: number;
    last_used?: string;
    embedding?: EmbeddingModel;
    recommended_templates?: QueryTemplateModel[];

    [key: string]: any;
}

export class TableWithVectorModel extends TableModel {
    declare embedding: EmbeddingModel;
}

export const sampleTable: TableWithVectorModel = {
    table_id: 'b1c181fd-3af6-4af9-9ce8-bb0fdd5ef884',
    type: 'table',
    database_id: '46cb1ce1-848b-4561-bed7-1f35c1a81a5c',
    brand_ref: 'BL6ZLW8PXBXD',
    structure: 'L4',
    schema: 'dbo',
    table_name: 'CRM_Customer',
    display_name: {
        en: 'Customer Information',
        th: 'ข้อมูลลูกค้า',
    },
    description: {
        en: 'Customer master table for loyalty analytics, including membership status, point balances, and contact preferences.',
        th: 'ตารางข้อมูลลูกค้าพื้นฐานสำหรับการวิเคราะห์ความภักดี รวมระดับสมาชิก ยอดคะแนน และการตั้งค่าการติดต่อ.',
    },
    tags: {
        en: ['CRM', 'customer', 'loyalty-program', 'profile'],
        th: ['CRM', 'ลูกค้า', 'โปรแกรมสะสมแต้ม', 'โปรไฟล์'],
    },
    row_estimate: 2850000,
    storage_bytes: 814_000_000,
    ddl_snippet: 'CREATE TABLE dbo.CRM_Customer (CustomerId INT IDENTITY PRIMARY KEY, ...);',
    common_query_patterns: [
        'SELECT * FROM dbo.CRM_Customer WHERE CustomerId = @CustomerId;',
        'SELECT CustomerId, Point_Balance FROM dbo.CRM_Customer WHERE Point_Balance > 0;',
    ],
    relevant_column_ids: [
        'f3d3a3df-6c4a-4dba-b1b9-2d4cb1122334',
        '6896f99a-6f87-4f8e-8a85-2bb89e5c1eb2',
    ],
    related_template_ids: [
        'qt-001-top-customers-by-points',
        'qt-025-customer-order-history-enriched',
    ],
    sensitivity: 'pii',
    access_control: {
        required_roles: ['analyst', 'customer_service'],
        masking_policies: ['MaskEmail', 'MaskGovId'],
    },
    created_at: '2025-01-15T09:30:00Z',
    updated_at: '2025-09-20T11:05:00Z',
    snapshot_version: 4,
    lang_available: ['en', 'th'],
    usage_frequency: 1120,
    last_used: '2025-09-29T10:45:00Z',
    embedding: {
        model: 'openai/text-embedding-3-small',
        dimension: 1536,
        vector: [],
        generated_at: '2025-09-29T10:20:00Z',
        source: 'display_name + description + tags + common_query_patterns',
    },
};
