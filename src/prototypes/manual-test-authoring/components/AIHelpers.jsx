import React from 'react';
import { Sparkles, Check, ExternalLink, ThumbsUp, ThumbsDown, Pencil } from 'lucide-react';
import { T } from '../../../utils/design-system';
import { Badge, IBtn } from '../../../components/shared';

export const AISugg = ({ items, done, onOk, onAll, onX }) => (
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
