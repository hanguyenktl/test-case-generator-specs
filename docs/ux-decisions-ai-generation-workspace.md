# UX & Design Decisions: AI Test Case Generation Workspace

**Prototype:** AI Test Case Generation (J1/J2 journeys)
**Session date:** April 2026
**Authors:** Ha Nguyen + Claude

---

## Overview

This document captures the key UX and design decisions made during prototype iteration. The goal is to record not just *what* was decided, but *why* — so the team can evaluate tradeoffs and carry the reasoning forward.

---

## 1. Left-Side Reference Panel (not right)

**Decision:** The requirement reference panel lives on the **left side** of the workspace in the J1 journey.

**Why:**

- **Spatial continuity.** On the Requirement Detail page (the J1 entry point), the requirement content is the dominant left element, with linked test cases on the right. The instant a user clicks "Generate Test Cases," they land in the workspace. If the requirement panel were suddenly on the right, the user's mental anchor for "where is the requirement?" flips — jarring. Keeping it on the left preserves that mental model across the transition.

- **Kai drawer conflict.** Kai (the AI chat assistant) is a right-side drawer per design system convention. If the reference panel were also on the right, the two would compete for the same real estate whenever a user opens Kai mid-session. The left side is unclaimed; the right side is reserved for task-level artifacts (DetailPanel) and conversational AI (Kai).

**Implication:** The workspace layout for J1 is a three-column composition: `[Reference Panel] [Center Task Area] [Detail Panel]`. The center column is always the hero.

---

## 2. Reference Panel Content: Gap Analysis First

**Decision:** The reference panel doesn't just show the requirement — it actively surfaces what's *missing* from it.

**Why:**

Users arrive at the generation workspace to decide what context to supply before hitting Generate. The panel needs to answer: "What does the AI already have access to, and what should I add?" A plain requirement summary doesn't answer the second question.

**What the panel shows (in order):**
1. **Description** — full text, no truncation. Truncation defeats the purpose of a persistent reference.
2. **Attachments** — clickable to open the PDF inline. User can read the source doc while composing their inputs.
3. **Gaps detected** — amber-highlighted list of what's absent (no design files, no API contract). This is the gap analysis signal that tells the user what to upload.

**Phase behavior:** Gaps are shown during **setup only**. Once generation starts, the panel switches to showing clarification Q&A instead — the gap analysis task is past.

---

## 3. Collapsed Rail During Triage

**Decision:** The reference panel auto-collapses to a 24px icon rail when the user enters the triage (review) phase.

**Why:**

During triage, the primary task is reviewing generated test cases. The DetailPanel (test case detail view) needs space on the right. Keeping a 280px reference panel open by default would make the center review table too narrow. Auto-collapsing respects focus shift — the user's job is now triaging, not cross-referencing requirements.

The rail is still **user-expandable** at any time. This matters for edge cases like "I need to re-check the spec while reviewing test case 6." The rail acts like an IDE file explorer: collapsed by default when you're editing, but one click away.

---

## 4. Clarification Q&A Persists in the Reference Panel

**Decision:** Answered clarification questions from the generation pipeline remain visible in the reference panel throughout the session.

**Why:**

The clarification phase is a dialogue where the AI asks ambiguous questions and the user provides decisions ("If session expires, show error and redirect"). Those decisions become *assumptions embedded in the generated test cases*. If they disappear, the user has to remember what they chose when reviewing test case step 4 that says "Expect redirect to login page."

Keeping Q&A in the panel turns it into a **decision audit trail**: reference doc → what questions the AI had → what the user decided → generated tests. The panel collapses the entire context into one scrollable surface.

---

## 5. Stable Master-Detail Table Columns

**Decision:** The review table keeps the same column set regardless of whether a row is selected.

**Why:**

The prior implementation swapped from a 5-column layout (checkbox, name, confidence, steps, priority) to a 3-column layout when a row was selected. This caused two problems:

1. **Checkbox disappeared.** Users couldn't multi-select once they'd clicked a row.
2. **Jarring reflow.** Columns jumping every time a row is selected/deselected creates cognitive disruption.

The fix is a single stable column definition: `[checkbox] [Test Case] [Confidence] [Steps] [Priority]`. The DetailPanel slides in at fixed width from the right — it doesn't affect the table columns.

---

## 6. Accept Is Immediate, Execute Is Gated on Accept Count

**Decision:** Accepting a test case persists it to the target folder immediately. Execute is available as soon as at least one case is accepted — not gated on "review is empty."

**Why gating on Review=0 was wrong:**

