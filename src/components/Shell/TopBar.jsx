import React from 'react';
import { ChevronDown, Sparkles, Bell } from 'lucide-react';
import { T } from '../../utils/design-system';

const IBtn = ({ children, disabled, title, onClick, active, style: sx }) => (
  <button onClick={onClick} disabled={disabled} title={title}
    className="p-1.5 rounded-md transition-colors flex items-center justify-center"
    style={{ color: active ? T.accent : disabled ? T.t4 : T.t3, opacity: disabled ? 0.35 : 1, background: active ? T.accentLight : "transparent", cursor: disabled ? "default" : "pointer", ...sx }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = T.muted; e.currentTarget.style.color = T.t1; }}}
    onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = active ? T.accentLight : "transparent"; e.currentTarget.style.color = active ? T.accent : T.t3; }}}>
    {children}
  </button>
);

export default function TopBar({ customContent }) {
  return (
    <div className="h-11 flex items-center justify-between px-4 shrink-0"
      style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 cursor-pointer">
          <span style={{ color: T.t2, fontSize: 13, fontWeight: 500 }}>RA Sample Project</span>
          <ChevronDown size={13} style={{ color: T.t4 }} />
        </div>
        {customContent}
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
}
