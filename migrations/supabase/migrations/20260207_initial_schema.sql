-- Migration: Initial Schema for Building Access Control System
-- Created: 2026-02-07
-- Description: Creates all core tables with indexes, constraints, and triggers

-- ============================================
-- BUILDING & SPACES
-- ============================================

CREATE TABLE IF NOT EXISTS building (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_building_name ON building(name);

-- --------------------------------------------

CREATE TABLE IF NOT EXISTS floor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES building(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(building_id, floor_number)
);

CREATE INDEX idx_floor_building ON floor(building_id);

-- --------------------------------------------

CREATE TABLE IF NOT EXISTS office_space (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID NOT NULL REFERENCES floor(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  seat_capacity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_office_space_floor ON office_space(floor_id);

-- ============================================
-- ORGANIZATION & LEASES
-- ============================================

CREATE TABLE IF NOT EXISTS organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organization_name ON organization(name);

-- --------------------------------------------

CREATE TABLE IF NOT EXISTS lease (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  office_space_id UUID NOT NULL REFERENCES office_space(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_lease_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_lease_organization ON lease(organization_id);
CREATE INDEX idx_lease_office_space ON lease(office_space_id);
CREATE INDEX idx_lease_dates ON lease(start_date, end_date);

-- ============================================
-- ROLES & EMPLOYEES
-- ============================================

CREATE TABLE IF NOT EXISTS access_role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  is_system_role BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, organization_id)
);

CREATE INDEX idx_access_role_organization ON access_role(organization_id);
CREATE INDEX idx_access_role_system ON access_role(is_system_role);

-- --------------------------------------------

CREATE TABLE IF NOT EXISTS employee (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES access_role(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email)
);

CREATE INDEX idx_employee_organization ON employee(organization_id);
CREATE INDEX idx_employee_role ON employee(role_id);
CREATE INDEX idx_employee_email ON employee(email);
CREATE INDEX idx_employee_status ON employee(status);

-- ============================================
-- ACCESS CARDS
-- ============================================

CREATE TABLE IF NOT EXISTS access_card (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_uid VARCHAR(100) NOT NULL UNIQUE,
  employee_id UUID NOT NULL UNIQUE REFERENCES employee(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOST', 'BLOCKED')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_access_card_uid ON access_card(card_uid);
CREATE INDEX idx_access_card_employee ON access_card(employee_id);
CREATE INDEX idx_access_card_status ON access_card(status);

-- ============================================
-- DOORS & DOOR GROUPS
-- ============================================

CREATE TABLE IF NOT EXISTS door_group (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('PUBLIC', 'PRIVATE', 'RESTRICTED')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_door_group_type ON door_group(type);

-- --------------------------------------------

CREATE TABLE IF NOT EXISTS door (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  office_space_id UUID REFERENCES office_space(id) ON DELETE SET NULL,
  floor_id UUID REFERENCES floor(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_door_office_space ON door(office_space_id);
CREATE INDEX idx_door_floor ON door(floor_id);

-- --------------------------------------------

-- Junction table for many-to-many relationship between doors and door groups
CREATE TABLE IF NOT EXISTS door_door_group (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  door_id UUID NOT NULL REFERENCES door(id) ON DELETE CASCADE,
  door_group_id UUID NOT NULL REFERENCES door_group(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(door_id, door_group_id)
);

CREATE INDEX idx_door_door_group_door ON door_door_group(door_id);
CREATE INDEX idx_door_door_group_group ON door_door_group(door_group_id);

-- ============================================
-- PERMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS role_door_group_permission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES access_role(id) ON DELETE CASCADE,
  door_group_id UUID NOT NULL REFERENCES door_group(id) ON DELETE CASCADE,
  access_type VARCHAR(20) NOT NULL DEFAULT 'ALWAYS' CHECK (access_type IN ('ALWAYS', 'TIME_BOUND')),
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, door_group_id)
);

CREATE INDEX idx_permission_role ON role_door_group_permission(role_id);
CREATE INDEX idx_permission_door_group ON role_door_group_permission(door_group_id);
CREATE INDEX idx_permission_composite ON role_door_group_permission(role_id, door_group_id);

-- ============================================
-- ACCESS LOGS (Partitioned by month for scalability)
-- ============================================

CREATE TABLE IF NOT EXISTS access_log (
  id BIGSERIAL,
  card_uid VARCHAR(100) NOT NULL,
  door_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL CHECK (status IN ('GRANTED', 'DENIED')),
  denial_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create partitions for 2026
CREATE TABLE IF NOT EXISTS access_log_2026_01 PARTITION OF access_log
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE IF NOT EXISTS access_log_2026_02 PARTITION OF access_log
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE IF NOT EXISTS access_log_2026_03 PARTITION OF access_log
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS access_log_2026_04 PARTITION OF access_log
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE IF NOT EXISTS access_log_2026_05 PARTITION OF access_log
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE IF NOT EXISTS access_log_2026_06 PARTITION OF access_log
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS access_log_2026_07 PARTITION OF access_log
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE IF NOT EXISTS access_log_2026_08 PARTITION OF access_log
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE IF NOT EXISTS access_log_2026_09 PARTITION OF access_log
  FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE IF NOT EXISTS access_log_2026_10 PARTITION OF access_log
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE IF NOT EXISTS access_log_2026_11 PARTITION OF access_log
  FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE IF NOT EXISTS access_log_2026_12 PARTITION OF access_log
  FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Indexes on access_log
CREATE INDEX idx_access_log_card_uid ON access_log(card_uid, timestamp DESC);
CREATE INDEX idx_access_log_door ON access_log(door_id, timestamp DESC);
CREATE INDEX idx_access_log_timestamp ON access_log(timestamp DESC);
CREATE INDEX idx_access_log_status ON access_log(status, timestamp DESC) WHERE status = 'DENIED';

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_building_updated_at BEFORE UPDATE ON building
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_floor_updated_at BEFORE UPDATE ON floor
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_office_space_updated_at BEFORE UPDATE ON office_space
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_updated_at BEFORE UPDATE ON organization
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lease_updated_at BEFORE UPDATE ON lease
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_role_updated_at BEFORE UPDATE ON access_role
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_updated_at BEFORE UPDATE ON employee
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_card_updated_at BEFORE UPDATE ON access_card
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_door_updated_at BEFORE UPDATE ON door
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_door_group_updated_at BEFORE UPDATE ON door_group
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permission_updated_at BEFORE UPDATE ON role_door_group_permission
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-deactivate access card when employee is deactivated
CREATE OR REPLACE FUNCTION deactivate_card_on_employee_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'INACTIVE' AND OLD.status = 'ACTIVE' THEN
    UPDATE access_card
    SET status = 'INACTIVE'
    WHERE employee_id = NEW.id AND status = 'ACTIVE';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deactivate_card_trigger AFTER UPDATE ON employee
  FOR EACH ROW EXECUTE FUNCTION deactivate_card_on_employee_status();

-- ============================================
-- ROW LEVEL SECURITY (Optional - can be enabled later)
-- ============================================

-- Enable RLS on tables (currently disabled for simplicity)
-- ALTER TABLE building ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
-- etc.

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE building IS 'Physical buildings with multiple floors';
COMMENT ON TABLE floor IS 'Floors within a building';
COMMENT ON TABLE office_space IS 'Rentable office spaces on floors';
COMMENT ON TABLE organization IS 'Companies/organizations that lease office spaces';
COMMENT ON TABLE lease IS 'Lease agreements between organizations and office spaces';
COMMENT ON TABLE access_role IS 'Roles for role-based access control (system or organization-specific)';
COMMENT ON TABLE employee IS 'Employees belonging to organizations with assigned roles';
COMMENT ON TABLE access_card IS 'RFID access cards issued to employees (1:1 relationship)';
COMMENT ON TABLE door_group IS 'Logical grouping of doors (PUBLIC, PRIVATE, RESTRICTED)';
COMMENT ON TABLE door IS 'Physical doors in the building';
COMMENT ON TABLE door_door_group IS 'Junction table: many-to-many relationship between doors and door groups';
COMMENT ON TABLE role_door_group_permission IS 'Permissions mapping roles to door groups with optional time restrictions';
COMMENT ON TABLE access_log IS 'Audit log of all access attempts (partitioned by month for performance)';
