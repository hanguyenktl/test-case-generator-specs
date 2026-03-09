# TestGen Pipeline — Lessons Learned & Key Decisions

**Scope:** Requirement Analyzer → Test Case Generator pipeline
**Period:** March 2026 sprint toward April 7 launch
**Format:** Problem → Decision → Why it held up

---

## Architecture

### 1. Deterministic pipeline beats free agent loop for dual-surface delivery

**Problem:** Product ships on two surfaces — KAI (conversational) and a controlled workflow UI. Engineering raised that free agent loops produce non-deterministic tool call ordering, opaque errors, and require separate backend flows per surface — which causes parity drift over time.

**Decision:** Implement backend as a deterministic prompt chain. Each stage (Extraction → Analysis → Generation) is a bounded LLM call with schema-enforced structured output. KAI wraps the entire pipeline as a single tool; it has no access to individual MCP tools.

**Why:** Single backend, two adapters. KAI gets conversational UX. The UI gets controlled workflow UX. Both get identical outputs. Parity drift becomes structurally impossible.

---

### 2. J1 and J2 are fundamentally different orchestration topologies — separate docs, not a shared doc with flags

**Problem:** J1 (Jira ticket) is 1:1:1. J2 (document upload) is 1:N:N — one document, N feature areas, N concurrent pipelines, a user gate, result aggregation, and a review panel. A single doc with `if (source === 'document')` conditionals was becoming unreadable and bug-prone.

**Decision:** Split into `Analyzer_Pipeline_J1` and `Analyzer_Pipeline_J2` as separate specs. Shared prompts (Call A) are referenced by version string in both; changes must bump both.

**Why:** Each doc reads cleanly without branching noise. The shared-prompt contract is made explicit. Engineers can read one doc and understand the full pipeline for their surface.

---

### 3. Adequacy gate belongs in backend code, not in LLM output

**Problem:** Call B was producing an adequacy assessment alongside quality scores. Adequacy was largely derivable from the dimension scores (completeness, testability, clarity). Two outputs computing the same signal, one of them from a non-deterministic model.

**Decision:** Call B outputs quality dimension scores only. Backend computes `computeAdequacyGate()` deterministically from those scores + AC count. Gate logic is independently testable.

**Why:** Reduces Call B output tokens. Makes gate logic unit-testable without mocking an LLM. Removes a source of inconsistency between dimension scores and the stated adequacy status.

---

### 4. runnerReadiness does not belong in the requirement analyzer

**Problem:** Call B was scoring `runnerReadiness` as one of 8 quality dimensions. But runner readiness is a property of generated *test steps*, not of requirement text. A requirement saying "Session timeout after 30 minutes" is perfectly good — the Runner readiness of a test step that verifies it is a separate concern.

**Decision:** Remove `runnerReadiness` from Call B entirely. Strip it from `qualitySignals` before the user message is built. Keep computing it in the TC Quality Scorer, where it belongs.

**Why:** The dimension was scoring requirements for something they can't control. Freed up 10% weight, redistributed to completeness (0.20→0.25) and testability (0.20→0.25) — the two dimensions most directly predictive of generation quality.

---

## Prompt Engineering

### 5. Task prompts and rules sections must not duplicate each other

**Problem:** `<rules>` in the Generator system prompt was restating constraints already in `<tasks>`. "DO NOT drift outside clearIntent" appeared in both TASK 1 and `<rules>`. Long rules get skimmed; duplicated rules get ignored.

**Decision:** `<rules>` enforces only what tasks don't: field presence (always-present defaults), injection defense, and hard numeric limits (budget max). Everything behavioral belongs in the task.

**Why:** Shorter rules sections are read. Task instructions are followed in context.

---

### 6. `<self_check>` is a validation pass, not a generation pass

**Problem:** The Generator's `<self_check>` was instructed to create things — "if no test case fits an issue, create a placeholder stub." Creation logic in a validation pass creates ordering ambiguity: when does the stub get created? Does the model re-run planning?