Forcing users to triage *every* generated case before they can execute means they must either accept or explicitly reject everything. In practice, users want to accept the clear wins, run them, and come back to borderline cases later. Requiring full clearance before Execute creates unnecessary friction.

**New model:**
- Accept → saved immediately (optimistic commit, toast confirmation)
- Execute → enabled as soon as `accepted.length > 0`
- Cases still in review at execute time → the Execute modal shows a warning ("X cases still in review") but doesn't block

---

## 7. Execute Is a Modal, Not a Toast

**Decision:** Clicking Execute opens a confirmation modal; it does not immediately trigger execution.

**Why:**

Execute is a consequential action — it starts a test run that will be visible to the team. A toast is too lightweight for that trigger. The modal serves three purposes:

1. **Run name input.** Users name the run before it starts.
2. **AI confidence summary.** Shows how many of the accepted cases are fully specified (high confidence) vs. speculative (medium/low). This sets expectations: "8 of 12 cases fully specified — 4 have AI-inferred assumptions."
3. **Cancel path.** If the user opens Execute by mistake, Cancel returns them to the Accepted tab (not to a dead state).

---

## 8. End State Is the Accepted Case List, Not a Completion Screen

**Decision:** When all review cases are triaged, the workspace automatically switches to the Accepted tab. The "session complete" state is a compact banner, not a full-screen card.

**Why the full-screen card was wrong:**

A full-screen completion state implies the workspace is *done* — over, archived. But users return to the workspace to review what they accepted, re-run execution, or generate more cases for the same requirement. If returning means seeing a "session complete" landing screen instead of their accepted cases, the workspace fails as a persistent review surface.

**New treatment:**
- When review empties, auto-switch to Accepted tab.
- Show a thin green banner: "N test cases saved to [folder] · TO-8526" with Generate more and Execute buttons.
- The tab list (Review / Accepted / Rejected) remains navigable. The banner is dismissable context, not a state gate.

---

## 9. J1 vs J2 — Same Panel, Different Content

**Decision:** Both J1 and J2 get a left-side reference panel during clarification and triage. The difference is **what the panel shows**, not whether it exists.

**J1 panel** — requirement-centric:
- Header: `TO-8526 · Story · 72%` + Jira link
- Description: full requirement text pulled from the linked issue
- Attachments: requirement files + any user-added supplements
- Gaps: amber hints showing what's absent from the requirement
- Appears in setup (gap analysis), clarification, and triage

**J2 panel** — user-context-centric:
- Header: "Your context" (no external key, no quality score)
- Description: the description the user typed in the setup form
- Attachments: the files the user uploaded
- No gaps (the user IS the source — they decide what to include)
- No Jira footer
- Appears only post-setup (during clarification and triage) — during setup, the form itself is the reference

**Why J2 still needs a panel:**
Once a J2 user clicks Generate, the setup form disappears. During clarification, Kai asks questions ("What should happen when X?") and the user needs to refer back to the description they wrote and the files they uploaded to answer. Without the panel, that context is gone. The problem is identical to J1; only the source differs.

| Phase | J1 | J2 |
|---|---|---|
| Setup | Panel expanded (req + gap analysis) | No panel — form is the reference |
| Clarification | Panel expanded (req + files + Q&A) | Panel expanded (user description + files + Q&A) |
| Triage | Panel auto-collapses to rail | Panel auto-collapses to rail |

---

## 10. The Three-AI-Interaction Levels

**Design principle (inherited from broader design system):**

| Level | Pattern | When |
|---|---|---|
| L1 Ambient | Inline quality scores, confidence badges | Always visible, no user action required |
| L2 Inline | Clarification cards, gap hints, confidence explanations | User-triggered within the task flow |
| L3 Chat | Kai drawer (right side) | User explicitly opens Kai for open-ended dialogue |

The workspace should not introduce a fourth pattern. Clarification questions are L2 (inline, contextual). Persistent Q&A in the reference panel is L2 display. Kai is the only L3 surface. Any new AI interaction should slot into one of these three levels.

---

## Summary of Key Tradeoffs

| Decision | Alternative considered | Reason rejected |
|---|---|---|
| Left reference panel | Right-side panel | Conflicts with Kai drawer; breaks spatial continuity from ReqDetailPage |
| Auto-collapse during triage | Keep expanded | DetailPanel needs space; triage focus shifts away from requirement |
| Accept = immediate persist | Batch commit at end | End-of-session commit required "accept or reject everything" — too rigid |
| Execute = modal | Execute = toast/immediate | Consequential action needs confirmation + run naming |
| End state = Accepted tab | End state = completion card | Completion card blocks access to accepted cases on return visits |
| Stable table columns | Column swap on select | Column reflow on selection is disorienting; removes multi-select |
