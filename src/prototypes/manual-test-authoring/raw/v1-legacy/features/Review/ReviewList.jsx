import React from 'react';
import { Eye, Save } from 'lucide-react';
import { TO } from '../../utils/theme';
import { TestCard } from './TestCard';

export const ReviewList = ({ tests, statuses, editingId, editForm, setEditForm, handlers, stats, onHover, onLeave }) => {
  return (
    <div className="bg-white rounded-lg border flex flex-col h-full overflow-hidden" style={{ borderColor: TO.cardBd }}>
      <div className="px-4 py-3 border-b flex justify-between items-center bg-slate-50/80" style={{ borderColor: TO.cardBd }}>
        <div className="flex items-center gap-2">
          <Eye size={14} style={{ color: TO.textSecondary }} />
          <h3 className="text-sm font-semibold" style={{ color: TO.textPrimary }}>Review Generated Tests</h3>
          {stats.pending > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-700">{stats.pending} pending</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlers.onAcceptAll} disabled={stats.pending === 0}
            className="px-3 py-1.5 text-[11px] font-semibold rounded-md border text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            style={{ borderColor: TO.cardBd }}>
            Accept All
          </button>
          {stats.accepted > 0 && (
            <button className="px-3 py-1.5 text-[11px] font-semibold rounded-md text-white flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: TO.passed }}>
              <Save size={12} />Save {stats.accepted} to TestOps
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
        <div className="w-full space-y-3">
          {tests.map(t => (
            <TestCard key={t.id} test={t} status={statuses[t.id]}
              isEditing={editingId === t.id} editForm={editForm} setEditForm={setEditForm}
              onAccept={handlers.onAccept} onReject={handlers.onReject} onEdit={handlers.onEdit}
              onSaveEdit={handlers.onSaveEdit} onCancelEdit={handlers.onCancelEdit}
              onRegenerate={handlers.onRegenerate}
              onHover={onHover} onLeave={onLeave} />
          ))}
          {tests.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400">
              Generate tests to review them here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
