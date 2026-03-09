# TestGen Pipeline — Changelog

All version changes to prompt specs, scoring logic, and pipeline architecture.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [2026-03-08] — Prompt Optimization Pass

### Generator v4.3 (`Test_Case_Generator_v4.3.md`)
**Scope reduced** — TC Quality Scorer and Runner Quality Assessor moved to companion docs.
Execution model reference condensed to 3 behavioural constraints (verbs / element refs / expected results).

**Prompt changes:**
- `<input_description>` stripped of J1/J2 pipeline framing — model sees fields, not topology
- `<runner_constraints>` replaces `<execution_model>` — 3 numbered rules with right/wrong examples
- TASK 1 now opens with "Read `<generation_budget>` first" — resolves sequencing gap
- TASK 2 annotation embedding clarified: which *step* to annotate, not which *field*; inline before/after example added
- `source` field priority rule added: `clarification > document > requirement > ai_inferred`
- `<self_check>` restructured as validation-only; creation logic moved to TASK 2
- Two new self-check gates: **name uniqueness** and **precondition specificity** (role + identifier + URL)
- `<rules>` stripped to field presence + injection defense + budget hard limit only
- Temperature note updated: 0.2 (was 0.3) — lower variance on structured JSON

### Analyzer Pipeline J1 v4.2 (`Analyzer_Pipeline_J1_v4.2.md`)

**Fixed bugs:**
- `parseAnalysisResponse` was checking `adequacy.status` — field removed from Call B in v4.1; now checks `qualityScore.dimensions` only (would have crashed on every response)
- `generationContext` was spreading `documentRules`/`documentScenarios` as flat fields; Generator expects `documentContext: { extractedRules, extractedScenarios }` — document enrichment was silently not reaching the Generator
- `clarification.impact` changed from freetext string to `affectedACs: ["EAC-1"]` structured array — required for `convertSkippedClarificationsToIssues()` to work

**Prompt changes:**
- `runnerReadiness` removed from Call B entirely (8 → 7 dimensions) — it measures generated test steps, not requirement text
- `qualitySignals.runnerReadiness` stripped via destructuring before Call B user message is built
- `computeWeightedScore` rebalanced: completeness 0.20→0.25, testability 0.20→0.25 (total remains 1.00)
- `sourceType: "jira" | "document"` in Call B corrected to `"jira"` only — J1 never passes a document
- Clarification `priority` now has explicit rubric: `core` tier → 1 or 2; `enhancement` tier → 3 or 4
- Call A now uses `resolvedClarifications` to update AC text — confirmed values incorporated before downstream scoring
- `task` requirementType gets explicit extraction guidance: 0–1 ACs acceptable, `clearIntent` may be null
- Call B instructed to raise dimension scores when `resolvedClarifications` fills gaps; adjustments[] must record this
- `convertSkippedClarificationsToIssues()` now wired into orchestrator; `pendingIssues` passed to Generator as `issues[]`
- `computeAdequacyGate` updated with `task`-type awareness: always passes core tier, capped at MARGINAL if 0 ACs

**Added:**
- Generator Handoff table mapping `generationContext` fields to Generator v4.3 input contract
- `pendingIssuesCount` added to `analyzer_call_b` logging
- `requirementTypeOverride` added to `analyzer_call_a` logging

**Removed:**
- Duplicate `computeTCBudget` acType weighting code — owned by Generator v4.3 §1.2; cross-reference replaces it

### Analyzer Pipeline J2 v4.3 (`Analyzer_Pipeline_J2_v4.3.md`)

**Fixed bugs:**
- `featureArea: { id, label }` now passed to Generator — was missing; caused every J2 test case to have `areaLabel: null`, silently breaking review panel area grouping
- `documentContext` shape fixed in Generator call: `documentRules: [], documentScenarios: []` (flat) → `documentContext: null` (correct contract)
- `parseJ2AnalysisResponse` implemented — was called in orchestrator but never defined
- Version strings updated: `analyzer-extraction-v4.1 → v4.2`, `j2-structure-v4.2 → v4.3`, `analyzer-analysis-j2-v4.1 → v4.2`
- `runnerReadiness` stripped from `qualitySignals` before Call B J2 via same destructuring fix as J1

**Prompt changes:**
- `runnerReadiness` removed from Call B J2 (8 → 7 dimensions); `computeWeightedScore` rebalanced same as J1
- `documentContext` description in Call A corrected: "Always sent, may contain empty arrays — no global extraction step runs in J2"
- `Annotation.affectedField` (`'steps' | 'expected_result'`) replaced with `affectedStep: number | null` — aligns with Generator v4.3 shape
- `resolvedClarifications` added as optional field in J2 Call A — enables review panel re-run to incorporate user notes into AC text
- `affectedACs: []` on `missing_scenario` issues now documented: signals Generator to create placeholder stub test case
- Round 1 `detectedScope`: added format example, `null` return case, and edge case guidance
- Round 1 `userPrompt` with zero matching scope: now returns `featureAreas: []` with reason in `detectedScope`
- `requirementTypeOverride: null` added to J2 Call A output schema for shared parser compatibility with J1

**Added:**
- `isRerun` flag to `j2_round2_call_a` logging
- `missingScenarioIssues` count to `j2_round2_call_b` logging
- `earlyExit` flag to `j2_round1` logging
- `hasGherkin`/`hasExplicitACs` accuracy note for skeleton-mode documents
- Tuning point: review panel re-run effectiveness tracking

---

## [2026-03-07] — J1/J2 Pipeline Split + Generator Annotations

