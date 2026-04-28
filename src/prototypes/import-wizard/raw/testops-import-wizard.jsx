import { useState, useMemo, useCallback } from "react";
import {
  Home, ClipboardList, FlaskConical, Package, Play, BarChart3, Cloud, Settings,
  Bell, ChevronDown, ChevronRight, ChevronLeft, Plus, Check, X, MoreHorizontal,
  UploadCloud, FileText, Search, AlertTriangle, Info, ArrowLeft, ArrowRight,
  Save, Lock, ShieldCheck, Edit3, Trash2, FileSpreadsheet, HelpCircle,
  CheckCircle2, XCircle, MinusCircle, Download, RefreshCw, CornerDownRight,
} from "lucide-react";

// ============================================================================
// Design tokens
// ============================================================================
const T = {
  bg: "#f7f8fa", card: "#ffffff", muted: "#f3f4f6", hover: "#f9fafb", pressed: "#eef0f2",
  sidebar: "#ffffff", sidebarBd: "#e5e7eb",
  sidebarIcon: "#9ca3af", sidebarIconHover: "#374151", sidebarActive: "#5e6ad2",
  t1: "#111827", t2: "#374151", t3: "#6b7280", t4: "#9ca3af",
  brand: "#5e6ad2", accent: "#4f46e5",
  accentLight: "rgba(94,106,210,0.08)", accentBorder: "rgba(94,106,210,0.22)",
  green: "#16a34a", greenBg: "#dcfce7",
  red: "#dc2626", redBg: "#fee2e2",
  amber: "#d97706", amberBg: "#fef3c7",
  bd: "#e5e7eb", bdLight: "#f0f0f2",
};
const F = {
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFeatureSettings: '"cv01","ss03"',
};

// ============================================================================
// Shell
// ============================================================================
const NAV = [
  { icon: Home, id: "home" }, { icon: ClipboardList, id: "plans" },
  { icon: FlaskConical, id: "tests", active: true }, { icon: Package, id: "assets" },
  { icon: Play, id: "executions" }, { icon: BarChart3, id: "reports" },
  { icon: Cloud, id: "testcloud" }, { icon: Settings, id: "settings" },
];

const Sidebar = () => (
  <div className="w-12 flex flex-col items-center py-3 gap-0.5 shrink-0"
    style={{ background: T.sidebar, borderRight: `1px solid ${T.sidebarBd}` }}>
    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold mb-4"
      style={{ background: T.sidebarActive }}>K</div>
    {NAV.map(({ icon: Icon, id, active }) => (
      <button key={id}
        className="w-9 h-9 rounded-md flex items-center justify-center"
        style={{
          background: active ? T.accentLight : "transparent",
          color: active ? T.sidebarActive : T.sidebarIcon,
        }}>
        <Icon size={17} strokeWidth={1.6} />
      </button>
    ))}
  </div>
);

const TopBar = () => (
  <div className="h-11 shrink-0 flex items-center justify-between px-4 border-b"
    style={{ background: T.card, borderColor: T.bd }}>
    <div className="flex items-center gap-2" style={{ color: T.t2, fontSize: 12 }}>
      <span style={{ fontWeight: 500 }}>TestOps</span>
      <ChevronRight size={13} style={{ color: T.t4 }} />
      <span>RA Project</span>
      <ChevronDown size={13} style={{ color: T.t4 }} />
    </div>
    <div className="flex items-center gap-3">
      <button className="h-7 px-2.5 rounded-md text-[12px] flex items-center gap-1.5"
        style={{ color: T.t3, background: "transparent" }}>
        <HelpCircle size={13} strokeWidth={1.6} /> Help
      </button>
      <Bell size={15} strokeWidth={1.6} style={{ color: T.t3 }} />
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
        style={{ background: T.brand }}>H</div>
    </div>
  </div>
);

const Bread = ({ path, onBack }) => (
  <div className="h-9 shrink-0 px-5 flex items-center gap-1.5 border-b"
    style={{ background: T.card, borderColor: T.bd, fontSize: 12, color: T.t3 }}>
    {onBack && (
      <button onClick={onBack} className="flex items-center gap-1 mr-1" style={{ color: T.t3 }}>
        <ArrowLeft size={13} strokeWidth={1.6} />
      </button>
    )}
    {path.map((p, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i > 0 && <span style={{ color: T.t4 }}>/</span>}
        <span style={{ color: i === path.length - 1 ? T.t1 : T.t3, fontWeight: i === path.length - 1 ? 500 : 400 }}>{p}</span>
      </span>
    ))}
  </div>
);

// ============================================================================
// Atoms
// ============================================================================
const Badge = ({ children, color = "gray", icon: Icon }) => {
  const map = {
    green: { bg: T.greenBg, fg: T.green },
    red: { bg: T.redBg, fg: T.red },
    amber: { bg: T.amberBg, fg: T.amber },
    gray: { bg: T.muted, fg: T.t3 },
    brand: { bg: T.accentLight, fg: T.brand },
  };
  const c = map[color];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5" style={{ background: c.bg, color: c.fg, fontSize: 10.5, fontWeight: 500 }}>
      {Icon && <Icon size={10} strokeWidth={2} />}
      {children}
    </span>
  );
};

