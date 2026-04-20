import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Check, AlertTriangle, ExternalLink, ThumbsUp, ThumbsDown, Move, Copy, Trash2, MoreHorizontal } from 'lucide-react';
import { T } from '../../../utils/design-system';
import { IBtn, Popover } from '../../../components/shared';

export const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const opts = ["Draft", "Published", "Archived"];
  const dotColor = value === "Published" ? T.green : value === "Draft" ? T.t4 : T.amber;
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors"
        style={{ border: `1px solid ${T.bd}`, background: open ? T.muted : "transparent" }}
        onMouseEnter={e => e.currentTarget.style.background = T.muted} onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: T.t2 }}>{value}</span>
        <ChevronDown size={11} style={{ color: T.t4 }} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 py-1 rounded-lg" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", minWidth: 120 }}>
          {opts.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
              style={{ fontSize: 12, color: o === value ? T.brand : T.t2, fontWeight: o === value ? 500 : 400 }}
              onMouseEnter={e => e.currentTarget.style.background = T.hover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: o === "Published" ? T.green : o === "Draft" ? T.t4 : T.amber }} />
              {o}
              {o === value && <Check size={12} style={{ marginLeft: "auto", color: T.brand }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const MoreMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const items = [
    { icon: Sparkles, label: "Edit with Kai", ai: true },
    { divider: true },
    { icon: Move, label: "Move" },
    { icon: Copy, label: "Duplicate" },
    { icon: ExternalLink, label: "View history" },
    { divider: true },
    { icon: Trash2, label: "Delete", danger: true },
  ];
  return (
    <div ref={ref} className="relative">
      <IBtn onClick={() => setOpen(!open)} title="More"><MoreHorizontal size={14} strokeWidth={1.4} /></IBtn>
      {open && (
        <div className="absolute right-0 z-50 mt-1 py-1 rounded-lg" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", minWidth: 170 }}>
          {items.map((it, i) => it.divider ? (
            <div key={i} style={{ height: 1, background: T.bdLight, margin: "4px 0" }} />
          ) : (
            <button key={i} onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
              style={{ fontSize: 12, color: it.danger ? T.red : it.ai ? T.purple : T.t2 }}
              onMouseEnter={e => e.currentTarget.style.background = it.danger ? "rgba(220,38,38,0.04)" : T.hover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <it.icon size={13} strokeWidth={1.4} />
              {it.label}
              {it.ai && <Sparkles size={10} style={{ color: T.purple, marginLeft: "auto" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DimBar = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-2">
    <Icon size={12} style={{ color: T.t4, flexShrink: 0 }} strokeWidth={1.5} />
    <span style={{ fontSize: 11, color: T.t3, width: 85, flexShrink: 0 }}>{label}</span>
    <div className="flex-1 h-1.5 rounded-full" style={{ background: T.muted }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: value >= 80 ? T.green : value >= 50 ? T.amber : T.red }} />
    </div>
    <span style={{ fontSize: 10, fontWeight: 600, color: T.t3, width: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{value}%</span>
  </div>
);

export const QualityPopover = ({ quality, onClose, onClickSuggestion }) => (
  <Popover open onClose={onClose}>
    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 12, fontWeight: 600, color: T.t1 }}>Test Case Quality</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: quality.color }}>{quality.overall}<span style={{ fontSize: 11, fontWeight: 500, color: T.t4 }}>/100</span></span>
      </div>
      <DimBar label="Completeness" value={quality.dimensions.completeness} icon={Check} />
      <DimBar label="Clarity" value={quality.dimensions.clarity} icon={Check} />
      <DimBar label="Coverage" value={quality.dimensions.coverage} icon={Check} />
      <DimBar label="Executability" value={quality.dimensions.executability} icon={Check} />
    </div>
    {quality.stepIssues.filter(i => i.source === "quality").length > 0 && (
      <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle size={11} style={{ color: T.amber }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: T.t2 }}>Suggestions</span>
        </div>
        {quality.stepIssues.filter(i => i.source === "quality").slice(0, 5).map((iss, i) => (
          <div key={i} className="flex items-start gap-2 py-1 cursor-pointer rounded px-1 -mx-1"
            onClick={() => onClickSuggestion(iss.stepId)}
            onMouseEnter={e => e.currentTarget.style.background = T.hover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 10, color: T.t4, marginTop: 2 }}>•</span>
            <span style={{ fontSize: 11, color: T.t2, lineHeight: 1.4 }}>{iss.msg} <span style={{ color: T.t4 }}>(Step {iss.stepId})</span></span>
          </div>
        ))}
      </div>
    )}
    <div className="flex items-center justify-between px-4 py-2">
      <button className="flex items-center gap-1" style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.color = T.accent} onMouseLeave={e => e.currentTarget.style.color = T.brand}>
        Ask Kai for review <ExternalLink size={9} />
      </button>
      <div className="flex gap-0.5">
        <IBtn title="Helpful"><ThumbsUp size={12} strokeWidth={1.4} /></IBtn>
        <IBtn title="Not helpful"><ThumbsDown size={12} strokeWidth={1.4} /></IBtn>
      </div>
    </div>
  </Popover>
);

export const RunnerPopover = ({ runner, onClose }) => (
  <Popover open onClose={onClose} align="left">
    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} style={{ color: T.purple }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.t1 }}>AI Runner Confidence</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: runner.color }}>{runner.score}%</span>
      </div>
      {runner.factors.map((f, i) => (
        <div key={i} className="flex items-start gap-2 mb-2">
          {f.ok ? <Check size={12} style={{ color: T.green, marginTop: 1, flexShrink: 0 }} /> : <AlertTriangle size={12} style={{ color: T.amber, marginTop: 1, flexShrink: 0 }} />}
          <span style={{ fontSize: 11, color: T.t2, lineHeight: 1.4 }}>{f.msg}</span>
        </div>
      ))}
    </div>
    <div className="px-4 py-2.5" style={{ background: runner.score >= 80 ? "rgba(22,163,74,0.03)" : "rgba(217,119,6,0.03)", borderBottom: `1px solid ${T.bdLight}` }}>
      <span style={{ fontSize: 11, color: T.t2, lineHeight: 1.4 }}>
        {runner.score >= 80 ? "This test case is a good candidate for AI-assisted execution." : runner.score >= 50 ? "AI can attempt this test but may need human review at some steps." : "Consider simplifying this test case before AI execution."}
      </span>
    </div>
    <div className="flex items-center justify-between px-4 py-2">
      <button className="flex items-center gap-1" style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.color = T.accent} onMouseLeave={e => e.currentTarget.style.color = T.brand}>
        Ask Kai <ExternalLink size={9} />
      </button>
      <div className="flex gap-0.5">
        <IBtn title="Helpful"><ThumbsUp size={12} strokeWidth={1.4} /></IBtn>
        <IBtn title="Not helpful"><ThumbsDown size={12} strokeWidth={1.4} /></IBtn>
      </div>
    </div>
  </Popover>
);
