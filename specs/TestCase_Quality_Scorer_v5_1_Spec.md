# Test Case Quality Scorer — Specification v5.1

**Version:** v5.1 · **Owner:** Hà Nguyễn · **March 2026**
**Supersedes:** v5.0 (single composite score), v4.3 (Runner compatibility integration)

---

## Design Philosophy

This scorer is a **deterministic pre-assessment gate** — not a semantic quality arbiter. It catches structural failures fast, at zero cost, with full transparency into why a score was given. It does not replace human judgment or LLM enrichment; it removes tests that will obviously fail from reaching the AI Runner or the human reviewer queue.

**What the 🟢 badge means:** "No known structural issues detected." Not "excellent quality."
**What the 🔴 badge means:** "Structural failures found — execution results will be unreliable."

The vocabulary lists will grow over time as real test cases expose gaps. That is expected and healthy. The architecture (pattern-based + vocabulary-based) is designed to accept additions without refactoring.

---

## Why Two Scores

A single composite score conflates two distinct questions with two distinct fix paths:

| Question | Score | Fix when failing |
|---|---|---|
| Is this test well-authored? | Quality Score (QS) | Rewrite the step — better verbs, specific expected results, explicit data |
| Can the AI Runner execute this? | AI Readiness Score (ARS) | Add `[MANUAL]` tag, restructure, or wait for Runner capability expansion |

**The divergence cases the composite hid:**

A well-authored 2FA test (every step specific, preconditions set, objective clear) scores QS 🟢 / ARS 🔴 — the author did everything right; the Runner just can't reach SMS. A poorly authored test with all CDP-compatible actions scores QS 🔴 / ARS 🟢 — the Runner will execute it, but "it works" as an expected result means the verdict is meaningless.

Both cases require a different response. Merging them into one score hides which problem you actually have.

---

## Score 1: Quality Score (QS)

**Question:** "Is this test case well-authored?"
**Audience:** Test authors during authoring, QA leads during post-generation review
**Surfaces:** TC authoring page inline feedback, post-generation review panel, TC list badge

A well-authored test has:
- Every step starting with a recognized action verb
- Every step with a specific, observable expected result (not a generic affirmation)
- Atomic steps — one action per step
- Explicit test data values, not implicit references
- A clear objective and preconditions

QS is **independent of Runner support**. A perfectly authored test with an OTP step should score QS 🟢. The Runner limitation is an ARS concern, not an authoring concern.

**Badges:**
- 🟢 ≥ 80 — Well-Authored
- 🟡 50–79 — Needs Work
- 🔴 < 50 — Poor Quality

---

## Score 2: AI Readiness Score (ARS)

**Question:** "Can the Autonomous Test Runner (CDP browser agent) execute this right now?"
**Audience:** Manual testers and QA leads before running with AI
**Surfaces:** Pre-execution modal, step-level confidence during run, post-run retrospective

A Runner-ready test has:
- Every step mapping to a CDP-executable action, or explicitly `[MANUAL]` tagged
- Expected results that are DOM-observable — not aesthetic judgments, not external system state
- Fewer than 40% of steps blocked/manual (below TC-H threshold)

ARS is **independent of authoring quality**. A vague test with all CDP-compatible actions can score ARS 🟢 even with QS 🔴.

**Badges:**
- 🟢 ≥ 80 — Runner Ready
- 🟡 50–79 — Will Attempt (some steps may need human review)
- 🔴 < 50 — Blocked

---

## Scoring Formulas

### Quality Score

```
Phase 1 — Step quality scores (per step):
  stepQS = max(0, 100 + sum of quality deductions [R1,R2,R3,R4,R6,R7,R8,R9,R10,R11])

Phase 1 blend:
  QS_blended = (avg(stepQS) × 0.6) + (min(stepQS) × 0.4)
  Avg-weighted because overall pattern matters.
  Min-weighted to catch at least one catastrophically bad step.

Phase 2 — TC-level penalties:
  QS_penalty = sum of [TC-A, TC-C, TC-D(>15), TC-E, TC-F] that fire

Final:
  QS = max(0, round(QS_blended) − QS_penalty)
```

### AI Readiness Score

```
Phase 1 — Step readiness scores (per step):
  [MANUAL] tagged → readinessScore = 0  (Runner must skip; counts toward block ratio)
  All other steps → readinessScore = max(0, 100 + sum of readiness deductions [R5,R12,R13,R14,R15])

Phase 1 blend — heavier min-weighting than QS:
  ARS_blended = (avg(stepARS) × 0.5) + (min(stepARS) × 0.5)
  Rationale: one fully-blocked step (R5 → score 50) has outsized impact on
  execution viability. 50/50 weighting ensures this isn't averaged away.

Phase 2 — TC-level adjustments:
  ARS_penalty = sum of [TC-D(>10), TC-I] that fire

Pre-cap:
  ARS_raw = max(0, round(ARS_blended) − ARS_penalty)

TC-H cap (applied last, overrides everything):
  blocked = count of steps with R5 + count with R12 + count of [MANUAL] steps
  blockedRatio = blocked / totalSteps
  IF blockedRatio > 0.40 → ARS = min(ARS_raw, 20)   ← score capped regardless of step quality
  ELSE                   → ARS = ARS_raw
```

