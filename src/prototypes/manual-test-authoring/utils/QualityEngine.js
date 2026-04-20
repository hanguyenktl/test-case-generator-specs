import { T } from '../../../utils/design-system';

export function computeQuality(steps) {
  if (!steps.length) return { overall: 0, label: "No Steps", color: T.red, dimensions: { completeness: 0, clarity: 0, coverage: 0, executability: 0 }, stepIssues: [] };
  const issues = [];
  let complSum = 0, clarSum = 0, execSum = 0;
  steps.forEach(s => {
    let compl = 0, clar = 0, exec = 0;
    if (s.step) compl += 40; if (s.exp) compl += 40; if (s.data) compl += 20;
    if (!s.exp && s.step) issues.push({ stepId: s.id, source: "quality", type: "missing_expected", severity: "warning", msg: "Missing expected result", dimension: "completeness", field: "exp" });
    if (s.step && s.step.length < 15) { clar = 30; issues.push({ stepId: s.id, source: "quality", type: "vague_step", severity: "info", msg: "Step description is vague — add specifics", dimension: "clarity", field: "step" }); }
    else if (s.step && s.step.length < 30) clar = 60;
    else if (s.step) clar = 90;
    if (s.step && (/click|navigate|enter|verify|check|select|open|type/i.test(s.step))) exec = 90;
    else if (s.step) exec = 50;
    else exec = 0;
    complSum += compl; clarSum += clar; execSum += exec;
  });
  const completeness = Math.round(complSum / steps.length);
  const clarity = Math.round(clarSum / steps.length);
  const coverage = Math.min(100, Math.round(steps.length * 12 + (steps.some(s => /invalid|empty|error|wrong|negative|fail/i.test(s.step + s.exp)) ? 25 : 0)));
  const executability = Math.round(execSum / steps.length);
  const overall = Math.round((completeness * 0.3 + clarity * 0.25 + coverage * 0.2 + executability * 0.25));
  const label = overall >= 80 ? "Good" : overall >= 50 ? "Fair" : "Poor";
  const color = overall >= 80 ? T.green : overall >= 50 ? T.amber : T.red;
  return { overall, label, color, dimensions: { completeness, clarity, coverage, executability }, stepIssues: issues };
}

export function computeRunnerConfidence(steps) {
  if (!steps.length) return { score: 0, label: "N/A", color: T.t4, factors: [] };
  const factors = [];
  let score = 100;
  if (steps.length <= 10) factors.push({ key: "steps", ok: true, msg: `${steps.length} steps — ideal range` });
  else if (steps.length <= 20) { score -= 15; factors.push({ key: "steps", ok: true, msg: `${steps.length} steps — moderate complexity` }); }
  else { score -= 35; factors.push({ key: "steps", ok: false, msg: `${steps.length} steps — consider splitting` }); }
  const specific = steps.filter(s => /click|navigate|enter|verify|select|open|type|url|button|field|page/i.test(s.step)).length;
  const specRatio = steps.length ? specific / steps.length : 0;
  if (specRatio >= 0.7) factors.push({ key: "specificity", ok: true, msg: "Steps have concrete actions" });
  else { score -= 20; factors.push({ key: "specificity", ok: false, msg: `${Math.round((1 - specRatio) * 100)}% of steps lack specific actions` }); }
  const withData = steps.filter(s => s.data && s.data.trim()).length;
  factors.push({ key: "data", ok: withData > 0, msg: `${withData}/${steps.length} steps have test data` });
  if (withData === 0) score -= 10;
  const hasCaptcha = steps.some(s => /captcha|2fa|mfa|otp|sms/i.test(s.step + s.exp + s.data));
  if (hasCaptcha) { score -= 30; factors.push({ key: "complexity", ok: false, msg: "CAPTCHA/2FA detected — manual intervention likely" }); }
  else factors.push({ key: "complexity", ok: true, msg: "Standard UI flow — no blockers detected" });
  score = Math.max(0, Math.min(100, score));
  const label = score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";
  const color = score >= 80 ? T.green : score >= 50 ? T.amber : T.red;
  return { score, label, color, factors };
}
