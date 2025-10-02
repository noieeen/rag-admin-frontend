import {EmbeddingModel} from "./embedding.model";
import {MultiLanguageModel, ParameterModel} from "./metadata.model";

export type QueryComplexity = 'SIMPLE' | 'MEDIUM' | 'COMPLEX';

export class QueryTemplateModel {
    query_template_id: string;
    type: 'query_template' | string;
    database_id?: string;
    brand_ref?: string;
    structure?: string;
    natural_language_question: MultiLanguageModel;
    sql_statement: string;
    relevant_table_ids: string[];
    relevant_column_ids: string[];
    relevant_view_ids?: string[];
    relevant_relationship_ids?: string[];
    parameters?: ParameterModel[];
    query_complexity?: QueryComplexity;
    estimated_rows_returned?: number;
    tags?: string[];
    performance_notes?: string;
    execution_statistics?: ExecutionStatistics;
    usage_patterns?: UsagePatterns;
    result_schema?: ResultSchema[];
    related_template_ids?: string[];
    version?: string;
    model?: string;
    snapshot_version?: number;
    lang_available?: string[];
    created_at?: string;
    created_by?: string;
    last_modified?: string;
    updated_at?: string;
    approved_by?: string;
    sensitivity?: string;
    access_control?: AccessControl;
    usage_frequency?: number;
    last_used?: string;

    [key: string]: any;
}

export class QueryTemplateWithVectorModel extends QueryTemplateModel {
    declare embedding: EmbeddingModel;
}


export interface ExecutionStatistics {
    avg_execution_time_ms: number
    p50_execution_time_ms: number
    p95_execution_time_ms: number
    max_execution_time_ms: number
    execution_count: number
    success_count: number
    error_count: number
    last_executed: string
}

export interface UsagePatterns {
    primary_use_case: string
    common_filters: string[]
    common_sorts: string[]
    peak_usage_hours: number[]
}

export interface ResultSchema {
    column_name: string;
    data_type: string;
    description: MultiLanguageModel;
    sample_values: any[];
}


export interface AccessControl {
    required_roles: string[]
    restricted_columns: string[]
}


// ## Embedding Field Rule ##
// embeddingSource =
//     natural_language_question.en + " " +
//     natural_language_question.th + " " +
//     tags.join(" ") + " " +
//     primary_use_case + " " +
//     result_schema.map(col => col.description.en).join(" ") + " " +
//     performance_notes

const queryTemplateStructureModel = {
    "query_template_id": "string (UUID)",
    "type": "query_template",
    "brand_ref": "string - tenant or brand reference",
    "structure": "string - taxonomy hierarchy identifier",
    "database_id": "string (UUID) - references database entity",
    "natural_language_question": {
        "en": "string - English question",
        "th": "string - Thai question"
    },
    "sql_statement": "string - Executable SQL with optional parameters",
    "relevant_table_ids": [
        "array of UUIDs - tables used in query"
    ],
    "relevant_column_ids": [
        "array of UUIDs - columns referenced"
    ],
    "relevant_view_ids": [
        "array of UUIDs - views used (optional)"
    ],
    "relevant_relationship_ids": [
        "array of UUIDs - joins used (optional)"
    ],
    "parameters": [
        {
            "name": "string - parameter name",
            "type": "string - data type (int, string, date, etc.)",
            "required": "boolean",
            "default_value": "any - default if not provided",
            "description": {
                "en": "string",
                "th": "string"
            },
            "validation": {
                "min": "number (optional)",
                "max": "number (optional)",
                "pattern": "string - regex pattern (optional)",
                "allowed_values": [
                    "array of valid values (optional)"
                ]
            }
        }
    ],
    "query_complexity": "string - SIMPLE | MEDIUM | COMPLEX",
    "estimated_rows_returned": "number - typical result size",
    "tags": [
        "array of descriptive tags"
    ],
    "performance_notes": "string - execution characteristics, index usage",
    "execution_statistics": {
        "avg_execution_time_ms": "number",
        "p50_execution_time_ms": "number",
        "p95_execution_time_ms": "number",
        "max_execution_time_ms": "number",
        "execution_count": "number - times this template was used",
        "success_count": "number",
        "error_count": "number",
        "last_executed": "ISO 8601 timestamp"
    },
    "usage_patterns": {
        "primary_use_case": "string - main business scenario",
        "common_filters": [
            "array of WHERE conditions often added"
        ],
        "common_sorts": [
            "array of ORDER BY columns often used"
        ],
        "peak_usage_hours": [
            "array of hours (0-23) when most used"
        ]
    },
    "result_schema": [
        {
            "column_name": "string",
            "data_type": "string",
            "description": {
                "en": "string",
                "th": "string"
            },
            "sample_values": [
                "array of example values"
            ]
        }
    ],
    "related_template_ids": [
        "array of UUIDs - similar/alternative queries"
    ],
    "version": "string - template version (e.g., 1.0, 1.1)",
    "snapshot_version": "number - change tracking marker",
    "lang_available": ["array of language codes"],
    "created_at": "ISO 8601 timestamp",
    "created_by": "string - author/team",
    "last_modified": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp",
    "approved_by": "string - reviewer who validated SQL",
    "sensitivity": "string - data classification (public, internal, confidential, pii)",
    "access_control": {
        "required_roles": [
            "array of role names that can execute"
        ],
        "restricted_columns": [
            "array of column names requiring masking"
        ]
    },
    "usage_frequency": "number - total executions",
    "last_used": "ISO 8601 timestamp of most recent execution",
    "embedding": {
        "model": "string - embedding model name",
        "dimension": "number - vector dimension",
        "vector": "array of floats - actual embedding",
        "generated_at": "ISO 8601 timestamp",
        "source": "string - what was embedded (question + description + tags)"
    }
}


