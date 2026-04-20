# TC Quality Scorer — Complete Rule Summary
**v5.1 · March 2026 · Dual-score: Quality Score (QS) + AI Readiness Score (ARS)**

---

## Score Interpretation

| Score | QS Label | ARS Label |
|---|---|---|
| ≥ 80 🟢 | Well-Authored | Runner Ready |
| 50–79 🟡 | Needs Work | Will Attempt |
| < 50 🔴 | Poor Quality | Blocked |

**🟢 means:** "No known structural issues detected" — not "guaranteed quality."

---

## Quality Rules — Step Level (R1–R11)

Applied to every step. Deductions reduce the step's quality score (0–100 base).
`[MANUAL]` prefix on a step **skips all quality rules** for that step.

| Rule | Name | Pts | Trigger | Fix |
|---|---|---|---|---|
| **R1** | No Action Verb | −25 | Step action doesn't start with a recognized verb | Start with: Click, Enter, Navigate, Verify, Select, Upload… |
| **R2** | No Expected Result | −30 | `expectedResult` empty or < 5 chars | Describe what should be visible: element text, URL, count, state |
| **R2** | Vague Expected Result | −20 | Expected result matches vague exact/suffix list or generic affirmation pattern | "Error message 'Invalid email' appears" not "it works" |
| **R3** | Ambiguous Action | −15 | Step starts with: handle, process, manage, interact with, perform, review, look at, make sure… | Use specific verbs: Click, Enter, Select, Verify |
| **R4** | Compound Step | −10 | Action contains: "and then", "then click", "then verify", ". then", ". verify"… | Split into one action per step |
| **R6** | Missing Test Data | −10 | Action references `{var}` with no testData, or uses: "a valid", "an invalid", "some file", "the user's"… | Replace with explicit values: `'test@example.com'`, `'Secure@123'` |
| **R7** | Step Too Long | −5 | Action text > 200 characters | Split or simplify — aim for one clear sentence |
| **R8** | Selector Reference | −15 | Action contains: `#id`, `.class.class`, `//xpath`, `data-testid`, `css selector`… | Use visible text: "Click the 'Submit' button" not `#submit-btn` |
| **R9** | Subjective Language | −15 | Expected result contains: intuitive, user-friendly, clean, fast, smooth, nice, proper… (suppressed if R2 already fired) | Replace with measurable: "loads in < 3s" not "loads fast" |
| **R10** | Action in Expected Result | −15 | Expected result starts with: click, navigate to, enter, type, fill, select, submit, upload… | Expected result = observable state, not the next action |
| **R11** | Hard-coded Env URL | −5 | Action contains: `localhost`, `127.0.0.1`, `staging.`, `prod.`, `:8080/`… | Use relative paths `/path` or `{baseUrl}` variable |

**Suppression rules:**
- R3 is skipped if R1 already fired (same step, same root cause)
- R9 is skipped if R2 already fired (expected result field already flagged)

---

## AI Readiness Rules — Step Level (R5, R12–R15)

Applied to every step **except** `[MANUAL]`-prefixed steps.
`[MANUAL]` steps get readiness score = 0 and count toward TC-H blocked ratio.

| Rule | Name | Pts | Trigger | Fix |
|---|---|---|---|---|
| **R5** | Unsupported Action | −50 | Action contains any unsupported Runner interaction (see list below) | Add `[MANUAL]` prefix, or restructure to avoid the interaction |
| **R12** | Partial Support | −25 | Action contains: download, export to, export as, save as, export file | Runner clicks trigger but can't verify file. Rewrite expected result as UI-observable: "'Download started' toast appears" |
| **R13** | Fragile Interaction | −15 | Action contains: double-click, right-click, context menu, drag and drop, keyboard shortcut, ctrl+, iframe, shadow dom, SVG/canvas/map interaction | Runner will attempt but reliability is lower. Add `[MANUAL]` if critical. |
| **R14** | Visual Judgment | −30 | Expected result matches visual appearance pattern (see list below) | Runner inspects DOM only. Replace with: element visibility, text content, count |
| **R15** | External State | −20 | Expected result references: email sent/received, SMS, file on disk, database, API response, backend state | Runner can't verify outside browser. Rewrite: "'Email sent' toast appears" |

**Suppression:** R12 and R13 are skipped if R5 already fired on the same step.

**R5 Unsupported Actions — Full List:**

| Category | Triggers |
|---|---|
| Multi-tab | switch tab, switch window, new tab, new window, open in new tab, pop-up window, popup window |
| External auth — OTP/2FA | otp, one-time password, enter the otp, enter otp, sms code, verification code from sms, code from sms, two-factor, 2fa code, mfa code, authenticator app |
| External auth — Biometric | biometric, fingerprint, face id, touch id |
| External auth — Email/Phone | email verification link, click the link in the email, verify email, phone call verification |
| CAPTCHA | solve captcha, complete captcha, enter captcha |
| Canvas drawing | draw on canvas, paint on canvas, sketch on canvas |

**R14 Visual Judgment Patterns:**
- `looks good/correct/right/normal/ok/fine/nice/proper/professional/clean/modern`
- `aligned/centered/spaced/sized/proportioned correctly/properly/well`
- `visually appealing/consistent/correct/acceptable`
- `UI is/looks/appears correct/proper/good/fine`
- `matches the design/mockup/figma/wireframe/prototype`
- `layout is/looks/appears correct/proper/good/as expected`

---

## Quality TC Gates — Test Case Level

Applied once per test case. Add to `QS_penalty`.

