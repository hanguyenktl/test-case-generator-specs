import React, { useState } from 'react';
import { CheckCircle2, Check, X, Edit3, RotateCcw, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { TO } from '../../utils/theme';
import { CitationBadge } from '../../components/Shared/CitationBadge';

const TEST_STATUS = { PENDING: 'pending', ACCEPTED: 'accepted', REJECTED: 'rejected', MODIFIED: 'modified', REGENERATING: 'regenerating' };

export const TestCard = ({ test, status, isEditing, editForm, setEditForm, onAccept, onReject, onEdit, onSaveEdit, onCancelEdit, onRegenerate, onFeedback, onCitHover, onCitLeave }) => {
  const [showRegenOpts, setShowRegenOpts] = useState(false);
  const [regenContext, setRegenContext] = useState('');

  if (status === TEST_STATUS.REJECTED) return null;
  const isAccepted = status === TEST_STATUS.ACCEPTED || status === TEST_STATUS.MODIFIED;
  const isRegen = status === TEST_STATUS.REGENERATING;
  return (
    <div className={`rounded-lg border transition-all ${isAccepted ? 'bg-white' : isRegen ? 'bg-purple-50/50 grayscale' : 'bg-gradient-to-br from-[#FAFAFA] to-white'} overflow-hidden relative group`}
         style={{ borderColor: isAccepted ? '#A7F3D0' : isRegen ? '#DDD6FE' : TO.cardBd }}>
      {isAccepted && <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: TO.passed }} />}
      <div className={`p-3.5 ${isAccepted ? 'pl-4' : ''}`}>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{test.id}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border uppercase" style={{ color: TO.textSecondary, borderColor: TO.cardBd, backgroundColor: '#FAFAFA' }}>{test.type}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border uppercase flex items-center gap-1" style={{ color: test.priority === 'high' ? TO.failed : test.priority === 'medium' ? TO.warning : TO.textSecondary, borderColor: TO.cardBd, backgroundColor: '#FAFAFA' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: test.priority === 'high' ? TO.failed : test.priority === 'medium' ? TO.warning : TO.textMuted }} />
                {test.priority}
              </span>
              {isAccepted && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1" style={{ color: '#065F46', backgroundColor: '#D1FAE5' }}><CheckCircle2 size={10} />{status === TEST_STATUS.MODIFIED ? 'Modified' : 'Accepted'}</span>}
            </div>
            {isEditing ? <input type="text" value={editForm?.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full text-sm font-semibold text-gray-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent" />
                       : <h4 className="text-sm font-semibold text-gray-900 leading-snug">{test.name}</h4>}
          </div>
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
            {test.feedback === 'up' ? <div className="p-1 rounded bg-green-50 text-green-600"><ThumbsUp size={14} className="fill-current" /></div> :
             test.feedback === 'down' ? <div className="p-1 rounded bg-red-50 text-red-600"><ThumbsDown size={14} className="fill-current" /></div> :
             !isAccepted && !isRegen && (
                <>
                  <button onClick={() => onFeedback(test.id, 'up')} className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"><ThumbsUp size={14} /></button>
                  <button onClick={() => onFeedback(test.id, 'down')} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><ThumbsDown size={14} /></button>
                </>
            )}
          </div>
        </div>
        {test.citations && test.citations.length > 0 && !isEditing && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {test.citations.map((c, i) => <CitationBadge key={i} segmentId={c} type={test.citationTypes?.[i]} onHover={onCitHover} onLeave={onCitLeave} />)}
          </div>
        )}
        <div className="mt-2.5 pl-2 border-l-2 border-gray-100 space-y-1">
          {isEditing ? <textarea value={editForm?.steps?.join('\n') || ''} onChange={e => setEditForm(p => ({ ...p, steps: e.target.value.split('\n') }))} className="w-full text-xs text-gray-600 font-mono bg-gray-50 border p-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500" rows={4} />
                     : test.steps.map((s, i) => <div key={i} className="text-xs text-gray-600 flex gap-2"><span className="text-gray-400 select-none">{i + 1}.</span><span>{s}</span></div>)}
        </div>
        <div className="mt-3.5 pt-3 border-t flex items-center justify-between" style={{ borderColor: TO.cardBd }}>
          {isRegen ? <div className="text-xs font-medium flex items-center gap-1.5" style={{ color: TO.aiAccent }}><Loader2 size={13} className="animate-spin" />Regenerating test...</div> :
           isEditing ? (
            <div className="flex items-center gap-2 w-full justify-end">
              <button onClick={onCancelEdit} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancel</button>
              <button onClick={() => onSaveEdit(test.id)} className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium">Save Changes</button>
            </div>
          ) : showRegenOpts ? (
            <div className="w-full">
              <textarea value={regenContext} onChange={e => setRegenContext(e.target.value)} placeholder="Refinement focus (e.g. Include specific error codes)..." className="w-full text-xs p-2 border rounded resize-none focus:outline-none focus:ring-1" rows={2} style={{ borderColor: TO.cardBd, '--tw-ring-color': TO.aiAccent }} />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowRegenOpts(false)} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded font-medium">Cancel</button>
                <button onClick={() => { onRegenerate(test.id, regenContext); setShowRegenOpts(false); setRegenContext(''); }} className="px-3 py-1.5 text-xs text-white rounded bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1 font-medium"><RotateCcw size={13}/>Regenerate</button>
              </div>
            </div>
          ) : !isAccepted ? (
            <div className="flex items-center gap-2 w-full">
              <button onClick={() => onAccept(test.id)} className="flex-1 py-1.5 border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors"><Check size={14} />Accept</button>
              <button onClick={() => onReject(test.id)} className="flex-1 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors"><X size={14} />Reject</button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button onClick={() => setShowRegenOpts(true)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors border border-transparent" title="Regenerate Test"><RotateCcw size={14} /></button>
              <button onClick={() => onEdit(test)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-transparent" title="Edit Test"><Edit3 size={14} /></button>
            </div>
          ) : (
             <div className="flex items-center gap-2 w-full justify-end">
               <button onClick={() => setShowRegenOpts(true)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Regenerate"><RotateCcw size={14} /></button>
               <button onClick={() => onEdit(test)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit"><Edit3 size={14} /></button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
