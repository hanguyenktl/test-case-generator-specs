# Test Case Generator — MVP April Version

> **Target:** April 2026 launch
> **Branch:** `main` (post-`ideal-prototype-v1` tag)
> **Directive from Cristiano:** Ship less, nail it. No new concepts. Prove core generation quality first.

---

## Core Question This Version Answers

> *"Can AI generate good, relevant test cases from my requirement?"*

Everything else is deferred until customers explicitly ask for it.

---

## What Was Cut and Why

| Cut Feature | Reason | When to Reconsider |
|-------------|--------|--------------------|
| **Extracted Behaviors tab** | New concept requiring training ("what is a behavior?") | When users say "I want to see what the AI understood" |
| **Trace Map** (React Flow graph) | Visually impressive but requires explanation. No customer evidence. | When dealing with complex requirements with 50+ tests |
| **Coverage Summary** (19-segment bar) | Requires persistent data model. "14/19" is meaningless without training. | When users ask "what did I miss?" |
| **7 Citation Types** + colored badges | New visual language. 7 types = 7 things to explain. | When traceability becomes a validated need |
| **3-Tier Progressive Scoring** | Accordion, breakdown, scenario counts — all training overhead. | After April if users want more detail about AI readiness |
| **Depth Selector** (Quick/Thorough) | Users can't evaluate "depth" without experience. Generate one good set. | When users request lighter/deeper generation |
| **Generate More from Gaps** | Requires coverage model. Users can click Generate again. | When coverage tracking is implemented |
| **Feedback Thumbs** (👍👎) | Visual clutter. Valuable but not for first impression. | Post-launch for model training |
| **Ask Kai Panel** | Separate AI chat distracts from the core generate→review flow. | When users want conversational interaction |
| **Citable Segments** data model | Heavyweight parsing. Paragraphs are sufficient for traceability. | When precision traceability is validated |

---

## What We Kept and Why

| Feature | Why It Stays | Design Decision |
|---------|-------------|-----------------|
| **Requirement text** (single view) | The source of truth. Users MUST see it. | No tabs — single scrollable view. |
| **Requirement Quality & Rationale** | Users need to know "is my requirement good enough?" and *why*. | Label: "Requirement Quality". Expands to show deterministic "Score Breakdown" checklist. Score is purely about requirement text — context does not inflate it. |
| **Score Gate** | Prevents wasted generation on vague requirements. | < 30% = blocked (red button). 30–49% = warning (amber). ≥ 50% = ready (purple). Adding context relaxes a block to a warning. |
| **Clarifications** | Improve generation quality with zero training. One-click answers. | Progressive: score first → clarifications appear after analysis. |
| **Generation Options** | Context/uploads enrich generation, not requirement quality. Separated from scoring. | Collapsible section in the sticky footer, right above Generate button. Textarea + file upload. |
| **Streaming Delivery** | Performance necessity — LLM is slow, streaming feels faster. | Progress bar is nested clearly *inside* the "AI Drafts for Review" tab. |
| **Split Review Tabs** | Keeps workspace organized and clear. | Right panel divided: "Linked Test Cases" vs "AI Drafts for Review". Auto-switches to Drafts when generating. |
| **Accept = Immediate Save** | Reduces click friction. Users select target location early. | Folder chooser sits in the tab bar. Clicking "Accept" on a card immediately links it to that location. No staging area. |
| **Regenerate with refinement** | Users need to iterate on individual tests. Must-have per feedback. | Expandable input with "What should be different?" prompt. |
| **Paragraph Highlighting** | Simple traceability without new concepts. "This test came from this text." | Subtle violet left-border + background. Auto-scrolls to paragraph. No font size changes. |

---

## Progressive Loading Behavior

The Requirement Quality panel has two phases to match real-world latency:

### Phase 1: Instant (Page Load)
- **Score**: Deterministic — evaluates requirement text against 6 criteria (user story structure, acceptance criteria, entry points, interactions, edge cases, scope boundaries)
- **Label**: Score-dependent ("Insufficient" / "Needs Improvement" / "Fair" / "Good")
- **Available**: Generation Options (context + upload) in the footer
- **Status**: "Analyzing..." indicator visible

### Phase 2: After LLM Analysis (~30 seconds)
- **Score**: Bumps by ~12 points from LLM criteria (scenario identification, ambiguity level)
- **New**: Clarification questions appear (e.g., "What Git hosting services should be supported?")
- **Status**: Analyzing indicator disappears, "2 tips" badge appears
- **Score continues to update**: Resolving a clarification = +5
- **Score is purely about requirement text** — context/docs do not affect the score, but can relax the generation gate

This mirrors the real system where the deterministic score is fast but AI-powered clarifications take time.

---

## Layout

```
┌─────────────────────────────────┬─────────────────────────────────────┐
│  Readiness  74%  Good  2 tips ▼ │  [🧪 Linked (3)] [👁️ Drafts (10)] 📁 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━───── │  ┌─────────────────────────────┐   │
│                                 │  │ TC-001  Verify View Script  │   │
│  📄 Requirement    Synced       │  │ Button Present on Test...   │   │
│  ─────────────────────────      │  │                             │   │
│                                 │  │ [✓ Accept] [✗ Reject] [✎] │   │
│  As a QA Engineer investigating │  └─────────────────────────────┘   │
│  a test failure, I want to      │  ┌─────────────────────────────┐   │
│  view the test script code...   │  │ TC-002  Verify Syntax       │   │
│  ...                            │  │ Highlighting for Groovy...  │   │
│                                 │  │                             │   │
│  ┌──────────────────────────┐   │  │ [✓ Accept] [✗ Reject] [✎] │   │
│  │ ✨ Generate Test Cases    │   │  └─────────────────────────────┘   │
│  └──────────────────────────┘   │                                     │
└─────────────────────────────────┴─────────────────────────────────────┘
```

