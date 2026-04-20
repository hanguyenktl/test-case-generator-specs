import React, { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { T } from '../../../utils/design-system';

export const RightDrawer = ({ title, onClose, children, width = 380, borderLeft = true }) => {
  return (
    <div className="overflow-y-auto flex flex-col shrink-0 transition-all duration-300 animate-slide-in-right" style={{ width, background: T.card, borderLeft: borderLeft ? `1px solid ${T.bd}` : "none" }}>
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0" style={{ borderBottom: `1px solid ${T.bdLight}`, background: T.card, position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6 }}>{title}</span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md transition-colors" style={{ color: T.t4 }}
            onMouseEnter={e => { e.currentTarget.style.color = T.t1; e.currentTarget.style.background = T.muted; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.background = "transparent"; }}>
            <X size={13} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export const DrawerSection = ({ title, icon: Icon, children, initOpen = true, extra }) => {
  const [open, setOpen] = useState(initOpen);
  return (
    <div style={{ borderBottom: `1px solid ${T.bdLight}` }}>
      <div className="w-full flex items-center justify-between px-3 py-2 transition-colors cursor-pointer group"
        onClick={() => setOpen(!open)}
        onMouseEnter={e => e.currentTarget.style.background = T.hover} 
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={12} style={{ color: T.t3 }} strokeWidth={1.8} />}
          <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6 }} className="group-hover:text-gray-700">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {extra && <div onClick={e => e.stopPropagation()}>{extra}</div>}
          {open ? <ChevronDown size={13} style={{ color: T.t4 }} strokeWidth={1.5} className="group-hover:text-gray-600" /> : <ChevronRight size={13} style={{ color: T.t4 }} strokeWidth={1.5} className="group-hover:text-gray-600" />}
        </div>
      </div>
      {open && <div className="px-3 pb-2.5 pt-1">{children}</div>}
    </div>
  );
};
