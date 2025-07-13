export interface Labor {
  id: string;
  company_id: string;
  user_id?: string;
  project_id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  pf_number?: string;
  esi_number?: string;
  designation: string;
  contact_number?: string;
  emergency_contact?: string;
  address?: string;
  date_of_birth?: string;
  joining_date: string;
  training_records?: Record<string, string>;
  status: "active" | "inactive" | "terminated";
  created_at: string;
  updated_at: string;
}

export interface LaborRoles {
  designations: string[];
}
