# AI Test Case Generator — Finalized UX Analysis

**Owner:** Hà Nguyễn · **Version:** Final (pre-prototype v9) · **Date:** March 2026
**Supersedes:** `Prototype_v8_UX_Analysis.md`, `Prototype_v8_Extended_UX_Analysis.md`, `Prototype_v9_Progressive_Assessment_Approach.md`
**Production reference:** Requirement Detail page screenshot (TO-14297)

---

## 1. Current State — What Exists Today

### Production Page Layout

The Requirement Detail page has a fixed split layout:

```
┌──────┬──────────────────────────────────────────────────────────────┐
│      │ TestOps - RA ▾                                    ✨Ask Kai │
│ Side │ Plans > TO-14297                                            │
│ bar  │ Combine Live Monitor/Analytics & Trends Dashboard           │
│      │ Tester: Unassigned • Test Cases 2 • Story • Sprint ...      │
│ 40px │                    [+ Create Test] [🔗 Link Test] [✨ Gen]  │
│      ├───────────────┬──────────────────────────────────────────────┤
│      │ Requirement   │ Test Case List                              │
│      │ Description   │ ┌──────────────┬──────┬────────┬────────┐  │
│      │               │ │ NAME         │ TYPE │ STATUS │ AUTHOR │  │
│      │ Problem       │ ├──────────────┼──────┼────────┼────────┤  │
│      │ • bullet...   │ │ TC-129... ✦  │ AUTO │ PUBLI  │   ✦    │  │
│      │ • bullet...   │ │ TC-129... ✦  │ AUTO │ PUBLI  │   ✦    │  │
│      │               │ ├──────────────┴──────┴────────┴────────┤  │
│      │ Proposal      │ │ Add Test Case                    [Add]│  │
│      │ paragraph...  │ └───────────────────────────────────────┘  │
│      │   ~300px      │              flex-1                        │
└──────┴───────────────┴──────────────────────────────────────────────┘
```

### What Works

- Split layout gives equal visibility to requirement content and test cases
- "✨ Generate Tests" button is already in the action bar — no need to invent an entry point
- Requirement description is free-form sections (Problem, Proposal, etc.) — not constrained to user story format
- Existing linked test cases visible on load — user sees current coverage immediately
- "Add Test Case" inline row at the bottom of the list for manual creation
- Standard TestOps shell (sidebar, breadcrumb, Ask Kai) is consistent

### What's Missing (for AI Test Generation)

