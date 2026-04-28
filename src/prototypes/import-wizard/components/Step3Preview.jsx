import React, { useState, useMemo } from "react";
import { Download, ChevronLeft, ChevronRight, Info, ArrowLeft } from "lucide-react";
import { T } from "../../../utils/design-system";
import { Button, Badge } from "../../../components/shared";

export const Step3 = ({ rows, onBack, onImport }) => {
  const [idx, setIdx] = useState(0);

  // Build a preview record from the 48-row mock file at index `idx`
  const preview = useMemo(() => {
    const sampleSet = [
      { Title: "Verify user can log in with valid credentials", Priority: "High", Status: "Active", Section: "Authentication > Login" },
      { Title: "Verify password reset via email link",           Priority: "Medium", Status: "Active", Section: "Authentication > Password" },
      { Title: "Verify login fails with invalid password",       Priority: "High", Status: "Active", Section: "Authentication > Login" },
      { Title: "Verify session expiry after 30 minutes idle",    Priority: "Medium", Status: "Draft",  Section: "Authentication > Session" },
    ];
    return sampleSet[idx % sampleSet.length];
  }, [idx]);

  const skipped = rows.filter(r => r.target === "__skip__");
  const mapped = rows.filter(r => r.target && r.target !== "__skip__");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b shrink-0" style={{ borderColor: T.bdLight, background: T.card }}>
        <div className="flex items-end justify-between">
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: T.t1 }}>Review before importing</h2>
            <p style={{ fontSize: 12.5, color: T.t3, marginTop: 2 }}>
              Preview how each row will be created. <strong style={{ color: T.t1, fontWeight: 600 }}>48 test cases</strong> will be imported into <strong style={{ color: T.t1, fontWeight: 600 }}>RA Project &rsaquo; Imports / 2026-04-23</strong>.
            </p>
          </div>
          <Button variant="secondary" icon={Download}>Download mapping report (.json)</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        <div className="max-w-[960px] mx-auto">
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <SumCard label="Total rows" value="48" />
            <SumCard label="Columns mapped" value={mapped.length} hint={`of ${rows.length}`} />
            <SumCard label="Columns skipped" value={skipped.length} />
            <SumCard label="Custom fields to create" value="0" />
          </div>

          {/* Preview card with navigation */}
          <div className="rounded-lg border" style={{ background: T.card, borderColor: T.bd }}>
            <div className="px-4 h-10 flex items-center justify-between border-b" style={{ borderColor: T.bdLight }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, fontWeight: 600, color: T.t1 }}>Preview</span>
                <span style={{ fontSize: 11.5, color: T.t3 }}>Row {idx + 1} of 48</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
                  style={{ height: 26, width: 26, borderRadius: 5, border: `1px solid ${T.bd}`, background: T.card,
                    color: idx === 0 ? T.t4 : T.t2, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: idx === 0 ? "default" : "pointer" }}>
                  <ChevronLeft size={14} strokeWidth={2} />
                </button>
                <button onClick={() => setIdx(i => Math.min(47, i + 1))} disabled={idx === 47}
                  style={{ height: 26, width: 26, borderRadius: 5, border: `1px solid ${T.bd}`, background: T.card,
                    color: idx === 47 ? T.t4 : T.t2, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: idx === 47 ? "default" : "pointer" }}>
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3">
              <PrevRow label="Name" value={preview.Title} tag="required" />
              <PrevRow label="Priority" value={<Badge color={T.red} bg={T.redBg}>P1</Badge>} tag="from: High" />
              <PrevRow label="Folder" value={preview.Section} tag="from: Section" />
              <PrevRow label="Status" value={<Badge color={T.green} bg={T.greenBg}>Ready</Badge>} tag="from: Active" />
              <PrevRow label="Steps" value="1. Navigate to login page  2. Enter credentials  3. Submit form" />
              <PrevRow label="Expected" value="User lands on dashboard" />
            </div>
          </div>

          {/* Skipped fields notice */}
          {skipped.length > 0 && (
            <div className="mt-4 rounded-md border p-3 flex items-start gap-2.5" style={{ background: T.hover, borderColor: T.bd }}>
              <Info size={13} strokeWidth={1.8} style={{ color: T.t3, marginTop: 2 }} />
              <div style={{ fontSize: 12.5, color: T.t2 }}>
                <strong style={{ color: T.t1, fontWeight: 600 }}>{skipped.length} columns will be skipped:</strong>{" "}
                <span style={{ color: T.t3 }}>{skipped.map(r => r.csv).join(", ")}.</span>{" "}
                <button style={{ color: T.brand, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 2 }}>
                  Go back to map them →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 border-t flex items-center justify-between shrink-0" style={{ background: T.card, borderColor: T.bd }}>
        <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Back to mapping</Button>
        <Button variant="primary" onClick={onImport}>Import 48 test cases</Button>
      </div>
    </div>
  );
};

const SumCard = ({ label, value, hint }) => (
  <div className="rounded-lg border p-3" style={{ background: T.card, borderColor: T.bd }}>
    <div style={{ fontSize: 11, color: T.t3, textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 500 }}>{label}</div>
    <div className="flex items-baseline gap-1.5 mt-1">
      <div style={{ fontSize: 22, fontWeight: 600, color: T.t1, letterSpacing: -0.3 }}>{value}</div>
      {hint && <div style={{ fontSize: 11.5, color: T.t3 }}>{hint}</div>}
    </div>
  </div>
);

const PrevRow = ({ label, value, tag }) => (
  <div>
    <div style={{ fontSize: 11, color: T.t3, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 }}>
      {label} {tag && <span style={{ textTransform: "none", color: T.t4, fontWeight: 400, letterSpacing: 0, marginLeft: 4 }}>&middot; {tag}</span>}
    </div>
    <div style={{ fontSize: 13, color: T.t1, lineHeight: 1.5 }}>{value}</div>
  </div>
);
