import {EmbeddingModel} from "./embedding.model";

export class SynonymMappingModel {
    synonym_id: string;
    type: 'synonym' | string;
    canonical_term: string;
    aliases: string[];
    entity_type?: string;
    entity_id?: string;
    description?: string;
    language?: string[];
    tags?: string[];
    model?: string;
    structure?: string;
    brand_ref?: string;
    created_at?: string;
    updated_at?: string;
    embedding?: EmbeddingModel;

    [key: string]: any;
}

export class SynonymMappingWithVectorModel extends SynonymMappingModel {
    declare embedding: EmbeddingModel;
}

const sampleSynonym: SynonymMappingWithVectorModel = {
    synonym_id: 'd5c4e1f0-2b3a-4f6d-8c7e-9a0b1c2d3e4f',
    type: 'synonym',
    canonical_term: 'Customer',
    aliases: ['member', 'user', 'client', 'ลูกค้า', 'สมาชิก'],
    entity_type: 'table',
    entity_id: '02c6bbd5-0c74-4193-a9cb-a84e3ccd0429',
    description: 'Terms that map to the customer dimension across channels',
    language: ['en', 'th'],
    tags: ['customer', 'dimension', 'entity'],
    brand_ref: 'BL6ZLW8PXBXD',
    structure: 'L4',
    model: 'openai/text-embedding-3-small',
    created_at: '2025-09-29T09:45:00Z',
    updated_at: '2025-09-29T09:45:00Z',
    embedding: {
        model: 'openai/text-embedding-3-small',
        dimension: 1536,
        vector: [],
        generated_at: '2025-09-29T09:45:00Z',
        source: 'canonical_term + aliases + entity metadata',
    },
};
