import {EmbeddingModel} from './embedding.model';
import {
    MultiLanguageKeywordsModel,
    MultiLanguageModel,
} from './metadata.model';

export type DatabaseDialect = 'SQLServer' | 'PostgreSQL' | 'BigQuery' | string;

export class DatabaseModel {
    database_id: string;
    type: 'database' | string;
    database_name: string;
    brand_ref?: string;
    structure?: string;
    display_name: MultiLanguageModel;
    description: MultiLanguageModel;
    connection_string_ref?: string;
    dialect?: DatabaseDialect;
    tags?: MultiLanguageKeywordsModel;
    snapshot_version?: number;
    created_at?: string;
    updated_at?: string;
    last_synced_at?: string;
    metadata?: Record<string, unknown>;
    lang_available?: string[];
    embedding?: EmbeddingModel;

    [key: string]: any;
}

export class DatabaseWithVectorModel extends DatabaseModel {
    declare embedding: EmbeddingModel;
}

export const sampleDatabase: DatabaseWithVectorModel = {
    database_id: '46cb1ce1-848b-4561-bed7-1f35c1a81a5c',
    type: 'database',
    database_name: 'BCRM_5_BL6ZLW8PXBXD',
    brand_ref: 'BL6ZLW8PXBXD',
    structure: 'L4',
    display_name: {
        en: 'Brand 5 CRM POS',
        th: 'แบรนด์ 5 CRM POS',
    },
    description: {
        en: 'Customer engagement and POS transaction hub supporting loyalty campaigns, consent management, and in-store analytics.',
        th: 'ฐานข้อมูลสำหรับการมีส่วนร่วมของลูกค้าและธุรกรรม POS เพื่อสนับสนุนแคมเปญสะสมแต้ม การจัดการความยินยอม และการวิเคราะห์หน้าร้าน.',
    },
    connection_string_ref: 'sqlserver://dev-chocobcrm.database.windows.net:1433;database=BCRM_5_BL6ZLW8PXBXD;user={bcrm-ai};password={secret};encrypt=true',
    dialect: 'SQLServer',
    tags: {
        en: [
            'CRM',
            'POS',
            'customer-data',
            'loyalty-program',
            'campaign-management',
        ],
        th: [
            'CRM',
            'POS',
            'ข้อมูลลูกค้า',
            'โปรแกรมสะสมแต้ม',
            'การจัดการแคมเปญ',
        ],
    },
    snapshot_version: 1,
    created_at: '2025-06-01T08:00:00Z',
    updated_at: '2025-09-28T12:15:00Z',
    lang_available: ['en', 'th'],
    metadata: {
        environment: 'development',
        retention_policy: 'P1D',
    },
    embedding: {
        model: 'openai/text-embedding-3-small',
        dimension: 1536,
        vector: [],
        generated_at: '2025-09-29T10:15:00Z',
        source: 'display_name + description + tags',
    },
};
