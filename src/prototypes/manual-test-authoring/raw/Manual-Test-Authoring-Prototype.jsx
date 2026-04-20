import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Home, ClipboardList, FlaskConical, Package, Play, BarChart3, Cloud, Settings,
  Bell, ChevronDown, ChevronRight, Sparkles, Bold, Italic, Link2, List, Image,
  Undo2, Redo2, GripVertical, Trash2, Plus, Check, X, MoreHorizontal,
  Copy, FileText, Tag, GitBranch, ThumbsUp, ThumbsDown, AlertTriangle,
  Pencil, Move, ExternalLink, Code2, PanelRightClose, PanelRightOpen,
  Paperclip, Clock, Shield, Eye, Target, Zap, MessageSquare, File,
  ImageIcon, FileSpreadsheet
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TOKENS
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bg: "#f7f8fa", card: "#ffffff", muted: "#f3f4f6", hover: "#f9fafb", pressed: "#eef0f2",
  sidebar: "#ffffff", sidebarBd: "#e5e7eb", sidebarIcon: "#9ca3af", sidebarIconHover: "#374151", sidebarActive: "#5e6ad2",
  t1: "#111827", t2: "#374151", t3: "#6b7280", t4: "#9ca3af",
  brand: "#5e6ad2", accent: "#4f46e5", accentLight: "rgba(79,70,229,0.07)", accentBorder: "rgba(79,70,229,0.18)",
  green: "#16a34a", red: "#dc2626", amber: "#d97706", purple: "#7c3aed",
  bd: "#e5e7eb", bdLight: "#f0f0f2",
};
const F = { fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontFeatureSettings: '"cv01","ss03"' };

/* ═══════════════════════════════════════════════════════════════
   QUALITY ENGINE — single source of truth for scores + step issues
   ═══════════════════════════════════════════════════════════════ */
function computeQuality(steps) {
  if (!steps.length) return { overall: 0, label: "No Steps", color: T.red, dimensions: { completeness: 0, clarity: 0, coverage: 0, executability: 0 }, stepIssues: [] };
  const issues = [];
  let complSum = 0, clarSum = 0, execSum = 0;
  steps.forEach(s => {
    let compl = 0, clar = 0, exec = 0;
    if (s.step) compl += 40; if (s.exp) compl += 40; if (s.data) compl += 20;
    if (!s.exp && s.step) issues.push({ stepId: s.id, source: "quality", type: "missing_expected", severity: "warning", msg: "Missing expected result", dimension: "completeness", field: "exp" });
    if (s.step && s.step.length < 15) { clar = 30; issues.push({ stepId: s.id, source: "quality", type: "vague_step", severity: "info", msg: "Step description is vague — add specifics", dimension: "clarity", field: "step" }); }
    else if (s.step && s.step.length < 30) clar = 60;
    else if (s.step) clar = 90;
    if (s.step && (/click|navigate|enter|verify|check|select|open|type/i.test(s.step))) exec = 90;
    else if (s.step) exec = 50;
    else exec = 0;
    complSum += compl; clarSum += clar; execSum += exec;
  });
  const completeness = Math.round(complSum / steps.length);
  const clarity = Math.round(clarSum / steps.length);
  const coverage = Math.min(100, Math.round(steps.length * 12 + (steps.some(s => /invalid|empty|error|wrong|negative|fail/i.test(s.step + s.exp)) ? 25 : 0)));
  const executability = Math.round(execSum / steps.length);
  const overall = Math.round((completeness * 0.3 + clarity * 0.25 + coverage * 0.2 + executability * 0.25));
  const label = overall >= 80 ? "Good" : overall >= 50 ? "Fair" : "Poor";
  const color = overall >= 80 ? T.green : overall >= 50 ? T.amber : T.red;
  return { overall, label, color, dimensions: { completeness, clarity, coverage, executability }, stepIssues: issues };
}

function computeRunnerConfidence(steps) {
  if (!steps.length) return { score: 0, label: "N/A", color: T.t4, factors: [] };
  const factors = [];
  let score = 100;
  if (steps.length <= 10) factors.push({ key: "steps", ok: true, msg: `${steps.length} steps — ideal range` });
  else if (steps.length <= 20) { score -= 15; factors.push({ key: "steps", ok: true, msg: `${steps.length} steps — moderate complexity` }); }
  else { score -= 35; factors.push({ key: "steps", ok: false, msg: `${steps.length} steps — consider splitting` }); }
  const specific = steps.filter(s => /click|navigate|enter|verify|select|open|type|url|button|field|page/i.test(s.step)).length;
  const specRatio = steps.length ? specific / steps.length : 0;
  if (specRatio >= 0.7) factors.push({ key: "specificity", ok: true, msg: "Steps have concrete actions" });
  else { score -= 20; factors.push({ key: "specificity", ok: false, msg: `${Math.round((1 - specRatio) * 100)}% of steps lack specific actions` }); }
  const withData = steps.filter(s => s.data && s.data.trim()).length;
  factors.push({ key: "data", ok: withData > 0, msg: `${withData}/${steps.length} steps have test data` });
  if (withData === 0) score -= 10;
  const hasCaptcha = steps.some(s => /captcha|2fa|mfa|otp|sms/i.test(s.step + s.exp + s.data));
  if (hasCaptcha) { score -= 30; factors.push({ key: "complexity", ok: false, msg: "CAPTCHA/2FA detected — manual intervention likely" }); }
  else factors.push({ key: "complexity", ok: true, msg: "Standard UI flow — no blockers detected" });
  score = Math.max(0, Math.min(100, score));
  const label = score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";
  const color = score >= 80 ? T.green : score >= 50 ? T.amber : T.red;
  return { score, label, color, factors };
}

/* ═══════════════════════════════════════════════════════════════
   SHELL
   ═══════════════════════════════════════════════════════════════ */
const NAV = [
  { icon: Home, id: "home" }, { icon: ClipboardList, id: "plans" },
  { icon: FlaskConical, id: "tests" }, { icon: Package, id: "assets" },
  { icon: Play, id: "executions" }, { icon: BarChart3, id: "reports" },
  { icon: Cloud, id: "testcloud" }, { icon: Settings, id: "settings" },
];

const Sidebar = ({ active }) => (
  <div className="w-12 flex flex-col items-center py-3 gap-0.5 shrink-0"
    style={{ background: T.sidebar, borderRight: `1px solid ${T.sidebarBd}` }}>
    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold mb-4"
      style={{ background: T.sidebarActive }}>K</div>
    {NAV.map(({ icon: Icon, id }) => {
      const a = active === id;
      return (
        <button key={id} className="w-9 h-9 rounded-md flex items-center justify-center transition-all duration-100"
          style={{ background: a ? T.accentLight : "transparent", color: a ? T.sidebarActive : T.sidebarIcon }}
          onMouseEnter={e => { if (!a) { e.currentTarget.style.color = T.sidebarIconHover; e.currentTarget.style.background = T.hover; }}}
          onMouseLeave={e => { if (!a) { e.currentTarget.style.color = T.sidebarIcon; e.currentTarget.style.background = "transparent"; }}}>
          <Icon size={17} strokeWidth={1.6} />
        </button>
      );
    })}
  </div>
);

