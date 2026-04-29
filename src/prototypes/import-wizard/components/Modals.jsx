import React, { useState } from "react";
import { X, ArrowRight, ShieldCheck, Lock, Plus, Info, CornerDownRight, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
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
      <div className="rounded-lg shadow-xl" style={{ background: T.card, width: 600, fontFamily: F.fontFamily }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: T.bd }}>
          <div className="flex items-center justify-between mb-2">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: T.t1 }}>Map Values for '{row.target}'</h3>
            <button onClick={onClose}><X size={18} strokeWidth={1.8} style={{ color: T.t3 }} /></button>
          </div>
          <p style={{ fontSize: 13, color: T.t2 }}>
            Values for {row.target} are mapped by default. You can update the mapping if needed:
          </p>
        </div>
        
        <div className="p-6" style={{ maxHeight: 420, overflowY: "auto" }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: T.t3, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <th style={{ textAlign: "left", paddingBottom: 12, borderBottom: `1px solid ${T.bd}` }}>CSV Value</th>
                <th style={{ textAlign: "left", paddingBottom: 12, borderBottom: `1px solid ${T.bd}` }}>System Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "12px 0", color: T.t1, fontWeight: 500, borderBottom: `1px solid ${T.bdLight}` }}>{r.src}</td>
                  <td style={{ padding: "12px 0", borderBottom: `1px solid ${T.bdLight}` }}>
                    <select value={r.tgt} onChange={e => setRows(rs => rs.map((x, j) => j === i ? { ...x, tgt: e.target.value } : x))}
                      style={{ ...selectStyle, height: 32, fontSize: 13, width: "100%", maxWidth: 300,
                        color: r.tgt === "__skip__" ? T.t3 : T.t1,
                        background: r.tgt === "__skip__" ? T.muted : T.card,
                      }}>
                      {tgtOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      <option disabled>──────────</option>
                      <option value="__create__">Create new value &rarr;</option>
                      <option value="__skip__">Ignore this value</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: T.bd, background: T.hover }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Save mapping</Button>
        </div>
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
        <div className="p-7">
          <h3 style={{ fontSize: 17, fontWeight: 600, color: T.t1, marginBottom: 20 }}>
            Import Complete
          </h3>
          <div className="border rounded-lg mb-7 overflow-hidden" style={{ borderColor: T.bdLight }}>
            <div className="p-4 border-b flex items-start gap-3" style={{ background: "#f8fafc", borderColor: T.bdLight }}>
              <CheckCircle2 size={18} strokeWidth={2} style={{ color: T.green, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, color: T.t1, fontWeight: 600 }}>141 test cases imported successfully</div>
                <div style={{ fontSize: 12.5, color: T.t3, marginTop: 4 }}>Destination: /Regression Suite/Login Flows</div>
              </div>
            </div>
            <div className="p-4 flex items-start gap-3 bg-white">
              <AlertTriangle size={18} strokeWidth={2} style={{ color: T.amber, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, color: T.t1, fontWeight: 600 }}>2 rows skipped (validation errors)</div>
                <button style={{ fontSize: 12.5, color: T.brand, fontWeight: 500, marginTop: 4, textDecoration: "underline", textUnderlineOffset: 2 }}>
                  Download error report
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={onClose} className="w-full h-10 rounded-md flex items-center justify-center transition-colors"
              style={{ background: T.brand, color: "#fff", fontSize: 13, fontWeight: 500 }}>
              View imported test cases &rarr;
            </button>
            <div className="flex items-center gap-3 mt-1">
              <button onClick={onClose} className="flex-1 h-9 rounded-md border flex items-center justify-center transition-colors hover:bg-gray-50"
                style={{ borderColor: T.bd, color: T.t2, fontSize: 12.5, fontWeight: 500 }}>
                Import another file
              </button>
              <button onClick={onClose} className="flex-1 h-9 rounded-md border flex items-center justify-center transition-colors hover:bg-gray-50"
                style={{ borderColor: T.bd, color: T.t2, fontSize: 12.5, fontWeight: 500 }}>
                Back to Test Cases
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
