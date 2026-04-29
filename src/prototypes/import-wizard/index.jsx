import React, { useState, useEffect } from "react";
import Layout from "../../components/shell/Layout";
import { T } from "../../utils/design-system";
import { Button } from "../../components/shared";
import { WizardBar } from "./components/WizardBar";
import { Step1 } from "./components/Step1Upload";
import { Step2 } from "./components/Step2Mapping";
import { Step3 } from "./components/Step3Preview";
import { ImportProgressModal } from "./components/Modals";
import { BUILD_ROWS } from "./data/mockData";

export default function ImportWizardPrototype() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState(BUILD_ROWS());
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [role, setRole] = useState("Admin");
  
  const LS_KEY = "katalon_import_state_demo";
  const [savedState, setSavedState] = useState(null);
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(LS_KEY); // use sessionStorage to match TTL: session
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.file && !file) {
          setSavedState(parsed);
          setShowResume(true);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (file && !showResume) {
      sessionStorage.setItem(LS_KEY, JSON.stringify({
        file, rows, step, completed: Array.from(completed), time: new Date().toLocaleTimeString()
      }));
    }
  }, [file, rows, step, completed, showResume]);

  const go = (s) => setStep(s);
  const next = () => { setCompleted(c => new Set([...c, step])); setStep(step + 1); };
  const back = () => setStep(Math.max(1, step - 1));
  const startImport = () => {
    setImporting(true);
    setTimeout(() => setDone(true), 2400);
  };
  
  const handleResume = () => {
    setFile(savedState.file);
    setRows(savedState.rows);
    setStep(savedState.step);
    setCompleted(new Set(savedState.completed));
    setShowResume(false);
  };

  const handleStartOver = () => {
    sessionStorage.removeItem(LS_KEY);
    setShowResume(false);
  };

  return (
    <Layout breadcrumbs={["Tests", "Import Test Cases"]} activeSidebarId="tests">
      <WizardBar current={step} completed={completed} onJump={go} />
      <div className="flex-1 overflow-hidden flex flex-col">
        {step === 1 && <Step1 file={file} setFile={setFile} onNext={next} />}
        {step === 2 && <Step2 rows={rows} setRows={setRows} onNext={next} onBack={back} role={role} setRole={setRole} />}
        {step === 3 && <Step3 rows={rows} onBack={back} onImport={startImport} />}
      </div>
      
      {showResume && savedState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(17,24,39,0.35)" }}>
          <div className="rounded-xl shadow-xl p-6" style={{ background: T.card, width: 440 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: T.t1, marginBottom: 8 }}>Resume previous import?</h3>
            <div className="rounded-lg border p-4 mb-6" style={{ borderColor: T.bdLight, background: T.bg }}>
              <div style={{ fontSize: 13, color: T.t2, marginBottom: 4 }}><span style={{ color: T.t3, width: 70, display: "inline-block" }}>File:</span> <strong style={{ color: T.t1, fontWeight: 500 }}>{savedState.file.name}</strong></div>
              <div style={{ fontSize: 13, color: T.t2, marginBottom: 4 }}><span style={{ color: T.t3, width: 70, display: "inline-block" }}>Last step:</span> Step {savedState.step}</div>
              <div style={{ fontSize: 13, color: T.t2 }}><span style={{ color: T.t3, width: 70, display: "inline-block" }}>Saved:</span> {savedState.time}</div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={handleStartOver}>Start over</Button>
              <Button variant="primary" onClick={handleResume}>Resume</Button>
            </div>
          </div>
        </div>
      )}

      {importing && (
        <ImportProgressModal 
          done={done} 
          onClose={() => { 
            setImporting(false); 
            setDone(false); 
            setStep(1); 
            setCompleted(new Set()); 
            setFile(null); 
            setRows(BUILD_ROWS()); 
            sessionStorage.removeItem(LS_KEY);
          }} 
        />
      )}
    </Layout>
  );
}
