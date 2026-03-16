import React from 'react';
import { TO, CITATION_COLORS } from '../../utils/theme';
import { citableSegments, requirementSections } from '../../data/mockData';
import { CitationBadge } from '../../components/Shared/CitationBadge';

export const RequirementPanel = ({ highlightedSegments, onSegmentHover, onSegmentLeave }) => (
  <div className="bg-white rounded-lg border p-4 space-y-3" style={{ borderColor: TO.cardBd }}>
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-xs font-semibold" style={{ color: TO.textPrimary }}>Requirement</h3>
      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: '#F5F3FF', color: TO.aiAccent }}>
        {citableSegments.length} segments parsed
      </span>
    </div>
    {requirementSections.map((section, si) => (
      <div key={si}>
        <h4 className="text-[11px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: TO.textMuted }}>{section.title}</h4>
        <div className="space-y-1.5">
          {section.segments.map(segId => {
            const seg = citableSegments.find(s => s.id === segId);
            if (!seg) return null;
            const hl = highlightedSegments.includes(segId);
            const c = CITATION_COLORS[seg.type];
            return (
              <div key={segId} id={`seg-${segId}`}
                onMouseEnter={() => onSegmentHover(segId)} onMouseLeave={onSegmentLeave}
                className="p-2 rounded-md border-l-[3px] transition-all text-xs leading-relaxed"
                style={{ borderLeftColor: hl ? c.border : 'transparent', backgroundColor: hl ? c.bg : 'transparent', color: TO.textSecondary, boxShadow: hl ? `0 0 0 1px ${c.border}40` : 'none' }}>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5"><CitationBadge segmentId={segId} type={seg.type} isActive={hl} small /></span>
                  <span>{seg.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);