| Gate | Name | Pts | Severity | Trigger | Fix |
|---|---|---|---|---|---|
| **TC-A** | No Preconditions | −5 | minor | `preconditions` array is empty | Add login state, starting URL, required data setup |
| **TC-B** | No Linked ACs | 0 | info (advisory) | `linkedACs` array is empty | Link to EAC IDs when generated from a requirement |
| **TC-C** | Single Step Test | −5 | minor | Test has exactly 1 step | Add navigation, action, and verification steps |
| **TC-D** | Exceeds Step Limit | −5 | minor | > 15 steps | Split into shorter, focused test cases |
| **TC-E** | No Verification Context | −20 | critical | No step has a verify verb AND no step has a specific expected result (both checks fail) | Add "Verify [observable state]" steps, or add specific `expectedResult` to action steps |
| **TC-F** | Missing Objective | −3 | info | `objective` missing or < 5 words | Write: "Validates that [behavior] when [condition]" |
| **TC-G** | Naming Convention | 0 | info (advisory) | `name` does not start with "Verify " | Rename to: "Verify [what happens] [under what condition]" |

**TC-E detail:** A step passes the verification check if it has a verify verb (verify, confirm, check, assert, ensure, validate, observe) OR a meaningful expected result (> 10 chars, not in vague lists, not a generic affirmation pattern). TC-E fires only when zero steps pass either check.

---

## AI Readiness TC Gates — Test Case Level

Applied once per test case. Add to `ARS_penalty` or cap the score.

| Gate | Name | Effect | Severity | Trigger | Fix |
|---|---|---|---|---|---|
| **TC-D** | Long Test — Reliability Risk | −8 | info | > 10 steps | AI Runner reliability degrades before the 15-step limit. Consider splitting. |
| **TC-H** | Too Many Blocked Steps | **cap at 20** | major | > 40% of steps are blocked: (R5 steps + R12 steps + `[MANUAL]` steps) / total > 0.40 | Split into one AI-executable test + one manual test |
| **TC-I** | Majority Unverifiable Results | −20 | major | > 50% of steps with expected results trigger R14 or R15 | Runner will execute but produce meaningless verdicts. Rewrite expected results as DOM-observable assertions. |

**TC-H note:** The cap (max score = 20) is applied **after** all other penalties. It overrides the blended step score regardless of how well individual steps were written. The intent: a test that is structurally unusable for AI should not score in the 🟡 range — it should clearly signal 🔴.

**TC-D split:** The same step-count signal serves two thresholds for two reasons:
- Quality gate: > 15 steps = test is too long to maintain or debug (authoring concern)
- Readiness gate: > 10 steps = Runner reliability degrades meaningfully (execution concern)
Both can fire independently on their respective score.

---

## Scoring Formulas

### Quality Score

```
1. Per step:  stepQS = max(0, 100 + sum[R1,R2,R3,R4,R6,R7,R8,R9,R10,R11 deductions])
2. Blend:     QS_blended = avg(stepQS) × 0.6 + min(stepQS) × 0.4
3. Penalty:   QS_penalty = TC-A + TC-C + TC-D(>15) + TC-E + TC-F
4. Final:     QS = max(0, round(QS_blended) − QS_penalty)
```

### AI Readiness Score

```
1. Per step:  [MANUAL] → 0
              others  → stepARS = max(0, 100 + sum[R5,R12,R13,R14,R15 deductions])
2. Blend:     ARS_blended = avg(stepARS) × 0.5 + min(stepARS) × 0.5
              (heavier min-weight: one blocked step has outsized execution impact)
3. Penalty:   ARS_penalty = TC-D(>10) + TC-I
4. Raw:       ARS_raw = max(0, round(ARS_blended) − ARS_penalty)
5. TC-H cap:  blocked = R5_steps + R12_steps + MANUAL_steps
              IF blocked/total > 0.40 → ARS = min(ARS_raw, 20)
              ELSE                    → ARS = ARS_raw
```

---

## What This Scorer Cannot Catch

These gaps are expected and accepted. They require human review or a future LLM enrichment pass.

| Gap | Example that passes | Why it escapes |
|---|---|---|
| Element specificity missing | "Click the button" | Has a verb, no selector reference |
| Contextually ambiguous action | "Check the email" (UI field? or inbox?) | No way to infer intent without context |
| Step logic gaps | Missing a required setup step | Requires semantic understanding of sequence |
| Novel vague phrasing | "The behavior is correct" | Not yet in VAGUE_PATTERNS |
| Wrong feature tested | Correct steps, wrong screen | Requires product domain knowledge |

When a new false-negative is found in real usage, add its pattern to `VAGUE_PATTERNS`, `UNSUPPORTED_ACTIONS`, or the relevant vocabulary list. The architecture accepts additions without refactoring.

---

## Quick Reference: "Why Did This Score Low?"

| Symptom | Most likely rule | Check |
|---|---|---|
| Low QS, high ARS | R1, R2, R3 on most steps | Action verbs? Expected results specific? |
| High QS, low ARS | R5 on one+ steps | OTP, CAPTCHA, multi-tab, biometric in steps? |
| ARS capped at 20 | TC-H | > 40% of steps blocked or [MANUAL]? |
| QS drops by 20 | TC-E | Any step with a specific expected result? |
| Both scores low | R1+R2 on all steps, R5+TC-H | Combination of vague authoring + unsupported actions |
| QS 🟢 but feels wrong | Semantic gaps | Scorer only catches structural issues — review manually |
