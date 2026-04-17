# Prototype v8 — Extended UX Analysis: Wait Times, Assessment Value & Iterative Refinement

**Addendum to:** `Prototype_v8_UX_Analysis.md`
**Status:** Analysis — discuss before implementing

---

## Correction to Previous Analysis

The previous analysis overcorrected by treating the requirement assessment as friction. It's not — it's a necessary quality gate. The real insight is:

**The assessment IS part of the value delivery, not a precursor to it.**

When a user sees "Readiness: 68% — 3 clarifications to improve results," that's already useful information. It tells them their requirement has gaps before they waste 1-3 minutes generating mediocre test cases. This is the Layer 1 ambient signal the entire architecture was designed around.

The correct reframe is not "skip assessment, go straight to generation" but rather: **make the assessment feel instant and lightweight, while making the generation wait productive.**

---

## The Real Timing Problem

### What the specs say vs. what actually happens

| Stage | Spec budget | Real-world observed | Why the gap |
|-------|-------------|---------------------|-------------|
| Deterministic pre-processing | ~15ms | ~15ms | In-process, no gap |
| Document processing (Haiku) | ~1-2s per doc | ~30-60s+ | Large docs, multiple sections, extraction + analysis, retry on parse failures |
| Call A: Extraction (Haiku) | ~150ms | ~5-15s | Larger-than-expected requirements, Haiku cold starts, network overhead |
| Call B: Analysis (Haiku) | ~200ms | ~10-30s | Complex scoring rubric, clarification generation, combined with Call A in practice |
| **Total: Requirement Analyzer** | **~0.5-2s** | **~1-3 minutes** | Sequential calls, doc processing, retries |
| Test Generation (Sonnet) | ~5-15s streaming | **~1-3 minutes** | Larger budgets, complex requirements, Sonnet latency at scale |
| **Total end-to-end** | **~6-17s** | **~2-6 minutes** | Reality vs. theory |

The user is looking at **2-6 minutes of total wait time** across the two stages. This is not a spinner problem — it's a fundamental UX architecture problem.

---

## Critical Assessment: "Show Thought Process" Approach

### The idea

Instead of a spinner or progress bar, show the AI's "thought process" — e.g., "Analyzing requirement structure...", "Extracting testable scenarios...", "Scoring clarity: 72%...", "Generating clarification for ambiguous term 'consistent'..."

### What's good about it

1. **Perceived wait time reduction.** Research consistently shows that showing progress steps makes waits feel 30-40% shorter. A 2-minute wait with status updates feels faster than a 1-minute wait with a spinner.
2. **Builds trust in the AI.** Users see the AI is doing real work, not just spinning. "It found 19 testable scenarios" is more credible than a progress bar hitting 100%.
3. **Educational value.** Users learn what the AI considers important — clarity scoring, scenario extraction, gap detection. Over time, they write better requirements because they understand the assessment framework.
4. **Maps to real pipeline stages.** The architecture actually has distinct stages (pre-processing → doc processing → extraction → analysis → generation). The thought process can be genuine, not entirely artificial.

### What's problematic about it

1. **Artificial steps feel patronizing.** If the "Analyzing requirement structure..." message shows for exactly 3 seconds every time regardless of actual work, power users will notice. The gap between genuine stage transitions and padded messages erodes trust faster than a honest spinner.

2. **It's still a blocking wait.** Whether the user is watching a spinner or watching fake thoughts scroll by, they're still blocked for 1-3 minutes. The thought process makes the wait more tolerable, but doesn't make the user more productive during it.

3. **Incentivizes slow design.** If the UX "solves" long waits by showing pretty animations, there's less pressure to actually optimize the pipeline. The real fix is architectural (parallelism, streaming, background processing), not cosmetic.

4. **Granularity problem.** The pipeline stages don't emit progress at even intervals. Document processing might take 60 seconds, then extraction takes 5 seconds, then analysis takes 20 seconds. The thought process would show "Processing document..." for an uncomfortably long time, then race through the remaining steps. Padding intermediate steps to smooth the progress creates the artificial feel described in point 1.

5. **Error states become confusing.** If the thought process says "Extracting scenarios... found 12" and then the pipeline retries due to a parse error, does the user see "Re-extracting scenarios..."? The more granular the progress reporting, the more visible failures become.

