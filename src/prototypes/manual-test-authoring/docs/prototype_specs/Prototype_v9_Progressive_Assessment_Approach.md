# The Wait Problem: Progressive Assessment via Deterministic Fast Path

**Addendum to:** `Prototype_v8_UX_Analysis.md` and `Prototype_v8_Extended_UX_Analysis.md`
**Status:** This is the approach — discuss, then build into v9 prototype

---

## The Actual Problem, Stated Precisely

The user lands on the Requirement Detail page. The Requirement Analyzer fires. It takes 1-2 minutes. During that time, the user sees... what?

If the answer is "a spinner" — they leave. If the answer is "fake thought bubbles" — they learn to distrust the UI. If the answer is "nothing, generate is grayed out" — they're blocked.

This is not a cosmetic problem. It's a structural problem with how the UI renders pipeline output.

---

## The Answer Is Already in the Architecture

The Requirement Scoring Pipeline v3 spec contains this line:

> *"Deterministic score displayed immediately; Call B score replaces it when available."*

And the timing model:

| Stage | Cost | Time | What it produces |
|-------|------|------|------------------|
| **Deterministic layer** | **$0** | **<30ms** | qualitySignals, extractionHints, deterministicScore, structuredContent, detectedFormat, requirementType, userStory, sectionLabels |
| Call A (Haiku) | ~$0.00013 | 5-15s (real) | extractedACs[], clearIntent |
| Doc Processor J1 | ~$0.00035 | 30-60s (real) | documentContext (if attachment present) |
| Call B (Haiku) | ~$0.00020 | 10-30s (real) | LLM-refined score, clarifications[], scenarioCoverage, adequacy |

The deterministic layer produces **meaningful, actionable output in under 30 milliseconds**. The prototype has been treating the entire assessment as one atomic operation that either shows everything or shows nothing. That's wrong. The architecture was designed for progressive delivery — the implementation and prototype just haven't caught up.

---

## What the User Gets at Each Tier

### Tier 0 — Instant (<30ms after page load)

From the deterministic layer alone, the user sees:

```
┌─ AI Assessment ──────────────────────────────────────┐
│                                                       │
│  Readiness: 62%  ████████░░░░  Needs Refinement      │
│  ──────────────────────────────────────────────────── │
│                                                       │
│  Structure: bullet_hierarchical • Feature • 19 items  │
│                                                       │
│  ⚠ 3 ambiguous terms: "consistent", "smoothly",     │
│    "without performance degradation"                  │
│                                                       │
│  ⚠ Missing scenario coverage:                        │
│    ○ error handling   ○ boundary conditions           │
│    ● empty/null states  ● data validation             │
│                                                       │
│  ✓ Has user story  ✓ Has specific UI elements        │
│  ✓ Has numeric thresholds (10,000 lines, 2 seconds)  │
│                                                       │
│  [Generate Now (62%)]     Analyzing for better... ◌   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

This is genuinely useful. The user can immediately see:
- Their requirement scores 62% on structural quality
- Three specific ambiguous terms are flagged
- Error handling and boundary scenarios are detected as missing
- Good signals: has a user story, has numeric thresholds, has named UI elements
- They CAN generate right now, accepting 62% quality — or wait for the LLM to finish

**None of this required an LLM call.** It's regex, pattern matching, and weighted scoring. It runs in the time it takes to render the page.

### Tier 1 — Enhanced (~1-2 minutes, progressive)

As LLM stages complete, the UI progressively updates:

**After Call A completes (~5-15s):**
```
  Score updated: 62% → refining...
  
  19 testable scenarios extracted:                    ← NEW
    6 behavior • 5 edge_case • 6 error_handling      ← NEW
    1 constraint • 1 happy_path                       ← NEW
```

The extracted scenarios appear. The structure preview becomes concrete. The user starts to see what the AI understood from their requirement.

**After Call B completes (~10-30s more):**
```
  Readiness: 62% → 74%  ████████████░░  Good         ← UPDATED
  (LLM refined: clarity 60→72, testability 55→78)    ← NEW
  
  2 clarifications to improve results:                ← NEW
    ⚠ What Git hosting services should be supported?
      [GitHub only] [GitHub + GitLab] [All three]
    ⚠ Should script caching persist across sessions?
      [Per-view] [Cache 24h] [Until next execution]
  
  Adequacy: MARGINAL — can generate, quality improves ← NEW
  with clarification resolution
