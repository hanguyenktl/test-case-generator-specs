import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, X, ChevronDown, ChevronRight, ArrowRight, Info, Wand2, Sparkles } from "lucide-react";
import { T } from "../../../utils/design-system";
import { Button } from "../../../components/shared";
import { Field, selectStyle } from "./utils";

export const Step1 = ({ file, setFile, onNext }) => {
  const [adv, setAdv] = useState(false);
  const [encoding, setEncoding] = useState("UTF-8");
  const [delimiter, setDelimiter] = useState("Auto");
  const [hasHeader, setHasHeader] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [showAIBanner, setShowAIBanner] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[880px] mx-auto py-8 px-5">
      <div className="mb-6">
        <h2 style={{ fontSize: 18, fontWeight: 600, color: T.t1, marginBottom: 4 }}>Import Test Cases</h2>
        <p style={{ fontSize: 13, color: T.t3 }}>
          Upload a CSV file from TestRail, Zephyr, Xray, or your own spreadsheet. If your file is in Excel format (.xlsx), save it as a CSV file before importing. Files up to 50MB, 10,000 rows per import.
        </p>
      </div>

      {showInfoBanner && (
        <div className="mb-4 rounded-lg p-4 flex items-start gap-3 transition-all" style={{ background: "#f0f4ff", border: "1px solid #dbeafe" }}>
          <Info size={16} strokeWidth={2} style={{ color: "#3b82f6", marginTop: 2, flexShrink: 0 }} />
          <div className="flex-1">
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1e40af", marginBottom: 2 }}>Import test cases in both .xlsx and .csv formats</div>
            <p style={{ fontSize: 12.5, color: "#3b82f6", lineHeight: 1.5 }}>
              Easily import both Excel (.xlsx) files and traditional test cases into your repository using CSV.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <button style={{ fontSize: 12.5, fontWeight: 500, color: "#2563eb", textDecoration: "underline", textUnderlineOffset: 2 }}>Read Documentation</button>
              <button onClick={() => setShowInfoBanner(false)} style={{ fontSize: 12.5, fontWeight: 500, color: "#60a5fa" }}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {showAIBanner && (
        <div className="mb-6 rounded-xl border p-5 relative overflow-hidden transition-all shadow-sm" style={{ borderColor: T.accentBorder, background: T.card }}>
          <div className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${T.accentLight})` }} />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner" style={{ background: `linear-gradient(135deg, #eef2ff, ${T.accentLight})`, border: `1px solid ${T.accentBorder}`, color: T.brand }}>
                <Sparkles size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: T.t1, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  Let AI do the heavy lifting instead
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ background: T.brand, color: "#fff" }}>New</span>
                </h3>
                <p style={{ fontSize: 13, color: T.t2, lineHeight: 1.5, maxWidth: 520 }}>
                  Save time by generating test cases directly from a requirement document or a simple prompt using AI. No spreadsheet formatting required.
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <Button variant="primary" icon={Wand2}>Try AI Test Generation</Button>
                  <button onClick={() => setShowAIBanner(false)} style={{ fontSize: 12.5, color: T.t3, fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.color = T.t2} onMouseLeave={e => e.currentTarget.style.color = T.t3}>
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!file ? (
        <label className="block rounded-lg border-2 border-dashed cursor-pointer transition"
          style={{ borderColor: T.bd, background: T.card, padding: 48 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.background = T.card; }}>
          <input type="file" accept=".csv" className="hidden" onChange={e => {
            const f = e.target.files?.[0]; 
            if (f) {
              if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.type.includes('excel')) {
                setError("Only .csv files are supported. To import from Excel, save your spreadsheet as CSV first — see help.");
                setFile(null);
              } else {
                setError(null);
                setFile({ name: f.name || "test-cases.csv", rows: 48, columns: 14 });
              }
            }
          }} />
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3" style={{ background: T.accentLight, color: T.brand }}>
              <UploadCloud size={22} strokeWidth={1.6} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.t1 }}>Drop your .csv file here, or click to browse</div>
            <div style={{ fontSize: 12, color: T.t3, marginTop: 4 }}>.csv &middot; UTF-8 recommended</div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={e => { e.preventDefault(); setFile({ name: "testrail-export.csv", rows: 48, columns: 14 }); }}
                style={{ fontSize: 11.5, color: T.brand, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Use sample TestRail file
              </button>
              <span style={{ color: T.t4 }}>&middot;</span>
              <button onClick={e => e.preventDefault()} style={{ fontSize: 11.5, color: T.brand, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Download a template
              </button>
            </div>
            {error && (
              <div className="mt-4 px-3 py-2 rounded text-left flex items-start gap-2" style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
                <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>{error}</span>
              </div>
            )}
          </div>
        </label>
      ) : (
        <div className="rounded-lg border p-4 flex items-center gap-3" style={{ background: T.card, borderColor: T.bd }}>
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: T.greenBg, color: T.green }}>
            <FileSpreadsheet size={18} strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 13, fontWeight: 600, color: T.t1 }}>{file.name}</div>
            <div style={{ fontSize: 11.5, color: T.t3, marginTop: 2 }}>
              {file.rows} rows &middot; {file.columns} columns detected &middot; first row treated as header
            </div>
          </div>
          <button onClick={() => setFile(null)}
            className="h-7 px-2 rounded-md flex items-center gap-1.5"
            style={{ fontSize: 12, color: T.t3 }}
            onMouseEnter={e => e.currentTarget.style.background = T.muted}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <X size={13} strokeWidth={1.8} /> Replace
          </button>
        </div>
      )}

      {/* Advanced options */}
      <div className="mt-6 border-t pt-5" style={{ borderColor: T.bdLight }}>
        <button onClick={() => setAdv(!adv)} className="flex items-center gap-1.5"
          style={{ fontSize: 12.5, color: T.t2, fontWeight: 500 }}>
          {adv ? <ChevronDown size={14} strokeWidth={2} /> : <ChevronRight size={14} strokeWidth={2} />}
          Advanced file options
          <span style={{ color: T.t4, fontWeight: 400, marginLeft: 4 }}>
            ({encoding}, {delimiter === "Auto" ? "auto-detect" : delimiter}, header: {hasHeader ? "yes" : "no"})
          </span>
        </button>
        {adv && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Field label="File encoding">
              <select value={encoding} onChange={e => setEncoding(e.target.value)} style={selectStyle}>
                <option>UTF-8</option><option>UTF-16</option><option>ISO-8859-1</option><option>Windows-1252</option>
              </select>
            </Field>
            <Field label="Column delimiter">
              <select value={delimiter} onChange={e => setDelimiter(e.target.value)} style={selectStyle}>
                <option>Auto</option><option>Comma (,)</option><option>Semicolon (;)</option><option>Tab</option>
              </select>
            </Field>
            <Field label="First row is header">
              <select value={hasHeader ? "Yes" : "No"} onChange={e => setHasHeader(e.target.value === "Yes")} style={selectStyle}>
                <option>Yes</option><option>No</option>
              </select>
            </Field>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between pt-5 border-t" style={{ borderColor: T.bd }}>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary" icon={ArrowRight} onClick={onNext} disabled={!file}>Continue to mapping</Button>
      </div>
      </div>
    </div>
  );
};
