# Prototype v8 — UX Analysis & Correction Plan

**Status:** Analysis only — do not implement until reviewed
**Date:** March 2026

---

## The Fundamental Question First

Before fixing the four issues, we need to answer: **what's the fastest path to the real value, and what does the user actually need to validate?**

### What the user wants

A QA engineer or test lead lands on a requirement and thinks: *"I need test cases for this. Can AI do it well enough that I don't have to write them from scratch?"*

The value moment is NOT:
- Seeing the readiness score
- Seeing parsed segments
- Resolving clarifications
- Uploading documents

The value moment IS:
- **Seeing the first batch of generated test cases and recognizing they make sense for this requirement.**

Everything before that moment is friction. Everything after it is validation and refinement. The prototype currently inverts this — it front-loads the AI analysis experience and pushes the test cases below the fold or behind too many clicks.

### The validation question

Once the user sees test cases, they need to answer: *"Are these actually derived from my requirement, or are they generic garbage?"*

This is where traceability earns its keep. But the user validates traceability **by looking at test cases and checking their source**, not by studying parsed segments first and then looking at what was generated from them.

The current prototype asks users to: read parsed segments → understand citation types → then generate → then cross-reference. That's an analyst workflow, not a practitioner workflow.

### Proposed journey (fastest path to value)

```
STEP 1: LAND (0 seconds)
  User is on the Requirement Detail page
  They see the original requirement content (as-is, familiar)
  They see a compact AI generation bar: "✨ Generate Test Cases [⚡Quick ▾] [Generate]"
  
STEP 2: GENERATE (1 click, ~10 seconds wait)
  User clicks Generate
  Test cases stream in on the right side
  THIS IS THE VALUE MOMENT — user sees real test cases immediately
  
STEP 3: VALIDATE (glance, 5 seconds)
  A coverage summary bar appears above the test list:
  "10 tests • 14/19 segments covered • 5 gaps"
  Color-coded mini-bar shows coverage by type
  User can see at a glance: good coverage or not
  
STEP 4: DRILL (optional, on-demand)
  User hovers a test → source segment highlights on left
  User clicks "Show gaps" → sees the 5 uncovered segments
  User clicks a gap → "Generate tests for this" or "Ask Kai"
  
STEP 5: REFINE (optional, if quality is off)
  User expands the AI panel → sees clarifications, can add free-text context, upload docs
  User clicks "Regenerate with context" → better results
```

The key difference: **Steps 1-3 should take under 15 seconds and zero cognitive load.** Steps 4-5 are progressive disclosure for users who want to dig deeper.

Compare to current prototype where the user must scroll through a 400px-wide left panel of parsed segments, citation legends, clarifications, and document upload before even seeing where test cases will appear.

---

## Issue 1: Left Panel Too Large — Can't See Test Cases

### Problem

The left column is 400px and contains three stacked sections: AI Generation controls + Citation Legend + Parsed Requirement. On a 1440px screen, after the 56px sidebar, the left panel takes 400px, leaving ~984px for test cases. But the left panel's scroll height is enormous — the real-life requirement has 19 parsed segments, each with a citation badge and multi-line text. Users must scroll past all of this to see anything on the left, and the right panel (the actual value — test cases) feels secondary.

### Root cause

We conflated three distinct concerns into one column:
1. **Generation controls** (action — needs to be prominent but compact)
2. **Original requirement content** (reference — needs to be scannable)
3. **AI-parsed segments** (analysis layer — needs to be discoverable, not dominant)

### Proposed fix

**Split the information architecture into clear layers:**

```
┌─────────┬──────────────────────────────────────────────────────┐
│ Sidebar │ Top bar                                     Ask Kai  │
│         ├──────────────────────────────────────────────────────┤
│         │ Breadcrumb > TO-9201                                 │
│         ├──────────────────────────────────────────────────────┤
│         │ Page header: View Test Script Code from...           │
│         │ Tester: Vuong Thien Phu • 0 Tests • Feature         │
│         ├──────────────────────────────────────────────────────┤
│         │ [Tab: Details] [Tab: Test Cases ✨] [Tab: History]   │
│         ├──────────────────────────────────────────────────────┤
│         │                                                      │
│         │  FULL-WIDTH TAB CONTENT                              │
│         │                                                      │
│         │  "Details" tab = original requirement (read-only)    │
│         │  "Test Cases ✨" tab = AI generation + results       │
│         │                                                      │
│         └──────────────────────────────────────────────────────┘
```