**Decision:** `<self_check>` validates only. Placeholder stub creation logic moved to TASK 2, where generation belongs. Self-check checks coverage and flags violations.

**Why:** Cleaner separation. The model knows where to create; it knows where to validate. No re-entrant generation in a validation block.

---

### 7. Structured arrays beat prose for downstream-consumed fields

**Problem:** `clarification.impact` was a freetext string: `"Affects EAC-1, EAC-3 and the precondition scenario"`. `convertSkippedClarificationsToIssues()` needed to extract EAC IDs from this string — fragile text parsing.

**Decision:** Change to `affectedACs: ["EAC-1", "EAC-3"]`. Explicit structured array. Same pattern as `issues[]`.

**Why:** Downstream code can iterate directly. No regex against freetext. Consistent schema across clarifications and issues.

---

### 8. Fields listed in `<input_description>` must have usage instructions somewhere in `<tasks>`

**Problem:** `resolvedClarifications` was listed in Call A's `<input_description>` in both J1 and J2, but no task said what to do with it. The model ignored it or did something unpredictable.

**Decision:** Add explicit instruction: confirmed threshold values and resolved behavior choices are incorporated directly into AC text — not treated as context, not left for the model to decide.

**Why:** Listing a field and not using it is noise. It also means the Generator received vague AC text when it could have received "session timeout after 5 minutes" — directly testable. This is a quality multiplier.

---

### 9. Annotation embedding needs a few-shot example, not just a task description

**Problem:** The Generator's placeholder annotation embedding was the most complex new behavior in v4.2. A task description alone ("append placeholderText to that step's expectedResult") left the model interpolating the exact output format, which step to annotate, and how to set structured metadata.

**Decision:** Add a compact before/after inline example inside TASK 2 showing exactly: original `expectedResult`, modified `expectedResult` with `\n⚠ Placeholder: ...` appended, and the resulting `annotated: true, annotationIds: ["ISS-N"]` on the test case.

**Why:** The most novel behavior requires a demonstration. Without the example, annotation quality was inconsistent across calls. With the example, the format is anchored.

---

### 10. Parser guards must match the actual current output schema

**Problem:** `parseAnalysisResponse` in J1 was checking for `parsed.adequacy?.status` — a field removed from Call B output in v4.1. This check would throw `AnalyzerParseError: Missing adequacy.status` on every valid Call B response. The bug was invisible in specs because it was in parser code, not the prompt.

**Decision:** Parser validation checks must be reviewed every time the output schema changes. When adequacy moved to backend, the parser check should have been removed at the same time.

**Why:** Schema changes with no corresponding parser update become silent runtime failures that only surface in production.

---

## Data Modeling

### 11. `affectedStep: number` beats `affectedField: enum` for annotation location

**Problem:** `Annotation.affectedField` was typed as `'steps' | 'expected_result'` — a field category. The review panel needs to highlight the specific step where the annotation was embedded. A category enum can't do that.

**Decision:** Replace with `affectedStep: number | null`. The Generator already knows which step number it annotated.

**Why:** One integer is more precise and more useful than a two-value enum. The UI can jump directly to step N.

---

### 12. `documentContext` shape must match what the Generator actually accepts

**Problem:** J1 and J2 orchestrators were building `generationContext` with flat fields (`documentRules`, `documentScenarios`). Generator v4.3 `buildGeneratorUserMessage` reads `input.documentContext` as a nested object `{ extractedRules, extractedScenarios }`. Contract mismatch meant document enrichment reached Call A but never reached the Generator.

**Decision:** Enforce `documentContext: { extractedRules, extractedScenarios } | null` as the Generator's contract. All callers pass the nested shape or null.

**Why:** Silent contract mismatches are worse than loud ones. Enrichment data reaching Call A but not the Generator was a silent partial failure.

---

## Quality & Reliability

