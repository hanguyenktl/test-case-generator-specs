import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, FileDown, FolderOpen, Loader2, Sparkles, Tag, Users } from 'lucide-react';
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
  const [entry, setEntry] = useState("j1");

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
  const [streamCount, setStreamCount] = useState(0);

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("review");
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

  const handleStartGenerate = () => {
    setPhase("workspace-gen");
    setInputExpanded(false);
    setPipeStep(0);
    setStreamCount(0);
    setCases([]);
    setClars(CLARS.map(c => ({ ...c, resolved: null })));
    if (!text && files.length === 0) {
      setText("The system shall support login with email and password. Session tokens expire after 30 minutes. Account locks after 5 failures.");
      if (isJ1) setFiles([{ name: "auth-flow-spec.pdf", size: "1.2 MB" }]);
    }
  };

  const handleSave = () => {
    setPhase("saved");
    flash(`Saved ${cases.filter(c => c.selected).length} test cases`);
  };

  const toggleSelect = id => setCases(p => p.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
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

  const selectedTc = cases.find(c => c.id === selectedId);
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
              <InputExpanded entry={entry} onCollapse={() => setInputExpanded(false)} onGenerate={handleStartGenerate} text={text} setText={setText} files={files} setFiles={setFiles} />
            ) : (
              <InputCollapsed entry={entry} onExpand={() => setInputExpanded(true)} onGenerate={handleStartGenerate} generating={isGen} />
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
                  <button onClick={handleStartGenerate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors"
                    style={{ background: T.brand, color: "#fff", fontSize: 13, fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = T.accent}
                    onMouseLeave={e => e.currentTarget.style.background = T.brand}>
                    <Sparkles size={14} /> Generate Test Cases
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden">
                {/* LEFT LIST */}
                <div className="flex flex-col overflow-hidden transition-all duration-300" style={{ flex: selectedId ? "0 0 450px" : 1 }}>
                  {/* List header/tabs */}
                  <div className="flex items-center px-4 py-2 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
                    <div className="flex gap-4">
                      {[{ id: "review", label: `Review (${cases.length})` }, { id: "existing", label: `Existing TCs (${EXISTING_TCS.length})` }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} className="pb-2 transition-colors relative"
                          style={{ fontSize: 11, fontWeight: tab === t.id ? 600 : 500, color: tab === t.id ? T.brand : T.t3, top: 9 }}>
                          {t.label}
                          {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: T.brand }} />}
                        </button>
                      ))}
                    </div>
                    {tab === "review" && isDone && (
                      <div className="ml-auto flex items-center gap-3">
                        <span style={{ fontSize: 11, color: T.t3 }}>{selCount} selected</span>
                        <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors"
                          style={{ background: selCount > 0 ? T.brand : T.muted, color: selCount > 0 ? "#fff" : T.t4, fontSize: 11, fontWeight: 500, pointerEvents: selCount > 0 ? "auto" : "none" }}>
                          Save {selCount} Test Cases
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Clarifications inline header */}
                  {waitingClar && (
                    <div className="px-4 py-3 shrink-0" style={{ background: "rgba(217,119,6,0.03)", borderBottom: `1px solid ${T.bdLight}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={13} style={{ color: T.amber }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.amber }}>Clarifications needed</span>
                        <span style={{ fontSize: 11, color: T.t3 }}>({clars.filter(c => c.resolved === null).length} remaining)</span>
                      </div>
                      {clars.map(c => <ClarCard key={c.id} c={c} onResolve={resolveC} />)}
                    </div>
                  )}

                  {/* Case List */}
                  <div className="flex-1 overflow-y-auto bg-[T.bg] p-4">
                    {tab === "existing" ? (
                      <div className="rounded-lg bg-[T.card]" style={{ border: `1px solid ${T.bdLight}` }}>
                        {EXISTING_TCS.map((tc, i) => (
                          <div key={tc.id} className="px-3 py-2 flex items-center gap-3" style={{ borderBottom: i < EXISTING_TCS.length - 1 ? `1px solid ${T.bdLight}` : "none" }}>
                            <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: T.t3 }}>{tc.id}</span>
                            <span style={{ fontSize: 11, color: T.t1, flex: 1 }}>{tc.name}</span>
                            <Badge color={tc.type === "MANUAL" ? T.purple : T.brand} bg={tc.type === "MANUAL" ? "rgba(124,58,237,0.06)" : T.accentLight}>{tc.type === "MANUAL" ? "Manual" : "Auto"}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {Object.entries(groupedCases).map(([area, areaCases]) => (
                          <div key={area} className="mb-5">
                            <div className="flex items-center gap-2 px-1 mb-2">
                              <FolderOpen size={13} style={{ color: T.t4 }} strokeWidth={1.5} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: T.t2 }}>{area}</span>
                              <span style={{ fontSize: 10, color: T.t4 }}>({areaCases.length})</span>
                            </div>
                            <div className="rounded-lg bg-[T.card] overflow-hidden" style={{ border: `1px solid ${T.bdLight}` }}>
                              {areaCases.map((tc, i) => {
                                const sel = tc.selected;
                                const isAct = selectedId === tc.id;
                                const confColor = tc.confidence === "high" ? T.green : tc.confidence === "medium" ? T.amber : T.red;
                                return (
                                  <div key={tc.id} className="group relative flex transition-colors cursor-pointer"
                                    style={{
                                      borderBottom: i < areaCases.length - 1 ? `1px solid ${T.bdLight}` : "none",
                                      background: isAct ? T.accentLight : "transparent",
                                    }}
                                    onClick={() => setSelectedId(tc.id)}>
                                    {/* Selection zone */}
                                    <div className="w-10 flex justify-center py-3 shrink-0" onClick={e => { e.stopPropagation(); toggleSelect(tc.id); }}>
                                      <div className="w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors"
                                        style={{ borderColor: sel ? T.brand : T.t4, background: sel ? T.brand : "transparent" }}>
                                        {sel && <Check size={10} style={{ color: "#fff", strokeWidth: 3 }} />}
                                      </div>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 py-2.5 pr-3 min-w-0 flex items-center">
                                      <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span style={{ fontSize: 12, fontWeight: 500, color: T.t1 }} className="truncate">{tc.name}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <div className="flex items-center gap-1" title="AI Confidence">
                                            <ShieldCheck size={10} style={{ color: confColor }} />
                                            <span style={{ fontSize: 9, color: confColor, fontWeight: 500 }}>{tc.confidence === "high" ? "High" : tc.confidence === "medium" ? "Medium" : "Low"} conf</span>
                                          </div>
                                          <span style={{ color: T.bd }}>|</span>
                                          <PriBadge level={tc.priority} />
                                          <span style={{ color: T.bd }}>|</span>
                                          <span style={{ fontSize: 10, color: T.t3 }}>{tc.steps} steps</span>
                                          {tc.tags?.map(t => (
                                            <span key={t} className="px-1 py-px rounded" style={{ fontSize: 9, color: T.t4, background: T.muted }}>{t}</span>
                                          ))}
                                        </div>
                                      </div>
                                      <ChevronRight size={14} style={{ color: isAct ? T.brand : T.bd, transition: "color 0.2s" }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* Generation loading state */}
                        {isGen && pipeStep >= 3 && streamCount < ALL_CASES.length && (
                          <div className="px-4 py-3 flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" style={{ color: T.brand }} />
                            <span style={{ fontSize: 11, color: T.t3 }}>Generating test cases...</span>
                          </div>
                        )}

                        {/* Generate More section */}
                        {isDone && (
                          <div className="mt-4 rounded-lg p-4 relative overflow-hidden" style={{ background: T.card, border: `1px dashed ${T.bd}` }}>
                            {!showGenMore ? (
                              <div className="flex items-center justify-between">
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: T.t2, marginBottom: 2 }}>Need more test cases?</div>
                                  <div style={{ fontSize: 10, color: T.t4 }}>Ask Kai to expand coverage for edge cases, security, or APIs.</div>
                                </div>
                                <button onClick={() => setShowGenMore(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors"
                                  style={{ background: T.muted, color: T.brand, fontSize: 11, fontWeight: 500 }}
                                  onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
                                  onMouseLeave={e => e.currentTarget.style.background = T.muted}>
                                  <Sparkles size={11} /> Generate more
                                </button>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span style={{ fontSize: 11, fontWeight: 600, color: T.t2 }}>What else should we cover?</span>
                                  <button onClick={() => setShowGenMore(false)} style={{ color: T.t4 }}><X size={12} /></button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {GEN_MORE_OPTS.map(o => (
                                    <button key={o} className="px-2.5 py-1 rounded-md transition-colors"
                                      style={{ fontSize: 10, color: T.t2, background: T.bg, border: `1px solid ${T.bdLight}` }}
                                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.brand; }}
                                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdLight; e.currentTarget.style.color = T.t2; }}>
                                      {o}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 relative">
                                  <input placeholder="Or type custom instructions..." className="flex-1 outline-none rounded-md"
                                    style={{ fontSize: 11, color: T.t1, background: T.bg, border: `1px solid ${T.bd}`, padding: "6px 32px 6px 10px" }} />
                                  <button className="absolute right-1 w-6 h-6 flex items-center justify-center rounded transition-colors"
                                    style={{ color: T.brand }} onMouseEnter={e => e.currentTarget.style.background = T.accentLight} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <ArrowRight size={12} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT PANEL (Detail) */}
                <DetailPanel tc={selectedTc}
                  onClose={() => setSelectedId(null)}
                  onAccept={id => { flash("Test case accepted"); toggleSelect(id); }}
                  onReject={id => { flash("Test case rejected"); setCases(p => p.filter(c => c.id !== id)); if (selectedId === id) setSelectedId(null); }} />
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
