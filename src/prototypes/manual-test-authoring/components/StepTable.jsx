import React, { useState, useEffect, useRef } from 'react';
import { Undo2, Redo2, Bold, Italic, Link2, List, Image, Copy, Plus, GripVertical, Trash2, AlertTriangle, Sparkles } from 'lucide-react';
import { T } from '../../../utils/design-system';
import { IBtn, Button } from '../../../components/shared';

export const Toolbar = ({ onUndo, onRedo, canUndo, canRedo, onPaste, onAdd }) => (
  <div className="flex items-center gap-px px-2 py-1" style={{ background: T.muted, borderBottom: `1px solid ${T.bd}` }}>
    <IBtn onClick={onUndo} disabled={!canUndo} title="Undo"><Undo2 size={14} strokeWidth={1.6} /></IBtn>
    <IBtn onClick={onRedo} disabled={!canRedo} title="Redo"><Redo2 size={14} strokeWidth={1.6} /></IBtn>
    <div style={{ width: 1, height: 14, background: T.bd, margin: "0 5px" }} />
    <IBtn title="Bold"><Bold size={14} strokeWidth={1.6} /></IBtn>
    <IBtn title="Italic"><Italic size={14} strokeWidth={1.6} /></IBtn>
    <IBtn title="Link"><Link2 size={14} strokeWidth={1.6} /></IBtn>
    <IBtn title="List"><List size={14} strokeWidth={1.6} /></IBtn>
    <div style={{ width: 1, height: 14, background: T.bd, margin: "0 5px" }} />
    <IBtn title="Image"><Image size={14} strokeWidth={1.6} /></IBtn>
    <div className="flex-1" />
    <Button variant="ghost" icon={Copy} onClick={onPaste} style={{ fontSize: 11 }}>
      Paste from Excel
    </Button>
    <div style={{ width: 1, height: 14, background: T.bd, margin: "0 5px" }} />
    <Button variant="ghost" icon={Plus} onClick={onAdd} style={{ fontSize: 11, color: T.brand }}>
      Add Step
    </Button>
  </div>
);

export const Cell = ({ value, onChange, active, onFocus, ph }) => (
  <div contentEditable suppressContentEditableWarning
    className="min-h-[32px] px-2.5 py-1.5 outline-none whitespace-pre-wrap transition-shadow"
    style={{ fontSize: 13, lineHeight: 1.55, color: value ? T.t2 : T.t4, background: active ? "rgba(79,70,229,0.04)" : "transparent", borderRadius: 3, boxShadow: active ? `inset 0 0 0 1.5px ${T.brand}` : "none" }}
    onFocus={onFocus} onBlur={e => onChange(e.target.innerText)}
    dangerouslySetInnerHTML={{ __html: value || `<span style="color:${T.t4}">${ph || ""}</span>` }} />
);

