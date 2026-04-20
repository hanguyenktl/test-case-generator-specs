import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Lightbulb, Loader2, CheckCircle2, Circle, Info } from 'lucide-react';

// Deterministic scoring criteria
const BASE_CRITERIA = [
  { label: 'Has user story structure', key: 'userStory', pts: 15 },
  { label: 'Contains acceptance criteria', key: 'acceptance', pts: 12 },
  { label: 'Specifies entry points', key: 'entryPoints', pts: 10 },
  { label: 'Defines user interactions', key: 'interactions', pts: 10 },
  { label: 'Covers error / edge cases', key: 'edgeCases', pts: 10 },
  { label: 'Has clear scope boundaries', key: 'scope', pts: 5 },
];

// LLM-derived criteria
const LLM_CRITERIA = [
  { label: 'Scenarios identifiable', pts: 8 },
  { label: 'Ambiguity level is low', pts: 4 },
];

// Evaluate a requirement text against criteria
function evaluateRequirement(text) {
  const lower = text.toLowerCase();
  const len = text.length;
  return {
    userStory: /as a .+ i want/i.test(text) || /so that/i.test(text),
    acceptance: /acceptance|criteria|expected|should|must/i.test(text) && len > 200,
    entryPoints: /entry point|page|screen|button|navigate|click/i.test(text),
    interactions: /can |user |scroll|copy|click|select|drag|input|type/i.test(text) && len > 150,
    edgeCases: /edge|error|fail|invalid|exceed|denied|unsupported|scenario/i.test(text) && len > 300,
    scope: /limit|boundary|within|up to|maximum|performance/i.test(text),
  };
}

export const AIGeneratorPanel = ({
  requirementText = '',
  clarifications = [], onResolve,
  assessmentStatus = 'ready',
  onScoreChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const unresolvedCount = clarifications.filter(c => !c.resolved).length;
  const resolvedCount = clarifications.filter(c => c.resolved).length;
  const isAnalyzing = assessmentStatus === 'analyzing';

  // Evaluate requirement against criteria
  const evaluation = evaluateRequirement(requirementText);
  const scoredCriteria = BASE_CRITERIA.map(c => ({
    ...c,
    met: evaluation[c.key],
  }));

  const baseScore = scoredCriteria.reduce((s, c) => s + (c.met ? c.pts : 0), 0);
  const llmBonus = !isAnalyzing ? LLM_CRITERIA.reduce((s, c) => s + c.pts, 0) : 0;
  const clarificationBonus = resolvedCount * 5;
  let score = Math.min(baseScore + llmBonus + clarificationBonus + 10, 98);

  const scoreColor = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : score >= 30 ? '#F97316' : '#EF4444';
  const scoreLabel = score >= 70 ? 'Good' : score >= 50 ? 'Fair' : score >= 30 ? 'Needs Improvement' : 'Insufficient';

  // Report score to parent
  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  return (
    <div className="space-y-2">
      {/* Readiness bar */}
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
            <span className="text-[11px] font-medium text-slate-500">Requirement Quality</span>
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
              {scoredCriteria.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  {c.met
                    ? <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
                    : <Circle size={10} className="text-slate-300 flex-shrink-0" />
                  }
                  <span className={c.met ? 'text-slate-600' : 'text-slate-400'}>{c.label}</span>
                  <span className="ml-auto font-mono text-[9px]" style={{ color: c.met ? '#10B981' : '#CBD5E1' }}>
                    {c.met ? `+${c.pts}` : `+0`}
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
              {resolvedCount > 0 && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-600">Clarifications resolved ({resolvedCount})</span>
                  <span className="ml-auto font-mono text-[9px] text-emerald-500">+{resolvedCount * 5}</span>
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

          {/* Resolved */}
          {clarifications.filter(c => c.resolved).map(c => (
            <div key={c.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px]"
              style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
              <span className="text-slate-500 truncate flex-1">{c.question}</span>
              <span className="text-emerald-700 font-semibold flex-shrink-0">{c.resolvedAnswer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
