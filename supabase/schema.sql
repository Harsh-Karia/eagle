-- Eagle Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'on-hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT DEFAULT ''
);

-- Drawings table
CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  num_pages INTEGER DEFAULT 1,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drawing_id UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL DEFAULT 1,
  x FLOAT NOT NULL CHECK (x >= 0 AND x <= 1),
  y FLOAT NOT NULL CHECK (y >= 0 AND y <= 1),
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'In Review', 'Resolved')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('junior', 'senior')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_drawings_project ON drawings(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_drawing ON issues(drawing_id);
CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update their projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their projects" ON projects;
DROP POLICY IF EXISTS "Users can view drawings" ON drawings;
DROP POLICY IF EXISTS "Users can create drawings" ON drawings;
DROP POLICY IF EXISTS "Users can delete drawings" ON drawings;
DROP POLICY IF EXISTS "Users can view issues" ON issues;
DROP POLICY IF EXISTS "Users can create issues" ON issues;
DROP POLICY IF EXISTS "Users can update issues" ON issues;
DROP POLICY IF EXISTS "Users can delete issues" ON issues;
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Users can manage project members" ON project_members;

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = owner_id 
    OR EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = projects.id 
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their projects"
  ON projects FOR UPDATE
  USING (
    auth.uid() = owner_id 
    OR EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = projects.id 
      AND project_members.user_id = auth.uid()
      AND project_members.role = 'senior'
    )
  );

CREATE POLICY "Users can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Drawings policies
CREATE POLICY "Users can view drawings"
  ON drawings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = drawings.project_id 
    AND (
      projects.owner_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_members.project_id = projects.id 
        AND project_members.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can create drawings"
  ON drawings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = drawings.project_id 
    AND (
      projects.owner_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_members.project_id = projects.id 
        AND project_members.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can delete drawings"
  ON drawings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = drawings.project_id 
    AND (
      projects.owner_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_members.project_id = projects.id 
        AND project_members.user_id = auth.uid()
        AND project_members.role = 'senior'
      )
    )
  ));

-- Issues policies
CREATE POLICY "Users can view issues"
  ON issues FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = issues.project_id 
    AND (
      projects.owner_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_members.project_id = projects.id 
        AND project_members.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can create issues"
  ON issues FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = issues.project_id 
    AND (
      projects.owner_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_members.project_id = projects.id 
        AND project_members.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can update issues"
  ON issues FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = issues.project_id 
    AND (
      projects.owner_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_members.project_id = projects.id 
        AND project_members.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can delete issues"
  ON issues FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = issues.project_id 
      AND (
        projects.owner_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM project_members 
          WHERE project_members.project_id = projects.id 
          AND project_members.user_id = auth.uid()
          AND project_members.role = 'senior'
        )
      )
    )
  );

-- Project members policies
-- Fixed to avoid infinite recursion
-- Strategy: Only check project ownership (non-recursive) and allow users to see their own row
-- Members can see other members by checking project ownership first, then allowing all members of owned/accessible projects

CREATE POLICY "Users can view project members"
  ON project_members FOR SELECT
  USING (
    -- Project owner can see all members (non-recursive check)
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_members.project_id 
      AND projects.owner_id = auth.uid()
    )
    -- OR user can see their own membership row (allows projects policy to check membership)
    OR project_members.user_id = auth.uid()
  );

-- For managing members, only project owners can add/remove members
-- This avoids recursion by only checking project ownership
CREATE POLICY "Users can manage project members"
  ON project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_members.project_id 
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_members.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

