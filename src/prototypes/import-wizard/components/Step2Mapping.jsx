import React, { useState, useMemo } from "react";
import { Search, Save, AlertTriangle, ArrowLeft, ArrowRight, Check, Plus, MoreHorizontal, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { T, F } from "../../../utils/design-system";
import { Button } from "../../../components/shared";
import { TARGETS, BUILD_ROWS } from "../data/mockData";
import { selectStyle } from "./utils";
import { ValueMappingModal, CustomFieldModal } from "./Modals";

export const Step2 = ({ rows, setRows, onNext, onBack, role, setRole }) => {
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
      {/* Header strip */}
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
            <Button variant="secondary" icon={Save}>Save mapping as template</Button>
          </div>
        </div>

        {/* Status chips */}
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
        <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Back</Button>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 11.5, color: T.t3 }}>
            {stats.mapped} of {rows.length} columns mapped
          </span>
          <Button variant="primary" icon={ArrowRight} onClick={onNext}>Continue to review</Button>
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
