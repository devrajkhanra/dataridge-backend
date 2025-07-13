import { Static } from "@sinclair/typebox";

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyUserSchema {
  id: string;
  company_id: string;
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

export interface DynamicUser {
  id: string;
  company_id: string;
  user_id: string;
  [key: string]: any;
}
