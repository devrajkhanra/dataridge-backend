export interface ProjectTableSchema {
  id: string;
  company_id: string;
  project_id: string;
  table_name: string;
  column_name: string;
  data_type:
    | "TEXT"
    | "INTEGER"
    | "NUMERIC"
    | "BOOLEAN"
    | "TIMESTAMP"
    | "DATE"
    | "JSONB"
    | "TEXT[]"
    | "UUID";
  is_required: boolean;
  constraints: string[];
  status: "active" | "pending_removal";
  created_at: string;
  updated_at: string;
}