```

**After Doc Processor completes (if attachment present, ~30-60s):**
```
  📄 design_spec.pdf processed                       ← NEW
    Found: 3 relevant rules, 2 scenarios, 1 conflict  ← NEW
  
  Readiness: 74% → 81%  ████████████████░  Ready     ← UPDATED
```

Each update is a real event from a real pipeline stage. Nothing is artificial. The score literally changes as better information arrives.

### Tier 2 — Generation (user-triggered, ~1-3 minutes)

The user clicks Generate at whatever tier they're comfortable with. They can:
- **Generate at Tier 0** (instant, before LLM finishes): Lower quality, but fast feedback. Good for "let me see what this thing does" — the exploration/trial use case.
- **Generate at Tier 1** (after LLM but before clarifications): Moderate quality. Common case for users who don't want to resolve clarifications.
- **Generate at Tier 1 + refinement** (after resolving clarifications + adding context): Best quality. The recommended path, but never forced.

---

## Why This Solves the Wait Problem

The wait problem isn't "the pipeline is slow." The pipeline IS slow and we can't fix that in April. The wait problem is "the user has nothing to look at or interact with while the pipeline runs."

With progressive assessment:

| Time | What the user sees | What they can do |
|------|-------------------|------------------|
| 0-30ms | Deterministic score, structural analysis, flagged issues | Read requirement, note the flagged issues, decide whether to generate immediately |
| 30ms-15s | Score refining indicator, then extracted scenarios appear | Review extracted scenarios against original requirement, start understanding AI's interpretation |
| 15s-60s | Clarifications appear, score updates | Resolve clarifications (one-click), add free-text context, upload documents |
| 60s-120s | Document processing completes (if applicable), final score | Score is finalized, user is fully informed, can generate with confidence |

At no point is the user staring at a spinner. From the first 30 milliseconds, they have something meaningful to look at and react to. The question shifts from "when does the assessment finish?" to "am I ready to generate yet?" — and the answer can be "yes" at any point.

---

## The "Generate Anyway" Escape Hatch

This is critical for the fastest-path-to-value concern from the previous analysis. Some users will land on the page and immediately click Generate without waiting for any assessment. That's valid. The UI should support it:

```
┌─ Before LLM completes ──────────────────────────────┐
│                                                       │
│  [Generate Now (62%)]                                │
│  Deterministic assessment only.                       │
│  AI analysis running — wait 30s for better results.   │
│                                                       │
└───────────────────────────────────────────────────────┘

┌─ After LLM completes ───────────────────────────────┐
│                                                       │
│  [Generate (74%)]  [Resolve 2 clarifications first]  │
│                                                       │
└───────────────────────────────────────────────────────┘
```

The Generate button is NEVER disabled. The score next to it tells the user what quality tier they're generating at. If they want to wait — the UI is actively showing them why waiting helps (new signals appearing, score improving). If they don't — they click and go.

This addresses both the "fastest path to value" user AND the "I want the best results" user with the same UI. No mode switching, no gating.

---

## What This Means for the "Thought Process" Question

With progressive assessment, the thought process question resolves itself:

**The progressively updating assessment IS the thought process.** The user watches the deterministic score land at 62%, then sees "Analyzing for better results..." with a subtle indicator, then watches extracted scenarios appear, then sees clarifications populate, then watches the score update to 74%. Each of these is a genuine pipeline event with genuine new information.

There's no need for artificial "Thinking about edge cases..." messages because the real outputs are arriving frequently enough to maintain engagement. The only gap where a status message helps is the 5-15 second window between the deterministic layer (instant) and Call A completing (first LLM result). A single genuine message works there:

```
✓ Structural analysis complete (62%)
● Extracting testable scenarios...        ← genuine: Call A is running
```

After that, extracted scenarios appearing IS the progress indicator. Then clarifications appearing IS the next progress indicator.

For the generation phase (1-3 minutes), the previous analysis was right: **streaming test cases are the progress indicator.** The first test case appearing after ~20-30 seconds converts dead wait to productive review time.

---

## Iterative Refinement in This Model

With progressive assessment, the refinement loop becomes natural:

```
LOOP 1: Generate at Tier 0 (62%, no clarifications resolved)
  → 10 test cases, some generic
  → User reviews: "These are okay but miss the error handling scenarios"
  → User resolves clarification about Git hosting
  → User types free-text: "Focus on error handling, we use GitHub Enterprise"
  → Clicks "Regenerate with refinement"
  
LOOP 2: Regenerate with refined context
  → Generator receives: original requirement + resolved clarifications + user context
  → existingTestCases = [accepted tests from Loop 1]
  → Produces better, more targeted test cases
  → Coverage bar updates: 14/19 → 17/19
  
