# J1 Demo Feedback — Actionable Issue List

**Source:** Team demo feedback (Slack thread), March 2026
**Synthesized by:** Claude × Hà
**Status:** Ready for Monday discussion

---

## How to Read This

Each issue is tagged with:

- **Disposition:** ✅ Already addressed in specs | 🔧 Needs work | 🗓 Deferred | 💬 Discussion needed
- **Spec reference:** Where the existing decision lives (if applicable)
- **Action:** What specifically needs to happen next

---

## 1. UX & Interaction Model

### 1.1 — Document upload feels required / extraneous

**Feedback:** Document upload should be optional (team consensus). First step to upload + add context feels extraneous, especially for True Enterprise users with detailed tickets (Que Tran).

**Disposition:** ✅ Already addressed in design — but implementation diverged.

The Ambient AI Approach (Final) positions document upload as an optional Layer 2 action that *increases readiness score* but is never required. The Confluence team doc confirms: upload is P1, not P0. Generation should work without it.

**Spec ref:** `TestCaseGenerator_Ambient_AI_Approach_Final.md` — Layer 2 Inline Refinement; `TestGenerator_Agent_Scope_Requirements.md` — M6 (P1).

**Action:** Verify the current FE implementation doesn't gate the Generate button behind document upload. If it does, that's a bug against the spec. The April UX should be: click Generate → Kai opens with context → clarifications appear → user *can* upload docs to improve results, but doesn't have to.

---

### 1.2 — Extracted ACs and suggested ACs display is confusing

**Feedback:** The in-context display of extracted ACs alongside suggested ACs is confusing for users (Hà).

**Disposition:** 🔧 Needs UX clarification before next demo.

The spec distinguishes between *extracted ACs* (what the Analyzer finds in the ticket) and *AI-suggested ACs* (gap-fill proposals). These are different things with different trust levels, but the current UI apparently conflates them visually.

**Spec ref:** `Analyzer_Pipeline_J1_v4.2.md` — Call A produces `extractedACs[]`; Call B produces `clarifications[]` and `issues[]`. Suggested ACs aren't a first-class concept in the pipeline — they're closer to coverage gap signals.

**Action:**
1. Drop "Suggested AC" as a UI label. The pipeline doesn't produce suggested ACs — it produces *coverage gap signals* and *clarifications*.
2. Show extracted ACs clearly as "what we found in your requirement."
3. Show coverage gaps separately as "areas that may need additional tests" — not as AC proposals.
4. Clarifications should appear as their own section (one-click resolution cards per the Ambient AI approach).

---

### 1.3 — Terminology: "Acceptance Criteria" is too assumption-heavy

**Feedback:** Cristiano flagged strong assumptions that customers use/rely on acceptance criteria. The team discussed and agreed this is partly a terminology issue — the underlying concept is valid, but "AC" in the UI creates a false dependency.

**Disposition:** 🔧 UI terminology change needed. Backend concept is sound.

The pipeline correctly extracts testable conditions regardless of what the ticket calls them. The Analyzer prompt (`analyzer-extraction-v4.2`) already handles multiple formats (Gherkin, bullet, prose, table). The issue is purely the label in the UI.

**Spec ref:** `Analyzer_Pipeline_J1_v4.2.md` — `detectedFormat` field; `TestGenerator_Agent_Scope_Requirements.md` — Kim-Andre confirmed this is terminology.