### Pre-Execution Combined Recommendation

Driven by ARS; QS modulates the confidence label.

| ARS | QS | Recommendation |
|---|---|---|
| ≥ 80 | ≥ 50 | ✅ Proceed — Runner Ready |
| ≥ 80 | < 50 | ⚠️ Proceed with caution — vague expected results, Runner verdicts low-confidence |
| 50–79 | any | ⚠️ Runner will attempt — some steps may need human review |
| < 50 | any | ❌ Not recommended — too many blockers |
| TC-H fired | any | 🚫 Blocked — restructure test before AI execution |

---

## The Four Quadrants

| | QS 🟢 | QS 🔴 |
|---|---|---|
| **ARS 🟢** | ✅ Ideal — proceed | ⚠️ Runner executes; verdicts unreliable — fix expected results |
| **ARS 🔴** | ⚠️ Well-written; architecturally blocked — `[MANUAL]` tag or restructure | ❌ Both problems — fix authoring first |

---

## Input Schema

```json
{
  "name": "Verify [what] [when]",
  "objective": "Validates that [behavior] when [condition]",
  "preconditions": ["string"],
  "linkedACs": ["EAC-1"],
  "steps": [
    {
      "stepNumber": 1,
      "action": "Click the 'Submit' button",
      "expectedResult": "'Success' toast appears at top of page",
      "testData": null
    }
  ]
}
```

Also accepts Markdown tables with `Action` and `Expected Result` columns.

### [MANUAL] Prefix

Prefixing a step action with `[MANUAL]` signals that a human will perform this step. Effects:
- Exempt from all R1–R15 penalties (quality and readiness rules skip the step)
- Step readiness score = 0 (fully blocked for AI purposes)
- **Still counts toward TC-H blocked ratio** — the Runner must pause/skip it regardless of why

---

## Output Schema

```typescript
scoreTestCase(tc) → {
  quality: {
    score: number,         // 0–100
    badge: '🟢'|'🟡'|'🔴',
    label: string,         // 'Well-Authored' | 'Needs Work' | 'Poor Quality'
    blended: number,       // phase 1 blend (pre-penalty)
    avg: number,           // average step quality score
    min: number,           // minimum step quality score
    qPenalty: number,      // total TC-level quality penalty applied
    issues: Issue[],       // TC-level quality gates that fired (including advisories)
    tcEFired: boolean,     // TC-E fired (no verification context)
  },
  readiness: {
    score: number,         // 0–100 (may be capped at 20 by TC-H)
    badge: '🟢'|'🟡'|'🔴',
    label: string,         // 'Runner Ready' | 'Will Attempt' | 'Blocked'
    blended: number,
    avg: number,
    min: number,
    rPenalty: number,
    issues: Issue[],       // TC-level readiness issues + aggregated step-level R5/R12–R15
    tcHCapped: boolean,    // TC-H score cap fired
    blockedRatio: number,  // % of steps blocked (0–100)
    executableCount: number,
  },
  stepScores: StepScore[],
  totalSteps: number,
}

StepScore {
  qualityScore: number,           // 0–100
  readinessScore: number,         // 0–100 (0 if [MANUAL])
  qualityDeductions: Deduction[],
  readinessDeductions: Deduction[],
  isManual: boolean,
}
```

---

## Vocabulary Reference

### Recognized Action Verbs (R1 does NOT fire if action starts with these)

```
Navigation:  navigate, open, go to, go back, refresh
Interaction: click, tap, press, enter, type, input, fill, clear, paste
             select, choose, check, uncheck, toggle
             hover, scroll, wait, search, submit, upload, expand, collapse
             download, export, save as, drag
Verification: verify, confirm, assert, validate, ensure, check that
```

Note: `download`, `export`, `save as`, `drag` are quality-valid action verbs. Readiness rules (R12, R13) flag them separately for Runner capability concerns.

### Ambiguous Action Verbs (R3)

```
handle, process, manage, deal with, interact with, use, access, perform,
do, execute, run, test, check the, review, look at, see, make sure
```

### Vague Expected Result Detection (R2, TC-E)

Three-layer detection — any match triggers the flag:

**Exact match list:**
```
it works, works correctly, is correct, looks good, is displayed, page loads,
no issues, everything is fine, as expected, success, done, ok, passed,
it works fine, works fine, loads fine, it loaded, it opened, it closed
```

**Suffix match list** (expected result *ends with* these):
```
looks good, works correctly, is correct, no issues, everything is fine, works fine
```