const Btn = ({ children, variant = "ghost", icon: Icon, onClick, disabled, size = "md" }) => {
  const h = size === "sm" ? 26 : 30;
  const base = {
    height: h, fontSize: 12.5, fontWeight: 500,
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: size === "sm" ? "0 8px" : "0 10px",
    borderRadius: 6, transition: "all .1s",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
  const styles = {
    primary: { ...base, background: T.brand, color: "#fff", border: "none" },
    secondary: { ...base, background: T.card, color: T.t2, border: `1px solid ${T.bd}` },
    ghost: { ...base, background: "transparent", color: T.t2, border: "none" },
    danger: { ...base, background: "transparent", color: T.red, border: `1px solid ${T.bd}` },
  };
  return (
    <button style={styles[variant]} onClick={onClick} disabled={disabled}
      onMouseEnter={e => { if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = T.accent;
        else if (variant === "secondary") e.currentTarget.style.background = T.hover;
        else if (variant === "ghost") e.currentTarget.style.background = T.muted;
      }}
      onMouseLeave={e => { if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = T.brand;
        else if (variant === "secondary") e.currentTarget.style.background = T.card;
        else if (variant === "ghost") e.currentTarget.style.background = "transparent";
      }}>
      {Icon && <Icon size={13} strokeWidth={1.8} />}
      {children}
    </button>
  );
};

// ============================================================================
// Wizard progress
// ============================================================================
const STEPS = [
  { id: 1, label: "Upload file" },
  { id: 2, label: "Map fields" },
  { id: 3, label: "Review & import" },
];

const WizardBar = ({ current, completed, onJump }) => (
  <div className="flex items-center gap-1 px-5 py-3 border-b" style={{ background: T.card, borderColor: T.bd }}>
    {STEPS.map((s, i) => {
      const isDone = completed.has(s.id);
      const isActive = current === s.id;
      const clickable = isDone;
      return (
        <div key={s.id} className="flex items-center gap-1">
          <button onClick={() => clickable && onJump(s.id)}
            disabled={!clickable && !isActive}
            className="flex items-center gap-2 h-8 px-2.5 rounded-md"
            style={{
              background: isActive ? T.accentLight : "transparent",
              cursor: clickable ? "pointer" : "default",
            }}
            onMouseEnter={e => { if (clickable && !isActive) e.currentTarget.style.background = T.muted; }}
            onMouseLeave={e => { if (clickable && !isActive) e.currentTarget.style.background = "transparent"; }}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{
              background: isDone ? T.green : isActive ? T.brand : T.muted,
              color: isDone || isActive ? "#fff" : T.t3,
              fontSize: 10, fontWeight: 600,
            }}>
              {isDone ? <Check size={11} strokeWidth={2.5} /> : s.id}
            </span>
            <span style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 500, color: isActive ? T.t1 : isDone ? T.t2 : T.t3 }}>
              {s.label}
            </span>
          </button>
          {i < STEPS.length - 1 && <ChevronRight size={13} style={{ color: T.t4 }} />}
        </div>
      );
    })}
  </div>
);

// ============================================================================
// Step 1: Upload
// ============================================================================
const Step1 = ({ file, setFile, onNext }) => {
  const [adv, setAdv] = useState(false);
  const [encoding, setEncoding] = useState("UTF-8");
  const [delimiter, setDelimiter] = useState("Auto");
  const [hasHeader, setHasHeader] = useState(true);

  return (
    <div className="max-w-[880px] mx-auto py-8">
      <h2 style={{ fontSize: 18, fontWeight: 600, color: T.t1, marginBottom: 4 }}>Upload your file</h2>
      <p style={{ fontSize: 13, color: T.t3, marginBottom: 20 }}>
        Upload a CSV or Excel file from TestRail, Zephyr, Xray, or your own spreadsheet. Files up to 50MB, 10,000 rows per import.
      </p>

      {!file ? (
        <label className="block rounded-lg border-2 border-dashed cursor-pointer transition"
          style={{ borderColor: T.bd, background: T.card, padding: 48 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.background = T.card; }}>
          <input type="file" className="hidden" onChange={e => {
            const f = e.target.files?.[0]; if (f) setFile({ name: f.name || "test-cases.csv", rows: 48, columns: 14 });
          }} />
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3" style={{ background: T.accentLight, color: T.brand }}>
              <UploadCloud size={22} strokeWidth={1.6} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.t1 }}>Drop your file here, or click to browse</div>
            <div style={{ fontSize: 12, color: T.t3, marginTop: 4 }}>.csv, .xlsx, .xls &middot; UTF-8 recommended</div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={e => { e.preventDefault(); setFile({ name: "testrail-export.csv", rows: 48, columns: 14 }); }}
                style={{ fontSize: 11.5, color: T.brand, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Use sample TestRail file
              </button>
              <span style={{ color: T.t4 }}>&middot;</span>
              <button onClick={e => e.preventDefault()} style={{ fontSize: 11.5, color: T.brand, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Download a template
              </button>
            </div>
          </div>
        </label>
      ) : (
        <div className="rounded-lg border p-4 flex items-center gap-3" style={{ background: T.card, borderColor: T.bd }}>
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: T.greenBg, color: T.green }}>
            <FileSpreadsheet size={18} strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 13, fontWeight: 600, color: T.t1 }}>{file.name}</div>
            <div style={{ fontSize: 11.5, color: T.t3, marginTop: 2 }}>
              {file.rows} rows &middot; {file.columns} columns detected &middot; first row treated as header
            </div>
          </div>
          <button onClick={() => setFile(null)}
            className="h-7 px-2 rounded-md flex items-center gap-1.5"
            style={{ fontSize: 12, color: T.t3 }}
            onMouseEnter={e => e.currentTarget.style.background = T.muted}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <X size={13} strokeWidth={1.8} /> Replace
          </button>
        </div>
      )}

      {/* Advanced options — collapsed by default (S1-3 fix) */}
      <div className="mt-6 border-t pt-5" style={{ borderColor: T.bdLight }}>
        <button onClick={() => setAdv(!adv)} className="flex items-center gap-1.5"
          style={{ fontSize: 12.5, color: T.t2, fontWeight: 500 }}>
          {adv ? <ChevronDown size={14} strokeWidth={2} /> : <ChevronRight size={14} strokeWidth={2} />}
          Advanced file options
          <span style={{ color: T.t4, fontWeight: 400, marginLeft: 4 }}>
            ({encoding}, {delimiter === "Auto" ? "auto-detect" : delimiter}, header: {hasHeader ? "yes" : "no"})
          </span>
        </button>
        {adv && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Field label="File encoding">
              <select value={encoding} onChange={e => setEncoding(e.target.value)} style={selectStyle}>
                <option>UTF-8</option><option>UTF-16</option><option>ISO-8859-1</option><option>Windows-1252</option>
              </select>
            </Field>
            <Field label="Column delimiter">
              <select value={delimiter} onChange={e => setDelimiter(e.target.value)} style={selectStyle}>
                <option>Auto</option><option>Comma (,)</option><option>Semicolon (;)</option><option>Tab</option>
              </select>
            </Field>
            <Field label="First row is header">
              <select value={hasHeader ? "Yes" : "No"} onChange={e => setHasHeader(e.target.value === "Yes")} style={selectStyle}>
                <option>Yes</option><option>No</option>
              </select>
            </Field>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between pt-5 border-t" style={{ borderColor: T.bd }}>
        <Btn variant="ghost">Cancel</Btn>
        <Btn variant="primary" icon={ArrowRight} onClick={onNext} disabled={!file}>Continue to mapping</Btn>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label style={{ fontSize: 11, color: T.t3, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 6, display: "block" }}>
      {label}
    </label>
    {children}
  </div>
);

