import { z } from "zod";

// Daily Report Schemas
export const laborHoursSchema = z.object({
  designation: z.string().min(1),
  workers_count: z.number().int().min(0),
  hours_worked: z.number().min(0),
  overtime_hours: z.number().min(0).default(0),
  tasks_performed: z.array(z.string()),
});

export const equipmentUsageSchema = z.object({
  equipment_name: z.string().min(1),
  equipment_id: z.string().min(1),
  hours_used: z.number().min(0),
  operator: z.string().min(1),
  maintenance_notes: z.string().optional(),
});

export const materialDeliverySchema = z.object({
  material_name: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  supplier: z.string().min(1),
  delivery_time: z.string(),
  quality_check: z.boolean(),
});

export const safetyIncidentSchema = z.object({
  type: z.enum(['near_miss', 'injury', 'property_damage', 'violation']),
  description: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  actions_taken: z.string().min(1),
  reported_by: z.string().min(1),
});

export const projectDelaySchema = z.object({
  reason: z.string().min(1),
  duration_hours: z.number().min(0),
  impact: z.string().min(1),
  mitigation_plan: z.string().optional(),
});

export const dailyReportSchema = z.object({
  project_id: z.string().uuid(),
  company_id: z.string().uuid(),
  report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weather_conditions: z.string().min(1),
  labor_hours: z.array(laborHoursSchema),
  equipment_usage: z.array(equipmentUsageSchema),
  materials_delivered: z.array(materialDeliverySchema),
  progress_notes: z.string(),
  safety_incidents: z.array(safetyIncidentSchema),
  delays: z.array(projectDelaySchema),
  photos: z.array(z.string().url()),
});

export const dailyReportQuerySchema = z.object({
  project_id: z.string().uuid().optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Change Order Schemas
export const scopeChangeSchema = z.object({
  description: z.string().min(1),
  type: z.enum(['addition', 'deletion', 'modification']),
  impact: z.string().min(1),
});

export const laborCostSchema = z.object({
  designation: z.string().min(1),
  hours: z.number().min(0),
  rate_per_hour: z.number().min(0),
  total_cost: z.number().min(0),
});

export const materialCostSchema = z.object({
  material_name: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  unit_cost: z.number().min(0),
  total_cost: z.number().min(0),
});

export const equipmentCostSchema = z.object({
  equipment_name: z.string().min(1),
  hours: z.number().min(0),
  rate_per_hour: z.number().min(0),
  total_cost: z.number().min(0),
});

export const changeOrderSchema = z.object({
  project_id: z.string().uuid(),
  company_id: z.string().uuid(),
  description: z.string().min(1),
  reason: z.string().min(1),
  scope_changes: z.array(scopeChangeSchema),
  labor_costs: z.array(laborCostSchema).optional(),
  material_costs: z.array(materialCostSchema).optional(),
  equipment_costs: z.array(equipmentCostSchema).optional(),
  overhead_percentage: z.number().min(0).max(100).default(15),
  profit_percentage: z.number().min(0).max(100).default(10),
});

export const changeOrderQuerySchema = z.object({
  project_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'implemented']).optional(),
});

// RFI Schemas
export const rfiSchema = z.object({
  project_id: z.string().uuid(),
  company_id: z.string().uuid(),
  subject: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.enum(['design', 'specification', 'coordination', 'clarification', 'other']),
  attachments: z.array(z.string().url()).default([]),
  assigned_to: z.string().uuid(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const rfiResponseSchema = z.object({
  response: z.string().min(1),
  response_attachments: z.array(z.string().url()).optional(),
});

// Material Takeoff Schemas
export const materialItemSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['concrete', 'steel', 'lumber', 'electrical', 'plumbing', 'other']),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  unit_cost: z.number().min(0),
  supplier: z.string().optional(),
  specifications: z.string().optional(),
});

export const materialTakeoffSchema = z.object({
  project_id: z.string().uuid(),
  company_id: z.string().uuid(),
  blueprint_url: z.string().url().optional(),
  materials: z.array(materialItemSchema),
});