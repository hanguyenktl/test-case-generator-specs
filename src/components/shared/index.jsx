import React, { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { T } from '../../utils/design-system';

export const IBtn = ({ children, disabled, title, onClick, active, style: sx }) => (
  <button onClick={onClick} disabled={disabled} title={title}
    className="p-1.5 rounded-md transition-colors flex items-center justify-center"
    style={{ color: active ? T.accent : disabled ? T.t4 : T.t3, opacity: disabled ? 0.35 : 1, background: active ? T.accentLight : "transparent", cursor: disabled ? "default" : "pointer", ...sx }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = T.muted; e.currentTarget.style.color = T.t1; }}}
    onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = active ? T.accentLight : "transparent"; e.currentTarget.style.color = active ? T.accent : T.t3; }}}>
    {children}
  </button>
);

export const Badge = ({ children, color = T.t3, bg = T.muted, border, onClick, style: sx }) => (
  <span onClick={onClick} className="inline-flex items-center px-1.5 py-px rounded"
    style={{ fontSize: 11, fontWeight: 500, color, background: bg, border: border ? `1px solid ${border}` : undefined, lineHeight: "18px", cursor: onClick ? "pointer" : undefined, ...sx }}>
    {children}
  </span>
);

export const Toast = ({ show, msg }) => (
  <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all duration-300"
    style={{ background: T.t1, color: "#fff", fontSize: 12, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", opacity: show ? 1 : 0,
      transform: `translateX(-50%) translateY(${show ? 0 : 8}px)`, pointerEvents: show ? "auto" : "none", zIndex: 100 }}>
    <Check size={13} style={{ color: "#4ade80" }} /> {msg}
  </div>
);

export const Popover = ({ open, onClose, children, align = "left" }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className="absolute z-50" style={{ top: "100%", [align]: 0, marginTop: 6, width: 320, background: T.card, border: `1px solid ${T.bd}`, borderRadius: 10, boxShadow: "0 12px 36px rgba(0,0,0,0.1)", overflow: "hidden" }}>
      {children}
    </div>
  );
};

export const ConfBadge = ({ level, onClick }) => {
  const cfg = {
    high: { color: T.green, label: "High", bg: "rgba(22,163,74,0.06)", border: "rgba(22,163,94,0.15)" },
    medium: { color: T.amber, label: "Med", bg: "rgba(217,119,6,0.06)", border: "rgba(217,119,6,0.15)" },
    low: { color: T.red, label: "Low", bg: "rgba(220,38,38,0.06)", border: "rgba(220,38,38,0.15)" },
  };
  const c = cfg[level] || cfg.medium;
  return (
    <span className="inline-flex items-center gap-1 cursor-pointer px-1.5 py-px rounded" onClick={onClick}
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
      <span style={{ fontSize: 10, color: c.color, fontWeight: 600 }}>{c.label}</span>
    </span>
  );
};

export const PriBadge = ({ level }) => {
  const sym = level === "High" ? "P1" : level === "Medium" ? "P2" : "P3";
  return (
    <span className="inline-flex items-center gap-1" style={{ fontSize: 10, fontWeight: 500, color: T.t3, lineHeight: "16px" }}>
      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, fontWeight: 600, color: T.t4, background: T.muted, padding: "1px 4px", borderRadius: 3 }}>{sym}</span>
    </span>
  );
};

// Macro UI Components
export * from './ui/Button';
export * from './ui/ListToolbar';
export * from './ui/TestCaseTable';
export * from './ui/RightDrawer';
