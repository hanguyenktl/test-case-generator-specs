import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight, ArrowUpDown, Check, CheckCircle, ChevronDown, ChevronRight, ExternalLink, File, FileDown, FlaskConical, FolderOpen, Link2, Loader2, Play, RotateCcw, ShieldCheck, Sparkles, Tag, ThumbsDown, ThumbsUp, Users, X } from 'lucide-react';
import { T } from '../../utils/design-system';
import Layout from '../../components/shell/Layout';
import { Toast, Badge, PriBadge, ConfBadge, IBtn } from '../../components/shared';

import { MOCK_FOLDERS, PIPELINE_STEPS, CLARS, FEATURE_GROUPS, ALL_CASES, EXISTING_TCS, GEN_MORE_OPTS } from './data/mockData';
import { ReqDetailPage, TestCaseListPage } from './components/EntryPages';
import { DemoToggle, PipelineBar, InputCollapsed, InputExpanded, ClarCard, DetailPanel } from './components/GenerationWorkspace';
import { PostSaveView } from './components/PostSaveView';

/* ═══════════════════════════════════════════════════════════════
   MAIN APP — Full flow with entry pages
   ═══════════════════════════════════════════════════════════════ */
export default function AITestCaseGenerationPrototype() {
  // Demo control
  const [entry, setEntry] = useState("j1"); // "j1" | "j2"

  // Flow state: "entry" | "workspace-idle" | "workspace-gen" | "workspace-done" | "saved"
  const [phase, setPhase] = useState("entry");

  // Input state
  const [inputExpanded, setInputExpanded] = useState(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  // Generation state
  const [pipeStep, setPipeStep] = useState(0);
  const [clars, setClars] = useState(CLARS.map(c => ({ ...c })));
  const [cases, setCases] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [streamCount, setStreamCount] = useState(0);

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("review"); // "review" | "accepted" | "rejected" | "existing"
  const [showGenMore, setShowGenMore] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const flash = m => { setToast({ show: true, msg: m }); setTimeout(() => setToast({ show: false, msg: "" }), 2500); };
  const resolveC = (id, val) => setClars(p => p.map(c => c.id === id ? { ...c, resolved: val } : c));

  const isJ1 = entry === "j1";

  // Simulate generation pipeline
  useEffect(() => {
    if (phase === "workspace-gen") {
      if (pipeStep < PIPELINE_STEPS.length) {
        const timer = setTimeout(() => {
          if (pipeStep === 2) {
            // Wait for clarifications to be resolved
            const allRes = clars.every(c => c.resolved !== null);
            if (allRes) setPipeStep(3);
          } else {
            setPipeStep(p => p + 1);
          }
        }, pipeStep === 2 ? 100 : pipeStep === 0 ? 1500 : 2500);
        return () => clearTimeout(timer);
      } else {
        // Start streaming cases
        const timer = setInterval(() => {
          setStreamCount(p => {
            if (p >= ALL_CASES.length) {
              clearInterval(timer);
              setPhase("workspace-done");
              setCases(ALL_CASES.map(c => ({ ...c, selected: true })));
              if (ALL_CASES.length > 0) setSelectedId(ALL_CASES[0].id);
              flash("Generation complete");
              return p;
            }
            return p + 1;
          });
        }, 800);
        return () => clearInterval(timer);
      }
    }
  }, [phase, pipeStep, clars]);

  // Sync streamed cases
  useEffect(() => {
    if (phase === "workspace-gen" && streamCount > 0) {
      setCases(ALL_CASES.slice(0, streamCount).map(c => ({ ...c, selected: true })));
    }
  }, [streamCount, phase]);

  const handleGenerate = () => {
    setPhase("workspace-gen");
    setPipeStep(1);
    setStreamCount(0);
    setCases([]);
    setAccepted([]);
    setRejected([]);
    setTab("review");
    setSelectedId(null);
    setClars(CLARS.map(c => ({ ...c, resolved: null })));
    if (!text && files.length === 0) {
      setText("The system shall support login with email and password. Session tokens expire after 30 minutes. Account locks after 5 failures.");
      if (isJ1) setFiles([{ name: "auth-flow-spec.pdf", size: "1.2 MB" }]);
    }
  };

  const handleSave = () => {
    setPhase("saved");
  };

  const toggleSelect = id => setCases(p => p.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  
  const handleAccept = (id) => {
    const tc = cases.find(c => c.id === id);
    if (!tc) return;
    setAccepted(prev => [...prev, tc]);
    setCases(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    flash("Test case accepted");
  };

  const handleReject = (id) => {
    const tc = cases.find(c => c.id === id);
    if (!tc) return;
    setRejected(prev => [...prev, tc]);
    setCases(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    flash("Test case rejected");
  };

  const handleAcceptGroup = (area) => {
    const areaCases = cases.filter(c => c.area === area);
    setAccepted(prev => [...prev, ...areaCases]);
    setCases(prev => prev.filter(c => c.area !== area));
    flash(`Accepted all ${areaCases.length} cases in ${area}`);
  };

  const toggleSelectAll = () => {
    const allOn = cases.every(c => c.selected);
    setCases(p => p.map(c => ({ ...c, selected: !allOn })));
  };

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------
  const renderBread = () => {
    let p = ["Project", "Test Design"];
    if (phase === "entry") {
      p.push(isJ1 ? "Requirements" : "Test Cases");
      if (isJ1) p.push("TO-8526");
    } else if (phase.startsWith("workspace")) {
      p.push(isJ1 ? "Requirements" : "Test Cases");
      if (isJ1) p.push("TO-8526");
      p.push("Generate Test Cases");
    } else {
      p.push("Test Cases");
    }
    return p;
  };

  // Group cases by area
  const groupedCases = cases.reduce((acc, c) => {
    if (!acc[c.area]) acc[c.area] = [];
    acc[c.area].push(c);
    return acc;
  }, {});

  // Helper to group cases by area
  const groupByArea = (data) => {
    return data.reduce((acc, c) => {
      if (!acc[c.area]) acc[c.area] = [];
      acc[c.area].push(c);
      return acc;
    }, {});
  };

  const selectedTc = tab === "review" ? cases.find(c => c.id === selectedId) : (tab === "accepted" ? accepted.find(c => c.id === selectedId) : rejected.find(c => c.id === selectedId));
  const selCount = cases.filter(c => c.selected).length;
  const isGen = phase === "workspace-gen";
  const isDone = phase === "workspace-done";
  const waitingClar = isGen && pipeStep === 2 && !clars.every(c => c.resolved !== null);

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  return (
    <Layout
      breadcrumbs={renderBread()}
      customTopBarContent={<DemoToggle entry={entry} setEntry={e => { setEntry(e); setPhase("entry"); }} />}
    >
      <div className="flex-1 flex flex-col overflow-hidden bg-[T.bg] relative">
        <Toast show={toast.show} msg={toast.msg} />

        {/* =================================================================
            PHASE 1: ENTRY PAGES
            ================================================================= */}
        {phase === "entry" && (
          isJ1 ? <ReqDetailPage onGenerate={() => setPhase("workspace-idle")} />
               : <TestCaseListPage onCreateWithAI={() => setPhase("workspace-idle")} />
        )}

        {/* =================================================================
            PHASE 2 & 3: WORKSPACE (Idle / Generating / Done)
            ================================================================= */}
        {phase.startsWith("workspace") && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Area: Input Configuration */}
            {inputExpanded || phase === "workspace-idle" ? (
              <InputExpanded entry={entry} onCollapse={() => setInputExpanded(false)} onGenerate={handleGenerate} text={text} setText={setText} files={files} setFiles={setFiles} />
            ) : (
              <InputCollapsed entry={entry} onExpand={() => setInputExpanded(true)} onGenerate={handleGenerate} generating={isGen} />
            )}

            {/* Pipeline progress bar */}
            {(isGen || isDone) && <PipelineBar step={pipeStep} done={isDone} />}

            {/* Main Workspace Area */}
            {phase === "workspace-idle" ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center" style={{ maxWidth: 400 }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: T.accentLight }}>
                    <Sparkles size={20} style={{ color: T.purple }} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: T.t1, marginBottom: 8 }}>Ready to generate</h3>
                  <p style={{ fontSize: 12, color: T.t3, lineHeight: 1.6, marginBottom: 16 }}>
                    Describe your feature or requirement above. Kai will analyze it, ask for clarifications if needed, and generate comprehensive test cases.
                  </p>
                  <button onClick={handleGenerate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors"
                    style={{ background: T.brand, color: "#fff", fontSize: 13, fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = T.accent}
                    onMouseLeave={e => e.currentTarget.style.background = T.brand}>
                    <Sparkles size={14} /> Generate Test Cases
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden">

                {/* LEFT: Input Context Panel */}
                <div className="overflow-y-auto shrink-0" style={{ width: 260, borderRight: `1px solid ${T.bd}`, background: T.card }}>
                  <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6 }}>Input Context</span>
                  </div>
                  <div className="px-3 py-2.5">
                    {/* Req text preview */}
                    <div className="rounded-md mb-2 p-2" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
                      <div style={{ fontSize: 11, color: T.t2, lineHeight: 1.5, maxHeight: 60, overflow: "hidden" }}>
                        {text || "The system shall support login with email and password. Session tokens expire after 30 minutes..."}
                      </div>
                      <button className="mt-1 flex items-center gap-1" style={{ fontSize: 10, color: T.brand }}>
                        <ChevronDown size={9} /> Show full text
                      </button>
                    </div>
                    {/* File */}
                    {(files.length > 0 || isJ1) && (
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md mb-2" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
                        <File size={10} style={{ color: T.brand }} />
                        <span style={{ fontSize: 10, color: T.t2, fontWeight: 500 }}>{files[0]?.name || "auth-flow-spec.pdf"}</span>
                        <span style={{ fontSize: 9, color: T.t4 }}>{files[0]?.size || "1.2 MB"}</span>
                      </div>
                    )}
                    {/* Req link (J1 only) */}
                    {isJ1 && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md mb-3" style={{ background: T.accentLight, border: `1px solid ${T.accentBorder}` }}>
                        <Link2 size={10} style={{ color: T.brand }} />
                        <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>TO-8526</span>
                      </div>
                    )}
                    {/* Clarifications */}
                    {(pipeStep >= 2 || isDone) && clars.some(c => c.resolved === null) && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle size={10} style={{ color: T.amber }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: T.t3, textTransform: "uppercase", letterSpacing: 0.4 }}>Clarifications</span>
                          </div>
                          <button onClick={() => setPipeStep(3)} style={{ fontSize: 10, color: T.t4, fontWeight: 500 }} className="hover:underline">Skip</button>
                        </div>
                        <div style={{ fontSize: 10, color: T.t4, marginBottom: 6, lineHeight: 1.4 }}>Answers improve next round</div>
                        {clars.filter(c => c.resolved === null).map(c => <ClarCard key={c.id} c={c} onResolve={resolveC} />)}
                        <button onClick={() => setPipeStep(3)} className="w-full mt-2 py-1.5 rounded border border-dashed text-[10px] font-medium transition-colors"
                          style={{ borderColor: T.bd, color: T.t3 }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.brand; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.color = T.t3; }}>
                          Skip and Generate
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Ask Kai */}
                  <div className="px-3 py-2" style={{ borderTop: `1px solid ${T.bdLight}` }}>
                    <button className="flex items-center gap-1.5 w-full justify-center py-1.5 rounded-md transition-colors"
                      style={{ fontSize: 10, color: T.brand, border: `1px solid ${T.accentBorder}` }}
                      onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <Sparkles size={10} /> Open in Kai <ExternalLink size={8} />
                    </button>
                  </div>
                </div>

                {/* MIDDLE: Results List */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white" style={{ minWidth: 0 }}>
                  {/* List header/tabs */}
                  <div className="flex items-center justify-between px-4 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
                    <div className="flex items-center gap-0">
                      {[
                        { id: "review", label: `Review (${cases.length})` },
                        { id: "accepted", label: `Accepted (${accepted.length})` },
                        { id: "rejected", label: `Rejected (${rejected.length})` },
                        { id: "existing", label: `Existing TCs (${EXISTING_TCS.length})` }
                      ].map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setSelectedId(null); }}
                          className="px-3 py-3.5 transition-colors relative"
                          style={{ fontSize: 11, fontWeight: tab === t.id ? 600 : 500, color: tab === t.id ? T.brand : T.t3 }}>
                          {t.label}
                          {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: T.brand }} />}
                        </button>
                      ))}
                    </div>
                    {isDone && (
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: 11, color: T.t3 }}>{tab === "accepted" ? accepted.length : (tab === "review" ? cases.filter(c => c.selected).length : 0)} selected</span>
                        <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors"
                          style={{ background: (tab === "accepted" && accepted.length > 0) || (tab === "review" && cases.some(c => c.selected)) ? T.brand : T.muted, color: "#fff", fontSize: 11, fontWeight: 500 }}>
                          Save {tab === "accepted" ? accepted.length : "Selected"} Test Cases
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Table Header (only if tab is review/accepted/rejected and no detail open) */}
                  {!selectedId && tab !== "existing" && (
                    <div className="flex items-center px-4 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${T.bd}`, background: T.bg }}>
                      <div style={{ flex: 1, fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Test Case</div>
                      <div style={{ width: 80, fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>Confidence</div>
                      <div style={{ width: 60, fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>Steps</div>
                      <div style={{ width: 60, fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>Priority</div>
                      <div style={{ width: 60, fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>Actions</div>
                    </div>
                  )}

                  {/* Case List */}
                  <div className="flex-1 overflow-y-auto bg-white p-0">
                    {tab === "existing" ? (
                      <div className="p-4 bg-[T.bg] h-full">
                        <div className="rounded-lg bg-white overflow-hidden" style={{ border: `1px solid ${T.bdLight}` }}>
                          {EXISTING_TCS.map((tc, i) => (
                            <div key={tc.id} className="px-3 py-2.5 flex items-center gap-3" style={{ borderBottom: i < EXISTING_TCS.length - 1 ? `1px solid ${T.bdLight}` : "none" }}>
                              <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: T.t3 }}>{tc.id}</span>
                              <span style={{ fontSize: 11, color: T.t1, flex: 1 }}>{tc.name}</span>
                              <Badge color={tc.type === "MANUAL" ? T.purple : T.brand} bg={tc.type === "MANUAL" ? "rgba(124,58,237,0.06)" : T.accentLight}>{tc.type === "MANUAL" ? "Manual" : "Auto"}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[T.bg] min-h-full">
                        {(tab === "review" ? cases : (tab === "accepted" ? accepted : (tab === "rejected" ? rejected : []))).length === 0 && (
                          <div className="p-20 text-center flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                              <FlaskConical size={24} className="text-gray-200" />
                            </div>
                            <p style={{ fontSize: 12, color: T.t4 }}>No test cases in this view</p>
                          </div>
                        )}
                        {Object.entries(groupByArea(tab === "review" ? cases : (tab === "accepted" ? accepted : (tab === "rejected" ? rejected : [])))).map(([area, areaCases]) => (
                          <div key={area} className="mb-0">
                            {/* Feature area group header */}
                            <div className="flex items-center justify-between px-4 py-2" style={{ background: "rgba(94,106,210,0.04)", borderBottom: `1px solid ${T.bdLight}` }}>
                              <div className="flex items-center gap-2">
                                <FolderOpen size={12} style={{ color: T.brand }} strokeWidth={1.5} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: T.t1, textTransform: "uppercase", letterSpacing: 0.4 }}>{area}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ color: T.t4, background: T.muted }}>{areaCases.length}</span>
                              </div>
                              {!selectedId && tab === "review" && (
                                <button onClick={() => handleAcceptGroup(area)} className="flex items-center gap-1 px-2 py-1 rounded transition-colors text-emerald-600 hover:bg-emerald-50"
                                  style={{ fontSize: 10, fontWeight: 600 }}>
                                  <Check size={12} strokeWidth={2.5} /> Accept group
                                </button>
                              )}
                            </div>

                            <div className="bg-white">
                              {areaCases.map((tc, i) => {
                                const sel = tc.selected;
                                const isAct = selectedId === tc.id;
                                const confColor = tc.confidence === "high" ? T.green : tc.confidence === "medium" ? T.amber : T.red;
                                return (
                                  <div key={tc.id} className="group relative flex transition-colors cursor-pointer border-b"
                                    style={{
                                      borderColor: T.bdLight,
                                      background: isAct ? T.accentLight : "transparent",
                                    }}
                                    onClick={() => setSelectedId(tc.id)}>
                                    
                                    {selectedId ? (
                                      /* Compact row when detail panel open */
                                      <div className="flex items-center gap-3 px-3 py-2.5 w-full min-w-0">
                                        <ConfBadge level={tc.confidence} />
                                        <span className="truncate" style={{ fontSize: 11, color: T.t1, fontWeight: isAct ? 600 : 500 }}>{tc.name}</span>
                                      </div>
                                    ) : (
                                      /* Full table row */
                                      <>
                                        {/* Selection / Status indicator */}
                                        <div className="w-10 flex justify-center items-center py-3 shrink-0" onClick={e => { e.stopPropagation(); toggleSelect(tc.id); }}>
                                          <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                                            style={{ borderColor: sel ? T.brand : T.t4, background: sel ? T.brand : "transparent" }}>
                                            {sel && <Check size={12} style={{ color: "#fff", strokeWidth: 3 }} />}
                                          </div>
                                        </div>
                                        {/* Name & Metadata */}
                                        <div className="flex-1 py-3 pr-3 min-w-0">
                                          <div style={{ fontSize: 12, fontWeight: 600, color: T.t1, marginBottom: 2 }}>{tc.name}</div>
                                          <div style={{ fontSize: 10, color: T.t4, marginBottom: 4 }}>Chain: {tc.chain}</div>
                                          <div className="flex flex-wrap items-center gap-2">
                                            {tc.tags?.map(t => (
                                              <span key={t} className="px-1.5 py-0.5 rounded border" style={{ fontSize: 9, color: T.t3, background: T.bg, borderColor: T.bdLight }}>{t}</span>
                                            ))}
                                          </div>
                                        </div>
                                        {/* Confidence */}
                                        <div className="w-20 flex flex-col items-center justify-center shrink-0 border-l" style={{ borderColor: T.bdLight }}>
                                          <ConfBadge level={tc.confidence} />
                                          <div className="flex items-center gap-1 mt-1">
                                            <ShieldCheck size={9} style={{ color: confColor }} />
                                            <span style={{ fontSize: 9, color: confColor, fontWeight: 600 }}>{tc.confidence}</span>
                                          </div>
                                        </div>
                                        {/* Steps */}
                                        <div className="w-[60px] flex items-center justify-center shrink-0 border-l" style={{ borderColor: T.bdLight, fontSize: 11, color: T.t3, fontWeight: 500 }}>
                                          {tc.steps} steps
                                        </div>
                                        {/* Priority */}
                                        <div className="w-[60px] flex items-center justify-center shrink-0 border-l" style={{ borderColor: T.bdLight }}>
                                          <PriBadge level={tc.priority} />
                                        </div>
                                        {/* Actions */}
                                        <div className="w-[60px] flex items-center justify-center shrink-0 border-l gap-1" style={{ borderColor: T.bdLight }}>
                                          {tab === "review" && (
                                            <>
                                              <button onClick={e => { e.stopPropagation(); handleAccept(tc.id); }} className="p-1 rounded hover:bg-emerald-50 text-emerald-600 transition-colors" title="Accept">
                                                <CheckCircle size={14} />
                                              </button>
                                              <button onClick={e => { e.stopPropagation(); handleReject(tc.id); }} className="p-1 rounded hover:bg-rose-50 text-rose-600 transition-colors" title="Reject">
                                                <RotateCcw size={14} className="scale-x-[-1]" />
                                              </button>
                                            </>
                                          )}
                                          {tab === "accepted" && (
                                            <button onClick={e => { e.stopPropagation(); handleReject(tc.id); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors" title="Move to Review">
                                              <RotateCcw size={14} className="scale-x-[-1]" />
                                            </button>
                                          )}
                                          {tab === "rejected" && (
                                            <button onClick={e => { e.stopPropagation(); handleAccept(tc.id); }} className="p-1 rounded hover:bg-emerald-50 text-emerald-600 transition-colors" title="Restore">
                                              <RotateCcw size={14} />
                                            </button>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* Generation loading state */}
                        {isGen && pipeStep >= 3 && streamCount < ALL_CASES.length && (
                          <div className="p-4 flex items-center gap-3 bg-white" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
                            <Loader2 size={13} className="animate-spin" style={{ color: T.brand }} />
                            <span style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}>Kai is generating test cases... ({streamCount}/{ALL_CASES.length})</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT PANEL (Detail) */}
                <DetailPanel tc={selectedTc}
                  onClose={() => setSelectedId(null)}
                  onAccept={id => handleAccept(id)}
                  onReject={id => handleReject(id)} />
              </div>
            )}
          </div>
        )}

        {/* =================================================================
            PHASE 4: SAVED
            ================================================================= */}
        {phase === "saved" && <PostSaveView savedCount={cases.filter(c => c.selected).length} isJ1={isJ1} />}
      </div>
    </Layout>
  );
}
