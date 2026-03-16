import React from 'react';
import { Link2 } from 'lucide-react';
import { CITATION_COLORS } from '../../utils/theme';

export const CitationBadge = ({ segmentId, type, isActive, onHover, onLeave, small }) => {
  const c = CITATION_COLORS[type] || CITATION_COLORS.requirement;
  return (
    <span 
      onMouseEnter={() => onHover?.(segmentId)} 
      onMouseLeave={() => onLeave?.()}
      className={`inline-flex items-center gap-0.5 rounded font-medium cursor-default transition-all ${small ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'} ${isActive ? 'ring-2 ring-offset-1 scale-105' : ''}`}
      style={{ backgroundColor: c.bg, color: c.text }} 
      title={`${c.label}: ${segmentId}`}
    >
      <Link2 size={small ? 8 : 9} />{segmentId}
    </span>
  );
};
