import React, { useState } from 'react';
import { CheckCircle2, Check, X, Edit3, RotateCcw, Loader2 } from 'lucide-react';
import { TO } from '../../utils/theme';

const TEST_STATUS = { PENDING: 'pending', ACCEPTED: 'accepted', REJECTED: 'rejected', MODIFIED: 'modified', REGENERATING: 'regenerating' };

export const TestCard = ({ test, status, isEditing, editForm, setEditForm, onAccept, onReject, onEdit, onSaveEdit, onCancelEdit, onRegenerate, onHover, onLeave }) => {
  const [showRegenOpts, setShowRegenOpts] = useState(false);
  const [regenContext, setRegenContext] = useState('');

  if (status === TEST_STATUS.REJECTED) return null;
  const isAccepted = status === TEST_STATUS.ACCEPTED || status === TEST_STATUS.MODIFIED;
  const isRegen = status === TEST_STATUS.REGENERATING;

  return (
    <div 
      className={`rounded-lg border transition-all duration-200 ${isAccepted ? 'bg-white' : isRegen ? 'bg-purple-50/50 opacity-60' : 'bg-white hover:shadow-md'} overflow-hidden relative group`}
      style={{ borderColor: isAccepted ? '#A7F3D0' : isRegen ? '#DDD6FE' : TO.cardBd }}
      onMouseEnter={() => onHover?.(test.paragraphs || [])}
      onMouseLeave={() => onLeave?.()}
    >
      {/* Accepted indicator */}
      {isAccepted && <div className="absolute top-0 left-0 w-1 h-full rounded-l" style={{ backgroundColor: TO.passed }} />}
      
      <div className={`p-4 ${isAccepted ? 'pl-5' : ''}`}>
        {/* Header: ID + Type + Priority */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{test.id}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-medium"
                style={{ 
                  color: test.type === 'negative' ? '#DC2626' : test.type === 'edge_case' ? '#D97706' : test.type === 'boundary' ? '#7C3AED' : '#059669',
                  backgroundColor: test.type === 'negative' ? '#FEF2F2' : test.type === 'edge_case' ? '#FFFBEB' : test.type === 'boundary' ? '#F5F3FF' : '#F0FDF4',
                }}>
                {test.type.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: test.priority === 'high' ? TO.failed : test.priority === 'medium' ? TO.warning : TO.textMuted }} />
                <span className="text-[10px] uppercase text-slate-400">{test.priority}</span>
              </div>
              {isAccepted && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1" style={{ color: '#065F46', backgroundColor: '#D1FAE5' }}>
                  <CheckCircle2 size={10} />
                  {status === TEST_STATUS.MODIFIED ? 'Modified' : 'Accepted'}
                </span>
              )}
            </div>
            
            {/* Title */}
            {isEditing ? (
              <input type="text" value={editForm?.name || ''} 
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} 
                className="w-full text-sm font-semibold text-slate-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent" />
            ) : (
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">{test.name}</h4>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="mt-2 pl-2 border-l-2 border-slate-100 space-y-1">
          {isEditing ? (
            <textarea value={editForm?.steps?.join?.('\n') || ''} 
              onChange={e => setEditForm(p => ({ ...p, steps: e.target.value.split('\n') }))} 
              className="w-full text-xs text-slate-600 font-mono bg-slate-50 border p-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500" rows={4} />
          ) : (
            test.steps.map((s, i) => (
              <div key={i} className="text-xs text-slate-600 flex gap-2">
                <span className="text-slate-400 select-none">{i + 1}.</span>
                <span>{s}</span>
              </div>
            ))
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
          {isRegen ? (
            <div className="text-xs font-medium flex items-center gap-1.5" style={{ color: TO.aiAccent }}>
              <Loader2 size={13} className="animate-spin" />Regenerating...
            </div>
          ) : isEditing ? (
            <div className="flex items-center gap-2 w-full justify-end">
              <button onClick={onCancelEdit} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">Cancel</button>
              <button onClick={() => onSaveEdit(test.id)} className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium">Save</button>
            </div>
          ) : showRegenOpts ? (
            <div className="w-full">
              <textarea value={regenContext} onChange={e => setRegenContext(e.target.value)} 
                placeholder="What should be different? (e.g., Include error codes, focus on edge cases...)" 
                className="w-full text-xs p-2.5 border rounded-lg resize-none focus:outline-none focus:ring-1" rows={2} 
                style={{ borderColor: TO.cardBd, '--tw-ring-color': TO.aiAccent }} />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowRegenOpts(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-md font-medium">Cancel</button>
                <button onClick={() => { onRegenerate(test.id, regenContext); setShowRegenOpts(false); setRegenContext(''); }} 
                  className="px-3 py-1.5 text-xs text-white rounded-md bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1 font-medium">
                  <RotateCcw size={12} />Regenerate
                </button>
              </div>
            </div>
          ) : !isAccepted ? (
            <div className="flex items-center gap-2 w-full">
              <button onClick={() => onAccept(test.id)} className="flex-1 py-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                <Check size={14} />Accept
              </button>
              <button onClick={() => onReject(test.id)} className="flex-1 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                <X size={14} />Reject
              </button>
              <div className="w-px h-4 bg-slate-200 mx-0.5" />
              <button onClick={() => setShowRegenOpts(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Regenerate">
                <RotateCcw size={14} />
              </button>
              <button onClick={() => onEdit(test)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                <Edit3 size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full justify-end">
              <button onClick={() => setShowRegenOpts(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Regenerate">
                <RotateCcw size={14} />
              </button>
              <button onClick={() => onEdit(test)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                <Edit3 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
