import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Check, CheckCircle2, ChevronDown, ChevronUp, Database, ExternalLink, File, FolderOpen, Link2, Loader2, PanelLeftClose, PanelLeftOpen, Pencil, Play, RotateCcw, ShieldCheck, Sparkles, ThumbsDown, ThumbsUp, Upload, Users, X, Zap, CalendarDays, UserRound } from 'lucide-react';
import { T } from '../../../utils/design-system';
import { ConfBadge, PriBadge, IBtn, Button, RightDrawer } from '../../../components/shared';
import { ALL_CASES, PIPELINE_STEPS, MOCK_FOLDERS, MOCK_REQUIREMENT_DETAIL, MOCK_REQUIREMENT_GAPS } from '../data/mockData';

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
export const PipelineBar = ({ step, done, onCollapse }) => (
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
      {onCollapse && (
        <button onClick={onCollapse} className="p-1 rounded-md transition-colors ml-1" style={{ color: T.t4 }}
          onMouseEnter={e => { e.currentTarget.style.color = T.t1; e.currentTarget.style.background = T.muted; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.background = "transparent"; }}>
          <X size={12} />
        </button>
      )}
    </>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SETUP PAGE — full-workspace centered form for the idle state.
   The form IS the task; no header bar, no collapse, no dead zone.
   ═══════════════════════════════════════════════════════════════ */
export const SetupPage = ({ entry, onGenerate, text, setText, files, setFiles }) => (
  <div className="flex-1 overflow-y-auto" style={{ background: T.bg }}>
    <div className="mx-auto py-10 px-6" style={{ maxWidth: 600 }}>
      {/* Context source */}
      <div className="mb-5">
        <label style={{ fontSize: 11, fontWeight: 500, color: T.t3, display: "block", marginBottom: 6 }}>Context source</label>
        {entry === "j1" ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-md" style={{ background: T.accentLight, border: `1px solid ${T.accentBorder}` }}>
            <Link2 size={12} style={{ color: T.brand }} />
            <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>TO-8526</span>
            <span style={{ fontSize: 12, color: T.t1 }}>User authentication flow</span>
            <div className="flex items-center gap-1 ml-auto" title="Requirement quality score">
              <span style={{ fontSize: 10, color: T.t4 }}>Quality</span>
              <span className="w-2 h-2 rounded-full" style={{ background: T.amber }} />
              <span style={{ fontSize: 11, color: T.amber, fontWeight: 500 }}>72%</span>
            </div>
          </div>
        ) : (
          <button className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md transition-colors"
            style={{ border: `1px solid ${T.bd}`, background: T.card, textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.brand}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.bd}>
            <Link2 size={12} style={{ color: T.t4 }} />
            <span style={{ fontSize: 12, color: T.t4 }}>+ Link a requirement (optional)</span>
          </button>
        )}
      </div>
      {/* Textarea */}
      <div className="mb-5">
        <label style={{ fontSize: 11, fontWeight: 500, color: T.t3, display: "block", marginBottom: 6 }}>Describe your requirements</label>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Paste requirement text, user story, or describe the feature you want to test..."
          rows={6}
          className="w-full outline-none resize-none"
          style={{ fontSize: 12, color: T.t2, background: T.card, border: `1px solid ${T.bd}`, borderRadius: 6, padding: "10px 12px", lineHeight: 1.6 }}
          onFocus={e => e.currentTarget.style.boxShadow = `inset 0 0 0 1.5px ${T.brand}`}
          onBlur={e => e.currentTarget.style.boxShadow = "none"} />
        <div className="flex items-center justify-between mt-1.5">
          <span style={{ fontSize: 10, color: T.t4 }}>{text.length} / 32,000</span>
          {text.length > 20 && (
            <div className="flex items-center gap-1.5">
              <Sparkles size={9} className="animate-pulse" style={{ color: T.brand }} />
              <span style={{ fontSize: 9, color: T.brand, fontWeight: 500 }}>Kai is analyzing your intent...</span>
            </div>
          )}
        </div>
      </div>
      {/* Attachments */}
      <div className="mb-5">
        <label style={{ fontSize: 11, fontWeight: 500, color: T.t3, display: "block", marginBottom: 6 }}>Attachments</label>
        {files.length > 0 ? files.map((f, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-md mb-1.5" style={{ background: T.card, border: `1px solid ${T.bdLight}` }}>
            <File size={11} style={{ color: T.brand }} />
            <span style={{ fontSize: 11, color: T.t1, fontWeight: 500 }}>{f.name}</span>
            <span style={{ fontSize: 10, color: T.t4 }}>{f.size}</span>
            <div className="flex-1" />
            <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ color: T.t4 }}
              onMouseEnter={e => e.currentTarget.style.color = T.red}
              onMouseLeave={e => e.currentTarget.style.color = T.t4}><X size={10} /></button>
          </div>
        )) : (
          <div className="flex items-center gap-2 px-3 py-3 rounded-md cursor-pointer transition-colors"
            style={{ border: `1px dashed ${T.bd}`, background: T.card }}
            onClick={() => setFiles([{ name: "auth-flow-spec.pdf", size: "1.2 MB" }])}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.background = T.card; }}>
            <Upload size={13} style={{ color: T.t4 }} />
            <span style={{ fontSize: 12, color: T.t3 }}>Drop files or click to browse</span>
            <span style={{ fontSize: 10, color: T.t4, marginLeft: "auto" }}>Max 10 MB</span>
          </div>
        )}
      </div>
      {/* Generation settings */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <label style={{ fontSize: 10, color: T.t4, fontWeight: 500, display: "block", marginBottom: 4 }}>Output format</label>
          <select style={{ fontSize: 11, fontWeight: 400, color: T.t2, background: T.card, border: `1px solid ${T.bd}`, borderRadius: 4, padding: "4px 8px" }}>
            <option>With test steps</option><option>Without steps</option><option>BDD / Gherkin</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 10, color: T.t4, fontWeight: 500, display: "block", marginBottom: 4 }}>Target folder</label>
          <select style={{ fontSize: 11, fontWeight: 400, color: T.t2, background: T.card, border: `1px solid ${T.bd}`, borderRadius: 4, padding: "4px 8px" }}>
            {MOCK_FOLDERS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
      </div>
      {/* Single primary CTA */}
      <button onClick={onGenerate}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md transition-all"
        style={{ background: T.brand, color: "#fff", fontSize: 13, fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.background = T.accent}
        onMouseLeave={e => e.currentTarget.style.background = T.brand}>
        <Sparkles size={14} /> Generate Test Cases
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   REQUIREMENT REFERENCE PANEL — persistent left-side panel for J1.
   Shows full description, attachments (clickable), and gap hints.
   Mirrors ReqDetailPage's left-side position for spatial continuity.
   Collapses to 24px rail; Kai drawer stays on right unobstructed.
   ═══════════════════════════════════════════════════════════════ */
const ClarificationsSection = ({ clars }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 w-full mb-1.5">
        <CheckCircle2 size={10} style={{ color: T.green }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Clarifications ({clars.length})
        </span>
        <ChevronDown size={10} style={{ color: T.t4, marginLeft: "auto", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div className="space-y-2">
          {clars.map(c => (
            <div key={c.id} className="px-2.5 py-2 rounded-md" style={{ background: "rgba(22,163,74,0.04)", border: "1px solid rgba(22,163,74,0.12)" }}>
              <div style={{ fontSize: 10, color: T.t3, lineHeight: 1.45, marginBottom: 3 }}>{c.q}</div>
              <div className="flex items-center gap-1">
                <Check size={9} style={{ color: T.green }} strokeWidth={2.5} />
                <span style={{ fontSize: 11, color: T.green, fontWeight: 500 }}>{c.opts[c.resolved]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const RequirementReferencePanel = ({ mode = "j1", description = "", files, collapsed, onToggle, onPdfOpen, showGaps, clars = [] }) => {
  const req = MOCK_REQUIREMENT_DETAIL;
  const isJ1 = mode === "j1";
  const answeredClars = clars.filter(c => c.resolved !== null && c.resolved !== undefined);

  const descriptionText = isJ1 ? req.description : description;

  const allFiles = isJ1
    ? (() => {
        const reqAttachments = [{ name: "auth-flow-spec.pdf", size: "1.2 MB" }];
        return [...reqAttachments, ...files.filter(f => !reqAttachments.some(r => r.name === f.name))];
      })()
    : files;

  return (
    <div className="flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300"
      style={{
        width: collapsed ? 24 : 280,
        background: T.card,
        borderRight: `1px solid ${T.bd}`,
      }}>
      {collapsed ? (
        /* Rail mode — toggle strip with optional clarification badge */
        <div className="flex flex-col items-center pt-3 gap-2">
          <button onClick={onToggle}
            className="p-1 rounded transition-colors"
            style={{ color: T.t4 }}
            title="Expand reference panel"
            onMouseEnter={e => { e.currentTarget.style.color = T.brand; e.currentTarget.style.background = T.accentLight; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.background = "transparent"; }}>
            <PanelLeftOpen size={14} strokeWidth={1.5} />
          </button>
          {answeredClars.length > 0 && (
            <div className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: T.brand, fontSize: 8, color: "#fff", fontWeight: 700 }}
              title={`${answeredClars.length} clarification${answeredClars.length > 1 ? "s" : ""} answered`}>
              {answeredClars.length}
            </div>
          )}
        </div>
      ) : (
        /* Expanded mode */
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 shrink-0" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
            {isJ1 ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <Link2 size={10} style={{ color: T.brand, flexShrink: 0 }} strokeWidth={1.5} />
                <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 600, flexShrink: 0 }}>{req.key}</span>
                <span style={{ fontSize: 10, color: T.t4, flexShrink: 0 }}>·</span>
                <span style={{ fontSize: 10, color: T.t3, flexShrink: 0 }}>{req.type}</span>
                <span style={{ fontSize: 10, color: T.t4, flexShrink: 0 }}>·</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.amber }} />
                  <span style={{ fontSize: 10, color: T.amber, fontWeight: 500 }}>{req.qualityScore}%</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <File size={10} style={{ color: T.t3, flexShrink: 0 }} strokeWidth={1.5} />
                <span style={{ fontSize: 11, fontWeight: 600, color: T.t2 }}>Your context</span>
              </div>
            )}
            <button onClick={onToggle}
              className="p-1 rounded transition-colors ml-1"
              style={{ color: T.t4, flexShrink: 0 }}
              title="Collapse reference panel"
              onMouseEnter={e => { e.currentTarget.style.color = T.t1; e.currentTarget.style.background = T.muted; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.background = "transparent"; }}>
              <PanelLeftClose size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Title — J1 only */}
          {isJ1 && (
            <div className="px-3 pt-2.5 pb-1.5 shrink-0">
              <div style={{ fontSize: 12, fontWeight: 600, color: T.t1, lineHeight: 1.4 }}>{req.title}</div>
              <div style={{ fontSize: 10, color: T.t3, marginTop: 2 }}>{req.status}</div>
            </div>
          )}

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-3 pb-3" style={{ paddingTop: isJ1 ? 0 : 10 }}>

            {/* Description */}
            {descriptionText && (
              <div className="mb-4">
                <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Description</div>
                <div style={{ fontSize: 11, color: T.t2, lineHeight: 1.6 }}>{descriptionText}</div>
              </div>
            )}

            {/* Attachments */}
            {allFiles.length > 0 && (
              <div className="mb-4">
                <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                  Attachments ({allFiles.length})
                </div>
                <div className="space-y-1">
                  {allFiles.map((f, i) => (
                    <button key={i} onClick={() => onPdfOpen?.(f.name)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-left transition-colors"
                      style={{ border: `1px solid ${T.bdLight}`, background: T.bg }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdLight; e.currentTarget.style.background = T.bg; }}>
                      <File size={11} style={{ color: T.brand, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: T.t1, fontWeight: 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                      {f.size && <span style={{ fontSize: 10, color: T.t4, flexShrink: 0, marginLeft: "auto" }}>{f.size}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clarifications — answered Q&A from generation phase */}
            {answeredClars.length > 0 && (
              <ClarificationsSection clars={answeredClars} />
            )}

            {/* Gaps — J1 only, shown only during setup */}
            {isJ1 && showGaps && MOCK_REQUIREMENT_GAPS.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-2">
                  <AlertTriangle size={10} style={{ color: T.amber }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: T.amber, textTransform: "uppercase", letterSpacing: 0.5 }}>Gaps detected</span>
                </div>
                <div className="space-y-1.5">
                  {MOCK_REQUIREMENT_GAPS.map((gap, i) => (
                    <div key={i} className="flex items-start gap-2 px-2.5 py-1.5 rounded-md"
                      style={{ background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.14)" }}>
                      <span style={{ fontSize: 10, color: T.amber, flexShrink: 0, marginTop: 1 }}>•</span>
                      <span style={{ fontSize: 10, color: T.t2, lineHeight: 1.5 }}>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer — J1 only */}
          {isJ1 && (
            <div className="shrink-0 px-3 py-2" style={{ borderTop: `1px solid ${T.bdLight}` }}>
              <a href={req.url} onClick={e => e.preventDefault()}
                className="flex items-center gap-1"
                style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                Open full requirement <ExternalLink size={10} />
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   REQUIREMENT POPOVER — hover chip to peek at requirement context
   Only appears on J1. Schema-agnostic: shows key, type, status,
   title, quality, and free-form description (no AC assumption).
   ═══════════════════════════════════════════════════════════════ */
export const RequirementPopover = ({ children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const req = MOCK_REQUIREMENT_DETAIL;

  const truncate = (str, max) => str.length <= max ? str : str.slice(0, max).trimEnd() + "…";

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref} style={{ display: "inline-flex" }}>
      <div onClick={() => setOpen(o => !o)} style={{ cursor: "pointer", display: "inline-flex" }}>
        {children}
      </div>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 rounded-lg overflow-hidden"
          style={{ width: 320, background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
          <div className="flex items-center justify-between px-3 pt-3 pb-0">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", fontWeight: 600, color: T.brand }}>{req.key}</span>
              <span style={{ fontSize: 10, color: T.t4 }}>·</span>
              <span style={{ fontSize: 10, color: T.t3 }}>{req.type}</span>
              <span style={{ fontSize: 10, color: T.t4 }}>·</span>
              <span style={{ fontSize: 10, color: T.t3 }}>{req.status}</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-0.5 rounded" style={{ color: T.t4 }}
              onMouseEnter={e => e.currentTarget.style.color = T.t1}
              onMouseLeave={e => e.currentTarget.style.color = T.t4}>
              <X size={12} />
            </button>
          </div>
          <div className="px-3 pt-1.5 pb-3">
            <div style={{ fontSize: 12, fontWeight: 600, color: T.t1, marginBottom: 6, lineHeight: 1.4 }}>{req.title}</div>
            <div className="flex items-center gap-1 mb-3">
              <span style={{ fontSize: 10, color: T.t4 }}>Quality</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.amber }} />
              <span style={{ fontSize: 10, color: T.amber, fontWeight: 500 }}>{req.qualityScore}%</span>
            </div>
            {req.description && (
              <>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Description</div>
                <div style={{ fontSize: 11, color: T.t2, lineHeight: 1.55 }}>{truncate(req.description, 200)}</div>
              </>
            )}
          </div>
          <div style={{ borderTop: `1px solid ${T.bdLight}`, padding: "8px 12px" }}>
            <a href={req.url} className="flex items-center gap-1"
              style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}
              onClick={e => e.preventDefault()}>
              Open full requirement <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PDF VIEWER OVERLAY — lightweight modal for attachment preview
   ═══════════════════════════════════════════════════════════════ */
export const PdfViewerOverlay = ({ filename, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!filename) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}>
      <div className="rounded-xl overflow-hidden flex flex-col"
        style={{ width: 480, maxHeight: "70vh", background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
          <div className="flex items-center gap-2">
            <File size={13} style={{ color: T.brand }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: T.t1 }}>{filename}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" onClick={e => e.preventDefault()}
              className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
              style={{ fontSize: 11, color: T.brand, border: `1px solid ${T.accentBorder}` }}
              onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <ExternalLink size={10} /> Open in new tab
            </a>
            <button onClick={onClose} className="p-1 rounded-md transition-colors" style={{ color: T.t4 }}
              onMouseEnter={e => { e.currentTarget.style.color = T.t1; e.currentTarget.style.background = T.muted; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.background = "transparent"; }}>
              <X size={14} />
            </button>
          </div>
        </div>
        {/* Mock preview */}
        <div className="flex-1 overflow-y-auto p-4" style={{ background: T.bg }}>
          <div className="rounded-lg p-4" style={{ background: T.card, border: `1px solid ${T.bdLight}`, minHeight: 280 }}>
            {/* Simulated PDF page lines */}
            <div className="mb-3" style={{ height: 14, width: "60%", borderRadius: 3, background: T.muted }} />
            {[100, 85, 90, 75, 95, 70, 80].map((w, i) => (
              <div key={i} className="mb-2" style={{ height: 8, width: `${w}%`, borderRadius: 2, background: T.muted }} />
            ))}
            <div className="my-4" style={{ height: 1, background: T.bdLight }} />
            {[65, 90, 80, 70, 85].map((w, i) => (
              <div key={i} className="mb-2" style={{ height: 8, width: `${w}%`, borderRadius: 2, background: T.muted }} />
            ))}
            <div className="mt-4 flex items-center justify-center" style={{ color: T.t4 }}>
              <span style={{ fontSize: 11 }}>Preview — open in new tab for full document</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CONTEXT BAR — thin header shown during generation / review.
   J1: requirement chip (hover = popover), attachment chip (click = pdf overlay).
   Shows folder selector when showFolderSelect is true (workspace-done).
   ═══════════════════════════════════════════════════════════════ */
export const ContextBar = ({ entry, onEdit, generating, showFolderSelect, targetFolder, setTargetFolder, onPdfOpen }) => (
  <div className="flex items-center justify-between px-5 py-2 shrink-0"
    style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
    <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
      <Sparkles size={12} style={{ color: T.purple, flexShrink: 0 }} />
      {entry === "j1" && <>
        <RequirementPopover>
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md transition-colors"
            style={{ border: `1px solid ${T.bd}`, background: T.muted }}>
            <Link2 size={10} style={{ color: T.brand }} strokeWidth={1.5} />
            <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>TO-8526</span>
            <ChevronDown size={9} style={{ color: T.t4 }} />
          </div>
        </RequirementPopover>
        <span style={{ fontSize: 12, color: T.t2, whiteSpace: "nowrap" }}>User authentication flow</span>
        <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
        <div className="flex items-center gap-1" title="Requirement quality score">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.amber }} />
          <span style={{ fontSize: 10, color: T.amber, fontWeight: 500 }}>72%</span>
        </div>
        <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
        <button onClick={() => onPdfOpen?.("auth-flow-spec.pdf")}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors"
          style={{ border: `1px solid transparent` }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.background = T.muted; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}>
          <File size={10} style={{ color: T.t4 }} />
          <span style={{ fontSize: 10, color: T.t3 }}>auth-flow-spec.pdf</span>
        </button>
        <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
        <span style={{ fontSize: 10, color: T.t3 }}>4,200 chars</span>
      </>}
      {entry === "j2" && <>
        <span style={{ fontSize: 12, color: T.t2 }}>User authentication flow</span>
        <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
        <button onClick={() => onPdfOpen?.("auth-flow-spec.pdf")}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors"
          style={{ border: `1px solid transparent` }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.background = T.muted; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}>
          <File size={10} style={{ color: T.t4 }} />
          <span style={{ fontSize: 10, color: T.t3 }}>auth-flow-spec.pdf</span>
        </button>
        <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
        <span style={{ fontSize: 10, color: T.t3 }}>4,200 chars</span>
      </>}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {/* Folder selector — only in workspace-done */}
      {showFolderSelect && (
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 10, color: T.t4 }}>Target:</span>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ border: `1px solid ${T.bd}`, background: T.bg }}>
            <FolderOpen size={10} style={{ color: T.t4 }} />
            <select value={targetFolder} onChange={e => setTargetFolder(e.target.value)}
              style={{ fontSize: 11, fontWeight: 400, color: T.t2, background: "transparent", outline: "none", width: 150 }}>
              <option>Authentication Tests</option>
              {MOCK_FOLDERS.filter(f => f !== "Authentication Tests").map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
      )}
      {generating ? (
        <span className="flex items-center gap-1.5 px-3 py-1" style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}>
          <Sparkles size={12} className="animate-kai-sparkle" style={{ color: T.purple }} /> Kai is generating...
        </span>
      ) : (
        <button onClick={onEdit}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors"
          style={{ fontSize: 11, color: T.t3, border: `1px solid ${T.bd}`, background: "transparent" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.brand; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.color = T.t3; }}>
          <Pencil size={10} /> Edit input
        </button>
      )}
    </div>
  </div>
);

export const InputExpanded = ({ entry, onCollapse, onGenerate, text, setText, files, setFiles, generating }) => (
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
export const ClarCard = ({ c, onResolve, onPdfOpen }) => {
  const done = c.resolved !== null && c.resolved !== undefined;
  return (
    <div className="rounded-lg mb-2" style={{ border: `1px solid ${done ? "rgba(22,163,74,0.15)" : "rgba(217,119,6,0.18)"}`, background: done ? "rgba(22,163,74,0.02)" : "rgba(217,119,6,0.02)" }}>
      <div className="flex items-start gap-2 px-3 py-2.5">
        {done ? <CheckCircle2 size={12} style={{ color: T.green, marginTop: 2, flexShrink: 0 }} />
              : <AlertTriangle size={12} style={{ color: T.amber, marginTop: 2, flexShrink: 0 }} />}
        <div className="flex-1">
          <div style={{ fontSize: 11, fontWeight: 500, color: T.t1, lineHeight: 1.45 }}>{c.q}</div>
          {!done ? (
            <>
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
              {c.sourceRef && (
                <div className="flex items-center gap-1 mt-2">
                  <File size={9} style={{ color: T.t4 }} />
                  <span style={{ fontSize: 10, color: T.t4 }}>Source: {c.sourceRef.label}</span>
                  <button onClick={() => onPdfOpen?.(c.sourceRef.target)}
                    className="transition-colors"
                    style={{ fontSize: 10, color: T.brand, fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                    [Open]
                  </button>
                </div>
              )}
            </>
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
   CLARIFICATION CENTER — full-center hero for State 2 (Refining)
   ═══════════════════════════════════════════════════════════════ */
export const ClarificationCenter = ({ clars, onResolve, onSkip, onPdfOpen }) => {
  const pending = clars.filter(c => c.resolved === null);
  const resolvedCount = clars.filter(c => c.resolved !== null).length;
  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto py-10 px-4"
      style={{ background: T.bg }}>
      <div style={{ maxWidth: 540, width: "100%" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <AlertTriangle size={15} style={{ color: T.amber }} />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: T.t1 }}>
            Kai has {pending.length} question{pending.length !== 1 ? "s" : ""} for you
          </h2>
        </div>
        <p style={{ fontSize: 12, color: T.t3, marginBottom: 20, lineHeight: 1.55 }}>
          Answers improve the next generation round. You can skip any question.
        </p>
        <div className="space-y-2 mb-6">
          {clars.map(c => <ClarCard key={c.id} c={c} onResolve={onResolve} onPdfOpen={onPdfOpen} />)}
        </div>
        <div className="flex items-center justify-between">
          <button onClick={onSkip}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors"
            style={{ fontSize: 11, fontWeight: 500, color: T.brand, border: `1px solid ${T.accentBorder}`, background: "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <Sparkles size={11} /> Skip & Generate Anyway
          </button>
          {resolvedCount > 0 && (
            <span style={{ fontSize: 10, color: T.t4 }}>
              {resolvedCount} of {clars.length} answered
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SESSION COMPLETE CARD — shown when Review = 0, accepted > 0.
   Replaces the old sticky Save footer and PostSaveView page.
   ═══════════════════════════════════════════════════════════════ */
export const SessionCompleteCard = ({ accepted, folder, isJ1, onExecute, onExecuteAll, onGenerateMore }) => {
  const n = accepted.length;
  const nextSteps = [
    { icon: Play, title: `Execute these ${n} test cases`, desc: `Create a test run with just-saved TCs`, conf: `${Math.min(n, Math.floor(n * 0.6))} ready · ${Math.floor(n * 0.25)} review · ${n - Math.min(n, Math.floor(n * 0.6)) - Math.floor(n * 0.25)} manual`, onClick: onExecute },
    ...(isJ1 ? [{ icon: Play, title: `Execute all for TO-8526 (${n + 7} test cases)`, desc: `Includes 7 existing + ${n} just saved`, onClick: onExecuteAll }] : []),
    { icon: Sparkles, title: "Generate more test cases", desc: "Keep generating for uncovered areas", onClick: onGenerateMore },
  ];
  return (
    <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto p-8" style={{ background: T.bg }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <div className="rounded-lg p-5" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(22,163,74,0.08)", border: "1.5px solid rgba(22,163,74,0.2)" }}>
              <Check size={16} style={{ color: T.green }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.t1 }}>{n} test cases saved to {folder}</div>
              {isJ1 && <div style={{ fontSize: 11, color: T.brand, marginTop: 2 }}>Linked to TO-8526 · User authentication flow</div>}
            </div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Next steps</div>
          {nextSteps.map((opt, i) => (
            <div key={i} onClick={opt.onClick}
              className="rounded-md mb-2 p-3 cursor-pointer transition-colors"
              style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdLight; e.currentTarget.style.background = T.bg; }}>
              <div className="flex items-center gap-2">
                <opt.icon size={14} style={{ color: opt.icon === Sparkles ? T.purple : T.brand }} strokeWidth={1.6} />
                <span style={{ fontSize: 12, fontWeight: 500, color: T.t1 }}>{opt.title}</span>
              </div>
              <div style={{ fontSize: 11, color: T.t3, marginTop: 2, marginLeft: 22 }}>{opt.desc}</div>
              {opt.conf && (
                <div style={{ fontSize: 10, color: T.t4, marginTop: 4, marginLeft: 22 }}>AI Confidence: {opt.conf}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EXECUTE MODAL — confirm before creating test run.
   Cancel returns user to Accepted tab (not SessionCompleteCard dead-end).
   ═══════════════════════════════════════════════════════════════ */
export const ExecuteModal = ({ config, accepted = [], folder, reviewRemaining, isJ1, onConfirm, onCancel }) => {
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const defaultName = isJ1
    ? `TO-8526 Auth Flow — ${today}`
    : `Authentication Tests — ${today}`;
  const [runName, setRunName] = useState(defaultName);

  const highConf = accepted.filter(c => c.confidence === "high").length;
  const medConf  = accepted.filter(c => c.confidence === "medium").length;
  const lowConf  = accepted.filter(c => c.confidence === "low").length;

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  if (!config) return null;
  const { count, includesExisting } = config;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}>
      <div className="rounded-xl overflow-hidden flex flex-col"
        style={{ width: 460, background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
          <div className="flex items-center gap-2">
            <Play size={14} style={{ color: T.brand }} strokeWidth={1.6} />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.t1 }}>Create test run</span>
          </div>
          <button onClick={onCancel} className="p-1 rounded-md transition-colors" style={{ color: T.t4 }}
            onMouseEnter={e => { e.currentTarget.style.color = T.t1; e.currentTarget.style.background = T.muted; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.background = "transparent"; }}>
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Run name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: T.t3, display: "block", marginBottom: 4 }}>Run name</label>
            <input
              value={runName}
              onChange={e => setRunName(e.target.value)}
              className="w-full outline-none"
              style={{ fontSize: 12, color: T.t1, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 6, padding: "7px 10px" }}
              onFocus={e => e.currentTarget.style.boxShadow = `inset 0 0 0 1.5px ${T.brand}`}
              onBlur={e => e.currentTarget.style.boxShadow = "none"}
            />
          </div>

          {/* Summary row */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
            <div className="flex items-center gap-1.5">
              <Check size={12} style={{ color: T.green }} strokeWidth={2.5} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.t1 }}>{count} test cases</span>
            </div>
            <span style={{ color: T.bdLight }}>·</span>
            <div className="flex items-center gap-1">
              <FolderOpen size={11} style={{ color: T.t4 }} />
              <span style={{ fontSize: 11, color: T.t3 }}>{folder}</span>
            </div>
            {isJ1 && <>
              <span style={{ color: T.bdLight }}>·</span>
              <span style={{ fontSize: 11, color: T.brand, fontFamily: "ui-monospace, monospace", fontWeight: 500 }}>TO-8526</span>
            </>}
            {includesExisting && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium ml-auto"
                style={{ background: T.accentLight, color: T.brand, border: `1px solid ${T.accentBorder}` }}>
                incl. existing
              </span>
            )}
          </div>

          {/* AI confidence breakdown */}
          {accepted.length > 0 && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: T.t3, display: "block", marginBottom: 6 }}>AI confidence</label>
              <div className="px-3 py-2.5 rounded-lg" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: T.green }} />
                    <span style={{ fontSize: 11, color: T.t2 }}>High</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.t1 }}>{highConf}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: T.amber }} />
                    <span style={{ fontSize: 11, color: T.t2 }}>Medium</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.t1 }}>{medConf}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: T.red }} />
                    <span style={{ fontSize: 11, color: T.t2 }}>Low</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.t1 }}>{lowConf}</span>
                  </div>
                </div>
                {/* Confidence bar */}
                <div className="flex rounded-full overflow-hidden mb-2" style={{ height: 4, gap: 1 }}>
                  {highConf > 0 && <div style={{ flex: highConf, background: T.green }} />}
                  {medConf  > 0 && <div style={{ flex: medConf,  background: T.amber }} />}
                  {lowConf  > 0 && <div style={{ flex: lowConf,  background: T.red   }} />}
                </div>
                <div style={{ fontSize: 10, color: T.t3 }}>
                  {highConf} of {accepted.length} cases fully specified — ready to run
                  {lowConf > 0 && <span style={{ color: T.amber }}> · {lowConf} need manual review before running</span>}
                </div>
              </div>
            </div>
          )}

          {/* Assignee + Due date (mock) */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={{ fontSize: 11, fontWeight: 500, color: T.t3, display: "block", marginBottom: 4 }}>Assignee</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ border: `1px solid ${T.bd}`, background: T.bg }}>
                <UserRound size={11} style={{ color: T.t4 }} />
                <select style={{ fontSize: 11, fontWeight: 400, color: T.t2, background: "transparent", outline: "none", flex: 1 }}>
                  <option>Huy Dao</option>
                  <option>Anh Le</option>
                  <option>Minh Tran</option>
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label style={{ fontSize: 11, fontWeight: 500, color: T.t3, display: "block", marginBottom: 4 }}>Due date</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ border: `1px solid ${T.bd}`, background: T.bg }}>
                <CalendarDays size={11} style={{ color: T.t4 }} />
                <span style={{ fontSize: 11, color: T.t3 }}>No due date</span>
              </div>
            </div>
          </div>

          {/* Warning if review cases remain */}
          {reviewRemaining > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.15)" }}>
              <AlertTriangle size={11} style={{ color: T.amber, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11, color: T.t2, lineHeight: 1.5 }}>
                <strong style={{ color: T.amber }}>{reviewRemaining} cases</strong> still in Review will not be included in this run.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: `1px solid ${T.bdLight}` }}>
          <button onClick={onCancel}
            className="px-3.5 py-1.5 rounded-md transition-colors"
            style={{ fontSize: 12, color: T.t3, border: `1px solid ${T.bd}` }}
            onMouseEnter={e => e.currentTarget.style.background = T.muted}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            Cancel
          </button>
          <button onClick={() => onConfirm(runName)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors"
            style={{ fontSize: 12, fontWeight: 500, color: "#fff", background: T.brand }}
            onMouseEnter={e => e.currentTarget.style.background = T.accent}
            onMouseLeave={e => e.currentTarget.style.background = T.brand}>
            <Play size={12} /> Start Execution
          </button>
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

        {/* Properties (Metadata) */}
        <div className="grid grid-cols-2 gap-y-2 mb-3 px-3 py-2.5 rounded-md" style={{ background: T.muted, border: `1px solid ${T.bdLight}` }}>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.t4 }} />
            <span style={{ fontSize: 10, color: T.t4 }}>Status:</span>
            <span style={{ fontSize: 10, color: T.t2, fontWeight: 500 }}>Draft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={10} style={{ color: T.t4 }} />
            <span style={{ fontSize: 10, color: T.t4 }}>Assignee:</span>
            <span style={{ fontSize: 10, color: T.t2, fontWeight: 500 }}>Unassigned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={10} style={{ color: T.brand }} />
            <span style={{ fontSize: 10, color: T.t4 }}>Exec Type:</span>
            <span style={{ fontSize: 10, color: T.t2, fontWeight: 500 }}>Automated</span>
          </div>
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
          <div className="space-y-3">
            {tc.stepsData?.map((s, i) => (
              <div key={i} className="group relative pl-6">
                {/* Step number */}
                <div className="absolute left-0 top-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: T.bg, border: `1px solid ${T.bdLight}`, fontSize: 9, color: T.t3, fontWeight: 600 }}>
                  {i + 1}
                </div>
                {/* Action */}
                <div style={{ fontSize: 11, color: T.t1, fontWeight: 500, lineHeight: 1.5, marginBottom: 3 }}>
                  {s.action}
                </div>
                {/* Expected Result */}
                <div className="flex items-start gap-1.5" style={{ paddingLeft: 2 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: T.brand, marginTop: 1, whiteSpace: "nowrap" }}>→</span>
                  <span style={{ fontSize: 10.5, color: T.t3, lineHeight: 1.45 }}>{s.expected}</span>
                </div>
                {/* Test Data */}
                {s.data && (
                  <div className="flex items-start gap-1.5 mt-1" style={{ paddingLeft: 2 }}>
                    <Database size={9} style={{ color: T.purple, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: T.purple, fontFamily: "ui-monospace, monospace", lineHeight: 1.4 }}>{s.data}</span>
                  </div>
                )}
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
