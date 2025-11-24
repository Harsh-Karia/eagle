import { useState, useMemo } from 'react';
import { 
  X, 
  AlertCircle, 
  Ruler, 
  Eye, 
  FileCheck, 
  Mountain, 
  MoreHorizontal,
  Filter,
  ChevronDown,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import type { Issue } from '../App';

interface IssueSidebarProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onEditIssue: (issue: Issue) => void;
  onDeleteIssue: (issueId: string) => void;
  onUpdateStatus: (issueId: string, status: Issue['status']) => void;
}

// Helper function to get issue number based on original issues array order
function getIssueNumber(issueId: string, allIssues: Issue[]): number {
  return allIssues.findIndex(i => i.id === issueId) + 1;
}

const ISSUE_TYPE_ICONS: Record<string, any> = {
  'Specification Inconsistency': FileCheck,
  'Missing Dimension/Callout': Ruler,
  'Visual Discrepancy': Eye,
  'Code Compliance Concern': AlertCircle,
  'Grading/Elevation Issue': Mountain,
  'Other': MoreHorizontal,
};

export function IssueSidebar({ 
  issues, 
  onIssueClick, 
  onEditIssue, 
  onDeleteIssue,
  onUpdateStatus 
}: IssueSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAI, setFilterAI] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity'>('date');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues.filter(issue => {
      if (filterType !== 'all' && issue.type !== filterType) return false;
      if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
      if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
      if (filterAI === 'ai' && !issue.aiGenerated) return false;
      if (filterAI === 'manual' && issue.aiGenerated) return false;
      return true;
    });

    if (sortBy === 'severity') {
      const severityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      filtered.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    } else {
      filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    return filtered;
  }, [issues, filterType, filterSeverity, filterStatus, filterAI, sortBy]);

  const counts = useMemo(() => {
    const total = issues.length;
    const open = issues.filter(i => i.status === 'Open').length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const ai = issues.filter(i => i.aiGenerated).length;
    return { total, open, resolved, ai };
  }, [issues]);

  const getSeverityColor = (severity: Issue['severity']) => {
    switch (severity) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'Open': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'In Review': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="w-12 border-l border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center"
      >
        <ChevronDown className="w-5 h-5 text-slate-600 -rotate-90" />
      </button>
    );
  }

  return (
    <div className="w-96 border-l border-slate-200 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900">Issue Tracker</h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-slate-900">{counts.total}</div>
            <div className="text-xs text-slate-500">Total</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="text-orange-700">{counts.open}</div>
            <div className="text-xs text-orange-600">Open</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-green-700">{counts.resolved}</div>
            <div className="text-xs text-green-600">Resolved</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="text-purple-700">{counts.ai}</div>
            <div className="text-xs text-purple-600">AI</div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            <select
              value={filterAI}
              onChange={(e) => setFilterAI(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">AI + Manual</option>
              <option value="ai">AI Only</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'severity')}
            className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="severity">Sort by Severity</option>
          </select>
        </div>
      </div>

      {/* Issue List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSortedIssues.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-1">No issues found</p>
            <p className="text-slate-400 text-sm">
              {issues.length === 0 
                ? 'Click on the drawing to add an issue'
                : 'Try adjusting your filters'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAndSortedIssues.map((issue) => {
              const Icon = ISSUE_TYPE_ICONS[issue.type] || MoreHorizontal;
              const isExpanded = expandedIssue === issue.id;
              const issueNumber = getIssueNumber(issue.id, issues);
              
              return (
                <div
                  key={issue.id}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => onIssueClick(issue)}
                >
                  <div className="flex items-start gap-3">
                    {/* Issue Number Badge */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${getSeverityColor(issue.severity)} text-white
                    `}>
                      <span className="text-xs font-medium">{issueNumber}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          <span className="text-sm text-slate-900">
                            {issue.type}
                          </span>
                          {issue.aiGenerated && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              AI
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className={`text-sm text-slate-600 mb-2 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {issue.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(issue.status)}`}>
                            {issue.status}
                          </span>
                          <span className="text-xs text-slate-500">
                            Page {issue.pageNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {issue.status !== 'Resolved' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(issue.id, 'Resolved');
                              }}
                              className="p-1.5 hover:bg-green-100 rounded transition-colors"
                              title="Mark as Resolved"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditIssue(issue);
                            }}
                            className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this issue?')) {
                                onDeleteIssue(issue.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Created info */}
                      <div className="mt-2 text-xs text-slate-400">
                        {issue.createdBy} • {issue.timestamp.toLocaleDateString()} {issue.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
