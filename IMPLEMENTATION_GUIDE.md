# Implementation Guide: Adding Supabase

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react  # Optional but helpful
```

## Step 2: Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Step 3: Database Schema SQL

Run this in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'on-hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT DEFAULT ''
);

-- Drawings table
CREATE TABLE drawings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  num_pages INTEGER DEFAULT 1,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Issues table
CREATE TABLE issues (
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
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('junior', 'senior')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_drawings_project ON drawings(project_id);
CREATE INDEX idx_issues_drawing ON issues(drawing_id);
CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Projects: Users can only see projects they own or are members of
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = owner_id OR EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  ));

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id OR EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
    AND project_members.role = 'senior'
  ));

-- Drawings: Users can see drawings for projects they have access to
CREATE POLICY "Users can view drawings"
  ON drawings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = drawings.project_id 
    AND (projects.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = projects.id 
      AND project_members.user_id = auth.uid()
    ))
  ));

CREATE POLICY "Users can create drawings"
  ON drawings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = drawings.project_id 
    AND (projects.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = projects.id 
      AND project_members.user_id = auth.uid()
    ))
  ));

-- Similar policies for issues and project_members...
```

## Step 4: Storage Setup

In Supabase Dashboard:
1. Go to Storage
2. Create bucket: `drawings`
3. Set to public (or use signed URLs)
4. Add policy: Users can upload/read their own files

## Step 5: Authentication Service

Create `lib/auth.ts`:

```typescript
import { supabase } from './supabase'
import type { User } from '../App'

export async function signUp(email: string, password: string, name: string, role: 'junior' | 'senior') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      }
    }
  })
  
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: user.user_metadata?.role || 'junior',
  }
}
```

## Step 6: API Service Layer

Create `lib/api.ts`:

```typescript
import { supabase } from './supabase'
import type { Project, Drawing, Issue, ProjectMember } from '../App'

// Projects
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        id,
        user_id,
        role,
        joined_at,
        users:user_id (
          id,
          email,
          raw_user_meta_data
        )
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data.map(transformProject)
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: project.name,
      description: project.description,
      status: project.status,
      owner_id: user.id,
      notes: project.notes || '',
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Add owner as senior member
  await supabase.from('project_members').insert({
    project_id: data.id,
    user_id: user.id,
    role: 'senior',
  })
  
  return transformProject({ ...data, project_members: [] })
}

// Drawings
export async function uploadDrawing(
  projectId: string,
  file: File
): Promise<Drawing> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${projectId}/${Date.now()}.${fileExt}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('drawings')
    .upload(fileName, file)
  
  if (uploadError) throw uploadError
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('drawings')
    .getPublicUrl(fileName)
  
  // Create drawing record
  const { data, error } = await supabase
    .from('drawings')
    .insert({
      project_id: projectId,
      name: file.name,
      file_url: publicUrl,
      num_pages: 1, // Will be updated after PDF parsing
      uploaded_by: user.id,
    })
    .select()
    .single()
  
  if (error) throw error
  
  return transformDrawing(data)
}

// Issues
export async function getIssues(projectId: string): Promise<Issue[]> {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data.map(transformIssue)
}

export async function createIssue(issue: Omit<Issue, 'id' | 'timestamp'>): Promise<Issue> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('issues')
    .insert({
      ...issue,
      created_by: user.id,
    })
    .select()
    .single()
  
  if (error) throw error
  
  return transformIssue(data)
}

// Helper functions to transform database rows to app types
function transformProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: new Date(row.created_at),
    status: row.status,
    drawings: [], // Load separately
    issueCount: 0, // Calculate separately
    resolvedCount: 0, // Calculate separately
    notes: row.notes || '',
    teamMembers: (row.project_members || []).map((pm: any) => ({
      id: pm.id,
      name: pm.users?.raw_user_meta_data?.name || pm.users?.email || 'Unknown',
      email: pm.users?.email || '',
      role: pm.role,
      joinedAt: new Date(pm.joined_at),
    })),
  }
}

function transformDrawing(row: any): Drawing {
  return {
    id: row.id,
    name: row.name,
    file: null,
    url: row.file_url,
    numPages: row.num_pages,
    uploadedAt: new Date(row.uploaded_at),
    uploadedBy: row.uploaded_by, // Will need to join with users table
  }
}

function transformIssue(row: any): Issue {
  return {
    id: row.id,
    drawingId: row.drawing_id,
    pageNumber: row.page_number,
    x: row.x,
    y: row.y,
    type: row.type,
    severity: row.severity,
    description: row.description,
    status: row.status,
    createdBy: row.created_by, // Will need to join with users table
    aiGenerated: row.ai_generated,
    timestamp: new Date(row.created_at),
  }
}
```

## Step 7: AI Issue Generation (Fake for MVP)

Create `lib/aiService.ts`:

```typescript
import type { Issue, Drawing } from '../App'

export async function analyzeDrawing(
  drawing: Drawing,
  projectId: string
): Promise<Issue[]> {
  // For MVP: Generate fake issues
  // Later: Integrate with OpenAI Vision API or Claude
  
  const issues: Issue[] = [
    {
      id: `ai-${Date.now()}-1`,
      drawingId: drawing.id,
      pageNumber: 1,
      x: 0.25,
      y: 0.30,
      type: 'Missing Dimension/Callout',
      severity: 'High',
      description: 'Critical dimension missing for structural element. Required per Section 3.2.1 of specifications.',
      status: 'Open',
      createdBy: 'AI Assistant',
      aiGenerated: true,
      timestamp: new Date(),
    },
    // Add more fake issues...
  ]
  
  return issues
}

// Future: Real AI integration
/*
export async function analyzeDrawingWithAI(
  drawing: Drawing
): Promise<Issue[]> {
  // Convert PDF to images
  // Send to OpenAI Vision API
  // Parse response and create issues
}
*/
```

## Step 8: Update App.tsx

Replace mock data with Supabase calls:

```typescript
import { useEffect } from 'react'
import { getCurrentUser, signIn, signOut } from './lib/auth'
import { getProjects } from './lib/api'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  
  useEffect(() => {
    // Check for existing session
    getCurrentUser().then(setUser)
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        getCurrentUser().then(setUser)
      } else {
        setUser(null)
      }
    })
  }, [])
  
  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])
  
  const loadProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }
  
  // ... rest of component
}
```

## Environment Variables

Create `.env.local`:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Add to `.gitignore`:
```
.env.local
```

## Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Run database schema SQL
3. ✅ Configure storage bucket
4. ✅ Install dependencies
5. ✅ Create service layer
6. ✅ Update components
7. ✅ Test locally
8. ✅ Deploy to Vercel

