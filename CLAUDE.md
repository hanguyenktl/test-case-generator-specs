# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build to /dist
npm run lint      # ESLint across all files
npm run preview   # Preview production build locally
```

There is no automated test framework. All testing is done manually in the browser.

## Architecture: Hub + Prototypes

This is a **Vite + React SPA** structured as a prototype hub — a shared shell that hosts independent prototype modules. Each prototype is a self-contained module with its own components, state, and data.

**Routing** (`src/App.jsx`):
- `/` → Hub homepage (`src/pages/Directory.jsx`) listing all prototypes
- `/prototypes/manual-test-authoring` → Legacy manual step editor with AI quality scoring
- `/prototypes/ai-test-case-generation` → Active J1/J2 AI generation workflow

**Shell** (`src/components/shell/`): Global Layout, Sidebar, and TopBar — do not modify per-prototype.

**Shared components** (`src/components/shared/`): Barrel-exported from `index.jsx`. Includes `TestCaseTable`, `ListToolbar`, `RightDrawer`, `Button` (IBtn), and badge components used across both prototypes.

## Design Token Contract

All colors, spacing, and typography come from `src/utils/design-system.js`:

- **`T.*`** — color tokens (e.g. `T.bg`, `T.card`, `T.brand`, `T.green`, `T.red`)
- **`F`** — font family settings

**Do not use hardcoded hex values.** New components must consume `T.*` tokens.

## Prototypes

### AI Test Case Generation (`src/prototypes/ai-test-case-generation/`) — Active
The primary active prototype. Orchestrates a multi-step J1/J2 pipeline:
- **J1 journey**: Requirement-linked flow (ReqDetailPage entry)
- **J2 journey**: Document-based flow (TestCaseListPage entry)

These journeys have different pipeline topologies and must remain separate code paths.

State layers (all in `index.jsx`, ~563 lines):
1. Clarification cards (pre-generation gap questions)
2. Streamed generation results
3. User accept/reject decisions
4. Existing linked test cases

All data is mocked — no backend integration. Generation is simulated via `setTimeout`/`setInterval`.

### Manual Test Authoring (`src/prototypes/manual-test-authoring/`) — Legacy
Step editor with AI quality scoring via `utils/QualityEngine.js`. Archived and not actively developed. The `docs/` folder inside this prototype contains detailed agent specs, scoring logic, and UX analysis — read these before touching the quality scoring system.

## Key Docs

- `docs/LESSONS_LEARNED.md` — 21 architectural and prompt-engineering decisions with rationales. Read before making structural changes.
- `CHANGELOG.md` — Pipeline versioning history (v4.0+), tracks every prompt and logic change.
- `src/prototypes/manual-test-authoring/docs/agents/` — LLM agent specs (Analyzer J1/J2, Generator).
- `src/prototypes/manual-test-authoring/docs/deterministic_logic/` — Scoring rules and quality verification contracts.

## Tech Stack

| | |
|---|---|
| React 18 + React Router 7 | UI and client routing |
| Vite 5 | Dev server and bundler |
| Tailwind CSS 3 | Utility styling (no theme customization) |
| lucide-react | Icons |
| ReactFlow 11 | Flow/graph visualization (manual authoring prototype) |

No external state management (no Redux/Zustand) — React hooks and local state only.
