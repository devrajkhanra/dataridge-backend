import { Static } from "@sinclair/typebox";

export interface CompanyRole {
  id: string;
  company_id: string;
  role_name: string;
  permissions: string[];
  hierarchy_level: number;
  created_at: string;
  updated_at: string;
}