const selectStyle = {
  width: "100%", height: 32, padding: "0 10px",
  fontSize: 12, fontWeight: 400, fontFamily: F.fontFamily,
  color: T.t2, background: T.card,
  border: `1px solid ${T.bd}`, borderRadius: 6, outline: "none",
  appearance: "auto",
};

// ============================================================================
// Step 2: Map fields
// ============================================================================

// Target fields available in TestOps
const TARGETS = [
  { id: "__skip__", label: "Don't import this column", group: "" },
  // Required
  { id: "name", label: "Test Case Name", required: true, group: "Required" },
  // Core
  { id: "description", label: "Description", group: "Core" },
  { id: "preconditions", label: "Preconditions", group: "Core" },
  { id: "steps", label: "Test Steps", group: "Core" },
  { id: "expected", label: "Expected Result", group: "Core" },
  { id: "priority", label: "Priority", group: "Core", hasValueMap: true },
  { id: "status", label: "Status", group: "Core", hasValueMap: true },
  { id: "folder", label: "Folder / Location", group: "Core" },
  { id: "tags", label: "Tags", group: "Core" },
  { id: "owner", label: "Assigned to", group: "Core" },
  // Custom (existing)
  { id: "cf_reqId", label: "Requirement ID", group: "Custom field" },
  { id: "cf_feature", label: "Feature Area", group: "Custom field" },
];

// Realistic CSV columns, TestRail-style
const BUILD_ROWS = () => ([
  { id: 1, csv: "Title",            sample: "Verify user can log in with valid credentials",    target: "name",       auto: "alias" },
  { id: 2, csv: "ID",               sample: "C2104",                                            target: "__skip__",   auto: null },
  { id: 3, csv: "Section",          sample: "Authentication > Login",                           target: "folder",     auto: "alias" },
  { id: 4, csv: "Preconditions",    sample: "User has a verified account",                      target: "preconditions", auto: "exact" },
  { id: 5, csv: "Steps",            sample: "1. Navigate to login page\n2. Enter credentials",  target: "steps",      auto: "alias" },
  { id: 6, csv: "Expected Result",  sample: "User lands on dashboard",                          target: "expected",   auto: "exact" },
  { id: 7, csv: "Priority",         sample: "High",                                             target: "priority",   auto: "exact", needsValueMap: true },
  { id: 8, csv: "Type",             sample: "Functional",                                       target: "tags",       auto: "alias" },
  { id: 9, csv: "Status",           sample: "Active",                                           target: "status",     auto: "exact", needsValueMap: true, valueMapDone: false },
  { id: 10, csv: "References",      sample: "JIRA-8821, JIRA-9003",                             target: "cf_reqId",   auto: "alias" },
  { id: 11, csv: "Sprint",          sample: "Sprint 21",                                        target: null,         auto: null, customFieldCandidate: true },
  { id: 12, csv: "Estimate (hrs)",  sample: "0.5",                                              target: null,         auto: null, customFieldCandidate: true },
  { id: 13, csv: "Created By",      sample: "alex.nguyen@acme.com",                             target: "__skip__",   auto: null },
  { id: 14, csv: "Last Modified",   sample: "2026-03-14",                                       target: "__skip__",   auto: null },
]);

