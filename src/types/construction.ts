// Construction-specific type definitions
export interface MaterialTakeoff {
  id: string;
  project_id: string;
  company_id: string;
  blueprint_url?: string;
  materials: MaterialItem[];
  total_cost: number;
  status: 'draft' | 'approved' | 'ordered';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  category: 'concrete' | 'steel' | 'lumber' | 'electrical' | 'plumbing' | 'other';
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  supplier?: string;
  specifications?: string;
}

export interface DailyReport {
  id: string;
  project_id: string;
  company_id: string;
  report_date: string;
  weather_conditions: string;
  labor_hours: LaborHours[];
  equipment_usage: EquipmentUsage[];
  materials_delivered: MaterialDelivery[];
  progress_notes: string;
  safety_incidents: SafetyIncident[];
  delays: ProjectDelay[];
  photos: string[];
  created_by: string;
  created_at: string;
}

export interface LaborHours {
  designation: string;
  workers_count: number;
  hours_worked: number;
  overtime_hours: number;
  tasks_performed: string[];
}

export interface EquipmentUsage {
  equipment_name: string;
  equipment_id: string;
  hours_used: number;
  operator: string;
  maintenance_notes?: string;
}

export interface MaterialDelivery {
  material_name: string;
  quantity: number;
  unit: string;
  supplier: string;
  delivery_time: string;
  quality_check: boolean;
}

export interface SafetyIncident {
  type: 'near_miss' | 'injury' | 'property_damage' | 'violation';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions_taken: string;
  reported_by: string;
}

export interface ProjectDelay {
  reason: string;
  duration_hours: number;
  impact: string;
  mitigation_plan?: string;
}

export interface ChangeOrder {
  id: string;
  project_id: string;
  company_id: string;
  change_number: string;
  description: string;
  reason: string;
  scope_changes: ScopeChange[];
  labor_costs: LaborCost[];
  material_costs: MaterialCost[];
  equipment_costs: EquipmentCost[];
  overhead_percentage: number;
  profit_percentage: number;
  total_cost: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'implemented';
  requested_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ScopeChange {
  description: string;
  type: 'addition' | 'deletion' | 'modification';
  impact: string;
}

export interface LaborCost {
  designation: string;
  hours: number;
  rate_per_hour: number;
  total_cost: number;
}

export interface MaterialCost {
  material_name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
}

export interface EquipmentCost {
  equipment_name: string;
  hours: number;
  rate_per_hour: number;
  total_cost: number;
}

export interface RFI {
  id: string;
  project_id: string;
  company_id: string;
  rfi_number: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'design' | 'specification' | 'coordination' | 'clarification' | 'other';
  attachments: string[];
  submitted_by: string;
  assigned_to: string;
  response?: string;
  response_attachments?: string[];
  status: 'open' | 'pending_response' | 'responded' | 'closed';
  due_date: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceReconciliation {
  id: string;
  project_id: string;
  company_id: string;
  subcontractor_id: string;
  invoice_number: string;
  invoice_amount: number;
  invoice_date: string;
  work_period_start: string;
  work_period_end: string;
  line_items: InvoiceLineItem[];
  discrepancies: Discrepancy[];
  status: 'pending_review' | 'approved' | 'disputed' | 'paid';
  reviewed_by?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  work_order_reference?: string;
}

export interface Discrepancy {
  type: 'quantity_mismatch' | 'rate_difference' | 'unauthorized_work' | 'missing_approval';
  description: string;
  expected_value: number;
  actual_value: number;
  variance: number;
  resolution_notes?: string;
}