### 13. Real-ticket testing reveals what synthetic tests miss

**Problem:** Two critical extraction bugs were only found by testing real JIRA tickets — not through synthetic test cases:
- Table-format tickets: separator detection regex stripped all letters before the pipe/dash check, causing all content rows to be misidentified as separators → 0 ACs
- Vague-bullet tickets: bullet inference fallback matched only action verbs, missing feature stems and domain nouns → under-extraction

**Decision:** End-to-end Node.js tests with real ticket data are required for validating extraction logic. Synthetic test cases don't cover the formatting edge cases that real teams actually use.

**Why:** Real tickets surface formatting patterns (table separators, domain-specific stems) that are hard to anticipate in synthetic test data. The bugs were invisible until real data was run.

---

### 14. Block-level AC extraction is architecturally different from line-level

**Problem:** V1 used flat line-by-line extraction. This caused: Gherkin scenarios producing one AC per line (3–6 ACs per scenario instead of 1), hierarchical bullets losing parent context, table cells losing row context, and section headers misidentified as ACs.

**Decision:** Two-pass block-level model: detect blocks first (Gherkin scenario, bullet hierarchy, table row, prose paragraph), then classify each block. Gherkin → one AC per `Scenario:`. Hierarchical bullets → semantic merge rules. Tables → row-as-unit.

**Why:** The line-level model was architecturally insufficient for how requirements are actually written. The V1 approach wasn't a parameter to tune — it needed to be replaced.

---

### 15. "Good enough" determinism is a first-class design principle

**Problem:** There was implicit pressure to make the scoring pipeline more semantically accurate — using embeddings, NER, or a separate LLM call for each quality signal.

**Decision:** The scoring pipeline is a pre-assessment heuristic, not a perfect semantic solution. Rules should be reliable and explainable over maximally sophisticated. False negatives are acceptable; false positives are worse.

**Why:** The pipeline's purpose is to help users understand generation readiness before committing to a full generation run. It doesn't need to be a perfect analyzer — it needs to be consistently trustworthy. "Good enough" determinism is cheaper, faster, and easier to debug than "sometimes smarter."

---

### 16. Model choice: Sonnet for Generator, Haiku for Analyzer

**Problem:** Haiku was proposed for the Generator to reduce cost and latency (~20x cheaper, ~3–5s faster). Customer feedback had already flagged AI-generated test quality as a top concern.

**Decision:** Keep Sonnet for Generator. Use Haiku for Analyzer calls (Extraction + Analysis). Implement a Haiku-first with Sonnet retry gate if needed: post-scoring triggers Sonnet escalation if >20% of generated tests score red.

**Why:** Multi-constraint reasoning (step precision, dedup accuracy, boundary detection, self-validation compliance) degrades on Haiku in ways that directly produce the quality problems customers already reported. The Generator is the quality surface. Analyzer calls (extraction + scoring) tolerate Haiku well because they have simpler structured output contracts.

---

## Pipeline Design Patterns

### 17. The annotation pattern unblocks J2 generation without sacrificing quality signal

**Problem:** J2 documents can't support a pre-generation clarification dialog — there are N areas with N concurrent pipelines and no natural pause point for user interaction.

**Decision:** Generation always proceeds. Call B identifies gaps as structured `issues[]`. The Generator embeds them as `⚠ Placeholder: ...` in specific test step expectedResults. The review panel surfaces all annotations post-generation, grouped by area.

**Why:** Users get test cases immediately. Gaps are visible and actionable — not silently omitted. The review panel gives users a structured workflow to resolve gaps and regenerate. This is strictly better than blocking generation on ambiguity.

---

### 18. Shared prompts require explicit version governance across pipeline docs

**Problem:** Call A (`analyzer-extraction`) is shared between J1 and J2. After bumping it to v4.2 in the J1 doc, J2 still referenced v4.1. Version drift between pipeline docs means different engineers deploy different prompt versions to the same shared prompt.

