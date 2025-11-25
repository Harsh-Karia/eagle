import { useState, useCallback, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { ProjectView } from './components/ProjectView';
import { getCurrentUser, onAuthStateChange, signOut as supabaseSignOut } from './lib/auth';
import { getProjects, createProject, updateProject } from './lib/api';
import { supabase } from './lib/supabase';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'junior' | 'senior';
} | null;

export type ProjectMember = {
  id: string;
  name: string;
  email: string;
  role: 'junior' | 'senior';
  joinedAt: Date;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  status: 'active' | 'completed' | 'on-hold';
  drawings: Drawing[];
  issueCount: number;
  resolvedCount: number;
  notes: string;
  teamMembers: ProjectMember[];
};

export type Drawing = {
  id: string;
  name: string;
  file: File | null;
  url: string;
  numPages: number;
  uploadedAt: Date;
  uploadedBy: string;
};

export type PDFFile = {
  file: File | null;
  url: string;
  numPages: number;
};

export interface Issue {
  id: string;
  drawingId: string;
  pageNumber: number;
  x: number; // relative position (0-1)
  y: number; // relative position (0-1)
  type: string;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  status: 'Open' | 'In Review' | 'Resolved';
  createdBy: string;
  aiGenerated: boolean;
  timestamp: Date;
}

