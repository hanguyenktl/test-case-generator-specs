import React, { useState, useMemo } from "react";
import { Search, Save, AlertTriangle, ArrowLeft, ArrowRight, Check, Plus, MoreHorizontal, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { T, F } from "../../../utils/design-system";
import { Button } from "../../../components/shared";
import { TARGETS, BUILD_ROWS } from "../data/mockData";
import { selectStyle } from "./utils";
import { ValueMappingModal } from "./Modals";

export const Step2 = ({ rows, setRows, onNext, onBack, role, setRole }) => {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [template, setTemplate] = useState("");
  const [valueMapRow, setValueMapRow] = useState(null);

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
  
  const targetCounts = useMemo(() => {
    const counts = {};
    rows.forEach(r => {
      if (r.target && r.target !== "__skip__") counts[r.target] = (counts[r.target] || 0) + 1;
    });
    return counts;
  }, [rows]);

  const duplicateErrorCount = Object.values(targetCounts).filter(c => c > 1).length;

  const nextDisabled = unmappedRequired.length > 0 || stats.needsAction > 0 || duplicateErrorCount > 0;
  let nextTooltip = "";
  if (unmappedRequired.length > 0) nextTooltip = "Map required fields to continue";
  else if (duplicateErrorCount > 0) nextTooltip = "Resolve duplicate mappings to continue";
  else if (stats.needsAction > 0) nextTooltip = `Map or skip ${stats.needsAction} values to continue`;

  const updateRow = (id, patch) => setRows(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allFilteredSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));

  const bulkSkip = () => { selected.forEach(id => updateRow(id, { target: "__skip__" })); setSelected(new Set()); };
  const scrollToRow = (rowId, color) => {
    const el = document.getElementById(`row-${rowId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.transition = "background 0.5s";
      el.style.background = color;
      setTimeout(() => el.style.background = "transparent", 1500);
    }
  };

  const jumpToUnmappedRequired = () => {
    const rowToFocus = rows.find(r => r.target === null);
    if (rowToFocus) scrollToRow(rowToFocus.id, T.amberBg);
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

      {/* Alerts */}
      <div className="shrink-0 flex flex-col">
        {duplicateErrorCount > 0 && (
          <div className="px-5 py-3 flex items-center justify-between border-b" style={{ background: T.redBg, borderColor: T.redLight }}>
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} strokeWidth={2} style={{ color: T.red, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: T.red, fontWeight: 500 }}>
                {duplicateErrorCount} duplicate mapping{duplicateErrorCount > 1 ? "s" : ""} — <span style={{ fontWeight: 400 }}>multiple columns cannot be mapped to the same TestOps field.</span>
              </span>
            </div>
            <button onClick={() => {
              const dupes = Object.entries(targetCounts).filter(([_, c]) => c > 1).map(([id]) => id);
              if (dupes.length > 0) {
                 const rowToFocus = rows.find(r => r.target === dupes[0]);
                 if (rowToFocus) scrollToRow(rowToFocus.id, T.redBg);
              }
            }} style={{ fontSize: 13, color: T.brand, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 2 }}>
              Resolve duplicate &rarr;
            </button>
          </div>
        )}
        {stats.needsAction > 0 && unmappedRequired.length === 0 && (
          <div className="px-5 py-3 flex items-center justify-between border-b" style={{ background: T.redBg, borderColor: T.redLight }}>
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} strokeWidth={2} style={{ color: T.red, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: T.red, fontWeight: 500 }}>
                {stats.needsAction} value{stats.needsAction > 1 ? "s" : ""} need attention — <span style={{ fontWeight: 400 }}>map or skip enum values to continue.</span>
              </span>
            </div>
            <button onClick={() => {
              const rowToFocus = rows.find(r => r.target && TARGETS.find(t => t.id === r.target)?.hasValueMap && !r.valueMapDone);
              if (rowToFocus) scrollToRow(rowToFocus.id, T.redBg);
            }} style={{ fontSize: 13, color: T.brand, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 2 }}>
              Map values &rarr;
            </button>
          </div>
        )}
        {unmappedRequired.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between border-b" style={{ background: T.amberBg, borderColor: T.amberLight }}>
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} strokeWidth={2} style={{ color: T.amber, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: T.amber, fontWeight: 600 }}>
                {unmappedRequired.length} required field{unmappedRequired.length > 1 ? "s are" : " is"} not mapped — <span style={{ fontWeight: 400 }}>{unmappedRequired.map(t => t.label).join(", ")}. Required field not yet covered.</span>
              </span>
            </div>
            <button onClick={jumpToUnmappedRequired} style={{ fontSize: 13, color: T.brand, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 2 }}>
              Auto-map to fix &rarr;
            </button>
          </div>
        )}
      </div>

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
      <div className="flex-1 overflow-auto p-5" style={{ background: T.bg }}>
        <div className="border rounded-xl bg-white overflow-hidden shadow-sm" style={{ borderColor: T.bd }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: T.muted, borderBottom: `1px solid ${T.bd}` }}>
              <tr style={{ color: T.t3, fontSize: 11.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <Th style={{ width: "4%", paddingLeft: 20 }}>
                  <input type="checkbox" checked={allFilteredSelected}
                    onChange={() => setSelected(s => {
                      const n = new Set(s); const allSel = filtered.every(r => n.has(r.id));
                      filtered.forEach(r => allSel ? n.delete(r.id) : n.add(r.id)); return n;
                    })} />
                </Th>
                <Th style={{ width: "25%" }}>Your CSV Data</Th>
                <Th style={{ width: "3%" }}></Th>
                <Th style={{ width: "36%" }}>Will Be Mapped To</Th>
                <Th style={{ width: "32%" }}>Values From Your CSV</Th>
              </tr>
            </thead>
            <tbody>
            {filtered.map(r => {
              const target = TARGETS.find(t => t.id === r.target);
              const isSkipped = r.target === "__skip__";
              const isUnmapped = r.target === null;
              const needsVM = target?.hasValueMap && !r.valueMapDone;
              return (
                <tr key={r.id} id={`row-${r.id}`} style={{
                  background: selected.has(r.id) ? T.accentLight : "transparent",
                  transition: "background 0.15s ease",
                }}
                  onMouseEnter={e => !selected.has(r.id) && (e.currentTarget.style.background = T.hover)}
                  onMouseLeave={e => !selected.has(r.id) && (e.currentTarget.style.background = "transparent")}>
                  <Td style={{ paddingLeft: 20 }}><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} /></Td>
                  <Td>
                    <div style={{ fontWeight: 600, color: isSkipped ? T.t4 : T.t1, fontSize: 13, marginBottom: 2 }}>{r.csv}</div>
                    <div style={{
                      color: isSkipped ? T.t4 : T.t3, fontSize: 12,
                      display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }} title={`Sample value from CSV: ${r.sample}`}>{r.sample}</div>
                  </Td>
                  <Td><ArrowRight size={14} strokeWidth={1.8} style={{ color: T.t4 }} /></Td>
                  <Td>
                    <div className="flex flex-col gap-1.5">
                      <select value={r.target || ""} onChange={e => {
                        const val = e.target.value;
                        if (val === "__manage__") {
                          alert("Opening Settings > Form Fields and Values in a new tab.");
                          return;
                        }
                        updateRow(r.id, { target: val, valueMapDone: false });
                      }}
                        style={{ ...selectStyle, height: 32, fontSize: 12.5, width: "100%", borderColor: targetCounts[r.target] > 1 ? T.red : T.bd }}>
                        <option value="">Choose target field…</option>
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
                        <option disabled>──────────</option>
                        <option value="__create_new__">Create New Field</option>
                        <option value="__skip__">Don't import this column</option>
                        <option value="__manage__">Manage Custom Fields &rarr;</option>
                      </select>
                      {targetCounts[r.target] > 1 && (
                        <div style={{ fontSize: 11, color: T.red, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                          <AlertTriangle size={11} /> Already mapped — can only be assigned to one CSV column
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td style={{ paddingRight: 20 }}>
                    {r.target === "__create_new__" || (isUnmapped && r.customFieldCandidate) ? (
                      role === "Admin" ? (
                        <button onClick={() => {
                          sessionStorage.setItem("katalon_import_state_demo", JSON.stringify({ file: {name: "test-cases.csv", rows: 48, columns: 14}, rows, step: 2, completed: [1], time: new Date().toLocaleTimeString() }));
                          setTimeout(() => {
                            updateRow(r.id, { target: "cf_" + r.csv.toLowerCase().replace(/\s+/g, "_") });
                            alert("Simulating field list updated — mapping options refreshed.");
                          }, 500);
                        }}
                          style={{ fontSize: 12.5, color: T.red, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                          <AlertTriangle size={14} strokeWidth={2} /> Configure Field
                        </button>
                      ) : (
                        <span style={{ fontSize: 12.5, color: T.red, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <AlertTriangle size={14} strokeWidth={2} /> Requires Admin to configure
                        </span>
                      )
                    ) : isUnmapped ? (
                      <span style={{ fontSize: 12.5, color: T.t4 }}>—</span>
                    ) : isSkipped ? (
                      <span style={{ fontSize: 12.5, color: T.t4 }}>—</span>
                    ) : (
                      <div className="flex items-center justify-between h-8">
                        {target?.hasValueMap ? (
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 12.5, color: needsVM ? T.amber : T.t1, fontWeight: needsVM ? 600 : 400 }}>{needsVM ? "Requires mapping" : "3 values mapped"}</span>
                            <button onClick={() => setValueMapRow(r)} style={{ fontSize: 12.5, color: T.brand, fontWeight: 500 }}>(Update)</button>
                          </div>
                        ) : target?.id && ["tags", "folder", "cf_reqId"].includes(target.id) ? (
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 12.5, color: T.t2 }}>Split by separator</span>
                            <select style={{ height: 28, fontSize: 12.5, padding: "0 8px", border: `1px solid ${T.bd}`, borderRadius: 4, background: T.card, color: T.t1, outline: "none" }}
                              title="Value separator">
                              <option>,</option><option>;</option><option>&gt;</option><option>/</option><option>|</option>
                            </select>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12.5, color: T.t2 }}>No Mapping Needed</span>
                        )}
                      </div>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ fontSize: 13, color: T.t3 }}>
            No columns match "{filter}".
          </div>
        )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t flex items-center justify-between shrink-0" style={{ background: T.card, borderColor: T.bd }}>
        <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Back</Button>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 11.5, color: T.t3 }}>
            {stats.mapped} of {rows.length} columns mapped
          </span>
          <div title={nextTooltip}>
            <Button variant="primary" icon={ArrowRight} onClick={onNext} disabled={nextDisabled}>Continue to review</Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {valueMapRow && (
        <ValueMappingModal row={valueMapRow}
          onClose={() => setValueMapRow(null)}
          onConfirm={() => { updateRow(valueMapRow.id, { valueMapDone: true }); setValueMapRow(null); }} />
      )}
    </div>
  );
};

const Th = ({ children, style }) => (
  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, ...style }}>
    {children}
  </th>
);
const Td = ({ children, style }) => (
  <td style={{ padding: "14px 16px", verticalAlign: "middle", borderBottom: `1px solid ${T.bdLight}`, ...style }}>{children}</td>
);

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
