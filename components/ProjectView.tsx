import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, Trash2, StickyNote, Users, Edit2 } from 'lucide-react';
import { PDFViewer } from './PDFViewer';
import { IssueSidebar } from './IssueSidebar';
import { CommentModal } from './CommentModal';
import type { User, Project, Drawing, Issue } from '../App';
import { getIssues, createIssue, updateIssue, deleteIssue, uploadDrawing, deleteDrawing as deleteDrawingAPI } from '../lib/api';
import { analyzeDrawing } from '../lib/aiService';
import { supabase } from '../lib/supabase';

interface ProjectViewProps {
  project: Project;
  user: User;
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
}

export function ProjectView({ project, user, onBack, onUpdateProject }: ProjectViewProps) {
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(
    project.drawings.length > 0 ? project.drawings[0] : null
  );
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number; pageNumber: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [highlightedIssueId, setHighlightedIssueId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'drawings' | 'notes' | 'team'>('drawings');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(project.notes || '');

  // Check if user is a demo user (hardcoded auth)
  const isDemoUser = user?.id === 'demo-junior' || user?.id === 'demo-senior';
  // Use mock mode if Supabase not configured OR if user is a demo user
  const useMockMode = !supabase || isDemoUser;

  // Track the last project ID we loaded issues for
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);

  // Load issues when project loads (only once per project)
  useEffect(() => {
    // Skip if we've already loaded issues for this project
    if (loadedProjectId === project.id) {
      return;
    }

    const loadIssues = async () => {
      // Check if this is a demo project or demo user
      if (project.id.startsWith('demo-') || useMockMode) {
        const { getDemoIssues } = await import('../demoData');
        const demoIssues: Issue[] = [];
        project.drawings.forEach(drawing => {
          // Map demo project IDs: demo-1 -> 1, demo-2 -> 2, demo-3 -> 3
          // For new projects created by demo users, use project.id as-is
          const projectIdForIssues = project.id.startsWith('demo-') 
            ? project.id.replace('demo-', '')
            : project.id;
          const drawingIssues = getDemoIssues(projectIdForIssues, drawing.id);
          demoIssues.push(...drawingIssues);
        });
        setIssues(demoIssues);
        setLoadedProjectId(project.id);
        return;
      }

      try {
        const projectIssues = await getIssues(project.id);
        setIssues(projectIssues);
        setLoadedProjectId(project.id);
      } catch (error) {
        console.error('Failed to load issues:', error);
        setIssues([]);
        setLoadedProjectId(project.id);
      }
    };

    loadIssues();
  }, [project.id, useMockMode, loadedProjectId]);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    
    try {
      let newDrawing: Drawing;

      if (!useMockMode) {
        // Upload to Supabase Storage
        newDrawing = await uploadDrawing(project.id, file);
      } else {
        // Fallback to local URL for demo users or when Supabase not configured
        const url = URL.createObjectURL(file);
        newDrawing = {
          id: Date.now().toString(),
          name: file.name,
          file: file,
          url: url,
          numPages: 1,
          uploadedAt: new Date(),
          uploadedBy: user?.name || 'Unknown',
        };
      }

      // Update project with new drawing
      const updatedProject = {
        ...project,
        drawings: [...project.drawings, newDrawing],
      };
      onUpdateProject(updatedProject);
      setSelectedDrawing(newDrawing);
      setIsUploading(false);

      // Start AI analysis
      setIsAnalyzing(true);
      try {
        const aiIssues = await analyzeDrawing(newDrawing, project.id);
        
        // Save AI issues to database (skip for demo users)
        if (!useMockMode) {
          for (const issue of aiIssues) {
            try {
              await createIssue({
                ...issue,
                projectId: project.id,
              });
            } catch (error) {
              console.error('Failed to save issue:', error);
            }
          }
        }
        
        // Update local state
        setIssues(prev => [...prev, ...aiIssues]);
        
        // Update project issue counts
        const updatedProjectWithCounts = {
          ...updatedProject,
          issueCount: updatedProject.issueCount + aiIssues.length,
        };
        onUpdateProject(updatedProjectWithCounts);
      } catch (error) {
        console.error('AI analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error.message || 'Failed to upload drawing. Please try again.');
      setIsUploading(false);
    }
  }, [project, user, onUpdateProject, useMockMode]);


  const handlePDFClick = useCallback((x: number, y: number, pageNumber: number) => {
    if (!selectedDrawing) return;
    setPendingPin({ x, y, pageNumber });
    setIsCommentModalOpen(true);
  }, [selectedDrawing]);

  const handleSaveComment = useCallback(async (issueData: Omit<Issue, 'id' | 'timestamp'>) => {
    if (!selectedDrawing) return;

    try {
      if (pendingPin) {
        // Create new issue
        const newIssueData = {
          ...issueData,
          drawingId: selectedDrawing.id,
          projectId: project.id,
        };

        if (!useMockMode) {
          const newIssue = await createIssue(newIssueData);
          setIssues(prev => [...prev, newIssue]);
        } else {
          // Fallback to local state for demo users
          const newIssue: Issue = {
            ...issueData,
            id: `manual-${Date.now()}`,
            drawingId: selectedDrawing.id,
            timestamp: new Date(),
          };
          setIssues(prev => [...prev, newIssue]);
        }
        
        // Update project issue count
        const updatedProject = {
          ...project,
          issueCount: project.issueCount + 1,
        };
        onUpdateProject(updatedProject);
      } else if (selectedIssue) {
        // Update existing issue
        const updatedIssue = {
          ...selectedIssue,
          ...issueData,
        };

        if (!useMockMode) {
          const savedIssue = await updateIssue(updatedIssue);
          setIssues(prev => prev.map(issue => 
            issue.id === selectedIssue.id ? savedIssue : issue
          ));
        } else {
          // Fallback to local state for demo users
          setIssues(prev => prev.map(issue => 
            issue.id === selectedIssue.id ? updatedIssue : issue
          ));
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save issue:', error);
      alert('Failed to save issue. Please try again.');
    }
  }, [pendingPin, selectedIssue, selectedDrawing, project, onUpdateProject, useMockMode]);

  const handleCloseModal = useCallback(() => {
    setIsCommentModalOpen(false);
    setPendingPin(null);
    setSelectedIssue(null);
  }, []);

  const handleEditIssue = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
    setIsCommentModalOpen(true);
  }, []);

  const handleDeleteIssue = useCallback(async (issueId: string) => {
    try {
      if (!useMockMode) {
        await deleteIssue(issueId);
      }
      
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
      
      // Update project issue count
      const updatedProject = {
        ...project,
        issueCount: Math.max(0, project.issueCount - 1),
      };
      onUpdateProject(updatedProject);
    } catch (error) {
      console.error('Failed to delete issue:', error);
      alert('Failed to delete issue. Please try again.');
    }
  }, [project, onUpdateProject, useMockMode]);

  const handleIssueClick = useCallback((issue: Issue) => {
    setHighlightedIssueId(issue.id);
    setTimeout(() => setHighlightedIssueId(null), 2000);
  }, []);

  const handleUpdateIssueStatus = useCallback(async (issueId: string, status: Issue['status']) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const wasResolved = issue.status === 'Resolved';
    const isNowResolved = status === 'Resolved';
    
    try {
      const updatedIssue = {
        ...issue,
        status,
      };

      if (!useMockMode) {
        await updateIssue(updatedIssue);
      }

      setIssues(prev => prev.map(i => 
        i.id === issueId ? updatedIssue : i
      ));

      // Update project resolved count
      if (!wasResolved && isNowResolved) {
        const updatedProject = {
          ...project,
          resolvedCount: project.resolvedCount + 1,
        };
        onUpdateProject(updatedProject);
      } else if (wasResolved && !isNowResolved) {
        const updatedProject = {
          ...project,
          resolvedCount: Math.max(0, project.resolvedCount - 1),
        };
        onUpdateProject(updatedProject);
      }
    } catch (error) {
      console.error('Failed to update issue status:', error);
      alert('Failed to update issue status. Please try again.');
    }
  }, [issues, project, onUpdateProject, useMockMode]);

  const handleDeleteDrawing = useCallback(async (drawingId: string) => {
    if (!confirm('Delete this drawing? All associated issues will be removed.')) return;
    
    try {
      if (!useMockMode) {
        await deleteDrawingAPI(drawingId);
      }
      
      // Remove drawing and its issues
      const drawingIssues = issues.filter(i => i.drawingId === drawingId);
      const resolvedIssues = drawingIssues.filter(i => i.status === 'Resolved').length;
      
      const updatedProject = {
        ...project,
        drawings: project.drawings.filter(d => d.id !== drawingId),
        issueCount: project.issueCount - drawingIssues.length,
        resolvedCount: project.resolvedCount - resolvedIssues,
      };
      onUpdateProject(updatedProject);
      
      setIssues(prev => prev.filter(i => i.drawingId !== drawingId));
      
      if (selectedDrawing?.id === drawingId) {
        setSelectedDrawing(updatedProject.drawings.length > 0 ? updatedProject.drawings[0] : null);
      }
    } catch (error) {
      console.error('Failed to delete drawing:', error);
      alert('Failed to delete drawing. Please try again.');
    }
  }, [project, issues, selectedDrawing, onUpdateProject]);

  const currentDrawingIssues = selectedDrawing 
    ? issues.filter(i => i.drawingId === selectedDrawing.id)
    : [];

  const handleSaveNotes = useCallback(() => {
    const updatedProject = {
      ...project,
      notes: notesText,
    };
    onUpdateProject(updatedProject);
    setIsEditingNotes(false);
  }, [notesText, project, onUpdateProject]);

  useEffect(() => {
    setNotesText(project.notes || '');
  }, [project.notes]);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-slate-900">{project.name}</h1>
              <p className="text-slate-500 text-sm">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {selectedDrawing && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">{selectedDrawing.name}</span>
                <span className="mx-2">•</span>
                <span>{currentDrawingIssues.length} issues</span>
                {isAnalyzing && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-blue-600 animate-pulse">AI analyzing...</span>
                  </>
                )}
              </div>
            )}
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Drawing
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('drawings')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'drawings'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Drawings
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <StickyNote className="w-4 h-4" />
                Notes
              </div>
            </button>
            {user?.role === 'senior' && (
              <button
                onClick={() => setActiveTab('team')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'team'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Team
                </div>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'drawings' && project.drawings.length > 0 && (
              <>
                <div className="p-4 border-b border-slate-200">
                  <h3 className="text-slate-900 text-sm">Drawings</h3>
                  <p className="text-slate-500 text-xs mt-1">{project.drawings.length} file(s)</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {project.drawings.map(drawing => (
                    <div
                      key={drawing.id}
                      className={`
                        relative p-4 hover:bg-slate-50 transition-colors cursor-pointer group
                        ${selectedDrawing?.id === drawing.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}
                      `}
                      onClick={() => setSelectedDrawing(drawing)}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          selectedDrawing?.id === drawing.id ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${
                            selectedDrawing?.id === drawing.id ? 'text-blue-900' : 'text-slate-900'
                          }`}>
                            {drawing.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {drawing.uploadedAt.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {issues.filter(i => i.drawingId === drawing.id).length} issues
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDrawing(drawing.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                          title="Delete drawing"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'drawings' && project.drawings.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No drawings uploaded</p>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-slate-900 text-sm">Project Notes</h3>
                  {!isEditingNotes && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                      title="Edit notes"
                    >
                      <Edit2 className="w-4 h-4 text-slate-600" />
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {isEditingNotes ? (
                    <div className="space-y-3">
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        className="w-full h-full min-h-[400px] px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 font-mono"
                        placeholder="Add project notes here... (Markdown supported)"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveNotes}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setNotesText(project.notes || '');
                            setIsEditingNotes(false);
                          }}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {project.notes || 'No notes added yet. Click the edit button to add project notes.'}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'team' && user?.role === 'senior' && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="text-slate-900 text-sm">Team Members</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    {project.teamMembers?.length || 0} member{project.teamMembers?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {project.teamMembers && project.teamMembers.length > 0 ? (
                    <div className="space-y-3">
                      {project.teamMembers.map(member => (
                        <div
                          key={member.id}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-slate-900 text-sm">
                                  {member.name}
                                </span>
                                {member.role === 'senior' && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                    Senior
                                  </span>
                                )}
                                {member.role === 'junior' && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    Junior
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{member.email}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                Joined {member.joinedAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-8">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm">No team members assigned</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Viewer Area */}
        {!selectedDrawing ? (
          <div className="flex-1 flex items-center justify-center p-8 bg-slate-100">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-slate-900 mb-2">No Drawing Selected</h3>
              <p className="text-slate-500 mb-6">
                Upload a PDF drawing to get started with AI-powered analysis
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="w-5 h-5" />
                Upload First Drawing
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-hidden">
              <PDFViewer
                pdfFile={{
                  file: selectedDrawing.file,
                  url: selectedDrawing.url,
                  numPages: selectedDrawing.numPages,
                }}
                issues={currentDrawingIssues}
                onPDFClick={handlePDFClick}
                highlightedIssueId={highlightedIssueId}
                onNumPagesChange={(numPages) => {
                  const updatedDrawings = project.drawings.map(d => 
                    d.id === selectedDrawing.id ? { ...d, numPages } : d
                  );
                  onUpdateProject({ ...project, drawings: updatedDrawings });
                }}
              />
            </div>
            <IssueSidebar
              issues={currentDrawingIssues}
              onIssueClick={handleIssueClick}
              onEditIssue={handleEditIssue}
              onDeleteIssue={handleDeleteIssue}
              onUpdateStatus={handleUpdateIssueStatus}
            />
          </>
        )}
      </div>

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <CommentModal
          issue={selectedIssue}
          pendingPin={pendingPin}
          onSave={handleSaveComment}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}