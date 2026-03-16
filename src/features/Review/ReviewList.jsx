import React from 'react';
import { Eye, CheckCircle2, Save, AlertCircle } from 'lucide-react';
import { TO } from '../../utils/theme';
import { TestCard } from './TestCard';

export const ReviewList = ({ tests, statuses, editingId, editForm, setEditForm, handlers, stats, onCitHover, onCitLeave }) => {
  const allAccepted = stats.pending === 0;
  return (
    <div className="bg-white rounded-lg border flex flex-col h-full overflow-hidden" style={{ borderColor: TO.cardBd }}>
      <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50/50" style={{ borderColor: TO.cardBd }}>
        <div className="flex items-center gap-2">
          <Eye size={15} style={{ color: TO.textSecondary }} />
          <h3 className="text-sm font-semibold" style={{ color: TO.textPrimary }}>Review Generated Tests</h3>
          {stats.pending > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>{stats.pending} pending</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlers.onAcceptAll} disabled={stats.pending === 0} className="px-3 py-1.5 text-[11px] font-semibold rounded-md border text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors" style={{ borderColor: TO.cardBd }}>Accept All</button>
          <button className="px-3 py-1.5 text-[11px] font-semibold rounded-md text-white flex items-center gap-1.5 transition-colors disabled:opacity-50" style={{ backgroundColor: TO.passed }} disabled={stats.accepted === 0}>
            <Save size={13} />Save {stats.accepted} Tests to Requirement
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
        <div className="w-full space-y-4">
          {tests.map(t => (
            <TestCard key={t.id} test={t} status={statuses[t.id]} 
              isEditing={editingId === t.id} editForm={editForm} setEditForm={setEditForm}
              onAccept={handlers.onAccept} onReject={handlers.onReject} onEdit={handlers.onEdit}
              onSaveEdit={handlers.onSaveEdit} onCancelEdit={handlers.onCancelEdit}
              onRegenerate={handlers.onRegenerate} onFeedback={handlers.onFeedback}
              onCitHover={onCitHover} onCitLeave={onCitLeave} />
          ))}
          {tests.length === 0 && <div className="text-center py-10 text-xs text-gray-400">Generate tests to review them here.<br/>You can optionally resolve clarifications first.</div>}
        </div>
      </div>
    </div>
  );
};
