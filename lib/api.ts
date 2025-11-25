import { supabase } from './supabase'
import type { Project, Drawing, Issue, ProjectMember } from '../App'

// Helper functions to transform database rows to app types
function transformProject(row: any, drawings: Drawing[] = [], issueCount: number = 0, resolvedCount: number = 0): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    createdAt: new Date(row.created_at),
    status: row.status,
    drawings,
    issueCount,
    resolvedCount,
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

function transformDrawing(row: any, uploadedByName: string = 'Unknown'): Drawing {
  return {
    id: row.id,
    name: row.name,
    file: null,
    url: row.file_url,
    numPages: row.num_pages || 1,
    uploadedAt: new Date(row.uploaded_at),
    uploadedBy: uploadedByName,
  }
}

function transformIssue(row: any, createdByName: string = 'Unknown'): Issue {
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
    createdBy: createdByName,
    aiGenerated: row.ai_generated || false,
    timestamp: new Date(row.created_at),
  }
}

// Projects
export async function getProjects(): Promise<Project[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get projects with members
  // Use a simpler query that works with RLS
  const { data: projectsData, error: projectsError } = await supabase
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
  
  if (projectsError) throw projectsError
  
  if (!projectsData) return []

  // Get drawings and issues for each project
  const projectsWithData = await Promise.all(
    projectsData.map(async (project) => {
      // Get drawings
      const { data: drawingsData } = await supabase
        .from('drawings')
        .select('*')
        .eq('project_id', project.id)
        .order('uploaded_at', { ascending: false })

      const drawings = (drawingsData || []).map(d => transformDrawing(d))

      // Get issues count
      const { count: totalIssues } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)

      const { count: resolvedIssues } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('status', 'Resolved')

      return transformProject(
        project,
        drawings,
        totalIssues || 0,
        resolvedIssues || 0
      )
    })
  )

  return projectsWithData
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'drawings' | 'issueCount' | 'resolvedCount'>): Promise<Project> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  
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
  
  if (error) {
    console.error('Project creation error:', error)
    throw new Error(error.message || 'Failed to create project')
  }
  
  // Add owner as senior member
  const { error: memberError } = await supabase.from('project_members').insert({
    project_id: data.id,
    user_id: user.id,
    role: 'senior',
  })
  
  if (memberError) {
    console.error('Failed to add owner as member:', memberError)
    // Don't throw - project was created successfully
  }
  
  return transformProject(data, [], 0, 0)
}

export async function updateProject(project: Project): Promise<Project> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      name: project.name,
      description: project.description,
      status: project.status,
      notes: project.notes,
    })
    .eq('id', project.id)
    .select()
    .single()
  
  if (error) throw error
  
  // Get updated data with relationships
  const updatedProject = await getProjects()
  return updatedProject.find(p => p.id === project.id) || transformProject(data)
}

// Drawings
export async function getDrawings(projectId: string): Promise<Drawing[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('drawings')
    .select(`
      *,
      users:uploaded_by (
        raw_user_meta_data
      )
    `)
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })
  
  if (error) throw error
  
  return (data || []).map(d => transformDrawing(
    d,
    d.users?.raw_user_meta_data?.name || 'Unknown'
  ))
}

export async function uploadDrawing(
  projectId: string,
  file: File
): Promise<Drawing> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  
  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${projectId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('drawings')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
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
    .select(`
      *,
      users:uploaded_by (
        raw_user_meta_data
      )
    `)
    .single()
  
  if (error) throw error
  
  return transformDrawing(
    data,
    data.users?.raw_user_meta_data?.name || user.user_metadata?.name || 'Unknown'
  )
}

export async function deleteDrawing(drawingId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  // Get drawing to delete file from storage
  const { data: drawing } = await supabase
    .from('drawings')
    .select('file_url')
    .eq('id', drawingId)
    .single()

  // Delete from database (cascade will delete issues)
  const { error } = await supabase
    .from('drawings')
    .delete()
    .eq('id', drawingId)
  
  if (error) throw error

  // Optionally delete file from storage
  if (drawing?.file_url) {
    const fileName = drawing.file_url.split('/').pop()
    if (fileName) {
      await supabase.storage
        .from('drawings')
        .remove([fileName])
    }
  }
}

// Issues
export async function getIssues(projectId: string): Promise<Issue[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      users:created_by (
        raw_user_meta_data
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return (data || []).map(i => transformIssue(
    i,
    i.users?.raw_user_meta_data?.name || 'AI Assistant'
  ))
}

export async function createIssue(issue: Omit<Issue, 'id' | 'timestamp'> & { projectId?: string }): Promise<Issue> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get project_id from drawing if not provided
  let projectId = issue.projectId
  if (!projectId) {
    const { data: drawing } = await supabase
      .from('drawings')
      .select('project_id')
      .eq('id', issue.drawingId)
      .single()
    
    if (!drawing) {
      throw new Error('Drawing not found')
    }
    projectId = drawing.project_id
  }
  
  const { data, error } = await supabase
    .from('issues')
    .insert({
      drawing_id: issue.drawingId,
      project_id: projectId,
      page_number: issue.pageNumber,
      x: issue.x,
      y: issue.y,
      type: issue.type,
      severity: issue.severity,
      description: issue.description,
      status: issue.status,
      created_by: user.id,
      ai_generated: issue.aiGenerated || false,
    })
    .select(`
      *,
      users:created_by (
        raw_user_meta_data
      )
    `)
    .single()
  
  if (error) throw error
  
  return transformIssue(
    data,
    data.users?.raw_user_meta_data?.name || user.user_metadata?.name || 'Unknown'
  )
}

export async function updateIssue(issue: Issue): Promise<Issue> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('issues')
    .update({
      type: issue.type,
      severity: issue.severity,
      description: issue.description,
      status: issue.status,
    })
    .eq('id', issue.id)
    .select(`
      *,
      users:created_by (
        raw_user_meta_data
      )
    `)
    .single()
  
  if (error) throw error
  
  return transformIssue(
    data,
    data.users?.raw_user_meta_data?.name || 'Unknown'
  )
}

export async function deleteIssue(issueId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', issueId)
  
  if (error) throw error
}

// Project Members
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('project_members')
    .select(`
      *,
      users:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('project_id', projectId)
    .order('joined_at', { ascending: true })
  
  if (error) throw error
  
  return (data || []).map((pm: any) => ({
    id: pm.id,
    name: pm.users?.raw_user_meta_data?.name || pm.users?.email || 'Unknown',
    email: pm.users?.email || '',
    role: pm.role,
    joinedAt: new Date(pm.joined_at),
  }))
}

