import React from 'react';
import { Target, CheckCircle2, Circle, PlusCircle } from 'lucide-react';
import { TO } from '../../utils/theme';
import { citableSegments } from '../../data/mockData';
import { CitationBadge } from '../../components/Shared/CitationBadge';

export const CoverageSummary = ({ savedTests, canMore, onGenMore, onCitHover, onCitLeave }) => {
  const covered = new Set();
  savedTests.forEach(t => t.citations?.forEach(c => covered.add(c)));
  const tot = citableSegments.length;
  const cov = covered.size;
  const pct = Math.round((cov / tot) * 100) || 0;
  
  return (
    <div className="bg-white rounded-lg border p-4 mb-4" style={{ borderColor: TO.cardBd }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={15} style={{ color: TO.textSecondary }} />
          <h3 className="text-sm font-semibold" style={{ color: TO.textPrimary }}>Coverage Summary</h3>
        </div>
        <div className="text-xs font-semibold" style={{ color: cov === tot ? TO.passed : TO.textSecondary }}>{pct}% ({cov}/{tot} segments)</div>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden flex">
        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {citableSegments.map(s => {
          const isCov = covered.has(s.id);
          return (
            <div key={s.id} className="relative group" onMouseEnter={() => onCitHover(s.id)} onMouseLeave={onCitLeave}>
              <div className={`w-3 h-3 rounded-full border border-white shadow-sm flex items-center justify-center ${isCov ? 'bg-emerald-500' : 'bg-gray-200'}`} title={s.id}>
                {isCov && <CheckCircle2 size={8} className="text-white" />}
              </div>
            </div>
          );
        })}
      </div>
      {tot > cov && canMore && (
        <button onClick={onGenMore} className="w-full py-1.5 text-xs border border-dashed rounded-lg flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors" style={{ borderColor: TO.primary, color: TO.primary }}>
          <PlusCircle size={12} />Generate tests for uncovered segments
        </button>
      )}
    </div>
  );
};
