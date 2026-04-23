import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, CheckCircle, ChevronDown, FlaskConical, FolderOpen, Loader2, Pencil, RotateCcw, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { T } from '../../utils/design-system';
import Layout from '../../components/shell/Layout';
import { Toast, ConfBadge, IBtn, TestCaseTable, TCTableRenderers } from '../../components/shared';

import { MOCK_FOLDERS, PIPELINE_STEPS, CLARS, ALL_CASES, TC_LIST_DATA, GEN_MORE_OPTS } from './data/mockData';
import { ReqDetailPage, TestCaseListPage } from './components/EntryPages';
import { DemoToggle, PipelineBar, SetupPage, ContextBar, InputExpanded, ClarificationCenter, DetailPanel } from './components/GenerationWorkspace';
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
  const [pipeCollapsed, setPipeCollapsed] = useState(false);

  const flash = m => { setToast({ show: true, msg: m }); setTimeout(() => setToast({ show: false, msg: "" }), 2500); };
  const resolveC = (id, val) => setClars(p => p.map(c => c.id === id ? { ...c, resolved: val } : c));

  const handleExecute = () => {
    flash(`Executing 7 linked test cases...`);
    // Simulate execution start
    setTimeout(() => flash(`Execution started successfully.`), 1000);
  };

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
          isJ1 ? <ReqDetailPage onGenerate={() => setPhase("workspace-idle")} onExecute={handleExecute} />
               : <TestCaseListPage onCreateWithAI={() => setPhase("workspace-idle")} />
        )}

        {/* =================================================================
            PHASE 2 & 3: WORKSPACE (Idle / Generating / Done)
            ================================================================= */}
        {phase.startsWith("workspace") && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar: only during generation/review — setup state owns the full page */}
            {phase !== "workspace-idle" && (
              inputExpanded ? (
                <InputExpanded entry={entry} onCollapse={() => setInputExpanded(false)} onGenerate={handleGenerate} text={text} setText={setText} files={files} setFiles={setFiles} generating={isGen} />
              ) : (
                <ContextBar entry={entry} onEdit={() => setInputExpanded(true)} generating={isGen} />
              )
            )}

            {/* Pipeline progress bar */}
            {(isGen || (isDone && !pipeCollapsed)) && <PipelineBar step={pipeStep} done={isDone} onCollapse={() => setPipeCollapsed(true)} />}

            {/* Main workspace content */}
            {phase === "workspace-idle" ? (
              <SetupPage entry={entry} onGenerate={handleGenerate} text={text} setText={setText} files={files} setFiles={setFiles} />
            ) : (
              <div className="flex-1 flex overflow-hidden">

                {/* MIDDLE: Results — full width, no sidebar */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-in-up" style={{ minWidth: 0 }}>

                  {/* State 2: Clarification center-hero (replaces empty state + sidebar cards) */}
                  {waitingClar && (
                    <ClarificationCenter clars={clars} onResolve={resolveC} onSkip={() => setPipeStep(3)} />
                  )}
                  {/* State 3+: Tabs and results list — hidden while clarifications are pending */}
                  {!waitingClar && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                  {/* List header/tabs */}
                  <div className="flex items-center justify-between px-4 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bdLight}` }}>
                    <div className="flex items-center gap-0">
                      {[
                        { id: "review", label: `Review (${cases.length})` },
                        { id: "accepted", label: `Accepted (${accepted.length})` },
                        { id: "rejected", label: `Rejected (${rejected.length})` },
                        { id: "existing", label: `Existing TCs (${TC_LIST_DATA.length})` }
                      ].map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setSelectedId(null); }}
                          className="px-3 py-3.5 transition-colors relative"
                          style={{ fontSize: 12, fontWeight: tab === t.id ? 600 : 500, color: tab === t.id ? T.brand : T.t3 }}>
                          {t.label}
                          {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: T.brand }} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Case List */}
                  <div className="flex-1 overflow-y-auto bg-white p-0">
                    {tab === "existing" ? (
                      <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
                        <TestCaseTable 
                          data={TC_LIST_DATA}
                          columns={[
                            { label: "ID", width: 110, render: TCTableRenderers.id },
                            { label: "Name", render: TCTableRenderers.nameWithTags },
                            { label: "Type", width: 72, render: TCTableRenderers.typeBadge },
                            { label: "Status", width: 90, render: TCTableRenderers.statusDot },
                            { label: "Pri", width: 50, render: TCTableRenderers.priority },
                            { label: "Last Run", width: 72, render: TCTableRenderers.lastRun },
                            { label: "Assignee", width: 80, render: (r) => TCTableRenderers.textSmall(r.assignee) },
                            { label: "Updated", width: 64, render: (r) => TCTableRenderers.textSmall(r.updated) }
                          ]}
                        />
                      </div>
                    ) : (
                      <div style={{ background: T.bg, minHeight: "100%" }}>
                        {(tab === "review" ? cases : (tab === "accepted" ? accepted : (tab === "rejected" ? rejected : []))).length === 0 && (
                          <div className="p-20 text-center flex flex-col items-center">
                            {isGen && streamCount === 0 ? (
                              <>
                                <Loader2 size={24} className="animate-spin mb-3" style={{ color: T.brand }} />
                                <p style={{ fontSize: 13, fontWeight: 600, color: T.t1, marginBottom: 4 }}>Kai is analyzing requirements...</p>
                                <p style={{ fontSize: 12, color: T.t3, maxWidth: 300, lineHeight: 1.55 }}>Please wait while Kai extracts test scenarios and boundaries.</p>
                              </>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                  <FlaskConical size={24} className="text-gray-200" />
                                </div>
                                <p style={{ fontSize: 12, color: T.t4 }}>No test cases in this view</p>
                              </>
                            )}
                          </div>
                        )}
                        {Object.entries(groupByArea(tab === "review" ? cases : (tab === "accepted" ? accepted : (tab === "rejected" ? rejected : [])))).length > 0 && (
                          <TestCaseTable
                            onRowClick={row => setSelectedId(row.id)}
                            selectedId={selectedId}
                            groups={Object.entries(groupByArea(tab === "review" ? cases : (tab === "accepted" ? accepted : (tab === "rejected" ? rejected : [])))).map(([area, areaCases]) => ({
                              name: area,
                              items: areaCases,
                              rightAction: !selectedId && tab === "review" ? () => (
                                <button onClick={() => handleAcceptGroup(area)} className="flex items-center gap-1 px-2 py-1 rounded transition-colors text-emerald-600 hover:bg-emerald-50"
                                  style={{ fontSize: 10, fontWeight: 600 }}>
                                  <Check size={12} strokeWidth={2.5} /> Accept group
                                </button>
                              ) : null
                            }))}
                            getRowStyle={row => ({ borderLeft: `3px solid ${row.confidence === "high" ? T.green : row.confidence === "medium" ? T.amber : T.red}` })}
                            columns={selectedId ? [
                              { width: 56, render: (row) => <ConfBadge level={row.confidence} /> },
                              { render: (row) => (
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: 12, fontWeight: selectedId === row.id ? 600 : 400, color: T.t1 }}>{row.name}</div>
                                </div>
                              )},
                              { width: 44, render: TCTableRenderers.priority }
                            ] : [
                              { 
                                width: 36,
                                render: (row) => (
                                  <div className="w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); toggleSelect(row.id); }}
                                    style={{ borderColor: row.selected ? T.brand : T.t4, background: row.selected ? T.brand : "transparent" }}>
                                    {row.selected && <Check size={10} style={{ color: "#fff", strokeWidth: 3 }} />}
                                  </div>
                                )
                              },
                              { label: "Test Case", render: TCTableRenderers.nameWithTags },
                              { label: "Confidence", width: 84, render: (row) => <ConfBadge level={row.confidence} /> },
                              { label: "Steps", width: 64, render: (row) => <span style={{ fontSize: 11, color: T.t3 }}>{row.steps} steps</span> },
                              { label: "Pri", width: 50, render: TCTableRenderers.priority }
                            ]}
                            renderRowActions={!selectedId ? (tc) => (
                              <>
                                {tab === "review" && (
                                  <>
                                    <button onClick={e => { e.stopPropagation(); handleAccept(tc.id); }} className="p-1 rounded hover:bg-emerald-50 text-emerald-600 transition-colors" title="Accept"><CheckCircle size={14} /></button>
                                    <button onClick={e => { e.stopPropagation(); handleReject(tc.id); }} className="p-1 rounded hover:bg-rose-50 text-rose-600 transition-colors" title="Reject"><X size={14} /></button>
                                  </>
                                )}
                                {tab === "accepted" && (
                                  <button onClick={e => { e.stopPropagation(); handleReject(tc.id); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors" title="Move to Review"><RotateCcw size={14} className="scale-x-[-1]" /></button>
                                )}
                                {tab === "rejected" && (
                                  <button onClick={e => { e.stopPropagation(); handleAccept(tc.id); }} className="p-1 rounded hover:bg-emerald-50 text-emerald-600 transition-colors" title="Restore"><RotateCcw size={14} /></button>
                                )}
                              </>
                            ) : undefined}
                          />
                        )}

                        {/* Coverage gaps */}
                        {isDone && tab === "review" && cases.length > 0 && (
                          <div className="flex items-center gap-3 px-4 py-2 mt-4" style={{ background: "rgba(217,119,6,0.04)", borderTop: "1px solid rgba(217,119,6,0.12)", borderBottom: "1px solid rgba(217,119,6,0.12)" }}>
                            <AlertTriangle size={11} style={{ color: T.amber }} />
                            <span style={{ fontSize: 11, color: T.t2 }}>
                              Coverage gaps: <strong>role-based access</strong>, <strong>OAuth/SSO</strong>
                            </span>
                            <button className="flex items-center gap-1 ml-auto" style={{ fontSize: 10, color: T.brand, fontWeight: 500 }}>
                              <Sparkles size={9} /> Generate for gaps
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  </div>
                  )}

                  {/* Generation loading state */}
                  {isGen && pipeStep >= 3 && streamCount < ALL_CASES.length && (
                    <div className="p-4 flex items-center gap-3 bg-white shrink-0" style={{ borderTop: `1px solid ${T.bdLight}`, boxShadow: "0 -4px 12px rgba(0,0,0,0.05)" }}>
                      <Loader2 size={13} className="animate-spin" style={{ color: T.brand }} />
                      <span style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}>Kai is generating test cases... ({streamCount}/{ALL_CASES.length})</span>
                    </div>
                  )}

                  {/* Action Bar */}
                  {isDone && tab === "review" && cases.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ background: T.hover, borderTop: `1px solid ${T.bdLight}` }}>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button onClick={() => setShowGenMore(!showGenMore)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors"
                            style={{ fontSize: 11, fontWeight: 500, color: T.brand, border: `1px solid ${T.accentBorder}` }}
                            onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
                            onMouseLeave={e => { if (!showGenMore) e.currentTarget.style.background = "transparent"; }}>
                            <Sparkles size={10} /> Generate more <ChevronDown size={9} />
                          </button>
                          {showGenMore && (
                            <div className="absolute bottom-full mb-1 left-0 w-52 rounded-md overflow-hidden z-20" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                              {GEN_MORE_OPTS.map(o => (
                                <button key={o} onClick={() => setShowGenMore(false)} className="w-full text-left px-3 py-1.5 transition-colors"
                                  style={{ fontSize: 11, color: T.t2, borderBottom: `1px solid ${T.bdLight}` }}
                                  onMouseEnter={e => e.currentTarget.style.background = T.hover}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                  {o}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={() => { setInputExpanded(true); }}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors"
                          style={{ fontSize: 11, color: T.t3, border: `1px solid ${T.bd}` }}
                          onMouseEnter={e => { e.currentTarget.style.background = T.muted; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          <Pencil size={10} /> Refine input
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <IBtn title="Helpful"><ThumbsUp size={11} strokeWidth={1.4} /></IBtn>
                        <IBtn title="Not helpful"><ThumbsDown size={11} strokeWidth={1.4} /></IBtn>
                      </div>
                    </div>
                  )}

                  {/* Sticky Save Footer */}
                  {isDone && ((tab === "review" && cases.some(c => c.selected)) || (tab === "accepted" && accepted.length > 0)) && (
                    <div className="flex items-center justify-between px-4 py-2.5 shrink-0 animate-fade-in-up" style={{ background: T.card, borderTop: `1px solid ${T.bd}`, boxShadow: "0 -2px 8px rgba(0,0,0,0.04)" }}>
                      <div className="flex items-center gap-3">
                        <Check size={14} style={{ color: T.green }} />
                        <span style={{ fontSize: 11, color: T.t2 }}>
                          {tab === "accepted" ? `${accepted.length} accepted` : `${selCount} selected`} test cases
                        </span>
                        <div className="flex items-center gap-1.5 ml-2">
                          <span style={{ fontSize: 10, color: T.t4 }}>Save to:</span>
                          <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ border: `1px solid ${T.bd}`, background: T.bg }}>
                            <FolderOpen size={10} style={{ color: T.t4 }} />
                            <select style={{ fontSize: 11, color: T.t2, background: "transparent", outline: "none", width: 140 }}>
                              <option>Authentication Tests</option>
                              {MOCK_FOLDERS.map(f => <option key={f}>{f}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                      <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-md transition-all animate-glow"
                        style={{ background: T.brand, color: "#fff", fontSize: 12, fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.background = T.accent}
                        onMouseLeave={e => e.currentTarget.style.background = T.brand}>
                        <Check size={13} strokeWidth={2.5} /> Save {tab === "accepted" ? accepted.length : selCount} Test Cases
                      </button>
                    </div>
                  )}
                </div>

                {/* RIGHT PANEL (Detail) */}
                <div style={{ 
                  width: selectedId ? 380 : 0, 
                  transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)", 
                  overflow: "hidden", 
                  display: "flex", 
                  flexShrink: 0 
                }}>
                  <DetailPanel tc={selectedTc}
                    onClose={() => setSelectedId(null)}
                    onAccept={id => handleAccept(id)}
                    onReject={id => handleReject(id)} />
                </div>
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