**Decision:** The shared prompt note at the top of each pipeline doc states: "Changes to Call A must be version-bumped in both pipelines simultaneously." Version strings are logged per call for observability.

**Why:** Shared prompts with independent version strings in consuming docs will diverge. Making the governance rule explicit in the doc itself (not just in a team norm) makes it harder to miss.

---

### 19. Generation count is a backend computation, not a static LLM constraint

**Problem:** The Generator system prompt had a static rule: "DO NOT generate more than 15 test cases." This created two problems simultaneously. First, a 1-AC requirement and a 10-AC requirement both ran against the same ceiling, meaning simple tickets were over-generated (the model filled toward 15) and complex tickets were under-generated (genuine coverage was silently cut). Second, the ceiling was a quality constraint framed as a UX constraint — the 15 was arbitrary, not derived from anything.

**Decision:** Remove the static ceiling from the prompt. Compute a `tcBudget: { target, max, truncated }` deterministically in the backend from AC count, boundary condition signals, config flags, and an optional `preferredDensity` multiplier. Inject it as `<generation_budget>` into the user message with an explanation of how it was derived. Raise the hard UX ceiling to 20 (latency/review-burden threshold). When the formula exceeds 20, surface `truncated: true` to the user as a meaningful message rather than silently capping output.

**Why:** Static numeric rules in prompts that aren't grounded in the input are noise the model works around. Injecting a reasoned budget ("target: 6, calculated from 3 ACs and your coverage settings") gives the model a number and a rationale — it anchors without being gamed. The `truncated` signal also gives users actionable information about their requirement rather than a generic "max reached" message. This is the same principle as #3 (adequacy gate in backend) applied to generation quantity.

---

### 20. Scorer and Generator share a vocabulary contract — updating one without the other creates silent misscoring

**Problem:** `'fill'` was added to the Generator's `<execution_model>` action verb list as a natural alias for text input (commonly used by manual testers). It was not added to `ACTION_VERBS` in the TC Quality Scorer. Result: any test step starting with "Fill" — whether AI-generated or manually written — scored −25 for `no_action_verb`, incorrectly flagging valid steps as broken.

**Decision:** Treat `ACTION_VERBS` as the single source of truth for the Generator-Scorer contract. Any verb added to the Generator's supported verb list must be added to `ACTION_VERBS` in the same change. Treat a mismatch between the two as a contract bug, not a tuning issue.

**Why:** The Generator writes steps; the Scorer validates them. They communicate through a shared vocabulary. When the vocabulary diverges, the Scorer penalizes steps the Generator was explicitly instructed to produce — the model did the right thing and got punished for it. This is a contract boundary, not a configuration. The fix is governance: any prompt change that adds or removes action verbs must include a corresponding `ACTION_VERBS` update.

---

### 21. Average step score masks single-point failure risk — use a blended formula

**Problem:** Test case quality was scored as the arithmetic average of all step scores. A test case with 9 perfect steps (score 100) and 1 completely broken step (score 0) averaged to 90 — rated 🟢 AI Ready. But in sequential browser execution, a single broken step aborts the entire test run. The 🟢 badge was actively misleading.

**Decision:** Replace pure average with a blended formula: `(average × 0.6) + (worst_step × 0.4)`. The 9+1 example now scores `(0.6 × 90) + (0.4 × 0) = 54` → 🟡. A test with one medium step (score 60) among nine perfect steps scores `(0.6 × 94) + (0.4 × 60) = 80.4` → 🟢 — correctly passing a test that will likely succeed.

**Why:** Sequential execution pipelines don't average — they fail at the weakest link. A scoring formula that averages across steps is modeling the wrong execution model. The 60/40 blend is deliberately asymmetric: it preserves the signal from mostly-good tests while ensuring a catastrophic step can't hide. The weights are tunable post-launch via Runner execution data (if 🟡 tests succeed >70% of the time, the worst-step weight is too high).
