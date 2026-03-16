import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import { CITATION_COLORS } from '../../utils/theme';
import { citableSegments } from '../../data/mockData';

export const CitationBadge = ({ segmentId, type, isActive, onHover, onLeave, small }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const c = CITATION_COLORS[type] || CITATION_COLORS.requirement;
  const segment = citableSegments.find(s => s.id === segmentId);

  return (
    <span 
      onMouseEnter={() => { onHover?.(segmentId); setShowTooltip(true); }} 
      onMouseLeave={() => { onLeave?.(); setShowTooltip(false); }}
      className={`relative inline-flex items-center gap-0.5 rounded font-medium cursor-default transition-all ${small ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'} ${isActive ? 'ring-2 ring-offset-1 scale-105 z-10' : ''}`}
      style={{ backgroundColor: c.bg, color: c.text }} 
    >
      <Link2 size={small ? 8 : 9} />
      {c.label || segmentId}

      {/* Micro-Peek Popover */}
      {showTooltip && segment && (
        <div className="absolute z-50 left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 shadow-xl rounded-md p-3 text-left pointer-events-none transform transition-all origin-top-left">
          <div className="absolute -top-1.5 left-3 w-3 h-3 bg-slate-900 border-l border-t border-slate-700 transform rotate-45" />
          <div className="relative z-10">
            <div className="text-[9px] font-bold text-slate-400 mb-1.5 tracking-wider uppercase">{c.label} • {segment.id}</div>
            <div className="text-xs text-slate-200 font-serif leading-relaxed line-clamp-4">
              "{segment.text}"
            </div>
          </div>
        </div>
      )}
    </span>
  );
};