### Verdict

The thought process approach is **a valid component of the solution, but insufficient as the primary strategy.** It should be layered on top of a fundamentally better architecture, not used to paper over a slow pipeline.

---

## Better Solutions: A Layered Approach

### Strategy 1: Decouple Assessment from Generation (Primary fix)

The biggest UX mistake is treating Requirement Analysis and Test Generation as one blocking flow. They serve different purposes at different moments:

| Stage | Purpose | When user needs it | Wait tolerance |
|-------|---------|-------------------|----------------|
| Requirement Analysis | "Is this requirement ready?" | Before deciding to generate | Low — this should feel instant |
| Test Generation | "Give me test cases" | After deciding to generate | Medium — user chose to wait |

**Proposed architecture:**

```
BACKGROUND (triggered on page load or requirement update):
  Requirement Analyzer runs async
  Result cached: readiness score + clarifications + parsed segments
  UI updates when ready (WebSocket or polling)
  
FOREGROUND (triggered by user click):
  Test Generator runs with cached analysis as input
  User chose to wait — thought process appropriate here
```

**Impact:** The readiness score and clarifications appear within seconds of landing on the page (or are already cached from a previous visit). When the user clicks "Generate," only the generation step runs — cutting the wait from 2-6 minutes to 1-3 minutes.

**This is already designed in the architecture** — the Manual Team Scope doc describes the Requirement Analyzer as triggered on page load (background). The prototype just doesn't reflect this yet. The readiness score should already be there when the user arrives.

### Strategy 2: Progressive Value Delivery During Generation (Primary UX fix)

Instead of waiting for all test cases to finish, deliver value incrementally:

```
USER CLICKS GENERATE
      │
      ▼  (~5 seconds)
┌─────────────────────────────────────────────┐
│ ✨ Generating test cases...                  │
│                                              │
│ Analyzing 19 testable scenarios              │
│ Planning coverage for 7 citation types       │
│ Estimated: ~10 test cases                    │
│                                              │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Starting...   │
└─────────────────────────────────────────────┘
      │
      ▼  (~20 seconds — first test case streams in)
┌─────────────────────────────────────────────┐
│ ✨ Generating test cases...  2/~10           │
│                                              │
│ TC-001 Verify View Script Button Present     │
│   [SEG-1] [SEG-2]              ✓  ✗  ✎     │
│                                              │
│ TC-002 Verify Syntax Highlighting...         │
│   [SEG-3]                      ✓  ✗  ✎     │
│                                              │
│ ░░░░░░░░████████░░░░░░░░░░░░ 20%            │
└─────────────────────────────────────────────┘
      │
      ▼  (user can already review TC-001 while generation continues)
```

**Key insight:** The user doesn't need all 10 test cases to start validating. The first 2-3 test cases tell them whether the AI understood the requirement. If they can review and accept/reject while generation continues, the perceived wait drops dramatically.

**Implementation:** The Generator already streams via SSE (documented in the architecture). The frontend should render each test case as it arrives, with review actions enabled immediately. The coverage summary updates live as new tests come in.

This is the **single highest-impact UX improvement** — it converts dead wait time into productive review time.

### Strategy 3: Genuine Stage Indicators (Not Artificial)

Use thought process display, but **only for genuine stage transitions**, not padded fake steps:

```
STAGE INDICATORS (genuine, from pipeline events):

  ✓ Requirement pre-processed              (instant — deterministic)
  ✓ 19 testable scenarios extracted         (~5-15s — Call A)
  ✓ Quality scored: 78% readiness           (~10-30s — Call B)  
  ● Generating test cases (3 of ~10)...     (~1-3 min — Generator, streaming)
    TC-001 streaming in...
```

**Rules for genuine vs. artificial:**
- If you can tie the message to an actual pipeline event (Call A completed, Call B returned a score), it's genuine — show it.
- If you're padding time between events with "Thinking about edge cases..." when the model is actually just processing tokens, it's artificial — don't show it.
- The generation stage is long enough that streaming test cases IS the progress indicator. No need for sub-step messages.

