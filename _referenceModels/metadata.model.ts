export interface MetadataModel {
}

export interface MultiLanguageModel {
    en: string;
    th: string;

    [key: string]: string;
}

export interface MultiLanguageKeywordsModel {
    en: string[];
    th: string[];

    [key: string]: string[];
}

export interface ParameterModel {
    name: string
    type: string
    required: boolean
    default_value: number | string | null
    description: MultiLanguageModel
    validation: ValidationModel
}

export interface ValidationModel {
    min?: number
    max?: number
    pattern?: string
    allowed_values?: string[]
}
