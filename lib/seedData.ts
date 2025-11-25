import { supabase } from './supabase'
import { createProject } from './api'
import { uploadDrawing } from './api'
import { createIssue } from './api'
import { demoProjectNotes } from '../demoProjectData'
import { getDemoIssues } from '../demoData'

/**
 * Create demo projects for a new user
 */
export async function createDemoProjects(userId: string) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping demo projects')
    return
  }

  try {
    // Project 1: Downtown Transit Hub
    const project1 = await createProject({
      name: 'Downtown Transit Hub',
      description: 'Multi-modal transportation center with underground parking structure',
      status: 'active',
      notes: demoProjectNotes['1'],
      teamMembers: [],
    })

    // Upload example drawing (skip if file not available)
    try {
      const drawing1Response = await fetch('/example_drawing2.pdf')
      if (drawing1Response.ok) {
        const blob = await drawing1Response.blob()
        const file = new File([blob], 'Site Plan - Level 1 Parking & Transit Platform.pdf', { type: 'application/pdf' })
        const drawing1 = await uploadDrawing(project1.id, file)
        
        // Create issues for this drawing
        const issues1 = getDemoIssues('1', drawing1.id)
        for (const issue of issues1) {
          try {
            await createIssue({
              ...issue,
              projectId: project1.id,
            })
          } catch (error) {
            console.error('Failed to create issue:', error)
          }
        }
      } else {
        console.warn('Demo drawing 1 not available, skipping')
      }
    } catch (error) {
      console.warn('Failed to upload demo drawing 1 (this is OK if files not available):', error)
    }

    // Project 2: River Walk Development
    const project2 = await createProject({
      name: 'River Walk Development',
      description: 'Mixed-use development with pedestrian riverwalk and flood control improvements',
      status: 'active',
      notes: demoProjectNotes['2'],
      teamMembers: [],
    })

    try {
      const drawing2Response = await fetch('/example_drawing3.pdf')
      if (drawing2Response.ok) {
        const blob = await drawing2Response.blob()
        const file = new File([blob], 'Grading & Drainage Plan - Riverwalk Section.pdf', { type: 'application/pdf' })
        const drawing2 = await uploadDrawing(project2.id, file)
        
        const issues2 = getDemoIssues('2', drawing2.id)
        for (const issue of issues2) {
          try {
            await createIssue({
              ...issue,
              projectId: project2.id,
            })
          } catch (error) {
            console.error('Failed to create issue:', error)
          }
        }
      } else {
        console.warn('Demo drawing 2 not available, skipping')
      }
    } catch (error) {
      console.warn('Failed to upload demo drawing 2 (this is OK if files not available):', error)
    }

    // Project 3: Highland Residential Subdivision
    const project3 = await createProject({
      name: 'Highland Residential Subdivision',
      description: 'Residential subdivision with storm drainage and grading improvements',
      status: 'completed',
      notes: demoProjectNotes['3'],
      teamMembers: [],
    })

    try {
      const drawing3Response = await fetch('/example_drawing4.pdf')
      if (drawing3Response.ok) {
        const blob = await drawing3Response.blob()
        const file = new File([blob], 'Final Site Plan - Phase 1 Subdivision.pdf', { type: 'application/pdf' })
        const drawing3 = await uploadDrawing(project3.id, file)
        
        const issues3 = getDemoIssues('3', drawing3.id)
        for (const issue of issues3) {
          try {
            await createIssue({
              ...issue,
              projectId: project3.id,
            })
          } catch (error) {
            console.error('Failed to create issue:', error)
          }
        }
      } else {
        console.warn('Demo drawing 3 not available, skipping')
      }
    } catch (error) {
      console.warn('Failed to upload demo drawing 3 (this is OK if files not available):', error)
    }

    console.log('Demo projects created successfully')
  } catch (error) {
    console.error('Failed to create demo projects:', error)
    // Don't throw - allow user to continue even if demo projects fail
  }
}