**One exception where "artificial" is acceptable:** The very first few seconds after the user clicks Generate, before any pipeline event fires. A brief "Preparing analysis..." message (2-3 seconds max) is fine as a transition — it confirms the click registered. Beyond that, real events should drive the UI.

### Strategy 4: Cached Assessment + Pre-computation

If the Requirement Analyzer has already run (background on page load), skip it entirely when the user clicks Generate:

```
SCENARIO A: User lands on page, waits 30s, then clicks Generate
  → Analysis already cached
  → Jump straight to generation
  → Wait: 1-3 minutes (generation only)

SCENARIO B: User lands on page and immediately clicks Generate
  → Analysis runs first (no cache)
  → Then generation
  → Wait: 2-6 minutes (full pipeline)
  → But: show assessment results as they arrive, THEN start generation

SCENARIO C: User resolves clarifications, then clicks Generate
  → Re-run analysis with resolved clarifications (fast — no doc reprocessing)
  → Then generation
  → Wait: 1.5-4 minutes
```

**Impact:** For the most common flow (user reads requirement, thinks about it, then generates), the analysis is already done. Only Scenario B has the full wait.

---

## Iterative Refinement: Regenerate with Context

### The need

After reviewing generated test cases, the user may want to:
1. **Regenerate all** — "These are all too generic, try again with more detail"
2. **Regenerate specific** — "TC-003 doesn't make sense, give me a different one"
3. **Regenerate with refinement** — "Generate again, but focus on error handling scenarios and consider that we use GitHub Enterprise"

The current prototype has Regenerate per test card but no way to provide refinement context.

### Proposed refinement model

```
┌─ Regenerate Options ─────────────────────────────────────────┐
│                                                               │
│ ○ Regenerate this test                                        │
│   (same context, different output)                            │
│                                                               │
│ ○ Regenerate with refinement                                  │
│   ┌───────────────────────────────────────────────────────┐  │
│   │ Focus on error handling. Consider that we use GitHub  │  │
│   │ Enterprise with SSO. The PAT setup guide should link  │  │
│   │ to our internal wiki.                                 │  │
│   └───────────────────────────────────────────────────────┘  │
│   [Regenerate]                                                │
│                                                               │
│ ○ Regenerate all with refinement                              │
│   (same input as above, but for all pending/rejected tests)   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Where refinement context lives in the pipeline

The Generator already accepts `additionalContext` in its input. Refinement text gets appended to this field on regeneration. The key data flow:

```
First generation:
  Generator({ requirement, extractedACs, issues, config, existingTestCases: [] })

Regenerate-with-refinement (single test):
  Generator({
    requirement,
    extractedACs,
    issues,
    config,
    existingTestCases: [all accepted tests],  // avoid duplicates
    additionalContext: "Focus on error handling...",
    regenerateTarget: { testId: "TC-003", reason: "Too generic" }
  })

Regenerate-all-with-refinement:
  Generator({
    requirement,
    extractedACs,
    issues,
    config,
    existingTestCases: [all accepted tests],
    additionalContext: "Focus on error handling...",
    targetCoverage: "comprehensive"
  })
```

### UX for refinement

Two interaction patterns:

**Pattern A: Inline refinement (per test card)**
The "Regen" button on each test card expands a small text input inline. Type refinement → click Regenerate. Good for targeted fixes.

**Pattern B: Global refinement (batch)**
A "Refine & Regenerate" button at the top of the review panel opens a modal or expandable section with a larger text area. Applies to all pending/rejected tests. Good for changing the overall direction.

**Pattern C: Kai bridge (complex refinement)**
"Ask Kai to improve these tests" opens Kai with the current test set + coverage map as context. The user can have a conversation about what's wrong and what they want. Kai calls the regeneration pipeline with the refined context. Good for when the user can't articulate the fix in a text box.

**Recommendation:** Build A and B for the prototype. C exists by virtue of the Kai escape hatch.

---

## Revised User Journey (Incorporating All Corrections)

```
STEP 0: BACKGROUND (before user arrives)
  Requirement Analyzer runs on page load / requirement update
  Caches: readiness score, parsed segments, clarifications
  Time: 1-3 minutes, but user doesn't wait — it's async

