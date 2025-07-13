import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../services/supabase.service";

// JWT payload
export interface JwtPayload {
  sub: string;
  roles: string[];
  [key: string]: any;
}

// Shared interfaces
export interface CompanyUserSchema {
  id?: string;
  company_id?: string;
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
  constraints?: string[];
  status?: "active" | "pending_removal";
  created_at?: string;
  updated_at?: string;
}

export interface Labor {
  id: string;
  company_id: string;
  user_id: string;
  project_id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  pf_number: string;
  esi_number: string;
  designation: string;
  contact_number: string;
  emergency_contact: string;
  address: string;
  date_of_birth: string | null;
  joining_date: string;
  training_records: any;
  status: "active" | "inactive" | "terminated";
  created_at: string;
  updated_at: string;
}

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
  constraints?: string[];
  status: "active" | "pending_removal";
  created_at: string;
  updated_at: string;
  columns?: Array<{
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
    constraints?: string[];
  }>;
}

export type NotificationType =
  | "table_created"
  | "table_modified"
  | "table_deleted"
  | "data_inserted"
  | "data_updated"
  | "data_deleted"
  | "labor_added"
  | "labor_updated"
  | "company_added"
  | "user_added"
  | "role_added"
  | "role_updated";

// Fastify extensions
declare module "fastify" {
  interface FastifyInstance {
    supabase: SupabaseClient;
    supabaseService: SupabaseService;
    restrictTo: (
      roles: string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    logger: import("pino").Logger;
  }

  interface FastifyRequest {
    user: JwtPayload | null;
  }
}
