import React, { useState } from "react";
import Layout from "../../components/shell/Layout";
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

  const go = (s) => setStep(s);
  const next = () => { setCompleted(c => new Set([...c, step])); setStep(step + 1); };
  const back = () => setStep(Math.max(1, step - 1));
  const startImport = () => {
    setImporting(true);
    setTimeout(() => setDone(true), 2400);
  };

  return (
    <Layout breadcrumbs={["Tests", "Import Test Cases"]} activeSidebarId="tests">
      <WizardBar current={step} completed={completed} onJump={go} />
      <div className="flex-1 overflow-hidden flex flex-col">
        {step === 1 && <Step1 file={file} setFile={setFile} onNext={next} />}
        {step === 2 && <Step2 rows={rows} setRows={setRows} onNext={next} onBack={back} role={role} setRole={setRole} />}
        {step === 3 && <Step3 rows={rows} onBack={back} onImport={startImport} />}
      </div>
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
          }} 
        />
      )}
    </Layout>
  );
}
