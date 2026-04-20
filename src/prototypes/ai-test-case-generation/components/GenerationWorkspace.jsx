import React from 'react';
import { AlertTriangle, Check, CheckCircle2, ChevronDown, ChevronUp, ClipboardList, ExternalLink, File, FolderOpen, Link2, Loader2, Pencil, RotateCcw, ShieldCheck, Sparkles, ThumbsDown, ThumbsUp, Upload, X } from 'lucide-react';
import { T } from '../../../utils/design-system';
import { ConfBadge, PriBadge, IBtn, Button, RightDrawer } from '../../../components/shared';
import { ALL_CASES, PIPELINE_STEPS, MOCK_FOLDERS } from '../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   DEMO TOGGLE (top bar control)
   ═══════════════════════════════════════════════════════════════ */
export const DemoToggle = ({ entry, setEntry }) => (
  <div className="flex items-center gap-1 px-1 py-0.5 rounded-md" style={{ background: T.muted, border: `1px solid ${T.bd}` }}>
    {[{ id: "j1", label: "J1: From Requirement" }, { id: "j2", label: "J2: From Test Cases" }].map(o => (
      <button key={o.id} onClick={() => setEntry(o.id)} className="px-2 py-1 rounded transition-colors"
        style={{ fontSize: 10, fontWeight: entry === o.id ? 600 : 400, color: entry === o.id ? T.brand : T.t3, background: entry === o.id ? T.card : "transparent", boxShadow: entry === o.id ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}>
        {o.label}
      </button>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PIPELINE BAR (Horizontal, compact)
   ═══════════════════════════════════════════════════════════════ */
export const PipelineBar = ({ step, done }) => (
  <div className="flex items-center px-5 py-1.5 gap-4 shrink-0" style={{ background: done ? "rgba(22,163,74,0.03)" : T.bg, borderBottom: `1px solid ${T.bd}` }}>
    {PIPELINE_STEPS.map((s, i) => {
      const isDone = done || i < step;
      const isActive = !done && i === step;
      return (
        <div key={s.key} className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{
            background: isDone ? "rgba(22,163,74,0.1)" : isActive ? T.accentLight : "transparent",
            border: `1.5px solid ${isDone ? T.green : isActive ? T.brand : T.bd}`,
          }}>
            {isDone ? <Check size={8} style={{ color: T.green }} strokeWidth={2.5} /> :
             isActive ? <Loader2 size={8} style={{ color: T.brand }} className="animate-spin" /> :
             <span style={{ fontSize: 7, color: T.t4, fontWeight: 600 }}>{i + 1}</span>}
          </div>
          <span style={{ fontSize: 11, fontWeight: isDone || isActive ? 500 : 400, color: isDone ? T.green : isActive ? T.t1 : T.t4, whiteSpace: "nowrap" }}>{s.label}</span>
          {isActive && <span style={{ fontSize: 10, color: T.t3 }}>&mdash; {s.sub}</span>}
          {i < PIPELINE_STEPS.length - 1 && <span style={{ color: T.bd, margin: "0 2px" }}>&mdash;</span>}
        </div>
      );
    })}
    {done && <>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5">
        <CheckCircle2 size={11} style={{ color: T.green }} />
        <span style={{ fontSize: 10, color: T.green, fontWeight: 500 }}>{ALL_CASES.length} test cases in 12s</span>
      </div>
    </>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   INPUT SECTION — flush header bars, not floating cards
   ═══════════════════════════════════════════════════════════════ */
export const InputCollapsed = ({ entry, onExpand, onGenerate, generating }) => (
  <div className="flex items-center justify-between px-5 py-2 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
    <div className="flex items-center gap-3 min-w-0">
      <Sparkles size={13} style={{ color: T.purple }} />
      {entry === "j1" && <>
        <div className="flex items-center gap-1.5">
          <Link2 size={11} style={{ color: T.brand }} strokeWidth={1.5} />
          <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>TO-8526</span>
        </div>
        <span style={{ fontSize: 12, color: T.t2 }}>User authentication flow</span>
        <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
        <div className="flex items-center gap-1" title="Requirement Quality Score">
          <span style={{ fontSize: 10, color: T.t4 }}>Quality</span>
          <span className="w-2 h-2 rounded-full" style={{ background: T.amber }} />
          <span style={{ fontSize: 11, color: T.amber, fontWeight: 500 }}>72%</span>
        </div>
        <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
        <div className="flex items-center gap-1">
          <File size={10} style={{ color: T.t4 }} />
          <span style={{ fontSize: 11, color: T.t3 }}>1 file</span>
        </div>
        <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
        <span style={{ fontSize: 11, color: T.t3 }}>4,200 chars</span>
      </>}
      {entry === "j2" && <>
        <span style={{ fontSize: 12, color: T.t2 }}>User authentication flow</span>
        <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
        <div className="flex items-center gap-1">
          <File size={10} style={{ color: T.t4 }} />
          <span style={{ fontSize: 11, color: T.t3 }}>1 file</span>
        </div>
        <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
        <span style={{ fontSize: 11, color: T.t3 }}>4,200 chars</span>
      </>}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Button variant="secondary" onClick={onExpand}>
        Edit input <ChevronDown size={10} />
      </Button>
      {!generating ? (
        <Button variant="primary" icon={Sparkles} onClick={onGenerate}>
          Generate
        </Button>
      ) : (
        <span className="flex items-center gap-1.5 px-3 py-1.5" style={{ fontSize: 12, color: T.brand, fontWeight: 500 }}>
          <Sparkles size={13} className="animate-kai-sparkle" /> Kai is generating...
        </span>
      )}
    </div>
  </div>
);

export const InputExpanded = ({ entry, onCollapse, onGenerate, text, setText, files, setFiles }) => (
  <div className="shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
    <div className="flex items-center justify-between px-5 py-2" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
      <div className="flex items-center gap-2">
        <Sparkles size={13} style={{ color: T.purple }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: T.t1 }}>Generation Input</span>
      </div>
      <button onClick={onCollapse} className="p-1 rounded-md" style={{ color: T.t4 }}
        onMouseEnter={e => e.currentTarget.style.color = T.t1}
        onMouseLeave={e => e.currentTarget.style.color = T.t4}>
        <ChevronUp size={14} />
      </button>
    </div>
    <div className="px-5 py-3" style={{ maxHeight: 340, overflowY: "auto" }}>
      {/* Context source */}
      <div className="mb-3">
        <label style={{ fontSize: 11, fontWeight: 500, color: T.t3, display: "block", marginBottom: 4 }}>Context source</label>
        {entry === "j1" ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.accentLight, border: `1px solid ${T.accentBorder}` }}>
            <Link2 size={12} style={{ color: T.brand }} />
            <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>TO-8526</span>
            <span style={{ fontSize: 12, color: T.t1 }}>User authentication flow</span>
            <div className="flex items-center gap-1 ml-2" title="Requirement Quality Score">
              <span style={{ fontSize: 10, color: T.t4 }}>Quality</span>
              <span className="w-2 h-2 rounded-full" style={{ background: T.amber }} />
              <span style={{ fontSize: 11, color: T.amber, fontWeight: 500 }}>72%</span>
            </div>
          </div>
        ) : (
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-md transition-colors" style={{ border: `1px solid ${T.bd}`, background: T.bg, textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.brand}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.bd}>
            <Link2 size={12} style={{ color: T.t4 }} />
            <span style={{ fontSize: 12, color: T.t4 }}>+ Link a requirement (optional)</span>
          </button>
        )}
      </div>
      {/* Textarea */}
      <div className="mb-3">
        <label style={{ fontSize: 11, fontWeight: 500, color: T.t3, display: "block", marginBottom: 4 }}>Describe your requirements</label>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Paste requirement text, user story, or describe the feature you want to test..."
          rows={entry === "j1" ? 3 : 5}
          className="w-full outline-none resize-none"
          style={{ fontSize: 12, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 6, padding: "8px 10px", lineHeight: 1.6 }}
          onFocus={e => e.currentTarget.style.boxShadow = `inset 0 0 0 1.5px ${T.brand}`}
          onBlur={e => e.currentTarget.style.boxShadow = "none"} />
        <div className="flex items-center justify-between mt-1.5">
          <span style={{ fontSize: 10, color: T.t4 }}>{text.length} / 32,000</span>
          {text.length > 20 && !generating && (
            <div className="flex items-center gap-1.5">
              <Sparkles size={9} className="animate-pulse" style={{ color: T.brand }} />
              <span style={{ fontSize: 9, color: T.brand, fontWeight: 500 }}>Kai is analyzing your intent...</span>
            </div>
          )}
        </div>
      </div>
      {/* Files */}
      <div className="mb-3">
        <label style={{ fontSize: 11, fontWeight: 500, color: T.t3, display: "block", marginBottom: 4 }}>Attachments</label>
        {files.length > 0 ? files.map((f, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-md mb-1" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
            <File size={11} style={{ color: T.brand }} />
            <span style={{ fontSize: 11, color: T.t1, fontWeight: 500 }}>{f.name}</span>
            <span style={{ fontSize: 10, color: T.t4 }}>{f.size}</span>
            <div className="flex-1" />
            <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ color: T.t4 }}
              onMouseEnter={e => e.currentTarget.style.color = T.red}
              onMouseLeave={e => e.currentTarget.style.color = T.t4}><X size={10} /></button>
          </div>
        )) : (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer transition-colors"
            style={{ border: `1px dashed ${T.bd}`, background: T.hover }}
            onClick={() => setFiles([{ name: "auth-flow-spec.pdf", size: "1.2 MB" }])}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.background = T.hover; }}>
            <Upload size={13} style={{ color: T.t4 }} />
            <span style={{ fontSize: 12, color: T.t3 }}>Drop files or click to browse</span>
            <span style={{ fontSize: 10, color: T.t4, marginLeft: "auto" }}>Max 10 MB</span>
          </div>
        )}
      </div>
      {/* Bottom row: format + folder + generate */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <label style={{ fontSize: 10, color: T.t4, fontWeight: 500, display: "block", marginBottom: 2 }}>Output format</label>
            <select style={{ fontSize: 11, fontWeight: 400, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 4, padding: "3px 6px" }}>
              <option>With test steps</option><option>Without steps</option><option>BDD / Gherkin</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: T.t4, fontWeight: 500, display: "block", marginBottom: 2 }}>Target folder</label>
            <select style={{ fontSize: 11, fontWeight: 400, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 4, padding: "3px 6px" }}>
              {MOCK_FOLDERS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <Button variant="primary" icon={Sparkles} onClick={onGenerate}>
          Generate
        </Button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   CLARIFICATION CARD
   ═══════════════════════════════════════════════════════════════ */
export const ClarCard = ({ c, onResolve }) => {
  const done = c.resolved !== null && c.resolved !== undefined;
  return (
    <div className="rounded-lg mb-2" style={{ border: `1px solid ${done ? "rgba(22,163,74,0.15)" : "rgba(217,119,6,0.18)"}`, background: done ? "rgba(22,163,74,0.02)" : "rgba(217,119,6,0.02)" }}>
      <div className="flex items-start gap-2 px-3 py-2.5">
        {done ? <CheckCircle2 size={12} style={{ color: T.green, marginTop: 2, flexShrink: 0 }} />
              : <AlertTriangle size={12} style={{ color: T.amber, marginTop: 2, flexShrink: 0 }} />}
        <div className="flex-1">
          <div style={{ fontSize: 11, fontWeight: 500, color: T.t1, lineHeight: 1.45 }}>{c.q}</div>
          {!done ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {c.opts.map((o, i) => (
                <button key={i} onClick={() => onResolve(c.id, i)} className="px-2 py-1 rounded-md transition-colors"
                  style={{ fontSize: 10, color: T.t2, background: T.card, border: `1px solid ${T.bd}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.brand; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.color = T.t2; }}>
                  {o}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-1.5">
              <span style={{ fontSize: 10, color: T.green, fontWeight: 500 }}>{c.opts[c.resolved]}</span>
              <button onClick={() => onResolve(c.id, null)} style={{ fontSize: 10, color: T.t4, textDecoration: "underline" }}>change</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DETAIL PANEL (right side when TC selected)
   ═══════════════════════════════════════════════════════════════ */
export const DetailPanel = ({ tc, onClose, onAccept, onReject }) => {
  if (!tc) return null;
  const confColor = tc.confidence === "high" ? "rgba(22,163,74," : tc.confidence === "medium" ? "rgba(217,119,6," : "rgba(220,38,38,";
  return (
    <RightDrawer title="Test Case Detail" onClose={onClose} width={380}>
      <div className="px-4 py-3">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: T.t1, marginBottom: 4, lineHeight: 1.4 }}>{tc.name}</h3>
        {/* Feature area + priority */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <FolderOpen size={10} style={{ color: T.t4 }} />
            <span style={{ fontSize: 10, color: T.t3 }}>{tc.area || "Uncategorized"}</span>
          </div>
          <span style={{ color: T.bd }}>|</span>
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 10, color: T.t4 }}>Priority</span>
            <PriBadge level={tc.priority} />
          </div>
          {tc.tags && tc.tags.length > 0 && <>
            <span style={{ color: T.bd }}>|</span>
            <div className="flex items-center gap-1">
              {tc.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-1.5 py-px rounded"
                  style={{ fontSize: 9, fontWeight: 500, color: T.t3, background: T.muted, border: `1px solid ${T.bdLight}`, lineHeight: "14px" }}>
                  {tag}
                </span>
              ))}
            </div>
          </>}
        </div>
        {/* AI Confidence */}
        <div className="rounded-md p-2.5 mb-3" style={{ background: `${confColor}0.04)`, border: `1px solid ${confColor}0.12)` }}>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={11} style={{ color: `${confColor}0.8)` }} strokeWidth={1.5} />
            <span style={{ fontSize: 10, fontWeight: 600, color: T.t3, textTransform: "uppercase", letterSpacing: 0.3 }}>AI Confidence</span>
            <ConfBadge level={tc.confidence} />
          </div>
          <div style={{ fontSize: 11, color: T.t2, lineHeight: 1.5 }}>{tc.confExplanation}</div>
        </div>
        {/* Objective */}
        <div className="mb-3">
          <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Objective</div>
          <div style={{ fontSize: 11, color: T.t2, lineHeight: 1.5 }}>{tc.objective}</div>
        </div>
        {/* Preconditions */}
        <div className="mb-3">
          <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Preconditions</div>
          <div style={{ fontSize: 11, color: T.t2, lineHeight: 1.5 }}>{tc.preconditions}</div>
        </div>
        {/* Steps */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2.5">
            <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Test Steps ({tc.stepsData?.length})</span>
            <button className="flex items-center gap-1 hover:underline" style={{ fontSize: 10, color: T.brand }}><Pencil size={9} /> Edit</button>
          </div>
          <div className="space-y-4">
            {tc.stepsData?.map((s, i) => (
              <div key={i} className="group relative pl-6">
                {/* Step number */}
                <div className="absolute left-0 top-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: T.bg, border: `1px solid ${T.bdLight}`, fontSize: 9, color: T.t3, fontWeight: 600 }}>
                  {i + 1}
                </div>
                {/* Action */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div style={{ fontSize: 11, color: T.t1, fontWeight: 500, lineHeight: 1.5 }}>
                    {s.action}
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(s.action + "\n" + s.expected); }}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Copy Step">
                    <ClipboardList size={11} />
                  </button>
                </div>
                {/* Expected Result Bubble */}
                <div className="rounded-md p-2" style={{ background: "rgba(94,106,210,0.03)", border: `1px solid ${T.accentBorder}`, borderLeft: `2px solid ${T.brand}` }}>
                  <div style={{ fontSize: 9, color: T.brand, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>Expected Result</div>
                  <div style={{ fontSize: 11, color: T.t2, lineHeight: 1.45 }}>{s.expected}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${T.bdLight}` }}>
          <button onClick={() => onAccept(tc.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors"
            style={{ background: "rgba(22,163,74,0.08)", color: T.green, fontSize: 11, fontWeight: 500, border: "1px solid rgba(22,163,74,0.2)" }}>
            <Check size={12} /> Accept
          </button>
          <button onClick={() => onReject(tc.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors"
            style={{ color: T.t3, fontSize: 11, border: `1px solid ${T.bd}` }}>
            <X size={12} /> Reject
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ fontSize: 10, color: T.brand, border: `1px solid ${T.accentBorder}` }}>
            <RotateCcw size={10} /> Regenerate
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ fontSize: 10, color: T.brand }}>
            <Sparkles size={9} /> Ask Kai <ExternalLink size={7} />
          </button>
        </div>
        {/* Feedback */}
        <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: `1px solid ${T.bdLight}` }}>
          <span style={{ fontSize: 9, color: T.t4 }}>Was this test case helpful?</span>
          <IBtn title="Helpful"><ThumbsUp size={11} strokeWidth={1.4} /></IBtn>
          <IBtn title="Not helpful"><ThumbsDown size={11} strokeWidth={1.4} /></IBtn>
        </div>
      </div>
    </RightDrawer>
  );
};