type Page = 'home' | 'login' | 'dashboard' | 'project';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let unsubscribe: (() => void) | undefined

    const initAuth = async () => {
      try {
        // Add timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          setIsLoading(false)
        }, 2000) // Max 2 seconds loading

        if (!supabase) {
          setIsLoading(false)
          return
        }

        const currentUser = await getCurrentUser()
        clearTimeout(timeoutId)
        
        if (currentUser) {
          setUser(currentUser)
          setCurrentPage('dashboard')
          await loadProjects()
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Auth init error:', error)
        clearTimeout(timeoutId)
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes (only if Supabase is configured)
    if (supabase) {
      unsubscribe = onAuthStateChange(async (authUser) => {
        setUser(authUser)
        if (authUser) {
          setCurrentPage('dashboard')
          await loadProjects()
        } else {
          setCurrentPage('home')
          setProjects([])
          setSelectedProject(null)
        }
      })
    }

    return () => {
      clearTimeout(timeoutId)
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const loadProjects = useCallback(async () => {
    if (!supabase) {
      console.warn('Supabase not configured, using mock mode')
      setProjects([])
      return
    }

    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error: any) {
      console.error('Failed to load projects:', error)
      // Show user-friendly error
      if (error?.message?.includes('JWT')) {
        console.error('Authentication error - user may need to sign in again')
      }
      // Fallback to empty array on error
      setProjects([])
    }
  }, [])

  const handleLogin = useCallback(async (email: string, password: string, name?: string, role?: 'junior' | 'senior') => {
    try {
      // Demo accounts - always available (work without Supabase)
      if (email === 'demo-junior@engineering.com' || email === 'junior@engineering.com') {
        const mockUser: User = {
          id: 'demo-junior',
          name: 'Alex Rivera',
          email: 'demo-junior@engineering.com',
          role: 'junior',
        }
        setUser(mockUser)
        setCurrentPage('dashboard')
        // Load demo projects
        const { demoTeamMembers, demoProjectNotes } = await import('./demoProjectData')
        
        const demoProjects: Project[] = [
          {
            id: 'demo-1',
            name: 'Downtown Transit Hub',
            description: 'Multi-modal transportation center with underground parking structure',
            createdAt: new Date(2024, 0, 15),
            status: 'active',
            drawings: [{
              id: 'drawing-1',
              name: 'Site Plan - Level 1 Parking & Transit Platform',
              file: null,
              url: '/example_drawing2.pdf',
              numPages: 1,
              uploadedAt: new Date(2024, 0, 16, 9, 0),
              uploadedBy: 'Sarah Chen, PE',
            }],
            issueCount: 8,
            resolvedCount: 2,
            notes: demoProjectNotes['1'],
            teamMembers: demoTeamMembers['1'],
          },
          {
            id: 'demo-2',
            name: 'River Walk Development',
            description: 'Mixed-use development with pedestrian riverwalk and flood control improvements',
            createdAt: new Date(2024, 1, 3),
            status: 'active',
            drawings: [{
              id: 'drawing-2',
              name: 'Grading & Drainage Plan - Riverwalk Section',
              file: null,
              url: '/example_drawing3.pdf',
              numPages: 1,
              uploadedAt: new Date(2024, 1, 4, 8, 30),
              uploadedBy: 'Sarah Chen, PE',
            }],
            issueCount: 7,
            resolvedCount: 1,
            notes: demoProjectNotes['2'],
            teamMembers: demoTeamMembers['2'],
          },
          {
            id: 'demo-3',
            name: 'Highland Residential Subdivision',
            description: 'Residential subdivision with storm drainage and grading improvements',
            createdAt: new Date(2023, 11, 10),
            status: 'completed',
            drawings: [{
              id: 'drawing-3',
              name: 'Final Site Plan - Phase 1 Subdivision',
              file: null,
              url: '/example_drawing4.pdf',
              numPages: 1,
              uploadedAt: new Date(2023, 11, 11, 9, 0),
              uploadedBy: 'Sarah Chen, PE',
            }],
            issueCount: 23,
            resolvedCount: 23,
            notes: demoProjectNotes['3'],
            teamMembers: demoTeamMembers['3'],
          },
        ]
        setProjects(demoProjects)
        return
      }

      if (email === 'demo-senior@engineering.com' || email === 'senior@engineering.com') {
        const mockUser: User = {
          id: 'demo-senior',
          name: 'Sarah Chen, PE',
          email: 'demo-senior@engineering.com',
          role: 'senior',
        }
        setUser(mockUser)
        setCurrentPage('dashboard')
        // Load demo projects
        const { demoTeamMembers, demoProjectNotes } = await import('./demoProjectData')
        
        const demoProjects: Project[] = [
          {
            id: 'demo-1',
            name: 'Downtown Transit Hub',
            description: 'Multi-modal transportation center with underground parking structure',
            createdAt: new Date(2024, 0, 15),
            status: 'active',
            drawings: [{
              id: 'drawing-1',
              name: 'Site Plan - Level 1 Parking & Transit Platform',
              file: null,
              url: '/example_drawing2.pdf',
              numPages: 1,
              uploadedAt: new Date(2024, 0, 16, 9, 0),
              uploadedBy: 'Sarah Chen, PE',
            }],
            issueCount: 8,
            resolvedCount: 2,
            notes: demoProjectNotes['1'],
            teamMembers: demoTeamMembers['1'],
          },
          {
            id: 'demo-2',
            name: 'River Walk Development',
            description: 'Mixed-use development with pedestrian riverwalk and flood control improvements',
            createdAt: new Date(2024, 1, 3),
            status: 'active',
            drawings: [{
              id: 'drawing-2',
              name: 'Grading & Drainage Plan - Riverwalk Section',
              file: null,
              url: '/example_drawing3.pdf',
              numPages: 1,
              uploadedAt: new Date(2024, 1, 4, 8, 30),
              uploadedBy: 'Sarah Chen, PE',
            }],
            issueCount: 7,
            resolvedCount: 1,
            notes: demoProjectNotes['2'],
            teamMembers: demoTeamMembers['2'],
          },
          {
            id: 'demo-3',
            name: 'Highland Residential Subdivision',
            description: 'Residential subdivision with storm drainage and grading improvements',
            createdAt: new Date(2023, 11, 10),
            status: 'completed',
            drawings: [{
              id: 'drawing-3',
              name: 'Final Site Plan - Phase 1 Subdivision',
              file: null,
              url: '/example_drawing4.pdf',
              numPages: 1,
              uploadedAt: new Date(2023, 11, 11, 9, 0),
              uploadedBy: 'Sarah Chen, PE',
            }],
            issueCount: 23,
            resolvedCount: 23,
            notes: demoProjectNotes['3'],
            teamMembers: demoTeamMembers['3'],
          },
        ]
        setProjects(demoProjects)
        return
      }

      // Real authentication (if Supabase configured)
      if (!supabase) {
        // Fallback to mock mode for other emails
        const mockUser: User = {
          id: '1',
          name: name || (email.includes('senior') ? 'Sarah Chen, PE' : 'Alex Rivera'),
          email: email,
          role: role || (email.includes('senior') ? 'senior' : 'junior'),
        }
        setUser(mockUser)
        setCurrentPage('dashboard')
        return
      }

      const { signIn, signUp } = await import('./lib/auth')
      
      if (name && role) {
        // Sign up - create demo projects for new users
        await signUp(email, password, name, role)
        
        // Check if this is a new user (no projects exist)
        const currentUser = await getCurrentUser()
        if (currentUser && supabase) {
          // Load projects first to check if user is new
          const loadedProjects = await getProjects()
          
          // Create demo projects in background if user has no projects
          if (loadedProjects.length === 0) {
            const { createDemoProjects } = await import('./lib/seedData')
            // Run in background - don't block UI
            setTimeout(() => {
              createDemoProjects(currentUser.id).catch(err => {
                console.error('Failed to create demo projects:', err)
                // Don't block login if demo projects fail
              })
            }, 2000) // Wait 2 seconds after login to not block UI
          }
        }
      } else {
        // Sign in
        await signIn(email, password)
      }

      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setCurrentPage('dashboard')
        await loadProjects()
      }
    } catch (error: any) {
      console.error('Login error:', error)
      alert(error.message || 'Failed to sign in. Please check your credentials.')
    }
  }, [loadProjects]);

  const handleLogout = useCallback(async () => {
    try {
      await supabaseSignOut()
      setUser(null)
      setCurrentPage('home')
      setSelectedProject(null)
      setProjects([])
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if logout fails
      setUser(null)
      setCurrentPage('home')
      setSelectedProject(null)
      setProjects([])
    }
  }, []);

  const handleCreateProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt' | 'drawings' | 'issueCount' | 'resolvedCount'>) => {
    try {
      // Check if user is a demo user (hardcoded auth)
      const isDemoUser = user?.id === 'demo-junior' || user?.id === 'demo-senior'
      
      if (!supabase || isDemoUser) {
        // Fallback to mock mode for demo users or when Supabase not configured
        const newProject: Project = {
          ...project,
          id: Date.now().toString(),
          createdAt: new Date(),
          drawings: [],
          issueCount: 0,
          resolvedCount: 0,
          notes: project.notes || '',
          teamMembers: project.teamMembers || [
            // Add current user as a team member
            {
              id: user?.id || 'unknown',
              name: user?.name || 'Unknown',
              email: user?.email || '',
              role: user?.role || 'junior',
              joinedAt: new Date(),
            }
          ],
        }
        setProjects(prev => [newProject, ...prev])
        return
      }

      const newProject = await createProject(project)
      setProjects(prev => [newProject, ...prev])
    } catch (error: any) {
      console.error('Failed to create project:', error)
      const errorMessage = error?.message || 'Failed to create project. Please check your connection and try again.'
      alert(errorMessage)
      throw error // Re-throw so caller knows it failed
    }
  }, [user]);

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setCurrentPage('project');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedProject(null);
    setCurrentPage('dashboard');
  }, []);

  const handleUpdateProject = useCallback(async (updatedProject: Project) => {
    try {
      if (!supabase) {
        // Fallback to mock mode
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
        setSelectedProject(updatedProject)
        return
      }

      const updated = await updateProject(updatedProject)
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
      setSelectedProject(updated)
    } catch (error) {
      console.error('Failed to update project:', error)
      // Still update locally on error for better UX
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
      setSelectedProject(updatedProject)
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {currentPage === 'home' && (
        <HomePage 
          onGetStarted={() => setCurrentPage('login')}
          onLogin={() => setCurrentPage('login')}
          onDemoLogin={(email) => handleLogin(email, 'demo')}
        />
      )}
      
      {currentPage === 'login' && (
        <LoginPage 
          onLogin={handleLogin}
          onBack={() => setCurrentPage('home')}
        />
      )}
      
      {currentPage === 'dashboard' && user && (
        <Dashboard
          user={user}
          projects={projects}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'project' && selectedProject && user && (
        <ProjectView
          project={selectedProject}
          user={user}
          onBack={handleBackToDashboard}
          onUpdateProject={handleUpdateProject}
        />
      )}
    </div>
  );
}

export default App;
