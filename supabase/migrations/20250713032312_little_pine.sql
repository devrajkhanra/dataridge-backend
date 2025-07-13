/*
  # Construction Management Tables

  1. New Tables
    - `daily_reports` - Daily construction reports with labor, equipment, and progress tracking
    - `change_orders` - Change order management with cost estimation
    - `rfis` - Request for Information tracking and resolution
    - `material_takeoffs` - Material quantity and cost estimation
    - `invoice_reconciliations` - Subcontractor invoice reconciliation

  2. Security
    - Enable RLS on all tables
    - Add policies for company-based access control

  3. Indexes
    - Add performance indexes for common queries
*/

-- Daily Reports Table
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  report_date DATE NOT NULL,
  weather_conditions TEXT NOT NULL,
  labor_hours JSONB DEFAULT '[]'::jsonb,
  equipment_usage JSONB DEFAULT '[]'::jsonb,
  materials_delivered JSONB DEFAULT '[]'::jsonb,
  progress_notes TEXT DEFAULT '',
  safety_incidents JSONB DEFAULT '[]'::jsonb,
  delays JSONB DEFAULT '[]'::jsonb,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change Orders Table
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  change_number TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  reason TEXT NOT NULL,
  scope_changes JSONB DEFAULT '[]'::jsonb,
  labor_costs JSONB DEFAULT '[]'::jsonb,
  material_costs JSONB DEFAULT '[]'::jsonb,
  equipment_costs JSONB DEFAULT '[]'::jsonb,
  overhead_percentage NUMERIC(5,2) DEFAULT 15.00,
  profit_percentage NUMERIC(5,2) DEFAULT 10.00,
  total_cost NUMERIC(12,2) DEFAULT 0.00,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'implemented')),
  requested_by UUID NOT NULL,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFIs Table
CREATE TABLE IF NOT EXISTS rfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  rfi_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL CHECK (category IN ('design', 'specification', 'coordination', 'clarification', 'other')),
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  submitted_by UUID NOT NULL,
  assigned_to UUID NOT NULL,
  response TEXT,
  response_attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending_response', 'responded', 'closed')),
  due_date DATE NOT NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material Takeoffs Table
CREATE TABLE IF NOT EXISTS material_takeoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  blueprint_url TEXT,
  materials JSONB DEFAULT '[]'::jsonb,
  total_cost NUMERIC(12,2) DEFAULT 0.00,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'ordered')),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Reconciliations Table
CREATE TABLE IF NOT EXISTS invoice_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  subcontractor_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_amount NUMERIC(12,2) NOT NULL,
  invoice_date DATE NOT NULL,
  work_period_start DATE NOT NULL,
  work_period_end DATE NOT NULL,
  line_items JSONB DEFAULT '[]'::jsonb,
  discrepancies JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'disputed', 'paid')),
  reviewed_by UUID,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_takeoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_reconciliations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Daily Reports
CREATE POLICY "Users can read own company daily reports"
  ON daily_reports
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create daily reports for own company"
  ON daily_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for Change Orders
CREATE POLICY "Users can read own company change orders"
  ON change_orders
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create change orders for own company"
  ON change_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own company change orders"
  ON change_orders
  FOR UPDATE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for RFIs
CREATE POLICY "Users can read own company RFIs"
  ON rfis
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create RFIs for own company"
  ON rfis
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own company RFIs"
  ON rfis
  FOR UPDATE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for Material Takeoffs
CREATE POLICY "Users can read own company material takeoffs"
  ON material_takeoffs
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create material takeoffs for own company"
  ON material_takeoffs
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own company material takeoffs"
  ON material_takeoffs
  FOR UPDATE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for Invoice Reconciliations
CREATE POLICY "Users can read own company invoice reconciliations"
  ON invoice_reconciliations
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create invoice reconciliations for own company"
  ON invoice_reconciliations
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_daily_reports_project_date ON daily_reports(project_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_company ON daily_reports(company_id);

CREATE INDEX IF NOT EXISTS idx_change_orders_project ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);
CREATE INDEX IF NOT EXISTS idx_change_orders_company ON change_orders(company_id);

CREATE INDEX IF NOT EXISTS idx_rfis_project ON rfis(project_id);
CREATE INDEX IF NOT EXISTS idx_rfis_status ON rfis(status);
CREATE INDEX IF NOT EXISTS idx_rfis_assigned ON rfis(assigned_to);
CREATE INDEX IF NOT EXISTS idx_rfis_company ON rfis(company_id);

CREATE INDEX IF NOT EXISTS idx_material_takeoffs_project ON material_takeoffs(project_id);
CREATE INDEX IF NOT EXISTS idx_material_takeoffs_company ON material_takeoffs(company_id);

CREATE INDEX IF NOT EXISTS idx_invoice_reconciliations_project ON invoice_reconciliations(project_id);
CREATE INDEX IF NOT EXISTS idx_invoice_reconciliations_status ON invoice_reconciliations(status);
CREATE INDEX IF NOT EXISTS idx_invoice_reconciliations_company ON invoice_reconciliations(company_id);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_change_orders_updated_at BEFORE UPDATE ON change_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rfis_updated_at BEFORE UPDATE ON rfis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_takeoffs_updated_at BEFORE UPDATE ON material_takeoffs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_reconciliations_updated_at BEFORE UPDATE ON invoice_reconciliations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();