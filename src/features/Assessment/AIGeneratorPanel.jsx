import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Lightbulb, FileUp, X, Loader2, CheckCircle2, Circle, Info } from 'lucide-react';
import { TO } from '../../utils/theme';

// Deterministic scoring criteria — always visible
const BASE_CRITERIA = [
  { label: 'Has user story structure', met: true, pts: 15 },
  { label: 'Contains acceptance criteria', met: true, pts: 12 },
  { label: 'Specifies entry points', met: true, pts: 10 },
  { label: 'Defines user interactions', met: true, pts: 10 },
  { label: 'Covers error / edge cases', met: false, pts: 0, maxPts: 10 },
  { label: 'Has clear scope boundaries', met: false, pts: 0, maxPts: 5 },
];

// LLM-derived criteria — only appear after analysis
const LLM_CRITERIA = [
  { label: 'Scenarios identifiable', met: true, pts: 8 },
  { label: 'Ambiguity level is low', met: true, pts: 4 },
];

export const AIGeneratorPanel = ({
  clarifications = [], onResolve,
  additionalContext = '', onContextChange,
  documents = [], onUpload, onRemoveDoc,
  assessmentStatus = 'ready', // 'analyzing' | 'done'
}) => {
  const [expanded, setExpanded] = useState(false);
  const unresolvedCount = clarifications.filter(c => !c.resolved).length;
  const resolvedCount = clarifications.filter(c => c.resolved).length;
  const isAnalyzing = assessmentStatus === 'analyzing';

  // Score: deterministic base appears instantly, bumps when LLM finishes
  const baseScore = BASE_CRITERIA.reduce((s, c) => s + c.pts, 0); // 47
  const llmBonus = !isAnalyzing ? LLM_CRITERIA.reduce((s, c) => s + c.pts, 0) : 0; // 12
  const contextBonus = resolvedCount * 5 + (documents.length > 0 ? 5 : 0) + (additionalContext.length > 20 ? 3 : 0);
  let score = Math.min(baseScore + llmBonus + contextBonus + 15, 98); // +15 baseline offset

  const scoreColor = score >= 85 ? '#10B981' : score >= 70 ? '#F59E0B' : '#F97316';
  const scoreLabel = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement';

  return (
    <div className="space-y-2">
      {/* Readiness bar — elegant, compact, light */}
      <div
        className="rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-50"
        style={{ border: '1px solid #E5E7EB', backgroundColor: '#FAFBFC' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="px-3 py-2 flex items-center gap-3">
          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#F3F0FF' }}>
            <Sparkles size={12} className="text-violet-500" />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[11px] font-medium text-slate-500">Readiness</span>
            <span className="text-sm font-bold" style={{ color: scoreColor }}>{score}%</span>
            <span className="text-[9px] uppercase font-semibold tracking-wide" style={{ color: scoreColor }}>{scoreLabel}</span>
            {isAnalyzing && <Loader2 size={10} className="animate-spin text-slate-400" />}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isAnalyzing && unresolvedCount > 0 && (
              <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                <Lightbulb size={9} />{unresolvedCount} tip{unresolvedCount > 1 ? 's' : ''}
              </span>
            )}
            {isAnalyzing && (
              <span className="text-[10px] text-slate-400">Analyzing...</span>
            )}
            {expanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
          </div>
        </div>

        <div className="h-1 mx-3 mb-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F5F9' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: scoreColor }} />
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="space-y-2 pl-0.5">

          {/* Score Rationale */}
          <div className="rounded-lg p-2.5" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Info size={9} />Score Breakdown
            </p>
            <div className="space-y-0.5">
              {BASE_CRITERIA.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  {c.met
                    ? <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
                    : <Circle size={10} className="text-slate-300 flex-shrink-0" />
                  }
                  <span className={c.met ? 'text-slate-600' : 'text-slate-400'}>{c.label}</span>
                  <span className="ml-auto font-mono text-[9px]" style={{ color: c.met ? '#10B981' : '#CBD5E1' }}>
                    {c.met ? `+${c.pts}` : `+${c.maxPts || 0}`}
                  </span>
                </div>
              ))}
              {!isAnalyzing && LLM_CRITERIA.map((c, i) => (
                <div key={`llm-${i}`} className="flex items-center gap-1.5 text-[10px]">
                  <CheckCircle2 size={10} className="text-violet-500 flex-shrink-0" />
                  <span className="text-slate-600">{c.label}</span>
                  <span className="text-[8px] px-1 rounded bg-violet-50 text-violet-500 font-medium ml-1">AI</span>
                  <span className="ml-auto font-mono text-[9px] text-violet-500">+{c.pts}</span>
                </div>
              ))}
              {isAnalyzing && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Loader2 size={10} className="animate-spin" />
                  <span>AI analysis in progress...</span>
                </div>
              )}
              {/* Dynamic boosts */}
              {resolvedCount > 0 && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-600">Clarifications resolved ({resolvedCount})</span>
                  <span className="ml-auto font-mono text-[9px] text-emerald-500">+{resolvedCount * 5}</span>
                </div>
              )}
              {documents.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-600">Supporting docs attached</span>
                  <span className="ml-auto font-mono text-[9px] text-emerald-500">+5</span>
                </div>
              )}
              {additionalContext.length > 20 && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-600">Additional context provided</span>
                  <span className="ml-auto font-mono text-[9px] text-emerald-500">+3</span>
                </div>
              )}
            </div>
          </div>

          {/* Clarifications — only show after LLM is done */}
          {!isAnalyzing && clarifications.filter(c => !c.resolved).map(c => (
            <div key={c.id} className="rounded-lg p-2.5 space-y-2"
              style={{ backgroundColor: '#FEFCE8', border: '1px solid #FEF08A' }}>
              <p className="text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                <Lightbulb size={11} className="text-amber-500 flex-shrink-0" />
                {c.question}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.suggestions.map((s, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); onResolve(c.id, s); }}
                    className="px-2 py-1 text-[10px] rounded-md font-medium bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-colors shadow-sm"
                    style={{ border: '1px solid #E5E7EB' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Resolved — very compact */}
          {clarifications.filter(c => c.resolved).map(c => (
            <div key={c.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px]"
              style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
              <span className="text-slate-500 truncate flex-1">{c.question}</span>
              <span className="text-emerald-700 font-semibold flex-shrink-0">{c.resolvedAnswer}</span>
            </div>
          ))}

          {/* Context + Upload — compact */}
          <div className="space-y-1.5">
            <textarea
              value={additionalContext}
              onChange={(e) => onContextChange(e.target.value)}
              placeholder="Add context: related features, constraints..."
              className="w-full text-[11px] rounded-lg border p-2 focus:outline-none focus:ring-1 focus:ring-violet-200 transition-all resize-none min-h-[40px]"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: TO.textBody }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              {documents.map(d => (
                <div key={d.id} className="flex items-center gap-1 px-2 py-0.5 text-[9px] bg-violet-50 rounded text-violet-700 font-medium border border-violet-100">
                  <span className="truncate max-w-[80px]">{d.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); onRemoveDoc(d.id); }} className="text-violet-400 hover:text-red-500"><X size={8} /></button>
                </div>
              ))}
              <label className="px-2 py-0.5 text-[9px] border border-dashed rounded text-slate-400 hover:text-violet-600 hover:border-violet-300 cursor-pointer transition-all font-medium"
                style={{ borderColor: '#D1D5DB' }}>
                <FileUp size={9} className="inline mr-0.5" />Upload
                <input type="file" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload({ id: Date.now(), name: f.name, type: f.type });
                }} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