const Step2 = ({ rows, setRows, onNext, onBack, role, setRole }) => {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [template, setTemplate] = useState("");
  const [valueMapRow, setValueMapRow] = useState(null);
  const [customFieldFor, setCustomFieldFor] = useState(null);

  const filtered = useMemo(() => {
    if (!filter) return rows;
    const q = filter.toLowerCase();
    return rows.filter(r => r.csv.toLowerCase().includes(q) || r.sample.toLowerCase().includes(q));
  }, [rows, filter]);

  const unmappedRequired = useMemo(() => {
    const mapped = new Set(rows.map(r => r.target).filter(Boolean));
    return TARGETS.filter(t => t.required && !mapped.has(t.id));
  }, [rows]);

  const stats = useMemo(() => {
    let mapped = 0, skipped = 0, needsAction = 0;
    rows.forEach(r => {
      if (r.target === "__skip__") skipped++;
      else if (r.target === null) needsAction++;
      else if (r.needsValueMap && !r.valueMapDone) needsAction++;
      else mapped++;
    });
    return { mapped, skipped, needsAction };
  }, [rows]);

  const updateRow = (id, patch) => setRows(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allFilteredSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));

  const bulkSkip = () => { selected.forEach(id => updateRow(id, { target: "__skip__" })); setSelected(new Set()); };
  const bulkReset = () => { const fresh = BUILD_ROWS(); selected.forEach(id => { const o = fresh.find(r => r.id === id); if (o) updateRow(id, { target: o.target }); }); setSelected(new Set()); };

  const jumpToUnmappedRequired = () => {
    // Demo: auto-fill the name field to unblock
    const nameRow = rows.find(r => r.target !== "name");
    // no-op in demo — user would click into the row highlighted below
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header strip — compact, high info density */}
      <div className="px-5 pt-5 pb-3 border-b shrink-0" style={{ borderColor: T.bdLight, background: T.card }}>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: T.t1 }}>Map your columns to TestOps fields</h2>
            <p style={{ fontSize: 12.5, color: T.t3, marginTop: 2 }}>
              {rows.length} columns from <span style={{ color: T.t2, fontWeight: 500 }}>testrail-export.csv</span>. Adjust any auto-matched field.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select value={template} onChange={e => setTemplate(e.target.value)}
              style={{ ...selectStyle, width: 220, height: 30, fontSize: 12 }}>
              <option value="">Load saved template…</option>
              <option>TestRail export (default)</option>
              <option>Zephyr export</option>
              <option>Acme internal schema</option>
            </select>
            <Btn variant="secondary" icon={Save} size="sm">Save mapping as template</Btn>
          </div>
        </div>

        {/* Status chips — not AI, just parse summary */}
        <div className="flex items-center gap-4">
          <StatChip color="green" value={stats.mapped} label="mapped" />
          {stats.needsAction > 0 && <StatChip color="red" value={stats.needsAction} label="need action" />}
          <StatChip color="gray" value={stats.skipped} label="skipped" />
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search size={13} strokeWidth={1.8} style={{ position: "absolute", left: 8, top: 8.5, color: T.t4 }} />
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter columns…"
                style={{ height: 30, fontSize: 12, padding: "0 10px 0 26px", width: 200, background: T.card,
                  border: `1px solid ${T.bd}`, borderRadius: 6, color: T.t2, fontFamily: F.fontFamily, outline: "none" }} />
            </div>
            {/* Demo: role toggle for custom field permission branch */}
            <div className="flex items-center gap-1 rounded-md p-0.5" style={{ background: T.muted }}>
              {["Admin", "Viewer"].map(r => (
                <button key={r} onClick={() => setRole(r)}
                  style={{
                    height: 24, padding: "0 8px", fontSize: 11, fontWeight: 500, borderRadius: 4,
                    background: role === r ? T.card : "transparent",
                    color: role === r ? T.t1 : T.t3,
                    boxShadow: role === r ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}>{r}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky "required fields missing" banner */}
      {unmappedRequired.length > 0 && (
        <div className="px-5 py-2.5 flex items-center gap-3 border-b" style={{ background: "#fffbeb", borderColor: T.amberBg }}>
          <AlertTriangle size={14} strokeWidth={2} style={{ color: T.amber }} />
          <div style={{ fontSize: 12.5, color: T.t2 }}>
            <strong style={{ color: T.t1, fontWeight: 600 }}>{unmappedRequired.length} required field{unmappedRequired.length > 1 ? "s are" : " is"} not mapped</strong>
            <span style={{ color: T.t3 }}> — {unmappedRequired.map(t => t.label).join(", ")}. You can still continue; unmapped required rows will be shown in Review.</span>
          </div>
          <button onClick={jumpToUnmappedRequired} style={{ fontSize: 12, color: T.brand, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 2, marginLeft: "auto" }}>
            Jump to first →
          </button>
        </div>
      )}

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="px-5 h-10 flex items-center gap-3 border-b" style={{ background: T.accentLight, borderColor: T.accentBorder }}>
          <span style={{ fontSize: 12.5, color: T.t2, fontWeight: 500 }}>{selected.size} row{selected.size > 1 ? "s" : ""} selected</span>
          <span style={{ color: T.t4 }}>&middot;</span>
          <button onClick={bulkSkip} style={{ fontSize: 12, color: T.t2, fontWeight: 500 }}>Skip selected</button>
          <button onClick={bulkReset} style={{ fontSize: 12, color: T.t2, fontWeight: 500 }}>Reset to auto-match</button>
          <button onClick={() => setSelected(new Set())} style={{ fontSize: 12, color: T.t3, marginLeft: "auto" }}>Clear selection</button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table style={{ width: "100%", fontSize: 12.5, borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 5, background: T.card }}>
            <tr style={{ color: T.t3, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.3 }}>
              <Th style={{ width: 36 }}>
                <input type="checkbox" checked={allFilteredSelected}
                  onChange={() => setSelected(s => {
                    const n = new Set(s); const allSel = filtered.every(r => n.has(r.id));
                    filtered.forEach(r => allSel ? n.delete(r.id) : n.add(r.id)); return n;
                  })} />
              </Th>
              <Th style={{ width: 24 }}></Th>
              <Th style={{ width: 200 }}>Source column</Th>
              <Th>Sample value</Th>
              <Th style={{ width: 18 }}></Th>
              <Th style={{ width: 260 }}>TestOps field</Th>
              <Th style={{ width: 180 }}>Value mapping</Th>
              <Th style={{ width: 32 }}></Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const target = TARGETS.find(t => t.id === r.target);
              const isSkipped = r.target === "__skip__";
              const isUnmapped = r.target === null;
              const needsVM = target?.hasValueMap && !r.valueMapDone;
              return (
                <tr key={r.id} style={{
                  background: selected.has(r.id) ? T.accentLight : "transparent",
                  borderTop: `1px solid ${T.bdLight}`,
                }}
                  onMouseEnter={e => !selected.has(r.id) && (e.currentTarget.style.background = T.hover)}
                  onMouseLeave={e => !selected.has(r.id) && (e.currentTarget.style.background = "transparent")}>
                  <Td><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} /></Td>
                  <Td><StatusDot state={isUnmapped ? "unmapped" : isSkipped ? "skipped" : needsVM ? "needsVM" : "mapped"} /></Td>
                  <Td><span style={{ fontWeight: 500, color: isSkipped ? T.t4 : T.t1 }}>{r.csv}</span></Td>
                  <Td>
                    <span style={{
                      color: isSkipped ? T.t4 : T.t3, fontSize: 12,
                      display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{r.sample}</span>
                  </Td>
                  <Td><ArrowRight size={12} strokeWidth={1.6} style={{ color: T.t4 }} /></Td>
                  <Td>
                    {isUnmapped ? (
                      <button onClick={() => r.customFieldCandidate ? setCustomFieldFor(r) : updateRow(r.id, { target: "__skip__" })}
                        style={{
                          height: 28, padding: "0 10px", fontSize: 12, fontWeight: 500,
                          borderRadius: 6, border: `1px dashed ${T.bd}`, background: "transparent",
                          color: T.t2, display: "inline-flex", alignItems: "center", gap: 6, width: "100%",
                        }}>
                        {r.customFieldCandidate ? (
                          <><Plus size={12} strokeWidth={2} /> Create custom field "{r.csv}"</>
                        ) : (
                          <>Choose target field…</>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <select value={r.target} onChange={e => updateRow(r.id, { target: e.target.value, valueMapDone: false })}
                          style={{ ...selectStyle, height: 28, fontSize: 12, width: "100%" }}>
                          {Object.entries(
                            TARGETS.reduce((acc, t) => {
                              const g = t.group || "_";
                              (acc[g] = acc[g] || []).push(t); return acc;
                            }, {})
                          ).map(([g, items]) => (
                            g === "_" ? items.map(t => <option key={t.id} value={t.id}>{t.label}</option>)
                            : <optgroup key={g} label={g}>
                                {items.map(t => <option key={t.id} value={t.id}>{t.label}{t.required ? " *" : ""}</option>)}
                              </optgroup>
                          ))}
                        </select>
                        {r.auto && !isSkipped && (
                          <span title={r.auto === "exact" ? "Exact match" : "Matched from alias dictionary"}
                            style={{ fontSize: 10.5, color: T.t3, whiteSpace: "nowrap" }}>
                            auto
                          </span>
                        )}
                      </div>
                    )}
                  </Td>
                  <Td>
                    {target?.hasValueMap ? (
                      <button onClick={() => setValueMapRow(r)}
                        style={{
                          height: 26, padding: "0 8px", fontSize: 11.5, fontWeight: 500,
                          borderRadius: 5, border: `1px solid ${needsVM ? T.amber : T.bd}`,
                          background: needsVM ? T.amberBg : T.card,
                          color: needsVM ? T.amber : T.t2,
                          display: "inline-flex", alignItems: "center", gap: 4,
                        }}>
                        {needsVM ? <AlertTriangle size={11} strokeWidth={2} /> : <Check size={11} strokeWidth={2} />}
                        {needsVM ? "Map values" : "3/3 values mapped"}
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: T.t4 }}>—</span>
                    )}
                  </Td>
                  <Td>
                    <button style={{ padding: 4, color: T.t4, borderRadius: 4 }}
                      onMouseEnter={e => e.currentTarget.style.background = T.muted}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <MoreHorizontal size={14} strokeWidth={1.8} />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ fontSize: 12.5, color: T.t3 }}>
            No columns match "{filter}".
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t flex items-center justify-between shrink-0" style={{ background: T.card, borderColor: T.bd }}>
        <Btn variant="ghost" icon={ArrowLeft} onClick={onBack}>Back</Btn>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 11.5, color: T.t3 }}>
            {stats.mapped} of {rows.length} columns mapped
          </span>
          <Btn variant="primary" icon={ArrowRight} onClick={onNext}>Continue to review</Btn>
        </div>
      </div>

      {/* Modals */}
      {valueMapRow && (
        <ValueMappingModal row={valueMapRow}
          onClose={() => setValueMapRow(null)}
          onConfirm={() => { updateRow(valueMapRow.id, { valueMapDone: true }); setValueMapRow(null); }} />
      )}
      {customFieldFor && (
        <CustomFieldModal row={customFieldFor} role={role}
          onClose={() => setCustomFieldFor(null)}
          onCreate={(fieldId) => { updateRow(customFieldFor.id, { target: fieldId }); setCustomFieldFor(null); }} />
      )}
    </div>
  );
};

