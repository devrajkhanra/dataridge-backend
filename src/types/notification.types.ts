export interface Notification {
  id: string;
  company_id: string;
  user_id: string;
  project_id?: string;
  action:
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
  message: string;
  sent_to: Record<string, any>;
  created_at: string;
}
