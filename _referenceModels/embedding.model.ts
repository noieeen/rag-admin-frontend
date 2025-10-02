export class EmbeddingModel {
    model: 'openai/text-embedding-3-small' | string;
    dimension: 1536;
    vector: number[];
    generated_at: string;
    source: string;
}

const sampleEmbedding: EmbeddingModel = {
    model: 'openai/text-embedding-3-small',
    dimension: 1536,
    vector: [],
    generated_at: '2025-09-29T10:15:00Z',
    source: 'metric_name + description + calculation_logic + common_business_questions',
};
