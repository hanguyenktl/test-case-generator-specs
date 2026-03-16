import React, { useState } from 'react';
import { FileText, ListTree, Network } from 'lucide-react';
import { TO, CITATION_COLORS } from '../../utils/theme';
import { citableSegments, requirementSections, mockRequirementText } from '../../data/mockData';
import { CitationBadge } from '../../components/Shared/CitationBadge';
import { TraceMapCanvas } from '../Trace/TraceMapCanvas';

export const RequirementPanel = ({ highlightedSegments, onSegmentHover, onSegmentLeave, isAssessmentDone, hasGenerated }) => {
  const [activeTab, setActiveTab] = useState('original');

  const tabs = [
    { id: 'original', label: 'Original Ticket', icon: <FileText size={14} /> },
  ];
  
  if (isAssessmentDone) {
    tabs.push({ id: 'behaviors', label: 'Extracted Behaviors', icon: <ListTree size={14} /> });
  }
  
  if (hasGenerated) {
    tabs.push({ id: 'map', label: 'Trace Map', icon: <Network size={14} /> });
  }

  return (
    <div className="bg-white rounded-lg border h-full flex flex-col overflow-hidden shadow-sm" style={{ borderColor: TO.cardBd }}>
      {/* Tabs Header */}
      <div className="flex items-center gap-1 px-2 pt-2 border-b bg-gray-50/50" style={{ borderColor: TO.cardBd }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-md transition-colors relative ${activeTab === tab.id ? 'text-indigo-700 bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto w-full relative">
        {activeTab === 'original' && (
          <div className="p-6">
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-slate-700">
              {mockRequirementText}
            </pre>
          </div>
        )}

        {activeTab === 'behaviors' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold" style={{ color: TO.textPrimary }}>Testable Behaviors Context</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#F5F3FF', color: TO.aiAccent }}>
                {citableSegments.length} behaviors mapped
              </span>
            </div>
            {requirementSections.map((section, si) => (
              <div key={si} className="mb-6 last:mb-0">
                <h4 className="text-[11px] font-semibold mb-2.5 uppercase tracking-wider" style={{ color: TO.textMuted }}>{section.title}</h4>
                <div className="space-y-2 relative">
                  {section.segments.map(segId => {
                    const seg = citableSegments.find(s => s.id === segId);
                    if (!seg) return null;
                    const hl = highlightedSegments.includes(segId);
                    const c = CITATION_COLORS[seg.type];
                    
                    return (
                      <div key={segId} id={`seg-${segId}`}
                        onMouseEnter={() => onSegmentHover(segId)} onMouseLeave={onSegmentLeave}
                        className={`p-3 rounded-lg border-l-[3px] transition-all duration-200 text-xs leading-relaxed relative ${hl ? 'transform scale-[1.01] bg-white ring-1 shadow-md z-10' : 'bg-gray-50 hover:bg-gray-100 border-transparent'}`}
                        style={{ borderLeftColor: hl ? c.border : 'transparent', ringColor: hl ? c.border : 'transparent', color: TO.textSecondary }}>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 mt-0.5 shadow-sm rounded-md bg-white">
                            <CitationBadge segmentId={segId} type={seg.type} isActive={hl} small />
                          </span>
                          <span className={hl ? 'text-slate-900 font-medium' : 'text-slate-600'}>{seg.text}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="absolute inset-0 p-2">
            <TraceMapCanvas />
          </div>
        )}
      </div>
    </div>
  );
};