const TopBar = () => (
  <div className="h-11 flex items-center justify-between px-4 shrink-0"
    style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
    <div className="flex items-center gap-1.5 cursor-pointer">
      <span style={{ color: T.t2, fontSize: 13, fontWeight: 500 }}>RA Sample Project</span>
      <ChevronDown size={13} style={{ color: T.t4 }} />
    </div>
    <div className="flex items-center gap-1.5">
      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: T.brand, color: "#fff", fontSize: 12, fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.background = T.accent} onMouseLeave={e => e.currentTarget.style.background = T.brand}>
        <Sparkles size={13} /> Ask Kai
      </button>
      <IBtn><Bell size={15} strokeWidth={1.6} /></IBtn>
      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: T.brand, color: "#fff", fontSize: 10, fontWeight: 600 }}>H</div>
    </div>
  </div>
);

const Bread = ({ path }) => (
  <div className="px-5 py-1.5 flex items-center gap-1.5" style={{ background: T.card, borderBottom: `1px solid ${T.bd}`, fontSize: 12 }}>
    {path.map((p, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i > 0 && <span style={{ color: T.t4, fontSize: 10 }}>/</span>}
        <span style={{ color: i === path.length - 1 ? T.t1 : T.t3, fontWeight: i === path.length - 1 ? 500 : 400, cursor: "pointer" }}
          onMouseEnter={e => { if (i < path.length - 1) e.currentTarget.style.color = T.accent; }}
          onMouseLeave={e => { if (i < path.length - 1) e.currentTarget.style.color = T.t3; }}>
          {p}
        </span>
      </span>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const IBtn = ({ children, disabled, title, onClick, active, style: sx }) => (
  <button onClick={onClick} disabled={disabled} title={title}
    className="p-1.5 rounded-md transition-colors flex items-center justify-center"
    style={{ color: active ? T.accent : disabled ? T.t4 : T.t3, opacity: disabled ? 0.35 : 1, background: active ? T.accentLight : "transparent", cursor: disabled ? "default" : "pointer", ...sx }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = T.muted; e.currentTarget.style.color = T.t1; }}}
    onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = active ? T.accentLight : "transparent"; e.currentTarget.style.color = active ? T.accent : T.t3; }}}>
    {children}
  </button>
);

const Badge = ({ children, color = T.t3, bg = T.muted, border, onClick, style: sx }) => (
  <span onClick={onClick} className="inline-flex items-center px-1.5 py-px rounded"
    style={{ fontSize: 11, fontWeight: 500, color, background: bg, border: border ? `1px solid ${border}` : undefined, lineHeight: "18px", cursor: onClick ? "pointer" : undefined, ...sx }}>
    {children}
  </span>
);

const Toast = ({ show, msg }) => (
  <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all duration-300"
    style={{ background: T.t1, color: "#fff", fontSize: 12, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", opacity: show ? 1 : 0,
      transform: `translateX(-50%) translateY(${show ? 0 : 8}px)`, pointerEvents: show ? "auto" : "none", zIndex: 100 }}>
    <Check size={13} style={{ color: "#4ade80" }} /> {msg}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   POPOVER WRAPPER
   ═══════════════════════════════════════════════════════════════ */
const Popover = ({ open, onClose, children, align = "left" }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className="absolute z-50" style={{ top: "100%", [align]: 0, marginTop: 6, width: 320, background: T.card, border: `1px solid ${T.bd}`, borderRadius: 10, boxShadow: "0 12px 36px rgba(0,0,0,0.1)", overflow: "hidden" }}>
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   QUALITY SCORE BADGE + POPOVER
   ═══════════════════════════════════════════════════════════════ */
const DimBar = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-2">
    <Icon size={12} style={{ color: T.t4, flexShrink: 0 }} strokeWidth={1.5} />
    <span style={{ fontSize: 11, color: T.t3, width: 85, flexShrink: 0 }}>{label}</span>
    <div className="flex-1 h-1.5 rounded-full" style={{ background: T.muted }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: value >= 80 ? T.green : value >= 50 ? T.amber : T.red }} />
    </div>
    <span style={{ fontSize: 10, fontWeight: 600, color: T.t3, width: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{value}%</span>
  </div>
);

const QualityPopover = ({ quality, onClose, onClickSuggestion }) => (
  <Popover open onClose={onClose}>
    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 12, fontWeight: 600, color: T.t1 }}>Test Case Quality</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: quality.color }}>{quality.overall}<span style={{ fontSize: 11, fontWeight: 500, color: T.t4 }}>/100</span></span>
      </div>
      <DimBar label="Completeness" value={quality.dimensions.completeness} icon={Check} />
      <DimBar label="Clarity" value={quality.dimensions.clarity} icon={Eye} />
      <DimBar label="Coverage" value={quality.dimensions.coverage} icon={Target} />
      <DimBar label="Executability" value={quality.dimensions.executability} icon={Zap} />
    </div>
    {quality.stepIssues.filter(i => i.source === "quality").length > 0 && (
      <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle size={11} style={{ color: T.amber }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: T.t2 }}>Suggestions</span>
        </div>
        {quality.stepIssues.filter(i => i.source === "quality").slice(0, 5).map((iss, i) => (
          <div key={i} className="flex items-start gap-2 py-1 cursor-pointer rounded px-1 -mx-1"
            onClick={() => onClickSuggestion(iss.stepId)}
            onMouseEnter={e => e.currentTarget.style.background = T.hover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 10, color: T.t4, marginTop: 2 }}>•</span>
            <span style={{ fontSize: 11, color: T.t2, lineHeight: 1.4 }}>{iss.msg} <span style={{ color: T.t4 }}>(Step {iss.stepId})</span></span>
          </div>
        ))}
      </div>
    )}
    <div className="flex items-center justify-between px-4 py-2">
      <button className="flex items-center gap-1" style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.color = T.accent} onMouseLeave={e => e.currentTarget.style.color = T.brand}>
        Ask Kai for review <ExternalLink size={9} />
      </button>
      <div className="flex gap-0.5">
        <IBtn title="Helpful"><ThumbsUp size={12} strokeWidth={1.4} /></IBtn>
        <IBtn title="Not helpful"><ThumbsDown size={12} strokeWidth={1.4} /></IBtn>
      </div>
    </div>
  </Popover>
);

/* ═══════════════════════════════════════════════════════════════
   AI RUNNER CONFIDENCE BADGE + POPOVER
   ═══════════════════════════════════════════════════════════════ */
