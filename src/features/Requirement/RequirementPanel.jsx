import React, { useMemo, useRef, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { TO } from '../../utils/theme';
import { mockRequirementText } from '../../data/mockData';

export const RequirementPanel = ({ highlightedParagraphs = [] }) => {
  const paragraphs = useMemo(() => {
    return mockRequirementText.split('\n\n').map((text, index) => ({
      index,
      text: text.trim(),
    }));
  }, []);

  const paraRefs = useRef({});
  const scrollContainerRef = useRef(null);

  // Scroll to first highlighted paragraph
  useEffect(() => {
    if (highlightedParagraphs.length > 0) {
      const firstIdx = highlightedParagraphs[0];
      const el = paraRefs.current[firstIdx];
      if (el && scrollContainerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedParagraphs]);

  return (
    <div className="bg-white rounded-lg border h-full flex flex-col overflow-hidden shadow-sm" style={{ borderColor: TO.cardBd }}>
      <div className="flex items-center gap-2 px-5 py-3 border-b bg-gray-50/50 flex-shrink-0" style={{ borderColor: TO.cardBd }}>
        <FileText size={14} style={{ color: TO.textSecondary }} />
        <h3 className="text-sm font-semibold" style={{ color: TO.textPrimary }}>Requirement</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600 ml-auto">Synced from Jira</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6" ref={scrollContainerRef}>
        <div className="space-y-1">
          {paragraphs.map((para) => {
            const isHighlighted = highlightedParagraphs.includes(para.index);
            return (
              <div
                key={para.index}
                ref={el => { paraRefs.current[para.index] = el; }}
                className="transition-all duration-400 ease-out relative"
                style={{
                  padding: '8px 12px',
                  backgroundColor: isHighlighted ? '#F5F3FF' : 'transparent',
                  borderLeft: isHighlighted ? '2px solid #8B5CF6' : '2px solid transparent',
                  borderRadius: '0 6px 6px 0',
                }}
              >
                <pre
                  className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed transition-colors duration-400"
                  style={{ color: isHighlighted ? '#374151' : '#64748B' }}
                >
                  {para.text}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