const Th = ({ children, style }) => (
  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, borderBottom: `1px solid ${T.bd}`, background: T.card, ...style }}>
    {children}
  </th>
);
const Td = ({ children, style }) => (
  <td style={{ padding: "8px 12px", verticalAlign: "middle", ...style }}>{children}</td>
);

const StatusDot = ({ state }) => {
  const map = {
    mapped:    { c: T.green, Icon: CheckCircle2, title: "Mapped" },
    needsVM:   { c: T.amber, Icon: AlertTriangle, title: "Needs value mapping" },
    unmapped:  { c: T.red,   Icon: XCircle,      title: "Not mapped" },
    skipped:   { c: T.t4,    Icon: MinusCircle,  title: "Skipped" },
  };
  const { c, Icon, title } = map[state];
  return <Icon size={13} strokeWidth={2} style={{ color: c }} title={title} />;
};

const StatChip = ({ color, value, label }) => {
  const map = { green: T.green, red: T.red, gray: T.t3 };
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ width: 6, height: 6, borderRadius: 3, background: map[color] }} />
      <span style={{ fontSize: 12, color: T.t1, fontWeight: 600 }}>{value}</span>
      <span style={{ fontSize: 12, color: T.t3 }}>{label}</span>
    </div>
  );
};

// ============================================================================
// Value mapping modal
// ============================================================================
const ValueMappingModal = ({ row, onClose, onConfirm }) => {
  const initial = row.target === "priority"
    ? [
        { src: "Critical", tgt: "P0" }, { src: "High", tgt: "P1" },
        { src: "Medium",   tgt: "P2" }, { src: "Low",  tgt: "P3" },
      ]
    : [
        { src: "Active",  tgt: "Ready" }, { src: "Draft",   tgt: "Draft" },
        { src: "Deprecated", tgt: "__skip__" },
      ];
  const [rows, setRows] = useState(initial);
  const tgtOptions = row.target === "priority" ? ["P0", "P1", "P2", "P3"] : ["Ready", "Draft", "In Review", "Archived"];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(17,24,39,0.35)" }}>
      <div className="rounded-lg shadow-xl" style={{ background: T.card, width: 540, fontFamily: F.fontFamily }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: T.bd }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.t1 }}>Map "{row.csv}" values</h3>
            <p style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>
              Choose how each source value maps to TestOps {row.target}.
            </p>
          </div>
          <button onClick={onClose}><X size={16} strokeWidth={1.8} style={{ color: T.t3 }} /></button>
        </div>
        <div className="p-5" style={{ maxHeight: 380, overflowY: "auto" }}>
          <table style={{ width: "100%", fontSize: 12.5 }}>
            <thead>
              <tr style={{ color: T.t3, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.3 }}>
                <th style={{ textAlign: "left", paddingBottom: 8 }}>Source value</th>
                <th style={{ width: 18 }}></th>
                <th style={{ textAlign: "left", paddingBottom: 8 }}>TestOps value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "6px 0", color: T.t1, fontWeight: 500 }}>{r.src}</td>
                  <td><ArrowRight size={12} style={{ color: T.t4 }} /></td>
                  <td style={{ padding: "6px 0" }}>
                    <select value={r.tgt} onChange={e => setRows(rs => rs.map((x, j) => j === i ? { ...x, tgt: e.target.value } : x))}
                      style={{ ...selectStyle, height: 28, fontSize: 12 }}>
                      {tgtOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      <option value="__skip__">Don't import rows with this value</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2" style={{ borderColor: T.bd, background: T.hover }}>
          <Btn variant="secondary" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" size="sm" onClick={onConfirm}>Save mapping</Btn>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Custom field modal — permission-aware
// ============================================================================
const CustomFieldModal = ({ row, role, onClose, onCreate }) => {
  const isAdmin = role === "Admin";
  const [name, setName] = useState(row.csv);
  const [type, setType] = useState("Text");

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(17,24,39,0.35)" }}>
      <div className="rounded-lg shadow-xl" style={{ background: T.card, width: 480, fontFamily: F.fontFamily }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: T.bd }}>
          <div className="flex items-center gap-2">
            {isAdmin
              ? <ShieldCheck size={15} strokeWidth={1.8} style={{ color: T.brand }} />
              : <Lock size={15} strokeWidth={1.8} style={{ color: T.amber }} />}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.t1 }}>
              {isAdmin ? "Create custom field" : "Custom field needed"}
            </h3>
          </div>
          <button onClick={onClose}><X size={16} strokeWidth={1.8} style={{ color: T.t3 }} /></button>
        </div>
        {isAdmin ? (
          <>
            <div className="p-5 space-y-4">
              <p style={{ fontSize: 12.5, color: T.t2 }}>
                "<strong>{row.csv}</strong>" isn't a standard field. Create a new custom field on the Test Case entity to import it.
              </p>
              <Field label="Field name">
                <input value={name} onChange={e => setName(e.target.value)}
                  style={{ ...selectStyle, height: 32 }} />
              </Field>
              <Field label="Field type">
                <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
                  <option>Text</option><option>Number</option><option>Date</option>
                  <option>Single select</option><option>Multi select</option>
                </select>
              </Field>
              <div className="flex items-start gap-2 rounded-md p-2.5" style={{ background: T.accentLight }}>
                <Info size={13} strokeWidth={1.8} style={{ color: T.brand, marginTop: 1 }} />
                <p style={{ fontSize: 11.5, color: T.t2 }}>
                  This field will be available project-wide after creation. Sample value: <span style={{ color: T.t1, fontWeight: 500 }}>{row.sample}</span>
                </p>
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2" style={{ borderColor: T.bd, background: T.hover }}>
              <Btn variant="secondary" size="sm" onClick={onClose}>Cancel</Btn>
              <Btn variant="primary" size="sm" icon={Plus} onClick={() => onCreate("cf_" + name.toLowerCase().replace(/\s+/g, "_"))}>Create &amp; use field</Btn>
            </div>
          </>
        ) : (
          <>
            <div className="p-5">
              <div className="flex items-start gap-3 rounded-md p-3" style={{ background: T.amberBg }}>
                <Lock size={14} strokeWidth={1.8} style={{ color: T.amber, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, color: T.t1, fontWeight: 600 }}>Your role can't create fields</div>
                  <p style={{ fontSize: 12, color: T.t2, marginTop: 4, lineHeight: 1.5 }}>
                    "<strong>{row.csv}</strong>" isn't a standard TestOps field. Ask a project admin to create a <em>{type}</em> custom field, or skip this column for now — you can re-import later.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <button style={{ fontSize: 12, color: T.brand, textAlign: "left" }}>
                  <CornerDownRight size={11} strokeWidth={2} style={{ display: "inline", marginRight: 4 }} />
                  Copy request message to send to admin
                </button>
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2" style={{ borderColor: T.bd, background: T.hover }}>
              <Btn variant="secondary" size="sm" onClick={onClose}>Back</Btn>
              <Btn variant="primary" size="sm" onClick={() => onCreate("__skip__")}>Skip this column</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Step 3: Review & import
// ============================================================================
const Step3 = ({ rows, onBack, onImport }) => {
  const [idx, setIdx] = useState(0);

  // Build a preview record from the 48-row mock file at index `idx`
  const preview = useMemo(() => {
    const sampleSet = [
      { Title: "Verify user can log in with valid credentials", Priority: "High", Status: "Active", Section: "Authentication > Login" },
      { Title: "Verify password reset via email link",           Priority: "Medium", Status: "Active", Section: "Authentication > Password" },
      { Title: "Verify login fails with invalid password",       Priority: "High", Status: "Active", Section: "Authentication > Login" },
      { Title: "Verify session expiry after 30 minutes idle",    Priority: "Medium", Status: "Draft",  Section: "Authentication > Session" },
    ];
    return sampleSet[idx % sampleSet.length];
  }, [idx]);

  const skipped = rows.filter(r => r.target === "__skip__");
  const mapped = rows.filter(r => r.target && r.target !== "__skip__");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b shrink-0" style={{ borderColor: T.bdLight, background: T.card }}>
        <div className="flex items-end justify-between">
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: T.t1 }}>Review before importing</h2>
            <p style={{ fontSize: 12.5, color: T.t3, marginTop: 2 }}>
              Preview how each row will be created. <strong style={{ color: T.t1, fontWeight: 600 }}>48 test cases</strong> will be imported into <strong style={{ color: T.t1, fontWeight: 600 }}>RA Project &rsaquo; Imports / 2026-04-23</strong>.
            </p>
          </div>
          <Btn variant="secondary" icon={Download} size="sm">Download mapping report (.json)</Btn>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        <div className="max-w-[960px] mx-auto">
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <SumCard label="Total rows" value="48" />
            <SumCard label="Columns mapped" value={mapped.length} hint={`of ${rows.length}`} />
            <SumCard label="Columns skipped" value={skipped.length} />
            <SumCard label="Custom fields to create" value="0" />
          </div>

          {/* Preview card with navigation (S4-1 / S4-2 fix) */}
          <div className="rounded-lg border" style={{ background: T.card, borderColor: T.bd }}>
            <div className="px-4 h-10 flex items-center justify-between border-b" style={{ borderColor: T.bdLight }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, fontWeight: 600, color: T.t1 }}>Preview</span>
                <span style={{ fontSize: 11.5, color: T.t3 }}>Row {idx + 1} of 48</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
                  style={{ height: 26, width: 26, borderRadius: 5, border: `1px solid ${T.bd}`, background: T.card,
                    color: idx === 0 ? T.t4 : T.t2, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: idx === 0 ? "default" : "pointer" }}>
                  <ChevronLeft size={14} strokeWidth={2} />
                </button>
                <button onClick={() => setIdx(i => Math.min(47, i + 1))} disabled={idx === 47}
                  style={{ height: 26, width: 26, borderRadius: 5, border: `1px solid ${T.bd}`, background: T.card,
                    color: idx === 47 ? T.t4 : T.t2, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: idx === 47 ? "default" : "pointer" }}>
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3">
              <PrevRow label="Name" value={preview.Title} tag="required" />
              <PrevRow label="Priority" value={<Badge color="red">P1</Badge>} tag="from: High" />
              <PrevRow label="Folder" value={preview.Section} tag="from: Section" />
              <PrevRow label="Status" value={<Badge color="green">Ready</Badge>} tag="from: Active" />
              <PrevRow label="Steps" value="1. Navigate to login page  2. Enter credentials  3. Submit form" />
              <PrevRow label="Expected" value="User lands on dashboard" />
            </div>
          </div>

          {/* Skipped fields notice */}
          {skipped.length > 0 && (
            <div className="mt-4 rounded-md border p-3 flex items-start gap-2.5" style={{ background: T.hover, borderColor: T.bd }}>
              <Info size={13} strokeWidth={1.8} style={{ color: T.t3, marginTop: 2 }} />
              <div style={{ fontSize: 12.5, color: T.t2 }}>
                <strong style={{ color: T.t1, fontWeight: 600 }}>{skipped.length} columns will be skipped:</strong>{" "}
                <span style={{ color: T.t3 }}>{skipped.map(r => r.csv).join(", ")}.</span>{" "}
                <button style={{ color: T.brand, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 2 }}>
                  Go back to map them →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 border-t flex items-center justify-between shrink-0" style={{ background: T.card, borderColor: T.bd }}>
        <Btn variant="ghost" icon={ArrowLeft} onClick={onBack}>Back to mapping</Btn>
        <Btn variant="primary" onClick={onImport}>Import 48 test cases</Btn>
      </div>
    </div>
  );
};