**Action:**
1. Replace "Acceptance Criteria" label in the UI with **"Test Scenarios"** (Thai's suggestion) or **"Testable Conditions"**.
2. Backend field names (`extractedACs`, `linkedACs`, `acType`) stay as-is — these are internal identifiers, not user-facing labels.
3. Update the coverage map display to use the same new terminology.

---

### 1.4 — Generation should focus on core/important TCs first, allow expanding later

**Feedback:** Test Generator should prioritize the most core and basic test cases first. Allow users to request more lower-priority TCs afterward (Que Tran).

**Disposition:** 💬 Discussion needed — partially addressed, but UX for "generate more" is undesigned.

The TC Budget computation (`computeTCBudget()` in `Test_Case_Generator_v4_3.md`) already supports `targetCoverage: 'essential' | 'comprehensive'` and `preferredDensity: 'minimal' | 'standard' | 'thorough'`. So the backend *can* generate a smaller core set first.

What's missing: a UI affordance to say "generate more tests for lower-priority scenarios." The current flow is one-shot.

**Spec ref:** `Test_Case_Generator_v4_3.md` §1.2 — TC Budget; `TestGenerator_Agent_Scope_Requirements.md` — no "expand generation" story exists.

**Action:**
1. **April (minimum):** Default generation to `targetCoverage: 'essential'` + `preferredDensity: 'standard'`. This naturally produces core tests first.
2. **April (stretch):** Add a "Generate More Tests" button post-generation that re-runs with `targetCoverage: 'comprehensive'` and `preferredDensity: 'thorough'`, using `existingTestCases` to avoid duplicates.
3. **July:** Full iterative generation UX with user control over depth/scope per AC.

---

### 1.5 — Entry point should be a dialog, not a mandatory flow

**Feedback:** Should open a dialog when clicking "Generate Test Cases" where user can proceed with or without additional context. Could also let user specify depth (Que Tran).

**Disposition:** 🔧 Aligns with Ambient AI approach but needs a lightweight entry point.

The current implementation apparently forces users through a multi-step wizard. The Ambient AI spec envisions the *opposite*: click Generate → things happen → refine if you want.

**Action:**
1. For the Kai-first MVP: clicking "Generate with AI" should open Kai with context pre-loaded and immediately start analysis. No intermediate wizard.
2. For Phase 2 (inline): the AI Assessment section is always visible (ambient). User clicks "Generate" and it just works. Clarifications appear *after* analysis, not before as a gate.
3. Depth control (Que Tran's ask) maps to `preferredDensity` config — expose this as a simple toggle ("Quick" / "Thorough") on the generate dialog or as a post-generation option.

---

## 2. Agent Quality & Behavior

### 2.1 — Traceability is weak

**Feedback:** Cristiano flagged weak traceability between requirements and generated tests.

**Disposition:** ✅ Addressed in spec — needs verification in implementation.

The Generator spec (`Test_Case_Generator_v4_3.md`) requires every test case to have `linkedACs[]` mapping back to extracted ACs. The `coverageMap` in the output schema explicitly maps each EAC to its covering test cases and coverage types. Gate TC-B flags tests with empty `linkedACs`.

**Spec ref:** `Test_Case_Generator_v4_3.md` — output schema `linkedACs`, `coverageMap`; `TC_Scorer_Rule_Summary_v5_1.md` — Gate TC-B.

**Action:**
1. Verify the FE renders the AC ↔ test case mapping visually (the coverage analysis section in the Ambient AI spec).
2. If the demo showed weak traceability, the issue is likely FE display, not backend — the Generator *does* produce this data.
3. Add a traceability view to the review step: each test case shows which scenario(s) it covers; each scenario shows which test(s) cover it.

---

### 2.2 — 1:1 AC-to-TC count mapping questioned

**Feedback:** Kim-Andre questioned whether we really map 1:1 for ACs to test cases.

**Disposition:** ✅ Already addressed — the budget is dynamic, not 1:1.

`computeTCBudget()` allocates per-AC based on type: behavior ACs get 1 base + optional negative/boundary; error_scenario ACs get 1; performance ACs get 1-2. The final count depends on config flags, coverage gaps, and density preference — it's explicitly *not* 1:1.

**Spec ref:** `Test_Case_Generator_v4_3.md` §1.2.

**Action:** If the demo showed exactly one TC per AC, either (a) the demo requirement had simple ACs, or (b) the budget computation isn't connected yet. Verify `computeTCBudget()` is wired into the generation call, not bypassed.

---

### 2.3 — No test case count limit

**Feedback:** Anh Chu asked if there's a limit on generated TCs. Answer was "no limit for now."

**Disposition:** ✅ Already addressed in spec.

`ABSOLUTE_MAX = 20` in `computeTCBudget()`. The Generator prompt says: "DO NOT exceed budget.max under any circumstances."

**Spec ref:** `Test_Case_Generator_v4_3.md` §1.2 — `max: 20`.

**Action:** This is a communication gap, not a spec gap. Ensure the team knows the ceiling is 20 and the rationale (latency + UX). If 20 feels too high for demo purposes, `preferredDensity: 'minimal'` will naturally produce fewer.

---

### 2.4 — Need real-life requirements for testing and demos

**Feedback:** Cristiano requested 5-7 real-life customer requirements. Current demo requirements don't look realistic.

**Disposition:** 🔧 Action already assigned — needs follow-through.

Hà assigned Chi → Thanh (Support team) to gather real requirements via customer impersonation.

**Action:**
1. Support team gathers 5-7 real Jira tickets from consenting customers (or sanitized versions).
2. Run each through the full J1 pipeline (Analyzer → Generator → Scorer) and capture results.
3. Use these as the demo corpus — replaces synthetic requirements.
4. **Bonus:** These become the Tier 1 quality gate test set (see `TestGenerator_Agent_Scope_Requirements.md` §12 — "10 test requirements with varying quality").

---

### 2.5 — AI quality is poor / not aligned with requirements

**Feedback:** Implicit in multiple comments. Cristiano's "traceability is weak" and Boost's earlier feedback about irrelevant test cases both point here.

**Disposition:** 🔧 Ongoing — this is the prompt engineering + context pipeline work.

The v4.2 Analyzer and v4.3 Generator prompts address this structurally (AC extraction → scoring → budget → generation with coverage enforcement). The quality gap likely stems from the demo using the *old* generation engine, not the new agentic pipeline.

**Action:**
1. Confirm the demo was running the new pipeline (v4.2 Analyzer + v4.3 Generator), not the legacy "TestOps button" path.
2. If it was the old engine, the quality feedback is expected — engine unification is the fix.
3. If it was the new pipeline, collect the specific requirement + output and debug through the pipeline stages.

---

## 3. Data Persistence & Memory

### 3.1 — Suggested ACs not persisted after session

**Feedback:** Duy confirmed suggested ACs are in-memory only, not persisted after session ends.

**Disposition:** 🗓 Deferred — by design for April.

The spec doesn't define AC persistence because the pipeline produces `extractedACs` (from the ticket, read-only) and `clarifications` (session-scoped). There's no "suggested AC" entity to persist. The *coverage gaps* are derivable from re-running the Analyzer.

**Spec ref:** `Analyzer_Pipeline_J1_v4.2.md` — no persistence model for Analyzer output.

**Action:**
1. **April:** Accept session-scoped. Clarify in the UI that this is analysis of the current requirement state — re-analyze anytime.
2. **July:** If coverage gap persistence becomes a real need (Vu's feedback), scope a `requirement_analysis` entity that stores the last analysis result with timestamp. This is the `requirement_quality` persistence dependency flagged in the Launch Readiness doc.

---

### 3.2 — Agent memory: how to avoid duplicate TC generation?

**Feedback:** Vu asked how the agent identifies previously generated test cases to avoid duplicates.

**Disposition:** ✅ Already addressed in spec.

The Generator receives `existingTestCases[]` as input. The prompt explicitly says to check existing coverage before generating, and the output schema has `existingTestCasesSkipped[]` to report which existing TCs were considered.

**Spec ref:** `Test_Case_Generator_v4_3.md` — input field `existingTestCases`, output field `generationMetadata.existingTestCasesSkipped`.

**Action:** Verify `existingTestCases` is being populated from the requirement's linked test cases at call time. If it's being passed as empty, duplicate generation is expected behavior.

---

### 3.3 — Need to persist additional user context in coverage matrix

**Feedback:** Vu noted that users often clarify requirements to agents, and in the long run we need to store and include that additional context.

**Disposition:** 🗓 Deferred to July.

This maps to the broader "requirement enrichment" concept — user-provided clarifications becoming part of the requirement's persistent context. The current spec has `resolvedClarifications` as a session-scoped input to the Generator.

**Action:**
1. **April:** Session-scoped clarification resolution (already designed).
2. **July:** Design a `clarification_history` entity linked to the requirement. When user re-generates, previous resolutions auto-load. This is architecturally straightforward but needs Core team buy-in for the data model.

---

## 4. FE Bugs (Fix Before Next Demo)

### 4.1 — Clarification questions sometimes don't appear in FE

**Feedback:** Kim-Andre reported intermittent issue.

**Disposition:** 🔧 Bug — needs investigation.

Likely cause: race condition between agent tool call completion and FE state update, or the agent not calling the correct tool to store structured output (see 4.2).

**Action:** Reproduce, capture agent logs, check if `clarifications[]` is present in agent output but not rendered, or absent from output entirely.

---

### 4.2 — Agent sometimes calls wrong tool for structured output

**Feedback:** Kim-Andre reported the agent sometimes doesn't call the correct tool to store questions/structured output, causing UI errors.

**Disposition:** 🔧 Bug — likely prompt or tool-calling reliability issue.

This is the non-deterministic tool call problem that was flagged in the Kai architecture discussions. The two-phase architecture (free-form intent resolution → deterministic execution handoff) was designed to address exactly this class of bug.

**Action:**
1. Short-term: Add tool-call validation in the orchestrator — if expected tool wasn't called, retry once with explicit instruction.
2. Medium-term: This reinforces the case for the two-phase Kai architecture where Phase 2 execution is deterministic (no agent tool-call ambiguity).

---

## 5. Scope & Strategy

### 5.1 — Halt J2, focus on J1 enhancement

**Feedback:** Hà suggested halting J2 to focus on J1 quality. Kim-Andre pushed back: J2 is at risk, planning can proceed in parallel, and J1 work is largely transferable.

**Disposition:** 💬 Discussion needed Monday.

Kim-Andre is right that J1 and J2 share the extraction and generation pipeline — the Analyzer prompts use shared versions (`analyzer-extraction-v4.2`), and the Generator prompt is identical. The J2-specific work is Round 1 (document processing, feature area identification) and the save-back UX (standalone / create requirement / link existing).

**Recommendation:**
1. **Prioritize J1 quality** for the next sprint — this is the demo path and where all the feedback applies.
2. **Continue J2 planning and spec work in parallel** — the J2 v4.3 spec is already done.
3. **Don't halt J2 implementation entirely** — the Document Processor and Round 1 triage are J2-specific but low-risk, and blocking trial/POC users without J2 is a real commercial cost.

---

### 5.2 — Explore regeneration with additional context at review step

**Feedback:** Thai suggested exploring test case regeneration with additional context after initial generation.

**Disposition:** 🔧 Aligns with "Generate More" UX (see 1.4). Needs design.

This is the iterative refinement loop: generate → review → "these aren't quite right, here's more context" → regenerate. The pipeline supports this (re-run Generator with updated `resolvedClarifications` and `existingTestCases`), but the UX doesn't exist yet.

**Action:** Design a "Refine & Regenerate" affordance in the review step. Minimum: a text input for additional context + re-generate button. Better: Kai bridge with context ("Ask Kai to improve these tests" → Kai opens with current tests + coverage map pre-loaded).

---

### 5.3 — Better visualization of gap analysis results + follow-up actions

**Feedback:** Anh Huy Tieu requested better gap analysis visualization and suggested follow-up actions.

**Disposition:** 🔧 Needed for demo credibility.

The Generator outputs `coverageMap`, `acsNotCovered[]`, and `skippedGaps[]`. The data exists — the FE needs to render it as an actionable summary, not raw data.

**Action:**
1. Show a coverage summary card post-generation: "8 tests generated covering 5/6 scenarios. 1 gap: [AC-4] — already covered by existing test TC-4401."
2. For uncovered gaps: show a "Generate tests for this gap" button per gap.
3. For skipped gaps: show reason (e.g., "requires multi-session orchestration — not automatable in single browser session").

---

## Summary: Monday Discussion Priorities

| # | Topic | Type | Decision needed |
|---|-------|------|-----------------|
| 1 | J1 vs J2 prioritization | Strategy | Continue J2 planning in parallel or full halt? |
| 2 | UI terminology (AC → Test Scenarios) | Quick win | Agree on label, implement this sprint |
| 3 | Document upload optionality | Bug/UX | Verify it's not gated — if so, fix immediately |
| 4 | "Generate More" / iterative refinement UX | Design | Scope for April or defer to July? |
| 5 | Real customer requirements | Action item | Confirm Support team timeline for 5-7 samples |
| 6 | FE bugs (questions not appearing, wrong tool calls) | Engineering | Assign investigation, get reproduction steps |
| 7 | Traceability visualization | Demo blocker | Verify coverageMap renders in FE, add if missing |