**Pattern match** (generic affirmations):
```
^it (works|loads|uploads|opens|shows|runs|saves|sends|submits|...)
^everything (works|is fine|is ok|looks good|...)
^(page|screen|form|modal|dialog|view) is (ok|fine|good|correct|...)
^(works|loads|submits|saves|...) [end of string]
^(is ok|is fine|is correct|...) [end of string]
^(test)? (passes|passed|works|succeeds|succeeded) [end of string]
```

### Implicit Test Data Signals (R6)

```
the user's, their email, their password, a valid, an invalid, the correct,
some data, some file, the file, appropriate
```

### Unsupported Runner Actions (R5)

```
Multi-tab:    switch tab, switch window, new tab, new window, open in new tab,
              pop-up window, popup window
Auth (ext):   solve captcha, complete captcha, enter captcha
              otp, one-time password, enter the otp, enter otp
              sms code, verification code from sms, code from sms
              two-factor, 2fa code, mfa code, authenticator app
              biometric, fingerprint, face id, touch id
              email verification link, click the link in the email, verify email
              phone call verification
Canvas draw:  draw on canvas, paint on canvas, sketch on canvas
```

### Partial Support Actions (R12)

```
download, export to, export as, save as, export file
```
Runner can click the trigger; cannot verify file content, name, or download completion.

### Fragile Actions (R13)

```
Double-click: double-click, double click, dbl-click, dbl click
Right-click:  right-click, right click, context menu, long press
Keyboard:     keyboard shortcut, press ctrl, press alt, press cmd, ctrl+, alt+, cmd+
DOM edge:     inside iframe, within iframe, in the iframe, shadow dom, shadow root
Canvas:       on the svg, on the chart, on the canvas, on the map, in the webgl
Drag:         drag and drop, drag-and-drop, drag [space]
```
CDP can execute these; reliability is lower than primary interactions.

### Visual Judgment Patterns (R14)

```
looks good/correct/right/normal/ok/fine/nice/proper/professional/clean/modern
aligned/centered/spaced/sized/proportioned correctly/properly/well/nicely
visually appealing/consistent/correct/acceptable
UI is/looks/appears correct/proper/good/fine
matches the design/mockup/figma/wireframe/prototype
layout is/looks/appears correct/proper/good/as expected
```

### External State Patterns (R15)

```
email is/was sent/received/delivered/arrives
SMS/text message/push notification is sent/received/arrives
notification is sent/delivered/pushed
file is downloaded/saved/created/exists on/to disk/desktop/local/folder
database/db is updated/changed/reflects/contains/stores
record is saved/created/deleted/updated in the database
API/endpoint/server returns/responds with/sends
backend processes/handles/stores
```

---

## Scope Limits and Known Gaps

The deterministic scorer catches structural patterns. It will miss:

| Gap | Example | Correct handling |
|---|---|---|
| Semantically vague but structurally valid | "Click the button" (which button?) | Human review / LLM enrichment pass |
| Context-dependent meaning | "Check the email" (UI action or inbox check?) | Human review |
| Logic gaps in step sequence | Skips a required setup action | Human review |
| Novel vague patterns not yet enumerated | New affirmation phrasing | Add to VAGUE_PATTERNS |

As early Runner execution data becomes available (post-April), failed test cases should be reviewed against the rule set to identify new patterns worth adding. The vocabulary lists are designed to be additive without architectural change.

---

## UI Surface Mapping

| Surface | Scores shown | Why |
|---|---|---|
| TC authoring (inline sidebar) | QS only | Author cannot change CDP compatibility mid-write |
| Post-generation review | QS primary, ARS secondary | Assess generator output quality |
| TC list view badge | QS badge (composite on hover) | Library health at a glance |
| Pre-execution modal | ARS primary, QS secondary | Execution gate decision |
| Step confidence (during run) | ARS step-level | What the Runner is confident about |
| Post-run retrospective | Both side-by-side | Full analysis |

For list views where only one badge fits: show `min(QS, ARS)` as the composite. Always expose both individual scores on expand/hover.

---

## Version History

| Version | Change |
|---|---|
| v4.1 | Initial 11-step rules, 7 TC gates, single composite score |
| v4.2 | TC-B → advisory (0 pts), TC-E two-path detection, R2→R9 cascade suppression, FATAL guard |
| v4.3 | Runner compatibility: R12–R15, TC-H score cap, TC-I, graduated TC-D, expanded UNSUPPORTED_ACTIONS vocab |
| v5.0 | **Separation**: Quality Score and AI Readiness Score as independent dimensions. Dual step scoring, dual TC gate sets, pre-execution combined recommendation. Breaking change to scoreTestCase() return shape. |
| v5.1 | VAGUE_PATTERNS (regex-based): catches "it uploads", "page is ok", "everything works fine" — previously slipped through exact/suffix whitelist. Applied to both R2 and TC-E hasMeaningful check. Added `download`, `export`, `save as`, `drag` to ACTION_VERBS (quality-valid; readiness still flags via R12/R13). Added `some file`, `the file` to IMPLICIT_DATA. |