const SumCard = ({ label, value, hint }) => (
  <div className="rounded-lg border p-3" style={{ background: T.card, borderColor: T.bd }}>
    <div style={{ fontSize: 11, color: T.t3, textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 500 }}>{label}</div>
    <div className="flex items-baseline gap-1.5 mt-1">
      <div style={{ fontSize: 22, fontWeight: 600, color: T.t1, letterSpacing: -0.3 }}>{value}</div>
      {hint && <div style={{ fontSize: 11.5, color: T.t3 }}>{hint}</div>}
    </div>
  </div>
);

const PrevRow = ({ label, value, tag }) => (
  <div>
    <div style={{ fontSize: 11, color: T.t3, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 }}>
      {label} {tag && <span style={{ textTransform: "none", color: T.t4, fontWeight: 400, letterSpacing: 0, marginLeft: 4 }}>&middot; {tag}</span>}
    </div>
    <div style={{ fontSize: 13, color: T.t1, lineHeight: 1.5 }}>{value}</div>
  </div>
);

// ============================================================================
// Import progress / success
// ============================================================================
const ImportProgressModal = ({ done, onClose }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(17,24,39,0.35)" }}>
    <div className="rounded-lg shadow-xl" style={{ background: T.card, width: 460, fontFamily: F.fontFamily }}>
      {!done ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: T.accentLight }}>
            <RefreshCw size={22} strokeWidth={1.8} className="animate-spin" style={{ color: T.brand }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.t1 }}>Importing test cases…</h3>
          <p style={{ fontSize: 12.5, color: T.t3, marginTop: 6 }}>Creating 48 test cases. This usually takes under a minute.</p>
          <div className="mt-5 h-1.5 rounded-full overflow-hidden" style={{ background: T.muted }}>
            <div className="h-full" style={{ width: "62%", background: T.brand, transition: "width .3s" }} />
          </div>
          <div style={{ fontSize: 11.5, color: T.t3, marginTop: 8 }}>30 of 48 created &middot; 0 failed</div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: T.greenBg }}>
            <CheckCircle2 size={22} strokeWidth={1.8} style={{ color: T.green }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.t1 }}>Import complete</h3>
          <p style={{ fontSize: 12.5, color: T.t3, marginTop: 6, lineHeight: 1.55 }}>
            <strong style={{ color: T.t1, fontWeight: 600 }}>48 test cases</strong> were created in <strong style={{ color: T.t1, fontWeight: 600 }}>Imports / 2026-04-23</strong>. 0 rows failed.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Btn variant="secondary" size="sm">View mapping report</Btn>
            <Btn variant="primary" size="sm" onClick={onClose}>Open folder →</Btn>
          </div>
        </div>
      )}
    </div>
  </div>
);

