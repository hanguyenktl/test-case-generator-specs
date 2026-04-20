import { useState, useEffect, useCallback } from "react";
import {
  Home, ClipboardList, FlaskConical, Package, Play, BarChart3, Cloud, Settings,
  Bell, ChevronDown, ChevronRight, Sparkles, Plus, Check, X, MoreHorizontal,
  ExternalLink, ThumbsUp, ThumbsDown, PanelRightClose, PanelRightOpen,
  Upload, FileText, Link2, AlertTriangle, Search, RefreshCw, Pencil,
  CheckCircle2, ArrowRight, ChevronUp, File, MessageSquare, Info,
  GripVertical, ArrowLeft, FolderOpen, Loader2, Tag, Users, Hash,
  RotateCcw, ArrowUpDown, Copy, Eye, ShieldCheck, Zap, Target,
  FileDown, Clock, Globe, BookOpen, Paperclip
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TOKENS & FONT
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
   SHELL COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const NAV = [
  { icon: Home, id: "home" }, { icon: ClipboardList, id: "plans" },
  { icon: FlaskConical, id: "tests" }, { icon: Package, id: "assets" },
  { icon: Play, id: "executions" }, { icon: BarChart3, id: "reports" },
  { icon: Cloud, id: "testcloud" }, { icon: Settings, id: "settings" },
];

const Sidebar = ({ active }) => (
  <div className="w-12 flex flex-col items-center py-3 gap-0.5 shrink-0" style={{ background: T.sidebar, borderRight: `1px solid ${T.sidebarBd}` }}>
    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold mb-4" style={{ background: T.sidebarActive }}>K</div>
    {NAV.map(({ icon: Icon, id }) => {
      const a = active === id;
      return (<button key={id} className="w-9 h-9 rounded-md flex items-center justify-center transition-all duration-100"
        style={{ background: a ? T.accentLight : "transparent", color: a ? T.sidebarActive : T.sidebarIcon }}
        onMouseEnter={e => { if (!a) { e.currentTarget.style.color = T.sidebarIconHover; e.currentTarget.style.background = T.hover; }}}
        onMouseLeave={e => { if (!a) { e.currentTarget.style.color = T.sidebarIcon; e.currentTarget.style.background = "transparent"; }}}>
        <Icon size={17} strokeWidth={1.6} />
      </button>);
    })}
  </div>
);

const TopBar = () => (
  <div className="h-11 flex items-center justify-between px-4 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
    <div className="flex items-center gap-1.5 cursor-pointer">
      <span style={{ color: T.t2, fontSize: 13, fontWeight: 500 }}>RA Sample Project</span>
      <ChevronDown size={13} style={{ color: T.t4 }} />
    </div>
    <div className="flex items-center gap-1.5">
      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: T.brand, color: "#fff", fontSize: 12, fontWeight: 500 }}>
        <Sparkles size={13} /> Ask Kai
      </button>
      <IBtn><Bell size={15} strokeWidth={1.6} /></IBtn>
      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: T.brand, color: "#fff", fontSize: 10, fontWeight: 600 }}>H</div>
    </div>
  </div>
);