const RunnerPopover = ({ runner, onClose }) => (
  <Popover open onClose={onClose} align="left">
    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} style={{ color: T.purple }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.t1 }}>AI Runner Confidence</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: runner.color }}>{runner.score}%</span>
      </div>
      {runner.factors.map((f, i) => (
        <div key={i} className="flex items-start gap-2 mb-2">
          {f.ok ? <Check size={12} style={{ color: T.green, marginTop: 1, flexShrink: 0 }} /> : <AlertTriangle size={12} style={{ color: T.amber, marginTop: 1, flexShrink: 0 }} />}
          <span style={{ fontSize: 11, color: T.t2, lineHeight: 1.4 }}>{f.msg}</span>
        </div>
      ))}
    </div>
    <div className="px-4 py-2.5" style={{ background: runner.score >= 80 ? "rgba(22,163,74,0.03)" : "rgba(217,119,6,0.03)", borderBottom: `1px solid ${T.bdLight}` }}>
      <span style={{ fontSize: 11, color: T.t2, lineHeight: 1.4 }}>
        {runner.score >= 80 ? "This test case is a good candidate for AI-assisted execution." : runner.score >= 50 ? "AI can attempt this test but may need human review at some steps." : "Consider simplifying this test case before AI execution."}
      </span>
    </div>
    <div className="flex items-center justify-between px-4 py-2">
      <button className="flex items-center gap-1" style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.color = T.accent} onMouseLeave={e => e.currentTarget.style.color = T.brand}>
        Ask Kai <ExternalLink size={9} />
      </button>
      <div className="flex gap-0.5">
        <IBtn title="Helpful"><ThumbsUp size={12} strokeWidth={1.4} /></IBtn>
        <IBtn title="Not helpful"><ThumbsDown size={12} strokeWidth={1.4} /></IBtn>
      </div>
    </div>
  </Popover>
);

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */
const INIT = [
  { id: 1, step: "Navigate to the login page at /auth/login", exp: "Login page loads with email and password fields visible", data: "URL: https://app.example.com/auth/login" },
  { id: 2, step: "Verify the login form UI elements are displayed correctly", exp: "Email field, Password field, 'Sign In' button, 'Forgot Password' link, and 'Remember Me' checkbox are all visible", data: "" },
  { id: 3, step: "Enter valid email in the email field", exp: "Email is accepted and displayed in the input field", data: "Email: qa.tester@katalon.io" },
  { id: 4, step: "Enter valid password in the password field", exp: "Password is masked with dots", data: "Password: Test@2026!" },
  { id: 5, step: 'Click the "Sign In" button', exp: "", data: "" },
  { id: 6, step: "Wait for redirect", exp: "", data: "" },
  { id: 7, step: "Verify the dashboard page loads with the correct welcome message", exp: 'Welcome banner shows "Welcome back, QA Tester" with today\'s date', data: "" },
  { id: 8, step: "Check session", exp: "Browser cookie contains valid auth token", data: "" },
  { id: 9, step: 'Click the user avatar in the top-right corner and select "Profile"', exp: "Profile page opens displaying the logged-in user's details", data: "Expected name: QA Tester" },
  { id: 10, step: "Verify logout", exp: "", data: "" },
];

const AI_STEPS = [
  { id: 101, step: 'Click "Sign In" with empty email and password fields', exp: 'Validation errors: "Email is required" and "Password is required"', data: "Email: (empty) · Password: (empty)" },
  { id: 102, step: "Enter an invalid email format and attempt sign in", exp: 'Validation error: "Please enter a valid email address"', data: "Email: not-an-email" },
  { id: 103, step: "Enter valid email with incorrect password", exp: 'Error: "Invalid email or password. 4 attempts remaining."', data: "Password: WrongPass123" },
  { id: 104, step: 'Verify "Remember Me" checkbox is present and unchecked by default', exp: "Checkbox is visible and not selected", data: "" },
];

const ATTACHMENTS = [
  { name: "login-spec-v2.pdf", size: "2.4 MB", type: "pdf", date: "Apr 8", thumb: null },
  { name: "login-flow-screenshot.png", size: "348 KB", type: "image", date: "Apr 10", thumb: true },
  { name: "error-state-mockup.png", size: "215 KB", type: "image", date: "Apr 12", thumb: true },
];

/* ═══════════════════════════════════════════════════════════════
   TOOLBAR
   ═══════════════════════════════════════════════════════════════ */
