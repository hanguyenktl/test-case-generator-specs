import React, { useState } from "react";
import { X, ArrowRight, ShieldCheck, Lock, Plus, Info, CornerDownRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { T, F } from "../../../utils/design-system";
import { Button } from "../../../components/shared";
import { Field, selectStyle } from "./utils";

export const ValueMappingModal = ({ row, onClose, onConfirm }) => {
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
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Save mapping</Button>
        </div>
      </div>
    </div>
  );
};

export const CustomFieldModal = ({ row, role, onClose, onCreate }) => {
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
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" icon={Plus} onClick={() => onCreate("cf_" + name.toLowerCase().replace(/\s+/g, "_"))}>Create &amp; use field</Button>
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
              <Button variant="secondary" onClick={onClose}>Back</Button>
              <Button variant="primary" onClick={() => onCreate("__skip__")}>Skip this column</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ImportProgressModal = ({ done, onClose }) => (
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
            <Button variant="secondary">View mapping report</Button>
            <Button variant="primary" onClick={onClose}>Open folder →</Button>
          </div>
        </div>
      )}
    </div>
  </div>
);
