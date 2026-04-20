import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Shield, Sparkles, ChevronDown, ChevronRight, Play, Paperclip, Plus, AlertTriangle, Code2, File, ImageIcon, FileSpreadsheet, X, Bold, Italic, Link2, List } from 'lucide-react';
import { T } from '../../utils/design-system';
import Layout from '../../components/shell/Layout';
import { Badge, Toast, Button, IBtn } from '../../components/shared';
import { RPanel } from './components/RightPanel';
import { PreCond } from './components/PreCond';
import { PasteModal } from './components/PasteModal';
import { AISugg } from './components/AIHelpers';
import { StatusDropdown, MoreMenu, QualityPopover, RunnerPopover } from './components/HeaderActions';
import { Toolbar, StepRow, InsertZone, InsertLine } from './components/StepTable';
import { computeQuality, computeRunnerConfidence } from './utils/QualityEngine';
import { INIT, AI_STEPS, ATTACHMENTS } from './data/mockData';

const MiniEditor = ({ value, onChange, placeholder, minHeight = 96 }) => {
  const [active, setActive] = useState(false);
  return (
    <div className={`rounded-md transition-all flex flex-col ${active ? "ring-2 ring-indigo-500/20 bg-white" : "hover:bg-gray-50 bg-white"}`} 
      style={{ border: `1px solid ${active ? T.brand : T.bd}`, overflow: "hidden", minHeight }}>
      {active && (
        <div className="flex items-center gap-1 border-b px-2 py-1" style={{ background: T.muted, borderColor: T.bd }}>
          <IBtn title="Bold"><Bold size={11} strokeWidth={2} /></IBtn>
          <IBtn title="Italic"><Italic size={11} strokeWidth={2} /></IBtn>
          <IBtn title="Link"><Link2 size={11} strokeWidth={2} /></IBtn>
          <div style={{ width: 1, height: 12, background: T.bd, margin: "0 4px" }} />
          <IBtn title="Bullet List"><List size={11} strokeWidth={2} /></IBtn>
        </div>
      )}
      <div contentEditable suppressContentEditableWarning
        className="outline-none px-2.5 py-2 whitespace-pre-wrap flex-1 cursor-text"
        style={{ fontSize: 12, lineHeight: 1.55, color: value ? T.t2 : T.t4 }}
        onFocus={() => setActive(true)}
        onBlur={e => { setActive(false); onChange(e.target.innerText); }}
        dangerouslySetInnerHTML={{ __html: value || (active ? "" : `<span style="color:${T.t4}">${placeholder || ""}</span>`) }}
      />
    </div>
  );
};

