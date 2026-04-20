import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { TO } from '../../utils/theme';

export const ClarificationItem = ({ item, onResolve }) => {
  const [ci, setCi] = useState('');
  const [sc, setSc] = useState(false);
  
  if (item.resolved) {
    return (
      <div className="p-2.5 rounded-lg border" style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
        <div className="flex items-start gap-2">
          <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" style={{ color: TO.passed }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: '#065F46' }}>{item.question}</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#047857' }}>✓ {item.resolvedAnswer}</p>
          </div>
          <button onClick={() => onResolve(item.id, null)} className="text-[10px] hover:underline" style={{ color: '#047857' }}>Change</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-2.5 rounded-lg border" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
      <div className="flex items-start gap-2 mb-2">
        <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: TO.warning }} />
        <p className="text-xs font-medium" style={{ color: '#92400E' }}>{item.question}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {item.suggestions.map((s, i) => (
          <button key={i} onClick={() => onResolve(item.id, s)} className="px-2 py-1 text-[11px] bg-white rounded-md border font-medium hover:bg-amber-50 transition-colors" style={{ color: '#92400E', borderColor: '#FCD34D' }}>{s}</button>
        ))}
      </div>
      {!sc ? <button onClick={() => setSc(true)} className="text-[10px] hover:underline" style={{ color: '#B45309' }}>+ Custom</button> : (
        <div className="flex gap-1.5 mt-1.5">
          <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} placeholder="Your answer..."
            className="flex-1 px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white" style={{ borderColor: '#FCD34D' }}
            onKeyDown={(e) => { if (e.key === 'Enter' && ci.trim()) onResolve(item.id, ci); }} autoFocus />
          <button onClick={() => { if (ci.trim()) onResolve(item.id, ci); }} disabled={!ci.trim()} className="px-2 py-1 text-xs text-white rounded-md font-medium disabled:opacity-50" style={{ backgroundColor: TO.warning }}>Apply</button>
        </div>
      )}
    </div>
  );
};
