# Deterministic Layer Spec v3 — extractionHints, qualitySignals & Scoring

**Replaces:** `Revised_Requirement_Scoring_Pipeline_v2.md`
**Implementation:** `requirementScoringRules.js` (copy-paste ready)
**Companion:** `Requirement_Analyzer_Prompt_v4.1.md` (Call A + Call B system prompts)

---

## What Changed from v2

**AC extraction moved to LLM (Call A).** The deterministic layer no longer extracts ACs. Call A reads the structured content directly and handles hierarchy, table formats, Gherkin grouping, preamble detection, and bug-fix minimal mode natively — eliminating the three structural failure modes we kept patching in v2 (hierarchical bullet blindness, table separator fragility, preamble misclassification).

**Deterministic scoring is kept.** It's cheap ($0, <30ms) and gives the page an instant score before the LLM responds. Call B can override any dimension score with semantic reasoning — when it does, it records the adjustment and reason. The deterministic score is the fast path; the LLM score is the accurate path.

**Runner readiness removed from scoring weights (v4.2).** Runner readiness is a per-test-case concern, not per-requirement. The signals (UI-observable ratio, unsupported actions) are still computed and passed downstream to the TC Quality Scorer, but they no longer contribute to the requirement quality score. Weight redistributed to completeness (0.25) and testability (0.25).

**Summary of ownership:**

| Concern | v2 | v3 |
|---------|----|----|
| AC extraction | Deterministic — block-level with Gherkin, tables, sub-sections | **Call A (LLM)** — hierarchy-aware, `acType` classification, dedup, cap ≤15 |
| Quality scoring | Deterministic only | **Deterministic first** (instant), then **Call B (LLM)** overrides with semantic analysis |
| Issue surfacing | Deterministic consolidation (cascade, grouping, cap 5) | **Call B** — targeted clarifications with structured options |
| Overall score | Deterministic composite (8 dimensions) | **Deterministic composite (7 dimensions)**, Call B can override per-dimension |
| Generation gate | Score bands (ready/good/needs/insufficient) | **`computeAdequacyGate()`** — core tier + enhancement tier from Call A + Call B output |

---

## Pipeline Overview

```
Jira Ticket
    │
    ▼
[Deterministic Layer]          — strips markup, detects format, emits extractionHints + qualitySignals + deterministicScore
    │
    ├──────────────────────────────────────┐
    │                                      │ (if document attached)
    ▼                                      ▼
[Call A — Extraction Agent]     [Doc Processor J1 — Supplement Mode]
    │  (structured content               │  (extracts rules, scenarios, conflicts
    │   + extractionHints)               │   relevant to this Jira ticket)
    │                                    │
    └────────────┬───────────────────────┘
                 │ (documentContext injected into Call A if present)
                 ▼
          [Call A — Extraction Agent]
                 │  extractedACs[] + clearIntent
                 ▼
          [Call B — Analysis Agent]
                 │  qualityScore (overrides deterministicScore) + adequacy + clarifications + scenarioCoverage
                 ▼
          [computeAdequacyGate()]   — deterministic; no LLM
                 │
                 ▼
          [generationContext → Generator]
```

**Cost model:**

| Stage | Cost | Time | Notes |
|-------|------|------|-------|
| Deterministic layer | $0 | <30ms | Includes scoring — fast path for instant UI |
| Call A (Haiku) | ~$0.00013 | ~200ms | System prompt cached |
| Call B (Haiku) | ~$0.00020 | ~300ms | System prompt cached; overrides deterministic scores |
| Doc Processor J1 | ~$0.00035 | ~400ms | Parallel with deterministic layer; only when doc present |
| `computeAdequacyGate()` | $0 | <1ms | Post-LLM deterministic gate |

---

## Deterministic Layer Responsibilities

**Kept from v2:** Markup stripping/injection defense, format detection, section boundary detection, user story parsing, quality signal computation, scoring.

**Removed from v2:** `extractStructure()` — full AC extraction (block-level grouping, Gherkin scenarios, table rows, sub-sections, preamble detection, bullet inference). All moved to Call A.

**Added in v3:** `extractionHints` output, `requirementType` detection, `structuredContent` passthrough, `computeAdequacyGate()`.