export default function TestCaseGeneratorPrototype() {
  const [steps, setSteps] = useState(INIT);
  const [template, setTemplate] = useState("manual");
  const [ac, setAc] = useState(null);
  const [title, setTitle] = useState("Verify user login functionality");
  const [editingTitle, setEditingTitle] = useState(false);
  const [desc, setDesc] = useState("Verify the complete user login flow including authentication, session creation, and dashboard redirect.");
  const [pre, setPre] = useState("1. Test user account exists (qa.tester@katalon.io)\n2. Application deployed and accessible\n3. No active sessions for the test user");
  const [preOpen, setPreOpen] = useState(true);
  const [meta, setMeta] = useState({ status: "Published", priority: "High", assignee: "Huy Dao" });
  const [showAI, setShowAI] = useState(false);
  const [aiDone, setAiDone] = useState([]);
  const [aiLoad, setAiLoad] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [dOver, setDOver] = useState(null);
  const [dSrc, setDSrc] = useState(null);
  const [paste, setPaste] = useState(null);
  const [undo, setUndo] = useState([]);
  const [redo, setRedo] = useState([]);
  const [tab, setTab] = useState("steps");
  const [panel, setPanel] = useState(true);
  const [panelW, setPanelW] = useState(280);
  const [hoverInsert, setHoverInsert] = useState(null);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [runnerOpen, setRunnerOpen] = useState(false);
  const [highlightStep, setHighlightStep] = useState(null);

  const quality = useMemo(() => computeQuality(steps), [steps]);
  const runner = useMemo(() => computeRunnerConfidence(steps), [steps]);

  const stepIssueMap = useMemo(() => {
    const m = {};
    quality.stepIssues.forEach(iss => { if (!m[iss.stepId]) m[iss.stepId] = []; m[iss.stepId].push(iss); });
    return m;
  }, [quality.stepIssues]);

  const snap = useCallback(() => { setUndo(p => [...p.slice(-20), JSON.parse(JSON.stringify(steps))]); setRedo([]); }, [steps]);
  const flash = m => { setToast({ show: true, msg: m }); setTimeout(() => setToast({ show: false, msg: "" }), 2000); };
  const doUndo = () => { if (!undo.length) return; setRedo(r => [...r, JSON.parse(JSON.stringify(steps))]); setSteps(undo.at(-1)); setUndo(u => u.slice(0, -1)); flash("Undo"); };
  const doRedo = () => { if (!redo.length) return; setUndo(u => [...u, JSON.parse(JSON.stringify(steps))]); setSteps(redo.at(-1)); setRedo(r => r.slice(0, -1)); flash("Redo"); };

  const upd = (id, f, v) => { snap(); setSteps(p => p.map(s => s.id === id ? { ...s, [f]: v } : s)); };
  const del = id => { snap(); setSteps(p => p.filter(s => s.id !== id)); flash("Removed"); };
  const add = () => { snap(); const n = Math.max(0, ...steps.map(s => s.id)) + 1; setSteps(p => [...p, { id: n, step: "", exp: "", data: "" }]); setTimeout(() => setAc(`${n}-s`), 50); };
  const insertAt = (idx) => { snap(); const n = Math.max(0, ...steps.map(s => s.id)) + 1; setSteps(p => { const cp = [...p]; cp.splice(idx, 0, { id: n, step: "", exp: "", data: "" }); return cp; }); setHoverInsert(null); setTimeout(() => setAc(`${n}-s`), 50); flash("Step inserted"); };
  const handleMultiPaste = (idx, rows) => {
    snap();
    const b = Math.max(0, ...steps.map(s => s.id)) + 1;
    const newSteps = rows.map((r, i) => {
      if (template === 'bdd') {
        const hasKeyword = ["Given", "When", "Then", "And", "But"].includes(r[0]);
        return { id: b + i, keyword: hasKeyword ? r[0] : "And", step: hasKeyword ? r[1] : r[0], data: hasKeyword ? r[2] : r[1] };
      }
      return { id: b + i, step: r[0], exp: r[1] || "", data: r[2] || "" };
    });
    setSteps(p => { const cp = [...p]; cp.splice(idx + 1, 0, ...newSteps); return cp; });
    flash(`${rows.length} pasted`);
  };
  const genAI = () => { setAiLoad(true); setAiDone([]); setTimeout(() => { setAiLoad(false); setShowAI(true); }, 1500); };
  const okAI = id => { const s = AI_STEPS.find(x => x.id === id); if (!s) return; snap(); const n = Math.max(0, ...steps.map(x => x.id)) + 1; setSteps(p => [...p, { ...s, id: n, isAI: true }]); setAiDone(p => [...p, id]); flash("Added"); };
  const okAllAI = () => { snap(); const ns = AI_STEPS.filter(s => !aiDone.includes(s.id)).map((s, i) => ({ ...s, id: Math.max(0, ...steps.map(x => x.id)) + i + 1, isAI: true })); setSteps(p => [...p, ...ns]); setAiDone(AI_STEPS.map(s => s.id)); flash(`${ns.length} added`); };

  const ds = (_, i) => setDSrc(i);
  const dO = (e, i) => { e.preventDefault(); setDOver(i); };
  const dr = (e, i) => { e.preventDefault(); if (dSrc == null || dSrc === i) return; snap(); const n = [...steps]; const [m] = n.splice(dSrc, 1); n.splice(i, 0, m); setSteps(n); setDSrc(null); setDOver(null); flash("Reordered"); };

  const doPaste = () => setPaste([
    ["Open account settings page", "Settings page loads with profile section", ""],
    ['Click "Change Password"', "Password form appears", ""],
    ["Enter current password", "Field accepts input", "Current: Test@2026!"],
    ["Enter new password and confirm", 'Strength: "Strong"', "New: NewPass@2026!"],
    ['Click "Save Changes"', 'Toast: "Password updated"', ""],
  ]);
  const okPaste = () => { if (!paste) return; snap(); const b = Math.max(0, ...steps.map(s => s.id)) + 1; setSteps(p => [...p, ...paste.map((r, i) => ({ id: b + i, step: r[0], exp: r[1], data: r[2] }))]); setPaste(null); flash(`${paste.length} pasted`); };

  const onClickQualitySuggestion = (stepId) => {
    setQualityOpen(false);
    setHighlightStep(stepId);
    setTimeout(() => {
      const el = document.querySelector(`[data-step-id="${stepId}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    setTimeout(() => setHighlightStep(null), 6000);
  };

  const titleRef = useRef(null);
  useEffect(() => { if (editingTitle && titleRef.current) titleRef.current.focus(); }, [editingTitle]);

  const fileIcon = (type) => type === "pdf" ? File : type === "image" ? ImageIcon : FileSpreadsheet;

  return (
    <Layout breadcrumbs={["Tests", "Test Cases", "Authentication", "TC-516324"]} activeSidebarId="tests">
      {/* ── Header ── */}
      <div className="px-5 py-3 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
        <div className="flex items-center gap-2 mb-2">
          <Badge color={T.purple} bg="rgba(124,58,237,0.06)" border="rgba(124,58,237,0.15)">MANUAL</Badge>
          <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.t4 }}>TC-516324</span>
          <StatusDropdown value={meta.status} onChange={v => setMeta(p => ({ ...p, status: v }))} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {editingTitle ? (
              <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)}
                onBlur={() => { if (!title.trim()) { setTitle("Untitled test case"); } setEditingTitle(false); }}
                onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") { setTitle("Verify user login functionality"); setEditingTitle(false); }}}
                className="flex-1 outline-none min-w-0"
                style={{ fontSize: 16, fontWeight: 600, color: T.t1, letterSpacing: -0.2, background: "transparent", borderRadius: 4, padding: "1px 4px", boxShadow: `inset 0 0 0 1.5px ${T.brand}` }} />
            ) : (
              <h1 onClick={() => setEditingTitle(true)} className="flex-1 min-w-0 truncate cursor-text group"
                style={{ fontSize: 16, fontWeight: 600, color: T.t1, letterSpacing: -0.2, padding: "1px 4px", borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.background = T.muted}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {title || <span style={{ color: T.t4 }}>Untitled test case</span>}
              </h1>
            )}

            <div className="relative shrink-0">
              <button onClick={() => { setQualityOpen(!qualityOpen); setRunnerOpen(false); }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
                style={{ border: `1px solid ${quality.color === T.green ? "rgba(22,163,74,0.2)" : quality.color === T.amber ? "rgba(217,119,6,0.2)" : "rgba(220,38,38,0.2)"}`,
                  background: qualityOpen ? (quality.color === T.green ? "rgba(22,163,74,0.06)" : quality.color === T.amber ? "rgba(217,119,6,0.06)" : "rgba(220,38,38,0.06)") : "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = quality.color === T.green ? "rgba(22,163,74,0.06)" : quality.color === T.amber ? "rgba(217,119,6,0.06)" : "rgba(220,38,38,0.06)"}
                onMouseLeave={e => { if (!qualityOpen) e.currentTarget.style.background = "transparent"; }}>
                <Shield size={12} style={{ color: quality.color }} strokeWidth={1.6} />
                <span style={{ fontSize: 11, fontWeight: 600, color: quality.color, fontVariantNumeric: "tabular-nums" }}>{quality.overall}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: T.t3 }}>{quality.label}</span>
                <ChevronDown size={10} style={{ color: T.t4 }} />
              </button>
              {qualityOpen && <QualityPopover quality={quality} onClose={() => setQualityOpen(false)} onClickSuggestion={onClickQualitySuggestion} />}
            </div>

            <div className="relative shrink-0">
              <button onClick={() => { setRunnerOpen(!runnerOpen); setQualityOpen(false); }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
                style={{ border: `1px solid ${runner.color === T.green ? "rgba(22,163,74,0.2)" : runner.color === T.amber ? "rgba(217,119,6,0.2)" : "rgba(220,38,38,0.2)"}`,
                  background: runnerOpen ? (runner.color === T.green ? "rgba(22,163,74,0.06)" : "rgba(217,119,6,0.06)") : "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = runner.color === T.green ? "rgba(22,163,74,0.06)" : "rgba(217,119,6,0.06)"}
                onMouseLeave={e => { if (!runnerOpen) e.currentTarget.style.background = "transparent"; }}>
                <Sparkles size={12} style={{ color: T.purple }} strokeWidth={1.6} />
                <span style={{ fontSize: 11, fontWeight: 600, color: runner.color, fontVariantNumeric: "tabular-nums" }}>{runner.score}%</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: T.t3 }}>{runner.label}</span>
                <ChevronDown size={10} style={{ color: T.t4 }} />
              </button>
              {runnerOpen && <RunnerPopover runner={runner} onClose={() => setRunnerOpen(false)} />}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="primary" icon={Play} onClick={() => {}} style={{ background: T.green }}>
              Execute
            </Button>
            <Button variant="secondary" icon={Sparkles} onClick={genAI} disabled={aiLoad} style={{ color: T.purple }}>
              {aiLoad ? "Analyzing..." : "Suggest Steps"}
            </Button>
            <MoreMenu />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* CENTER PANEL: Step Editor */}
        <div className="flex-1 flex flex-col bg-white relative min-h-0">
          
          {/* Static Context Header (Outside Scroll Area) */}
          <div className="border-b transition-all shadow-sm z-20" style={{ background: "#fcfcfd", borderColor: T.bdLight, padding: "16px 20px" }}>
            
            {preOpen ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPreOpen(false)}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.t2, letterSpacing: 0.2 }}>Summary</div>
                  </div>
                  <button onClick={() => setPreOpen(false)} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors" style={{ fontSize: 11, fontWeight: 500 }}>
                    Collapse <ChevronDown size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <label style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6, display: "block", marginBottom: 4 }}>
                      Description <span style={{ color: T.red }}>*</span>
                    </label>
                    <MiniEditor value={desc} onChange={setDesc} placeholder="Enter description..." minHeight={110} />
                  </div>
                  <div className="md:col-span-1">
                    <label style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6, display: "block", marginBottom: 4 }}>
                      Pre-conditions
                    </label>
                    <MiniEditor value={pre} onChange={setPre} placeholder="Setup, data, or conditions..." minHeight={110} />
                  </div>
                  <div className="md:col-span-1">
                    <label style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>Attachments ({ATTACHMENTS.length})</span>
                      <button className="text-indigo-600 hover:text-indigo-700 transition-colors"><Plus size={12} /></button>
                    </label>
                    <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 76 }}>
                      {ATTACHMENTS.map((att, i) => {
                        const Icon = fileIcon(att.type);
                        return (
                          <div key={i} className="group relative flex items-center gap-2 p-1 rounded border transition-shadow cursor-pointer bg-white" style={{ borderColor: T.bd }}>
                            <div className="flex items-center justify-center shrink-0 rounded" style={{ width: 22, height: 22, background: att.thumb ? "#e8eaf0" : T.muted }}>
                              <Icon size={12} style={{ color: T.t4 }} />
                            </div>
                            <div className="flex-1 min-w-0 flex justify-between items-center pr-1">
                              <div style={{ fontSize: 11, fontWeight: 500, color: T.t2 }} className="truncate">{att.name}</div>
                              <div style={{ fontSize: 9, color: T.t4 }}>{att.size}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 transition-colors rounded -mx-2 px-2 py-1" onClick={() => setPreOpen(true)}>
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 600, color: T.t2, letterSpacing: 0.2, whiteSpace: "nowrap" }}>
                    <ChevronRight size={14} style={{ color: T.t4 }} className="group-hover:text-gray-800 transition-colors" />
                    Summary
                  </div>
                  <div style={{ width: 1, height: 12, background: T.bd }} />
                  <div className="truncate" style={{ fontSize: 12, color: T.t3, flex: 1 }}>
                    {desc || "No description provided..."}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 relative">
            <div className="flex items-center gap-5 mb-4" style={{ borderBottom: `1px solid ${T.bd}` }}>
            {[
              { id: "steps", l: `Steps (${steps.length})` },
              { id: "scripts", l: "Scripts" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className="pb-2 transition-colors"
                style={{ fontSize: 12, fontWeight: 500, color: tab === t.id ? T.brand : T.t4, borderBottom: tab === t.id ? `2px solid ${T.brand}` : "2px solid transparent" }}
                onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = T.t2; }}
                onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = T.t4; }}>
                {t.l}
              </button>
            ))}
          </div>

          {tab === "steps" && (
            <>
              {showAI && <AISugg items={AI_STEPS} done={aiDone} onOk={okAI} onAll={okAllAI} onX={() => setShowAI(false)} />}
              <div className="rounded-lg overflow-hidden" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                <Toolbar onUndo={doUndo} onRedo={doRedo} canUndo={undo.length > 0} canRedo={redo.length > 0} onPaste={doPaste} onAdd={add} template={template} setTemplate={setTemplate} />
                <table className="w-full" style={{ tableLayout: "fixed" }}>
                  <thead className="sticky z-10" style={{ top: 29 }}>
                    <tr style={{ background: T.muted, borderBottom: `1px solid ${T.bd}` }}>
                      <th className="w-10 bg-inherit" />
                      <th className="w-6 bg-inherit" />
                      {(template === 'bdd' ? [["20%", "Keyword"], ["49%", "Step Definition"], ["22%", "Test Data"]] : [["38%", "Test Steps"], ["32%", "Expected Results"], ["22%", "Test Data"]]).map(([w, h], i) => (
                        <th key={h} className="text-left px-2.5 py-1.5 bg-inherit" style={{ width: w, fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, borderLeft: i > 0 ? `1px solid ${T.bd}` : undefined }}>{h}</th>
                      ))}
                      <th className="w-14 bg-inherit" />
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((s, i) => {
                      const issues = stepIssueMap[s.id] || [];
                      const isHighlighted = highlightStep === s.id;
                      const chipIssue = issues[0] || null;
                      return (
                        <React.Fragment key={s.id}>
                          <StepRow s={s} idx={i} ac={ac} onAc={setAc} onUp={upd} onDel={del} onDS={ds} onDO={dO} onDr={dr}
                            drag={dOver === i} issues={issues} highlighted={isHighlighted}
                            onHighlightStep={(id) => { setHighlightStep(id); setTimeout(() => setHighlightStep(null), 6000); }} 
                            template={template} onAddRow={insertAt} onMultiPaste={handleMultiPaste} />
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-3 py-2" style={{ background: T.muted, borderTop: `1px solid ${T.bd}` }}>
                  <Button variant="secondary" icon={Plus} onClick={add} style={{ fontSize: 12, borderStyle: 'dashed', borderColor: T.accentBorder }}>
                    Add Step
                  </Button>
                  <span style={{ fontSize: 10, color: T.t4 }}>{steps.length} step{steps.length !== 1 ? "s" : ""} · Tab from last row to add</span>
                </div>
              </div>
              {steps.length === 0 && (
                <div className="mt-4 flex items-center gap-2.5 rounded-lg p-3"
                  style={{ background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.15)" }}>
                  <AlertTriangle size={16} style={{ color: T.amber, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: T.amber }}>No test steps defined</div>
                    <div style={{ fontSize: 11, color: T.t3, marginTop: 1 }}>This test case cannot be executed without steps. Add steps manually, paste from Excel, or use AI to generate them.</div>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "scripts" && (
            <div className="rounded-lg overflow-hidden" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
              <div className="p-6 text-center" style={{ background: "linear-gradient(180deg, rgba(124,58,237,0.03) 0%, transparent 100%)" }}>
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
                    <Sparkles size={20} style={{ color: T.purple }} strokeWidth={1.4} />
                  </div>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: T.t1, marginBottom: 4 }}>Generate Automation Script</h3>
                <p style={{ fontSize: 12, color: T.t3, lineHeight: 1.5, maxWidth: 360, margin: "0 auto 12px" }}>
                  Let the AI Runner convert your {steps.length} manual steps into an executable automation script.
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4"
                  style={{ background: runner.color === T.green ? "rgba(22,163,74,0.06)" : "rgba(217,119,6,0.06)", border: `1px solid ${runner.color === T.green ? "rgba(22,163,74,0.15)" : "rgba(217,119,6,0.15)"}` }}>
                  <Sparkles size={10} style={{ color: T.purple }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: runner.color }}>AI Runner Confidence: {runner.score}% {runner.label}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="primary" icon={Play} onClick={() => {}} style={{ background: T.purple }}>
                    Generate with AI Runner
                  </Button>
                  <Button variant="secondary" icon={Plus} onClick={() => {}}>
                    Link Existing Script
                  </Button>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${T.bdLight}` }} />
              <div className="flex items-center justify-center gap-2 px-4 py-3" style={{ background: T.muted }}>
                <Code2 size={13} style={{ color: T.t4 }} strokeWidth={1.5} />
                <span style={{ fontSize: 11, color: T.t4 }}>No automation scripts linked to this test case</span>
              </div>
            </div>
          )}

        </div>
        </div>

        <RPanel meta={meta} setMeta={(k, v) => setMeta(p => ({ ...p, [k]: v }))} open={panel} toggle={() => setPanel(!panel)}
          width={panelW} onResize={setPanelW} 
          desc={desc} setDesc={setDesc}
          pre={pre} setPre={setPre} preOpen={preOpen} setPreOpen={setPreOpen} />
      </div>

      <Toast show={toast.show} msg={toast.msg} />
      {paste && <PasteModal rows={paste} onOk={okPaste} onX={() => setPaste(null)} />}
    </Layout>
  );
}
