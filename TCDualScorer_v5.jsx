import { useState, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// SCORER v5.0 — Dual-score: Quality Score + AI Readiness Score
// Spec: TestCase_Quality_Scorer_v5_0_Spec.md
// Quality  → authoring rules R1–R11, TC-A/B/C/D(>15)/E/F/G
// Readiness → execution rules R5,R12–R15, TC-D(>10)/H/I
// ═══════════════════════════════════════════════════════════════

// ── Shared Vocabularies ─────────────────────────────────────────
const ACTION_VERBS = [
  'navigate','open','go to','go back','refresh',
  'click','tap','press','enter','type','input','fill','clear','paste',
  'select','choose','check','uncheck','toggle',
  'verify','confirm','assert','validate','ensure','check that',
  'hover','scroll','wait','search','submit','upload','expand','collapse',
  'download','export','save as','drag',  // quality-valid; readiness flags R12/R13 separately
];
const AMBIGUOUS_ACTIONS = ['handle','process','manage','deal with','interact with','use ','access','perform','do ','execute','run','test ','check the','review','look at','see ','make sure'];
const COMPOUND_SIGNALS  = [' and then ',' and verify ',' and check ',' and confirm ',' then click ',' then enter ',' then select ',' then navigate ',', then ','. then ','. verify ','. check '];
const IMPLICIT_DATA     = ["the user's",'their email','their password','a valid ','an invalid ','the correct ','some data','some file','the file','appropriate '];
const ACTION_IN_EXPECTED= ['click','navigate to','enter','type','fill','select','submit','press','drag','scroll to','upload','download a'];
const HARDCODED_ENV     = [/https?:\/\/(?:localhost|127\.0\.0\.1|staging\.|prod\.|production\.)/i,/:\d{4,5}\//];
const SELECTOR_PATTERNS = [/id=['"][\w-]+['"]/i,/class=['"][\w-\s]+['"]/i,/\#[\w-]+\b/,/\.[\w-]+\.[\w-]+/,/\/\/[\w]+\[/,/css selector/i,/xpath/i,/data-testid/i,/\[data-/i];
const SUBJECTIVE_TERMS  = ['intuitive','user-friendly','clean','modern','professional','responsive','fast','smooth','nice','good','proper','appropriate','reasonable','acceptable'];

// Exact vague results — complete matches only
const VAGUE_EXACT = [
  'it works','works correctly','is correct','looks good','is displayed','page loads',
  'no issues','everything is fine','as expected','success','done','ok','passed',
  'it works fine','works fine','loads fine','it loaded','it opened','it closed',
];
// Suffix-based vague endings
const VAGUE_SUFFIX = ['looks good','works correctly','is correct','no issues','everything is fine','works fine'];

// Pattern-based vague detection — catches "it uploads", "page is ok", "everything works fine"
// These are generic affirmations that provide no specific observable outcome
const VAGUE_PATTERNS = [
  /^it (works|loads|uploads|opens|shows|runs|saves|sends|submits|processes|completes|finishes|appears|displays|downloads|closes|redirects|refreshes)\b/i,
  /^everything (works|is (fine|ok|good|correct)|looks (good|ok)|is working)\b/i,
  /^(page|screen|form|modal|dialog|view) is (ok|fine|good|correct|working|loaded|shown|visible|displayed)\b/i,
  /^(works|loads|submits|saves|uploads|opens|closes|shows|passes|runs)(\s*\.?\s*)$/i,
  /^(is (ok|fine|correct|good|working|loaded|shown|visible|displayed))\s*$/i,
  /^(test )?(passes|passed|works|succeeds|succeeded)\s*$/i,
];
const VERIFY_VERBS  = ['verify','confirm','check','assert','ensure','validate','observe','check that','assert that','ensure that','validate that'];
const DATA_REF      = /\{(\w+)\}/g;

// ── AI Readiness Vocabularies ───────────────────────────────────
const UNSUPPORTED_ACTIONS = [
  'switch tab','switch window','new tab','new window','open in new tab','pop-up window','popup window',
  'solve captcha','complete captcha','enter captcha',
  'otp','one-time password','enter the otp','enter otp',
  'sms code','verification code from sms','code from sms',
  'two-factor','2fa code','mfa code','authenticator app',
  'biometric','fingerprint','face id','touch id',
  'email verification link','click the link in the email','verify email',
  'phone call verification','draw on canvas','paint on canvas','sketch on canvas',
];
const PARTIAL_SUPPORT = ['download','export to','export as','save as','export file'];
const FRAGILE_ACTIONS = [
  'double-click','double click','dbl-click','dbl click',
  'right-click','right click','context menu','long press',
  'keyboard shortcut','press ctrl','press alt','press cmd','ctrl+','alt+','cmd+',
  'inside iframe','within iframe','in the iframe','shadow dom','shadow root',
  'on the svg','on the chart','on the canvas','on the map','in the webgl',
  'drag and drop','drag-and-drop','drag ',
];
const VISUAL_JUDGMENT = [
  /\b(?:looks?\s+(?:good|correct|right|normal|ok|fine|nice|proper|professional|clean|modern))\b/i,
  /\b(?:aligned|centered|spaced|sized|proportioned)\s+(?:correctly|properly|well|nicely)\b/i,
  /\b(?:visually\s+(?:appealing|consistent|correct|acceptable))\b/i,
  /\b(?:UI\s+(?:is|looks|appears)\s+(?:correct|proper|good|fine))\b/i,
  /\b(?:matches?\s+(?:the\s+)?(?:design|mockup|figma|wireframe|prototype))\b/i,
  /\b(?:layout\s+(?:is|looks|appears)\s+(?:correct|proper|good|as expected))\b/i,
];
const EXTERNAL_STATE = [
  /\b(?:email\s+(?:is\s+)?(?:sent|received|delivered|arrives?))\b/i,
  /\b(?:sms|text message|push\s+notification)\s+(?:is\s+)?(?:sent|received|arrives?)\b/i,
  /\b(?:notification\s+(?:is\s+)?(?:sent|delivered|pushed))\b/i,
  /\b(?:file\s+(?:is\s+)?(?:downloaded|saved|created|exists?)\s+(?:on|to|in|at)\s+(?:disk|desktop|local|folder|directory))\b/i,
  /\b(?:database|db)\s+(?:is\s+)?(?:updated|changed|reflects?|contains?|stores?)\b/i,
  /\b(?:api|endpoint|server)\s+(?:returns?|responds?\s+with|sends?)\b/i,
  /\b(?:backend\s+(?:processes?|handles?|stores?))\b/i,
];

// ── Step Scorer (returns separate quality + readiness deductions) ─
function scoreStep(step) {
  const action   = step.action || '';
  const aL       = action.toLowerCase().trim();
  const expected = step.expectedResult || '';
  const eL       = expected.toLowerCase().trim();
  const isManual = aL.startsWith('[manual]');
  const clean    = isManual ? aL.replace('[manual]', '').trim() : aL;

  const qD = []; // quality deductions
  const rD = []; // readiness deductions

  // ── QUALITY RULES ───────────────────────────────────────────
  const hasVerb = ACTION_VERBS.some(v => clean.startsWith(v));
  const r1Fired = !hasVerb && !isManual;
  if (r1Fired) qD.push({ rule:'R1', label:'No Action Verb', pts:-25, fix:'Start with: Navigate, Click, Enter, Fill, Verify, Select…' });

  let r2Fired = false;
  if (!expected || eL.length < 5) {
    qD.push({ rule:'R2', label:'No Expected Result', pts:-30, fix:'Describe what should be visible: text, element state, URL, or count' });
    r2Fired = true;
  } else if (
    VAGUE_EXACT.some(v => eL === v) ||
    VAGUE_SUFFIX.some(v => eL.endsWith(v)) ||
    VAGUE_PATTERNS.some(p => p.test(eL))
  ) {
    qD.push({ rule:'R2', label:'Vague Expected Result', pts:-20, fix:"Be specific: \"'Dashboard' title visible\" or \"'Success' toast appears\"" });
    r2Fired = true;
  }
  if (!r1Fired && AMBIGUOUS_ACTIONS.some(a => clean.startsWith(a)))
    qD.push({ rule:'R3', label:'Ambiguous Action', pts:-15, fix:'Use specific verbs: Click, Enter, Select, Verify' });
  if (COMPOUND_SIGNALS.some(s => aL.includes(s)))
    qD.push({ rule:'R4', label:'Compound Step', pts:-10, fix:'Split at "and then" / "then verify" — one action per step' });
  const hasRefs = [...aL.matchAll(DATA_REF)].length > 0;
  if ((hasRefs && !step.testData) || (IMPLICIT_DATA.some(p => aL.includes(p)) && !step.testData))
    qD.push({ rule:'R6', label:'Missing Test Data', pts:-10, fix:"Replace 'a valid email' with 'test@example.com' or add testData field" });
  if (action.length > 200)
    qD.push({ rule:'R7', label:'Step Too Long', pts:-5, fix:`${action.length} chars (max 200). Split or simplify.` });
  if (SELECTOR_PATTERNS.some(p => p.test(action)))
    qD.push({ rule:'R8', label:'Selector Reference', pts:-15, fix:"Use visible text: \"Click the 'Submit' button\" not #submit-btn" });
  if (!r2Fired && SUBJECTIVE_TERMS.some(t => eL.includes(t)))
    qD.push({ rule:'R9', label:'Subjective Language', pts:-15, fix:"Replace with observable: 'loads in <3s' not 'loads fast'" });
  if (ACTION_IN_EXPECTED.some(v => eL.startsWith(v)))
    qD.push({ rule:'R10', label:'Action in Expected Result', pts:-15, fix:'Expected result should describe observable state, not an action' });
  if (HARDCODED_ENV.some(p => p.test(action)))
    qD.push({ rule:'R11', label:'Hard-coded Env URL', pts:-5, fix:'Use relative paths "/path" or env variables {baseUrl}' });

  // ── READINESS RULES ─────────────────────────────────────────
  if (!isManual) {
    const r5match = UNSUPPORTED_ACTIONS.find(u => clean.includes(u));
    if (r5match) {
      rD.push({ rule:'R5', label:'Unsupported Action', pts:-50, fix:'Add [MANUAL] prefix or restructure to avoid this interaction', detail:r5match });
    } else {
      if (PARTIAL_SUPPORT.some(v => clean.includes(v)))
        rD.push({ rule:'R12', label:'Partial Support', pts:-25, fix:"Runner triggers click but can't verify file. Rewrite expected result as UI-observable." });
      if (FRAGILE_ACTIONS.some(v => clean.includes(v)))
        rD.push({ rule:'R13', label:'Fragile Interaction', pts:-15, fix:'Runner will attempt but confidence is lower. Add [MANUAL] if critical.' });
    }
    if (VISUAL_JUDGMENT.some(p => p.test(expected)))
      rD.push({ rule:'R14', label:'Visual Judgment', pts:-30, fix:"Runner can't evaluate appearance. Use: element visibility, text content, count." });
    if (EXTERNAL_STATE.some(p => p.test(expected)))
      rD.push({ rule:'R15', label:'External State', pts:-20, fix:"Runner can't verify outside browser. Rewrite as: \"'Email sent' toast appears\"." });
  }

  const qualityScore   = Math.max(0, 100 + qD.reduce((s,d) => s + d.pts, 0));
  const readinessScore = isManual ? 0 : Math.max(0, 100 + rD.reduce((s,d) => s + d.pts, 0));

  return { qualityScore, readinessScore, qualityDeductions:qD, readinessDeductions:rD, isManual };
}

// ── TC-level step context helper ────────────────────────────────
// A step has verification context if it has an explicit verify verb OR a specific expected result.
// "Specific" means: long enough, not in vague exact/suffix lists, and not a generic affirmation pattern.
function stepHasVerificationContext(step) {
  const aL = (step.action||'').toLowerCase().trim();
  const eL = (step.expectedResult||'').toLowerCase().trim();
  const isVerifyVerb = VERIFY_VERBS.some(v => aL.startsWith(v));
  const hasMeaningfulExpected =
    eL.length > 10 &&
    !VAGUE_EXACT.some(v => eL === v) &&
    !VAGUE_SUFFIX.some(v => eL.endsWith(v)) &&
    !VAGUE_PATTERNS.some(p => p.test(eL));  // ← v5.1: excludes "everything works fine" etc.
  return isVerifyVerb || hasMeaningfulExpected;
}

// ── Main Scorer ─────────────────────────────────────────────────
function scoreTestCase(tc) {
  const steps = tc.steps || [];

  if (steps.length === 0) return {
    quality:   { score:0, badge:'🔴', label:'Poor Quality',  blended:0, avg:0, min:0, qPenalty:0, issues:[{rule:'FATAL',label:'No Steps',pts:0,sev:'critical',fix:'Add at least one step'}] },
    readiness: { score:0, badge:'🔴', label:'Blocked',       blended:0, avg:0, min:0, rPenalty:0, issues:[], tcHCapped:false, blockedRatio:0, executableCount:0 },
    stepScores:[], totalSteps:0,
  };

  const stepScores = steps.map(s => scoreStep(s));
  const totalSteps = steps.length;

  // ── QUALITY SCORE ──────────────────────────────────────────
  const qAvg = stepScores.reduce((s,ss) => s + ss.qualityScore, 0) / totalSteps;
  const qMin = Math.min(...stepScores.map(ss => ss.qualityScore));
  const qBlended = (qAvg * 0.6) + (qMin * 0.4);

  const qIssues = [];
  let qPenalty = 0;
  const add = (issue) => { qIssues.push(issue); qPenalty += (-issue.pts); };

  if (!tc.preconditions?.length)
    add({ rule:'TC-A', label:'No Preconditions', pts:-5, sev:'minor', fix:'Add login state, starting URL, and required data' });
  if (!tc.linkedACs?.length)
    qIssues.push({ rule:'TC-B', label:'Linked ACs (Advisory)', pts:0, sev:'info', fix:'Link to EAC IDs when generated from a requirement' });
  if (totalSteps === 1)
    add({ rule:'TC-C', label:'Single Step Test', pts:-5, sev:'minor', fix:'Add navigation, action, and verification steps' });
  if (totalSteps > 15)
    add({ rule:'TC-D', label:'Exceeds 15-step Limit', pts:-5, sev:'minor', fix:'Split into shorter focused test cases' });
  const tcEFired = !steps.some(s => stepHasVerificationContext(s));
  if (tcEFired)
    add({ rule:'TC-E', label:'No Verification Context', pts:-20, sev:'critical', fix:'Add verify steps or ensure steps have specific expectedResult fields' });
  if (!tc.objective || tc.objective.split(/\s+/).length < 5)
    add({ rule:'TC-F', label:'Missing Objective', pts:-3, sev:'info', fix:'Write: "Validates that [behavior] when [condition]"' });
  const tcName = tc.name || '';
  if (tcName && !tcName.toLowerCase().startsWith('verify '))
    qIssues.push({ rule:'TC-G', label:'Naming Convention', pts:0, sev:'info', fix:'Rename to: "Verify [what happens] [when condition]"' });

  const qRaw   = Math.max(0, Math.round(qBlended) - qPenalty);
  const qScore = qRaw;
  const qBadge = qScore >= 80 ? '🟢' : qScore >= 50 ? '🟡' : '🔴';
  const qLabel = qScore >= 80 ? 'Well-Authored' : qScore >= 50 ? 'Needs Work' : 'Poor Quality';

  // ── AI READINESS SCORE ─────────────────────────────────────
  const rAvg     = stepScores.reduce((s,ss) => s + ss.readinessScore, 0) / totalSteps;
  const rMin     = Math.min(...stepScores.map(ss => ss.readinessScore));
  const rBlended = (rAvg * 0.5) + (rMin * 0.5); // heavier min-weighting

  const rIssues = [];
  let rPenalty = 0;
  const radd = (issue) => { rIssues.push(issue); rPenalty += (-issue.pts); };

  if (totalSteps > 10)
    radd({ rule:'TC-D', label:'Long Test — Reliability Risk', pts:-8, sev:'info', fix:'For best AI results, aim for ≤10 steps. Consider splitting.' });

  const r5Count     = stepScores.filter(ss => ss.readinessDeductions.some(d => d.rule === 'R5')).length;
  const r12Count    = stepScores.filter(ss => ss.readinessDeductions.some(d => d.rule === 'R12')).length;
  const manualCount = stepScores.filter(ss => ss.isManual).length;
  const blockedCount = r5Count + r12Count + manualCount;
  const blockedRatio = blockedCount / totalSteps;
  let tcHCapped = false;

  const stepsWithResults = steps.filter(s => (s.expectedResult||'').trim().length > 5);
  const unverifiableCount = stepScores.filter(ss => ss.readinessDeductions.some(d => ['R14','R15'].includes(d.rule))).length;
  if (stepsWithResults.length > 2 && unverifiableCount / stepsWithResults.length > 0.5) {
    radd({ rule:'TC-I', label:'Majority Unverifiable Results', pts:-20, sev:'major', fix:'More than half of expected results cannot be evaluated by Runner. Rewrite as DOM-observable assertions.' });
  }

  let rRaw = Math.max(0, Math.round(rBlended) - rPenalty);
  if (blockedRatio > 0.4) {
    tcHCapped = true;
    rIssues.push({ rule:'TC-H', label:'Too Many Blocked Steps', pts:0, sev:'major',
      fix:`${blockedCount}/${totalSteps} steps blocked (${Math.round(blockedRatio*100)}%). Split into AI-executable + manual test.` });
    rRaw = Math.min(rRaw, 20);
  }

  // Aggregate step-level readiness deductions (R5,R12-R15) into rIssues so the Runner Issues tab surfaces them
  stepScores.forEach((ss, i) => {
    ss.readinessDeductions.forEach(d => {
      rIssues.push({ ...d, sev: d.rule === 'R5' ? 'critical' : d.rule === 'R14' ? 'major' : 'minor', stepNum: i + 1, label:`Step ${i+1}: ${d.label}` });
    });
  });

  const rScore = rRaw;
  const rBadge = rScore >= 80 ? '🟢' : rScore >= 50 ? '🟡' : '🔴';
  const rLabel = rScore >= 80 ? 'Runner Ready' : rScore >= 50 ? 'Will Attempt' : 'Blocked';

  const executableCount = stepScores.filter(ss => !ss.isManual && !ss.readinessDeductions.some(d => d.rule === 'R5')).length;

  return {
    quality:   { score:qScore, badge:qBadge, label:qLabel, blended:Math.round(qBlended), avg:Math.round(qAvg), min:qMin, qPenalty, issues:qIssues, tcEFired },
    readiness: { score:rScore, badge:rBadge, label:rLabel, blended:Math.round(rBlended), avg:Math.round(rAvg), min:rMin, rPenalty, issues:rIssues, tcHCapped, blockedRatio:Math.round(blockedRatio*100), executableCount },
    stepScores, totalSteps,
  };
}

// ── Examples ────────────────────────────────────────────────────
const EXAMPLES = {
  "QS🟢 ARS🟢 — Clean Login": {
    name:"Verify login fails with incorrect password",
    objective:"Validates that submitting invalid credentials returns a clear error message and prevents dashboard access",
    preconditions:["User account: test@katalon.com exists","User is on /login"],
    linkedACs:["EAC-1","EAC-2"],
    steps:[
      {stepNumber:1,action:"Navigate to '/login'",expectedResult:"Login page loads with 'Email' and 'Password' fields visible"},
      {stepNumber:2,action:"Enter 'test@katalon.com' in the 'Email' field",expectedResult:"Email field displays 'test@katalon.com'"},
      {stepNumber:3,action:"Enter 'wrongpassword123' in the 'Password' field",expectedResult:"Password field shows masked characters"},
      {stepNumber:4,action:"Click the 'Log In' button",expectedResult:"Error message 'Invalid email or password' appears below the form"},
      {stepNumber:5,action:"Verify the URL remains '/login'",expectedResult:"Browser URL still shows '/login' — user is not redirected"},
    ],
  },
  "QS🟢 ARS🟡 — 2FA (Architectural Limit)": {
    name:"Verify 2FA login and report export",
    objective:"Validates that a user completes 2FA authentication and exports the test results as PDF",
    preconditions:["User has 2FA enabled on test@company.com","User is on /login"],
    linkedACs:[],
    steps:[
      {stepNumber:1,action:"Navigate to '/login'",expectedResult:"Login page loads with Email and Password fields"},
      {stepNumber:2,action:"Enter 'test@company.com' in the 'Email' field",expectedResult:"Email field shows 'test@company.com'"},
      {stepNumber:3,action:"Enter 'Secure@123' in the 'Password' field",expectedResult:"Password field shows masked characters"},
      {stepNumber:4,action:"Click the 'Log In' button",expectedResult:"'Two-Factor Authentication' prompt appears"},
      {stepNumber:5,action:"Enter the OTP from SMS in the '2FA Code' field",expectedResult:"OTP field accepts 6-digit code"},
      {stepNumber:6,action:"Click 'Verify' button",expectedResult:"Dashboard loads with user avatar in top-right corner"},
      {stepNumber:7,action:"Navigate to '/reports/test-runs'",expectedResult:"Test Runs report page loads with filter bar visible"},
      {stepNumber:8,action:"Export to PDF the current report",expectedResult:"'Report exported' success toast appears"},
    ],
  },
  "QS🟢 ARS🔴 — TC-H Cap Triggered": {
    name:"Verify account registration with identity and 2FA setup",
    objective:"Validates that a new user completes account registration including phone verification, 2FA, email confirmation, and CAPTCHA",
    preconditions:["New user account created: newuser@company.com","User is on /registration/verify"],
    linkedACs:[],
    // TC-H fires: 5/8 steps are blocked (2 R5 + 3 [MANUAL]) = 62.5% > 40% → ARS capped at 20 🔴
    // Quality stays high: all steps well-authored, [MANUAL] prefix exempts from R1
    steps:[
      {stepNumber:1,action:"Navigate to '/registration/verify'",expectedResult:"Verification page loads with Email and Phone fields"},
      {stepNumber:2,action:"Enter 'newuser@company.com' in the 'Email' field",expectedResult:"Email field shows 'newuser@company.com'"},
      {stepNumber:3,action:"Click the 'Send Verification Code' button",expectedResult:"'Code sent to your phone' confirmation message appears"},
      {stepNumber:4,action:"Enter the OTP from SMS in the 'Verification Code' field",expectedResult:"Code field accepts 6-digit input"},
      {stepNumber:5,action:"[MANUAL] Complete the CAPTCHA verification challenge",expectedResult:"CAPTCHA shows a green checkmark indicating success"},
      {stepNumber:6,action:"[MANUAL] Click the email verification link sent to newuser@company.com",expectedResult:"Browser redirects to /registration/step-2 with 'Email verified' banner"},
      {stepNumber:7,action:"Enter the MFA code from authenticator app in the '2FA Code' field",expectedResult:"'2FA enabled' confirmation badge appears on the security section"},
      {stepNumber:8,action:"[MANUAL] Complete the biometric face verification scan",expectedResult:"'Identity verified' status shows on the profile header"},
    ],
  },
  "QS🔴 ARS🟢 — Vague but Runnable": {
    name:"Login flow test",
    objective:"Test the login",
    preconditions:[],
    linkedACs:[],
    // Quality 🔴: R1 fires on most steps (handle/manage/perform not in ACTION_VERBS),
    // R2 fires on all (vague expected results), TC-A/E/F all penalty.
    // Readiness 🟢: all are basic browser interactions, no R5/R12/R13/R14/R15 triggers.
    steps:[
      {stepNumber:1,action:"Process the user login with valid credentials",expectedResult:"Works correctly"},
      {stepNumber:2,action:"Handle navigation to the main dashboard",expectedResult:"Dashboard looks fine"},
      {stepNumber:3,action:"Manage the user profile settings interaction",expectedResult:"Everything is fine"},
      {stepNumber:4,action:"Perform verification of the profile update",expectedResult:""},
    ],
  },
  "QS🟡 ARS🟡 — Mixed Issues": {
    name:"Test case creation with attachment",
    objective:"Validates that a test case can be created with a file attachment",
    preconditions:["User is logged in as qa-lead@test.com","User is on /test-cases"],
    linkedACs:["EAC-5"],
    steps:[
      {stepNumber:1,action:"Click the '+ New Test Case' button",expectedResult:"'Create Test Case' modal opens"},
      {stepNumber:2,action:"Enter test case name and description and click Save",expectedResult:"Test case is saved and appears in the list"},
      {stepNumber:3,action:"Click the 'Attach File' button and upload the report",expectedResult:"File is uploaded and attachment count shows '1'"},
      {stepNumber:4,action:"Download the attached file to verify its contents",expectedResult:"PDF file is saved to desktop with correct data"},
      {stepNumber:5,action:"Verify the attachment icon is visible on the test case row",expectedResult:"Attachment icon appears on TC-105 row in the list"},
    ],
  },
  "QS🔴 ARS🔴 — Both Bad": {
    name:"Upload and process data",
    objective:"",
    preconditions:[],
    linkedACs:[],
    // Quality 🔴: R1 (handle), R4 (compound), R8 (selector), R11 (env URL), R2 everywhere
    // Readiness 🔴: R5 for otp + captcha (2/4 = 50% → TC-H cap fires)
    steps:[
      {stepNumber:1,action:"Navigate to http://staging.app.com/upload",expectedResult:"Upload page works"},
      {stepNumber:2,action:"Handle the file upload and enter the OTP from SMS to verify",expectedResult:"it works"},
      {stepNumber:3,action:"Solve the CAPTCHA verification challenge",expectedResult:"CAPTCHA is solved"},
      {stepNumber:4,action:"Click #submit-btn to confirm",expectedResult:"System processes correctly and looks good"},
    ],
  },
};

// ── UI Theme ────────────────────────────────────────────────────
const T = {
  primary:'#4318FF', pageBg:'#F8F9FC',
  ai:'#7C3AED', passed:'#22C55E', failed:'#EF4444', warning:'#F59E0B',
};

const Q_COLOR = { bg:'#EFF6FF', border:'#BFDBFE', text:'#1D4ED8', bar:'#3B82F6' };  // blue
const R_COLOR = { bg:'#F5F3FF', border:'#DDD6FE', text:'#6D28D9', bar:'#7C3AED' };  // purple

const BADGE_CFG = {
  '🟢': { bg:'#F0FDF4', border:'#BBF7D0', text:'#15803D', dot:'#22C55E' },
  '🟡': { bg:'#FFFBEB', border:'#FDE68A', text:'#B45309', dot:'#F59E0B' },
  '🔴': { bg:'#FEF2F2', border:'#FECACA', text:'#B91C1C', dot:'#EF4444' },
};

const SEV_CFG = {
  critical:{ bg:'#FEF2F2', text:'#B91C1C', border:'#FECACA' },
  major:   { bg:'#FFF7ED', text:'#C2410C', border:'#FED7AA' },
  minor:   { bg:'#FFFBEB', text:'#B45309', border:'#FDE68A' },
  info:    { bg:'#EFF6FF', text:'#1D4ED8', border:'#BFDBFE' },
};

// ── Sub-components ───────────────────────────────────────────────

function ScoreCard({ label, score, badge, sublabel, theme, formula }) {
  const cfg = BADGE_CFG[badge];
  return (
    <div style={{ flex:1, background:theme.bg, border:`1px solid ${theme.border}`, borderRadius:10, padding:16 }}>
      <div style={{ fontSize:11, fontWeight:600, color:theme.text, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>{label}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:6 }}>
        <span style={{ fontSize:36, fontWeight:700, color:theme.text, lineHeight:1 }}>{score}</span>
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          <span style={{ fontSize:18 }}>{badge}</span>
          <span style={{ fontSize:11, fontWeight:600, color:cfg.text }}>{sublabel}</span>
        </div>
      </div>
      <div style={{ height:6, background:'rgba(0,0,0,0.08)', borderRadius:3, marginBottom:8 }}>
        <div style={{ height:6, borderRadius:3, width:`${score}%`, background:theme.bar, transition:'width 0.4s ease' }} />
      </div>
      <div style={{ fontSize:10, color:theme.text, opacity:0.7 }}>{formula}</div>
    </div>
  );
}

function StepRow({ step, ss, idx }) {
  const [open, setOpen] = useState(false);
  const qIssues = ss.qualityDeductions;
  const rIssues = ss.readinessDeductions;
  const hasQIssues = qIssues.length > 0;
  const hasRIssues = rIssues.length > 0;
  const qColor = ss.qualityScore >= 80 ? '#22C55E' : ss.qualityScore >= 50 ? '#F59E0B' : '#EF4444';
  const rColor = ss.isManual ? '#6B7280' : ss.readinessScore >= 80 ? '#22C55E' : ss.readinessScore >= 50 ? '#F59E0B' : '#EF4444';

  const rowBg = idx % 2 === 0 ? '#fff' : '#F9FAFB';

  return (
    <div style={{ borderBottom:'1px solid #F3F4F6' }}>
      <div
        style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:rowBg, cursor:'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ width:24, textAlign:'center', fontSize:11, fontWeight:600, color:'#9CA3AF', flexShrink:0 }}>
          {step.stepNumber}
        </span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, color:'#374151', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontFamily:'monospace' }}>
            {step.action || <span style={{ color:'#EF4444', fontStyle:'italic' }}>No action</span>}
          </div>
          {step.expectedResult && (
            <div style={{ fontSize:11, color:'#9CA3AF', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              → {step.expectedResult}
            </div>
          )}
        </div>

        {/* Quality indicator */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, flexShrink:0 }}>
          <div style={{ width:34, height:5, borderRadius:3, background:'#E5E7EB' }}>
            <div style={{ height:5, borderRadius:3, width:`${ss.qualityScore}%`, background:qColor }} />
          </div>
          <span style={{ fontSize:10, color:qColor, fontWeight:600 }}>{ss.qualityScore}</span>
        </div>

        {/* Readiness indicator */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, flexShrink:0 }}>
          {ss.isManual ? (
            <span style={{ fontSize:10, background:'#EDE9FE', color:'#6D28D9', padding:'1px 5px', borderRadius:4, fontWeight:600 }}>MANUAL</span>
          ) : (
            <>
              <div style={{ width:34, height:5, borderRadius:3, background:'#E5E7EB' }}>
                <div style={{ height:5, borderRadius:3, width:`${ss.readinessScore}%`, background:rColor }} />
              </div>
              <span style={{ fontSize:10, color:rColor, fontWeight:600 }}>{ss.readinessScore}</span>
            </>
          )}
        </div>

        {/* Issue tags */}
        <div style={{ display:'flex', gap:3, flexShrink:0 }}>
          {hasQIssues && <span style={{ fontSize:10, background:'#DBEAFE', color:'#1D4ED8', padding:'1px 5px', borderRadius:4 }}>Q:{qIssues.map(d=>d.rule).join(',')}</span>}
          {hasRIssues && <span style={{ fontSize:10, background:'#EDE9FE', color:'#6D28D9', padding:'1px 5px', borderRadius:4 }}>R:{rIssues.map(d=>d.rule).join(',')}</span>}
        </div>
        <span style={{ fontSize:11, color:'#9CA3AF', flexShrink:0 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (hasQIssues || hasRIssues) && (
        <div style={{ background:'#FAFAFA', padding:'8px 12px 8px 46px', display:'flex', gap:12, flexWrap:'wrap' }}>
          {hasQIssues && (
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:10, fontWeight:700, color:Q_COLOR.text, marginBottom:6, textTransform:'uppercase' }}>Quality Issues</div>
              {qIssues.map(d => (
                <div key={d.rule} style={{ marginBottom:6 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:Q_COLOR.text }}>{d.rule} ({d.pts})</span>
                  <span style={{ fontSize:10, color:'#374151' }}> — {d.label}</span>
                  <div style={{ fontSize:10, color:'#6B7280', marginTop:2 }}>💡 {d.fix}</div>
                </div>
              ))}
            </div>
          )}
          {hasRIssues && (
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:10, fontWeight:700, color:R_COLOR.text, marginBottom:6, textTransform:'uppercase' }}>Readiness Issues</div>
              {rIssues.map(d => (
                <div key={d.rule} style={{ marginBottom:6 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:R_COLOR.text }}>{d.rule} ({d.pts})</span>
                  <span style={{ fontSize:10, color:'#374151' }}> — {d.label}</span>
                  {d.detail && <span style={{ fontSize:10, color:'#9CA3AF' }}> · "{d.detail}"</span>}
                  <div style={{ fontSize:10, color:'#6B7280', marginTop:2 }}>💡 {d.fix}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IssueList({ issues, theme, emptyMsg }) {
  const scored   = issues.filter(i => i.pts < 0);
  const advisory = issues.filter(i => i.pts === 0);
  const isEmpty  = scored.length === 0 && advisory.length === 0;
  if (isEmpty) return (
    <div style={{ padding:'16px 12px', textAlign:'center', color:'#9CA3AF', fontSize:12 }}>✓ {emptyMsg}</div>
  );
  return (
    <div>
      {scored.length === 0 && (
        <div style={{ padding:'10px 12px', color:'#6B7280', fontSize:12, borderBottom:'1px solid #F3F4F6' }}>✓ No scoring deductions — see advisories below.</div>
      )}
      {scored.map((issue, i) => {
        const sev = issue.sev || 'minor';
        const s = SEV_CFG[sev] || SEV_CFG.info;
        return (
          <div key={i} style={{ display:'flex', gap:10, padding:'8px 12px', borderBottom:'1px solid #F3F4F6', alignItems:'flex-start' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:3, flexShrink:0 }}>
              <span style={{ fontSize:10, fontWeight:700, fontFamily:'monospace', color:theme.text }}>{issue.rule}</span>
              <span style={{ fontSize:9, background:s.bg, color:s.text, border:`1px solid ${s.border}`, padding:'1px 4px', borderRadius:4, fontWeight:600, textTransform:'uppercase' }}>{sev}</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:500, color:'#374151', marginBottom:2 }}>{issue.label}
                <span style={{ fontSize:11, color:'#9CA3AF', fontWeight:400 }}> ({issue.pts})</span>
              </div>
              <div style={{ fontSize:11, color:'#6B7280' }}>💡 {issue.fix}</div>
            </div>
          </div>
        );
      })}
      {advisory.length > 0 && (
        <div style={{ padding:'6px 12px', borderTop:'1px solid #F3F4F6' }}>
          <div style={{ fontSize:10, color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>Advisories</div>
          {advisory.map((issue, i) => (
            <div key={i} style={{ fontSize:11, color:'#6B7280', padding:'3px 0' }}>
              <span style={{ fontWeight:600, color:theme.text, fontFamily:'monospace' }}>{issue.rule}</span> — {issue.label} · {issue.fix}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PreExecRecommendation({ quality, readiness }) {
  const qs = quality.score;
  const rs = readiness.score;
  let icon, msg, detail, color;
  if (readiness.tcHCapped) {
    icon = '🚫'; color = '#B91C1C';
    msg = 'Blocked — restructure before AI execution';
    detail = `${readiness.blockedRatio}% of steps cannot be executed by the Runner.`;
  } else if (rs >= 80 && qs >= 50) {
    icon = '✅'; color = '#15803D';
    msg = 'Proceed — Runner Ready';
    detail = 'All steps are executable. Expected results are specific and DOM-observable.';
  } else if (rs >= 80 && qs < 50) {
    icon = '⚠️'; color = '#B45309';
    msg = 'Proceed with caution — results may be unreliable';
    detail = 'Runner can execute but expected results are vague. Step verdicts will be low-confidence.';
  } else if (rs >= 50) {
    icon = '⚠️'; color = '#B45309';
    msg = 'Runner will attempt with human review';
    detail = `${readiness.executableCount}/${readiness.executableCount + readiness.blockedRatio} steps executable. Some steps may be skipped or flagged.`;
  } else {
    icon = '🔴'; color = '#B91C1C';
    msg = 'Not recommended — too many blockers';
    detail = 'Fix critical Readiness issues before running with AI.';
  }
  return (
    <div style={{ display:'flex', gap:10, padding:'10px 14px', background:'#FAFAFA', border:'1px solid #E5E7EB', borderRadius:8, alignItems:'flex-start' }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <div>
        <div style={{ fontSize:12, fontWeight:600, color }}>{msg}</div>
        <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>{detail}</div>
      </div>
    </div>
  );
}

// ── Markdown Parser ─────────────────────────────────────────────
function parseMarkdownTable(raw) {
  const lines = raw.trim().split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  if (lines.length < 3) return null;
  const header = lines[0].split('|').map(c => c.trim().toLowerCase()).filter(Boolean);
  const actionIdx   = header.findIndex(h => h.includes('action') || h.includes('step action') || h.includes('description'));
  const expectedIdx = header.findIndex(h => h.includes('expected') || h.includes('outcome'));
  const dataIdx     = header.findIndex(h => h.includes('test data') || h.includes('data'));
  if (actionIdx === -1) return null;
  const steps = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i].split('|').map(c => c.trim()).filter((_, j, a) => j > 0 && j < a.length - 1);
    if (!cells[actionIdx]) continue;
    steps.push({
      stepNumber: steps.length + 1,
      action: cells[actionIdx] || '',
      expectedResult: expectedIdx >= 0 ? cells[expectedIdx] || '' : '',
      testData: dataIdx >= 0 ? cells[dataIdx] || null : null,
    });
  }
  return steps.length > 0 ? { name:'Parsed from Markdown', objective:'', preconditions:[], linkedACs:[], steps } : null;
}

function parseInput(raw) {
  const trimmed = raw.trim();
  if (trimmed.includes('|')) {
    const md = parseMarkdownTable(trimmed);
    if (md) return { tc: md, format:'markdown' };
  }
  try {
    const parsed = JSON.parse(trimmed);
    const tc = Array.isArray(parsed) ? { name:'Parsed TC', objective:'', preconditions:[], linkedACs:[], steps:parsed } : parsed;
    return { tc, format:'json' };
  } catch { return null; }
}

// ── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [input, setInput]     = useState(JSON.stringify(EXAMPLES["QS🟢 ARS🟢 — Clean Login"], null, 2));
  const [result, setResult]   = useState(null);
  const [tc, setTc]           = useState(null);
  const [error, setError]     = useState('');
  const [activeTab, setActiveTab] = useState('quality');
  const [activeEx, setActiveEx]   = useState("QS🟢 ARS🟢 — Clean Login");

  const handleScore = useCallback(() => {
    const parsed = parseInput(input);
    if (!parsed) { setError('Invalid input — paste JSON or a Markdown table with an Action column'); return; }
    setError('');
    setTc(parsed.tc);
    setResult(scoreTestCase(parsed.tc));
  }, [input]);

  const loadExample = (key) => {
    setActiveEx(key);
    setInput(JSON.stringify(EXAMPLES[key], null, 2));
    const r = scoreTestCase(EXAMPLES[key]);
    setTc(EXAMPLES[key]);
    setResult(r);
  };

  // Score on mount with default example
  useEffect(() => { handleScore(); }, []);

  const exKeys = Object.keys(EXAMPLES);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:T.pageBg, fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', overflow:'hidden' }}>

      {/* Simple header bar */}
      <div style={{ padding:'10px 16px', background:'#fff', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <span style={{ fontSize:14, fontWeight:600, color:'#111827' }}>TC Quality Scorer</span>
          <span style={{ fontSize:12, color:'#6B7280', marginLeft:10 }}>
            <span style={{ color:Q_COLOR.text, fontWeight:500 }}>Quality</span> (authoring) ·{' '}
            <span style={{ color:R_COLOR.text, fontWeight:500 }}>AI Readiness</span> (Runner execution)
          </span>
        </div>
        <span style={{ fontSize:10, color:'#9CA3AF', fontFamily:'monospace', background:'#F3F4F6', padding:'3px 8px', borderRadius:4 }}>v5.1 · spec-driven · no LLM</span>
      </div>

      {/* Main layout */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>

        {/* ── LEFT: Input panel ─────────────────────────── */}
        <div style={{ width:320, flexShrink:0, display:'flex', flexDirection:'column', borderRight:'1px solid #E5E7EB', background:'#fff', overflow:'hidden' }}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid #F3F4F6' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Examples</div>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {exKeys.map(k => {
                const isActive = activeEx === k;
                return (
                  <button key={k} onClick={() => loadExample(k)} style={{
                    padding:'5px 9px', borderRadius:5, border:'1px solid', cursor:'pointer', textAlign:'left', fontSize:11, fontWeight: isActive ? 600 : 400,
                    background: isActive ? '#EFF6FF' : '#F9FAFB',
                    borderColor: isActive ? '#BFDBFE' : '#E5E7EB',
                    color: isActive ? '#1D4ED8' : '#374151',
                  }}>{k}</button>
                );
              })}
            </div>
          </div>

          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'12px 14px', overflow:'hidden' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>
              Input <span style={{ fontSize:10, color:'#9CA3AF', fontWeight:400, textTransform:'none' }}>— JSON or Markdown table</span>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste test case JSON or Markdown table..."
              style={{ flex:1, border:'1px solid #D1D5DB', borderRadius:6, padding:10, fontSize:11, fontFamily:'monospace', resize:'none', color:'#374151', lineHeight:1.5, outline:'none', minHeight:0 }}
            />
            {error && <div style={{ fontSize:11, color:'#DC2626', marginTop:6, padding:'6px 8px', background:'#FEF2F2', borderRadius:4 }}>{error}</div>}
            <button onClick={handleScore} style={{
              marginTop:10, padding:'8px 0', borderRadius:6, border:'none', cursor:'pointer',
              background:T.primary, color:'#fff', fontSize:13, fontWeight:600,
            }}>Score Test Case</button>
          </div>
        </div>

          {/* ── RIGHT: Results ────────────────────────────── */}
          <div style={{ flex:1, overflow:'auto', padding:16, minWidth:0 }}>
            {!result ? (
              <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:13 }}>
                Select an example or paste a test case and click "Score Test Case"
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

                {/* TC name header */}
                {tc && (
                  <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, padding:'10px 14px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{tc.name || 'Unnamed Test Case'}</div>
                    {tc.objective && <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>{tc.objective}</div>}
                  </div>
                )}

                {/* ── Dual score cards ── */}
                <div style={{ display:'flex', gap:10 }}>
                  <ScoreCard
                    label="Quality Score"
                    score={result.quality.score}
                    badge={result.quality.badge}
                    sublabel={result.quality.label}
                    theme={Q_COLOR}
                    formula={`Blend: (avg ${result.quality.avg} × 0.6) + (min ${result.quality.min} × 0.4) = ${result.quality.blended} − ${result.quality.qPenalty} TC penalty`}
                  />
                  <ScoreCard
                    label="AI Readiness"
                    score={result.readiness.score}
                    badge={result.readiness.badge}
                    sublabel={result.readiness.label}
                    theme={R_COLOR}
                    formula={`Blend: (avg ${result.readiness.avg} × 0.5) + (min ${result.readiness.min} × 0.5) = ${result.readiness.blended}${result.readiness.tcHCapped ? ' → CAPPED at 20' : ` − ${result.readiness.rPenalty} TC penalty`}`}
                  />
                </div>

                {/* Pre-execution recommendation */}
                <PreExecRecommendation quality={result.quality} readiness={result.readiness} />

                {/* Stat row */}
                <div style={{ display:'flex', gap:8 }}>
                  {[
                    { label:'Steps', val:result.totalSteps, dim:'quality' },
                    { label:'Executable', val:result.readiness.executableCount, dim:'readiness' },
                    { label:'Blocked %', val:`${result.readiness.blockedRatio}%`, dim:'readiness', warn: result.readiness.blockedRatio > 40 },
                    { label:'Verification', val: result.stepScores.filter(ss => stepHasVerificationContext(tc?.steps?.[result.stepScores.indexOf(ss)] || {})).length + '/' + result.totalSteps, dim:'quality' },
                  ].map(stat => (
                    <div key={stat.label} style={{ flex:1, background:'#fff', border:`1px solid ${stat.warn ? '#FECACA' : '#E5E7EB'}`, borderRadius:7, padding:'8px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:16, fontWeight:700, color: stat.warn ? '#B91C1C' : stat.dim === 'quality' ? Q_COLOR.text : R_COLOR.text }}>{stat.val}</div>
                      <div style={{ fontSize:10, color:'#9CA3AF', fontWeight:500, textTransform:'uppercase' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Step breakdown */}
                <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, overflow:'hidden' }}>
                  <div style={{ padding:'8px 12px', borderBottom:'1px solid #F3F4F6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#374151' }}>Step Breakdown</span>
                    <div style={{ display:'flex', gap:12, fontSize:11, color:'#6B7280' }}>
                      <span><span style={{ display:'inline-block', width:20, height:4, borderRadius:2, background:Q_COLOR.bar, verticalAlign:'middle', marginRight:4 }}></span>Quality</span>
                      <span><span style={{ display:'inline-block', width:20, height:4, borderRadius:2, background:R_COLOR.bar, verticalAlign:'middle', marginRight:4 }}></span>Readiness</span>
                    </div>
                  </div>
                  <div style={{ padding:'4px 12px 4px', display:'flex', justifyContent:'flex-end', gap:20, fontSize:10, color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', borderBottom:'1px solid #F3F4F6' }}>
                    <span style={{ width:70, textAlign:'center' }}>QUALITY</span>
                    <span style={{ width:70, textAlign:'center' }}>READINESS</span>
                    <span style={{ width:80, textAlign:'center' }}>RULES</span>
                    <span style={{ width:16 }}></span>
                  </div>
                  {tc?.steps?.map((step, i) => (
                    <StepRow key={i} step={step} ss={result.stepScores[i]} idx={i} />
                  ))}
                </div>

                {/* Issues tabs */}
                <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, overflow:'hidden' }}>
                  <div style={{ display:'flex', borderBottom:'1px solid #E5E7EB' }}>
                    {[
                      { id:'quality',   label:`Quality Issues (${result.quality.issues.filter(i=>i.pts<0).length})`,   color: Q_COLOR.text, border: Q_COLOR.bar },
                      { id:'readiness', label:`Runner Issues (${result.readiness.issues.filter(i=>i.pts<0).length})`, color: R_COLOR.text, border: R_COLOR.bar },
                    ].map(tab => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        flex:1, padding:'9px 12px', border:'none', cursor:'pointer', fontSize:12, fontWeight: activeTab === tab.id ? 600 : 400,
                        background: activeTab === tab.id ? '#FAFAFA' : '#fff',
                        color: activeTab === tab.id ? tab.color : '#6B7280',
                        borderBottom: activeTab === tab.id ? `2px solid ${tab.border}` : '2px solid transparent',
                      }}>{tab.label}</button>
                    ))}
                  </div>
                  {activeTab === 'quality' && (
                    <IssueList issues={result.quality.issues} theme={Q_COLOR} emptyMsg="No quality issues — well-authored!" />
                  )}
                  {activeTab === 'readiness' && (
                    <IssueList issues={result.readiness.issues} theme={R_COLOR} emptyMsg="No readiness issues — Runner ready!" />
                  )}
                </div>

                {/* Step-level quality/readiness breakdown — full deductions */}
                <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, overflow:'hidden' }}>
                  <div style={{ padding:'8px 12px', borderBottom:'1px solid #F3F4F6' }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#374151' }}>All Step Findings</span>
                    <span style={{ fontSize:11, color:'#9CA3AF', marginLeft:8 }}>click a step row above to expand details</span>
                  </div>
                  <div style={{ padding:'8px 12px', display:'flex', flexWrap:'wrap', gap:6 }}>
                    {result.stepScores.flatMap((ss, i) => [
                      ...ss.qualityDeductions.map(d => ({ ...d, step:i+1, dim:'Q' })),
                      ...ss.readinessDeductions.map(d => ({ ...d, step:i+1, dim:'R' })),
                    ]).map((d, i) => (
                      <span key={i} style={{
                        fontSize:10, padding:'2px 7px', borderRadius:4, fontFamily:'monospace', fontWeight:600,
                        background: d.dim === 'Q' ? '#DBEAFE' : '#EDE9FE',
                        color:      d.dim === 'Q' ? '#1D4ED8' : '#6D28D9',
                      }}>
                        S{d.step}·{d.rule}({d.pts})
                      </span>
                    ))}
                    {result.stepScores.every(ss => ss.qualityDeductions.length === 0 && ss.readinessDeductions.length === 0) && (
                      <span style={{ fontSize:11, color:'#9CA3AF' }}>No step-level issues found.</span>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
    </div>
  );
}