---

## Output Contract 1: `extractionHints`

Consumed by Call A. Guides extraction without constraining it — these are hints, not instructions.

**Fields:**

- **`detectedFormat`**: `gherkin | bullet_flat | bullet_hierarchical | prose | table | mixed` — tells Call A whether to respect hierarchy, expect Gherkin keywords, or handle table rows
- **`requirementType`**: `feature | bug_fix | enhancement | task` — gates Call A's extraction mode (bug_fix → minimal 1–3 ACs)
- **`estimatedACCount`**: Count of top-level bullet items in the AC section only (not sub-bullets, not tasks). Sanity check: if Call A extracts 3× or 0.3× the estimate, log it
- **`sectionLabels`**: Sub-section headers found within the AC section (e.g., "Access & Entry Points", "Scenarios > Allow user"). Helps Call A understand grouping intent
- **`userStory`**: Parsed As-a/I-want/So-that fields. `{ detected, persona, goal, benefit }`

**`requirementType` detection priority:**

1. Bug signals in title + description: fix, bug, inconsisten, incorrect, wrong, broken, "should be X instead of Y", mismatch → `bug_fix`
2. Task signals: migrate, upgrade, refactor, cleanup, remove, deprecate → `task`
3. Feature vs enhancement: has AC section header → `feature`; otherwise → `enhancement` (low-confidence prior, Call A can override)

**Format detection logic:**

- Has `Given/When/Then/Scenario` keywords → `gherkin`
- Has `|...|` table rows → `table`
- Has bullets with indented sub-bullets (2+ spaces or `**`) → `bullet_hierarchical`
- Has bullets or numbered items only → `bullet_flat`
- Multiple formats detected → `mixed`
- None of the above → `prose`

**Section boundary detection:** Uses header regex to identify AC sections, Notes, Definition of Done, Technical Notes, Task sections. Sub-section patterns match `### Heading`, `**Bold header**`, `AC1: Description`, `Scenario: Description`.

---

## Output Contract 2: `qualitySignals`

Consumed by Call B as starting points for scoring. Also consumed by deterministic scoring functions.

### Clarity Signals

- **`ambiguousTerms[]`**: Each entry has `{ term, tier, context, qualified }`. Tier 1 (always ambiguous): good, bad, nice, proper, adequate, sufficient, reasonable, acceptable, better, improved, enhanced, optimized, major, minor, significant. Tier 2 (flag only when standalone — no parenthetical/numeric qualifier nearby): fast, slow, simple, intuitive, secure, reliable, stable, performant, robust, scalable, responsive, seamless, clear, consistent, large, small. Excluded from flagging: "the system", "the user", "the page" — these are normal JIRA language.
- **`vagueQuantifiers[]`**: some, few, many, several, most, various, frequently, occasionally, sometimes, quickly, etc, "as needed", "as appropriate", "in a timely manner"
- **`undefinedReferences[]`**: "it should", "they should", "this should", "same as before", "existing behavior", "current functionality", "standard way/approach/method"

### Completeness Signals

- **`missingScenarios[]`**: Each entry has `{ type, category, detected }`. Categories: `core` (always relevant) vs `contextual` (bonus when present). Core signal: `error_handling` — patterns include error, fail, invalid, reject, timeout, exception, "what happens if/when". Contextual signals: `boundary_conditions` (max, min, limit, between, digit counts), `user_roles` (admin, manager, role, permission), `empty_null_states` (empty, no data, blank, null, first time, default), `data_validation` (valid, invalid, format, required, optional), `concurrency_state` (concurrent, simultaneous, real-time, sync, cache), `loading_performance` (loading, performance, speed, latency, spinner, progress), `navigation_flow` (redirect, navigate, back button, cancel, breadcrumb, flow, sequence)

### Specificity Signals

- **`specificityIndicators[]`**: Each entry has `{ type, detected, examples[] }`. Types: `numeric_thresholds` (numbers with units), `named_ui_elements` (quoted labels, named button/field/tab), `urls_paths` (URLs, route paths, page references), `data_examples` ("e.g.", "example", "such as", format specs), `named_roles` (admin, manager, editor, viewer, owner), `error_details` (error message/code, status codes 4xx/5xx, displayed error strings)

