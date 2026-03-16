import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Bell, Sparkles, BookOpen, Wand2, Bot, Loader2 } from 'lucide-react';
import { TO } from './utils/theme';
import { mockRequirement, mockCoreTests, mockAdditionalTests, existingLinkedTests } from './data/mockData';
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
  
  // New UI states
  const [leftWidth, setLeftWidth] = useState(480);
  const isDragging = React.useRef(false);
  const [rightTab, setRightTab] = useState('drafts');

  const startDrag = useCallback((e) => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      let newWidth = e.clientX;
      if (newWidth < 400) newWidth = 400;
      if (newWidth > 800) newWidth = 800;
      setLeftWidth(newWidth);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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
    setGen(true); setGenProg(0); setGenMode(mode); setActiveGenStage('Reading Jira Ticket...');
    if (mode === 'initial') { setTcs([]); setSts({}); }

    // Sequential stage simulation before streaming starts
    setTimeout(() => { setActiveGenStage('Extracting Testable Behaviors...'); setGenProg(10); }, 1500);
    setTimeout(() => { setActiveGenStage('Mapping Edge Cases...'); setGenProg(20); }, 3000);
    setTimeout(() => { setActiveGenStage('Drafting Test Cases...'); setGenProg(30); }, 4500);

    setTimeout(() => {
      setActiveGenStage('');
      setRightTab('drafts');
      src.forEach((tc, i) => {
        setTimeout(() => {
          setTcs(p => [...p, { ...tc }]); 
          setSts(p => ({ ...p, [tc.id]: TEST_STATUS.PENDING })); 
          setGenProg(30 + ((i + 1) / src.length) * 70);
          if (i === src.length - 1) setTimeout(() => { setGen(false); setHasGen(true); setReview(true); setCanMore(mode === 'initial'); }, 300);
        }, 500 * (i + 1));
      });
    }, 6000);
  };

  // Compute score for Sticky Action Bar
  const resolvedCount = clarifs.filter(c => c.resolved).length;
  let baseScore = 62;
  if (assessmentStatus === 'callB_done') baseScore = 74;
  let activeScore = Math.min(baseScore + resolvedCount * 10 + (docs.length > 0 ? 10 : 0), 98);

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
    <div className="flex h-screen" style={{ width: '100vw', maxWidth: '100%', backgroundColor: TO.pageBg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
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
        <main className="flex-1 overflow-hidden bg-white w-full">
          <div className="flex h-full w-full">
            {/* LEFT COLUMN: Requirement Panels & AI Assessment */}
            <div className="flex-shrink-0 flex flex-col h-full border-r border-gray-200 bg-white z-10 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.1)] relative" style={{ width: leftWidth }}>
              <div className="p-4 flex-shrink-0 border-b border-gray-100">
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
              </div>
              <div className="flex-1 overflow-hidden p-4 min-h-0 bg-white">
                <RequirementPanel 
                  highlightedSegments={hlSegs} 
                  onSegmentHover={(id) => setHlSegs([id])} 
                  onSegmentLeave={() => setHlSegs([])} 
                  isAssessmentDone={assessmentStatus !== 'analyzing'}
                  hasGenerated={hasGen || tcs.length > 0}
                />
              </div>
              
              {/* Sticky Generate Action Bar */}
              <div className="p-4 border-t border-gray-200 bg-white flex flex-col gap-2 shadow-[0_-4px_6px_-4px_rgba(0,0,0,0.05)] z-20">
                {assessmentStatus === 'analyzing' ? (
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 justify-center mb-1">
                    <Loader2 size={12} className="animate-spin" /> AI is analyzing requirement for improvements...
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5 justify-center mb-1">
                    <span className="font-bold" style={{ color: activeScore >= 85 ? TO.passed : activeScore >= 70 ? TO.warning : '#F97316' }}>Quality Score: {activeScore}%</span> 
                    • 💡 {clarifs.length - resolvedCount} clarifications can improve this
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex rounded-md border overflow-hidden flex-shrink-0" style={{ borderColor: TO.cardBd }}>
                    {['quick', 'thorough'].map(d => (
                      <button key={d} onClick={() => setDepth(d)} className="px-2.5 py-1 text-[11px] font-medium transition-colors"
                        style={{ backgroundColor: depth === d ? TO.aiAccent : 'white', color: depth === d ? 'white' : TO.textSecondary }}>
                        {d === 'quick' ? '⚡ Quick' : '🔍 Thorough'}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => doGen('initial')} disabled={gen || hasGen}
                    className="flex-1 py-1.5 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{ backgroundColor: gen || hasGen ? TO.textMuted : TO.aiAccent }}>
                    {gen ? <><Loader2 size={15} className="animate-spin" />Generating...</> : <><Wand2 size={15} />Generate Test Cases</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Draggable Resizer */}
            <div 
              className="w-1 cursor-col-resize hover:bg-indigo-300 transition-colors z-20 flex-shrink-0"
              style={{ backgroundColor: isDragging.current ? '#818CF8' : 'transparent' }}
              onMouseDown={startDrag}
            />
            
            {/* RIGHT COLUMN: AI Generation & Test Lists */}
            <div className="flex-1 p-5 overflow-hidden flex flex-col bg-slate-50 relative">
              
              {/* Active Generation State / Thought Progress */}
              {gen && (
                <div className="rounded-lg border overflow-hidden flex-shrink-0 mb-4 shadow-sm" style={{ borderColor: '#C4B5FD', backgroundColor: '#F5F3FF' }}>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Wand2 size={15} className="animate-pulse" style={{ color: TO.aiAccent }} />
                      <span className="text-sm font-semibold" style={{ color: '#5B21B6' }}>
                        {activeGenStage || (genMode === 'additional' ? 'Drafting additional tests...' : 'Drafting test cases...')}
                      </span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: TO.aiAccent }}>
                      {activeGenStage ? 'Thinking...' : `${tcs.length}/${genMode === 'additional' ? mockAdditionalTests.length : mockCoreTests.length} Drafted`}
                    </span>
                  </div>
                  <div className="h-1.5" style={{ backgroundColor: '#DDD6FE' }}>
                    <div className="h-full transition-all duration-300 ease-out" style={{ width: `${genProg}%`, backgroundColor: TO.aiAccent }} />
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-0 flex flex-col">
                {/* Unified AI Workspace (Generated Drafts) */}
                {(saved.length > 0 || tcs.length > 0) && (
                  <div className="mb-4 flex-shrink-0">
                    <CoverageSummary savedTests={[...saved]} canMore={canMore} onGenMore={() => doGen('additional')} onCitHover={citHover} onCitLeave={citLeave} />
                  </div>
                )}

                {/* Conditional Tab Rendering */}
                {(!hasGen && tcs.length === 0 && saved.length === 0) ? (
                  /* Initial State: Only show Linked Tests */
                  <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-sm font-semibold text-slate-800">Linked Test Cases</h3>
                      <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{existingLinkedTests.length} items</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-2">
                        {existingLinkedTests.map((tc, idx) => (
                          <div key={tc.id} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow hover:border-slate-300 transition-all cursor-pointer">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <div className="flex items-center gap-2">
                                 <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{tc.id}</span>
                                 <span className="text-sm font-medium text-slate-800 line-clamp-1">{tc.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                               <span className="text-[10px] px-1.5 py-0.5 rounded border uppercase text-slate-500 bg-slate-50">{tc.type}</span>
                               <span className="text-[10px] text-slate-500">{tc.steps.length} steps</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Post-Generation State: Show Tabs */
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-2 mb-4 p-1 bg-slate-200/60 rounded-lg w-fit flex-shrink-0">
                      {tcs.length > 0 && (
                        <button onClick={() => setRightTab('drafts')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all shadow-sm ${rightTab === 'drafts' ? 'bg-white text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200 shadow-none'}`}>
                          AI Drafts For Review ({tcs.length})
                        </button>
                      )}
                      <button onClick={() => setRightTab('linked')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all shadow-sm ${rightTab === 'linked' || tcs.length === 0 ? 'bg-white text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200 shadow-none'}`}>
                        Linked Test Cases ({existingLinkedTests.length + saved.length})
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 pb-10">
                      {(rightTab === 'linked' || tcs.length === 0) && (
                        <div className="space-y-4">
                          {saved.length > 0 && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg shadow-sm overflow-hidden mt-1 mb-4">
                              <div className="px-5 py-3 border-b border-emerald-100 flex items-center justify-between bg-white">
                                  <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-semibold text-emerald-800">Ready to Push ({saved.length})</h2>
                                  </div>
                                  <div className="flex items-center border rounded-md shadow-sm overflow-hidden" style={{ borderColor: TO.cardBd }}>
                                    <div className="px-3 py-1.5 text-[11px] font-medium bg-white text-slate-600 border-r flex items-center gap-2 cursor-pointer hover:bg-slate-50">
                                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                      Save to: Katalon Cloud / eComm
                                      <ChevronDown size={12} className="text-slate-400" />
                                    </div>
                                    <button onClick={() => setSaved([])} className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                                      Save All to TestOps
                                    </button>
                                  </div>
                              </div>
                              <div className="divide-y divide-emerald-100/50 bg-white">
                                {saved.map((tc, i) => (
                                  <div key={`saved-${tc.id}`} className="grid grid-cols-[80px_1fr_120px_40px] items-center gap-3 px-5 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                                    onMouseEnter={() => citHover(tc.citations || [])} onMouseLeave={citLeave}>
                                    <div className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50/50 px-1.5 py-0.5 rounded w-fit border border-emerald-200/50">{tc.id}</div>
                                    <div className="text-sm font-medium text-slate-800 truncate pr-4">{tc.name}</div>
                                    <div className="flex items-center gap-1.5">
                                       <span className="text-[10px] px-1.5 py-0.5 rounded border uppercase text-slate-500 bg-slate-50">{tc.type}</span>
                                       <span className="text-[10px] text-slate-500">{tc.steps?.length || 0} steps</span>
                                    </div>
                                    <div className="flex justify-center">
                                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                                        <Sparkles size={10} className="fill-current" />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            {existingLinkedTests.map((tc, idx) => (
                              <div key={tc.id} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow hover:border-slate-300 transition-all cursor-pointer">
                                <div className="flex items-start justify-between gap-3 mb-1">
                                  <div className="flex items-center gap-2">
                                     <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{tc.id}</span>
                                     <span className="text-sm font-medium text-slate-800 line-clamp-1">{tc.name}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                   <span className="text-[10px] px-1.5 py-0.5 rounded border uppercase text-slate-500 bg-slate-50">{tc.type}</span>
                                   <span className="text-[10px] text-slate-500">{tc.steps.length} steps</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {rightTab === 'drafts' && tcs.length > 0 && (
                        <div className="flex flex-col gap-4">

                          {tcs.length > 0 && (
                            <ReviewList 
                              tests={tcs} statuses={sts} 
                              editingId={editId} editForm={editF} setEditForm={setEditF} 
                              handlers={handlers} stats={getStats()} 
                              onCitHover={citHover} onCitLeave={citLeave} 
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