---

## User Journey (MVP)

### 1. Land
User sees the requirement text on the left, existing linked tests on the right. Requirement Quality bar shows score with "Analyzing..." — score is instant (deterministic), clarifications loading in background.

### 2. (Wait ~30s) Clarifications Arrive
Score bumps. "2 tips" badge appears. User can expand to see clarification questions and resolve them with one click. Score updates live.

### 3. Score Gate Check
User looks at the Generate button. Three possible states:
- **🔴 Blocked** (< 30%): Button red and disabled. Banner: "Requirement too vague. Add context below to unlock." User must either improve the requirement or add Generation Options context.
- **🟡 Warning** (30–49%, or < 30% with context added): Amber button, allowed to proceed. Banner warns about quality.
- **🟢 Ready** (≥ 50%): Purple button, no friction.

### 4. (Optional) Add Context
User clicks "Generation Options" in the footer to add context or upload files. This enriches the AI's knowledge but does NOT affect the score. If the requirement was blocked, adding context relaxes the gate to a warning.

### 5. Generate & Streaming
Click "Generate Test Cases". The right panel *automatically* switches to the "AI Drafts for Review" tab. The streaming progress bar appears at the top of this tab area. Tests stream down underneath it.

### 6. Review & Accept-to-Save
Each test card shows: name, type badge, priority, steps. Hovering a card highlights the relevant paragraphs in the requirement text (auto-scrolls). 
The user selects a target folder from the tab bar header (e.g., "Katalon Cloud"). Clicking **Accept** on a card immediately moves the test into the "Linked Test Cases" tab and applies the `→ Katalon Cloud` location tag. No extra "save" step needed.

---

## Styling Decisions

| Element | Decision | Rationale |
|---------|----------|-----------|
| **Requirement Quality panel** | Light, compact bar labeled "Requirement Quality" | Elegant, not eye-popping. Score is purely about requirement text. |
| **Score bar** | Thin 4px rounded bar, 4-color scale (red/orange/amber/green) | Minimal visual footprint, readable at a glance |
| **Score gate: blocked** | Red button + red banner | Immediately clear that generation is not possible |
| **Score gate: warning** | Amber gradient button + yellow banner | Proceed-with-caution energy |
| **Generate button** | Purple gradient with shadow (when ready) | AI-forward without being aggressive. Clear call to action. |
| **Generation Options** | Collapsible section with settings icon, in sticky footer | Clearly separate from scoring — this is input, not assessment |
| **Progress indicator** | Light card with violet accent | Consistent with quality panel. Not a separate visual language. |
| **Paragraph highlight** | `#F5F3FF` background + `2px solid #8B5CF6` left border | Subtle, clean, doesn't change font size or weight. Auto-scrolls. |
| **Clarification cards** | Light yellow `#FEFCE8` background | Warm, inviting — "helpful tip" energy, not "warning" |
| **Test cards** | White with border, green/red action buttons | Standard review pattern. No new visual concepts. |

---

## Files Changed (from ideal-prototype-v1)

| File | Action | What Changed |
|------|--------|-------------|
| `mockData.js` | Rewritten | Removed citableSegments, requirementSections, citation types. Tests use `paragraphs[]` (indices). Added `mockLowQualityRequirement` for demo. |
| `RequirementPanel.jsx` | Rewritten | Single view with paragraph highlighting + scroll-to. Accepts `requirementText` prop. No tabs. |
| `AIGeneratorPanel.jsx` | Rewritten | Pure scoring component labeled "Requirement Quality". Dynamic text evaluation against 6 criteria. Score Breakdown rationale. Exports score via `onScoreChange`. |
| `GenerationConfig.jsx` | **New** | Collapsible context + upload section. Lives in sticky footer near Generate button. |
| `TestCard.jsx` | Rewritten | Accept/Reject/Edit/Regenerate. No citation badges, no feedback thumbs. Fires hover events. |
| `ReviewList.jsx` | Rewritten | Simplified header. |
| `App.jsx` | Rewritten | Score gate logic (blocked/warning/ready with context relaxation). Requirement switcher for demo. `rightTab` state. Accept = save. Progress in Drafts tab. |
| `TraceMapCanvas.jsx` | Deleted | — |
| `CoverageSummary.jsx` | Deleted | — |
| `CitationBadge.jsx` | Deleted | — |
| `KaiPanel.jsx` | Deleted | — |

---

## What Comes Next (Post-April, Based on Customer Demand)

| Signal | Feature to Build |
|--------|-----------------|
| "I want to see what the AI understood" | Extracted Behaviors tab |
| "What tests am I missing?" | Coverage Summary (simplified) |
| "Show me how tests map to requirements" | Trace Map |
| "I want lighter/deeper generation" | Depth selector |
| "I want to ask the AI questions" | Kai Panel |
| "These tests aren't good enough" | Feedback thumbs + model training |