// ============================================================================
// App
// ============================================================================
export default function App() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState(BUILD_ROWS());
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [role, setRole] = useState("Admin");

  const go = (s) => setStep(s);
  const next = () => { setCompleted(c => new Set([...c, step])); setStep(step + 1); };
  const back = () => setStep(Math.max(1, step - 1));
  const startImport = () => {
    setImporting(true);
    setTimeout(() => setDone(true), 2400);
  };

  return (
    <div className="flex h-screen" style={{ ...F, background: T.bg, color: T.t2 }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <Bread path={["Tests", "Import Test Cases"]} onBack={() => {}} />
        <WizardBar current={step} completed={completed} onJump={go} />
        <div className="flex-1 overflow-hidden flex flex-col">
          {step === 1 && <Step1 file={file} setFile={setFile} onNext={next} />}
          {step === 2 && <Step2 rows={rows} setRows={setRows} onNext={next} onBack={back} role={role} setRole={setRole} />}
          {step === 3 && <Step3 rows={rows} onBack={back} onImport={startImport} />}
        </div>
      </div>
      {importing && <ImportProgressModal done={done} onClose={() => { setImporting(false); setDone(false); setStep(1); setCompleted(new Set()); setFile(null); setRows(BUILD_ROWS()); }} />}
    </div>
  );
}
