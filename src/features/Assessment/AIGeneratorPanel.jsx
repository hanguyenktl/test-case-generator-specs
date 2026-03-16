import React, { useState } from 'react';
import { Sparkles, ChevronUp, ChevronDown, CheckCircle2, Wand2, Lightbulb, Loader2, Bot } from 'lucide-react';
import { TO } from '../../utils/theme';
import { DocUpload } from '../../components/Shared/DocUpload';
import { ClarificationItem } from './ClarificationItem';

export const AIGeneratorPanel = ({ assessmentStatus, clarifications, onResolve, documents, onUpload, onRemoveDoc, additionalContext, onContextChange, onGenerate, isGenerating, hasGenerated, depth, onDepthChange, onAskKai }) => {
  const [expanded, setExpanded] = useState(true);
  const resolved = clarifications.filter(c => c.resolved).length;
  const total = clarifications.length;
  
  let baseScore = 62;
  if (assessmentStatus === 'callB_done') baseScore = 74;
  let score = baseScore + resolved * 10 + (documents.length > 0 ? 10 : 0);
  score = Math.min(score, 98);
  
  const color = score >= 85 ? TO.passed : score >= 70 ? TO.warning : '#F97316';
  
  // Status text logic based on progressive state
  let statusText = 'Refining...';
  if (assessmentStatus === 'callA_done') statusText = 'Score refining...';
  if (assessmentStatus === 'callB_done') statusText = 'Ready';

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#C4B5FD', background: 'linear-gradient(to bottom, #F5F3FF, #FFFFFF)' }}>
      <div className="px-4 py-3 cursor-pointer hover:bg-purple-50/30 transition-colors border-b" style={{ borderColor: '#EDE9FE' }} onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: TO.aiAccent }}><Sparkles size={15} className="text-white" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold" style={{ color: TO.textPrimary }}>AI Assessment</h3>
                {assessmentStatus !== 'callB_done' && <Loader2 size={12} className="animate-spin" style={{ color: TO.aiAccent }} />}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px]" style={{ color: TO.textSecondary }}>Readiness:</span>
                <span className="text-xs font-bold" style={{ color }}>{score}%</span>
                <span className="text-[10px] uppercase font-medium ml-1" style={{ color }}>{score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Refinement'}</span>
              </div>
            </div>
          </div>
          {expanded ? <ChevronUp size={15} style={{ color: TO.textMuted }} /> : <ChevronDown size={15} style={{ color: TO.textMuted }} />}
        </div>
        
        {/* Progressive Analysis Details visible even when not expanded if analyzing */}
        <div className="mt-3 space-y-1.5 pl-10">
          <div className="flex gap-1 items-center h-1.5 bg-gray-200 rounded-full overflow-hidden w-full max-w-[150px] mb-2">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
          </div>
          
          <div className="text-[10px]" style={{ color: TO.textSecondary }}>
            <div>Structure: 19 items • Feature</div>
            {assessmentStatus === 'analyzing' && (
              <div className="mt-1 flex gap-2 flex-wrap">
                <span className="text-amber-600 font-medium">⚠ 3 ambiguous terms</span>
                <span className="text-gray-500">○ Missing: error handling, boundaries</span>
              </div>
            )}
            {assessmentStatus === 'callA_done' && (
              <div className="mt-1">
                <div className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={10} /> 19 testable scenarios extracted</div>
                <div className="text-gray-500 mt-0.5">6 behavior • 5 edge_case • 6 error_handling • 1 constraint • 1 happy_path</div>
              </div>
            )}
            {assessmentStatus === 'callB_done' && (
              <div className="mt-1">
                <div className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={10} /> 19 testable scenarios extracted</div>
                <div className="text-amber-600 font-medium flex items-center gap-1 mt-0.5">⚠ {total - resolved} clarifications available</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color: TO.textSecondary }}>Depth:</span>
              <div className="flex rounded-md border overflow-hidden" style={{ borderColor: TO.cardBd }}>
                {['quick', 'thorough'].map(d => (
                  <button key={d} onClick={() => onDepthChange(d)} className="px-2.5 py-1 text-[11px] font-medium transition-colors"
                    style={{ backgroundColor: depth === d ? TO.aiAccent : 'white', color: depth === d ? 'white' : TO.textSecondary }}>
                    {d === 'quick' ? '⚡ Quick' : '🔍 Thorough'}
                  </button>
                ))}
              </div>
              <span className="text-[10px]" style={{ color: TO.textMuted }}>{depth === 'quick' ? 'Core scenarios' : 'All scenarios + edge cases'}</span>
            </div>
            <button onClick={() => onGenerate('initial')} disabled={isGenerating || hasGenerated}
              className="w-full py-2.5 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ backgroundColor: isGenerating || hasGenerated ? TO.textMuted : TO.aiAccent }}>
              {isGenerating ? <><Loader2 size={15} className="animate-spin" />Generating...</> : hasGenerated ? <><CheckCircle2 size={15} />Generated — Review on Right</> : <><Wand2 size={15} />Generate Test Cases</>}
            </button>
          </div>
          {total > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-medium flex items-center gap-1" style={{ color: TO.textBody }}><Lightbulb size={11} style={{ color: TO.warning }} />Resolve to improve results</h4>
                <span className="text-[10px]" style={{ color: TO.textMuted }}>{resolved}/{total}</span>
              </div>
              <div className="space-y-1.5">{clarifications.map(i => <ClarificationItem key={i.id} item={i} onResolve={onResolve} />)}</div>
            </div>
          )}
          
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium" style={{ color: TO.textSecondary }}>Additional context (optional):</span>
            <textarea 
              value={additionalContext}
              onChange={(e) => onContextChange(e.target.value)}
              placeholder="e.g., related features, constraints, team conventions..."
              className="w-full text-[13px] rounded-lg border p-2.5 focus:outline-none focus:ring-1 transition-all resize-none min-h-[60px]"
              style={{ borderColor: TO.cardBd, backgroundColor: '#FAFAFA', color: TO.textBody, '--tw-ring-color': TO.aiAccent }}
            />
          </div>

          <DocUpload documents={documents} onUpload={onUpload} onRemove={onRemoveDoc} />
          <button onClick={() => onAskKai('Help me understand the test coverage needs for this requirement')}
            className="w-full py-1.5 text-xs rounded-lg flex items-center justify-center gap-1.5 hover:bg-purple-50 transition-colors"
            style={{ color: TO.aiAccent, border: '1px dashed #C4B5FD' }}><Bot size={12} />Ask Kai for help</button>
        </div>
      )}
    </div>
  );
};