export const GutterIndicator = ({ issues, onHighlight }) => {
  const [hover, setHover] = useState(false);
  const [showPop, setShowPop] = useState(false);
  const ref = useRef(null);
  const isRunner = issues[0]?.source === "runner";
  const color = isRunner ? T.purple : T.amber;
  const bgTint = isRunner ? "rgba(124,58,237,0.08)" : "rgba(217,119,6,0.08)";
  const borderTint = isRunner ? "rgba(124,58,237,0.2)" : "rgba(217,119,6,0.2)";

  useEffect(() => {
    if (!showPop) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setShowPop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showPop]);

  return (
    <div ref={ref} className="relative flex items-center justify-center" style={{ width: 18, height: 18 }}>
      <button onClick={() => setShowPop(!showPop)}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className="flex items-center justify-center rounded-full transition-all"
        style={{
          width: hover || showPop ? 18 : 14,
          height: hover || showPop ? 18 : 14,
          background: hover || showPop ? bgTint : `${color}18`,
          border: `1.5px solid ${hover || showPop ? color : borderTint}`,
          cursor: "pointer",
        }}>
        <AlertTriangle size={hover || showPop ? 10 : 8} style={{ color }} strokeWidth={2} />
      </button>
      {showPop && (
        <div className="absolute z-50" style={{ left: 24, top: -4, width: 260, background: T.card, border: `1px solid ${T.bd}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={11} style={{ color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.t1 }}>{issues.length} issue{issues.length > 1 ? "s" : ""}</span>
            </div>
            {issues.map((iss, i) => (
              <div key={i} className="flex items-start gap-1.5 mt-1.5">
                <span style={{ fontSize: 10, color: T.t4, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 11, color: T.t2, lineHeight: 1.35 }}>{iss.msg}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5">
            <button onClick={() => { setShowPop(false); onHighlight(); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded transition-colors"
              style={{ fontSize: 10, fontWeight: 500, color: T.brand, border: `1px solid ${T.accentBorder}`, background: T.accentLight }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(79,70,229,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = T.accentLight}>
              <Sparkles size={9} /> AI Suggest
            </button>
            <button onClick={() => setShowPop(false)}
              style={{ fontSize: 10, color: T.t4 }}
              onMouseEnter={e => e.currentTarget.style.color = T.t2}
              onMouseLeave={e => e.currentTarget.style.color = T.t4}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const StepAIMenu = ({ onAction }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const items = [
    { label: "Revise step", desc: "Improve clarity and specificity" },
    { label: "Generate expected result", desc: "Auto-fill expected outcome" },
    { label: "Suggest test data", desc: "Recommend input values" },
    { divider: true },
    { label: "Link test data", desc: "Connect to test data set", future: true },
  ];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        style={{ color: T.purple, background: open ? "rgba(124,58,237,0.08)" : "transparent" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.08)"}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}>
        <Sparkles size={12} strokeWidth={1.8} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 py-1 rounded-lg" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", width: 220 }}>
          <div className="px-3 py-1.5" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
            <div className="flex items-center gap-1.5">
              <Sparkles size={10} style={{ color: T.purple }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>AI Actions</span>
            </div>
          </div>
          {items.map((it, i) => it.divider ? (
            <div key={i} style={{ height: 1, background: T.bdLight, margin: "4px 0" }} />
          ) : (
            <button key={i} onClick={() => { onAction?.(it.label); setOpen(false); }}
              className="w-full flex flex-col px-3 py-1.5 transition-colors text-left"
              style={{ opacity: it.future ? 0.5 : 1 }}
              onMouseEnter={e => e.currentTarget.style.background = T.hover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: 12, color: T.purple, fontWeight: 500 }}>{it.label}</span>
              <span style={{ fontSize: 10, color: T.t4, lineHeight: 1.3 }}>
                {it.desc}{it.future && " (coming soon)"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const StepRow = ({ s, idx, ac, onAc, onUp, onDel, onDS, onDO, onDr, drag, issues, highlighted, inlineChip, onDismissChip, onHighlightStep }) => {
  const hasIssue = issues.length > 0;
  const isHighlighted = highlighted;
  return (
    <>
      <tr data-step-id={s.id} className="group transition-colors"
        style={{
          borderBottom: `1px solid ${T.bdLight}`,
          background: isHighlighted ? "rgba(217,119,6,0.06)" : s.isAI ? "rgba(124,58,237,0.03)" : T.card,
          borderTop: drag ? `2px solid ${T.brand}` : undefined,
        }}
        draggable onDragStart={e => onDS(e, idx)} onDragOver={e => onDO(e, idx)} onDrop={e => onDr(e, idx)}
        onMouseEnter={e => { if (!isHighlighted && !s.isAI) e.currentTarget.style.background = T.hover; }}
        onMouseLeave={e => { if (!isHighlighted) e.currentTarget.style.background = s.isAI ? "rgba(124,58,237,0.03)" : T.card; }}>
        <td className="w-10 text-center align-top pt-2">
          <div className="flex items-center justify-center gap-px">
            <span className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity" style={{ color: T.t4 }}>
              <GripVertical size={13} strokeWidth={1.4} />
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, color: T.t4, fontVariantNumeric: "tabular-nums", minWidth: 14, textAlign: "right" }}>{idx + 1}</span>
          </div>
        </td>
        <td className="w-6 p-0 align-top pt-1.5" style={{ position: "relative" }}>
          {hasIssue && <GutterIndicator issues={issues} onHighlight={() => onHighlightStep(s.id)} />}
          {s.isAI && !hasIssue && (
            <div className="flex items-center justify-center" style={{ width: 18, height: 18, marginTop: 2 }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.purple }} />
            </div>
          )}
        </td>
        <td className="align-top" style={{ width: "37%" }}>
          <Cell value={s.step} onChange={v => onUp(s.id, "step", v)} active={ac === `${s.id}-s`} onFocus={() => onAc(`${s.id}-s`)} ph="Describe the test step..." />
        </td>
        <td className="align-top" style={{ width: "32%", borderLeft: `1px solid ${T.bdLight}` }}>
          <Cell value={s.exp} onChange={v => onUp(s.id, "exp", v)} active={ac === `${s.id}-e`} onFocus={() => onAc(`${s.id}-e`)} ph="Expected result..." />
        </td>
        <td className="align-top" style={{ width: "22%", borderLeft: `1px solid ${T.bdLight}` }}>
          <Cell value={s.data} onChange={v => onUp(s.id, "data", v)} active={ac === `${s.id}-d`} onFocus={() => onAc(`${s.id}-d`)} ph="Test data..." />
        </td>
        <td className="w-14 align-top pt-1.5">
          <div className="flex items-center gap-0.5 justify-end pr-1">
            <StepAIMenu onAction={(a) => { /* placeholder */ }} />
            <button onClick={() => onDel(s.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded transition-colors" style={{ color: T.t4 }}
              onMouseEnter={e => { e.currentTarget.style.color = T.red; e.currentTarget.style.background = "rgba(220,38,38,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.background = "transparent"; }}>
              <Trash2 size={13} strokeWidth={1.4} />
            </button>
          </div>
        </td>
      </tr>
      {isHighlighted && inlineChip && (
        <tr style={{ background: "rgba(217,119,6,0.04)" }}>
          <td colSpan={2} />
          <td colSpan={3} className="py-1.5 px-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={11} style={{ color: T.amber }} />
              <span style={{ fontSize: 11, color: T.t2 }}>{inlineChip.msg}</span>
              <button className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 500, color: T.brand, border: `1px solid ${T.accentBorder}`, background: T.accentLight }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(79,70,229,0.12)"} onMouseLeave={e => e.currentTarget.style.background = T.accentLight}>
                <Sparkles size={10} /> Suggest
              </button>
              <button onClick={onDismissChip} style={{ fontSize: 10, color: T.t4 }}
                onMouseEnter={e => e.currentTarget.style.color = T.t2} onMouseLeave={e => e.currentTarget.style.color = T.t4}>Dismiss</button>
            </div>
          </td>
          <td />
        </tr>
      )}
    </>
  );
};

export const InsertZone = ({ onInsert, onHover, onLeave }) => (
  <tr>
    <td colSpan={6} className="p-0" style={{ height: 0, border: "none", position: "relative" }}>
      <div onMouseEnter={onHover} onMouseLeave={onLeave} onClick={onInsert}
        style={{ position: "absolute", left: 0, right: 0, top: -12, height: 24, zIndex: 10, cursor: "pointer" }} />
    </td>
  </tr>
);

export const InsertLine = ({ visible, onInsert }) => {
  if (!visible) return null;
  return (
    <tr>
      <td colSpan={6} className="p-0" style={{ height: 6, border: "none", position: "relative" }}>
        <div onClick={onInsert} className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center cursor-pointer" style={{ height: 8, zIndex: 11 }}>
          <div className="flex-1 h-px" style={{ background: T.brand }} />
          <button onClick={e => { e.stopPropagation(); onInsert(); }}
            className="w-6 h-6 rounded-full flex items-center justify-center -mx-0.5 transition-transform hover:scale-110"
            style={{ background: T.brand, color: "#fff", boxShadow: "0 2px 6px rgba(94,106,210,0.35)" }}>
            <Plus size={13} strokeWidth={2.2} />
          </button>
          <div className="flex-1 h-px" style={{ background: T.brand }} />
        </div>
      </td>
    </tr>
  );
};
