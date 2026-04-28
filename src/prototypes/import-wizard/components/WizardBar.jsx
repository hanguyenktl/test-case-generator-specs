import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { T } from "../../../utils/design-system";
import { STEPS } from "../data/mockData";

export const WizardBar = ({ current, completed, onJump }) => (
  <div className="flex items-center gap-1 px-5 py-3 border-b" style={{ background: T.card, borderColor: T.bd }}>
    {STEPS.map((s, i) => {
      const isDone = completed.has(s.id);
      const isActive = current === s.id;
      const clickable = isDone;
      return (
        <div key={s.id} className="flex items-center gap-1">
          <button onClick={() => clickable && onJump(s.id)}
            disabled={!clickable && !isActive}
            className="flex items-center gap-2 h-8 px-2.5 rounded-md"
            style={{
              background: isActive ? T.accentLight : "transparent",
              cursor: clickable ? "pointer" : "default",
            }}
            onMouseEnter={e => { if (clickable && !isActive) e.currentTarget.style.background = T.muted; }}
            onMouseLeave={e => { if (clickable && !isActive) e.currentTarget.style.background = "transparent"; }}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{
              background: isDone ? T.green : isActive ? T.brand : T.muted,
              color: isDone || isActive ? "#fff" : T.t3,
              fontSize: 10, fontWeight: 600,
            }}>
              {isDone ? <Check size={11} strokeWidth={2.5} /> : s.id}
            </span>
            <span style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 500, color: isActive ? T.t1 : isDone ? T.t2 : T.t3 }}>
              {s.label}
            </span>
          </button>
          {i < STEPS.length - 1 && <ChevronRight size={13} style={{ color: T.t4 }} />}
        </div>
      );
    })}
  </div>
);