const sampleQueryTemplate: QueryTemplateWithVectorModel[] = [{
    "query_template_id": "qt-001-top-customers-by-points",
    "type": "query_template",
    "brand_ref": "BL6ZLW8PXBXD",
    "structure": "L4",
    "database_id": "46cb1ce1-848b-4561-bed7-1f35c1a81a5c",
    "natural_language_question": {
        "en": "Show the top N loyalty members by current point balance",
        "th": "แสดงสมาชิกสะสมแต้ม N อันดับแรกที่มียอดคะแนนคงเหลือสูงสุด"
    },
    "sql_statement": `SELECT TOP(@limit)
                                        CustomerId,
                             First_Name_Th,
                             Email,
                             Point_Balance,
                             CASE
                                 WHEN Point_Balance >= 10000 THEN 'VIP'
                                 WHEN Point_Balance >= 5000 THEN 'Gold'
                                 WHEN Point_Balance >= 1000 THEN 'Silver'
                                 ELSE 'Bronze'
                                 END AS Member_Tier
                      FROM dbo.CRM_Customer
                      WHERE Point_Balance > 0
                      ORDER BY Point_Balance DESC;`,
    "relevant_table_ids": [
        "02c6bbd5-0c74-4193-a9cb-a84e3ccd0429"
    ],
    "relevant_column_ids": [
        "f3d3a3df-6c4a-4dba-b1b9-2d4cb1122334",
        "6896f99a-6f87-4f8e-8a85-2bb89e5c1eb2",
        "4b71653b-2fa1-48b3-964f-3bbdb9808ff9",
        "c2d62be6-6ef3-49a3-b5d4-0fa3b537ce96"
    ],
    "relevant_view_ids": [],
    "relevant_relationship_ids": [],
    "parameters": [
        {
            "name": "limit",
            "type": "int",
            "required": false,
            "default_value": 20,
            "description": {
                "en": "Number of top customers to return",
                "th": "จำนวนลูกค้าอันดับต้นที่ต้องการแสดง"
            },
            "validation": {
                "min": 1,
                "max": 1000
            }
        }
    ],
    "query_complexity": "SIMPLE",
    "estimated_rows_returned": 20,
    "tags": ["loyalty", "ranking", "customer", "points", "leaderboard"],
    "performance_notes": "Uses columnstore index on Point_Balance. Typical latency <150ms for default limit. Filter on Point_Balance > 0 eliminates inactive accounts (~15% of total).",
    "execution_statistics": {
        "avg_execution_time_ms": 142,
        "p50_execution_time_ms": 135,
        "p95_execution_time_ms": 180,
        "max_execution_time_ms": 245,
        "execution_count": 1847,
        "success_count": 1842,
        "error_count": 5,
        "last_executed": "2025-09-29T14:32:18Z"
    },
    "usage_patterns": {
        "primary_use_case": "Loyalty program dashboard - VIP member identification",
        "common_filters": [
            "Point_Balance >= 5000",
            "Registration_Date >= '2024-01-01'",
            "Email IS NOT NULL"
        ],
        "common_sorts": [
            "Point_Balance DESC",
            "Registration_Date DESC"
        ],
        "peak_usage_hours": [9, 10, 11, 14, 15, 16]
    },
    "result_schema": [
        {
            "column_name": "CustomerId",
            "data_type": "int",
            "description": {
                "en": "Unique customer identifier",
                "th": "รหัสลูกค้าเฉพาะ"
            },
            "sample_values": [123456, 234567, 345678]
        },
        {
            "column_name": "First_Name_Th",
            "data_type": "nvarchar(500)",
            "description": {
                "en": "Customer first name in Thai",
                "th": "ชื่อลูกค้าภาษาไทย"
            },
            "sample_values": ["สมชาย", "สมหญิง", "วิชัย"]
        },
        {
            "column_name": "Email",
            "data_type": "nvarchar(1000)",
            "description": {
                "en": "Customer email address",
                "th": "อีเมลลูกค้า"
            },
            "sample_values": ["customer@example.com", "member@test.th"]
        },
        {
            "column_name": "Point_Balance",
            "data_type": "int",
            "description": {
                "en": "Current loyalty point balance",
                "th": "ยอดคะแนนสะสมปัจจุบัน"
            },
            "sample_values": [15420, 12850, 9750]
        },
        {
            "column_name": "Member_Tier",
            "data_type": "varchar(20)",
            "description": {
                "en": "Calculated membership tier based on points",
                "th": "ระดับสมาชิกคำนวณจากคะแนน"
            },
            "sample_values": ["VIP", "Gold", "Silver", "Bronze"]
        }
    ],
    "related_template_ids": [
        "qt-002-customers-by-spending",
        "qt-015-loyalty-tier-distribution"
    ],
    "version": "1.2",
    "snapshot_version": 3,
    "lang_available": ["en", "th"],
    "created_at": "2025-06-15T10:30:00Z",
    "created_by": "data-engineering-team",
    "last_modified": "2025-08-20T14:15:00Z",
    "updated_at": "2025-09-29T09:45:00Z",
    "approved_by": "analytics-lead@brand5.example",
    "sensitivity": "pii",
    "access_control": {
        "required_roles": ["analyst", "marketing", "customer_service", "admin"],
        "restricted_columns": ["Email"]
    },
    "usage_frequency": 428,
    "last_used": "2025-09-29T08:50:00Z",
    "embedding": {
        "model": "openai/text-embedding-3-small",
        "dimension": 1536,
        "vector": [0.0441, -0.0223, 0.0597, 0.0215, -0.0309, 0.0558, 0.0191, -0.0172],
        "generated_at": "2025-09-29T11:30:00Z",
        "source": "natural_language_question + tags + primary_use_case + result_schema_descriptions"
    }
}, {
    "query_template_id": "qt-025-customer-order-history-enriched",
    "type": "query_template",
    "brand_ref": "BL6ZLW8PXBXD",
    "structure": "L4",
    "database_id": "46cb1ce1-848b-4561-bed7-1f35c1a81a5c",
    "natural_language_question": {
        "en": "Show complete order history for a customer with calculated metrics including running total, order rank, and days between purchases",
        "th": "แสดงประวัติคำสั่งซื้อทั้งหมดของลูกค้าพร้อมตัวชี้วัดที่คำนวณแล้ว รวมถึงยอดสะสม อันดับคำสั่งซื้อ และจำนวนวันระหว่างการซื้อ"
    },
    "sql_statement": "WITH CustomerOrders AS (\n  SELECT \n    o.OrderId,\n    o.CustomerId,\n    o.Order_Date,\n    o.Order_Total,\n    c.First_Name_Th,\n    c.Email,\n    c.Point_Balance,\n    ROW_NUMBER() OVER (PARTITION BY o.CustomerId ORDER BY o.Order_Date) AS Order_Sequence,\n    SUM(o.Order_Total) OVER (PARTITION BY o.CustomerId ORDER BY o.Order_Date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS Running_Total,\n    LAG(o.Order_Date) OVER (PARTITION BY o.CustomerId ORDER BY o.Order_Date) AS Previous_Order_Date,\n    LEAD(o.Order_Date) OVER (PARTITION BY o.CustomerId ORDER BY o.Order_Date) AS Next_Order_Date\n  FROM dbo.CRM_Order o\n  INNER JOIN dbo.CRM_Customer c ON o.CustomerId = c.CustomerId\n  WHERE o.CustomerId = @customer_id\n    AND (@start_date IS NULL OR o.Order_Date >= @start_date)\n    AND (@end_date IS NULL OR o.Order_Date <= @end_date)\n)\nSELECT \n  OrderId,\n  CustomerId,\n  First_Name_Th,\n  Email,\n  Order_Date,\n  Order_Total,\n  Order_Sequence,\n  Running_Total,\n  CASE \n    WHEN Order_Sequence = 1 THEN 'First Purchase'\n    WHEN Next_Order_Date IS NULL THEN 'Most Recent'\n    ELSE 'Repeat Purchase'\n  END AS Order_Type,\n  DATEDIFF(day, Previous_Order_Date, Order_Date) AS Days_Since_Last_Order,\n  DATEDIFF(day, Order_Date, Next_Order_Date) AS Days_Until_Next_Order,\n  Point_Balance AS Current_Point_Balance,\n  CAST(Order_Total AS DECIMAL(10,2)) / NULLIF(Order_Sequence, 0) AS Avg_Order_Value_To_Date\nFROM CustomerOrders\nORDER BY Order_Date DESC;",
    "relevant_table_ids": [
        "b1c181fd-3af6-4af9-9ce8-bb0fdd5ef884",
        "02c6bbd5-0c74-4193-a9cb-a84e3ccd0429"
    ],
    "relevant_column_ids": [
        "5ecbd02b-07df-4e2f-9358-4c4101fdfd6c",
        "b4f5ed31-2901-435d-95a7-4f87cb6805b6",
        "64eaa9b2-a63e-44c7-9f76-8738cd0d80a9",
        "b8a47e73-145a-4b89-91cd-e743cde1a507",
        "f3d3a3df-6c4a-4dba-b1b9-2d4cb1122334",
        "6896f99a-6f87-4f8e-8a85-2bb89e5c1eb2",
        "4b71653b-2fa1-48b3-964f-3bbdb9808ff9",
        "c2d62be6-6ef3-49a3-b5d4-0fa3b537ce96"
    ],
    "relevant_view_ids": [],
    "relevant_relationship_ids": [
        "1b8fd12f-6e18-42c3-abfa-94dff1d6e949"
    ],
    "parameters": [
        {
            "name": "customer_id",
            "type": "int",
            "required": true,
            "default_value": null,
            "description": {
                "en": "Customer ID to retrieve order history for",
                "th": "รหัสลูกค้าที่ต้องการดูประวัติการสั่งซื้อ"
            },
            "validation": {
                "min": 1
            }
        },
        {
            "name": "start_date",
            "type": "date",
            "required": false,
            "default_value": null,
            "description": {
                "en": "Optional start date to filter orders (inclusive)",
                "th": "วันที่เริ่มต้นสำหรับกรองคำสั่งซื้อ (ไม่บังคับ)"
            },
            "validation": {
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
            }
        },
        {
            "name": "end_date",
            "type": "date",
            "required": false,
            "default_value": null,
            "description": {
                "en": "Optional end date to filter orders (inclusive)",
                "th": "วันที่สิ้นสุดสำหรับกรองคำสั่งซื้อ (ไม่บังคับ)"
            },
            "validation": {
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
            }
        }
    ],
    "query_complexity": "COMPLEX",
    "estimated_rows_returned": 50,
    "tags": ["customer", "order-history", "analytics", "window-functions", "customer-journey", "behavioral"],
    "performance_notes": "Uses window functions (ROW_NUMBER, SUM OVER, LAG, LEAD) which require sorting. Clustered index seek on CustomerId provides fast initial filter. Typical execution time 250-400ms for customers with <100 orders. For power users with >500 orders, consider adding date range filters.",
    "execution_statistics": {
        "avg_execution_time_ms": 318,
        "p50_execution_time_ms": 285,
        "p95_execution_time_ms": 520,
        "max_execution_time_ms": 1240,
        "execution_count": 2456,
        "success_count": 2445,
        "error_count": 11,
        "last_executed": "2025-09-29T15:18:42Z"
    },
    "usage_patterns": {
        "primary_use_case": "Customer service - detailed account review and purchase behavior analysis",
        "common_filters": [
            "Order_Date >= DATEADD(year, -2, GETDATE())",
            "Order_Total > 500",
            "Order_Type = 'Repeat Purchase'"
        ],
        "common_sorts": [
            "Order_Date DESC",
            "Order_Total DESC",
            "Days_Since_Last_Order ASC"
        ],
        "peak_usage_hours": [10, 11, 13, 14, 15, 16]
    },
    "result_schema": [
        {
            "column_name": "OrderId",
            "data_type": "bigint",
            "description": {
                "en": "Unique order identifier",
                "th": "รหัสคำสั่งซื้อเฉพาะ"
            },
            "sample_values": [9876543210, 9876543211, 9876543212]
        },
        {
            "column_name": "CustomerId",
            "data_type": "int",
            "description": {
                "en": "Customer identifier",
                "th": "รหัสลูกค้า"
            },
            "sample_values": [123456]
        },
        {
            "column_name": "First_Name_Th",
            "data_type": "nvarchar(500)",
            "description": {
                "en": "Customer first name",
                "th": "ชื่อลูกค้า"
            },
            "sample_values": ["สมชาย"]
        },
        {
            "column_name": "Email",
            "data_type": "nvarchar(1000)",
            "description": {
                "en": "Customer email",
                "th": "อีเมลลูกค้า"
            },
            "sample_values": ["somchai@example.com"]
        },
        {
            "column_name": "Order_Date",
            "data_type": "datetime2",
            "description": {
                "en": "Order timestamp",
                "th": "วันเวลาคำสั่งซื้อ"
            },
            "sample_values": ["2025-09-28T14:32:18", "2025-08-15T10:20:05"]
        },
        {
            "column_name": "Order_Total",
            "data_type": "decimal(10,2)",
            "description": {
                "en": "Order amount in THB",
                "th": "ยอดคำสั่งซื้อเป็นบาท"
            },
            "sample_values": [1299.00, 850.50, 2450.00]
        },
        {
            "column_name": "Order_Sequence",
            "data_type": "int",
            "description": {
                "en": "Chronological order number for this customer (1 = first order)",
                "th": "ลำดับคำสั่งซื้อตามเวลาของลูกค้า (1 = ครั้งแรก)"
            },
            "sample_values": [1, 2, 3, 15, 42]
        },
        {
            "column_name": "Running_Total",
            "data_type": "decimal(18,2)",
            "description": {
                "en": "Cumulative spending up to this order",
                "th": "ยอดใช้จ่ายสะสมถึงคำสั่งซื้อนี้"
            },
            "sample_values": [1299.00, 2149.50, 4599.50]
        },
        {
            "column_name": "Order_Type",
            "data_type": "varchar(50)",
            "description": {
                "en": "Order classification: First Purchase, Repeat Purchase, or Most Recent",
                "th": "ประเภทคำสั่งซื้อ: ครั้งแรก ซื้อซ้ำ หรือล่าสุด"
            },
            "sample_values": ["First Purchase", "Repeat Purchase", "Most Recent"]
        },
        {
            "column_name": "Days_Since_Last_Order",
            "data_type": "int",
            "description": {
                "en": "Days elapsed since previous order (NULL for first order)",
                "th": "จำนวนวันตั้งแต่คำสั่งซื้อก่อนหน้า (NULL สำหรับครั้งแรก)"
            },
            "sample_values": [null, 14, 28, 7, 45]
        },
        {
            "column_name": "Days_Until_Next_Order",
            "data_type": "int",
            "description": {
                "en": "Days until next order (NULL for most recent)",
                "th": "จำนวนวันจนถึงคำสั่งซื้อถัดไป (NULL สำหรับล่าสุด)"
            },
            "sample_values": [14, 28, 7, null]
        },
        {
            "column_name": "Current_Point_Balance",
            "data_type": "int",
            "description": {
                "en": "Customer's current point balance (same for all rows)",
                "th": "ยอดคะแนนปัจจุบันของลูกค้า (เหมือนกันทุกแถว)"
            },
            "sample_values": [5420]
        },
        {
            "column_name": "Avg_Order_Value_To_Date",
            "data_type": "decimal(10,2)",
            "description": {
                "en": "Average order value up to this order",
                "th": "มูลค่าเฉลี่ยต่อคำสั่งซื้อถึงจุดนี้"
            },
            "sample_values": [1299.00, 1074.75, 1533.17]
        }
    ],
    "related_template_ids": [
        "qt-026-customer-lifetime-metrics",
        "qt-010-customer-rfm-score",
        "qt-032-purchase-frequency-analysis"
    ],
    "version": "2.1",
    "created_at": "2025-07-10T08:45:00Z",
    "created_by": "analytics-team",
    "last_modified": "2025-09-15T16:30:00Z",
    "approved_by": "data-architect@brand5.example",
    "sensitivity": "pii",
    "access_control": {
        "required_roles": ["customer_service", "analyst", "manager", "admin"],
        "restricted_columns": ["Email"]
    },
    "embedding": {
        "model": "openai/text-embedding-3-small",
        "dimension": 1536,
        "vector": [0.0318, -0.0286, 0.0523, 0.0389, -0.0248, 0.0492, 0.0236, -0.0204],
        "generated_at": "2025-09-29T11:30:00Z",
        "source": "natural_language_question + tags + primary_use_case + result_schema_descriptions + performance_notes"
    }
}]
