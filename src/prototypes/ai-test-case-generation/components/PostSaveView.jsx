import React from 'react';
import { Check, Play, Sparkles } from 'lucide-react';
import { T } from '../../../utils/design-system';

/* ═══════════════════════════════════════════════════════════════
   POST-SAVE VIEW
   ═══════════════════════════════════════════════════════════════ */
export const PostSaveView = ({ savedCount, isJ1 }) => (
  <div className="flex-1 overflow-y-auto p-5">
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="rounded-lg p-5" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(22,163,74,0.08)", border: "1.5px solid rgba(22,163,74,0.2)" }}>
            <Check size={16} style={{ color: T.green }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.t1 }}>{savedCount} test cases saved</div>
            {isJ1 && <div style={{ fontSize: 11, color: T.brand, marginTop: 2 }}>Linked to TO-8526 &middot; User authentication flow</div>}
          </div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Next steps</div>
        {[
          { icon: Play, title: `Execute these ${savedCount} test cases`, desc: "Create a test run with just-saved TCs", conf: "2 ready, 2 need review, 1 manual" },
          ...(isJ1 ? [{ icon: Play, title: "Execute all for TO-8526 (12 test cases)", desc: "Includes 7 existing + " + savedCount + " just saved", conf: "7 ready, 3 review, 2 manual" }] : []),
          { icon: Sparkles, title: "Generate more test cases", desc: "Keep generating for uncovered areas" },
        ].map((opt, i) => (
          <div key={i} className="rounded-md mb-2 p-3 cursor-pointer transition-colors"
            style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdLight; e.currentTarget.style.background = T.bg; }}>
            <div className="flex items-center gap-2">
              <opt.icon size={14} style={{ color: opt.icon === Sparkles ? T.purple : T.brand }} strokeWidth={1.6} />
              <span style={{ fontSize: 12, fontWeight: 500, color: T.t1 }}>{opt.title}</span>
            </div>
            <div style={{ fontSize: 11, color: T.t3, marginTop: 2, marginLeft: 22 }}>{opt.desc}</div>
            {opt.conf && (
              <div className="flex items-center gap-2 mt-1.5 ml-5" style={{ fontSize: 10, color: T.t4 }}>
                AI Confidence: {opt.conf}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);
