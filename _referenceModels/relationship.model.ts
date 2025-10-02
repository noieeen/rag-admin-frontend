import {EmbeddingModel} from './embedding.model';
import {MultiLanguageModel} from './metadata.model';

export type RelationshipType =
    | 'ONE_TO_ONE'
    | 'ONE_TO_MANY'
    | 'MANY_TO_ONE'
    | 'MANY_TO_MANY'
    | string;

export class RelationshipModel {
    relationship_id: string;
    type: 'relationship' | string;
    database_id: string;
    brand_ref?: string;
    structure?: string;
    source_table_id: string;
    source_table_name: string;
    source_column_name: string;
    target_table_id: string;
    target_table_name: string;
    target_column_name: string;
    relationship_type: RelationshipType;
    display_name: MultiLanguageModel;
    description: MultiLanguageModel;
    join_condition_template: string;
    recommended_join_usage?: string;
    active?: boolean;
    created_at?: string;
    updated_at?: string;
    snapshot_version?: number;
    metadata?: Record<string, unknown>;
    lang_available?: string[];
    embedding?: EmbeddingModel;

    [key: string]: any;
}

export class RelationshipWithVectorModel extends RelationshipModel {
    declare embedding: EmbeddingModel;
}

export const sampleRelationship: RelationshipModel = {
    relationship_id: 'rel-CRM_Customer-CRM_Customer_Address',
    type: 'relationship',
    database_id: '46cb1ce1-848b-4561-bed7-1f35c1a81a5c',
    brand_ref: 'BL6ZLW8PXBXD',
    structure: 'L4',
    source_table_id: 'b1c181fd-3af6-4af9-9ce8-bb0fdd5ef884',
    source_table_name: 'CRM_Customer',
    source_column_name: 'CustomerId',
    target_table_id: '110e0c8f-8888-4d1d-a676-a42f61a2c9a9',
    target_table_name: 'CRM_Customer_Address',
    target_column_name: 'CRM_CustomerId',
    relationship_type: 'ONE_TO_MANY',
    display_name: {
        en: 'Customer addresses',
        th: 'ที่อยู่ของลูกค้า',
    },
    description: {
        en: 'Links customer master records to their known addresses for delivery, billing, and contact preference management.',
        th: 'เชื่อมโยงข้อมูลลูกค้ากับที่อยู่สำหรับการจัดส่ง การเรียกเก็บเงิน และการจัดการช่องทางการติดต่อ.',
    },
    join_condition_template: 'CRM_Customer.CustomerId = CRM_Customer_Address.CRM_CustomerId',
    recommended_join_usage: 'SELECT * FROM dbo.CRM_Customer C JOIN dbo.CRM_Customer_Address A ON C.CustomerId = A.CRM_CustomerId;',
    active: true,
    created_at: '2025-02-10T11:00:00Z',
    updated_at: '2025-09-25T09:30:00Z',
    snapshot_version: 2,
    lang_available: ['en', 'th'],
    metadata: {
        direction: 'parent_to_child',
        foreign_key_name: 'FK_CRM_Customer_Address_CustomerId',
    },
};