Inside the "Test Cases" tab:

```
┌────────────────────────────────────────────────────────────────┐
│ ✨ AI Test Generation    Readiness: 85%    [⚡Quick ▾] [Generate] │
│ 2 clarifications available • Add context ▾                     │
├────────────────────────────────────────────────────────────────┤
│ Coverage: 14/19 segments • ██████████░░░░░ 74%  [Show Gaps]   │
├──────────────────────┬─────────────────────────────────────────┤
│ Requirement (left)   │ Generated Tests (right)                 │
│ ~340px, collapsible  │ flex-1                                  │
│                      │                                         │
│ Original content     │ TC-001 Verify View Script Button...     │
│ with inline segment  │   [SEG-1] [SEG-2]  ✓ Accept  ✗ Reject │
│ highlights on hover  │                                         │
│                      │ TC-002 Verify Syntax Highlighting...    │
│ [▾ Show AI Analysis] │   [SEG-3]           ✓ Accept  ✗ Reject │
│ (parsed segments     │                                         │
│  expand on demand)   │ TC-003 Verify Auto-Scroll to...        │
│                      │   [SEG-4]           ✓ Accept  ✗ Reject │
└──────────────────────┴─────────────────────────────────────────┘
```

**Key changes:**
- Left panel shrinks to ~320-340px and shows **original content** primarily
- AI-parsed segments are a **collapsible overlay** on top of the original content, not a replacement
- Coverage summary is a **persistent bar** above the split view, always visible
- Generation controls are a **compact top bar**, not a large expandable section
- Right panel (test cases) gets the majority of screen space

---

## Issue 2: Missing Free-Text Input for Additional Context

### Problem

Users can upload documents and resolve one-click clarifications, but there's no way to type free-form context like "This requirement is part of the Git integration feature. The script viewer reuses the same code editor component as the automation script editor. Performance baseline is the current GitHub file viewer."

This kind of context is the most common way users provide additional information — faster than uploading a document, more nuanced than clicking a suggestion.

### Proposed fix

Add a free-text area inside the expandable "Add context" section, alongside document upload:

