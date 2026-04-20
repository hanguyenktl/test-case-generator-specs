import React from 'react';
import { X } from 'lucide-react';
import { T } from '../../../utils/design-system';
import { IBtn } from '../../../components/shared';

export const PasteModal = ({ rows, onOk, onX }) => (
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