### Atomicity Signals

- **`atomicityIssues[]`**: Each entry has `{ acText, compoundPatterns[] }`. Detects "and also", "additionally", "; also/and/then" in bullet items. Also flags bullets with 3+ modal verbs (should/must/shall/will/can).

### Consistency Signals

- **`consistencyFlags[]`**: Each entry has `{ type, description }`. Types: `terminology_conflict` (same concept called different names — user vs customer, click vs tap, popup vs modal), `contradictory_acs` (multiple different numeric values for the same concept type)

### Runner Readiness Signals (NOT in scoring weights — downstream only)

- **`runnerReadiness`**: `{ uiObservableRatio, unsupportedActions[] }`. UI-observable pattern checks for: display, show, click, navigate, page, button, field, form, modal, input, dropdown, table, list, menu, tab, screen, dialog, toast, upload, entry point. Unsupported: captcha, biometric, fingerprint, face ID, camera, microphone, drag-and-drop, native/desktop/mobile app. Note: "upload" is NOT unsupported — our product has upload functionality.
- **Purpose:** Consumed by TC Quality Scorer for per-test-case runner readiness assessment. NOT included in requirement quality score.

### Structural Context (shared with extractionHints)

- **`detectedFormat`**, **`requirementType`**, **`userStory`**: Same as extractionHints (shared computation)

---

## Output Contract 3: `structuredContent`

Consumed by Call A. The cleaned, section-labeled description — not pre-extracted candidates.

- **`cleanedDescription`**: Markup-stripped, injection-sanitized full description
- **`sections`**: `{ description, noteBlocks[], dodBlocks[], techBlocks[] }` — separated by section boundary detection
- **`rawDescription`**: Original for reference

---

## Deterministic Scoring — 7 Dimensions

The deterministic layer scores the requirement immediately using lexical signals. This provides an instant score for the UI while Call A + Call B process. Call B can override any dimension score — when it does, it records `{ dimension, deterministicValue, llmValue, reason }`.

### Dimension Weights (v4.2)

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| Clarity | 0.15 | Ambiguity directly impacts test quality |
| Completeness | 0.25 | ↑ Most impactful for generation quality |
| Testability | 0.25 | ↑ Can we actually verify this? |
| Specificity | 0.10 | Nice-to-have; LLM generator compensates |
| Structure | 0.10 | Foundation — is the description organized? |
| Atomicity | 0.10 | Compound ACs produce confused tests |
| Consistency | 0.05 | Contradictions are rare but impactful when present |
| ~~Runner Readiness~~ | ~~removed~~ | Per-TC concern, not per-requirement. Signals still computed for downstream TC Scorer. |

**Total: 1.00**

### Score Bands

| Band | Range | UI Treatment |
|------|-------|-------------|
| Ready | 80-100 | Green badge |
| Good | 65-79 | Blue badge |
| Needs Refinement | 35-64 | Yellow badge |
| Insufficient | 0-34 | Red badge |

Note: Score bands control the visual indicator only. The "Generate" button state is controlled by `computeAdequacyGate()`, not the score.

### Dimension 1: Structure (10%)

**What it measures:** Is the description organized with identifiable sections, user story, and acceptance criteria?

**Rules:**

- **S-01 (critical):** No description or fewer than 20 characters → score 0, cascade suppression (suppress all downstream dimensions)
- **S-01 (major):** Description under 80 characters → score 5
- **S-01:** Description 80-200 characters → score 12; over 200 → score 18
- **S-02 (critical):** No acceptance criteria identifiable (from `estimatedACCount = 0`) → flagged. Note: in v3, this uses the AC count estimate, not extracted ACs — Call A hasn't run yet at this stage
- **S-02 (info):** 1-2 ACs → fine for focused ticket, suggestion to consider more
- **S-02:** 3-5 ACs → score 20; 6-10 → score 25; 11+ → score 22 (slight reduction for potential bloat)
- **S-03 (info):** No user story detected → suggestion only
- **S-04 (info):** No notes/DoD separation → suggestion only
- **S-05:** Bonus +5 for explicit AC header detected
- **S-06 (info):** Mixed format → suggestion to standardize