```
┌─ Add Context (optional) ──────────────────────────────┐
│                                                        │
│ Additional notes for better generation:                │
│ ┌────────────────────────────────────────────────────┐ │
│ │ This feature reuses the code editor component...   │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ 📎 Upload documents  [Optional]                        │
│    design_spec.pdf ✓                                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Design decisions:**
- Free text comes FIRST (lower friction than file upload)
- Placeholder text should hint at useful context types: "e.g., related features, technical constraints, team conventions..."
- This maps directly to the Generator's `additionalContext` input field — no new backend concept needed
- The text persists in session (like clarification resolutions) so regeneration keeps it

---

## Issue 3: Original Requirement Content Missing

### Problem

The prototype replaced the original ticket content entirely with AI-parsed segments. This is wrong for several reasons:

1. **Users need the familiar view first.** They wrote this requirement — they know what it says. Showing them a parsed/restructured version first is disorienting.
2. **The parsed view is an AI interpretation.** Users need to see the original to judge whether the AI understood it correctly. You can't validate the parse without the source.
3. **In production, the original content comes from Jira/ADO.** It has formatting, links, images, mentions. The parsed version is a reduction, not an enhancement.

### Root cause

We designed the prototype around the citation brainstorm's analyst workflow (parse → cite → generate) rather than the practitioner workflow (see requirement → generate → validate via citation).

### Proposed fix: Two-layer display

**Default: Original requirement content** — the full ticket text as written, displayed like any Requirement Detail page in TestOps. This is what users expect to see.

**AI layer: Parsed segments** — overlaid on or shown alongside the original, activated on demand. Two interaction modes:

**Mode A — Inline highlights (recommended for v8):**
The original text is displayed as-is. When the user generates test cases, the AI's parsed segments are shown as subtle inline highlights within the original text. Hovering a test case on the right highlights the corresponding passage in the original.

```
Original requirement text with [highlighted passages] that
map to the AI's parsed segments. The highlights only appear
after generation, giving the original content breathing room.
```

**Mode B — Side-by-side toggle:**
A "Show AI Analysis" toggle switches the left panel from original → parsed view. This is the explicit inspection mode for users who want to verify segment parsing.

**Recommendation:** Mode A for the Test Cases tab (lightweight, non-disruptive), Mode B available via a toggle for deep inspection. The original content always has visual priority.

### Section naming

- "Requirement" or "Details" = original content (standard TestOps section)
- "AI Analysis" or "Parsed Segments" = the citation layer (clearly labeled as AI output, with ✨ indicator)

This addresses the user's point: "The Requirement is the 'parsed' so it should be a special Plan section to distinguish for users, with the main original content."

---

## Issue 4: No Summary Coverage Gap — Hover Is Too Hidden

### Problem

The traceability information is only accessible by hovering individual test cards. There's no at-a-glance summary that tells the user "you have 5 gaps in your coverage." The hover behavior is a nice-to-have detail, but it can't be the primary way users discover coverage status.

### Root cause

We designed the coverage view as a post-save screen (appears after finalizing the review). But coverage information is most valuable DURING review, not after it — it helps users decide whether to accept all, generate more, or stop.

### Proposed fix: Persistent coverage summary bar

A compact, always-visible bar that appears after generation completes:

```
┌─────────────────────────────────────────────────────────────┐
│ ✨ Coverage   ██████████████░░░░░░ 14/19  │ 5 gaps         │
│                                            │ [Show Details] │
│  ● Requirement (2/2)  ● Happy Path (1/1)  │                │
│  ● Acceptance (3/3)   ● Constraint (1/1)  │                │
│  ○ Edge Case (4/6)    ○ Error (3/6)       │                │
└─────────────────────────────────────────────────────────────┘
```

**Design decisions:**

1. **Position:** Fixed below the generation controls bar, above the test list. Visible at all times during and after review.

2. **Summary level (always visible):**
   - Progress bar with fraction: "14/19 segments covered"
   - Gap count: "5 gaps" in amber if gaps exist
   - Mini breakdown by citation type (dots: ● covered, ○ has gaps)

3. **Detail level (expand on click):**
   - List of uncovered segments with citation badges
   - "Generate tests for these gaps" button
   - This replaces the current post-save TraceabilityCoverage component

4. **Hover remains as secondary:**
   - Hovering a test card still highlights its source segments
   - Hovering a segment in the detail view highlights which tests cover it
   - But the summary bar is the PRIMARY discovery mechanism

5. **During review:**
   - The coverage bar updates live as users accept/reject tests
   - Rejecting a test that was the only cover for a segment turns that segment from ● to ○
   - This gives users real-time feedback on the coverage impact of their review decisions

---

## Revised Information Architecture

Putting it all together:

```
┌──────────────────────────────────────────────────────────────────┐
│ [Sidebar] │ TopBar                                     Ask Kai  │
│           ├──────────────────────────────────────────────────────│
│           │ TO-9201 · View Test Script Code from Test Result...  │
│           ├──────────────────────────────────────────────────────│
│           │ [Details] [Test Cases ✨]  [History] [Traceability]  │
│           ├══════════════════════════════════════════════════════│
│           │                                                      │
│           │  ── "Test Cases" Tab ──                              │
│           │                                                      │
│           │ ┌─ AI Bar (compact, 1 row) ──────────────────────┐  │
│           │ │ ✨ Readiness: 85%  [⚡Quick▾]  [Generate]      │  │
│           │ │ 2 clarifications  +Context▾  +Docs▾            │  │
│           │ └────────────────────────────────────────────────┘  │
│           │                                                      │
│           │ ┌─ Coverage Bar (appears after generation) ──────┐  │
│           │ │ ████████████░░░░ 14/19  5 gaps  [Details ▾]    │  │
│           │ └────────────────────────────────────────────────┘  │
│           │                                                      │
│           │ ┌─ Left (320px) ─────┬─ Right (flex-1) ──────────┐  │
│           │ │                    │                             │  │
│           │ │ Original req.      │ TC-001 Verify View Script  │  │
│           │ │ content with       │   [SEG-1][SEG-2] ✓ ✗ ✎    │  │
│           │ │ inline highlights  │                             │  │
│           │ │ on hover           │ TC-002 Verify Syntax...    │  │
│           │ │                    │   [SEG-3]         ✓ ✗ ✎    │  │
│           │ │ ┌──────────────┐   │                             │  │
│           │ │ │[▾ AI Analysis│   │ TC-003 Verify Auto-Scroll  │  │
│           │ │ │  19 segments │   │   [SEG-4]         ✓ ✗ ✎    │  │
│           │ │ │  parsed    ] │   │                             │  │
│           │ │ └──────────────┘   │ ...                         │  │
│           │ │                    │                             │  │
│           │ │ ┌──────────────┐   │ [Save N Tests] [Gen More]  │  │
│           │ │ │ +Context     │   │                             │  │
│           │ │ │ Free text... │   │                             │  │
│           │ │ │ +Docs (opt.) │   │                             │  │
│           │ │ └──────────────┘   │                             │  │
│           │ └────────────────────┴─────────────────────────────┘  │
│           │                                                      │
│           └──────────────────────────────────────────────────────┘
```

### What changed vs. current prototype:

| Aspect | Current v8 | Proposed |
|--------|-----------|----------|
| Left panel width | 400px | 320px, collapsible to 0 |
| Left panel content | AI-parsed segments only | Original requirement + AI analysis on demand |
| Generation controls | Large expandable section | Compact 1-row bar, always visible |
| Coverage summary | Hidden in hover + post-save | Persistent bar, always visible after generation |
| Free-text context | Missing | Text area in collapsible context section |
| Citation legend | Always visible (takes space) | Collapsed into coverage detail panel |
| Parsed segments | Primary display | Secondary, expandable overlay |
| Test cases visibility | Below fold on many screens | Primary real estate, visible immediately |

---

## Journey Validation: How Fast Can a User Reach Value?

### Current prototype (measured in user actions)

1. Land on page → see large AI panel with clarifications (0 test cases visible)
2. Scroll down to see parsed segments (still 0 test cases)
3. Scroll back up to click Generate (or resolve clarifications first)
4. Wait for generation
5. Scroll right panel to see test cases (value moment)
6. Review one by one
7. Finalize → see coverage analysis

**Actions to value: 3-5 clicks/scrolls + wait. Time: ~30-60 seconds.**
**Actions to validate coverage: 7+ steps. Time: ~2-3 minutes.**

### Proposed journey

1. Land on page → click "Test Cases" tab (or it's default)
2. Click "Generate" (1 click, right there in the compact bar)
3. Test cases stream in on the right (value moment)
4. Glance at coverage bar: "14/19 covered, 5 gaps" (validation)
5. Review test cases (hover to see source if curious)
6. Save

**Actions to value: 2 clicks + wait. Time: ~15 seconds.**
**Actions to validate coverage: 0 additional — it's right there. Time: ~20 seconds total.**

### The difference

The proposed flow removes all intermediate steps between "I want test cases" and "here are test cases." Refinement (clarifications, context, documents) is available but deferred — it's there when users need it, not blocking the path to value.

This aligns with the Ambient AI approach: **Layer 1 (ambient) delivers value without user action.** The readiness score and coverage summary are ambient. The generation itself should feel as close to ambient as a 1-click action can be.

---

## Summary: What to Fix Before Next Prototype

| # | Issue | Fix | Effort |
|---|-------|-----|--------|
| 1 | Left panel too large | Reduce to 320px, show original content, make parsed segments collapsible | Medium |
| 2 | No free-text context input | Add text area in the context section, before doc upload | Small |
| 3 | Original content missing | Show original requirement as primary, AI analysis as secondary overlay | Medium |
| 4 | No coverage summary | Add persistent coverage bar above split view, visible after generation | Medium |
| 5 | Journey too slow to value | Compact the AI controls into a single-row bar, make Generate the hero action | Medium |

The prototype should be re-built with these changes as a cohesive revision, not patched incrementally — the information architecture shift (tabs, compact bar, two-layer content) affects every component's layout and positioning.
