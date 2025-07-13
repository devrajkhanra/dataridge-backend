export interface User {
  id: string;
  company_id: string;
  role_id: string;
  email: string;
  is_active: boolean;
  last_active_at?: string;
  created_at: string;
}
