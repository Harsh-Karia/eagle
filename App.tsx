import { useState, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { ProjectView } from './components/ProjectView';
import { demoTeamMembers, demoProjectNotes } from './demoProjectData';

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

  const handleLogin = useCallback((email: string, password: string) => {
    // Mock authentication
    const mockUser: User = {
      id: '1',
      name: email.includes('senior') ? 'Sarah Chen, PE' : 'Alex Rivera',
      email: email,
      role: email.includes('senior') ? 'senior' : 'junior',
    };
    setUser(mockUser);
    setCurrentPage('dashboard');

    // Create mock projects if none exist
    if (projects.length === 0) {
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Downtown Transit Hub',
          description: 'Multi-modal transportation center with underground parking structure',
          createdAt: new Date(2024, 0, 15),
          status: 'active',
          drawings: [
            {
              id: 'drawing-1',
              name: 'Site Plan - Level 1 Parking & Transit Platform',
              file: null,
              url: '/example_drawing2.pdf',
              numPages: 1,
              uploadedAt: new Date(2024, 0, 16, 9, 0),
              uploadedBy: 'Sarah Chen, PE',
            },
          ],
          issueCount: 8,
          resolvedCount: 2,
          notes: demoProjectNotes['1'],
          teamMembers: demoTeamMembers['1'],
        },
        {
          id: '2',
          name: 'River Walk Development',
          description: 'Mixed-use development with pedestrian riverwalk and flood control improvements',
          createdAt: new Date(2024, 1, 3),
          status: 'active',
          drawings: [
            {
              id: 'drawing-2',
              name: 'Grading & Drainage Plan - Riverwalk Section',
              file: null,
              url: '/example_drawing3.pdf',
              numPages: 1,
              uploadedAt: new Date(2024, 1, 4, 8, 30),
              uploadedBy: 'Sarah Chen, PE',
            },
          ],
          issueCount: 7,
          resolvedCount: 1,
          notes: demoProjectNotes['2'],
          teamMembers: demoTeamMembers['2'],
        },
        {
          id: '3',
          name: 'Highland Residential Subdivision',
          description: 'Residential subdivision with storm drainage and grading improvements',
          createdAt: new Date(2023, 11, 10),
          status: 'completed',
          drawings: [
            {
              id: 'drawing-3',
              name: 'Final Site Plan - Phase 1 Subdivision',
              file: null,
              url: '/example_drawing4.pdf',
              numPages: 1,
              uploadedAt: new Date(2023, 11, 11, 9, 0),
              uploadedBy: 'Sarah Chen, PE',
            },
          ],
          issueCount: 23,
          resolvedCount: 23,
          notes: demoProjectNotes['3'],
          teamMembers: demoTeamMembers['3'],
        },
      ];
      setProjects(mockProjects);
    }
  }, [projects.length]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentPage('home');
    setSelectedProject(null);
  }, []);

  const handleCreateProject = useCallback((project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
      notes: project.notes || '',
      teamMembers: project.teamMembers || [],
    };
    setProjects(prev => [newProject, ...prev]);
  }, []);

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setCurrentPage('project');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedProject(null);
    setCurrentPage('dashboard');
  }, []);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      {currentPage === 'home' && (
        <HomePage 
          onGetStarted={() => setCurrentPage('login')}
          onLogin={() => setCurrentPage('login')}
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