**Cascade suppression:** If S-01 critical fires (no description), return score 0 and suppress all other dimensions. If S-02 critical fires (no ACs), suppress completeness, testability, specificity, atomicity, consistency.

### Dimension 2: Clarity (15%)

**What it measures:** How unambiguous is the language?

**Rules:**

- Start at 100, deduct for issues found
- If no estimated ACs → neutral score 50 (benefit of doubt)
- **C-01 — Ambiguous terms (two-tier):** Tier 1 matches deduct 5 each (cap -12). Tier 2 matches deduct 3 each only when `qualified = false` (cap -8). Total ambiguity cap: -20
- **C-02 — Vague quantifiers:** Each match deducts 4 (cap -12)
- **C-03 — Undefined references:** Each match deducts 5 (cap -15)
- **C-05 — Conditional without alternative:** Pattern: "if X" without "otherwise/else/fallback". Deducts 4, severity minor
- **C-06 — Contradictory statements:** From consistency flags. Deducts 10, severity major
- **C-07 — Negation-only definition:** "should NOT do X" without stating what it SHOULD do. Deducts 3 each (cap -9)

Removed from v2: C-04 passive voice detection (too noisy).

### Dimension 3: Completeness (25%)

**What it measures:** How much of the problem space is covered?

**Philosophy:** Score what IS there, not what ISN'T. Base score from having coherent estimated ACs. Only `error_handling` (core signal) is universally expected. Others are contextual bonuses.

**Rules:**

- Base score from estimated AC count: 1-2 → 30, 3-5 → 45, 6-10 → 55, 11+ → 50
- **Positive path bonus:** +10 if description contains positive/happy path language (verb patterns indicating expected behavior)
- **Core signal — error_handling:** If detected → +15 bonus. If not detected → minor severity issue (no score deduction from base, but flagged)
- **Contextual signal bonuses:** boundary_conditions +10, user_roles +8, empty_null_states +6, data_validation +6, concurrency_state +4, loading_performance +4, navigation_flow +4. Only awarded when `detected = true`
- **Missed contextual signals:** Grouped into ONE info-level suggestion: "Coverage opportunities: consider adding boundary conditions, empty states, data validation" — not individual issues
- **COMP-RATIO:** If description >100 words but estimatedACCount <3 → deduct 10, minor severity

### Dimension 4: Testability (25%)

**What it measures:** Can each AC produce a pass/fail test?

**Rules:**

- Per-AC scoring: start at 50 per AC, then adjust. Uses `estimatedACCount` and raw description bullets for deterministic pass — Call B re-evaluates with extracted ACs
- **Positive signals** (broad list): displays, shows, returns, exists, appears, opens, triggers, creates, removes, updates, sends, receives, filters, sorts, uploads, downloads, submits, indicates, highlights; state words (enabled, disabled, visible, hidden); numeric values with units; flow arrows (→, ->, >>). Each match +10 (cap +40)
- **Negative signals** (narrow list): "user-friendly", "intuitive", "easy to use", "looks good", "works properly", "refactor", "clean up", "technical debt", plus implementation-focused patterns. Each match -15 (cap -40)
- **T-01 (major):** AC text fewer than 4 words → -30
- **T-02 (major):** Negative signals only, no positive → flagged
- **T-03 (info):** No verifiable outcome detected → -5
- **Score:** Average across all bullet items in AC section

### Dimension 5: Specificity (10%)

**What it measures:** Are concrete details provided?

**Rules — additive from 0:**

- **SP-01 (info):** Numeric thresholds detected → +25
- **SP-02:** Named UI elements detected → +25
- **SP-03:** URLs or paths detected → +10
- **SP-04 (info):** Data examples detected → +15
- **SP-05:** Named roles → +15; user story persona instead → +10; generic "user" only → +5
- **SP-06:** Error message/code details detected → +10
- Cap at 100

### Dimension 6: Atomicity (10%)

**What it measures:** Does each AC cover exactly one thing?