LOOP 3 (optional): "Generate More" for remaining gaps
  → Covers the last 2 uncovered segments
  → User is done
```

Each loop only runs the Generator (~1-3 min), not the full pipeline. The assessment is cached. Clarification resolutions and free-text context are additive — they accumulate across loops.

The per-test regeneration ("this specific test is wrong") follows the same pattern but scoped to one test:

```
User clicks "Regen" on TC-003 → expand inline:
  ┌─────────────────────────────────────────────┐
  │ What's wrong with this test?                 │
  │ ┌─────────────────────────────────────────┐ │
  │ │ The auto-scroll test doesn't cover the  │ │
  │ │ case where execution log has no line ref │ │
  │ └─────────────────────────────────────────┘ │
  │ [Regenerate]  [Cancel]                       │
  └─────────────────────────────────────────────┘

Generator receives:
  regenerateTarget: { testId: "TC-003" }
  additionalContext: "The auto-scroll test doesn't cover..."
  existingTestCases: [all other accepted tests]
```

---

## Revised UI Architecture for v9 Prototype

```
REQUIREMENT DETAIL PAGE (single page, not tabs)
│
├── Page Header (title, metadata — standard)
│
├── AI Assessment Bar (ALWAYS VISIBLE after first 30ms)
│   ├── Readiness score (deterministic → LLM-refined)
│   ├── Quick signals (ambiguous terms, missing scenarios)
│   ├── "Analyzing..." indicator (while LLM stages run)
│   ├── Depth toggle [⚡Quick | 🔍Thorough]
│   └── [Generate] button (NEVER disabled, shows current score %)
│
├── Expandable: Clarifications (appears when Call B completes)
│   ├── One-click options per clarification
│   └── "Add context" free-text + doc upload
│
├── Main Content (split view AFTER generation starts)
│   ├── Left: Original requirement content
│   │   ├── Full ticket text (user story, details, scenarios)
│   │   ├── Inline highlights on hover (segments ↔ test cases)
│   │   └── Collapsible: "AI Analysis — 19 segments parsed"
│   │
│   └── Right: Generated test cases (streaming)
│       ├── Coverage summary bar (updates live)
│       ├── Test case cards with citations, review actions, 👍👎
│       ├── Per-test: Regen / Regen with refinement (inline text input)
│       └── Global: "Generate More" / "Regenerate All with refinement"
│
├── Before generation: Full-width requirement content
│   (no split view needed — right panel is empty)
│
└── Kai floating button (escape hatch, always available)
```

The key insight for layout: **before the user generates, the page looks like a normal requirement detail page** with an AI assessment bar at the top. The split view only appears when there are test cases to show. This means the requirement content has full width by default, and the user doesn't feel like they're on a "generation page" — they're on a requirement page that happens to have AI capabilities.

---

## Summary of Positions (Updated)

| Topic | Previous position | Corrected position |
|-------|------------------|-------------------|
| Assessment timing | "Run in background, show when ready" | **Show deterministic score instantly (<30ms), progressively enhance with LLM results** |
| Generate button | "Enable after assessment completes" | **Never disable. Show current quality tier. User chooses when to generate.** |
| Wait during assessment | "Show thought process" | **Progressive real output IS the thought process. No artificial steps needed.** |
| Wait during generation | "Show thought process + streaming" | **Streaming test cases are the primary progress indicator. Genuine stage markers for the first 20s.** |
| Page layout before generation | "Split view with left panel for requirement" | **Full-width requirement page. Split view appears when generation starts.** |
| The 1-2 minute Analyzer wait | "Blocking problem to solve" | **Not blocking if deterministic output appears instantly. User can generate at any point during the progressive refinement.** |

---

## What the Prototype v9 Needs to Demonstrate

1. **Instant deterministic assessment** — score, signals, structure appear on page load
2. **Progressive LLM enhancement** — extracted scenarios appear, then clarifications, then refined score, each updating the UI in-place
3. **Generate-at-any-tier** — button always enabled, shows current score
4. **Streaming test generation** — first test appears while generation continues, review enabled immediately
5. **Iterative refinement** — per-test regen with text input, global regen with context, coverage-driven "generate more"
6. **Full-width → split view transition** — page starts as normal requirement view, splits when tests arrive

This is the approach. The architecture already supports it — the deterministic layer was designed for exactly this purpose. The prototype just needs to reflect the progressive model rather than the all-or-nothing model.