### Generator v4.2 (`Test_Case_Generator_Scorer_Assessor_v4_2.md` → split)
- `issues[]` input added: gaps from Call B (J2) or converted skipped J1 clarifications
- `featureArea: { id, label }` input added: propagates to `areaLabel` on every test case
- `lowConfidence` input added: propagated from adequacy gate NOT_ADEQUATE
- Output schema: `annotated`, `annotations[]`, `lowConfidence`, `areaLabel` added to each test case
- `"placeholder_annotation"` added to `source` enum
- Self-check: annotation coverage check — every `ISS-N` in `issues_for_annotation` must be referenced
- J1 clarification-skip handling: `convertSkippedClarificationsToIssues()` documented (§1.1)
- Logging: `requirementKey` now handles both `jiraKey` (J1) and `areaId` (J2)
- TC Budget: `acType`-aware weighting formula (`computeTCBudget`) documented (§1.2)
- Parser normalization: `annotated → false`, `annotations → []`, `lowConfidence → false`, `areaLabel → null` when absent

### Analyzer Pipeline J1 v4.1
- Deterministic `acCandidates[]` removed — Call A extracts directly from structured content
- Deterministic layer now outputs `extractionHints` (structural signals) instead of `acCandidates[]`
- `acType` classification added to each extracted AC (`behavior | error_scenario | performance | constraint`)
- AC hard cap: ≤15 per pipeline run
- Semantic deduplication pass added inside Call A
- Bug fix mode: `requirementType: "bug_fix"` now confirmed or overridden by Call A reading content
- Call B TASK 2 (Adequacy) removed: computed deterministically via `computeAdequacyGate()` from scores + AC count
- Call B TASK 4 (Scenario Coverage) removed: speculative output, redundant with clarifications
- `hasACSection` heuristic regex removed — too naive; described as multi-signal prior only
- `structuredContent.acceptanceCriteria` as primary source corrected: Call A reads full cleaned content
- `sourceType` in J1 corrected to `"jira"` only

### Analyzer Pipeline J2 v4.2
- Call A system prompt inlined (J2-adapted) — doc now self-contained
- `hasUserStories` and `hasNumberedRequirements` dropped from Round 1 output — no downstream consumers
- `hasGherkin` and `hasExplicitACs` retained with documented usage (extractionHints + UI badges)
- Round 1 TASK 3 (early exit) confirmed as separate gate block after TASK 1/2
- No clarification flow in J2 documented explicitly — gaps → placeholder annotations only
- Vector store: not required for MVP, trigger condition documented for post-MVP

---

## [2026-03-06] — TC Quality Scorer v4.1

### TC Quality Scorer (`TestCase_Quality_Scorer_Comprehensive.md`)
- Fixed Rule 2 false positive: verbs in expected results (e.g. "verify the button is disabled") were incorrectly penalized
- Fixed Rule 1 + Rule 3 double-penalization: R3 now suppressed when R1 has already fired on the same step
- Blended score formula changed: 60% avg + 40% worst-step (was: simple average that masked broken steps)
- `'fill'` added to ACTION_VERBS vocabulary
- VAGUE_PATTERNS list expanded from real-ticket false negatives
- Dual-score model documented: Quality Score (QS) vs Automated Readiness Score (ARS) are distinct

---

## [2026-03-05] — Architecture Decision: Deterministic Pipeline

### Architecture (`TestCaseGenerator_Agent_Architecture.md`)
- **Decided:** Deterministic prompt chain pipeline, not free agent loop
- Each sub-agent (`RequirementAnalyzerAgent`, `DocumentProcessorAgent`, `TestGeneratorAgent`, `CoverageAnalyzerAgent`) is a bounded LLM call with schema-enforced structured output
- KAI wraps entire pipeline as single tool — no direct access to individual MCP tools
- Streaming + parallel execution strategy documented for 2–3 min performance target
- "Open in KAI with full context" deep-link pattern defined for cross-surface error recovery

---

## [2026-03-04] — RequirementScoringVerifier v2.1 (Bug Fixes)

### RequirementScoringVerifier (`RequirementScoringVerifier_v2.jsx`)
- **Bug 1 fixed:** Separator detection regex stripped all letters before pipe/dash check — table rows like `| MUST HAVE | TBD |` misidentified as separators → 0 ACs extracted from table-format tickets. Fix: check each cell individually with `rawCells.every(c => /^[-:\s]+$/.test(c))`
- **Bug 2 fixed:** Bullet inference fallback matched only action verbs — missed requirement-like bullets with feature stems (`improv`, `enhanc`, `optimi`) and domain nouns (`filter`, `render`, `chart`, `dashboard`). Fix: Tier 2 matching with minimum length guard
- Both fixes verified with end-to-end Node.js tests (TO-16802: 0→4 ACs; vague-bullets: 1→5 ACs)
- Regression test: Upload & Generate ticket still scores in Good band

---

## [2026-03-03] — Requirement Scoring Pipeline V2

### Requirement Scoring Pipeline (`Revised_Requirement_Scoring_Pipeline_v2.md`)
- AC extraction upgraded from line-level to block-level (detect-then-classify two-pass model)
- `ExtractedAC` interface gains `children[]`, `sectionContext`, `originalBlock`
- JIRA markup normalization pre-processing step added
- Gherkin extraction uses `Scenario:` as explicit block boundary (was: loose line-by-line)
- Hierarchical AC extraction with preamble look-ahead detection
- Two-tier ambiguity system introduced
- Bonus-based coverage model replaces threshold-based scenario signals
- Issue consolidation with cascade suppression; capped at 5 primary issues
- META-01 meta-issue gate: empty description short-circuits all dimension scoring
- 8 scoring calibration fixes from real JIRA ticket verification
