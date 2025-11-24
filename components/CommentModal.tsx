import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Issue } from '../App';

interface CommentModalProps {
  issue: Issue | null;
  pendingPin: { x: number; y: number; pageNumber: number } | null;
  onSave: (issueData: Omit<Issue, 'id' | 'timestamp'>) => void;
  onClose: () => void;
}

const ISSUE_TYPES = [
  'Specification Inconsistency',
  'Missing Dimension/Callout',
  'Visual Discrepancy',
  'Code Compliance Concern',
  'Grading/Elevation Issue',
  'Other',
];

export function CommentModal({ issue, pendingPin, onSave, onClose }: CommentModalProps) {
  const [type, setType] = useState(issue?.type || 'Missing Dimension/Callout');
  const [severity, setSeverity] = useState<Issue['severity']>(issue?.severity || 'Medium');
  const [description, setDescription] = useState(issue?.description || '');
  const [status, setStatus] = useState<Issue['status']>(issue?.status || 'Open');

  useEffect(() => {
    if (issue) {
      setType(issue.type);
      setSeverity(issue.severity);
      setDescription(issue.description);
      setStatus(issue.status);
    }
  }, [issue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    const issueData: Omit<Issue, 'id' | 'timestamp'> = {
      drawingId: issue?.drawingId || '',
      pageNumber: pendingPin?.pageNumber || issue?.pageNumber || 1,
      x: pendingPin?.x || issue?.x || 0,
      y: pendingPin?.y || issue?.y || 0,
      type,
      severity,
      description,
      status,
      createdBy: issue?.createdBy || 'Senior Engineer',
      aiGenerated: issue?.aiGenerated || false,
    };

    onSave(issueData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-slate-900">
            {issue ? 'Edit Issue' : 'Add New Issue'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Issue Type */}
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {ISSUE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Severity <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all
                    ${severity === s
                      ? s === 'High' 
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : s === 'Medium'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }
                  `}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              placeholder="Describe the issue in detail..."
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Be specific about location, requirements, and potential impacts
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Issue['status'])}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Open">Open</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Location Info */}
          {pendingPin && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Location:</span> Page {pendingPin.pageNumber}, 
                Position ({(pendingPin.x * 100).toFixed(1)}%, {(pendingPin.y * 100).toFixed(1)}%)
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {issue ? 'Update Issue' : 'Add Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}