const Toolbar = ({ onUndo, onRedo, canUndo, canRedo, onPaste, onAdd }) => (
  <div className="flex items-center gap-px px-2 py-1" style={{ background: T.muted, borderBottom: `1px solid ${T.bd}` }}>
    <IBtn onClick={onUndo} disabled={!canUndo} title="Undo"><Undo2 size={14} strokeWidth={1.6} /></IBtn>
    <IBtn onClick={onRedo} disabled={!canRedo} title="Redo"><Redo2 size={14} strokeWidth={1.6} /></IBtn>
    <div style={{ width: 1, height: 14, background: T.bd, margin: "0 5px" }} />
    <IBtn title="Bold"><Bold size={14} strokeWidth={1.6} /></IBtn>
    <IBtn title="Italic"><Italic size={14} strokeWidth={1.6} /></IBtn>
    <IBtn title="Link"><Link2 size={14} strokeWidth={1.6} /></IBtn>
    <IBtn title="List"><List size={14} strokeWidth={1.6} /></IBtn>
    <div style={{ width: 1, height: 14, background: T.bd, margin: "0 5px" }} />
    <IBtn title="Image"><Image size={14} strokeWidth={1.6} /></IBtn>
    <div className="flex-1" />
    <button onClick={onPaste} className="flex items-center gap-1 px-2 py-0.5 rounded transition-colors"
      style={{ fontSize: 11, fontWeight: 500, color: T.t3 }}
      onMouseEnter={e => { e.currentTarget.style.background = T.hover; e.currentTarget.style.color = T.t1; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.t3; }}>
      <Copy size={11} /> Paste from Excel
    </button>
    <div style={{ width: 1, height: 14, background: T.bd, margin: "0 5px" }} />
    <button onClick={onAdd} className="flex items-center gap-1 px-2 py-0.5 rounded transition-colors"
      style={{ fontSize: 11, fontWeight: 500, color: T.brand }}
      onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <Plus size={11} /> Add Step
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   CELL
   ═══════════════════════════════════════════════════════════════ */
const Cell = ({ value, onChange, active, onFocus, ph }) => (
  <div contentEditable suppressContentEditableWarning
    className="min-h-[32px] px-2.5 py-1.5 outline-none whitespace-pre-wrap transition-shadow"
    style={{ fontSize: 13, lineHeight: 1.55, color: value ? T.t2 : T.t4, background: active ? "rgba(79,70,229,0.04)" : "transparent", borderRadius: 3, boxShadow: active ? `inset 0 0 0 1.5px ${T.brand}` : "none" }}
    onFocus={onFocus} onBlur={e => onChange(e.target.innerText)}
    dangerouslySetInnerHTML={{ __html: value || `<span style="color:${T.t4}">${ph || ""}</span>` }} />
);

/* ═══════════════════════════════════════════════════════════════
   GUTTER INDICATOR — small icon dot, hover/click opens mini-popover
   ═══════════════════════════════════════════════════════════════ */
const GutterIndicator = ({ issues, onHighlight }) => {
  const [hover, setHover] = useState(false);
  const [showPop, setShowPop] = useState(false);
  const ref = useRef(null);
  const isRunner = issues[0]?.source === "runner";
  const color = isRunner ? T.purple : T.amber;
  const bgTint = isRunner ? "rgba(124,58,237,0.08)" : "rgba(217,119,6,0.08)";
  const borderTint = isRunner ? "rgba(124,58,237,0.2)" : "rgba(217,119,6,0.2)";

  useEffect(() => {
    if (!showPop) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setShowPop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showPop]);

  return (
    <div ref={ref} className="relative flex items-center justify-center" style={{ width: 18, height: 18 }}>
      <button onClick={() => setShowPop(!showPop)}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className="flex items-center justify-center rounded-full transition-all"
        style={{
          width: hover || showPop ? 18 : 14,
          height: hover || showPop ? 18 : 14,
          background: hover || showPop ? bgTint : `${color}18`,
          border: `1.5px solid ${hover || showPop ? color : borderTint}`,
          cursor: "pointer",
        }}>
        <AlertTriangle size={hover || showPop ? 10 : 8} style={{ color }} strokeWidth={2} />
      </button>
      {/* Mini popover */}
      {showPop && (
        <div className="absolute z-50" style={{ left: 24, top: -4, width: 260, background: T.card, border: `1px solid ${T.bd}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={11} style={{ color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.t1 }}>{issues.length} issue{issues.length > 1 ? "s" : ""}</span>
            </div>
            {issues.map((iss, i) => (
              <div key={i} className="flex items-start gap-1.5 mt-1.5">
                <span style={{ fontSize: 10, color: T.t4, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 11, color: T.t2, lineHeight: 1.35 }}>{iss.msg}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5">
            <button onClick={() => { setShowPop(false); onHighlight(); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded transition-colors"
              style={{ fontSize: 10, fontWeight: 500, color: T.brand, border: `1px solid ${T.accentBorder}`, background: T.accentLight }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(79,70,229,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = T.accentLight}>
              <Sparkles size={9} /> AI Suggest
            </button>
            <button onClick={() => setShowPop(false)}
              style={{ fontSize: 10, color: T.t4 }}
              onMouseEnter={e => e.currentTarget.style.color = T.t2}
              onMouseLeave={e => e.currentTarget.style.color = T.t4}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STEP AI MENU — per-step inline AI actions on hover
   ═══════════════════════════════════════════════════════════════ */
const StepAIMenu = ({ onAction }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const items = [
    { label: "Revise step", desc: "Improve clarity and specificity" },
    { label: "Generate expected result", desc: "Auto-fill expected outcome" },
    { label: "Suggest test data", desc: "Recommend input values" },
    { divider: true },
    { label: "Link test data", desc: "Connect to test data set", future: true },
  ];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        style={{ color: T.purple, background: open ? "rgba(124,58,237,0.08)" : "transparent" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.08)"}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}>
        <Sparkles size={12} strokeWidth={1.8} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 py-1 rounded-lg" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", width: 220 }}>
          <div className="px-3 py-1.5" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
            <div className="flex items-center gap-1.5">
              <Sparkles size={10} style={{ color: T.purple }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>AI Actions</span>
            </div>
          </div>
          {items.map((it, i) => it.divider ? (
            <div key={i} style={{ height: 1, background: T.bdLight, margin: "4px 0" }} />
          ) : (
            <button key={i} onClick={() => { onAction?.(it.label); setOpen(false); }}
              className="w-full flex flex-col px-3 py-1.5 transition-colors text-left"
              style={{ opacity: it.future ? 0.5 : 1 }}
              onMouseEnter={e => e.currentTarget.style.background = T.hover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: 12, color: T.purple, fontWeight: 500 }}>{it.label}</span>
              <span style={{ fontSize: 10, color: T.t4, lineHeight: 1.3 }}>
                {it.desc}{it.future && " (coming soon)"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STEP ROW — with gutter indicators for quality issues
   ═══════════════════════════════════════════════════════════════ */
const StepRow = ({ s, idx, ac, onAc, onUp, onDel, onDS, onDO, onDr, drag, issues, highlighted, inlineChip, onDismissChip, onHighlightStep }) => {
  const hasIssue = issues.length > 0;
  const isHighlighted = highlighted;
  return (
    <>
      <tr data-step-id={s.id} className="group transition-colors"
        style={{
          borderBottom: `1px solid ${T.bdLight}`,
          background: isHighlighted ? "rgba(217,119,6,0.06)" : s.isAI ? "rgba(124,58,237,0.03)" : T.card,
          borderTop: drag ? `2px solid ${T.brand}` : undefined,
        }}
        draggable onDragStart={e => onDS(e, idx)} onDragOver={e => onDO(e, idx)} onDrop={e => onDr(e, idx)}
        onMouseEnter={e => { if (!isHighlighted && !s.isAI) e.currentTarget.style.background = T.hover; }}
        onMouseLeave={e => { if (!isHighlighted) e.currentTarget.style.background = s.isAI ? "rgba(124,58,237,0.03)" : T.card; }}>
        <td className="w-10 text-center align-top pt-2">
          <div className="flex items-center justify-center gap-px">
            <span className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity" style={{ color: T.t4 }}>
              <GripVertical size={13} strokeWidth={1.4} />
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, color: T.t4, fontVariantNumeric: "tabular-nums", minWidth: 14, textAlign: "right" }}>{idx + 1}</span>
          </div>
        </td>
        {/* Gutter indicator */}
        <td className="w-6 p-0 align-top pt-1.5" style={{ position: "relative" }}>
          {hasIssue && <GutterIndicator issues={issues} onHighlight={() => onHighlightStep(s.id)} />}
          {s.isAI && !hasIssue && (
            <div className="flex items-center justify-center" style={{ width: 18, height: 18, marginTop: 2 }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.purple }} />
            </div>
          )}
        </td>
        <td className="align-top" style={{ width: "37%" }}>
          <Cell value={s.step} onChange={v => onUp(s.id, "step", v)} active={ac === `${s.id}-s`} onFocus={() => onAc(`${s.id}-s`)} ph="Describe the test step..." />
        </td>
        <td className="align-top" style={{ width: "32%", borderLeft: `1px solid ${T.bdLight}` }}>
          <Cell value={s.exp} onChange={v => onUp(s.id, "exp", v)} active={ac === `${s.id}-e`} onFocus={() => onAc(`${s.id}-e`)} ph="Expected result..." />
        </td>
        <td className="align-top" style={{ width: "22%", borderLeft: `1px solid ${T.bdLight}` }}>
          <Cell value={s.data} onChange={v => onUp(s.id, "data", v)} active={ac === `${s.id}-d`} onFocus={() => onAc(`${s.id}-d`)} ph="Test data..." />
        </td>
        <td className="w-14 align-top pt-1.5">
          <div className="flex items-center gap-0.5 justify-end pr-1">
            <StepAIMenu onAction={(a) => { /* placeholder for AI step action */ }} />
            <button onClick={() => onDel(s.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded transition-colors" style={{ color: T.t4 }}
              onMouseEnter={e => { e.currentTarget.style.color = T.red; e.currentTarget.style.background = "rgba(220,38,38,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.background = "transparent"; }}>
              <Trash2 size={13} strokeWidth={1.4} />
            </button>
          </div>
        </td>
      </tr>
      {/* Mode 3: Inline chip when highlighted via popover click */}
      {isHighlighted && inlineChip && (
        <tr style={{ background: "rgba(217,119,6,0.04)" }}>
          <td colSpan={2} />
          <td colSpan={3} className="py-1.5 px-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={11} style={{ color: T.amber }} />
              <span style={{ fontSize: 11, color: T.t2 }}>{inlineChip.msg}</span>
              <button className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 500, color: T.brand, border: `1px solid ${T.accentBorder}`, background: T.accentLight }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(79,70,229,0.12)"} onMouseLeave={e => e.currentTarget.style.background = T.accentLight}>
                <Sparkles size={10} /> Suggest
              </button>
              <button onClick={onDismissChip} style={{ fontSize: 10, color: T.t4 }}
                onMouseEnter={e => e.currentTarget.style.color = T.t2} onMouseLeave={e => e.currentTarget.style.color = T.t4}>Dismiss</button>
            </div>
          </td>
          <td />
        </tr>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   INSERT LINE (Notion-style)
   ═══════════════════════════════════════════════════════════════ */
const InsertZone = ({ onInsert, onHover, onLeave }) => (
  <tr>
    <td colSpan={6} className="p-0" style={{ height: 0, border: "none", position: "relative" }}>
      <div onMouseEnter={onHover} onMouseLeave={onLeave} onClick={onInsert}
        style={{ position: "absolute", left: 0, right: 0, top: -12, height: 24, zIndex: 10, cursor: "pointer" }} />
    </td>
  </tr>
);

const InsertLine = ({ visible, onInsert }) => {
  if (!visible) return null;
  return (
    <tr>
      <td colSpan={6} className="p-0" style={{ height: 6, border: "none", position: "relative" }}>
        <div onClick={onInsert} className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center cursor-pointer" style={{ height: 8, zIndex: 11 }}>
          <div className="flex-1 h-px" style={{ background: T.brand }} />
          <button onClick={e => { e.stopPropagation(); onInsert(); }}
            className="w-6 h-6 rounded-full flex items-center justify-center -mx-0.5 transition-transform hover:scale-110"
            style={{ background: T.brand, color: "#fff", boxShadow: "0 2px 6px rgba(94,106,210,0.35)" }}>
            <Plus size={13} strokeWidth={2.2} />
          </button>
          <div className="flex-1 h-px" style={{ background: T.brand }} />
        </div>
      </td>
    </tr>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AI SUGGESTIONS
   ═══════════════════════════════════════════════════════════════ */
const AISugg = ({ items, done, onOk, onAll, onX }) => (
  <div className="rounded-lg overflow-hidden mb-4" style={{ border: `1px solid ${T.accentBorder}`, background: T.card }}>
    <div className="flex items-center justify-between px-3.5 py-2.5" style={{ background: T.accentLight, borderBottom: `1px solid ${T.accentBorder}` }}>
      <div className="flex items-center gap-2">
        <Sparkles size={14} style={{ color: T.brand }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: T.t1 }}>AI Suggested Steps</span>
        <Badge color={T.brand} bg={T.accentLight} border={T.accentBorder}>{items.length - done.length} remaining</Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={onAll} className="flex items-center gap-1 px-2.5 py-1 rounded-md" style={{ background: T.brand, color: "#fff", fontSize: 11, fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.background = T.accent} onMouseLeave={e => e.currentTarget.style.background = T.brand}>
          <Check size={12} /> Accept All
        </button>
        <button onClick={onX} className="px-2 py-1 rounded-md" style={{ fontSize: 11, fontWeight: 500, color: T.t3, border: `1px solid ${T.bd}` }}
          onMouseEnter={e => e.currentTarget.style.background = T.muted} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>Dismiss</button>
      </div>
    </div>
    {items.map((s, i) => {
      const d = done.includes(s.id);
      return (
        <div key={s.id} className="flex items-start gap-2.5 px-3.5 py-2.5" style={{ borderBottom: i < items.length - 1 ? `1px solid ${T.bdLight}` : "none", opacity: d ? 0.4 : 1, background: d ? "rgba(22,163,74,0.03)" : T.card }}
          onMouseEnter={e => { if (!d) e.currentTarget.style.background = T.hover; }} onMouseLeave={e => { e.currentTarget.style.background = d ? "rgba(22,163,74,0.03)" : T.card; }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: T.brand, minWidth: 18, paddingTop: 1 }}>+{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 12, color: T.t2, lineHeight: 1.5 }}>{s.step}</div>
            <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>Expected: {s.exp}</div>
            {s.data && <div style={{ fontSize: 10, color: T.t4, marginTop: 1, fontFamily: "ui-monospace, monospace" }}>{s.data}</div>}
          </div>
          {!d ? (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onOk(s.id)} className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ fontSize: 11, fontWeight: 500, color: T.green, border: "1px solid rgba(22,163,74,0.2)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(22,163,74,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Check size={11} /> Accept
              </button>
              <IBtn title="Edit"><Pencil size={12} strokeWidth={1.4} /></IBtn>
            </div>
          ) : <span className="flex items-center gap-1 shrink-0" style={{ fontSize: 11, color: T.green, fontWeight: 500 }}><Check size={11} /> Added</span>}
        </div>
      );
    })}
    <div className="flex items-center justify-between px-3.5 py-2" style={{ background: T.accentLight, borderTop: `1px solid ${T.accentBorder}` }}>
      <button className="flex items-center gap-1" style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.color = T.accent} onMouseLeave={e => e.currentTarget.style.color = T.brand}>
        <Sparkles size={11} /> Ask Kai for more <ExternalLink size={9} style={{ marginLeft: 1 }} />
      </button>
      <div className="flex items-center gap-0.5">
        <IBtn title="Helpful"><ThumbsUp size={12} strokeWidth={1.4} /></IBtn>
        <IBtn title="Not helpful"><ThumbsDown size={12} strokeWidth={1.4} /></IBtn>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PRECONDITION
   ═══════════════════════════════════════════════════════════════ */
const PreCond = ({ val, set, open, toggle }) => (
  <div className="rounded-lg overflow-hidden mb-4" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
    <button onClick={toggle} className="w-full flex items-center gap-2 px-3.5 py-2 transition-colors"
      onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {open ? <ChevronDown size={13} style={{ color: T.t3 }} /> : <ChevronRight size={13} style={{ color: T.t3 }} />}
      <span style={{ fontSize: 12, fontWeight: 500, color: T.t2 }}>Pre-conditions</span>
      {val && <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.brand }} />}
    </button>
    {open && (
      <div className="px-3.5 pb-3" style={{ borderTop: `1px solid ${T.bdLight}` }}>
        <textarea value={val} onChange={e => set(e.target.value)} rows={2} placeholder="Setup, data, or conditions needed before execution..."
          className="w-full mt-2 outline-none resize-y" style={{ fontSize: 12, lineHeight: 1.55, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 5, padding: "8px 10px" }}
          onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 1.5px ${T.brand}`} onBlur={e => e.currentTarget.style.boxShadow = "none"} />
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   RIGHT PANEL
   ═══════════════════════════════════════════════════════════════ */
const Sec = ({ title, icon: Icon, children, initOpen = true }) => {
  const [open, setOpen] = useState(initOpen);
  return (
    <div style={{ borderBottom: `1px solid ${T.bdLight}` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1.5 px-3 py-2 transition-colors"
        onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        {open ? <ChevronDown size={11} style={{ color: T.t4 }} /> : <ChevronRight size={11} style={{ color: T.t4 }} />}
        {Icon && <Icon size={12} style={{ color: T.t3 }} strokeWidth={1.6} />}
        <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6 }}>{title}</span>
      </button>
      {open && <div className="px-3 pb-2.5">{children}</div>}
    </div>
  );
};

const Sel = ({ label, value, opts, onChange, required }) => (
  <div className="mb-2.5">
    <label style={{ fontSize: 11, color: T.t4, fontWeight: 500, display: "block", marginBottom: 3 }}>{label}{required && <span style={{ color: T.red }}> *</span>}</label>
    <select value={value} onChange={e => onChange?.(e.target.value)} className="w-full outline-none cursor-pointer"
      style={{ fontSize: 12, fontWeight: 400, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 5, padding: "4px 6px", lineHeight: 1.4 }}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const RPanel = ({ meta, setMeta, open, toggle, width, onResize }) => {
  const dragRef = useRef(null);
  const startResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    const onMove = (ev) => { const delta = startX - ev.clientX; onResize(Math.max(220, Math.min(420, startW + delta))); };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [width, onResize]);

  if (!open) return (
    <div className="shrink-0 flex flex-col items-center pt-2" style={{ borderLeft: `1px solid ${T.bd}`, background: T.card }}>
      <button onClick={toggle} className="p-1.5 rounded-md transition-colors" style={{ color: T.t3 }}
        onMouseEnter={e => { e.currentTarget.style.background = T.muted; e.currentTarget.style.color = T.t1; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.t3; }}>
        <PanelRightOpen size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
  return (
    <div className="shrink-0 overflow-y-auto flex flex-col relative" style={{ width, background: T.card, borderLeft: `1px solid ${T.bd}` }}>
      {/* Resize handle */}
      <div onMouseDown={startResize}
        style={{ position: "absolute", left: -3, top: 0, bottom: 0, width: 6, cursor: "col-resize", zIndex: 10 }}
        onMouseEnter={e => e.currentTarget.style.background = T.accentBorder}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"} />
      <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6 }}>Details</span>
        <button onClick={toggle} className="p-1 rounded transition-colors" style={{ color: T.t4 }}
          onMouseEnter={e => { e.currentTarget.style.background = T.muted; e.currentTarget.style.color = T.t2; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.t4; }}>
          <PanelRightClose size={14} strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Sec title="Properties" icon={FileText}>
          {/* Status — read-only mirror of header dropdown */}
          <div className="mb-2.5">
            <label style={{ fontSize: 11, color: T.t4, fontWeight: 500, display: "block", marginBottom: 3 }}>Status</label>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.status === "Published" ? T.green : meta.status === "Draft" ? T.t4 : T.amber }} />
              <span style={{ fontSize: 12, color: T.t2 }}>{meta.status}</span>
            </div>
          </div>
          <Sel label="Priority" value={meta.priority} opts={["Critical", "High", "Medium", "Low"]} onChange={v => setMeta("priority", v)} />
          <Sel label="Assignee" value={meta.assignee} opts={["Huy Dao", "Anh Le", "Vuong Thien Phu", "Unassigned"]} onChange={v => setMeta("assignee", v)} />
          <Sel label="Reviewer" value={meta.reviewer || "Anh Le"} opts={["Anh Le", "Huy Dao", "Vuong Thien Phu", "Unassigned"]} onChange={v => setMeta("reviewer", v)} />
          <Sel label="Execution Type" value={meta.execType || "Manual"} opts={["Manual", "Automated", "Semi-automated"]} onChange={v => setMeta("execType", v)} />
          <Sel label="Estimated Duration" value={meta.duration || "5 min"} opts={["1 min", "2 min", "5 min", "10 min", "15 min", "30 min", "60 min"]} onChange={v => setMeta("duration", v)} />
        </Sec>

        <Sec title="Classification" icon={Tag}>
          <Sel label="Module" value="Authentication" opts={["Authentication", "Dashboard", "Reports", "User Management", "API", "Settings"]} />
          <Sel label="Test Type" value="Functional" opts={["Functional", "Regression", "Smoke", "Integration", "E2E", "UAT"]} />
          <Sel label="Environment" value={meta.env || "Staging"} opts={["Production", "Staging", "QA", "Dev", "All"]} onChange={v => setMeta("env", v)} />
          <Sel label="Platform" value={meta.platform || "Web — Chrome"} opts={["Web — Chrome", "Web — Firefox", "Web — Safari", "iOS — Mobile", "Android — Mobile", "API"]} onChange={v => setMeta("platform", v)} />
          <div className="mb-2">
            <label style={{ fontSize: 11, color: T.t4, fontWeight: 500, display: "block", marginBottom: 3 }}>Tags</label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {["login", "P0", "auth", "sprint-42"].map(t => (
                <span key={t} className="flex items-center gap-0.5 px-1.5 py-px rounded"
                  style={{ fontSize: 10, fontWeight: 500, color: T.t2, background: T.muted, border: `1px solid ${T.bd}` }}>
                  {t} <X size={9} className="cursor-pointer" style={{ color: T.t4 }}
                    onMouseEnter={e => e.currentTarget.style.color = T.red} onMouseLeave={e => e.currentTarget.style.color = T.t4} />
                </span>
              ))}
            </div>
            <input placeholder="Add tag..." className="w-full outline-none" style={{ fontSize: 11, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 5, padding: "3px 6px" }} />
          </div>
        </Sec>

        <Sec title="Linkages" icon={GitBranch}>
          {[
            { l: "Requirement", v: "REQ-1042", sub: "User login flow" },
            { l: "User Story", v: "US-3187", sub: "As a user, I can log in" },
            { l: "Defects", v: "None", sub: null },
            { l: "Last Execution", v: "EX-9401", sub: "Passed · Apr 14" },
            { l: "Execution History", v: "3 runs", sub: "2 passed, 1 failed" },
          ].map(x => (
            <div key={x.l} className="py-1.5" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 11, color: T.t3 }}>{x.l}</span>
                <span className="flex items-center gap-0.5" style={{ fontSize: 11, fontWeight: 500, color: x.v === "None" ? T.t4 : T.brand, cursor: x.v !== "None" ? "pointer" : "default" }}
                  onMouseEnter={e => { if (x.v !== "None") e.currentTarget.style.color = T.accent; }}
                  onMouseLeave={e => { if (x.v !== "None") e.currentTarget.style.color = T.brand; }}>
                  {x.v} {x.v !== "None" && <ExternalLink size={9} />}
                </span>
              </div>
              {x.sub && <div style={{ fontSize: 10, color: T.t4, marginTop: 1 }}>{x.sub}</div>}
            </div>
          ))}
          <button className="flex items-center gap-1 mt-2 transition-colors"
            style={{ fontSize: 11, fontWeight: 500, color: T.brand }}
            onMouseEnter={e => e.currentTarget.style.color = T.accent}
            onMouseLeave={e => e.currentTarget.style.color = T.brand}>
            <Plus size={11} /> Add link
          </button>
        </Sec>

        <Sec title="Activity" icon={Clock} initOpen={false}>
          <div className="space-y-2.5">
            {[
              { who: "Huy Dao", action: "updated steps 5–7", when: "2 hours ago" },
              { who: "Anh Le", action: "changed status to Published", when: "Apr 14" },
              { who: "Huy Dao", action: "created this test case", when: "Apr 10" },
            ].map((ev, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: T.muted, fontSize: 8, fontWeight: 700, color: T.t3 }}>
                  {ev.who.split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  <span style={{ fontSize: 11, color: T.t2 }}><strong style={{ fontWeight: 600 }}>{ev.who}</strong> {ev.action}</span>
                  <div style={{ fontSize: 10, color: T.t4 }}>{ev.when}</div>
                </div>
              </div>
            ))}
          </div>
        </Sec>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PASTE MODAL
   ═══════════════════════════════════════════════════════════════ */
const PasteModal = ({ rows, onOk, onX }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(3px)" }}>
    <div className="rounded-xl overflow-hidden" style={{ width: 640, maxHeight: 460, background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.bd}` }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.t1 }}>Paste Preview</div>
          <div style={{ fontSize: 11, color: T.t3, marginTop: 1 }}>{rows.length} rows from clipboard</div>
        </div>
        <IBtn onClick={onX}><X size={15} /></IBtn>
      </div>
      <div className="overflow-auto" style={{ maxHeight: 300 }}>
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead><tr style={{ background: T.muted, borderBottom: `1px solid ${T.bd}` }}>
            {["#", "Test Step", "Expected Result", "Test Data"].map(h => (
              <th key={h} className="text-left px-3 py-1.5" style={{ fontWeight: 500, color: T.t4, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.bdLight}` }}
              onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td className="px-3 py-2" style={{ color: T.t4 }}>{i + 1}</td>
              <td className="px-3 py-2" style={{ color: T.t2 }}>{r[0]}</td>
              <td className="px-3 py-2" style={{ color: T.t2 }}>{r[1]}</td>
              <td className="px-3 py-2" style={{ color: T.t3, fontFamily: "ui-monospace, monospace", fontSize: 11 }}>{r[2]}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: T.muted, borderTop: `1px solid ${T.bd}` }}>
        <span style={{ fontSize: 11, color: T.t4 }}>Mapped: Step → Expected → Data</span>
        <div className="flex items-center gap-1.5">
          <button onClick={onX} className="px-2.5 py-1 rounded-md" style={{ fontSize: 12, fontWeight: 500, color: T.t2, border: `1px solid ${T.bd}` }}
            onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>Cancel</button>
          <button onClick={onOk} className="px-2.5 py-1 rounded-md" style={{ fontSize: 12, fontWeight: 500, color: "#fff", background: T.brand }}
            onMouseEnter={e => e.currentTarget.style.background = T.accent} onMouseLeave={e => e.currentTarget.style.background = T.brand}>Insert {rows.length} Steps</button>
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   STATUS DROPDOWN (header)
   ═══════════════════════════════════════════════════════════════ */