STEP 1: LAND (~0 seconds active wait)
  User opens requirement page
  Sees original requirement content (Details tab)
  Sees "Test Cases" tab with ambient indicator:
    "✨ Readiness: 78% — 2 clarifications available"
  If analysis still running: "✨ Analyzing requirement..."
  
  User can read the requirement while assessment completes.
  This is NOT wasted time — they're doing what they'd normally do.

STEP 2: ASSESS (0-1 clicks, ~5 seconds)
  User clicks "Test Cases" tab
  Sees readiness score, clarification cards, parsed segments summary
  DECISION POINT: Generate now (accept 78% quality) or refine first?
  
  If refine: resolve clarifications, add free-text context, upload docs
  If generate now: click Generate (score will affect output quality)

STEP 3: GENERATE (1 click, then progressive delivery)
  User clicks Generate
  Stage indicators show genuine pipeline progress
  First test case streams in after ~15-30 seconds
  User starts reviewing immediately while more tests arrive
  Coverage summary updates live
  
  The wait is 1-3 minutes total, but the user is PRODUCTIVE
  after the first ~20 seconds.

STEP 4: VALIDATE (glance + hover, ~10 seconds)
  Coverage summary bar: "10 tests • 14/19 segments • 5 gaps"
  User can see at a glance: is this good enough?
  Hover a test → source segments highlight (secondary validation)
  
STEP 5: REVIEW (per-test, ongoing)
  Accept / Reject / Edit each test
  Coverage bar updates live as tests are accepted/rejected
  Thumbs up/down for quality signal

STEP 6: ITERATE (if needed)
  "Generate More" → covers remaining gaps
  "Regenerate with refinement" → retry with user guidance
  "Ask Kai" → conversational help for complex refinement
  
  Each iteration only runs the Generator (~1-3 min), not the
  full pipeline — assessment is already cached.

STEP 7: SAVE
  Save accepted tests to requirement
  Traceability data persists (citation links)
```

### Time-to-value comparison

| Journey | First value moment | Full completion |
|---------|-------------------|-----------------|
| Current prototype | ~60s (after scrolling + clicking Generate + waiting) | ~4-6 min |
| Previous analysis (overcorrected) | ~15s (but skipped assessment) | ~2-4 min |
| **This analysis** | **~20-30s** (first test streams in while generating) | **~3-5 min** |

The 20-30 second mark is where the first test case appears. The user hasn't saved any time on the pipeline — but they've converted 2+ minutes of dead wait into productive review time.

---

## Summary of Positions

| Topic | Position |
|-------|----------|
| Requirement assessment | Essential quality gate — keep it, but run it in background on page load |
| Readiness score | Layer 1 ambient — should be visible when user arrives, not after a click |
| Thought process display | Genuine stage indicators yes, artificial padding no. Streaming test cases are the real progress indicator. |
| Long wait times | Primary fix is progressive streaming delivery. Secondary fix is background pre-computation. Thought process is tertiary. |
| Iterative refinement | Three patterns: inline per-test, global batch, Kai bridge. All use the same `additionalContext` pipeline field. |
| Free-text context | Add before doc upload — lowest friction way to improve generation quality. Persists across regenerations. |
| Original vs. parsed content | Original is primary. Parsed segments are an AI analysis overlay, shown on demand. |
| Coverage summary | Persistent bar, always visible after generation starts. Updates live during review. |

---

## Open Question for Monday

**Background analysis timing:** The architecture doc says the Requirement Analyzer triggers on page load. But with 1-3 minute analysis times, is it acceptable to auto-trigger this for every requirement page view? This has cost implications (Haiku calls per page load) and UX implications (analysis may not be ready when user wants to generate). 

Options:
1. **Auto-trigger on page load** — always fresh, but adds API cost and may still not be ready when user clicks Generate
2. **Trigger on first "Test Cases" tab click** — lazy evaluation, only pay for interested users
3. **Cache with TTL** — run once, cache for 1 hour, invalidate on requirement edit
4. **Explicit trigger** — user clicks "Analyze" button, then sees results, then decides to generate

Recommendation: Option 3 (cache with TTL) for the common case, with Option 2 as the first-load fallback. This means most return visits see instant assessment, and first visits see a brief loading state that resolves while the user reads the requirement content.
