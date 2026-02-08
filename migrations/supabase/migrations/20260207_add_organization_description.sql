-- Add description column to organization table
-- Created: 2026-02-07

ALTER TABLE organization 
ADD COLUMN IF NOT EXISTS description TEXT;
