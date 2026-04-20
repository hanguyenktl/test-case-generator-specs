import React, { useState } from 'react';
import { Pencil, Bold, Italic, Link2, List, ShieldCheck, Check, AlertTriangle, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { T } from '../../../utils/design-system';
import { IBtn, Popover } from '../../../components/shared';

export const MiniEditor = ({ value, placeholder, readOnly = false, onChange }) => {
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);

  if (readOnly || !active) {
    return (
      <div 
        onClick={() => { if (!readOnly) setActive(true); }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`group relative transition-all rounded-md px-2.5 py-2 border border-transparent ${!readOnly ? 'cursor-text hover:border-indigo-200 hover:bg-indigo-50/30' : 'cursor-default'}`}
      >
        <div style={{ fontSize: 12, lineHeight: 1.55, color: value ? T.t2 : T.t4, whiteSpace: "pre-wrap" }}>
          {value || placeholder}
        </div>
        {!readOnly && hover && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil size={12} className="text-indigo-400" />
          </div>
        )}
        {readOnly && hover && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800 text-white shadow-xl pointer-events-none" style={{ fontSize: 10 }}>
            <ExternalLink size={10} /> Read-only (Synced from ALM)
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-md transition-all flex flex-col ring-2 ring-indigo-500/20 bg-white shadow-sm`} 
      style={{ border: `1px solid ${T.brand}`, overflow: "hidden" }}>
      <div className="flex items-center gap-1 border-b px-2 py-1" style={{ background: T.muted, borderColor: T.bd }}>
        <IBtn title="Bold"><Bold size={11} strokeWidth={2} /></IBtn>
        <IBtn title="Italic"><Italic size={11} strokeWidth={2} /></IBtn>
        <IBtn title="Link"><Link2 size={11} strokeWidth={2} /></IBtn>
        <div style={{ width: 1, height: 12, background: T.bd, margin: "0 4px" }} />
        <IBtn title="Bullet List"><List size={11} strokeWidth={2} /></IBtn>
      </div>
      <div contentEditable suppressContentEditableWarning
        className="outline-none px-2.5 py-2 whitespace-pre-wrap flex-1 cursor-text"
        style={{ fontSize: 12, lineHeight: 1.55, color: value ? T.t2 : T.t4, minHeight: 80 }}
        onFocus={() => setActive(true)}
        onBlur={e => { setActive(false); if (onChange) onChange(e.target.innerText); }}
        onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.blur(); }}
        dangerouslySetInnerHTML={{ __html: value || "" }}
      />
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

export const ReqQualityPopover = ({ quality, onClose }) => (
  <Popover open onClose={onClose}>
    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.bdLight}`, minWidth: 280 }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 12, fontWeight: 600, color: T.t1 }}>Requirement Quality</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: quality.color }}>{quality.overall}<span style={{ fontSize: 11, fontWeight: 500, color: T.t4 }}>/100</span></span>
      </div>
      <DimBar label="Completeness" value={quality.dims.completeness} icon={Check} />
      <DimBar label="Clarity" value={quality.dims.clarity} icon={Check} />
      <DimBar label="Ambiguity" value={quality.dims.ambiguity} icon={AlertTriangle} />
      <DimBar label="Testability" value={quality.dims.testability} icon={ShieldCheck} />
    </div>
    <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
      <div className="flex items-center gap-1.5 mb-2">
        <AlertTriangle size={11} style={{ color: T.amber }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: T.t2 }}>Critical Gaps</span>
      </div>
      <div style={{ fontSize: 11, color: T.t3, lineHeight: 1.4 }}>
        The requirement mentions "suspicious activity" but doesn't define the criteria for alerting. Consider adding specific boundary rules.
      </div>
    </div>
    <div className="flex items-center justify-between px-4 py-2">
      <button className="flex items-center gap-1" style={{ fontSize: 11, color: T.brand, fontWeight: 500 }}>
        Analyze in ALM <ExternalLink size={9} />
      </button>
      <div className="flex gap-0.5">
        <IBtn title="Helpful"><ThumbsUp size={12} strokeWidth={1.4} /></IBtn>
        <IBtn title="Not helpful"><ThumbsDown size={12} strokeWidth={1.4} /></IBtn>
      </div>
    </div>
  </Popover>
);
