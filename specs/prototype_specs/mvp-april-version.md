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
| **Quality Score & Rationale** | Users need to know "is my requirement ready?" and *why*. | Light inline bar. Expands to show deterministic "Score Breakdown" checklist. Score updates progressively (~30s). |
| **Clarifications** | Improve generation quality with zero training. One-click answers. | Progressive: score first → clarifications appear after analysis. |
| **Context Input** | Simple way to add supplementary info without new concepts. | Collapsed in expanded panel. Textarea + file upload. |
| **Streaming Delivery** | Performance necessity — LLM is slow, streaming feels faster. | Progress bar is nested clearly *inside* the "AI Drafts for Review" tab. |
| **Split Review Tabs** | Keeps workspace organized and clear. | Right panel divided: "Linked Test Cases" vs "AI Drafts for Review". Auto-switches to Drafts when generating. |
| **Accept = Immediate Save** | Reduces click friction. Users select target location early. | Folder chooser sits in the tab bar. Clicking "Accept" on a card immediately links it to that location. No staging area. |
| **Regenerate with refinement** | Users need to iterate on individual tests. Must-have per feedback. | Expandable input with "What should be different?" prompt. |
| **Paragraph Highlighting** | Simple traceability without new concepts. "This test came from this text." | Subtle violet left-border + background. Auto-scrolls to paragraph. No font size changes. |

---

## Progressive Loading Behavior

The readiness panel has two phases to match real-world latency:

### Phase 1: Instant (Page Load)
- **Score**: 62% (deterministic — based on requirement length, structure markers, keyword density)
- **Label**: "Needs Improvement"
- **Available**: Context textarea, file upload
- **Status**: "Analyzing..." indicator visible

### Phase 2: After LLM Analysis (~30 seconds)
- **Score**: Bumps to 74% ("Good")
- **New**: Clarification questions appear (e.g., "What Git hosting services should be supported?")
- **Status**: Analyzing indicator disappears, "2 tips" badge appears
- **Score continues to update**: Resolving a clarification = +10, uploading a doc = +10, typing context = +5

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
User sees the requirement text on the left, existing linked tests on the right. Readiness bar shows 62% with "Analyzing..." — score is instant, clarifications loading in background.

### 2. (Wait ~30s) Clarifications Arrive
Score bumps to 74%. "2 tips" badge appears. User can expand to see clarification questions and resolve them with one click. Score updates live.

### 3. (Optional) Add Context  
User can expand the readiness panel to type notes or upload documents. Not required — can skip straight to Generate.

### 4. Generate & Streaming
Click "Generate Test Cases". The right panel *automatically* switches to the "AI Drafts for Review" tab. The streaming progress bar appears at the top of this tab area. Tests stream down underneath it.

### 5. Review & Accept-to-Save
Each test card shows: name, type badge, priority, steps. Hovering a card highlights the relevant paragraphs in the requirement text (auto-scrolls). 
The user selects a target folder from the tab bar header (e.g., "Katalon Cloud"). Clicking **Accept** on a card immediately moves the test into the "Linked Test Cases" tab and applies the `→ Katalon Cloud` location tag. No extra "save" step needed.

---

## Styling Decisions

| Element | Decision | Rationale |
|---------|----------|-----------|
| **Readiness panel** | Light, compact bar on white background | Elegant, not eye-popping. Dark gradients were too contrasty. |
| **Score bar** | Thin 4px rounded bar, color-coded | Minimal visual footprint, readable at a glance |
| **Generate button** | Purple gradient with shadow | AI-forward without being aggressive. Clear call to action. |
| **Progress indicator** | Light card with violet accent | Consistent with readiness panel. Not a separate visual language. |
| **Paragraph highlight** | `#F5F3FF` background + `2px solid #8B5CF6` left border | Subtle, clean, doesn't change font size or weight. Auto-scrolls. |
| **Clarification cards** | Light yellow `#FEFCE8` background | Warm, inviting — "helpful tip" energy, not "warning" |
| **Test cards** | White with border, green/red action buttons | Standard review pattern. No new visual concepts. |

---

## Files Changed (from ideal-prototype-v1)

| File | Action | What Changed |
|------|--------|-------------|
| `mockData.js` | Rewritten | Removed citableSegments, requirementSections, citation types. Tests use `paragraphs[]` (indices). |
| `RequirementPanel.jsx` | Rewritten | Single view with paragraph highlighting + scroll-to. No tabs. |
| `AIGeneratorPanel.jsx` | Rewritten | Compact readiness bar with progressive loading. Added deterministic "Score Breakdown" rationale checklist. |
| `TestCard.jsx` | Rewritten | Accept/Reject/Edit/Regenerate. No citation badges, no feedback thumbs. Fires hover events. |
| `ReviewList.jsx` | Rewritten | Simplified header. |
| `App.jsx` | Rewritten | Flat split layout. Added explicit `rightTab` state (Linked vs Drafts). Merged 'Save' step into the 'Accept' action. Nested progress bar inside the Drafts tab. |
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