const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const opts = ["Draft", "Published", "Archived"];
  const dotColor = value === "Published" ? T.green : value === "Draft" ? T.t4 : T.amber;
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors"
        style={{ border: `1px solid ${T.bd}`, background: open ? T.muted : "transparent" }}
        onMouseEnter={e => e.currentTarget.style.background = T.muted} onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: T.t2 }}>{value}</span>
        <ChevronDown size={11} style={{ color: T.t4 }} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 py-1 rounded-lg" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", minWidth: 120 }}>
          {opts.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
              style={{ fontSize: 12, color: o === value ? T.brand : T.t2, fontWeight: o === value ? 500 : 400 }}
              onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: o === "Published" ? T.green : o === "Draft" ? T.t4 : T.amber }} />
              {o}
              {o === value && <Check size={12} style={{ marginLeft: "auto", color: T.brand }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MORE MENU (with Edit with Kai)
   ═══════════════════════════════════════════════════════════════ */
const MoreMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const items = [
    { icon: Sparkles, label: "Edit with Kai", ai: true },
    { divider: true },
    { icon: Move, label: "Move" },
    { icon: Copy, label: "Duplicate" },
    { icon: ExternalLink, label: "View history" },
    { divider: true },
    { icon: Trash2, label: "Delete", danger: true },
  ];
  return (
    <div ref={ref} className="relative">
      <IBtn onClick={() => setOpen(!open)} title="More"><MoreHorizontal size={14} strokeWidth={1.4} /></IBtn>
      {open && (
        <div className="absolute right-0 z-50 mt-1 py-1 rounded-lg" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", minWidth: 170 }}>
          {items.map((it, i) => it.divider ? (
            <div key={i} style={{ height: 1, background: T.bdLight, margin: "4px 0" }} />
          ) : (
            <button key={i} onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
              style={{ fontSize: 12, color: it.danger ? T.red : it.ai ? T.purple : T.t2 }}
              onMouseEnter={e => e.currentTarget.style.background = it.danger ? "rgba(220,38,38,0.04)" : T.hover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <it.icon size={13} strokeWidth={1.4} />
              {it.label}
              {it.ai && <Sparkles size={10} style={{ color: T.purple, marginLeft: "auto" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [steps, setSteps] = useState(INIT);
  const [ac, setAc] = useState(null);
  const [title, setTitle] = useState("Verify user login functionality");
  const [editingTitle, setEditingTitle] = useState(false);
  const [desc, setDesc] = useState("Verify the complete user login flow including authentication, session creation, and dashboard redirect.");
  const [pre, setPre] = useState("1. Test user account exists (qa.tester@katalon.io)\n2. Application deployed and accessible\n3. No active sessions for the test user");
  const [preOpen, setPreOpen] = useState(false);
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

  // Quality engine — recomputes on step changes
  const quality = useMemo(() => computeQuality(steps), [steps]);
  const runner = useMemo(() => computeRunnerConfidence(steps), [steps]);

  // Build step issue map for quick lookup
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
    // Scroll highlighted step into view
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
    <div className="flex h-screen" style={{ ...F, background: T.bg, color: T.t2 }}>
      <Sidebar active="tests" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <Bread path={["Tests", "Test Cases", "Authentication", "TC-516324"]} />

        {/* ── Header ── */}
        <div className="px-5 py-3 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
          {/* Row 1: Identity + Status */}
          <div className="flex items-center gap-2 mb-2">
            <Badge color={T.purple} bg="rgba(124,58,237,0.06)" border="rgba(124,58,237,0.15)">MANUAL</Badge>
            <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.t4 }}>TC-516324</span>
            <StatusDropdown value={meta.status} onChange={v => setMeta(p => ({ ...p, status: v }))} />
          </div>

          {/* Row 2: Editable title + Score badges + Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Editable title */}
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

              {/* Quality Score badge */}
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

              {/* AI Runner Confidence badge */}
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

            {/* Action buttons — Execute primary, Suggest Steps AI secondary */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors"
                style={{ background: T.green, color: "#fff", fontSize: 12, fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
                onMouseLeave={e => e.currentTarget.style.background = T.green}>
                <Play size={13} /> Execute
              </button>
              <button onClick={genAI} disabled={aiLoad}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors"
                style={{ fontSize: 12, fontWeight: 500, color: aiLoad ? T.brand : T.purple, border: `1px solid ${aiLoad ? T.accentBorder : "rgba(124,58,237,0.2)"}`, background: aiLoad ? T.accentLight : "transparent", cursor: aiLoad ? "wait" : "pointer" }}
                onMouseEnter={e => { if (!aiLoad) e.currentTarget.style.background = "rgba(124,58,237,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = aiLoad ? T.accentLight : "transparent"; }}>
                {aiLoad ? <><span className="inline-block w-3 h-3 rounded-full animate-spin" style={{ border: `1.5px solid ${T.accentBorder}`, borderTop: `1.5px solid ${T.brand}` }} /> Analyzing...</> : <><Sparkles size={13} /> Suggest Steps</>}
              </button>
              <MoreMenu />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5">
            {/* Description */}
            <div className="mb-4">
              <label style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6, display: "block", marginBottom: 4 }}>
                Description <span style={{ color: T.red }}>*</span>
              </label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                className="w-full outline-none resize-y transition-shadow"
                style={{ fontSize: 12, lineHeight: 1.55, color: T.t2, background: T.card, border: `1px solid ${desc.trim() ? T.bd : T.red}`, borderRadius: 5, padding: "8px 10px" }}
                onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 1.5px ${T.brand}`} onBlur={e => e.currentTarget.style.boxShadow = "none"} />
            </div>

            <PreCond val={pre} set={setPre} open={preOpen} toggle={() => setPreOpen(!preOpen)} />

            {/* Attachments — inline with thumbnails (Jira-style) */}
            <div className="rounded-lg overflow-hidden mb-4" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
              <div className="flex items-center justify-between px-3.5 py-2 cursor-pointer"
                onMouseEnter={e => e.currentTarget.style.background = T.hover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div className="flex items-center gap-2">
                  <Paperclip size={13} style={{ color: T.t3 }} strokeWidth={1.5} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: T.t2 }}>Attachments</span>
                  <Badge color={T.t3} bg={T.muted}>{ATTACHMENTS.length}</Badge>
                </div>
                <button className="flex items-center gap-1 px-2 py-0.5 rounded transition-colors"
                  style={{ fontSize: 11, fontWeight: 500, color: T.brand }}
                  onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Plus size={11} /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5 px-3.5 pb-3">
                {ATTACHMENTS.map((att, i) => {
                  const Icon = fileIcon(att.type);
                  return (
                    <div key={i} className="group relative rounded-lg overflow-hidden transition-shadow cursor-pointer"
                      style={{ width: 120, border: `1px solid ${T.bd}` }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                      {/* Thumbnail area */}
                      <div className="flex items-center justify-center" style={{ height: 72, background: att.thumb ? "#e8eaf0" : T.muted }}>
                        {att.thumb ? (
                          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${T.muted} 25%, #dde0e8 50%, ${T.muted} 75%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ImageIcon size={24} style={{ color: T.t4 }} strokeWidth={1.2} />
                          </div>
                        ) : (
                          <Icon size={24} style={{ color: T.t4 }} strokeWidth={1.2} />
                        )}
                      </div>
                      {/* File name + meta */}
                      <div className="px-2 py-1.5">
                        <div style={{ fontSize: 10, fontWeight: 500, color: T.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</div>
                        <div style={{ fontSize: 9, color: T.t4 }}>{att.size} · {att.date}</div>
                      </div>
                      {/* Hover overlay delete */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* Drop zone hint */}
                <div className="rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors"
                  style={{ width: 120, height: 104, border: `2px dashed ${T.bd}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.background = "transparent"; }}>
                  <Plus size={16} style={{ color: T.t4, marginBottom: 2 }} />
                  <span style={{ fontSize: 10, color: T.t4 }}>Drop files</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
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

            {/* Steps tab */}
            {tab === "steps" && (
              <>
                {showAI && <AISugg items={AI_STEPS} done={aiDone} onOk={okAI} onAll={okAllAI} onX={() => setShowAI(false)} />}
                <div className="rounded-lg overflow-hidden" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                  <Toolbar onUndo={doUndo} onRedo={doRedo} canUndo={undo.length > 0} canRedo={redo.length > 0} onPaste={doPaste} onAdd={add} />
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: T.muted, borderBottom: `1px solid ${T.bd}` }}>
                        <th className="w-10" />
                        <th className="w-6" />
                        {[["38%", "Test Steps"], ["32%", "Expected Results"], ["22%", "Test Data"]].map(([w, h], i) => (
                          <th key={h} className="text-left px-2.5 py-2" style={{ width: w, fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, borderLeft: i > 0 ? `1px solid ${T.bd}` : undefined }}>{h}</th>
                        ))}
                        <th className="w-14" />
                      </tr>
                    </thead>
                    <tbody>
                      {steps.map((s, i) => {
                        const issues = stepIssueMap[s.id] || [];
                        const isHighlighted = highlightStep === s.id;
                        const chipIssue = isHighlighted ? issues[0] : null;
                        return (
                          <React.Fragment key={s.id}>
                            <StepRow s={s} idx={i} ac={ac} onAc={setAc} onUp={upd} onDel={del} onDS={ds} onDO={dO} onDr={dr}
                              drag={dOver === i} issues={issues} highlighted={isHighlighted} inlineChip={chipIssue}
                              onDismissChip={() => setHighlightStep(null)}
                              onHighlightStep={(id) => { setHighlightStep(id); setTimeout(() => setHighlightStep(null), 6000); }} />
                            {/* Notion-style insert: hover zone (20px tall) + visible line */}
                            <InsertZone onHover={() => setHoverInsert(i + 1)} onLeave={() => setHoverInsert(null)} onInsert={() => insertAt(i + 1)} />
                            <InsertLine visible={hoverInsert === i + 1} onInsert={() => insertAt(i + 1)} />
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between px-3 py-2" style={{ background: T.muted, borderTop: `1px solid ${T.bd}` }}>
                    <button onClick={add} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors"
                      style={{ fontSize: 12, fontWeight: 500, color: T.brand, border: `1px dashed ${T.accentBorder}`, background: "transparent" }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.accentLight; e.currentTarget.style.borderStyle = "solid"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderStyle = "dashed"; }}>
                      <Plus size={13} /> Add Step
                    </button>
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

            {/* Scripts tab — AI Runner bridge CTA */}
            {tab === "scripts" && (
              <div className="rounded-lg overflow-hidden" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
                {/* AI Runner generation CTA */}
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
                  {/* Runner confidence context */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4"
                    style={{ background: runner.color === T.green ? "rgba(22,163,74,0.06)" : "rgba(217,119,6,0.06)", border: `1px solid ${runner.color === T.green ? "rgba(22,163,74,0.15)" : "rgba(217,119,6,0.15)"}` }}>
                    <Sparkles size={10} style={{ color: T.purple }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: runner.color }}>AI Runner Confidence: {runner.score}% {runner.label}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors"
                      style={{ background: T.purple, color: "#fff", fontSize: 12, fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#6d28d9"}
                      onMouseLeave={e => e.currentTarget.style.background = T.purple}>
                      <Play size={12} /> Generate with AI Runner
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors"
                      style={{ fontSize: 12, fontWeight: 500, color: T.t2, border: `1px solid ${T.bd}` }}
                      onMouseEnter={e => e.currentTarget.style.background = T.muted}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <Plus size={12} /> Link Existing Script
                    </button>
                  </div>
                </div>
                {/* Divider */}
                <div style={{ borderTop: `1px solid ${T.bdLight}` }} />
                {/* No scripts linked — subtle footer */}
                <div className="flex items-center justify-center gap-2 px-4 py-3" style={{ background: T.muted }}>
                  <Code2 size={13} style={{ color: T.t4 }} strokeWidth={1.5} />
                  <span style={{ fontSize: 11, color: T.t4 }}>No automation scripts linked to this test case</span>
                </div>
              </div>
            )}

          </div>

          <RPanel meta={meta} setMeta={(k, v) => setMeta(p => ({ ...p, [k]: v }))} open={panel} toggle={() => setPanel(!panel)}
            width={panelW} onResize={setPanelW} />
        </div>
      </div>
      <Toast show={toast.show} msg={toast.msg} />
      {paste && <PasteModal rows={paste} onOk={okPaste} onX={() => setPaste(null)} />}
    </div>
  );
}
