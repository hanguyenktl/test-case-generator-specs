import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { T } from '../../../utils/design-system';

export const PreCond = ({ val, set, open, toggle }) => (
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
