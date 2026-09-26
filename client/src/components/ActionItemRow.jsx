import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Calendar, User, Trash2, Edit2, AlertCircle, Clock, ExternalLink } from 'lucide-react';

export const ActionItemRow = ({ item, onToggleStatus, onUpdate, onDelete, showNoteTitle = true }) => {
  const { id, task, owner, deadline, priority = 'medium', status = 'open', note_id, note_title } = item;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTask, setEditTask] = useState(task);
  const [editOwner, setEditOwner] = useState(owner || '');
  const [editDeadline, setEditDeadline] = useState(deadline ? deadline.split('T')[0] : '');
  const [editPriority, setEditPriority] = useState(priority);

  const isDone = status === 'done';

  const handleSaveEdit = () => {
    onUpdate(id, {
      task: editTask,
      owner: editOwner.trim() || null,
      deadline: editDeadline || null,
      priority: editPriority
    });
    setIsEditing(false);
  };

  const priorityStyles = {
    high: 'bg-red-500/10 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`glass-card rounded-2xl p-4 border transition-all ${
      isDone 
        ? 'border-slate-800/40 bg-slate-950/40 opacity-75' 
        : 'border-slate-800/80 bg-slate-900/60 hover:border-indigo-500/30'
    }`}>
      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-3 p-1">
          <input
            type="text"
            value={editTask}
            onChange={(e) => setEditTask(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            placeholder="Task description..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={editOwner}
              onChange={(e) => setEditOwner(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
              placeholder="Owner (e.g. Alex)"
            />
            <input
              type="date"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100"
            />
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5 flex-1 min-w-0">
            {/* Checkbox */}
            <button
              onClick={() => onToggleStatus(id, isDone ? 'open' : 'done')}
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg border transition-all ${
                isDone
                  ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                  : 'border-slate-600 bg-slate-950/60 text-transparent hover:border-indigo-400'
              }`}
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-snug break-words ${
                isDone ? 'line-through text-slate-400/80' : 'text-slate-100'
              }`}>
                {task}
              </p>

              {/* Meta Tags */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                {/* Priority Badge */}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold border ${priorityStyles[priority] || priorityStyles.medium}`}>
                  {priority.toUpperCase()}
                </span>

                {/* Owner Tag */}
                {owner && (
                  <span className="inline-flex items-center space-x-1 text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                    <User className="h-3 w-3 text-indigo-400" />
                    <span>{owner}</span>
                  </span>
                )}

                {/* Deadline Tag */}
                {deadline && (
                  <span className="inline-flex items-center space-x-1 text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                    <Calendar className="h-3 w-3 text-amber-400" />
                    <span>{formatDate(deadline)}</span>
                  </span>
                )}

                {/* Parent Note Link */}
                {showNoteTitle && note_title && note_id && (
                  <Link
                    to={`/notes/${note_id}`}
                    className="inline-flex items-center space-x-1 text-indigo-400 hover:underline bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-800/30 ml-auto sm:ml-0"
                  >
                    <span className="truncate max-w-[140px]">{note_title}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Edit Task"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionItemRow;
