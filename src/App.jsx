import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Bell, Sparkles, Wand2, Loader2, FolderOpen, Check, TestTube2, Eye, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { TO } from './utils/theme';
import { mockRequirement, mockLowQualityRequirement, mockRequirementText, mockLowQualityText, mockCoreTests, mockAdditionalTests, existingLinkedTests, mockClarifications } from './data/mockData';
import { SidebarNav } from './components/Shell/SidebarNav';
import { RequirementPanel } from './features/Requirement/RequirementPanel';
import { AIGeneratorPanel } from './features/Assessment/AIGeneratorPanel';
import { GenerationConfig } from './features/Assessment/GenerationConfig';
import { ReviewList } from './features/Review/ReviewList';

const TEST_STATUS = { PENDING: 'pending', ACCEPTED: 'accepted', REJECTED: 'rejected', MODIFIED: 'modified', REGENERATING: 'regenerating' };

export default function App() {
  // Core state
  const [gen, setGen] = useState(false);
  const [genProg, setGenProg] = useState(0);
  const [hasGen, setHasGen] = useState(false);
  const [tcs, setTcs] = useState([]);
  const [sts, setSts] = useState({});
  const [editId, setEditId] = useState(null);
  const [editF, setEditF] = useState({ name: '', steps: '' });
  const [highlightedParagraphs, setHighlightedParagraphs] = useState([]);
  const [activeGenStage, setActiveGenStage] = useState('');
  const [assessmentStatus, setAssessmentStatus] = useState('analyzing');
  const [saveLocation, setSaveLocation] = useState('Katalon Cloud');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [rightTab, setRightTab] = useState('linked');
  const [acceptedTests, setAcceptedTests] = useState([]);
  const [requirementScore, setRequirementScore] = useState(0);
  const [useDemo, setUseDemo] = useState(false); // toggle low-quality requirement

  // Optional context
  const [docs, setDocs] = useState([]);
  const [additionalContext, setAdditionalContext] = useState('');
  const [clarifs, setClarifs] = useState(mockClarifications.map(c => ({ ...c, resolved: false, resolvedAnswer: null })));

  // Simulate assessment analysis completing
  React.useEffect(() => {
    const timer = setTimeout(() => setAssessmentStatus('done'), 30000);
    return () => clearTimeout(timer);
  }, []);

  // Active requirement data
  const activeReq = useDemo ? mockLowQualityRequirement : mockRequirement;
  const activeText = useDemo ? mockLowQualityText : mockRequirementText;

  // Score gate logic — context can relax a block to a warning
  const hasContext = additionalContext.length > 50 || docs.length > 0;
  const rawBlocked = requirementScore < 30;
  const isBlocked = rawBlocked && !hasContext; // context relaxes block → warning
  const isWarning = (requirementScore >= 30 && requirementScore < 50) || (rawBlocked && hasContext);
  const canGenerate = !gen && !hasGen && !isBlocked;

  // Resizable left panel
  const [leftWidth, setLeftWidth] = useState(500);
  const isDragging = React.useRef(false);

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      let w = e.clientX;
      if (w < 380) w = 380;
      if (w > 750) w = 750;
      setLeftWidth(w);
    };
    const handleMouseUp = () => { isDragging.current = false; document.body.style.cursor = 'default'; };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, []);

  // Highlight handler for test card hover → paragraph highlight
  const onTestHover = useCallback((paragraphs) => setHighlightedParagraphs(paragraphs || []), []);
  const onTestLeave = useCallback(() => setHighlightedParagraphs([]), []);

  // Generate test cases — streaming simulation
  const doGen = () => {
    const src = mockCoreTests;
    setGen(true); setGenProg(0); setActiveGenStage('Reading requirement...'); setRightTab('drafts');

    setTimeout(() => { setActiveGenStage('Analyzing scenarios...'); setGenProg(15); }, 1500);
    setTimeout(() => { setActiveGenStage('Generating tests...'); setGenProg(30); }, 3000);

    setTimeout(() => {
      setActiveGenStage('');
      src.forEach((tc, i) => {
        setTimeout(() => {
          setTcs(p => [...p, { ...tc }]);
          setSts(p => ({ ...p, [tc.id]: TEST_STATUS.PENDING }));
          setGenProg(30 + ((i + 1) / src.length) * 70);
          if (i === src.length - 1) setTimeout(() => { setGen(false); setHasGen(true); }, 300);
        }, 500 * (i + 1));
      });
    }, 4500);
  };

  // Stats
  const getStats = () => {
    const safe = tcs.filter(t => t?.id);
    return {
      accepted: safe.filter(t => sts[t.id] === TEST_STATUS.ACCEPTED || sts[t.id] === TEST_STATUS.MODIFIED).length,
      rejected: safe.filter(t => sts[t.id] === TEST_STATUS.REJECTED).length,
      pending: safe.filter(t => !sts[t.id] || sts[t.id] === TEST_STATUS.PENDING || sts[t.id] === TEST_STATUS.REGENERATING).length,
      total: safe.length
    };
  };

  // Handlers
  const handlers = {
    onAccept: (id) => {
      const tc = tcs.find(t => t.id === id);
      if (tc) {
        setSts(p => { const n = { ...p }; delete n[id]; return n; });
        setTcs(p => p.filter(t => t.id !== id));
        setAcceptedTests(p => [...p, { ...tc, __savedTo: saveLocation }]);
      }
    },
    onReject: (id) => setSts(p => ({ ...p, [id]: TEST_STATUS.REJECTED })),
    onAcceptAll: () => {
      const toAccept = tcs.filter(t => t?.id && (!sts[t.id] || sts[t.id] === TEST_STATUS.PENDING));
      setTcs(p => p.filter(t => !toAccept.find(x => x.id === t.id)));
      setAcceptedTests(p => [...p, ...toAccept.map(tc => ({ ...tc, __savedTo: saveLocation }))]);
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
            <Bell size={16} style={{ color: TO.textSecondary }} />
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-[11px] font-medium text-indigo-700">VP</span>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="px-5 py-1.5 bg-white border-b flex items-center text-xs" style={{ borderColor: TO.cardBd, color: TO.textSecondary }}>
          Plans<ChevronRight size={11} className="mx-1" />
          <span className="font-medium" style={{ color: TO.textBody }}>{activeReq.id}</span>
          <button
            onClick={() => { setUseDemo(!useDemo); setHasGen(false); setTcs([]); setSts({}); setAcceptedTests([]); }}
            className="ml-auto flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md border hover:bg-slate-50 transition-colors"
            style={{ borderColor: '#E5E7EB', color: TO.textSecondary }}
          >
            <ArrowLeftRight size={9} />
            {useDemo ? 'Switch to detailed requirement' : 'Demo: low-quality requirement'}
          </button>
        </div>

        {/* Page header */}
        <div className="bg-white border-b px-5 py-3" style={{ borderColor: TO.cardBd }}>
          <h1 className="text-base font-semibold" style={{ color: TO.textPrimary }}>{activeReq.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: TO.textSecondary }}>
            <span>Tester: {activeReq.tester}</span><span>•</span>
            <span>{existingLinkedTests.length + acceptedTests.length} Tests</span><span>•</span>
            <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#EFF6FF', color: TO.link }}>{activeReq.issueType}</span>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-white w-full">
          <div className="flex h-full w-full">
            {/* LEFT: Requirement + Context */}
            <div className="flex-shrink-0 flex flex-col h-full border-r border-gray-200 bg-white relative" style={{ width: leftWidth }}>
              {/* Optional readiness hint + context */}
              <div className="px-3 py-2 flex-shrink-0 border-b border-gray-100">
                <AIGeneratorPanel
                  requirementText={activeText}
                  assessmentStatus={assessmentStatus}
                  clarifications={useDemo ? [] : clarifs}
                  onResolve={(id, ans) => setClarifs(p => p.map(c => c.id === id ? { ...c, resolved: ans !== null, resolvedAnswer: ans } : c))}
                  onScoreChange={setRequirementScore}
                />
              </div>

              {/* Requirement text */}
              <div className="flex-1 overflow-hidden min-h-0 bg-white">
                <RequirementPanel requirementText={activeText} highlightedParagraphs={highlightedParagraphs} />
              </div>

              {/* Sticky Generate Button — AI gradient styling */}
              <div className="border-t border-gray-200 bg-white flex-shrink-0 shadow-[0_-2px_6px_-2px_rgba(0,0,0,0.05)]">
                {/* Generation Options — config for the AI */}
                <GenerationConfig
                  additionalContext={additionalContext}
                  onContextChange={setAdditionalContext}
                  documents={docs}
                  onUpload={(d) => setDocs(p => [...p, d])}
                  onRemoveDoc={(id) => setDocs(p => p.filter(d => d.id !== id))}
                />

                {/* Score gate warning */}
                {isBlocked && (
                  <div className="mx-3 mb-2 px-2.5 py-2 rounded-lg flex items-start gap-2 text-[11px]" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <AlertTriangle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-red-700">Requirement too vague for AI generation.</span>
                      <span className="text-red-600"> Add user story structure, acceptance criteria, or scenarios. You can also add context below to unlock generation.</span>
                    </div>
                  </div>
                )}
                {isWarning && !gen && !hasGen && (
                  <div className="mx-3 mb-2 px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-[10px]" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <AlertTriangle size={10} className="text-amber-400 flex-shrink-0" />
                    <span className="text-amber-700">
                      {rawBlocked && hasContext
                        ? 'Requirement quality is low, but your added context may compensate. Proceed with caution.'
                        : 'Low requirement quality — generated tests may be incomplete or vague.'}
                    </span>
                  </div>
                )}

                <div className="px-3 pb-3">
                  <button
                    onClick={doGen}
                    disabled={!canGenerate}
                    className="w-full py-3 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-40 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: !canGenerate
                        ? (isBlocked ? '#F87171' : '#9CA3AF')
                        : isWarning
                          ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                          : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)',
                      boxShadow: !canGenerate ? 'none'
                        : isWarning ? '0 4px 14px rgba(245, 158, 11, 0.35)'
                        : '0 4px 14px rgba(124, 58, 237, 0.35)',
                      cursor: isBlocked ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {gen ? (
                      <><Loader2 size={16} className="animate-spin" />Generating...</>
                    ) : hasGen ? (
                      <><Sparkles size={16} />Tests Generated</>
                    ) : isBlocked ? (
                      <><AlertTriangle size={16} />Requirement Too Vague</>
                    ) : (
                      <><Wand2 size={16} />Generate Test Cases</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Resizer */}
            <div
              className="w-1 cursor-col-resize hover:bg-indigo-300 transition-colors flex-shrink-0"
              style={{ backgroundColor: isDragging.current ? '#818CF8' : 'transparent' }}
              onMouseDown={() => { isDragging.current = true; document.body.style.cursor = 'col-resize'; }}
            />

            {/* RIGHT: Test Cases — Tabbed */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">

              {/* Tab Bar */}
              <div className="flex items-center border-b bg-white px-4 flex-shrink-0" style={{ borderColor: TO.cardBd }}>
                <button
                  onClick={() => setRightTab('linked')}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                    rightTab === 'linked' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <TestTube2 size={13} />
                  Linked Test Cases
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    rightTab === 'linked' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  }`}>{existingLinkedTests.length + acceptedTests.length}</span>
                </button>
                {(gen || hasGen) && (
                  <button
                    onClick={() => setRightTab('drafts')}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      rightTab === 'drafts' ? 'border-violet-500 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Eye size={13} />
                    AI Drafts for Review
                    {tcs.filter(t => !sts[t.id] || sts[t.id] === TEST_STATUS.PENDING).length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        rightTab === 'drafts' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'
                      }`}>{tcs.filter(t => !sts[t.id] || sts[t.id] === TEST_STATUS.PENDING).length}</span>
                    )}
                  </button>
                )}

                {/* Folder location chooser — always visible in tab bar */}
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="relative">
                    <button
                      onClick={() => setShowLocationPicker(!showLocationPicker)}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md border bg-white hover:bg-slate-50 transition-colors"
                      style={{ borderColor: '#E5E7EB', color: TO.textSecondary }}
                    >
                      <FolderOpen size={10} className="text-slate-400" />
                      {saveLocation}
                      <ChevronDown size={9} className="text-slate-400" />
                    </button>
                    {showLocationPicker && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border z-50 py-1" style={{ borderColor: TO.cardBd }}>
                        {['Katalon Cloud', 'Git Repository', 'Local Storage', 'Custom Location...'].map(loc => (
                          <button key={loc}
                            onClick={() => { setSaveLocation(loc); setShowLocationPicker(false); }}
                            className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-indigo-50 transition-colors flex items-center gap-2 ${saveLocation === loc ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'}`}
                          >
                            {saveLocation === loc && <Check size={11} className="text-indigo-600" />}
                            <span className={saveLocation === loc ? '' : 'ml-4'}>{loc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              {rightTab === 'drafts' && (gen || hasGen) ? (
                <div className="flex-1 overflow-hidden p-4 min-h-0 flex flex-col">
                  {/* Generation Progress — inside drafts tab */}
                  {gen && (
                    <div className="rounded-lg overflow-hidden flex-shrink-0 shadow-sm mb-3"
                      style={{ backgroundColor: '#FAFBFC', border: '1px solid #E5E7EB' }}>
                      <div className="px-3 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: '#F3F0FF' }}>
                            <Wand2 size={11} className="animate-pulse text-violet-500" />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {activeGenStage || 'Generating test cases...'}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-violet-600">
                          {tcs.length}/{mockCoreTests.length}
                        </span>
                      </div>
                      <div className="h-1 mx-3 mb-2 rounded-full" style={{ backgroundColor: '#F1F5F9' }}>
                        <div className="h-full transition-all duration-300 ease-out rounded-full" style={{ width: `${genProg}%`, backgroundColor: '#8B5CF6' }} />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden min-h-0">
                    <ReviewList
                      tests={tcs} statuses={sts}
                      editingId={editId} editForm={editF} setEditForm={setEditF}
                      handlers={handlers} stats={getStats()}
                      onHover={onTestHover} onLeave={onTestLeave}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  {/* AI-accepted tests */}
                  {acceptedTests.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-[11px] uppercase font-semibold text-emerald-600 tracking-wide mb-2 flex items-center gap-1.5">
                        <Sparkles size={11} />AI Generated ({acceptedTests.length})
                      </h4>
                      <div className="space-y-1.5">
                        {acceptedTests.map(tc => (
                          <div key={tc.id}
                            className="bg-white border border-emerald-100 rounded-lg p-2.5 hover:shadow-sm transition-all cursor-pointer"
                            onMouseEnter={() => onTestHover(tc.paragraphs || [])}
                            onMouseLeave={onTestLeave}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700">{tc.id}</span>
                              <span className="text-[13px] font-medium text-slate-800 flex-1">{tc.name}</span>
                              <span className="text-[9px] text-slate-400">→ {tc.__savedTo}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing linked tests */}
                  <div>
                    <h4 className="text-[11px] uppercase font-semibold text-slate-500 tracking-wide mb-2">Existing ({existingLinkedTests.length})</h4>
                    <div className="space-y-1.5">
                      {existingLinkedTests.map(tc => (
                        <div key={tc.id} className="bg-white border rounded-lg p-2.5 hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{tc.id}</span>
                            <span className="text-[13px] font-medium text-slate-800 flex-1">{tc.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded border uppercase text-slate-400 bg-slate-50">{tc.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Empty state */}
                  {!hasGen && acceptedTests.length === 0 && (
                    <div className="mt-8 text-center">
                      <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                        <Wand2 size={20} className="text-indigo-400" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Generate AI test cases</p>
                      <p className="text-xs text-slate-400 mt-1">Click the button on the left to get started</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