**Rules:** Score 100, deduct per compound pattern in `atomicityIssues[]`. "and also", "additionally", "; also/and/then", 3+ modal verbs = strong signals. Lenient for Gherkin scenarios and parent-with-children blocks.

### Dimension 7: Consistency (5%)

**What it measures:** Does the requirement contradict itself?

**Rules:** Score 100, deduct per consistency flag. Terminology conflict → -5 each. Contradictory numeric values → -10 each. Cap deductions at -30.

### Composite Score

Weighted sum of 7 dimensions. Backend always computes this — LLM is unreliable at arithmetic. If Call B overrides individual dimension scores, the composite is recomputed from the overridden values.

---

## `computeAdequacyGate()` — Post-LLM Deterministic Gate

After Call B returns, the backend computes the adequacy gate. This controls the "Generate" button state — separate from the score badge.

### Core Tier (all 3 must pass)

- **clearIntent:** Call A extracted a clear intent sentence (not null)
- **basicScope:** ≥2 extracted ACs with confidence ≥ "medium"
- **testableActions:** ≥1 AC with acType "behavior" or "error_scenario"

### Enhancement Tier (count of 4)

- **userContext:** User story detected OR persona mentioned in ACs
- **expectedOutcomes:** Call B testability score ≥ 50
- **keyScenarios:** All core coverage signals detected
- **componentAwareness:** Named UI elements or page references present

### Gate Result

- Core tier fails → `NOT_ADEQUATE` → Generate button **disabled**
- Core tier passes + enhancement count ≥ 3 → `ADEQUATE` → Generate button **enabled**
- Core tier passes + enhancement count < 3 → `MARGINAL` → Generate button **warning** ("Generate anyway — requirement has gaps")

---

## How Call B Overrides Deterministic Scores

Call B receives `qualitySignals` + `extractedACs[]` (from Call A). For each dimension:

1. Examine the relevant `qualitySignals` — they suggest a starting score range
2. Apply semantic analysis on the actual extracted ACs to confirm, raise, or lower
3. If the semantic score differs from the signal-suggested score, record in `adjustments[]`

| Dimension | Primary Signals | Call B's Override Role |
|-----------|----------------|-----------------------|
| Clarity | ambiguousTerms, vagueQuantifiers, undefinedReferences | Resolve context — "clear" in "UI clearly indicates" is fine |
| Completeness | missingScenarios | Weight gaps by domain and requirementType. Bug fix with 2 ACs = complete |
| Testability | *(evaluates from extracted ACs)* | Assess each AC for pass/fail criteria |
| Specificity | specificityIndicators | Confirm presence/absence of concrete details |
| Structure | detectedFormat, userStory | Assess organization from extracted AC structure |
| Atomicity | atomicityIssues | Confirm "and" is actually compound vs natural language |
| Consistency | consistencyFlags | Verify conflicts are real contradictions vs intentional |

Call B does NOT score runner readiness. That's a downstream per-TC concern.

---

## Migration Notes for Engineering

**From v2 codebase:**

1. **Keep:** Section boundary detection, user story parsing, all regex constants (ALWAYS_AMBIGUOUS, COVERAGE_SIGNALS, etc.), markup stripping, all `score*()` functions (now produce the deterministic fast-path score)
2. **Remove:** `extractStructure()` (entire AC extraction pipeline — Gherkin grouping, table rows, sub-sections, preamble detection, bullet inference), `consolidateIssues()`, score-based LLM threshold logic, runner readiness from weighted composite
3. **Refactor scoring:** Update weights to v4.2 (clarity 0.15, completeness 0.25, testability 0.25, specificity 0.10, structure 0.10, atomicity 0.10, consistency 0.05). Scoring functions now operate on raw description + `qualitySignals` + `estimatedACCount` instead of extracted ACs
4. **Add:** `computeExtractionHints()`, `computeQualitySignals()` (wraps existing signal computations into structured output), `computeAdequacyGate()`, `requirementType` detection, `structuredContent` passthrough
5. **Wire up:** Deterministic output → Call A input (via `structuredContent` + `extractionHints`), Call B input (via `qualitySignals` + Call A `extractedACs[]`), Call B output → `computeAdequacyGate()` → UI. Deterministic score displayed immediately; Call B score replaces it when available
