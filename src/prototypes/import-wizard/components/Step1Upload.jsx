import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, X, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { T } from "../../../utils/design-system";
import { Button } from "../../../components/shared";
import { Field, selectStyle } from "./utils";

export const Step1 = ({ file, setFile, onNext }) => {
  const [adv, setAdv] = useState(false);
  const [encoding, setEncoding] = useState("UTF-8");
  const [delimiter, setDelimiter] = useState("Auto");
  const [hasHeader, setHasHeader] = useState(true);

  return (
    <div className="max-w-[880px] mx-auto py-8">
      <h2 style={{ fontSize: 18, fontWeight: 600, color: T.t1, marginBottom: 4 }}>Upload your file</h2>
      <p style={{ fontSize: 13, color: T.t3, marginBottom: 20 }}>
        Upload a CSV or Excel file from TestRail, Zephyr, Xray, or your own spreadsheet. Files up to 50MB, 10,000 rows per import.
      </p>

      {!file ? (
        <label className="block rounded-lg border-2 border-dashed cursor-pointer transition"
          style={{ borderColor: T.bd, background: T.card, padding: 48 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.background = T.card; }}>
          <input type="file" className="hidden" onChange={e => {
            const f = e.target.files?.[0]; if (f) setFile({ name: f.name || "test-cases.csv", rows: 48, columns: 14 });
          }} />
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3" style={{ background: T.accentLight, color: T.brand }}>
              <UploadCloud size={22} strokeWidth={1.6} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.t1 }}>Drop your file here, or click to browse</div>
            <div style={{ fontSize: 12, color: T.t3, marginTop: 4 }}>.csv, .xlsx, .xls &middot; UTF-8 recommended</div>
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
  );
};
