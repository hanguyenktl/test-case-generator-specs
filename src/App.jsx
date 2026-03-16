import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Bell, Sparkles, BookOpen, Wand2, Bot } from 'lucide-react';
import { TO } from './utils/theme';
import { mockRequirement, mockCoreTests, mockAdditionalTests } from './data/mockData';
import { SidebarNav } from './components/Shell/SidebarNav';
import { CitationBadge } from './components/Shared/CitationBadge';
import { RequirementPanel } from './features/Requirement/RequirementPanel';
import { AIGeneratorPanel } from './features/Assessment/AIGeneratorPanel';
import { ReviewList } from './features/Review/ReviewList';
import { CoverageSummary } from './features/Review/CoverageSummary';
import { KaiPanel } from './features/Kai/KaiPanel';

const TEST_STATUS = { PENDING: 'pending', ACCEPTED: 'accepted', REJECTED: 'rejected', MODIFIED: 'modified', REGENERATING: 'regenerating' };

export default function App() {
  const [docs, setDocs] = useState([]);
  const [showKai, setShowKai] = useState(false);
  const [kaiP, setKaiP] = useState('');
  const [gen, setGen] = useState(false);
  const [genProg, setGenProg] = useState(0);
  const [hasGen, setHasGen] = useState(false);
  const [genMode, setGenMode] = useState('initial');
  const [depth, setDepth] = useState('quick');
  const [hlSegs, setHlSegs] = useState([]);
  const [assessmentStatus, setAssessmentStatus] = useState('analyzing');
  const [additionalContext, setAdditionalContext] = useState('');
  const [activeGenStage, setActiveGenStage] = useState('');

  // Simulate progressive assessment
  React.useEffect(() => {
    const timerA = setTimeout(() => setAssessmentStatus('callA_done'), 5000);
    const timerB = setTimeout(() => setAssessmentStatus('callB_done'), 10000);
    return () => { clearTimeout(timerA); clearTimeout(timerB); };
  }, []);

  const [clarifs, setClarifs] = useState([
    { id: 1, question: 'What Git hosting services should be supported?', suggestions: ['GitHub only', 'GitHub + GitLab', 'GitHub + GitLab + Bitbucket'], resolved: false, resolvedAnswer: null },
    { id: 2, question: 'Should script caching persist across sessions or be per-view?', suggestions: ['Per-view (always fetch)', 'Cache for 24h', 'Cache until next execution'], resolved: false, resolvedAnswer: null },
  ]);

  const [tcs, setTcs] = useState([]);
  const [sts, setSts] = useState({});
  const [review, setReview] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editF, setEditF] = useState({ name: '', steps: '' });
  const [saved, setSaved] = useState([]);
  const [canMore, setCanMore] = useState(false);

  const citHover = useCallback((ids) => { 
    const arr = Array.isArray(ids) ? ids : [ids]; 
    setHlSegs(arr); 
    const el = document.getElementById(`seg-${arr[0]}`); 
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
  }, []);
  const citLeave = useCallback(() => setHlSegs([]), []);

  const doGen = (mode = 'initial') => {
    const src = mode === 'additional' ? mockAdditionalTests : mockCoreTests;
    setGen(true); setGenProg(0); setGenMode(mode); setActiveGenStage('Extracting scenarios...');
    if (mode === 'initial') { setTcs([]); setSts({}); }

    // Sequential stage simulation before streaming starts
    setTimeout(() => { setActiveGenStage('Scoring quality...'); setGenProg(10); }, 1500);
    setTimeout(() => { setActiveGenStage('Generating test cases...'); setGenProg(30); }, 3000);

    setTimeout(() => {
      setActiveGenStage('');
      src.forEach((tc, i) => {
        setTimeout(() => {
          setTcs(p => [...p, { ...tc }]); 
          setSts(p => ({ ...p, [tc.id]: TEST_STATUS.PENDING })); 
          setGenProg(30 + ((i + 1) / src.length) * 70);
          if (i === src.length - 1) setTimeout(() => { setGen(false); setHasGen(true); setReview(true); setCanMore(mode === 'initial'); }, 300);
        }, 500 * (i + 1));
      });
    }, 4500);
  };

  const getStats = () => { 
    const safe = tcs.filter(t => t?.id); 
    return { 
      accepted: safe.filter(t => sts[t.id] === TEST_STATUS.ACCEPTED || sts[t.id] === TEST_STATUS.MODIFIED).length, 
      rejected: safe.filter(t => sts[t.id] === TEST_STATUS.REJECTED).length, 
      pending: safe.filter(t => !sts[t.id] || sts[t.id] === TEST_STATUS.PENDING || sts[t.id] === TEST_STATUS.REGENERATING).length, 
      total: safe.length 
    }; 
  };

  const handlers = {
    onAccept: (id) => {
      const tc = tcs.find(t => t.id === id);
      if (tc) {
        setSts(p => { const n = { ...p }; delete n[id]; return n; });
        setTcs(p => p.filter(t => t.id !== id));
        setSaved(p => [...p, { ...tc, __status: TEST_STATUS.ACCEPTED }]);
      }
    },
    onReject: (id) => setSts(p => ({ ...p, [id]: TEST_STATUS.REJECTED })),
    onAcceptAll: () => { 
      const toAccept = tcs.filter(t => t?.id && (!sts[t.id] || sts[t.id] === TEST_STATUS.PENDING));
      setTcs(p => p.filter(t => !toAccept.find(x => x.id === t.id)));
      setSaved(p => [...p, ...toAccept.map(tc => ({ ...tc, __status: TEST_STATUS.ACCEPTED }))]);
      const newSts = { ...sts };
      toAccept.forEach(t => delete newSts[t.id]);
      setSts(newSts);
    },
    onEdit: (t) => { if (!t?.id) return; setEditId(t.id); setEditF({ name: t.name || '', steps: (t.steps || []).join('\n') }); },
    onSaveEdit: () => { 
      if (!editId) return; 
      setTcs(p => p.map(t => t.id === editId ? { ...t, name: editF.name, steps: editF.steps.split('\n').filter(Boolean) } : t)); 
      setSts(p => ({ ...p, [editId]: TEST_STATUS.MODIFIED })); 
      setEditId(null); 
    },
    onCancelEdit: () => { setEditId(null); setEditF({ name: '', steps: '' }); },
    onRegenerate: (id, refinementContext = '') => { 
      setSts(p => ({ ...p, [id]: TEST_STATUS.REGENERATING })); 
      setTimeout(() => { 
        setTcs(p => p.map(t => t.id === id ? { ...t, name: t.name + (refinementContext ? ' (refined)' : ' (v2)') } : t)); 
        setSts(p => ({ ...p, [id]: TEST_STATUS.PENDING })); 
      }, 1500); 
    },
    onFeedback: (id, type) => setTcs(p => p.map(t => t.id === id ? { ...t, feedback: t.feedback === type ? null : type } : t)),
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: TO.pageBg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-11 bg-white border-b flex items-center justify-between px-4" style={{ borderColor: TO.cardBd }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: TO.textBody }}>TestOps - RA</span>
            <ChevronDown size={13} style={{ color: TO.textMuted }} />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setKaiP(''); setShowKai(true); }} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg flex items-center gap-1.5" style={{ backgroundColor: TO.aiAccent }}>
              <Sparkles size={13} />Ask Kai
            </button>
            <Bell size={16} style={{ color: TO.textSecondary }} />
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-[11px] font-medium text-indigo-700">VP</span>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb */}
        <div className="px-5 py-1.5 bg-white border-b flex items-center text-xs" style={{ borderColor: TO.cardBd, color: TO.textSecondary }}>
          Plans<ChevronRight size={11} className="mx-1" />
          <span className="font-medium" style={{ color: TO.textBody }}>{mockRequirement.id}</span>
        </div>
        
        {/* Page header */}
        <div className="bg-white border-b px-5 py-3" style={{ borderColor: TO.cardBd }}>
          <h1 className="text-base font-semibold" style={{ color: TO.textPrimary }}>{mockRequirement.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: TO.textSecondary }}>
            <span>Tester: {mockRequirement.tester}</span><span>•</span>
            <span>{saved.length || mockRequirement.testCases} Tests</span><span>•</span>
            <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#EFF6FF', color: TO.link }}>{mockRequirement.issueType}</span>
          </div>
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-white">
          <div className="flex h-full">
            {/* LEFT COLUMN: Requirement & Processing */}
            <div className={`flex-shrink-0 overflow-y-auto p-6 space-y-4 transition-all duration-300 ${gen || hasGen ? 'w-[400px] border-r border-gray-200' : 'w-full max-w-5xl mx-auto'}`}>
              <AIGeneratorPanel 
                assessmentStatus={assessmentStatus}
                clarifications={clarifs} 
                onResolve={(id, ans) => setClarifs(p => p.map(c => c.id === id ? { ...c, resolved: ans !== null, resolvedAnswer: ans } : c))}
                documents={docs} 
                onUpload={(d) => setDocs(p => { const e = p.find(x => x.id === d.id); return e ? p.map(x => x.id === d.id ? d : x) : [...p, d]; })} 
                onRemoveDoc={(id) => setDocs(p => p.filter(d => d.id !== id))}
                additionalContext={additionalContext}
                onContextChange={setAdditionalContext}
                onGenerate={doGen} 
                isGenerating={gen} 
                hasGenerated={hasGen} 
                depth={depth} 
                onDepthChange={setDepth}
                onAskKai={(p) => { setKaiP(p); setShowKai(true); }} 
              />
              <RequirementPanel 
                highlightedSegments={hlSegs} 
                onSegmentHover={(id) => setHlSegs([id])} 
                onSegmentLeave={() => setHlSegs([])} 
              />
            </div>
            
            {/* RIGHT COLUMN: Test Case List & Generation (Only visible during/after generation) */}
            {(gen || hasGen) && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col h-full relative" style={{ backgroundColor: TO.pageBg }}>
              
              {/* Active Generation State */}
              {gen && (
                <div className="rounded-lg border overflow-hidden flex-shrink-0 mb-3" style={{ borderColor: '#C4B5FD', backgroundColor: '#F5F3FF' }}>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wand2 size={14} className="animate-pulse" style={{ color: TO.aiAccent }} />
                      <span className="text-sm font-medium" style={{ color: '#5B21B6' }}>
                        {activeGenStage || (genMode === 'additional' ? 'Streaming additional tests...' : 'Streaming test cases...')}
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: TO.aiAccent }}>
                      {activeGenStage ? 'Initializing...' : `${tcs.length}/${genMode === 'additional' ? mockAdditionalTests.length : mockCoreTests.length}`}
                    </span>
                  </div>
                  <div className="h-1.5" style={{ backgroundColor: '#DDD6FE' }}>
                    <div className="h-full transition-all duration-300" style={{ width: `${genProg}%`, backgroundColor: TO.aiAccent }} />
                  </div>
                </div>
              )}

              {/* Unified Workspace */}
              {hasGen && (
                <div className="flex-1 min-h-0 flex flex-col">
                  {(saved.length > 0 || tcs.length > 0) && <CoverageSummary savedTests={[...saved]} canMore={canMore} onGenMore={() => doGen('additional')} onCitHover={citHover} onCitLeave={citLeave} />}
                  
                  {saved.length > 0 && (
                    <div className="bg-white rounded-lg border overflow-hidden mb-4 flex-shrink-0" style={{ borderColor: TO.cardBd }}>
                      <div className="px-4 py-2 border-b flex items-center justify-between" style={{ backgroundColor: '#FAFAFA', borderColor: TO.cardBd }}>
                        <h2 className="text-sm font-semibold" style={{ color: TO.textPrimary }}>Accepted Test Cases</h2>
                        <span className="text-xs" style={{ color: TO.textSecondary }}>{saved.length} items</span>
                      </div>
                      <div>
                        {saved.map((tc, i) => (
                          <div key={`saved-${tc.id}`} className="flex items-center gap-2.5 px-4 py-2.5 border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors" style={{ borderColor: '#F3F4F6' }}
                            onMouseEnter={() => citHover(tc.citations || [])} onMouseLeave={citLeave}>
                            <span className="text-[11px] w-4" style={{ color: TO.textMuted }}>{i + 1}</span>
                            <BookOpen size={13} style={{ color: TO.textMuted }} />
                            <span className="text-[11px] font-mono font-medium truncate w-20" style={{ color: TO.link }}>{tc.id}</span>
                            <span className="text-sm font-medium flex-1 truncate" style={{ color: TO.textBody }}>{tc.name}</span>
                            <div className="flex items-center gap-1.5 flex-shrink-0 border-l pl-3" style={{ borderColor: TO.cardBd }}>
                              <span className="text-xs text-gray-500 w-24 text-center pb-0.5">MANUAL</span>
                              <span className="text-xs text-green-600 font-medium w-24 text-center pb-0.5">DRAFT</span>
                              <div className="w-6 h-6 rounded flex items-center justify-center bg-purple-100 text-purple-700" title="AI Generated">
                                <Sparkles size={11} className="fill-current" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tcs.length > 0 && (
                    <div className="flex flex-col flex-1 min-h-0">
                      {saved.length > 0 && (
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1.5 shadow-sm"><Sparkles size={12} /> AI Generated Review</span>
                          <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
                        </div>
                      )}
                      <ReviewList 
                        tests={tcs} statuses={sts} 
                        editingId={editId} editForm={editF} setEditForm={setEditF} 
                        handlers={handlers} stats={getStats()} 
                        onCitHover={citHover} onCitLeave={citLeave} 
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Empty State is now handled by the full width left panel view */}
            </div>
            )}
          </div>
        </main>
      </div>

      <KaiPanel isOpen={showKai} onClose={() => { setShowKai(false); setKaiP(''); }} initialPrompt={kaiP} />
      
      {!showKai && (
        <button onClick={() => { setKaiP(''); setShowKai(true); }} className="fixed bottom-5 right-5 w-12 h-12 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center z-40 transform hover:-translate-y-1" style={{ backgroundColor: TO.aiAccent, boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)' }} title="Ask Kai">
          <Bot size={22} />
        </button>
      )}
    </div>
  );
}