const Bread = ({ path }) => (
  <div className="px-5 py-1.5 flex items-center gap-1.5 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}`, fontSize: 12 }}>
    {path.map((p, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i > 0 && <span style={{ color: T.t4, fontSize: 10 }}>/</span>}
        <span style={{ color: i === path.length - 1 ? T.t1 : T.t3, fontWeight: i === path.length - 1 ? 500 : 400, cursor: "pointer" }}>{p}</span>
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

const Badge = ({ children, color = T.t3, bg = T.muted, border }) => (
  <span className="inline-flex items-center px-1.5 py-px rounded" style={{ fontSize: 11, fontWeight: 500, color, background: bg, border: border ? `1px solid ${border}` : undefined, lineHeight: "18px" }}>{children}</span>
);

const Toast = ({ show, msg }) => (
  <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all duration-300"
    style={{ background: T.t1, color: "#fff", fontSize: 12, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", opacity: show ? 1 : 0, transform: `translateX(-50%) translateY(${show ? 0 : 8}px)`, pointerEvents: show ? "auto" : "none", zIndex: 50 }}>
    <Check size={13} style={{ color: "#4ade80" }} /> {msg}
  </div>
);

const ConfBadge = ({ level, onClick }) => {
  const cfg = {
    high: { color: T.green, label: "High", bg: "rgba(22,163,74,0.06)", border: "rgba(22,163,94,0.15)" },
    medium: { color: T.amber, label: "Med", bg: "rgba(217,119,6,0.06)", border: "rgba(217,119,6,0.15)" },
    low: { color: T.red, label: "Low", bg: "rgba(220,38,38,0.06)", border: "rgba(220,38,38,0.15)" },
  };
  const c = cfg[level] || cfg.medium;
  return (
    <span className="inline-flex items-center gap-1 cursor-pointer px-1.5 py-px rounded" onClick={onClick}
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
      <span style={{ fontSize: 10, color: c.color, fontWeight: 600 }}>{c.label}</span>
    </span>
  );
};

const PriBadge = ({ level }) => {
  const sym = level === "High" ? "P1" : level === "Medium" ? "P2" : "P3";
  return (
    <span className="inline-flex items-center gap-1" style={{ fontSize: 10, fontWeight: 500, color: T.t3, lineHeight: "16px" }}>
      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, fontWeight: 600, color: T.t4, background: T.muted, padding: "1px 4px", borderRadius: 3 }}>{sym}</span>
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */
const MOCK_FOLDERS = ["Authentication Tests", "Checkout Flow", "Report Module", "User Management"];

const PIPELINE_STEPS = [
  { key: "reading", label: "Reading requirement", sub: "Parsing auth-flow-spec.pdf (page 4/12)" },
  { key: "analyzing", label: "Analyzing scenarios", sub: "Identifying feature areas and test boundaries..." },
  { key: "clarifying", label: "Clarifying", sub: "Checking for ambiguity and gaps..." },
  { key: "generating", label: "Generating", sub: "Creating test steps and expected results..." },
];

const CLARS = [
  { id: 1, q: "What is the expected behavior when a user enters an expired session token?", opts: ["Show error & redirect to login", "Auto-refresh token silently", "Show warning with retry option"], resolved: null },
  { id: 2, q: "Should password reset require email verification before allowing a new password?", opts: ["Yes, always", "Only for new devices"], resolved: null },
];

const FEATURE_GROUPS = [
  {
    area: "Login & Authentication",
    cases: [
      { id: 1, name: "Verify successful login with valid credentials", chain: "credential validation \u2192 redirect \u2192 session creation", confidence: "high", steps: 5, priority: "High", tags: ["smoke", "happy-path"],
        objective: "Validates that a user with correct email and password can log in successfully and has an active session.",
        preconditions: "User account exists with verified email.",
        stepsData: [
          { action: "Navigate to the login page", expected: "Login form displays email and password fields" },
          { action: "Enter valid email 'testuser@example.com'", expected: "Email accepted without validation errors" },
          { action: "Enter valid password 'SecureP@ss123'", expected: "Password field masks input" },
          { action: "Click 'Sign In'", expected: "Loading indicator, form disabled" },
          { action: "Observe redirect", expected: "Dashboard loads with welcome message" },
        ],
        confExplanation: "Clear requirement mapping. Well-defined steps matching known auth patterns.",
      },
      { id: 2, name: "Verify login fails with empty credentials", chain: "empty field validation \u2192 error display \u2192 no redirect", confidence: "high", steps: 3, priority: "High", tags: ["negative", "validation"],
        objective: "Ensures the system prevents login when fields are empty.",
        preconditions: "Application is accessible.",
        stepsData: [
          { action: "Navigate to the login page", expected: "Login form displayed" },
          { action: "Leave fields empty, click 'Sign In'", expected: "Validation errors for both fields" },
          { action: "Verify page state", expected: "User stays on login page" },
        ],
        confExplanation: "Standard validation pattern. High certainty.",
      },
      { id: 3, name: "Verify account lockout after 5 failed attempts", chain: "attempt tracking \u2192 lockout trigger \u2192 unlock mechanism", confidence: "medium", steps: 7, priority: "High", tags: ["security", "edge-case"],
        objective: "Tests brute-force protection by verifying account locks after configured failures.",
        preconditions: "User account exists. Lockout threshold configured to 5.",
        stepsData: [
          { action: "Navigate to login page", expected: "Login form displayed" },
          { action: "Enter valid email, incorrect password, click 'Sign In'", expected: "Error: 'Invalid credentials'" },
          { action: "Repeat 4 more times", expected: "Warning after attempt 3: '2 attempts remaining'" },
          { action: "Attempt 6th login with correct password", expected: "'Account locked. Try again in 15 minutes.'" },
          { action: "Verify lockout duration", expected: "Account locked for 15 minutes" },
          { action: "Wait or admin unlock", expected: "Account accessible again" },
          { action: "Login with correct credentials", expected: "Success. Counter resets." },
        ],
        confExplanation: "AI assumed lockout threshold is 5 (not specified). Lockout duration assumed 15 min. Verify steps 4-6.",
      },
    ],
  },
  {
    area: "Session Management",
    cases: [
      { id: 4, name: "Verify session expires after inactivity timeout", chain: "idle detection \u2192 expiry trigger \u2192 redirect", confidence: "medium", steps: 4, priority: "Medium", tags: ["timeout", "session"],
        objective: "Validates sessions expire after the configured inactivity period.",
        preconditions: "User logged in. Timeout = 30 min.",
        stepsData: [
          { action: "Log in and note session start", expected: "Dashboard loads. Session active." },
          { action: "Idle for 30+ minutes", expected: "No change during idle" },
          { action: "Attempt any action", expected: "'Session expired. Please log in again.'" },
          { action: "Click 'Log in'", expected: "Redirect to login page" },
        ],
        confExplanation: "AI assumed timeout is 30 minutes (not specified). Verify exact value.",
      },
      { id: 5, name: "Verify concurrent session limit enforcement", chain: "multi-device login \u2192 eviction policy \u2192 notification", confidence: "low", steps: 3, priority: "Low", tags: ["edge-case", "multi-device"],
        objective: "Tests concurrent session limits and conflict handling.",
        preconditions: "User account exists. Session policy configured.",
        stepsData: [
          { action: "Log in on Device A (desktop)", expected: "Login succeeds. Session A active." },
          { action: "Log in same account on Device B (mobile)", expected: "Login succeeds. Behavior depends on policy." },
          { action: "Return to Device A, perform action", expected: "Either still active OR 'Signed out: new session detected'" },
        ],
        confExplanation: "Concurrent session handling not described. Steps are speculative. Needs judgment.",
      },
    ],
  },
  {
    area: "Password Recovery",
    cases: [
      { id: 6, name: "Verify password reset email is sent", chain: "reset request \u2192 email delivery \u2192 token validity", confidence: "high", steps: 5, priority: "Medium", tags: ["smoke", "recovery"],
        objective: "Validates forgot-password flow from request to successful change.",
        preconditions: "User with verified email exists. Email service functional.",
        stepsData: [
          { action: "Click 'Forgot password?' on login page", expected: "Reset form appears" },
          { action: "Enter email, click 'Send reset link'", expected: "'Reset link sent to your email'" },
          { action: "Check email inbox", expected: "Email received within 2 minutes" },
          { action: "Click reset link", expected: "New password form appears" },
          { action: "Enter and confirm new password", expected: "'Password updated'. Redirect to login." },
        ],
        confExplanation: "Well-defined flow. Token expiry assumed 24 hours.",
      },
    ],
  },
];

const ALL_CASES = FEATURE_GROUPS.flatMap(g => g.cases.map(c => ({ ...c, area: g.area })));

const EXISTING_TCS = [
  { id: "TC-516324", name: "Verify user login functionality", type: "MANUAL", status: "Published", priority: "High" },
  { id: "TC-516340", name: "Verify forgot password flow", type: "MANUAL", status: "Published", priority: "Medium" },
  { id: "TC-516358", name: "Verify user registration with valid data", type: "MANUAL", status: "Draft", priority: "High" },
  { id: "AC-FA049536", name: "Verify UI of report dashboard", type: "AUTOMATED", status: "Published", priority: "Low" },
  { id: "TC-516382", name: "Verify session timeout behavior", type: "MANUAL", status: "Published", priority: "Medium" },
];

const GEN_MORE_OPTS = ["Edge cases & boundary values", "Negative tests", "Security tests", "API / integration tests", "Performance considerations"];

/* ═══════════════════════════════════════════════════════════════
   QUALITY BREAKDOWN DATA
   ═══════════════════════════════════════════════════════════════ */
const QUALITY_DIMS = [
  { label: "Completeness", score: 65, tip: "Missing error handling scenarios, no mention of rate limits" },
  { label: "Clarity", score: 82, tip: "Clear language, well-structured requirements" },
  { label: "Testability", score: 70, tip: "Most requirements are verifiable, but MFA criteria are vague" },
  { label: "Consistency", score: 78, tip: "Minor conflicts between session timeout and SSO behavior" },
];

const LINKED_TCS_FULL = [
  { id: "TC-516324", name: "Verify user login functionality", type: "MANUAL", status: "Published", priority: "High", lastRun: "Passed", updated: "Apr 12" },
  { id: "TC-516340", name: "Verify forgot password flow", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", updated: "Apr 10" },
  { id: "TC-516358", name: "Verify user registration with valid data", type: "MANUAL", status: "Draft", priority: "High", lastRun: "—", updated: "Apr 14" },
  { id: "AC-FA049536", name: "Verify UI of report dashboard", type: "AUTOMATED", status: "Published", priority: "Low", lastRun: "Failed", updated: "Apr 11" },
  { id: "TC-516382", name: "Verify session timeout behavior", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", updated: "Apr 9" },
  { id: "TC-516401", name: "Verify SSO login via SAML 2.0", type: "MANUAL", status: "Draft", priority: "High", lastRun: "—", updated: "Apr 15" },
  { id: "TC-516415", name: "Verify account lockout notification email", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", updated: "Apr 8" },
];

/* ═══════════════════════════════════════════════════════════════
   ENTRY PAGE: J1 — REQUIREMENT DETAILS
   ═══════════════════════════════════════════════════════════════ */
const ReqDetailPage = ({ onGenerate }) => {
  const [propsOpen, setPropsOpen] = useState(false);
  const [qualOpen, setQualOpen] = useState(false);
  const overallQuality = 72;
  const qualColor = overallQuality >= 80 ? T.green : overallQuality >= 60 ? T.amber : T.red;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Req header — sticky */}
      <div className="shrink-0 px-5 py-3" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-1.5">
            <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>TO-8526</span>
            <Badge color={T.green} bg="rgba(22,163,74,0.06)" border="rgba(22,163,74,0.15)">Approved</Badge>
            <Badge color={T.purple} bg="rgba(124,58,237,0.06)" border="rgba(124,58,237,0.15)">Jira</Badge>
            <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
            <span style={{ fontSize: 10, color: T.t4 }}>Story</span>
            <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
            <span style={{ fontSize: 10, color: T.t4 }}>Sprint 14</span>
          </div>
          <button onClick={() => setPropsOpen(!propsOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
            style={{ fontSize: 10, color: propsOpen ? T.brand : T.t3, border: `1px solid ${propsOpen ? T.accentBorder : T.bd}`, background: propsOpen ? T.accentLight : "transparent" }}
            onMouseEnter={e => { if (!propsOpen) e.currentTarget.style.background = T.muted; }}
            onMouseLeave={e => { if (!propsOpen) e.currentTarget.style.background = "transparent"; }}>
            <Info size={10} /> Properties {propsOpen ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
          </button>
        </div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: T.t1, margin: "0 0 6px" }}>User authentication flow</h2>
        <div className="flex items-center gap-4">
          {/* Quality badge — clickable to expand breakdown */}
          <button onClick={() => setQualOpen(!qualOpen)} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors"
            style={{ background: qualOpen ? `${qualColor}08` : "transparent", border: qualOpen ? `1px solid ${qualColor}20` : "1px solid transparent" }}
            onMouseEnter={e => { if (!qualOpen) e.currentTarget.style.background = T.muted; }}
            onMouseLeave={e => { if (!qualOpen) e.currentTarget.style.background = qualOpen ? `${qualColor}08` : "transparent"; }}>
            <span style={{ fontSize: 11, color: T.t4 }}>Req Quality</span>
            <span className="w-2 h-2 rounded-full" style={{ background: qualColor }} />
            <span style={{ fontSize: 11, color: qualColor, fontWeight: 600 }}>{overallQuality}%</span>
            {qualOpen ? <ChevronUp size={9} style={{ color: T.t4 }} /> : <ChevronDown size={9} style={{ color: T.t4 }} />}
          </button>
          <div className="flex items-center gap-1.5">
            <ClipboardList size={11} style={{ color: T.t4 }} strokeWidth={1.4} />
            <span style={{ fontSize: 11, color: T.t4 }}>Linked TCs:</span>
            <span style={{ fontSize: 11, color: T.t2, fontWeight: 500 }}>7</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={11} style={{ color: T.t4 }} strokeWidth={1.4} />
            <span style={{ fontSize: 11, color: T.t4 }}>Assignee:</span>
            <span style={{ fontSize: 11, color: T.t2 }}>Huy Dao</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} style={{ color: T.t4 }} strokeWidth={1.4} />
            <span style={{ fontSize: 11, color: T.t4 }}>Updated:</span>
            <span style={{ fontSize: 11, color: T.t2 }}>Apr 14, 2026</span>
          </div>
        </div>

        {/* Quality breakdown — expandable */}
        {qualOpen && (
          <div className="mt-3 rounded-lg p-3" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
            <div className="flex items-center gap-2 mb-2.5">
              <ShieldCheck size={12} style={{ color: qualColor }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: T.t3, textTransform: "uppercase", letterSpacing: 0.4 }}>Quality Breakdown</span>
              <span className="ml-auto" style={{ fontSize: 10, color: T.t4 }}>AI-assessed &middot; semantic analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUALITY_DIMS.map(d => {
                const dc = d.score >= 80 ? T.green : d.score >= 60 ? T.amber : T.red;
                return (
                  <div key={d.label} className="flex items-center gap-2 px-2.5 py-2 rounded-md" style={{ background: T.card, border: `1px solid ${T.bdLight}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: 10, fontWeight: 500, color: T.t2 }}>{d.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: dc }}>{d.score}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full" style={{ background: T.muted }}>
                        <div className="h-1 rounded-full transition-all" style={{ width: `${d.score}%`, background: dc }} />
                      </div>
                      <div style={{ fontSize: 9, color: T.t4, marginTop: 3, lineHeight: 1.3 }}>{d.tip}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Properties drawer — expandable */}
        {propsOpen && (
          <div className="mt-3 rounded-lg p-3" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
            <div className="grid grid-cols-4 gap-x-6 gap-y-2">
              {[
                { label: "Source", value: "Jira", icon: Globe },
                { label: "Key", value: "TO-8526", icon: Hash },
                { label: "Type", value: "Story", icon: BookOpen },
                { label: "Sprint", value: "Sprint 14", icon: Target },
                { label: "Assignee", value: "Huy Dao", icon: Users },
                { label: "Reporter", value: "Anh Le", icon: Users },
                { label: "Created", value: "Apr 8, 2026", icon: Clock },
                { label: "Updated", value: "Apr 14, 2026", icon: Clock },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-2">
                  <p.icon size={10} style={{ color: T.t4, flexShrink: 0 }} strokeWidth={1.4} />
                  <span style={{ fontSize: 10, color: T.t4 }}>{p.label}:</span>
                  <span style={{ fontSize: 10, color: T.t2, fontWeight: 500 }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2 mt-3">
          <button onClick={onGenerate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors"
            style={{ background: T.brand, color: "#fff", fontSize: 12, fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.background = T.accent}
            onMouseLeave={e => e.currentTarget.style.background = T.brand}>
            <Sparkles size={13} /> Generate Tests
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors"
            style={{ fontSize: 12, color: T.t3, border: `1px solid ${T.bd}` }}
            onMouseEnter={e => e.currentTarget.style.background = T.muted}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <Link2 size={13} strokeWidth={1.4} /> Link Test Cases
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors"
            style={{ fontSize: 12, color: T.t3, border: `1px solid ${T.bd}` }}
            onMouseEnter={e => e.currentTarget.style.background = T.muted}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <ExternalLink size={12} strokeWidth={1.4} /> View in Jira
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
            style={{ fontSize: 10, color: T.t4, border: `1px solid ${T.bd}` }}
            onMouseEnter={e => e.currentTarget.style.background = T.muted}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <MoreHorizontal size={12} />
          </button>
        </div>
      </div>

      {/* Split body: LEFT description+attachments  |  RIGHT linked TCs */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {/* LEFT PANEL — Requirement content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ background: T.bg }}>
          {/* Description */}
          <div className="rounded-lg p-4 mb-3" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</span>
              <button className="flex items-center gap-1" style={{ fontSize: 10, color: T.brand }}>
                <Pencil size={9} /> Edit
              </button>
            </div>
            <div style={{ fontSize: 12, color: T.t2, lineHeight: 1.75 }}>
              <p style={{ marginBottom: 10 }}>
                The system shall support login with email and password. Session tokens expire after 30 minutes of inactivity.
                Failed login attempts are tracked, and accounts are locked after 5 consecutive failures.
                Password reset is available via email link. Users should be notified of suspicious login activity.
              </p>
              <p style={{ marginBottom: 10 }}>
                The authentication module must support Single Sign-On (SSO) integration with SAML 2.0 and OAuth 2.0 providers.
                Multi-factor authentication (MFA) should be available as an optional security layer.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Acceptance criteria:</strong>
              </p>
              <div style={{ paddingLeft: 12, marginTop: 4 }}>
                <div style={{ fontSize: 12, color: T.t2, lineHeight: 1.8 }}>
                  1. User can log in with valid email/password and is redirected to dashboard<br />
                  2. Invalid credentials show inline error without page reload<br />
                  3. Account locks after 5 failed attempts with 15-minute cooldown<br />
                  4. Password reset link is valid for 24 hours<br />
                  5. SSO login creates a local session with same timeout rules
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-lg p-4 mb-3" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Attachments (2)</div>
            {[
              { name: "auth-flow-spec.pdf", size: "1.2 MB", icon: FileText, color: "#dc2626" },
              { name: "login-wireframe.png", size: "340 KB", icon: File, color: T.brand },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-md mb-1.5 transition-colors cursor-pointer"
                style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdLight; e.currentTarget.style.background = T.bg; }}>
                <f.icon size={14} style={{ color: f.color }} strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <span style={{ fontSize: 12, color: T.t1, fontWeight: 500 }}>{f.name}</span>
                </div>
                <span style={{ fontSize: 10, color: T.t4 }}>{f.size}</span>
                <button style={{ fontSize: 10, color: T.brand, fontWeight: 500 }}>Preview</button>
              </div>
            ))}
          </div>

          {/* Activity / Comments — adds realism */}
          <div className="rounded-lg p-4" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Activity</div>
            {[
              { user: "Anh Le", avatar: "A", time: "Apr 14", text: "Updated acceptance criteria for SSO login behavior" },
              { user: "Huy Dao", avatar: "H", time: "Apr 12", text: "Linked 3 additional test cases from Sprint 13 regression suite" },
              { user: "System", avatar: "K", time: "Apr 10", text: "Quality score updated: 68% → 72% after description edit", system: true },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 mb-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: a.system ? T.accentLight : T.muted, color: a.system ? T.brand : T.t3, fontSize: 8, fontWeight: 700, marginTop: 1 }}>{a.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 11, fontWeight: 500, color: a.system ? T.brand : T.t1 }}>{a.user}</span>
                    <span style={{ fontSize: 9, color: T.t4 }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.t3, lineHeight: 1.4, marginTop: 1 }}>{a.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Linked Test Cases */}
        <div className="overflow-y-auto" style={{ flex: "0 0 380px", background: T.card, borderLeft: `1px solid ${T.bd}` }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: `1px solid ${T.bd}`, background: T.card, position: "sticky", top: 0, zIndex: 2 }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Linked Test Cases</span>
              <span className="px-1.5 rounded" style={{ fontSize: 10, fontWeight: 600, color: T.brand, background: T.accentLight }}>{LINKED_TCS_FULL.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors"
                style={{ fontSize: 10, color: T.brand, fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Plus size={9} /> Link
              </button>
            </div>
          </div>

          {/* Coverage summary */}
          <div className="px-4 py-2" style={{ background: T.bg, borderBottom: `1px solid ${T.bdLight}` }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />
                <span style={{ fontSize: 10, color: T.t3 }}>4 Published</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.t4 }} />
                <span style={{ fontSize: 10, color: T.t3 }}>2 Draft</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.red }} />
                <span style={{ fontSize: 10, color: T.t3 }}>1 Failed</span>
              </div>
            </div>
          </div>

          {/* TC rows */}
          {LINKED_TCS_FULL.map(tc => (
            <div key={tc.id} className="px-4 py-2.5 transition-colors cursor-pointer"
              style={{ borderBottom: `1px solid ${T.bdLight}` }}
              onMouseEnter={e => e.currentTarget.style.background = T.hover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>{tc.id}</span>
                <Badge color={tc.type === "MANUAL" ? T.purple : T.brand}
                  bg={tc.type === "MANUAL" ? "rgba(124,58,237,0.06)" : T.accentLight}
                  border={tc.type === "MANUAL" ? "rgba(124,58,237,0.12)" : T.accentBorder}>
                  {tc.type === "MANUAL" ? "Manual" : "Auto"}
                </Badge>
                <div className="flex-1" />
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tc.lastRun === "Passed" ? T.green : tc.lastRun === "Failed" ? T.red : T.t4 }} />
                  <span style={{ fontSize: 9, color: tc.lastRun === "Passed" ? T.green : tc.lastRun === "Failed" ? T.red : T.t4 }}>{tc.lastRun}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: T.t1, fontWeight: 400, lineHeight: 1.4 }}>{tc.name}</div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tc.status === "Published" ? T.green : T.t4 }} />
                  <span style={{ fontSize: 10, color: T.t4 }}>{tc.status}</span>
                </div>
                <PriBadge level={tc.priority} />
                <span style={{ fontSize: 9, color: T.t4 }}>Updated {tc.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ENTRY PAGE: J2 — TEST CASE LIST (polished)
   ═══════════════════════════════════════════════════════════════ */
const TC_LIST_DATA = [
  { id: "TC-516324", name: "Verify user login functionality", type: "MANUAL", status: "Published", priority: "High", lastRun: "Passed", assignee: "Huy Dao", updated: "Apr 12", tags: ["smoke"] },
  { id: "TC-516340", name: "Verify forgot password flow", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", assignee: "Anh Le", updated: "Apr 10", tags: ["recovery"] },
  { id: "TC-516358", name: "Verify user registration with valid data", type: "MANUAL", status: "Draft", priority: "High", lastRun: "—", assignee: "Huy Dao", updated: "Apr 14", tags: ["happy-path"] },
  { id: "AC-FA049536", name: "Verify UI of report dashboard", type: "AUTOMATED", status: "Published", priority: "Low", lastRun: "Failed", assignee: "Minh Tran", updated: "Apr 11", tags: ["ui"] },
  { id: "TC-516382", name: "Verify session timeout behavior", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", assignee: "Huy Dao", updated: "Apr 9", tags: ["session"] },
  { id: "AC-FA049550", name: "Verify checkout calculates tax correctly", type: "AUTOMATED", status: "Published", priority: "High", lastRun: "Passed", assignee: "Minh Tran", updated: "Apr 13", tags: ["calculation"] },
  { id: "TC-516401", name: "Verify SSO login via SAML 2.0", type: "MANUAL", status: "Draft", priority: "High", lastRun: "—", assignee: "Anh Le", updated: "Apr 15", tags: ["sso", "security"] },
  { id: "TC-516415", name: "Verify account lockout notification email", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", assignee: "Huy Dao", updated: "Apr 8", tags: ["email"] },
];

const TC_FOLDERS = [
  { name: "All Test Cases", count: 128, active: true },
  { name: "Authentication Tests", count: 24, indent: 1 },
  { name: "Checkout Flow", count: 18, indent: 1 },
  { name: "Report Module", count: 31, indent: 1 },
  { name: "User Management", count: 22, indent: 1 },
  { name: "API Tests", count: 33, indent: 1 },
];

const TestCaseListPage = ({ onCreateWithAI }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [selFolder, setSelFolder] = useState("All Test Cases");
  const published = TC_LIST_DATA.filter(t => t.status === "Published").length;
  const draft = TC_LIST_DATA.filter(t => t.status === "Draft").length;
  const auto = TC_LIST_DATA.filter(t => t.type === "AUTOMATED").length;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* LEFT — Folder tree sidebar */}
      <div className="overflow-y-auto shrink-0" style={{ width: 200, background: T.card, borderRight: `1px solid ${T.bd}` }}>
        <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Folders</span>
        </div>
        {TC_FOLDERS.map(f => (
          <button key={f.name} onClick={() => setSelFolder(f.name)}
            className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
            style={{
              paddingLeft: f.indent ? 20 : 12,
              background: selFolder === f.name ? T.accentLight : "transparent",
              borderLeft: selFolder === f.name ? `2px solid ${T.brand}` : "2px solid transparent",
            }}
            onMouseEnter={e => { if (selFolder !== f.name) e.currentTarget.style.background = T.hover; }}
            onMouseLeave={e => { if (selFolder !== f.name) e.currentTarget.style.background = "transparent"; }}>
            <FolderOpen size={11} style={{ color: selFolder === f.name ? T.brand : T.t4, flexShrink: 0 }} strokeWidth={1.4} />
            <span className="truncate" style={{ fontSize: 11, color: selFolder === f.name ? T.brand : T.t2, fontWeight: selFolder === f.name ? 500 : 400 }}>{f.name}</span>
            <span className="ml-auto" style={{ fontSize: 9, color: T.t4, fontWeight: 500 }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* RIGHT — Table area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md" style={{ background: T.bg, border: `1px solid ${T.bd}` }}>
              <Search size={12} style={{ color: T.t4 }} />
              <input placeholder="Search test cases..." className="outline-none w-44" style={{ fontSize: 12, color: T.t2, background: "transparent" }} />
            </div>
            <select style={{ fontSize: 11, fontWeight: 400, color: T.t3, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 5, padding: "5px 8px" }}>
              <option>All Types</option><option>Manual</option><option>Automated</option>
            </select>
            <select style={{ fontSize: 11, fontWeight: 400, color: T.t3, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 5, padding: "5px 8px" }}>
              <option>All Statuses</option><option>Published</option><option>Draft</option>
            </select>
            <select style={{ fontSize: 11, fontWeight: 400, color: T.t3, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 5, padding: "5px 8px" }}>
              <option>All Priorities</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowCreate(!showCreate)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md"
                style={{ background: T.brand, color: "#fff", fontSize: 12, fontWeight: 500 }}>
                <Plus size={12} /> Create <ChevronDown size={10} />
              </button>
              {showCreate && (
                <div className="absolute right-0 mt-1 w-52 rounded-md overflow-hidden z-20" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                  <button className="w-full text-left px-3 py-2.5 transition-colors flex items-center gap-2"
                    style={{ fontSize: 12, color: T.t2, borderBottom: `1px solid ${T.bdLight}` }}
                    onMouseEnter={e => e.currentTarget.style.background = T.hover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Plus size={12} style={{ color: T.t4 }} /> Create manually
                  </button>
                  <button className="w-full text-left px-3 py-2.5 transition-colors flex items-center gap-2"
                    style={{ fontSize: 12, color: T.t2, borderBottom: `1px solid ${T.bdLight}` }}
                    onMouseEnter={e => e.currentTarget.style.background = T.hover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Upload size={12} style={{ color: T.t4 }} /> Import from file
                  </button>
                  <button onClick={() => { setShowCreate(false); onCreateWithAI(); }}
                    className="w-full text-left px-3 py-2.5 transition-colors flex items-center gap-2"
                    style={{ fontSize: 12, color: T.brand, fontWeight: 500, background: "rgba(94,106,210,0.02)" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(94,106,210,0.02)"}>
                    <Sparkles size={12} style={{ color: T.purple }} /> Create with AI
                    <Badge color={T.purple} bg="rgba(124,58,237,0.06)" border="rgba(124,58,237,0.15)">New</Badge>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 px-4 py-1.5 shrink-0" style={{ background: T.bg, borderBottom: `1px solid ${T.bdLight}` }}>
          <span style={{ fontSize: 10, color: T.t3 }}>{TC_LIST_DATA.length} test cases</span>
          <span style={{ color: T.bd }}>|</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />
            <span style={{ fontSize: 10, color: T.t3 }}>{published} Published</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.t4 }} />
            <span style={{ fontSize: 10, color: T.t3 }}>{draft} Draft</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={9} style={{ color: T.brand }} />
            <span style={{ fontSize: 10, color: T.t3 }}>{auto} Automated</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full" style={{ background: T.card }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.bd}`, position: "sticky", top: 0, background: T.card, zIndex: 1 }}>
                <th className="text-left py-2.5 px-4" style={{ fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, width: 100 }}>ID</th>
                <th className="text-left py-2.5 px-3" style={{ fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Name</th>
                <th className="text-left py-2.5 px-3" style={{ fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, width: 80 }}>Type</th>
                <th className="text-left py-2.5 px-3" style={{ fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, width: 90 }}>Status</th>
                <th className="text-left py-2.5 px-3" style={{ fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, width: 60 }}>Pri</th>
                <th className="text-left py-2.5 px-3" style={{ fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, width: 70 }}>Last Run</th>
                <th className="text-left py-2.5 px-3" style={{ fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, width: 80 }}>Assignee</th>
                <th className="text-left py-2.5 px-3" style={{ fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, width: 60 }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {TC_LIST_DATA.map(tc => (
                <tr key={tc.id} className="transition-colors cursor-pointer"
                  style={{ borderBottom: `1px solid ${T.bdLight}` }}
                  onMouseEnter={e => e.currentTarget.style.background = T.hover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="py-2.5 px-4" style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>{tc.id}</td>
                  <td className="py-2.5 px-3">
                    <div style={{ fontSize: 12, color: T.t1, marginBottom: 2 }}>{tc.name}</div>
                    <div className="flex items-center gap-1">
                      {tc.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-px rounded" style={{ fontSize: 8, fontWeight: 500, color: T.t4, background: T.muted, border: `1px solid ${T.bdLight}` }}>{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge color={tc.type === "MANUAL" ? T.purple : T.brand}
                      bg={tc.type === "MANUAL" ? "rgba(124,58,237,0.06)" : T.accentLight}
                      border={tc.type === "MANUAL" ? "rgba(124,58,237,0.12)" : T.accentBorder}>
                      {tc.type === "MANUAL" ? "Manual" : "Auto"}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: tc.status === "Published" ? T.green : T.t4 }} />
                      <span style={{ fontSize: 11, color: T.t3 }}>{tc.status}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3"><PriBadge level={tc.priority} /></td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: tc.lastRun === "Passed" ? T.green : tc.lastRun === "Failed" ? T.red : T.t4 }} />
                      <span style={{ fontSize: 10, color: tc.lastRun === "Passed" ? T.green : tc.lastRun === "Failed" ? T.red : T.t4 }}>{tc.lastRun}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3" style={{ fontSize: 10, color: T.t3 }}>{tc.assignee}</td>
                  <td className="py-2.5 px-3" style={{ fontSize: 10, color: T.t4 }}>{tc.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-1.5 shrink-0" style={{ background: T.card, borderTop: `1px solid ${T.bd}` }}>
          <span style={{ fontSize: 10, color: T.t4 }}>Showing {TC_LIST_DATA.length} of 128 test cases</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-0.5 rounded" style={{ fontSize: 10, color: T.brand, fontWeight: 500, background: T.accentLight }}>1</button>
            <button className="px-2 py-0.5 rounded transition-colors" style={{ fontSize: 10, color: T.t3 }}
              onMouseEnter={e => e.currentTarget.style.background = T.muted}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>2</button>
            <button className="px-2 py-0.5 rounded transition-colors" style={{ fontSize: 10, color: T.t3 }}
              onMouseEnter={e => e.currentTarget.style.background = T.muted}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>3</button>
            <span style={{ fontSize: 10, color: T.t4 }}>...</span>
            <button className="px-2 py-0.5 rounded transition-colors" style={{ fontSize: 10, color: T.t3 }}
              onMouseEnter={e => e.currentTarget.style.background = T.muted}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>16</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DEMO TOGGLE (top bar control)
   ═══════════════════════════════════════════════════════════════ */
const DemoToggle = ({ entry, setEntry }) => (
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
const PipelineBar = ({ step, done }) => (
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
const InputCollapsed = ({ entry, onExpand, onGenerate, generating }) => (
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
      <button onClick={onExpand} className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
        style={{ fontSize: 11, color: T.t3, border: `1px solid ${T.bd}` }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.brand; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.color = T.t3; }}>
        Edit input <ChevronDown size={10} />
      </button>
      {!generating ? (
        <button onClick={onGenerate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors"
          style={{ background: T.brand, color: "#fff", fontSize: 12, fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.background = T.accent}
          onMouseLeave={e => e.currentTarget.style.background = T.brand}>
          <Sparkles size={12} /> Generate
        </button>
      ) : (
        <span className="flex items-center gap-1.5 px-3 py-1.5" style={{ fontSize: 12, color: T.t4 }}>
          <Loader2 size={12} className="animate-spin" style={{ color: T.brand }} /> Generating...
        </span>
      )}
    </div>
  </div>
);

const InputExpanded = ({ entry, onCollapse, onGenerate, text, setText, files, setFiles }) => (
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
        <span style={{ fontSize: 10, color: T.t4 }}>{text.length} / 32,000</span>
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
        <button onClick={onGenerate} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors"
          style={{ background: T.brand, color: "#fff", fontSize: 12, fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.background = T.accent}
          onMouseLeave={e => e.currentTarget.style.background = T.brand}>
          <Sparkles size={12} /> Generate
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   CLARIFICATION CARD
   ═══════════════════════════════════════════════════════════════ */
const ClarCard = ({ c, onResolve }) => {
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
const DetailPanel = ({ tc, onClose, onAccept, onReject }) => {
  if (!tc) return null;
  const confColor = tc.confidence === "high" ? "rgba(22,163,74," : tc.confidence === "medium" ? "rgba(217,119,6," : "rgba(220,38,38,";
  return (
    <div className="overflow-y-auto" style={{ flex: 1, minWidth: 0, background: T.card, borderLeft: `1px solid ${T.bd}` }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6 }}>Test Case Detail</span>
        <button onClick={onClose} className="p-1 rounded-md" style={{ color: T.t4 }}
          onMouseEnter={e => e.currentTarget.style.color = T.t1}
          onMouseLeave={e => e.currentTarget.style.color = T.t4}>
          <X size={13} />
        </button>
      </div>
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
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Steps ({tc.stepsData?.length})</span>
            <button className="flex items-center gap-1" style={{ fontSize: 10, color: T.brand }}><Pencil size={9} /> Edit</button>
          </div>
          <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${T.bd}` }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: T.muted }}>
                  <th className="text-left px-2 py-1" style={{ fontSize: 9, fontWeight: 600, color: T.t4, width: 24 }}>#</th>
                  <th className="text-left px-2 py-1" style={{ fontSize: 9, fontWeight: 600, color: T.t4 }}>Action</th>
                  <th className="text-left px-2 py-1" style={{ fontSize: 9, fontWeight: 600, color: T.t4 }}>Expected</th>
                </tr>
              </thead>
              <tbody>
                {tc.stepsData?.map((s, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.bdLight}` }}>
                    <td className="px-2 py-1.5 align-top" style={{ fontSize: 10, color: T.t4 }}>{i + 1}</td>
                    <td className="px-2 py-1.5 align-top" style={{ fontSize: 10, color: T.t2, lineHeight: 1.45 }}>{s.action}</td>
                    <td className="px-2 py-1.5 align-top" style={{ fontSize: 10, color: T.t2, lineHeight: 1.45 }}>{s.expected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   POST-SAVE VIEW
   ═══════════════════════════════════════════════════════════════ */
const PostSaveView = ({ savedCount, isJ1 }) => (
  <div className="flex-1 overflow-y-auto p-5">
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="rounded-lg p-5" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(22,163,74,0.08)", border: "1.5px solid rgba(22,163,74,0.2)" }}>
            <Check size={16} style={{ color: T.green }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.t1 }}>{savedCount} test cases saved</div>
            {isJ1 && <div style={{ fontSize: 11, color: T.brand, marginTop: 2 }}>Linked to TO-8526 &middot; User authentication flow</div>}
          </div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Next steps</div>
        {[
          { icon: Play, title: `Execute these ${savedCount} test cases`, desc: "Create a test run with just-saved TCs", conf: "2 ready, 2 need review, 1 manual" },
          ...(isJ1 ? [{ icon: Play, title: "Execute all for TO-8526 (12 test cases)", desc: "Includes 7 existing + " + savedCount + " just saved", conf: "7 ready, 3 review, 2 manual" }] : []),
          { icon: Sparkles, title: "Generate more test cases", desc: "Keep generating for uncovered areas" },
        ].map((opt, i) => (
          <div key={i} className="rounded-md mb-2 p-3 cursor-pointer transition-colors"
            style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdLight; e.currentTarget.style.background = T.bg; }}>
            <div className="flex items-center gap-2">
              <opt.icon size={14} style={{ color: opt.icon === Sparkles ? T.purple : T.brand }} strokeWidth={1.6} />
              <span style={{ fontSize: 12, fontWeight: 500, color: T.t1 }}>{opt.title}</span>
            </div>
            <div style={{ fontSize: 11, color: T.t3, marginTop: 2, marginLeft: 22 }}>{opt.desc}</div>
            {opt.conf && (
              <div className="flex items-center gap-2 mt-1.5 ml-5" style={{ fontSize: 10, color: T.t4 }}>
                AI Confidence: {opt.conf}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN APP — Full flow with entry pages
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
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

  // Reset when entry changes
  useEffect(() => {
    setPhase("entry");
    setPipeStep(0);
    setStreamCount(0);
    setCases([]);
    setSelectedId(null);
    setTab("review");
    setClars(CLARS.map(c => ({ ...c })));
    setText("");
    setFiles([]);
    setShowGenMore(false);
  }, [entry]);

  // Navigate from entry page to workspace
  const goToWorkspace = () => {
    if (isJ1) {
      setText("The system shall support login with email and password. Session tokens expire after 30 minutes of inactivity. Failed login attempts are tracked, and accounts are locked after 5 consecutive failures.");
      setFiles([{ name: "auth-flow-spec.pdf", size: "1.2 MB" }]);
      setInputExpanded(true); // J1 = expanded, pre-filled for review
    } else {
      setText("");
      setFiles([]);
      setInputExpanded(true); // J2 = expanded, empty for filling
    }
    setPhase("workspace-idle");
  };

  // Start generation
  const handleGenerate = () => {
    setPhase("workspace-gen");
    setPipeStep(0);
    setStreamCount(0);
    setCases([]);
    setSelectedId(null);
    setTab("review");
    setClars(CLARS.map(c => ({ ...c })));
    setInputExpanded(false);
  };

  // Pipeline + streaming simulation
  useEffect(() => {
    if (phase !== "workspace-gen") return;
    const allCases = ALL_CASES.map(c => ({ ...c, status: "review" }));
    const timers = [
      setTimeout(() => setPipeStep(1), 1500),
      setTimeout(() => { setPipeStep(2); setCases(allCases.slice(0, 1)); setStreamCount(1); }, 3000),
      setTimeout(() => { setCases(allCases.slice(0, 2)); setStreamCount(2); }, 3800),
      setTimeout(() => { setPipeStep(3); setCases(allCases.slice(0, 3)); setStreamCount(3); }, 5000),
      setTimeout(() => { setCases(allCases.slice(0, 4)); setStreamCount(4); }, 5800),
      setTimeout(() => { setCases(allCases.slice(0, 5)); setStreamCount(5); }, 6500),
      setTimeout(() => { setCases(allCases); setStreamCount(6); setPhase("workspace-done"); }, 7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Helpers
  const accept = (id) => setCases(p => p.map(c => c.id === id ? { ...c, status: "accepted" } : c));
  const reject = (id) => setCases(p => p.map(c => c.id === id ? { ...c, status: "rejected" } : c));
  const acceptGroup = (area) => setCases(p => p.map(c => c.area === area && c.status === "review" ? { ...c, status: "accepted" } : c));

  const review = cases.filter(c => c.status === "review");
  const accepted = cases.filter(c => c.status === "accepted");
  const rejected = cases.filter(c => c.status === "rejected");
  const selectedTC = selectedId ? cases.find(c => c.id === selectedId) : null;

  const groups = {};
  review.forEach(c => { if (!groups[c.area]) groups[c.area] = []; groups[c.area].push(c); });

  const confCount = { h: cases.filter(c => c.confidence === "high").length, m: cases.filter(c => c.confidence === "medium").length, l: cases.filter(c => c.confidence === "low").length };

  // Breadcrumb
  const breadPath = phase === "entry"
    ? (isJ1 ? ["Requirements", "TO-8526"] : ["Tests", "Test Cases"])
    : phase === "saved"
    ? (isJ1 ? ["Requirements", "TO-8526", "Generation Complete"] : ["Tests", "Test Cases", "Generation Complete"])
    : (isJ1 ? ["Requirements", "TO-8526", "Generate Tests"] : ["Tests", "Test Cases", "Create with AI"]);

  const isWorkspace = phase.startsWith("workspace");

  return (
    <div className="flex h-screen" style={{ ...F, background: T.bg, color: T.t2 }}>
      <Sidebar active={isJ1 ? "plans" : "tests"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        {/* Demo toggle bar */}
        <div className="flex items-center justify-between px-5 py-1.5 shrink-0" style={{ background: "rgba(124,58,237,0.04)", borderBottom: `1px solid rgba(124,58,237,0.12)` }}>
          <span style={{ fontSize: 10, color: T.purple, fontWeight: 500 }}>PROTOTYPE DEMO</span>
          <DemoToggle entry={entry} setEntry={setEntry} />
        </div>

        <Bread path={breadPath} />

        {/* ─── ENTRY PAGES ─── */}
        {phase === "entry" && isJ1 && <ReqDetailPage onGenerate={goToWorkspace} />}
        {phase === "entry" && !isJ1 && <TestCaseListPage onCreateWithAI={goToWorkspace} />}

        {/* ─── WORKSPACE ─── */}
        {(isWorkspace || phase === "saved") && (
          <>
            {/* Back nav */}
            <div className="px-5 py-1.5 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
              <button onClick={() => setPhase("entry")} className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 12, color: T.t3 }}
                onMouseEnter={e => e.currentTarget.style.color = T.brand}
                onMouseLeave={e => e.currentTarget.style.color = T.t3}>
                <ArrowLeft size={13} /> Back to {isJ1 ? "TO-8526" : "Test Cases"}
              </button>
            </div>

            {/* Input section (not shown in saved) */}
            {isWorkspace && !inputExpanded && (
              <InputCollapsed entry={entry} onExpand={() => setInputExpanded(true)} onGenerate={handleGenerate} generating={phase === "workspace-gen"} />
            )}
            {isWorkspace && inputExpanded && (
              <InputExpanded entry={entry} onCollapse={() => setInputExpanded(false)} onGenerate={handleGenerate} text={text} setText={setText} files={files} setFiles={setFiles} />
            )}

            {/* Pipeline bar — visible during and after generation */}
            {(phase === "workspace-gen" || phase === "workspace-done") && (
              <PipelineBar step={pipeStep} done={phase === "workspace-done"} />
            )}

            {/* Pre-generation hint — subtle, not a big empty void */}
            {phase === "workspace-idle" && (
              <div className="flex-1 flex flex-col items-center justify-center" style={{ background: T.bg }}>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{ background: T.card, border: `1px solid ${T.bdLight}` }}>
                  <Sparkles size={14} style={{ color: T.purple, opacity: 0.5 }} />
                  <span style={{ fontSize: 12, color: T.t4 }}>
                    {isJ1 ? "Review your input above, adjust if needed, then click Generate." : "Describe your requirements above, then click Generate."}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3" style={{ fontSize: 10, color: T.t4 }}>
                  <span>Results will stream here as they're generated</span>
                </div>
              </div>
            )}

            {/* ─── SPLIT SCREEN: Context (left) + Results (right) ─── */}
            {(phase === "workspace-gen" || phase === "workspace-done") && (
              <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>

                {/* LEFT: Context + Clarifications */}
                <div className="overflow-y-auto" style={{ flex: "0 0 260px", borderRight: `1px solid ${T.bd}`, background: T.card }}>
                  <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6 }}>Input Context</span>
                  </div>
                  <div className="px-3 py-2.5">
                    {/* Req text preview */}
                    <div className="rounded-md mb-2 p-2" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
                      <div style={{ fontSize: 11, color: T.t2, lineHeight: 1.5, maxHeight: 60, overflow: "hidden" }}>
                        The system shall support login with email and password. Session tokens expire after 30 minutes...
                      </div>
                      <button className="mt-1 flex items-center gap-1" style={{ fontSize: 10, color: T.brand }}>
                        <ChevronDown size={9} /> Show full text
                      </button>
                    </div>
                    {/* File */}
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md mb-2" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
                      <File size={10} style={{ color: T.brand }} />
                      <span style={{ fontSize: 10, color: T.t2, fontWeight: 500 }}>auth-flow-spec.pdf</span>
                      <span style={{ fontSize: 9, color: T.t4 }}>1.2 MB</span>
                    </div>
                    {/* Req link */}
                    {isJ1 && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md mb-3" style={{ background: T.accentLight, border: `1px solid ${T.accentBorder}` }}>
                        <Link2 size={10} style={{ color: T.brand }} />
                        <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>TO-8526</span>
                      </div>
                    )}
                    {/* Clarifications */}
                    {(pipeStep >= 2 || phase === "workspace-done") && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle size={10} style={{ color: T.amber }} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: T.t3, textTransform: "uppercase", letterSpacing: 0.4 }}>Clarifications</span>
                        </div>
                        <div style={{ fontSize: 10, color: T.t4, marginBottom: 6, lineHeight: 1.4 }}>Answers improve next round</div>
                        {clars.map(c => <ClarCard key={c.id} c={c} onResolve={resolveC} />)}
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

                {/* RIGHT: Results */}
                <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
                  {/* Tab bar */}
                  <div className="flex items-center justify-between px-4 pt-2 shrink-0" style={{ borderBottom: `1px solid ${T.bd}`, background: T.card }}>
                    <div className="flex items-center gap-0">
                      {[
                        { id: "review", label: `Review (${review.length})` },
                        { id: "accepted", label: `Accepted (${accepted.length})` },
                        { id: "rejected", label: `Rejected (${rejected.length})` },
                      ].map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setSelectedId(null); }}
                          className="px-3 py-2 transition-colors"
                          style={{ fontSize: 11, fontWeight: tab === t.id ? 500 : 400, color: tab === t.id ? T.brand : T.t3, borderBottom: tab === t.id ? `2px solid ${T.brand}` : "2px solid transparent", marginBottom: -1 }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ fontSize: 10, color: T.t3, background: T.muted }}>
                        Confidence <ArrowUpDown size={8} />
                      </button>
                    </div>
                  </div>

                  {/* Content area: list + optional detail */}
                  <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
                    {/* TC list / table */}
                    <div className="overflow-y-auto flex-1" style={selectedTC ? { flex: "0 0 280px", borderRight: `1px solid ${T.bd}` } : {}}>
                      {/* REVIEW TAB */}
                      {tab === "review" && (
                        <div>
                          {phase === "workspace-gen" && streamCount < ALL_CASES.length && (
                            <div className="flex items-center gap-2 px-4 py-1.5" style={{ background: T.accentLight, borderBottom: `1px solid ${T.accentBorder}` }}>
                              <Loader2 size={11} style={{ color: T.brand }} className="animate-spin" />
                              <span style={{ fontSize: 11, color: T.brand }}>Streaming... {streamCount}/{ALL_CASES.length}</span>
                            </div>
                          )}

                          {/* Table header — only when detail not open */}
                          {!selectedTC && (
                            <div className="flex items-center px-4 py-1.5" style={{ borderBottom: `1px solid ${T.bd}`, background: T.muted }}>
                              <span style={{ flex: 1, fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Test Case</span>
                              <span style={{ width: 70, fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>Confidence</span>
                              <span style={{ width: 48, fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>Steps</span>
                              <span style={{ width: 60, fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>Pri</span>
                              <span style={{ width: 56, fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>Actions</span>
                            </div>
                          )}

                          {Object.entries(groups).map(([area, gCases]) => (
                            <div key={area}>
                              {/* Feature area group header */}
                              <div className="flex items-center justify-between px-4 py-1.5" style={{ background: "rgba(94,106,210,0.03)", borderBottom: `1px solid ${T.bdLight}` }}>
                                <div className="flex items-center gap-2">
                                  <FolderOpen size={11} style={{ color: T.brand }} strokeWidth={1.5} />
                                  <span style={{ fontSize: 11, fontWeight: 600, color: T.t1, textTransform: "uppercase", letterSpacing: 0.3 }}>{area}</span>
                                  <span className="px-1 rounded" style={{ fontSize: 9, fontWeight: 600, color: T.t4, background: T.muted }}>{gCases.length}</span>
                                </div>
                                {!selectedTC && (
                                  <button onClick={() => acceptGroup(area)} className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors"
                                    style={{ fontSize: 10, color: T.green, fontWeight: 500 }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(22,163,74,0.06)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <Check size={9} /> Accept group
                                  </button>
                                )}
                              </div>

                              {gCases.map(tc => (
                                <div key={tc.id} className="flex items-center cursor-pointer transition-all"
                                  style={{
                                    background: selectedId === tc.id ? T.accentLight : T.card,
                                    borderBottom: `1px solid ${T.bdLight}`,
                                    padding: selectedTC ? "6px 10px" : "0",
                                  }}
                                  onClick={() => setSelectedId(selectedId === tc.id ? null : tc.id)}
                                  onMouseEnter={e => { if (selectedId !== tc.id) e.currentTarget.style.background = T.hover; }}
                                  onMouseLeave={e => { if (selectedId !== tc.id) e.currentTarget.style.background = selectedId === tc.id ? T.accentLight : T.card; }}>

                                  {selectedTC ? (
                                    /* Compact row when detail panel open */
                                    <div className="flex items-center gap-2 w-full min-w-0">
                                      <ConfBadge level={tc.confidence} />
                                      <span className="truncate" style={{ fontSize: 11, color: T.t1, fontWeight: selectedId === tc.id ? 500 : 400 }}>{tc.name}</span>
                                    </div>
                                  ) : (
                                    /* Full table row */
                                    <>
                                      <div style={{ flex: 1, padding: "8px 16px", minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 500, color: T.t1, marginBottom: 2 }}>{tc.name}</div>
                                        <div style={{ fontSize: 10, color: T.t4, marginBottom: 3 }}>Tests: {tc.chain}</div>
                                        {/* Tags */}
                                        {tc.tags && tc.tags.length > 0 && (
                                          <div className="flex items-center gap-1 flex-wrap">
                                            {tc.tags.map(tag => (
                                              <span key={tag} className="inline-flex items-center px-1.5 py-px rounded"
                                                style={{ fontSize: 9, fontWeight: 500, color: T.t3, background: T.muted, border: `1px solid ${T.bdLight}`, lineHeight: "14px" }}>
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <div style={{ width: 70, textAlign: "center", flexShrink: 0 }}>
                                        <ConfBadge level={tc.confidence} />
                                      </div>
                                      <div style={{ width: 48, textAlign: "center", fontSize: 11, color: T.t3, flexShrink: 0 }}>{tc.steps}</div>
                                      <div style={{ width: 60, textAlign: "center", flexShrink: 0 }}>
                                        <PriBadge level={tc.priority} />
                                      </div>
                                      <div style={{ width: 56, display: "flex", justifyContent: "center", gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                        <button onClick={() => accept(tc.id)} className="p-1 rounded transition-colors" style={{ color: T.t4 }}
                                          onMouseEnter={e => { e.currentTarget.style.color = T.green; e.currentTarget.style.background = "rgba(22,163,74,0.06)"; }}
                                          onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.background = "transparent"; }}>
                                          <Check size={13} />
                                        </button>
                                        <button onClick={() => reject(tc.id)} className="p-1 rounded transition-colors" style={{ color: T.t4 }}
                                          onMouseEnter={e => { e.currentTarget.style.color = T.red; e.currentTarget.style.background = "rgba(220,38,38,0.06)"; }}
                                          onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.background = "transparent"; }}>
                                          <X size={13} />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}

                          {/* Coverage gaps */}
                          {phase === "workspace-done" && review.length > 0 && !selectedTC && (
                            <div className="flex items-center gap-3 px-4 py-2" style={{ background: "rgba(217,119,6,0.04)", borderBottom: "1px solid rgba(217,119,6,0.12)" }}>
                              <AlertTriangle size={11} style={{ color: T.amber }} />
                              <span style={{ fontSize: 11, color: T.t2 }}>
                                Coverage gaps: <strong>role-based access</strong>, <strong>OAuth/SSO</strong>
                              </span>
                              <button className="flex items-center gap-1 ml-auto" style={{ fontSize: 10, color: T.brand, fontWeight: 500 }}>
                                <Plus size={9} /> Generate for gaps
                              </button>
                            </div>
                          )}

                          {review.length === 0 && (
                            <div className="py-8 text-center">
                              <CheckCircle2 size={20} style={{ color: T.green, margin: "0 auto 6px" }} />
                              <div style={{ fontSize: 12, color: T.t3 }}>All reviewed</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ACCEPTED TAB — Commit mode */}
                      {tab === "accepted" && (
                        <div>
                          {accepted.length > 0 ? (
                            <>
                              {/* Batch defaults bar */}
                              <div className="flex items-center gap-3 px-4 py-2" style={{ background: T.muted, borderBottom: `1px solid ${T.bd}` }}>
                                <span style={{ fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.4 }}>Batch defaults</span>
                                <div className="flex items-center gap-1.5">
                                  <FolderOpen size={10} style={{ color: T.t4 }} />
                                  <select style={{ fontSize: 11, fontWeight: 400, color: T.t2, background: T.card, border: `1px solid ${T.bd}`, borderRadius: 4, padding: "2px 6px" }}>
                                    <option>Authentication Tests</option>
                                    {MOCK_FOLDERS.map(f => <option key={f}>{f}</option>)}
                                  </select>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users size={10} style={{ color: T.t4 }} />
                                  <select style={{ fontSize: 11, fontWeight: 400, color: T.t2, background: T.card, border: `1px solid ${T.bd}`, borderRadius: 4, padding: "2px 6px" }}>
                                    <option>Unassigned</option>
                                    <option>Huy Dao</option>
                                    <option>Anh Le</option>
                                  </select>
                                </div>
                                <button className="ml-auto text-xs" style={{ color: T.brand, fontWeight: 500, fontSize: 10 }}>Apply to all</button>
                              </div>
                              <div className="px-3 py-2.5">
                                {accepted.map(tc => (
                                  <div key={tc.id} className="rounded-md mb-2 p-3" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: T.t1, marginBottom: 4 }}>{tc.name}</div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <ConfBadge level={tc.confidence} />
                                      <span style={{ fontSize: 10, color: T.t4 }}>{tc.steps} steps</span>
                                      <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
                                      <span style={{ fontSize: 10, color: T.t4 }}>Priority</span>
                                      <select style={{ fontSize: 10, fontWeight: 400, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 3, padding: "1px 4px" }}>
                                        <option>{tc.priority}</option>
                                        <option>High</option><option>Medium</option><option>Low</option>
                                      </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                      <div>
                                        <label style={{ fontSize: 9, color: T.t4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Feature area</label>
                                        <select className="w-full" style={{ fontSize: 11, fontWeight: 400, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 4, padding: "3px 6px", marginTop: 2 }}>
                                          <option>{tc.area}</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label style={{ fontSize: 9, color: T.t4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Type</label>
                                        <select className="w-full" style={{ fontSize: 11, fontWeight: 400, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 4, padding: "3px 6px", marginTop: 2 }}>
                                          <option>Functional</option><option>Security</option><option>Regression</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div>
                                      <label style={{ fontSize: 9, color: T.t4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3, display: "block" }}>Tags</label>
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <Badge color={T.purple} bg="rgba(124,58,237,0.06)" border="rgba(124,58,237,0.15)">ai-generated</Badge>
                                        {tc.confidence !== "high" && <Badge color={T.amber} bg="rgba(217,119,6,0.06)" border="rgba(217,119,6,0.15)">needs-review</Badge>}
                                        <button className="flex items-center gap-0.5 px-1 py-px rounded" style={{ fontSize: 9, color: T.brand, border: `1px dashed ${T.accentBorder}` }}>
                                          <Plus size={8} /> Add tag
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {/* Summary footer */}
                              <div className="px-4 py-2" style={{ borderTop: `1px solid ${T.bdLight}`, background: T.bg }}>
                                <span style={{ fontSize: 10, color: T.t3 }}>
                                  {accepted.length} test cases &middot; {isJ1 ? "Linked to TO-8526" : "No requirement link"} &middot; {Object.keys(groups).length > 0 ? Object.keys(groups).length : "—"} feature areas
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="py-8 text-center" style={{ fontSize: 11, color: T.t4 }}>Accept test cases from Review tab</div>
                          )}
                        </div>
                      )}

                      {/* REJECTED TAB */}
                      {tab === "rejected" && (
                        <div className="px-3 py-2.5">
                          {rejected.length > 0 ? rejected.map(tc => (
                            <div key={tc.id} className="flex items-center justify-between px-3 py-2 rounded-md mb-1" style={{ background: T.bg, border: `1px solid ${T.bdLight}`, opacity: 0.7 }}>
                              <span style={{ fontSize: 11, color: T.t3 }}>{tc.name}</span>
                              <button onClick={() => setCases(p => p.map(c => c.id === tc.id ? { ...c, status: "review" } : c))}
                                style={{ fontSize: 10, color: T.brand, textDecoration: "underline" }}>Restore</button>
                            </div>
                          )) : (
                            <div className="py-8 text-center" style={{ fontSize: 11, color: T.t4 }}>No rejected test cases</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Detail panel — takes remaining width */}
                    {selectedTC && <DetailPanel tc={selectedTC} onClose={() => setSelectedId(null)} onAccept={accept} onReject={reject} />}
                  </div>

                  {/* ACTION BAR */}
                  <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ borderTop: `1px solid ${T.bd}`, background: T.hover }}>
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
                      <button onClick={() => { setInputExpanded(true); window.scrollTo(0, 0); }}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors"
                        style={{ fontSize: 11, color: T.t3, border: `1px solid ${T.bd}` }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.muted; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        <Pencil size={10} /> Refine input
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors"
                        style={{ fontSize: 11, color: T.brand }}
                        onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        Ask Kai <ExternalLink size={8} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 10, color: T.t3 }}>{cases.length} gen</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />
                      <span style={{ fontSize: 10, color: T.green }}>{confCount.h}</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.amber }} />
                      <span style={{ fontSize: 10, color: T.amber }}>{confCount.m}</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.red }} />
                      <span style={{ fontSize: 10, color: T.red }}>{confCount.l}</span>
                      <IBtn title="Helpful"><ThumbsUp size={11} strokeWidth={1.4} /></IBtn>
                      <IBtn title="Not helpful"><ThumbsDown size={11} strokeWidth={1.4} /></IBtn>
                    </div>
                  </div>

                  {/* Save button */}
                  {tab === "accepted" && accepted.length > 0 && (
                    <div className="px-4 py-2 shrink-0" style={{ borderTop: `1px solid ${T.bd}`, background: T.card }}>
                      <button onClick={() => { setPhase("saved"); flash(`${accepted.length} test cases saved`); }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors"
                        style={{ background: T.brand, color: "#fff", fontSize: 12, fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.background = T.accent}
                        onMouseLeave={e => e.currentTarget.style.background = T.brand}>
                        <Check size={13} /> Save {accepted.length} test cases to repository
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* POST-SAVE */}
            {phase === "saved" && <PostSaveView savedCount={accepted.length || 5} isJ1={isJ1} />}
          </>
        )}
      </div>
      <Toast {...toast} />
    </div>
  );
}
