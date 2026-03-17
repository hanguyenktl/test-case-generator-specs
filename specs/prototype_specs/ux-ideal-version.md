# Test Case Generator — UX Ideal Version

> **Git tag:** `ideal-prototype-v1` (commit `92c413d`)
> **Status:** Complete prototype, parked for post-April development

---

## Design Philosophy

### Core Principle: AC-Grounded Traceability

Every generated test case must trace back to a specific part of the requirement. Users should never wonder "where did this test come from?" — the system makes provenance visible at every level.

### AI as Analytical Partner

The system doesn't just generate tests — it analyzes the requirement, identifies structural patterns, extracts testable behaviors, and surfaces gaps. This gives users confidence that the AI understood the intent before it generated anything.

### Progressive Disclosure

Information is revealed in layers. The initial view is simple. Depth appears as the user asks for it. Advanced features (trace maps, coverage analysis, depth controls) exist but don't overwhelm first-time users.

---

## Architecture: Three-Layer Model

```
┌─────────────────┐    ┌───────────────────┐    ┌──────────────────┐
│  Parsed Layer   │    │  Analysis Layer   │    │  Generation Layer│
│                 │    │                   │    │                  │
│  • 19 citable   │───▶│  • Coverage model │───▶│  • Test cases    │
│    segments     │    │  • Behavior graph │    │  • Citations     │
│  • 7 citation   │    │  • Gap detection  │    │  • Regeneration  │
│    types        │    │  • Quality score  │    │  • Iteration     │
└─────────────────┘    └───────────────────┘    └──────────────────┘
```

---

## Data Model

### Citable Segments

The requirement text is parsed into **19 citable segments** — each a discrete, testable unit of information. Every segment gets a type from 7 citation categories:

| Citation Type | Color | Purpose |
|---------------|-------|---------|
| `requirement` | Blue | Core user story / acceptance criteria |
| `happy_path` | Green | Expected positive flow |
| `edge_case` | Yellow | Non-obvious boundary or corner case |
| `error_handling` | Red | Failure modes and error states |
| `constraint` | Indigo | Technical or business constraints |
| `assumption` | Purple | Implicit assumptions worth validating |
| `acceptance` | Teal | Explicit acceptance criteria |

### Requirement Sections

Segments are grouped into hierarchical sections reflecting the requirement's structure (e.g., "Access & Entry Points", "Content Display", "User Interactions"). This enables the Trace Map and Coverage Summary.

---

## Components (Full Feature Set)

### Left Panel — Requirement Analysis

#### 1. Three-Tab System
- **Original Ticket**: The raw requirement text with citable segments highlighted inline. Each segment has a colored badge showing its citation type.
- **Extracted Behaviors**: A structured view of testable behaviors extracted from the requirement — deduplicated, categorized, and mapped to segments.
- **Trace Map**: A React Flow graph visualization showing requirement sections as source nodes and test cases as target nodes, with edges representing traceability links.

#### 2. AI Assessment Panel (Accordion)
- **Three-tier progressive scoring**: Score starts at 62% (basic analysis), progresses to 74% (deep analysis), and reaches higher based on user actions (resolving clarifications, adding context).
- **Structure breakdown**: Shows how many sections, segments, and scenario-ready blocks the AI identified.
- **Scenario count indicator**: "8 scenarios identified across 4 sections."
- **Depth selector**: Quick / Balanced / Thorough — controls how many tests are generated and at what granularity.
- **Ask Kai button**: Opens a separate AI chat panel for freeform questions about the requirement.

#### 3. Clarification Questions
- AI-generated questions surfaced inside the accordion.
- Each question has pre-populated suggestion chips for one-click answers.
- Resolving a clarification bumps the readiness score.

#### 4. Context Input
- Free-text textarea for additional context.
- File upload for supporting documents.

### Right Panel — Test Review

#### 1. Coverage Summary Bar
- Visual bar showing "14/19 segments covered" — each segment represented as a colored block.
- Dynamically updates as tests are accepted/rejected.
- Uncovered segments are actionable — click to generate targeted tests.

#### 2. Test Cards
Full-featured cards with:
- **Citation Badges**: Colored, typed badges showing which segments the test covers.
- **Feedback buttons**: 👍 / 👎 for training data collection.
- **Accept / Reject / Edit / Regenerate**: Full action set.
- **Hover interaction**: Hovering a citation badge scrolls to and highlights the corresponding segment in the left panel.

#### 3. Multi-Tab View
- **AI Drafts For Review**: Tests pending review.
- **Linked Test Cases**: Existing + accepted tests.

#### 4. Progressive Generation
- Depth-based: Quick generates ~5 tests, Thorough generates ~15.
- "Generate More" from gaps: After initial generation, the system identifies uncovered segments and offers to generate targeted tests.

### Kai Panel (Separate AI Chat)
- Full conversational interface for asking questions about the requirement.
- Contextual — knows about the requirement, generated tests, and coverage state.
- Can generate additional tests on demand from chat.

---

## User Journey (Ideal)

1. **Land** → See requirement text with parsed segments highlighted. AI assessment starts analyzing.
2. **Assess** → Review AI readiness score. Expand to see structure breakdown, resolve clarifications, adjust depth.
3. **Generate** → Click generate. Tests stream in with full citation badges.
4. **Trace** → Switch to Trace Map tab to see a graph of requirement→test relationships.
5. **Review** → Accept/reject/edit tests. Hover citation badges to trace back to requirement text.
6. **Iterate** → Click "Generate More" to fill coverage gaps. Use Kai to ask questions.
7. **Save** → Accepted tests are linked to the requirement.

---

## Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| 7 citation types | Provides rich traceability without requiring users to deeply understand each type — colors do the work |
| React Flow for Trace Map | Graph visualization is the most intuitive way to show many-to-many relationships |
| 3-tier progressive scoring | Gives users a sense of control — "I can improve this score" |
| Streaming delivery | Performance necessity — LLM responses are slow, streaming feels faster |
| Parsed segments as base unit | Enables coverage tracking, gap detection, and targeted regeneration |
| Separate Kai panel | AI chat shouldn't compete with the structured review workflow |

---

## Deferred / Future Considerations

- **Persistence**: Save coverage state across sessions so returning users see their progress.
- **Team-level coverage dashboards**: Aggregated coverage across multiple requirements.
- **Smart depth tuning**: AI learns optimal depth per requirement type.
- **Cross-requirement deduplication**: Detect overlapping tests across requirements.
- **Training from feedback**: Use 👍/👎 data to improve generation quality.