| Gap | Severity | Impact |
|-----|----------|--------|
| No quality assessment of the requirement before generation | 🔴 | User generates from poor requirement → poor test cases → lost trust |
| No inline AI interaction surface — clicking ✨ Generate Tests has no intermediate step | 🟡 | No opportunity to refine, add context, or resolve ambiguities before generation |
| No feedback mechanism on generated test cases | 🟡 | No learning loop, no quality signal |
| No coverage visibility (which scenarios are tested, which aren't) | 🟡 | User can't validate completeness without manual inspection |
| No traceability between test cases and requirement segments | 🟡 | Cristiano's "traceability is weak" feedback — user can't verify test derivation |
| No iterative refinement flow (regenerate, add context, retry) | 🟡 | First generation is take-it-or-leave-it |

---

## 2. User Journey — Complete Touchpoint Map

### Primary persona

QA Engineer or Test Lead with a requirement in Jira, synced to TestOps. They want AI-generated test cases that are good enough to review and publish, not rewrite from scratch.

### Journey with every touchpoint assessed

```
TOUCHPOINT 1          TOUCHPOINT 2          TOUCHPOINT 3
   LAND            →    ASSESS           →    REFINE (optional)
                                              
TOUCHPOINT 4          TOUCHPOINT 5          TOUCHPOINT 6
   GENERATE        →    REVIEW           →    ITERATE (optional)
                                              
TOUCHPOINT 7
   SAVE
```

---

### Touchpoint 1: LAND — User Opens Requirement Detail Page

**What happens:** User navigates to a requirement. Page loads with description on left, existing test cases on right. The "✨ Generate Tests" button is visible in the action bar.

**New with AI (Tier 0 — instant, <30ms):**

The deterministic pre-processor runs synchronously on page load. An AI Assessment indicator appears below the page header or at the top of the requirement description panel:

```
┌─ ✨ AI Assessment ─────────────────────────────────────────────────┐
│ Readiness: 62%  ████████░░░░  Needs Refinement                    │
│ Structure: 19 items • Feature • Hierarchical bullets               │
│ ⚠ 3 ambiguous terms  • ○ Missing: error handling, boundaries      │
│ ✓ Has user story  ✓ Has numeric thresholds  ✓ Has named elements  │
│                                                         Refining ◌ │
└────────────────────────────────────────────────────────────────────┘
```

**Critical design decision:** This is NOT an empty "loading..." state. The deterministic layer produces real signals in <30ms: quality score, detected ambiguous terms, missing scenario categories, structural analysis. The user sees meaningful information the moment the page renders.

**Background:** The LLM stages (Call A extraction, Call B analysis, Doc Processor) begin running asynchronously. Their results will progressively update this indicator over the next 1-2 minutes. But the user is NOT waiting — they have content to read and an initial assessment to react to.

**User state:** Reading the requirement, glancing at the assessment, noticing flagged issues. Already forming a mental model of whether this requirement is ready for test generation.

**Risk if we get this wrong:** If the assessment bar shows "Loading..." or a spinner instead of the instant deterministic output, we've lost the architectural advantage. The entire progressive model depends on Tier 0 being genuinely instant and genuinely useful.

---

### Touchpoint 2: ASSESS — Progressive Enhancement (5s–2min, async)

**What happens:** While the user reads the requirement, the LLM stages complete one by one. Each updates the assessment indicator in-place.

**After Call A completes (~5-15s):**
```
  ✓ 19 testable scenarios extracted                           ← NEW
    6 behavior • 5 edge_case • 6 error_handling • 1 constraint • 1 happy_path
  Score refining...                                           ← UPDATED
```

**After Call B completes (~10-30s more):**
```
  Readiness: 62% → 74%  ████████████░░  Good                 ← UPDATED
  
  2 clarifications available:                                 ← NEW
    ⚠ What Git hosting services? [GitHub] [+GitLab] [All 3]
    ⚠ Script caching model? [Per-view] [24h cache] [Per-exec]
```

**After Doc Processor (if attachment, ~30-60s more):**
```
  📄 design_spec.pdf processed • 3 rules, 2 scenarios found  ← NEW
  Readiness: 74% → 81%  ████████████████░  Ready             ← UPDATED
```

**Critical design decision:** Each update is a genuine pipeline event — not an artificial animation. The score literally changes because new information arrived. The clarifications appear because the LLM identified real ambiguities. Nothing is padded or fake.

**User state:** The user is reading the requirement and periodically glancing at the assessment as it enriches. They're building confidence in whether to generate now or refine first. At any point during this phase, they CAN click Generate — the button is never disabled.

**Risk if we get this wrong:** If updates arrive all at once after 2 minutes (batch response), we lose the progressive feel. The backend must emit stage-by-stage results via WebSocket or SSE, not wait for the full pipeline to complete.

---

### Touchpoint 3: REFINE — Optional Pre-Generation Context (user-initiated)

**What happens:** The user decides to improve generation quality before clicking Generate. Three refinement channels, all optional:

**3a. Clarification resolution (one-click):**
Clarification cards appear after Call B completes. Each has 2-4 suggestion buttons. User clicks one → resolved. Score updates.

**3b. Free-text context input:**
User expands "Add context" and types additional information: "This feature reuses our existing code editor component. We use GitHub Enterprise with SSO. Performance baseline is the current GitHub file viewer."

This maps to the Generator's `additionalContext` field. It persists across regenerations within the session.

**3c. Document upload:**
User uploads a design spec, PRD, or related doc. Document Processor extracts relevant rules and scenarios. Score updates.

**Layout for refinement (expandable, below AI Assessment bar):**

```
┌─ Refine (optional) ───────────────────────────────────────────────┐
│                                                                    │
│ ⚠ What Git hosting services?                                     │
│   [GitHub only] [GitHub + GitLab] [All three]     ✓ Resolved      │
│                                                                    │
│ ⚠ Script caching model?                                          │
│   [Per-view] [Cache 24h] [Until next execution]                   │
│                                                                    │
│ Additional context:                                                │
│ ┌────────────────────────────────────────────────────────────────┐│
│ │ e.g., related features, constraints, team conventions...       ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                    │
│ 📎 Add documents [Optional]                                       │
└────────────────────────────────────────────────────────────────────┘
```

**Critical design decision:** Free-text context comes FIRST (lowest friction), then document upload (higher effort). Clarifications are above both because they're the most impactful for generation quality with the least user effort.

**User state:** Actively choosing to invest time for better results. OR skipping entirely and clicking Generate immediately. Both paths are valid.

**Risk if we get this wrong:** If refinement is mandatory or feels mandatory (gating the Generate button, showing "low score" warnings), users who just want to try the feature will bounce. The assessment should inform, not block.

---

### Touchpoint 4: GENERATE — User Triggers Generation

**What happens:** User clicks "✨ Generate Tests" (in the action bar) or a "Generate" button within the AI Assessment bar.

**Entry point design:**

Two valid trigger points for the same action:
1. **Action bar button (existing):** "✨ Generate Tests" — always visible
2. **AI Assessment bar button (new):** Shows current score — "Generate (74%)" — provides context about quality tier

Both trigger the same pipeline. The action bar button is the primary affordance (existing, discoverable). The assessment bar button adds the quality context.

**What the user sees during generation:**

```
Right panel transitions from "Test Case List" to "Generating" mode:

┌─ Test Case List ───────────────────────────────────────────────────┐
│ NAME                                   TYPE      STATUS    AUTHOR  │
├────────────────────────────────────────────────────────────────────┤
│ TC-12945274 Verify created test case   AUTOMATED PUBLISHED   ✦    │
│ TC-12945272 Verify linked unlinked TC  AUTOMATED PUBLISHED   ✦    │
├────────────────────────────────────────────────────────────────────┤
│ ✨ AI Generating... (2/~10)                                        │
│ ████████░░░░░░░░░░░░░░░░░░░░ Extracting scenarios...              │
├────────────────────────────────────────────────────────────────────┤
│ TC-NEW-001 Verify View Script Button   MANUAL    DRAFT      AI    │
│   [SEG-1][SEG-2]              [✓ Accept] [✗ Reject] [✎ Edit]     │
│                                                                    │
│ TC-NEW-002 Verify Syntax Highlighting  MANUAL    DRAFT      AI    │
│   [SEG-3]                     [✓ Accept] [✗ Reject] [✎ Edit]     │
│                                                                    │
│ ... more streaming in ...                                          │
└────────────────────────────────────────────────────────────────────┘
```

**Critical design decisions:**

1. **Generated tests appear in the SAME list as existing tests,** separated by an "AI Generating" section divider. No separate panel. This preserves the existing mental model.

2. **Streaming delivery:** First test case appears after ~15-30 seconds. User can begin reviewing TC-001 while TC-002, TC-003, etc. stream in. This converts 1-3 minutes of dead wait into productive review time.

3. **Genuine stage indicators during the first 15-30s** (before tests start arriving):
   - "Extracting scenarios..." → genuine, Call A running
   - "Scoring quality..." → genuine, Call B running
   - "Generating test cases..." → genuine, Generator starting
   After the first test streams in, the streaming tests themselves ARE the progress indicator.

4. **Each generated test shows:** Citation badges (linking to requirement segments), review actions (Accept/Reject/Edit), type (MANUAL), status (DRAFT), author (AI badge).

**User state:** Watching tests arrive, starting to review the first ones. Actively engaged — not passively waiting.

**Risk if we get this wrong:** If all tests appear at once after 3 minutes, the wait feels unbearable. The streaming model is not a nice-to-have — it's the primary mechanism for making generation tolerable.

---

### Touchpoint 5: REVIEW — Inline Test Case Assessment

**What happens:** User reviews each generated test case directly in the test case list. Three actions per test: Accept, Reject, Edit.

**Review inline on each card:**

```
┌────────────────────────────────────────────────────────────────────┐
│ TC-NEW-003 Verify Auto-Scroll to Failing Line                     │
│ [positive] [high]  [SEG-4: Happy Path]                            │
│                                                                    │
│ Steps:                                                             │
│ 1. Open a failed test result with line reference in log           │
│ 2. Click "View Script"                                            │
│ 3. Verify viewport auto-scrolls to the failing line              │
│ +1 more                                                           │
│                                                                    │
│ [✓ Accept] [✗ Reject] [✎ Edit] [↻ Regen ▾]     [👍] [👎]        │
└────────────────────────────────────────────────────────────────────┘
```

**Coverage summary bar (appears above generated tests once generation starts):**

```
┌─ Coverage ──────────────────────────────────────────────────────────┐
│ ██████████████░░░░░░ 14/19 segments • 5 gaps  [Show Gaps ▾]       │
│ ● Requirement (2/2) ● Happy Path (1/1) ● Acceptance (3/3)        │
│ ○ Edge Case (4/6)  ○ Error Handling (3/6) ● Constraint (1/1)     │
└─────────────────────────────────────────────────────────────────────┘
```

**Coverage bar updates live** as tests are accepted/rejected. Rejecting the only test covering SEG-8 turns Edge Case from 4/6 to 3/6. This gives the user real-time coverage impact feedback.

**Hover interaction (secondary):** Hovering a test card highlights its source segments in the requirement description on the left. Hovering a segment in the requirement highlights which tests cover it. This is the traceability validation — secondary to the summary bar but powerful for verification.

**Critical design decisions:**

1. **Coverage summary is the PRIMARY traceability mechanism** — always visible, at-a-glance. Hover highlighting is secondary.
2. **Review happens inline in the test case list** — no separate review panel that takes over the screen.
3. **Accept All button** available for users who trust the output. Individual review for those who don't.
4. **👍👎 on every test** — mandatory per design system, feeds back to quality improvement.

**User state:** Actively evaluating test quality. Comparing generated tests against the requirement on the left. Using coverage bar to gauge completeness.

**Risk if we get this wrong:** If review requires navigating away from the list view, or if coverage is only visible after saving, the user can't make informed accept/reject decisions in context.

---

### Touchpoint 6: ITERATE — Regenerate with Refinement (optional)

**What happens:** User isn't satisfied with some results and wants to improve them.

**Three iteration patterns:**

**6a. Per-test regeneration (inline):**
User clicks "↻ Regen" dropdown on a specific test card:
```
┌─ Regenerate TC-003 ────────────────────────────────────────────┐
│ ○ Regenerate (same context, new output)                        │
│ ○ Regenerate with refinement:                                  │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │ Should also cover the case where execution log has no    │ │
│   │ line reference at all                                    │ │
│   └──────────────────────────────────────────────────────────┘ │
│   [Regenerate]                                                 │
└────────────────────────────────────────────────────────────────┘
```

**6b. Generate More (coverage-driven):**
User clicks "Generate More" from the coverage bar gaps view. Runs Generator with `existingTestCases = [all accepted tests]` and `targetCoverage: 'comprehensive'`. Produces tests for uncovered segments only.

**6c. Regenerate All with refinement (global):**
User provides global context ("Focus more on error handling, these tests are too generic for the happy path") and regenerates all pending/rejected tests. Accepted tests are preserved.

**6d. Kai bridge (complex):**
"Ask Kai about these tests" opens Kai with the full context: requirement, generated tests, coverage map, user's refinement notes. For cases where the user can't express the fix in a text box.

**Critical design decision:** Each iteration only runs the Generator (~1-3 min), NOT the full Analyzer pipeline. Assessment is cached. Clarification resolutions and free-text context accumulate across iterations.

**User state:** Refining specific tests or expanding coverage. Each iteration is faster than the first generation because the assessment step is skipped.

---

### Touchpoint 7: SAVE — Persist Generated Tests

**What happens:** User clicks "Save N Tests to Requirement" or tests are auto-saved on Accept.

**Two save models to decide between:**

| Model | Behavior | Pro | Con |
|-------|----------|-----|-----|
| **Save-on-Accept** | Each "Accept" immediately creates the test case linked to the requirement | Incremental, no separate save step, user sees tests in the list instantly | No "undo" batch, harder to reject-and-restart |
| **Batch Save** | User reviews all, then clicks "Save All Accepted" | Atomic, can change mind before committing | Extra step, can lose work if browser closes |

**Recommendation:** Save-on-Accept for April MVP (simpler, aligns with existing "Add Test Case" inline pattern). Accepted tests immediately appear in the main Test Case List with TYPE: MANUAL, STATUS: DRAFT, AUTHOR: AI badge.

**Post-save state:**
- Coverage summary remains visible (shows final coverage)
- Traceability data persists on each test case (citation links as metadata)
- "Generate More" remains available for future gap-filling
- AI Assessment bar collapses to compact state showing final readiness score

---

## 3. Terminology Decisions

| Old term | New term (user-facing) | Rationale | Internal field names |
|----------|----------------------|-----------|---------------------|
| Acceptance Criteria | **Test Scenarios** | Cristiano's feedback — not all customers use AC terminology. "Test Scenarios" is what the AI extracts regardless of source format. | `extractedACs`, `linkedACs`, `acType` — unchanged (internal) |
| Suggested ACs | **Coverage Gaps** | These aren't AC proposals — they're signals that certain areas lack test coverage | `coverageGaps[]` |
| Readiness Score | **Readiness Score** (unchanged) | Clear and understood | `qualityScore` |
| Citable Segments | **Requirement Segments** | User-facing label for the parsed chunks | `citableSegments[]` |

---

## 4. Wait Time Strategy — Layered Approach

| Wait phase | Duration | Strategy | What user sees |
|------------|----------|----------|----------------|
| Deterministic assessment | <30ms | Synchronous, instant | Real score, real signals, real flags |
| LLM assessment (Call A → B) | 15s–2min | Progressive async updates | Score refining, scenarios appearing, clarifications populating |
| Document processing | 30s–60s | Background, async | "📄 Processing..." → "3 rules found" |
| Test generation | 1–3min | Streaming (SSE) | Tests appear one by one, review enabled immediately |
| Per-test regeneration | 30s–1min | Inline loading on that card | Single card shows "Regenerating..." → new test appears |
| Generate More | 1–2min | Streaming into existing list | New section divider: "AI Generated (additional)" |

**Guiding principle:** At every point in this timeline, the user has something meaningful to look at, react to, or work with. Dead wait (spinner, no content) should never exceed 15-20 seconds.

---

## 5. Layout Specification

### Before Generation (default page state)

No layout changes from production. The only addition is the AI Assessment indicator:

```
┌──────┬──────────────────────────────────────────────────────────────┐
│      │ Header + Actions          [+Create] [🔗Link] [✨Generate]   │
│ Side ├───────────────┬──────────────────────────────────────────────┤
│ bar  │ ✨ AI Assess. │ Test Case List                              │
│      │ Score: 62%    │ (existing tests or empty state)             │
│      │ ⚠ 3 issues   │                                             │
│      │ Refining... ◌ │                                             │
│      ├───────────────┤                                             │
│      │ Requirement   │                                             │
│      │ Description   │                                             │
│      │ (original,    │                                             │
│      │  unchanged)   │                                             │
│      │   ~300px      │              flex-1                         │
└──────┴───────────────┴──────────────────────────────────────────────┘
```

The AI Assessment indicator sits at the top of the left column, above the requirement description. It's compact (2-3 lines collapsed, expandable for clarifications and context input). The requirement description below it is the original Jira content — untouched.

### During/After Generation

```
┌──────┬──────────────────────────────────────────────────────────────┐
│      │ Header + Actions          [+Create] [🔗Link] [✨Generate]   │
│ Side ├───────────────┬──────────────────────────────────────────────┤
│ bar  │ ✨ AI Assess. │ Coverage: 14/19 ████████████░░ [Gaps ▾]     │
│      │ Score: 74% ✓  │────────────────────────────────────────────│
│      │ 0 clarif.     │ Test Case List                              │
│      ├───────────────┤ TC-129... Verify created...  AUTO PUBLISHED │
│      │ Requirement   │ TC-129... Verify linked...   AUTO PUBLISHED │
│      │ Description   │────── ✨ AI Generated ──────────────────────│
│      │               │ TC-NEW-001 Verify View...    MANUAL DRAFT   │
│      │ (original,    │   [SEG-1][SEG-2]     [✓] [✗] [✎] [↻] 👍👎│
│      │  with inline  │ TC-NEW-002 Verify Syn...    MANUAL DRAFT   │
│      │  highlights   │   [SEG-3]            [✓] [✗] [✎] [↻] 👍👎│
│      │  on hover)    │ ... more ...                                │
│      │               │────────────────────────────────────────────│
│      │ [▾ AI parsed  │ [Save All Accepted] [Generate More]         │
│      │   segments]   │                                             │
│      │   ~300px      │              flex-1                         │
└──────┴───────────────┴──────────────────────────────────────────────┘
```

**Key layout decisions:**
- Coverage summary bar appears at the top of the right column (above the test list)
- Generated tests are inserted into the existing test list below a section divider
- Left column width stays ~300px (matching production)
- AI parsed segments are a collapsible section at the bottom of the left column — available for deep inspection but not taking primary real estate
- Inline highlights on the requirement text activate on hover (secondary traceability)

---

## 6. Touchpoint Completeness Audit

| Touchpoint | Addressed? | Mechanism | Risk level |
|------------|-----------|-----------|------------|
| **Entry point discovery** | ✅ | Existing "✨ Generate Tests" button in action bar | Low — already shipped |
| **Requirement quality signal** | ✅ | Instant deterministic score (<30ms) + progressive LLM refinement | Medium — depends on backend emitting stage-by-stage |
| **Ambiguity detection** | ✅ | Flagged terms in Tier 0 (instant) + clarification cards from Call B | Low |
| **Missing scenario detection** | ✅ | Missing category flags in Tier 0 + extracted scenario breakdown from Call A | Low |
| **User context input (free text)** | ✅ | Text area in expandable refinement section | Low — new addition |
| **Document upload** | ✅ | File upload in refinement section (clearly optional) | Low |
| **Clarification resolution** | ✅ | One-click suggestion buttons + custom text input | Low |
| **Generate-at-any-quality-tier** | ✅ | Button never disabled, shows current score % | Low |
| **Wait time during generation** | ✅ | Streaming delivery — first test in ~15-30s | Medium — depends on SSE implementation |
| **Progress indication** | ✅ | Genuine stage indicators for first 15-30s, then streaming tests | Low |
| **Traceability (test → requirement)** | ✅ | Citation badges on each test + hover highlights + coverage summary | Low |
| **Coverage visibility (at-a-glance)** | ✅ | Persistent coverage bar above test list | Low |
| **Coverage gap identification** | ✅ | "Show Gaps" expandable with uncovered segments listed | Low |
| **Per-test review (accept/reject/edit)** | ✅ | Inline actions on each generated test card | Low |
| **Bulk review (accept all)** | ✅ | "Accept All" button | Low |
| **Per-test feedback (👍👎)** | ✅ | Thumbs on every generated test | Low |
| **Per-test regeneration** | ✅ | "↻ Regen" with optional refinement text input | Low |
| **Batch regeneration with context** | ✅ | "Regenerate All with refinement" — global text area | Medium — needs design |
| **Generate more (coverage gaps)** | ✅ | "Generate More" button from coverage gap view | Low |
| **Kai escape hatch** | ✅ | "Ask Kai" available everywhere, context pre-loaded | Low — depends on Kai integration |
| **Save to requirement** | ✅ | Accept → auto-save as DRAFT, linked to requirement | Low |
| **Coexistence with existing tests** | ✅ | Generated tests appear in same list, below section divider | Low |
| **Original requirement content visible** | ✅ | Left column shows original Jira content, unchanged | Low |
| **AI-parsed segments available** | ✅ | Collapsible section at bottom of left column | Low |
| **Empty state (no existing tests)** | ✅ | Test case list shows empty state + "Generate with AI" CTA | Low |
| **Error recovery (generation fails)** | 🟡 | "Generation failed. [Retry] [Try with simpler config]" | Medium — needs error state design |
| **Session persistence (browser refresh)** | 🟡 | Unresolved — in-progress generation lost on refresh? | Medium — needs backend decision |
| **Multi-user conflict (same requirement)** | 🟡 | Unresolved — two users generating simultaneously? | Low for April — document for July |

### Gaps identified

Three touchpoints at 🟡 need resolution before prototype:

1. **Error recovery:** If generation fails mid-stream (timeout, API error), what does the user see? Recommendation: show error inline where the next test would have appeared, with Retry and "Try simpler" buttons. Already-streamed tests are preserved.

2. **Session persistence:** If the user refreshes during generation, do they lose everything? Recommendation for April: yes (accept this limitation), show a warning "Generation in progress, don't refresh." For July: server-side generation state with resume capability.

3. **Multi-user conflict:** If two users generate for the same requirement simultaneously, both get independent results. Last-save-wins for test case edits. Document this behavior, don't build conflict resolution for April.

---

## 7. Priority Classification

### P0 — Must have for April demo credibility

| Item | Touchpoint | Why P0 |
|------|------------|--------|
| Instant deterministic assessment | T1: Land | The progressive model collapses without Tier 0. If users see "Loading..." instead of a real score, no advantage over a spinner. |
| Generate button never disabled | T4: Generate | Users must be able to try the feature immediately. Gating on LLM completion adds 1-2 min friction for exploration. |
| Streaming test delivery | T4: Generate | Without streaming, users wait 1-3 minutes staring at a progress bar. With streaming, they start reviewing after 15-30s. This is the difference between "tolerable" and "unusable." |
| Coverage summary bar | T5: Review | Cristiano's traceability concern. Users need at-a-glance coverage validation, not hidden hover behavior. |
| Per-test Accept/Reject | T5: Review | Users must be able to curate output. Que Tran's feedback: focus on core tests first, allow expanding later. |
| Citation badges on tests | T5: Review | Each test must show which requirement segments it derives from. Without this, "traceability is weak" remains true. |
| Original requirement content preserved | T1: Land | Requirement description must remain visible and unchanged. AI analysis is an overlay, not a replacement. |

### P1 — Should have for April, defer if blocked

| Item | Touchpoint | Why P1 |
|------|------------|--------|
| Progressive LLM updates (score refining) | T2: Assess | Valuable but not blocking — deterministic score is sufficient for initial demo |
| Clarification resolution (one-click) | T3: Refine | Improves quality but users can generate without resolving |
| Free-text context input | T3: Refine | Low effort to build, high value for quality. Defer only if genuinely blocked. |
| Per-test regeneration with refinement text | T6: Iterate | Important for the iterative story, but first generation working well is sufficient for demo |
| Generate More (gap-driven) | T6: Iterate | Coverage-driven expansion. Important for the narrative but not blocking if core generation works. |
| 👍👎 feedback | T5: Review | Quality signal. Mandatory in design system. Low effort. |
| Hover highlighting (test ↔ segment) | T5: Review | Secondary traceability. Nice for deep inspection. |

### P2 — Post-April (July or later)

| Item | Touchpoint | Why P2 |
|------|------------|--------|
| AI-parsed segments panel | T1: Land | Detailed segment-by-segment view. Useful for power users, not needed for initial value delivery. |
| Batch regeneration with global refinement | T6: Iterate | Complex UX. Per-test regen + Generate More covers 80% of the iteration need. |
| Document upload processing | T3: Refine | Doc Processor adds quality, but requirements text alone is sufficient for demo. |
| Session persistence across refresh | T4: Generate | Engineering effort for server-side state. Accept the limitation for April. |
| Kai bridge with full context | T6: Iterate | Depends on Kai context handoff API (AI Platform team dependency). |

---

## 8. Open Decisions for Team Discussion

| # | Decision | Options | Recommendation | Decide by |
|---|----------|---------|----------------|-----------|
| 1 | **Save model** | Save-on-Accept vs. Batch Save | Save-on-Accept (simpler, matches "Add Test Case" pattern) | Sprint planning |
| 2 | **Assessment trigger** | Auto on page load vs. On tab/section expand vs. Cache with TTL | Cache with TTL (1h) + auto on page load for cache miss | Sprint planning |
| 3 | **AI Assessment location** | Top of left column vs. Full-width bar below header vs. Expandable section | Top of left column (minimal disruption to existing layout) | Design review |
| 4 | **Generated test identification** | "AI" author badge vs. Separate "AI Generated" column vs. Section divider | Section divider + AI badge in AUTHOR column (both) | Design review |
| 5 | **Depth control UX** | Toggle in AI bar vs. Dropdown on Generate button vs. Setting | Dropdown on Generate button: "⚡Quick" / "🔍Thorough" | Design review |
| 6 | **Background analysis cost** | Auto-trigger on every page view vs. On-demand only | Cache with TTL — first load triggers, subsequent visits use cache until requirement changes | Engineering review |

---

## 9. Success Metrics

| Metric | Target | Measurement | Phase |
|--------|--------|-------------|-------|
| Time to first meaningful content | <30ms (deterministic score) | Page load instrumentation | April |
| Time to first generated test case | <30s from click | SSE first-event timing | April |
| Generation completion rate | >70% (user doesn't abandon) | Funnel: Generate click → at least 1 Accept | April |
| Tests accepted per generation | >60% of generated tests | Accept count / generated count | April |
| Coverage bar visibility | >90% of sessions see it | UI impression tracking | April |
| Clarification resolution rate | >50% when available | Resolved / shown | July |
| "Generate More" usage | >20% of sessions with gaps | Click tracking | July |
| 👍 to 👎 ratio | >3:1 | Feedback aggregation | July |

---

## 10. What the v9 Prototype Must Demonstrate

The prototype should prove these six things work together:

1. **Instant assessment on load** — deterministic score, flagged issues, structural analysis appear immediately, then progressively refine (simulated timing)
2. **Generate-at-any-tier** — button always active, score displayed, user chooses when to pull the trigger
3. **Streaming generation into existing test list** — tests arrive one by one below existing tests, with section divider, review actions enabled immediately
4. **Coverage summary bar** — at-a-glance segment coverage, updates live on accept/reject, expandable gaps view
5. **Iterative refinement** — per-test regen with text input, "Generate More" for gaps, free-text context for global improvement
6. **Production-faithful layout** — matches the existing Requirement Detail page structure exactly, AI additions feel like natural extensions not a new page

---

*This document is the single source of truth for the v9 prototype direction. All previous analysis documents are superseded.*
