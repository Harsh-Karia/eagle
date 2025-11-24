import { useState } from 'react';
import { Plus, LogOut, FolderOpen, AlertCircle, CheckCircle, Clock, Search, Filter, Users } from 'lucide-react';
import type { User, Project } from '../App';

interface DashboardProps {
  user: User;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onLogout: () => void;
}

export function Dashboard({ user, projects, onSelectProject, onCreateProject, onLogout }: DashboardProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on-hold'>('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'on-hold': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProject: Omit<Project, 'id' | 'createdAt'> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: 'active',
      drawings: [],
      issueCount: 0,
      resolvedCount: 0,
    };
    onCreateProject(newProject);
    setIsCreating(false);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-2">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">DrawingReview AI</h1>
              <p className="text-slate-500 text-sm">Project Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-slate-900">{user?.name}</p>
              <p className="text-slate-500 text-sm capitalize">{user?.role} Engineer</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Total Projects</span>
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl text-slate-900">{projects.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Active Projects</span>
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl text-slate-900">
                {projects.filter(p => p.status === 'active').length}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Open Issues</span>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl text-slate-900">
                {projects.reduce((sum, p) => sum + (p.issueCount - p.resolvedCount), 0)}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Resolved Issues</span>
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl text-slate-900">
                {projects.reduce((sum, p) => sum + p.resolvedCount, 0)}
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="pl-11 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-slate-900 mb-2">No projects found</h3>
              <p className="text-slate-500 mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first project'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all hover:border-blue-300 text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs border flex items-center gap-1.5 ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                    </span>
                  </div>
                  
                  <h3 className="text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{project.drawings.length} drawings</span>
                    <span>•</span>
                    <span className="text-orange-600">{project.issueCount - project.resolvedCount} open</span>
                    <span>•</span>
                    <span className="text-green-600">{project.resolvedCount} resolved</span>
                  </div>

                  {user?.role === 'senior' && project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <Users className="w-3.5 h-3.5" />
                        <span>Team Members ({project.teamMembers.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.teamMembers.slice(0, 3).map(member => (
                          <div
                            key={member.id}
                            className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700"
                            title={member.name}
                          >
                            {member.name.split(' ')[0]} {member.name.includes('PE') ? 'PE' : ''}
                          </div>
                        ))}
                        {project.teamMembers.length > 3 && (
                          <div className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700">
                            +{project.teamMembers.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                    Created {project.createdAt.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-slate-900">Create New Project</h3>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Downtown Transit Hub"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Brief description of the project scope and deliverables..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
