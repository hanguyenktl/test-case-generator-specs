import { useState, useMemo, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS — Revised v2: Recalibrated from real-world testing
// ═══════════════════════════════════════════════════════════════

const DIMENSION_WEIGHTS = {
  structure: 0.15,       // ↑ from 0.10 — foundational
  clarity: 0.20,         // unchanged
  completeness: 0.15,    // ↓ from 0.20 — was biggest score-killer
  testability: 0.20,     // unchanged
  specificity: 0.10,     // ↓ from 0.15 — LLM compensates
  atomicity: 0.05,       // unchanged
  consistency: 0.05,     // unchanged
  runnerReadiness: 0.10, // ↑ from 0.05 — directly impacts product value
};

// ─── TWO-TIER AMBIGUITY (v2) ───
// Tier 1: Always flag — genuinely untestable without qualification
const ALWAYS_AMBIGUOUS = [
  'good','bad','nice','proper','appropriate',
  'adequate','sufficient','reasonable','acceptable','suitable',
  'beautiful','elegant','smart',
  'better','improved','enhanced','optimized',
  'major','minor','significant',
];

// Tier 2: Flag only when standalone (no parenthetical/numeric qualifier nearby)
const CONTEXTUAL_AMBIGUOUS = [
  'fast','slow','quick',
  'simple','complex','easy',
  'intuitive','user-friendly','clean','modern',
  'secure','reliable','stable','performant','robust','scalable',
  'efficient','effective','optimal',
  'responsive','seamless','smooth',
  'clear','obvious','straightforward',
  'consistent','similar',
  'large','small',
];

const VAGUE_QUANTIFIERS = [
  'some','few','many','several','most','various','a lot','lots of','numerous',
  'a number of','frequently','occasionally','sometimes','often','rarely',
  'quickly','slowly','briefly','shortly','approximately','about','around',
  'roughly','etc','and so on','and more','and others','among others',
  'as needed','as appropriate','as required','as necessary','if possible',
  'if applicable','where appropriate','in a timely manner','in a reasonable time',
];

// REVISED: Removed "the system", "the user", "the page", etc. — normal JIRA language
const UNDEFINED_REFERENCES = [
  /\bit should\b/i, /\bthey should\b/i, /\bthis should\b/i,
  /\bsame as before\b/i, /\bexisting behavior\b/i,
  /\bcurrent functionality\b/i, /\bstandard (?:way|approach|method)\b/i,
];

// REMOVED: Passive voice patterns — too noisy, low signal-to-noise

// ─── BROADENED TESTABILITY SIGNALS (v2) ───
const TESTABILITY_POSITIVE = [
  /\b(?:displays?|shows?|returns?|redirects?\s+to|navigates?\s+to)\b/i,
  /\b(?:enabled?|disabled?|visible|hidden|active|inactive|checked|unchecked)\b/i,
  /\b(?:equals?|matches?|contains?|includes?)\b/i,
  /\b(?:increases?|decreases?|changes?\s+(?:to|from))\b/i,
  // NEW: existence, appearance, state
  /\b(?:exists?|appears?|disappears?|opens?|closes?|expands?|collapses?)\b/i,
  /\b(?:triggers?|starts?|stops?|completes?|finishes?)\b/i,
  /\b(?:creates?|removes?|deletes?|updates?|saves?|adds?)\b/i,
  /\b(?:sends?|receives?|accepts?|rejects?|validates?)\b/i,
  /\b(?:filters?|sorts?|searches?|exports?|imports?|uploads?|downloads?)\b/i,
  /\b(?:selects?|enters?|submits?|confirms?|denies?|blocks?)\b/i,
  /\b(?:lists?|renders?|populates?|highlights?|indicates?)\b/i,
  // State changes
  /\b(?:success(?:fully)?|error|warning|info)\s+(?:message|notification|toast|banner|alert)\b/i,
  /\b(?:status\s+(?:changes?\s+to|becomes?|updates?\s+to))\b/i,
  /\b\d+\s*(?:%|percent|items?|records?|rows?|seconds?|ms|minutes?|px|results?)\b/i,
  /\b(?:logged (?:in|out)|authenticated|authorized|granted|revoked)\b/i,
  // Flow descriptions (NEW)
  /→|->|>>|then\s/i,
];

// REDUCED negative signals
const TESTABILITY_NEGATIVE = [
  /\b(?:user[- ]friendly|intuitive|easy to use|clean|modern|nice)\b/i,
  /\b(?:looks? good|feels? right|works? (?:well|properly|correctly))\b/i,
  // REMOVED: "improve", "better", "enhance", "optimize", "maintain", "ensure", "support"
  /\b(?:refactor|clean up|technical debt|code quality)\b/i,
  /\b(?:implement|build|develop|create)\s+(?:a\s+)?(?:service|module|component|class|function|endpoint)\b/i,
];

// ─── COVERAGE SIGNALS (v2 — replaces SCENARIO_SIGNALS) ───
const COVERAGE_SIGNALS = {
  error_handling: {
    patterns: [/\b(?:error|fail|invalid|incorrect|wrong|bad|reject|denied|unauthorized|forbidden|timeout|unavailable)\b/i, /\b(?:exception|crash|500|404|403|401)\b/i, /\b(?:what happens (?:if|when))\b/i],
    type: 'core', bonus: 15, missingSeverity: 'minor',
    missingMessage: 'No error or failure scenarios mentioned — consider what happens when things go wrong.',
    missingSuggestion: 'Consider if error/failure scenarios are relevant for this feature.',
  },
  boundary_conditions: {
    patterns: [/\b(?:maximum|minimum|max|min|limit|boundary|at least|at most|up to|no more than|between)\b/i, /\b(?:first|last|empty|zero|one|single|multiple|overflow|truncat)\b/i, /\d+\s*(?:characters?|items?|rows?|records?|entries|users?|ms|seconds?|minutes?|%|percent)/i],
    type: 'contextual', bonus: 10,
  },
  user_roles: {
    patterns: [/\b(?:admin|manager|editor|viewer|owner|member|guest|anonymous|public)\b/i, /\b(?:role|permission|access|authorize|authenticate|login|privilege)\b/i],
    type: 'contextual', bonus: 8,
  },
  empty_null_states: {
    patterns: [/\b(?:empty|no (?:data|results?|items?)|blank|null|none|zero results?|nothing)\b/i, /\b(?:first time|new user|fresh|initial state|default)\b/i],
    type: 'contextual', bonus: 6,
  },
  data_validation: {
    patterns: [/\b(?:valid|invalid|format|required|optional|mandatory|allowed|accepted)\b/i, /\b(?:email|phone|date|number|url)\b/i],
    type: 'contextual', bonus: 6,
  },
  concurrency_state: {
    patterns: [/\b(?:concurrent|simultaneous|multiple users?|at the same time|race|lock|conflict)\b/i, /\b(?:real-?time|live update|refresh|sync|stale|cache)\b/i],
    type: 'contextual', bonus: 4,
  },
  loading_performance: {
    patterns: [/\b(?:load(?:ing)?|performance|speed|latency|response time)\b/i, /\b(?:within\s+\d+\s*(?:ms|seconds?|s\b)|spinner|progress|skeleton)\b/i],
    type: 'contextual', bonus: 4,
  },
  navigation_flow: {
    patterns: [/\b(?:redirect|navigate|back button|cancel|breadcrumb|deep link|route)\b/i, /\b(?:modal|dialog|drawer|popup|overlay|confirmation)\b/i, /\b(?:step\s+\d|wizard|workflow|flow|sequence|next|previous)\b/i],
    type: 'contextual', bonus: 4,
  },
};

const COMMON_ACRONYMS = ['API','URL','UI','UX','CSV','PDF','HTML','CSS','JS','DB','SQL','REST','HTTP','HTTPS','SSO','RBAC','CRUD','ID','SSN','QA','UAT','SIT','PRD','US','EU','UK','CTA','KRE','TC','KSE','MCP','AI','SCIM'];

// ═══════════════════════════════════════════════════════════════
// SECTION HEADERS — Expanded task detection (v2)
// ═══════════════════════════════════════════════════════════════

const SECTION_HEADERS = {
  acceptance_criteria: [
    /^#{0,4}\s*\**acceptance\s*criteria\**\s*:?\s*$/i, /^#{0,4}\s*\**ac\**\s*:?\s*$/i,
    /^#{0,4}\s*\**acs\**\s*:?\s*$/i, /^#{0,4}\s*\**expected\s+behavior\**\s*:?\s*$/i,
    /^#{0,4}\s*\**expected\s+results?\**\s*:?\s*$/i, /^#{0,4}\s*\**requirements?\**\s*:?\s*$/i,
    /^#{0,4}\s*\**criteria\**\s*:?\s*$/i, /^#{0,4}\s*\**conditions?\s+of\s+satisfaction\**\s*:?\s*$/i,
  ],
  ac_inline: /^\**acceptance\s*criteria\**\s*:?\s*/i,
  ac_numbered: /^#{1,4}\s*\**ac\s*\d+/i,
  gherkin: [/^(?:scenario|feature)\s*:?\s*/i, /^given\s+/i],
  notes: [/^#{0,4}\s*\**notes?\**\s*:?\s*$/i, /^#{0,4}\s*\**comments?\**\s*:?\s*$/i, /^#{0,4}\s*\**additional\s+/i, /^#{0,4}\s*\**out\s+of\s+scope/i, /^#{0,4}\s*\**context\**\s*:?\s*$/i, /^#{0,4}\s*\**preconditions?\**\s*:?\s*$/i],
  dod: [/^(?:definition\s+of\s+done|dod)\s*:?\s*$/i, /^done\s+when\s*:?\s*$/i],
  // EXPANDED task detection (v2)
  technical: [
    /^#{0,4}\s*\**tech(?:nical)?\s+notes?\**\s*:?\s*$/i,
    /^#{0,4}\s*\**implementation\s+/i,
    /^#{0,4}\s*\**tasks?\**\s*:?\s*$/i,
    /^#{0,4}\s*\**sub-?tasks?\**\s*:?\s*$/i,
    /^#{0,4}\s*\**development\s+tasks?\**\s*:?\s*$/i,
    /^#{0,4}\s*\**engineering\s+tasks?\**\s*:?\s*$/i,
    /^#{0,4}\s*\**action\s+items?\**\s*:?\s*$/i,
    /^#{0,4}\s*\**todo\**\s*:?\s*$/i,
    /^#{0,4}\s*\**work\s+items?\**\s*:?\s*$/i,
    /^#{0,4}\s*\**steps?\s+to\s+(?:implement|build|develop|complete)\**\s*:?\s*$/i,
  ],
  description: [/^#{0,4}\s*\**description\**\s*:?\s*$/i, /^#{0,4}\s*\**summary\**\s*:?\s*$/i, /^#{0,4}\s*\**overview\**\s*:?\s*$/i, /^#{0,4}\s*\**background\**\s*:?\s*$/i],
};

// Sub-section patterns for block-level extraction (v2)
const SUB_SECTION_PATTERNS = [
  /^(?:AC|ac)\s*\d+\s*[:–—.-]\s*/,
  /^\*{1,2}(?:AC|Scenario|Case)\s*\d*\s*[:–—.-]/,
  /^#{1,4}\s+(?:AC|Scenario|Case|Test)\s*\d*/,
  /^\d+\.\d+\s/,
];

// Task line patterns for inline task detection (v2)
const TASK_LINE_PATTERNS = [
  /^(?:implement|build|develop|create|add|set up|configure|deploy|migrate|refactor)\s+/i,
  /^(?:write|update|fix|remove|integrate|test|review|document)\s+(?:the\s+)?(?:code|test|api|service|component|module|endpoint|pipeline)/i,
  /^(?:FE|BE|QA|DevOps)\s*[:|-]/i,
];


// ═══════════════════════════════════════════════════════════════
// STEP 1: BLOCK-LEVEL STRUCTURE EXTRACTION (MAJOR v2 REVISION)
// ═══════════════════════════════════════════════════════════════

function extractUserStory(text) {
  if (!text) return { detected: false, persona: null, goal: null, benefit: null };
  const patterns = [
    /[Aa]s\s+(?:a|an)\s+(.+?),?\s+[Ii]\s+want\s+(?:to\s+)?(.+?)(?:,?\s+[Ss]o\s+that\s+(.+?))?(?:\.|$)/m,
    /\*\*[Aa]s\s+(?:a|an)\*\*\s+(.+?),?\s+\n?\*\*[Ii]\s+want\*\*\s+(?:to\s+)?(.+?)(?:,?\s+\n?\*\*[Ss]o\s+that\*\*\s+(.+?))?(?:\.|$)/m,
    /[Aa]s\s+(?:a|an)\s+\*\*(.+?)\*\*,?\s+[Ii]\s+want\s+(?:to\s+)?(.+?)(?:,?\s+[Ss]o\s+that\s+(.+?))?(?:\.|$)/m,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return { detected: true, persona: m[1]?.trim().replace(/\*+/g,'') || null, goal: m[2]?.trim().replace(/\*+/g,'') || null, benefit: m[3]?.trim().replace(/\*+/g,'') || null };
  }
  return { detected: false, persona: null, goal: null, benefit: null };
}

// ─── PREAMBLE DETECTION (v2 NEW) ───
function isPreamble(line, lines, index) {
  const trimmed = line.trim();
  // Rule 1: Line ends with ":" and next line starts a list
  if (trimmed.endsWith(':') && index !== undefined && index + 1 < lines.length) {
    const nextLine = lines[index + 1]?.trim();
    if (nextLine && /^[-*•\d]/.test(nextLine)) return true;
  }
  // Rule 2: Contains "following" or "below" and ends with ":"
  if (/\b(?:following|below|as follows|listed below)\b/i.test(trimmed) && /:\s*$/.test(trimmed)) return true;
  // Rule 3: "should support/include/have" followed by list
  if (/\b(?:should\s+(?:support|include|have|provide|handle|cover)|must\s+(?:support|include|have))\b/i.test(trimmed)) {
    if (trimmed.endsWith(':')) return true;
    if (index !== undefined && index + 1 < lines.length) {
      const nextLine = lines[index + 1]?.trim();
      if (nextLine && /^[-*•\d]/.test(nextLine)) return true;
    }
  }
  // Rule 4: Very short line that's just a label/header
  if (trimmed.length < 30 && /:\s*$/.test(trimmed)) return true;
  return false;
}

function classifyLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return 'empty';
  for (const p of SECTION_HEADERS.acceptance_criteria) { if (p.test(trimmed)) return 'ac_header'; }
  if (SECTION_HEADERS.ac_inline.test(trimmed)) return 'ac_inline';
  if (SECTION_HEADERS.ac_numbered.test(trimmed)) return 'ac_numbered';
  for (const p of SECTION_HEADERS.gherkin) { if (p.test(trimmed)) return 'gherkin'; }
  for (const p of SECTION_HEADERS.notes) { if (p.test(trimmed)) return 'notes_header'; }
  for (const p of SECTION_HEADERS.dod) { if (p.test(trimmed)) return 'dod_header'; }
  for (const p of SECTION_HEADERS.technical) { if (p.test(trimmed)) return 'tech_header'; }
  for (const p of SECTION_HEADERS.description) { if (p.test(trimmed)) return 'desc_header'; }
  if (SUB_SECTION_PATTERNS.some(p => p.test(trimmed))) return 'ac_sub_section';
  if (/^[-*•]\s+/.test(trimmed)) return 'bullet';
  if (/^\d+[.)]\s+/.test(trimmed)) return 'numbered';
  if (/^\[[ xX]?\]\s+/.test(trimmed)) return 'checkbox';
  if (/^---+$/.test(trimmed)) return 'separator';
  if (/^\|.+\|/.test(trimmed)) return 'table';
  if (/^#{1,6}\s/.test(trimmed)) return 'heading';
  return 'text';
}

// ─── BLOCK-LEVEL EXTRACTION (v2 core change) ───
function extractStructure(description) {
  if (!description || description.trim().length === 0) {
    return {
      userStory: { detected: false, persona: null, goal: null, benefit: null },
      extractedACs: [], sections: { description: '', notes: [], definitionOfDone: [], technicalNotes: [], tasks: [] },
      descriptionLength: 0, hasStructuredSections: false, detectedFormat: 'prose_only',
    };
  }

  const text = description.replace(/<custom[^>]*>.*?<\/custom>/g, '[link]').replace(/\*\*/g, '');
  const lines = text.split('\n');
  const userStory = extractUserStory(text);
  const extractedACs = [];
  const notes = [];
  const technicalNotes = [];
  const tasks = [];
  const dod = [];
  const descLines = [];
  
  let currentSection = 'description';
  let currentSubHeader = null;
  let currentSubChildren = [];
  let formats = new Set();
  let gherkinBlock = null;

  // Helper: flush sub-section block
  function flushSubSection() {
    if (currentSubHeader !== null) {
      const childText = currentSubChildren.length > 0 ? currentSubChildren.join('; ') : '';
      const fullText = childText ? `${currentSubHeader}: ${childText}` : currentSubHeader;
      extractedACs.push({
        id: `EAC-${extractedACs.length + 1}`,
        text: fullText,
        children: [...currentSubChildren],
        parentContext: currentSubHeader,
        source: 'sub_section',
        confidence: 'high',
        blockType: currentSubChildren.length > 0 ? 'parent_with_children' : 'single_line',
        originalLines: [currentSubHeader, ...currentSubChildren],
      });
      currentSubHeader = null;
      currentSubChildren = [];
    }
  }

  // Helper: flush gherkin block
  function flushGherkin() {
    if (gherkinBlock && gherkinBlock.steps.length > 0) {
      const summary = gherkinBlock.scenarioName
        ? `${gherkinBlock.scenarioName}: ${gherkinBlock.steps.join('; ')}`
        : gherkinBlock.steps.join('; ');
      extractedACs.push({
        id: `EAC-${extractedACs.length + 1}`,
        text: summary,
        children: [...gherkinBlock.steps],
        parentContext: gherkinBlock.scenarioName,
        source: 'gherkin_scenario',
        confidence: 'high',
        blockType: 'gherkin_scenario',
        originalLines: [...gherkinBlock.steps],
      });
      formats.add('gherkin');
    }
    gherkinBlock = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const type = classifyLine(trimmed);

    // Section transitions
    if (type === 'ac_header' || type === 'ac_inline') {
      flushSubSection(); flushGherkin();
      currentSection = 'ac'; formats.add('explicit_ac'); continue;
    }
    if (type === 'ac_sub_section' && (currentSection === 'ac' || currentSection === 'ac_sub' || currentSection === 'description')) {
      flushSubSection(); flushGherkin();
      currentSection = 'ac_sub';
      currentSubHeader = trimmed.replace(/^(?:AC|ac)\s*\d+\s*[:–—.-]\s*/, '')
        .replace(/^#+\s*/, '').replace(/^\*+/, '').trim();
      formats.add('explicit_ac');
      continue;
    }
    if (type === 'notes_header') { flushSubSection(); flushGherkin(); currentSection = 'notes'; continue; }
    if (type === 'dod_header') { flushSubSection(); flushGherkin(); currentSection = 'dod'; continue; }
    if (type === 'tech_header') { flushSubSection(); flushGherkin(); currentSection = 'technical'; continue; }
    if (type === 'desc_header') { flushSubSection(); flushGherkin(); currentSection = 'description'; continue; }
    if (type === 'separator' || type === 'empty') continue;

    // Gherkin handling — group into scenario blocks (v2)
    if (type === 'gherkin' || (currentSection === 'gherkin_block')) {
      if (/^(?:scenario|scenario outline)\s*:\s*/i.test(trimmed)) {
        flushGherkin();
        gherkinBlock = { scenarioName: trimmed.replace(/^(?:scenario|scenario outline)\s*:\s*/i, '').trim(), steps: [] };
        currentSection = 'gherkin_block';
        continue;
      }
      if (/^(?:given|when|then|and|but)\s+/i.test(trimmed)) {
        if (!gherkinBlock) gherkinBlock = { scenarioName: null, steps: [] };
        gherkinBlock.steps.push(trimmed);
        currentSection = 'gherkin_block';
        continue;
      }
      // Non-gherkin line after gherkin context
      if (gherkinBlock) { flushGherkin(); currentSection = 'ac'; }
    }
    // Also catch gherkin keywords in other sections
    if (/^(?:given|when|then|and|but)\s+/i.test(trimmed) && (currentSection === 'ac' || currentSection === 'description')) {
      if (!gherkinBlock) gherkinBlock = { scenarioName: null, steps: [] };
      gherkinBlock.steps.push(trimmed);
      currentSection = 'gherkin_block';
      continue;
    }

    // Table handling — row = 1 AC (v2)
    if (type === 'table') {
      if (currentSection === 'ac' || currentSection === 'ac_sub') {
        // Proper separator detection: check if ALL cells are only dashes/colons/spaces
        const rawCells = trimmed.split('|').map(c => c.trim()).filter(c => c.length > 0);
        const isSeparator = rawCells.length > 0 && rawCells.every(c => /^[-:\s]+$/.test(c));
        // Also skip header rows (first data row after separator not seen yet)
        const isHeaderRow = rawCells.length > 0 && rawCells.every(c => /^(?:MUST\s*HAVE|TBD|STATUS|PRIORITY|COLUMN|HEADER|TYPE|NAME|DESCRIPTION|ROLE|ACTION|SCOPE)$/i.test(c) || c.length <= 3);
        
        if (!isSeparator && !isHeaderRow) {
          const cells = rawCells.filter(c => !/^-+$/.test(c));
          const significantCells = cells.filter(c => c.length > 5 && !/^\*/.test(c));
          if (significantCells.length > 0) {
            const rowText = significantCells.join(' | ');
            extractedACs.push({
              id: `EAC-${extractedACs.length + 1}`,
              text: rowText,
              children: significantCells,
              parentContext: currentSubHeader,
              source: 'table_row',
              confidence: 'medium',
              blockType: 'table_row',
              originalLines: [trimmed],
            });
          }
        }
      }
      continue;
    }

    // Content routing
    if (currentSection === 'ac' || currentSection === 'ac_sub') {
      const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
      const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)/);
      const checkboxMatch = trimmed.match(/^\[[ xX]?\]\s+(.+)/);

      if (bulletMatch || numberedMatch || checkboxMatch) {
        const acText = (bulletMatch || numberedMatch || checkboxMatch)[1].trim();
        
        // Skip task lines (v2)
        if (TASK_LINE_PATTERNS.some(p => p.test(acText))) {
          tasks.push(acText);
          continue;
        }

        // Skip preamble lines (v2)
        if (isPreamble(acText, lines.map(l => l.trim()), i)) continue;

        if (acText.length > 5) {
          if (currentSubHeader !== null) {
            // Child of sub-section
            currentSubChildren.push(acText);
          } else {
            // Check for indented sub-bullets (v2 — parent_with_children)
            const children = [];
            let j = i + 1;
            while (j < lines.length) {
              const nextTrimmed = lines[j].trim();
              const indent = lines[j].match(/^(\s+)/);
              const subMatch = nextTrimmed.match(/^[-*•]\s+(.+)/);
              if (indent && indent[1].length >= 2 && subMatch) {
                const childText = subMatch[1].trim();
                if (!TASK_LINE_PATTERNS.some(p => p.test(childText))) {
                  children.push(childText);
                }
                j++;
              } else break;
            }
            if (children.length > 0) i = j - 1;

            const fullText = children.length > 0 ? `${acText}: ${children.join('; ')}` : acText;
            extractedACs.push({
              id: `EAC-${extractedACs.length + 1}`,
              text: fullText,
              children: children,
              parentContext: null,
              source: bulletMatch ? 'explicit_header' : 'numbered_list',
              confidence: 'high',
              blockType: children.length > 0 ? 'parent_with_children' : 'single_line',
              originalLines: [trimmed],
            });
          }
        }
      } else if (trimmed.length > 15 && type === 'text') {
        // Skip preamble and task lines
        if (isPreamble(trimmed, lines.map(l => l.trim()), i)) continue;
        if (TASK_LINE_PATTERNS.some(p => p.test(trimmed))) { tasks.push(trimmed); continue; }
        if (/^(?:condition|expected|title|message|cta|reminder|display|enforcement)/i.test(trimmed)) {
          if (currentSubHeader !== null) { currentSubChildren.push(trimmed); }
          continue;
        }
        if (currentSubHeader !== null) {
          currentSubChildren.push(trimmed);
        } else {
          extractedACs.push({
            id: `EAC-${extractedACs.length + 1}`, text: trimmed,
            children: [], parentContext: null,
            source: 'explicit_header', confidence: 'medium',
            blockType: 'single_line', originalLines: [trimmed],
          });
        }
      }
    } else if (currentSection === 'notes') {
      if (trimmed.length > 5) notes.push(trimmed);
    } else if (currentSection === 'technical') {
      if (trimmed.length > 5) {
        // Check if it's a task line
        const bm = trimmed.match(/^[-*•]\s+(.+)/) || trimmed.match(/^\d+[.)]\s+(.+)/);
        const content = bm ? bm[1].trim() : trimmed;
        if (TASK_LINE_PATTERNS.some(p => p.test(content))) {
          tasks.push(content);
        } else {
          technicalNotes.push(content);
        }
      }
    } else if (currentSection === 'dod') {
      if (trimmed.length > 5) dod.push(trimmed);
    } else {
      if (trimmed.length > 5) descLines.push(trimmed);
    }
  }

  // Flush remaining blocks
  flushSubSection();
  flushGherkin();

  // PASS 4: If no ACs found, infer from bullet blocks (v2 — with preamble/task detection)
  if (extractedACs.length === 0) {
    const allLines = lines.map(l => l.trim());
    for (let i = 0; i < allLines.length; i++) {
      const trimmed = allLines[i];
      const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
      if (!bulletMatch) continue;
      const t = bulletMatch[1].trim();
      if (/^(?:note|fyi|todo|fixme|hack|see also|refer to|consider)/i.test(t)) continue;
      if (/^(?:out of scope|won't do|not included|future)/i.test(t)) continue;
      if (TASK_LINE_PATTERNS.some(p => p.test(t))) { tasks.push(t); continue; }
      if (isPreamble(t, allLines, i)) continue;
      // v2 broadened: extract any bullet that looks like a requirement, not just narrow keyword matches
      const hasActionKeyword = /(?:should|must|shall|will|can|able to|display|show|allow|enable|prevent|restrict|validate|return|redirect|load|support|exists?|appears?|opens?|creates?|indicates?|triggers?|starts?|completes?)/i.test(t)
        || /(?:within|at least|at most|maximum|minimum|no more than|up to|\d+\s*(?:ms|sec|min|%))/i.test(t)
        || /→|->|>>/i.test(t);
      // Also accept bullets with domain/feature language even without action verbs
      const hasFeatureLanguage = /(?:improv|enhanc|updat|upgrad|chang|optimi|increas|decreas|reduc|add|remov|replac|migrat|integrat|configur|automat)/i.test(t)
        || /(?:filter|render|sort|search|export|import|upload|download|navigat|redirect|display|chart|dashboard|report|analytic|metric|visual|perform|latenc|speed|respons|loading|caching)/i.test(t)
        || /(?:capabilit|feature|function|behavior|workflow|process|interaction|experience|interface|component|module|service|endpoint|page|view|panel|modal|form|button|field|input|table|list)/i.test(t);
      const isRequirementLike = hasActionKeyword || (hasFeatureLanguage && t.length > 10);
      if (isRequirementLike && t.length > 10) {
        // Check for sub-bullets
        const children = [];
        let j = i + 1;
        while (j < allLines.length) {
          const next = allLines[j];
          const indent = lines[j]?.match(/^(\s+)/);
          const subMatch = next.match(/^[-*•]\s+(.+)/);
          if (indent && indent[1].length >= 2 && subMatch) {
            children.push(subMatch[1].trim());
            j++;
          } else break;
        }
        if (children.length > 0) i = j - 1;
        
        const fullText = children.length > 0 ? `${t}: ${children.join('; ')}` : t;
        extractedACs.push({
          id: `EAC-${extractedACs.length + 1}`, text: fullText,
          children, parentContext: null,
          source: 'bullet_inferred', confidence: 'medium',
          blockType: children.length > 0 ? 'parent_with_children' : 'single_line',
          originalLines: [trimmed],
        });
        formats.add('bullet_list');
      }
    }
  }

  let detectedFormat = 'prose_only';
  if (formats.size > 1) detectedFormat = 'mixed';
  else if (formats.has('explicit_ac')) detectedFormat = 'explicit_ac';
  else if (formats.has('gherkin')) detectedFormat = 'gherkin';
  else if (formats.has('numbered_list')) detectedFormat = 'numbered_list';
  else if (formats.has('bullet_list')) detectedFormat = 'bullet_list';

  return {
    userStory, extractedACs,
    sections: { description: descLines.join('\n'), notes, definitionOfDone: dod, technicalNotes, tasks },
    descriptionLength: description.length,
    hasStructuredSections: formats.size > 0,
    detectedFormat,
  };
}


// ═══════════════════════════════════════════════════════════════
// STEP 2: RECALIBRATED DETERMINISTIC SCORING — v2
// ═══════════════════════════════════════════════════════════════

function scoreStructure(req, extracted) {
  let score = 0; const issues = [];

  // S-01: Description exists (EARLY RETURN on critical for cascade suppression)
  if (!req.description || req.description.trim().length < 20) {
    issues.push({ dimension:'structure', rule:'S-01', severity:'critical', message:'No description or too brief to analyze.', affected:'requirement', suggestion:'Add a description with user context, expected behavior, and acceptance criteria.' });
    return { score: 0, weight: DIMENSION_WEIGHTS.structure, issues };
  } else if (req.description.trim().length < 80) {
    score += 5;
    issues.push({ dimension:'structure', rule:'S-01', severity:'major', message:'Description is very short. More detail will produce better test cases.', affected:'requirement', suggestion:'Expand with user context, expected behavior, and key scenarios.' });
  } else if (req.description.trim().length < 200) { score += 12; }
  else { score += 18; }

  // S-02: Has extractable ACs (v2: ≤2 ACs = info, not minor)
  const acCount = extracted.extractedACs.length;
  if (acCount === 0) {
    issues.push({ dimension:'structure', rule:'S-02', severity:'critical', message:'No acceptance criteria could be identified.', affected:'requirement', suggestion:'Add an "Acceptance Criteria:" section with bullet points.' });
  } else if (acCount <= 2) {
    score += 15;
    issues.push({ dimension:'structure', rule:'S-02', severity:'info', message:`${acCount} acceptance criteria found — fine for a focused ticket, but consider if more scenarios apply.`, affected:'requirement', suggestion:'Most features benefit from 3-8 ACs covering main flows and key edge cases.' });
  } else if (acCount <= 15) { score += 25; }
  else {
    score += 20;
    issues.push({ dimension:'structure', rule:'S-02', severity:'info', message:`${acCount} ACs found — consider splitting into smaller stories.`, affected:'requirement', suggestion:'Stories with >15 ACs can produce unfocused test suites.' });
  }

  // S-03: User story
  if (extracted.userStory.detected) {
    score += 15;
    if (!extracted.userStory.benefit) {
      score -= 5;
      issues.push({ dimension:'structure', rule:'S-03', severity:'info', message:'User story missing "so that" benefit.', affected:'requirement', suggestion:'Adding "so that [benefit]" helps testers understand purpose.' });
    }
  } else { score += 5; }

  // S-04: AC extraction confidence (v2: severity downgrades)
  const highConf = extracted.extractedACs.filter(ac => ac.confidence === 'high');
  const ratio = acCount > 0 ? highConf.length / acCount : 0;
  if (ratio >= 0.8) { score += 22; }
  else if (ratio >= 0.5) {
    score += 14;
    issues.push({ dimension:'structure', rule:'S-04', severity:'info', message:'Some ACs were inferred from bullet points — adding an "Acceptance Criteria:" header improves accuracy.', affected:'requirement', suggestion:'Explicit AC section headers help both humans and AI.' });
  } else if (acCount > 0) {
    score += 7;
    issues.push({ dimension:'structure', rule:'S-04', severity:'minor', message:'Most ACs inferred from unstructured text — extraction confidence is low.', affected:'requirement', suggestion:'Restructure with "Acceptance Criteria:" section and bullet points.' });
  }

  // S-05: Notes/technical separated
  if (extracted.sections.notes.length > 0 || extracted.sections.technicalNotes.length > 0 || extracted.sections.tasks.length > 0) score += 5;

  // S-06: Title descriptiveness (v2: severity info)
  if (req.summary.split(/\s+/).length >= 3) { score += 10; }
  else {
    issues.push({ dimension:'structure', rule:'S-06', severity:'info', message:`Title "${req.summary}" is very short.`, affected:'requirement', suggestion:'Descriptive titles help testers understand context at a glance.' });
  }

  return { score: Math.min(score, 100), weight: DIMENSION_WEIGHTS.structure, issues };
}

function scoreClarity(extracted) {
  let score = 100; const issues = [];
  if (extracted.extractedACs.length === 0) {
    return { score: 50, weight: DIMENSION_WEIGHTS.clarity, issues: [] };
  }

  // C-01: TWO-TIER ambiguity (v2)
  for (const ac of extracted.extractedACs) {
    const fullText = ac.text + ' ' + ac.children.join(' ');
    
    // Tier 1: Always flag
    const tier1Hits = ALWAYS_AMBIGUOUS.filter(adj => new RegExp(`\\b${adj}\\b`, 'i').test(fullText));
    if (tier1Hits.length > 0) {
      score -= Math.min(tier1Hits.length * 5, 12);
      issues.push({ dimension:'clarity', rule:'C-01', severity:'major', message:`"${ac.text.substring(0,80)}…" uses vague language: "${tier1Hits.join('", "')}"`, affected:ac.id, suggestion:'Replace with measurable criteria. E.g., "fast" → "under 2 seconds"' });
    }
    
    // Tier 2: Flag only if no qualifier nearby
    const tier2Hits = CONTEXTUAL_AMBIGUOUS.filter(adj => {
      const regex = new RegExp(`\\b${adj}\\b`, 'i');
      if (!regex.test(fullText)) return false;
      const hasQualifier = /\(.*\d.*\)|\b\d+\s*(?:ms|s|sec|min|%|px)\b/i.test(fullText);
      const hasReference = /\bconsistent with\b|\bsame as\b|\blike\b|\bmatching\b|\baccording to\b/i.test(fullText);
      return !hasQualifier && !hasReference;
    });
    if (tier2Hits.length > 0) {
      score -= Math.min(tier2Hits.length * 3, 8);
      issues.push({ dimension:'clarity', rule:'C-01b', severity:'minor', message:`"${ac.text.substring(0,80)}…" could be more specific: "${tier2Hits.join('", "')}"`, affected:ac.id, suggestion:`Consider adding measurable criteria for: ${tier2Hits.join(', ')}` });
    }
  }

  // C-02: Vague quantifiers (unchanged)
  for (const ac of extracted.extractedACs) {
    const fullText = ac.text + ' ' + ac.children.join(' ');
    const found = VAGUE_QUANTIFIERS.filter(vq => new RegExp(`\\b${vq.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(fullText));
    if (found.length > 0) {
      score -= Math.min(found.length * 4, 10);
      issues.push({ dimension:'clarity', rule:'C-02', severity:'major', message:`"${ac.text.substring(0,80)}…" uses vague quantifiers: "${found.join('", "')}"`, affected:ac.id, suggestion:'Replace with specific values. E.g., "several" → "5"' });
    }
  }

  // C-03: Undefined references (v2: reduced scope)
  for (const ac of extracted.extractedACs) {
    const fullText = ac.text + ' ' + ac.children.join(' ');
    const found = UNDEFINED_REFERENCES.filter(p => p.test(fullText));
    if (found.length > 0) {
      score -= Math.min(found.length * 3, 8);
      issues.push({ dimension:'clarity', rule:'C-03', severity:'minor', message:`"${ac.text.substring(0,80)}…" uses references without clear antecedent`, affected:ac.id, suggestion:'Replace pronouns with the specific thing: "it should" → "the dashboard should"' });
    }
  }

  // C-04: REMOVED (passive voice — too noisy in v1)

  // C-05: Conditional without alternative (v2: severity minor, not major)
  for (const ac of extracted.extractedACs) {
    const fullText = ac.text + ' ' + ac.children.join(' ');
    if (/\bif\b/i.test(fullText) && !/\b(?:otherwise|else|if not)\b/i.test(fullText)) {
      score -= 4;
      issues.push({ dimension:'clarity', rule:'C-05', severity:'minor', message:`"${ac.text.substring(0,80)}…" has "if" condition but no alternative path.`, affected:ac.id, suggestion:'Add: "If X, then Y. Otherwise, Z."' });
    }
  }

  // C-06: Multiple negations
  for (const ac of extracted.extractedACs) {
    const fullText = ac.text + ' ' + ac.children.join(' ');
    const negs = (fullText.match(/\b(?:not|no|never|don't|doesn't|shouldn't|won't|cannot|can't)\b/gi) || []);
    if (negs.length >= 2) {
      score -= 5;
      issues.push({ dimension:'clarity', rule:'C-06', severity:'minor', message:`"${ac.text.substring(0,80)}…" has multiple negations`, affected:ac.id, suggestion:'Rewrite positively.' });
    }
  }

  // C-07: Undefined acronyms
  const allText = [extracted.sections.description, ...extracted.extractedACs.map(ac => ac.text)].join(' ');
  const acronyms = allText.match(/\b[A-Z]{2,6}\b/g) || [];
  const unknown = [...new Set(acronyms)].filter(a => !COMMON_ACRONYMS.includes(a));
  if (unknown.length > 0) {
    score -= Math.min(unknown.length * 2, 8);
    issues.push({ dimension:'clarity', rule:'C-07', severity:'info', message:`Undefined acronyms: ${unknown.join(', ')}`, affected:'requirement', suggestion:'Define acronyms on first use.' });
  }

  return { score: Math.max(score, 0), weight: DIMENSION_WEIGHTS.clarity, issues };
}

// ─── COMPLETENESS: MAJOR v2 REVISION ───
function scoreCompleteness(extracted) {
  let score = 0; const issues = [];
  
  if (extracted.extractedACs.length === 0) {
    return { score: 0, weight: DIMENSION_WEIGHTS.completeness, issues: [{ dimension:'completeness', rule:'COMP-00', severity:'critical', message:'Cannot assess completeness — no acceptance criteria found.', affected:'requirement', suggestion:'Add acceptance criteria before generating test cases.' }] };
  }

  const allText = [
    extracted.sections.description,
    ...extracted.extractedACs.map(ac => ac.text),
    ...extracted.extractedACs.flatMap(ac => ac.children),
  ].join(' ');

  // BASE SCORE: Having coherent ACs (v2 — reward what IS there)
  const acCount = extracted.extractedACs.length;
  if (acCount <= 2) score = 30;
  else if (acCount <= 5) score = 45;
  else if (acCount <= 10) score = 55;
  else score = 50;

  // POSITIVE PATH CHECK (v2: broadened)
  const hasPositive = extracted.extractedACs.some(ac => {
    const txt = ac.text + ' ' + ac.children.join(' ');
    return /\b(?:should|must|shall|will|can|able to|displays?|shows?|returns?|exists?|appears?|opens?|loads?|allows?|enables?|creates?|provides?|supports?)\b/i.test(txt)
      && !/\b(?:error|fail|invalid|denied|rejected|blocked)\b/i.test(txt);
  });
  if (hasPositive) score += 10;
  else issues.push({ dimension:'completeness', rule:'COMP-POSITIVE', severity:'minor', message:'No clear positive/happy path scenario identified.', affected:'requirement', suggestion:'Ensure at least one AC describes the successful expected outcome.' });

  // COVERAGE SIGNAL BONUSES (v2: bonus model, not penalty)
  const missedSignals = [];
  for (const [name, signal] of Object.entries(COVERAGE_SIGNALS)) {
    const hasSignal = signal.patterns.some(p => p.test(allText));
    if (hasSignal) {
      score += signal.bonus;
    } else if (signal.type === 'core') {
      issues.push({ dimension:'completeness', rule:`COMP-${name}`, severity:signal.missingSeverity, message:signal.missingMessage, affected:'requirement', suggestion:signal.missingSuggestion, group:'coverage_gaps' });
    } else {
      missedSignals.push(name.replace(/_/g, ' '));
    }
  }
  // Group contextual misses into ONE info issue
  if (missedSignals.length > 0) {
    issues.push({ dimension:'completeness', rule:'COMP-COVERAGE', severity:'info', message:`Coverage opportunities: ${missedSignals.join(', ')}.`, affected:'requirement', suggestion:'Not all apply to every ticket — pick what\'s relevant for this feature.', group:'coverage_gaps' });
  }

  // COMP-RATIO
  const descWords = extracted.sections.description.split(/\s+/).length;
  if (descWords > 100 && acCount < 3) {
    score -= 10;
    issues.push({ dimension:'completeness', rule:'COMP-RATIO', severity:'minor', message:`Description is substantial (${descWords} words) but only ${acCount} ACs. Likely missing scenarios.`, affected:'requirement', suggestion:'Review description for implicit requirements that should be explicit ACs.' });
  }

  return { score: Math.min(score, 100), weight: DIMENSION_WEIGHTS.completeness, issues };
}

// ─── TESTABILITY: v2 BROADENED ───
function scoreTestability(extracted) {
  let score = 0; const issues = [];
  if (extracted.extractedACs.length === 0) return { score: 0, weight: DIMENSION_WEIGHTS.testability, issues: [] };

  for (const ac of extracted.extractedACs) {
    let t = 50;
    const fullText = ac.text + ' ' + ac.children.join(' ');
    
    const posHits = TESTABILITY_POSITIVE.filter(p => p.test(fullText));
    t += Math.min(posHits.length * 10, 40);
    const negHits = TESTABILITY_NEGATIVE.filter(p => p.test(fullText));
    t -= Math.min(negHits.length * 15, 40);

    // T-01: Too brief
    if (fullText.split(/\s+/).length < 4) {
      t -= 30;
      issues.push({ dimension:'testability', rule:'T-01', severity:'major', message:`"${ac.text}" is too brief to define a testable behavior.`, affected:ac.id, suggestion:'Expand: who does what, and what should happen.' });
    }
    // T-02: Implementation-only
    if (negHits.length > 0 && posHits.length === 0) {
      issues.push({ dimension:'testability', rule:'T-02', severity:'major', message:`"${ac.text.substring(0,80)}…" describes implementation or subjective quality, not observable behavior.`, affected:ac.id, suggestion:'Rewrite to describe what the USER sees or experiences.' });
    }
    // T-03: No verifiable outcome (v2: broadened + reduced penalty)
    const hasVerifiable = /\b(?:should|must|shall|will|can|displays?|shows?|returns?|is\s+(?:displayed|shown|visible|enabled|disabled)|exists?|appears?|opens?|loads?|creates?|allows?|enables?|indicates?|provides?|supports?)\b/i.test(fullText)
      || /→|->|>>/i.test(fullText);
    if (!hasVerifiable) {
      t -= 5;  // v2: ↓ from -15
      issues.push({ dimension:'testability', rule:'T-03', severity:'info', message:`"${ac.text.substring(0,80)}…" — consider adding an explicit expected outcome.`, affected:ac.id, suggestion:'Optionally add "then [outcome]" for clearer test expectations.' });
    }
    score += Math.max(Math.min(t, 100), 0);
  }
  score = Math.round(score / extracted.extractedACs.length);
  return { score, weight: DIMENSION_WEIGHTS.testability, issues };
}

// ─── SPECIFICITY: v2 REVISED ───
function scoreSpecificity(extracted) {
  let score = 0; const issues = [];
  const allText = extracted.extractedACs.map(ac => ac.text + ' ' + ac.children.join(' ')).join(' ') + ' ' + extracted.sections.description;

  // SP-01: Numeric thresholds (v2: severity info)
  if (/\b\d+\s*(?:%|percent|items?|records?|rows?|seconds?|ms|minutes?|hours?|days?|px|mb|gb|characters?|digits?|attempts?|retries?|results?|licenses?)\b/i.test(allText)) score += 25;
  else issues.push({ dimension:'specificity', rule:'SP-01', severity:'info', message:'No specific numeric thresholds found.', affected:'requirement', suggestion:'Where relevant, add concrete numbers: response times, max items, limits.' });

  // SP-02: Named UI elements (v2: broader detection)
  if (/\b(?:["'][\w\s&]+["']\s+(?:button|field|input|dropdown|link|tab|modal|page|menu|checkbox|radio|toggle|section|panel|card|icon))\b/i.test(allText)
    || /\b(?:(?:button|field|input|dropdown|link|tab)\s+(?:labeled|named|titled|called)\s+["'][\w\s]+["'])\b/i.test(allText)
    || /["'][\w\s&]+["']/i.test(allText)) score += 25;

  // SP-03: URLs/paths
  if (/(?:https?:\/\/|\/[\w-]+\/|page\s*:\s*\w|screen\s*:\s*\w)/i.test(allText)) score += 10;

  // SP-04: Data examples (v2: severity info)
  if (/\b(?:e\.?g\.?|example|such as|for instance|like)\s/i.test(allText)
    || /\b(?:format|pattern|regex|mask)\s*:\s/i.test(allText)
    || /["'][\w@.+\-\/]+["']/i.test(allText)) score += 15;
  else issues.push({ dimension:'specificity', rule:'SP-04', severity:'info', message:'No concrete data examples provided.', affected:'requirement', suggestion:'Where relevant, include examples: "e.g., john@example.com"' });

  // SP-05: Named roles (v2: don't re-flag if user story persona detected)
  if (/\b(?:admin(?:istrator)?|manager|editor|viewer|owner|member|guest|operator|analyst|lead|director)\b/i.test(allText)) score += 15;
  else if (extracted.userStory.detected && extracted.userStory.persona) score += 10;
  else if (/\buser\b/i.test(allText)) score += 5;

  // SP-06: Error details
  if (/\b(?:error\s*(?:message|code|text)\s*[:=]|"[^"]*error[^"]*"|status\s*(?:code)?\s*(?:4|5)\d{2})\b/i.test(allText)
    || /\b(?:displays?\s+["'][^"']+["']|shows?\s+["'][^"']+["']|message\s*:\s*["'][^"']+["'])\b/i.test(allText)) score += 10;

  return { score: Math.min(score, 100), weight: DIMENSION_WEIGHTS.specificity, issues };
}

// ─── ATOMICITY: UNCHANGED ───
function scoreAtomicity(extracted) {
  let score = 100; const issues = [];
  for (const ac of extracted.extractedACs) {
    const fullText = ac.text + ' ' + ac.children.join(' ');
    const shouldCount = (fullText.match(/\b(?:should|must|shall|will|can)\b/gi) || []).length;
    const andCount = (fullText.match(/\band\b/gi) || []).length;
    const semiCount = (fullText.match(/;/g) || []).length;
    // For parent_with_children blocks, be more lenient (children are expected to have multiple verbs)
    if (ac.blockType === 'parent_with_children' || ac.blockType === 'gherkin_scenario') continue;
    if (shouldCount >= 3 || (shouldCount >= 2 && andCount >= 2) || semiCount >= 2) {
      score -= 15;
      issues.push({ dimension:'atomicity', rule:'A-01', severity:'minor', message:`"${ac.text.substring(0,80)}…" has multiple behaviors.`, affected:ac.id, suggestion:'Split into separate ACs.' });
    }
    if (ac.text.split(/\s+/).length > 40) {
      score -= 10;
      issues.push({ dimension:'atomicity', rule:'A-02', severity:'info', message:`"${ac.text.substring(0,60)}…" is very long (${ac.text.split(/\s+/).length} words).`, affected:ac.id, suggestion:'Consider splitting.' });
    }
  }
  return { score: Math.max(score, 0), weight: DIMENSION_WEIGHTS.atomicity, issues };
}

// ─── CONSISTENCY: UNCHANGED ───
function jaccardSimilarity(a, b) {
  const setA = new Set(a.filter(w => w.length > 3));
  const setB = new Set(b.filter(w => w.length > 3));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function scoreConsistency(extracted) {
  let score = 100; const issues = [];
  const roleACs = extracted.extractedACs.filter(ac => /\b(?:admin|user|manager|role|permission|access|restrict|only|all)\b/i.test(ac.text + ' ' + ac.children.join(' ')));
  if (roleACs.length >= 2) {
    const hasRestriction = roleACs.some(ac => /\b(?:only|restrict|admin|specific)\b/i.test(ac.text + ' ' + ac.children.join(' ')));
    const hasOpen = roleACs.some(ac => /\b(?:all users?|everyone|any user|public)\b/i.test(ac.text + ' ' + ac.children.join(' ')));
    if (hasRestriction && hasOpen) {
      score -= 20;
      issues.push({ dimension:'consistency', rule:'CON-01', severity:'major', message:'Contradictory access permissions.', affected:'requirement', suggestion:'Clarify role-based access.' });
    }
  }
  for (let i = 0; i < extracted.extractedACs.length; i++) {
    for (let j = i + 1; j < extracted.extractedACs.length; j++) {
      const sim = jaccardSimilarity(extracted.extractedACs[i].text.toLowerCase().split(/\s+/), extracted.extractedACs[j].text.toLowerCase().split(/\s+/));
      if (sim > 0.7) {
        score -= 10;
        issues.push({ dimension:'consistency', rule:'CON-03', severity:'minor', message:`${extracted.extractedACs[i].id} and ${extracted.extractedACs[j].id} are very similar.`, affected:`${extracted.extractedACs[i].id}, ${extracted.extractedACs[j].id}`, suggestion:'Merge or differentiate.' });
      }
    }
  }
  return { score: Math.max(score, 0), weight: DIMENSION_WEIGHTS.consistency, issues };
}

// ─── RUNNER READINESS: v2 REVISED ───
function scoreRunnerReadiness(extracted) {
  let score = 100; const issues = [];
  const uiObs = extracted.extractedACs.filter(ac => {
    const fullText = ac.text + ' ' + ac.children.join(' ');
    return /\b(?:display|show|click|navigate|page|button|field|form|modal|input|dropdown|table|list|menu|tab|screen|dialog|toast|banner|notification|message|ui|upload|entry.?point)\b/i.test(fullText);
  });
  const ratio = extracted.extractedACs.length > 0 ? uiObs.length / extracted.extractedACs.length : 0;
  if (ratio < 0.3) {
    score -= 25;
    issues.push({ dimension:'runnerReadiness', rule:'RR-01', severity:'minor', message:'Most ACs describe non-UI behavior. AI Runner can only verify what\'s visible in the browser.', affected:'requirement', suggestion:'For AI execution, include what the user sees, clicks, or interacts with.' });
  } else if (ratio < 0.6) { score -= 8; }

  // RR-02: Unsupported (v2: removed "upload", reduced penalty)
  const unsupported = extracted.extractedACs.filter(ac =>
    /\b(?:captcha|biometric|fingerprint|face.?id|scan|camera|microphone|drag.?and.?drop|native app|desktop app|mobile app)\b/i.test(ac.text)
  );
  if (unsupported.length > 0) {
    score -= unsupported.length * 5;
    issues.push({ dimension:'runnerReadiness', rule:'RR-02', severity:'info', message:`${unsupported.length} AC(s) mention interactions that may need manual testing.`, affected:unsupported.map(ac => ac.id).join(', '), suggestion:'AI Runner handles browser-based ACs. These may need manual verification.' });
  }

  // RR-03: Navigation paths
  if (/\b(?:https?:\/\/|\/\w|page\s*:\s*|navigate to|go to|open)\b/i.test(extracted.extractedACs.map(ac => ac.text).join(' '))) score += 10;

  // RR-04: Test data (v2: reduced penalty)
  if (!/\b(?:test data|sample|example.*(?:data|value|input)|with.*value|enter.*["']\w)/i.test(extracted.extractedACs.map(ac => ac.text).join(' '))) {
    score -= 5;
    issues.push({ dimension:'runnerReadiness', rule:'RR-04', severity:'info', message:'No specific test data mentioned.', affected:'requirement', suggestion:'Example data values help AI generate concrete test steps.' });
  }

  return { score: Math.max(Math.min(score, 100), 0), weight: DIMENSION_WEIGHTS.runnerReadiness, issues };
}

// ═══════════════════════════════════════════════════════════════
// ISSUE CONSOLIDATION (v2 NEW)
// ═══════════════════════════════════════════════════════════════

function consolidateIssues(allIssues) {
  let issues = [...allIssues];

  // CASCADE SUPPRESSION: S-01 critical → suppress all downstream
  const hasNoDescription = issues.some(i => i.rule === 'S-01' && i.severity === 'critical');
  if (hasNoDescription) {
    return { primaryIssues: [issues.find(i => i.rule === 'S-01')], additionalSuggestions: [] };
  }

  // S-02 critical → suppress completeness/testability/specificity/atomicity/consistency/runnerReadiness
  const hasNoACs = issues.some(i => i.rule === 'S-02' && i.severity === 'critical');
  if (hasNoACs) {
    issues = issues.filter(i => !['completeness','testability','specificity','atomicity','consistency','runnerReadiness'].includes(i.dimension));
  }

  // GROUP COMPLETENESS COVERAGE GAPS
  const coverageGaps = issues.filter(i => i.dimension === 'completeness' && i.group === 'coverage_gaps');
  const nonCoverageIssues = issues.filter(i => !(i.dimension === 'completeness' && i.group === 'coverage_gaps'));
  
  if (coverageGaps.length > 1) {
    const gapNames = coverageGaps.map(g => {
      if (g.rule === 'COMP-COVERAGE') return null;
      return g.rule.replace('COMP-', '').replace(/_/g, ' ');
    }).filter(Boolean);
    const existingCoverage = coverageGaps.find(g => g.rule === 'COMP-COVERAGE');
    // Merge: keep COMP-COVERAGE if exists, else create grouped
    if (existingCoverage) {
      issues = [...nonCoverageIssues, existingCoverage];
    } else {
      issues = [...nonCoverageIssues, {
        dimension: 'completeness', rule: 'COMP-GROUPED', severity: 'info',
        message: `Coverage opportunities: consider adding scenarios for ${gapNames.join(', ')}.`,
        affected: 'requirement', suggestion: 'Not all apply to every ticket — pick what\'s relevant.',
        group: 'coverage_gaps',
      }];
    }
  } else {
    issues = [...nonCoverageIssues, ...coverageGaps];
  }

  // DEDUPLICATE
  const seen = new Set();
  issues = issues.filter(i => {
    const key = `${i.rule}:${i.message}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  // SORT BY SEVERITY
  const severityOrder = { critical: 0, major: 1, minor: 2, info: 3 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // CAP AT 5 PRIMARY
  return {
    primaryIssues: issues.slice(0, 5),
    additionalSuggestions: issues.slice(5),
  };
}


// ═══════════════════════════════════════════════════════════════
// COMPOSITE SCORING (v2)
// ═══════════════════════════════════════════════════════════════

function scoreRequirement(req, extracted) {
  const dimensions = {
    structure: scoreStructure(req, extracted),
    clarity: scoreClarity(extracted),
    completeness: scoreCompleteness(extracted),
    testability: scoreTestability(extracted),
    specificity: scoreSpecificity(extracted),
    atomicity: scoreAtomicity(extracted),
    consistency: scoreConsistency(extracted),
    runnerReadiness: scoreRunnerReadiness(extracted),
  };

  const overall = Math.round(Object.values(dimensions).reduce((s, d) => s + d.score * d.weight, 0));
  const allIssues = Object.values(dimensions).flatMap(d => d.issues).sort((a, b) => {
    const ord = { critical: 0, major: 1, minor: 2, info: 3 };
    return ord[a.severity] - ord[b.severity];
  });

  // v2: Consolidate issues
  const { primaryIssues, additionalSuggestions } = consolidateIssues(allIssues);

  // v2: Revised thresholds
  const generationReadiness = overall >= 65 ? 'ready' : overall >= 35 ? 'needs_refinement' : 'insufficient';
  const needsLLM = overall >= 30 && overall <= 85;

  return { overall, dimensions, extractedACs: extracted.extractedACs, issues: allIssues, primaryIssues, additionalSuggestions, generationReadiness, needsLLM };
}


// ═══════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════

const TEST_TICKETS = [
  {
    key: "TO-16795", summary: "[True Platform] Display a message banner for user to upgrade their plan after trial ended", priority: "Medium", status: "In Preparation", source: "JIRA",
    description: `As a user in an Account whose True Platform trial has ended,
I want to see a clear upgrade message banner,
So that I understand my trial has expired and can take action to upgrade the plan.

## Preconditions

* The Account previously had an active True Platform trial.
* The 30-day trial period has expired.
* The Account has not upgraded to a paid True Platform subscription.
* The Account has reverted to Free True Platform.

## Acceptance Criteria

### AC1 – Trigger Upgrade Banner After Trial Expiration

Expected Behavior:

1. The system displays an Upgrade Banner at the Account level.
2. The banner appears across key pages (e.g., Dashboard, License Management, System Settings).
3. The banner is visible to all users in the Account.

### AC2 – Banner Content

The banner must clearly communicate:

Title: "Your True Platform Trial Has Ended"

Message Body:

- Your 30-day trial has expired.
- Your Account is now on Free True Platform.
- Upgrade to continue using advanced True Platform capabilities.

CTA Buttons:

- Primary CTA: "Upgrade Now" (visible to Account Admin only)
- Secondary CTA: "View Plans"
- Optional: "Dismiss" (if business allows temporary dismissal)

### AC3 – Role-Based Behavior

1. Account Admin:
  - Can see and click "Upgrade Now"
  - Can navigate to pricing / subscription page

2. Non-Admin Users:
  - Can see banner message
  - Cannot see "Upgrade Now"
  - May see "Contact your Admin" (optional enhancement)

### AC4 – Display Duration

1. The banner remains visible until:
  - The Account upgrades to a paid True Platform plan.

2. If dismissible:
  - Dismissal hides the banner for the current session only.
  - The banner reappears in the next session.

### AC5 – Feature Gating Alignment

1. After trial expiration:
  - Paid/trial-only features must be gated according to Free True Platform rules.

2. If user attempts to access a gated feature:
  - System may show inline upgrade messaging consistent with the banner.`
  },
  {
    key: "TO-16802", summary: "[Test Run Detail] Load the agentic data for test execution by the Test Runner", priority: "High", status: "Selected for Development", source: "JIRA",
    description: `As we strive towards the agentic workflow for test execution, we want to bring Agentic features to the users to increase performance via data-driven UI. The following ACs are noted from the initiative meeting and will only focus on which parts the Manual Team will be in charge.

ACs:

| MUST HAVE | TBD |
| --- | --- |
| As a user, I can select a group of test cases among the items of the Test run for execution. Also, I can perform the process by either using the Test Runner Agent or the Testpak | Switch the tab "Test Results" → "Tests" |
|  | Display the AI readiness each test case |
|  | As a user, I can see the statuses of each test case being executed by executor_type (AI or manual) |
|  | As a user, I can also review the the AI sessions to see the summary and the result of the execution |`
  },
  {
    key: "TO-16783", summary: "[True Platform] Disable and Display message for Enterprise features", priority: "Medium", status: "To Do", source: "JIRA",
    description: `As a True Team user,
I want Enterprise-only features to be disabled with a clear explanatory message,
So that I understand why the feature is unavailable and, if I am an Account Admin, can take action to upgrade.

## Context

Enterprise-only features (e.g., Customizable Fields, KS Configuration, AI Key configuration, SSO/SCIM, AUT management, etc.) must:

- Remain visible to maintain structural consistency.
- Be disabled for non-Enterprise customers.
- Display a standardized Enterprise message.
- Show the upgrade CTA only to Account Admins.

## Acceptance Criteria

### AC1 – Disable Enterprise Feature

For customers without True Enterprise entitlement:

- The Enterprise-only feature must remain visible in the UI.
- All related interactive controls must be disabled, including:
  - Disabled controls must follow the approved disabled-state styling as designed

Users must not be able to perform restricted actions.

### AC2 – Display Enterprise Message (Per Approved Design)

When a feature is disabled:

- The system must display the Enterprise message component according to the approved design.
- The message must include:
  - Title: True Enterprise Feature
  - Clear statement that the capability is available in True Enterprise
  - 2-3 benefit bullet points specific to the feature

- The message may appear as:
  - A screen-level card (for full-page gating), or
  - A popover/modal (when triggered from a disabled option)

The layout must be consistent across all Enterprise-gated features.

### AC3 – Role-Based CTA Visibility

For Account Admin users:
- Display the "Contact Sales" (or Upgrade) CTA button.
- CTA redirects to the configured Sales/Upgrade flow.

For Non-Admin users (Project Admin, Test Lead, Tester, Member, etc.):
- The CTA button must NOT be displayed.
- Only the informational message and benefits are visible.
- No upgrade action is available.

### AC4 – Enforcement on Action Attempt

If a restricted Enterprise action is triggered via:
- Direct URL
- API request
- Manual manipulation
- Browser refresh on restricted state

The system must:
- Block the action via entitlement validation.
- Return a controlled "Enterprise Required" response.
- Display the same Enterprise message component.
- Apply role-based CTA visibility rules.

### AC5 – Consistency Across Enterprise Features

This behavior must apply consistently to all Enterprise-only features, including:
- Customizable Fields
- Katalon Studio (KS) Configuration
- Custom AI Key Configuration
- SSO/SCIM Configuration
- Organization Structure Management
- Dedicated License Allocation
- AUT Management
- Advanced Analytics Configuration

All features must follow the same:
- Disabled behavior
- Messaging structure
- Role-based CTA rule
- Visual pattern`
  },
  {
    key: "TO-16769", summary: "New document-based page for test generation from PRDs", priority: "Medium", status: "To Do", source: "JIRA",
    description: `As a user on the Test Cases page, I want a new "Upload & Generate" flow that lets me upload a PRD, extract scenarios, and generate tests even without existing requirements.

Acceptance Criteria

- A new document-based test case generator entry point exists on the Test Cases page (e.g., "Upload & Generate").
- Flow: upload PRD → processing state → scenario list → generate tests.
- UI clearly indicates it's document-based, not requirement-linked.

Tasks

1. Implement entrypoint button/CTA on the Test Cases page.
2. Implement upload zone, progress, and processing state.
3. Display extracted scenarios and controls to continue to generation.`
  },
  {
    key: "TO-16764", summary: "Implement targeted performance improvements and budget for test case generator agent", priority: "Medium", status: "To Do", source: "JIRA",
    description: `As a user, I want test generation to complete within an acceptable time with good feedback so I don't feel blocked or confused while waiting.

Acceptance Criteria

- Performance budget for J1 documented (e.g., typical requirement p90 < 30s).
- At least 1-2 optimizations implemented:
  - safe parallelization of sub-agents,
  - reduced round-trips,
  - streamlined post-processing.
- UI displays a clear progress indicator for long-running generations.
- Post-optimization measurements show improvement over baseline.

Tasks

1. Design and implement prioritized optimizations.
2. Add/adjust progress indicator logic on the frontend.
3. Re-measure latency and update documentation.
4. Monitor in qa or staging.`
  },
  {
    key: "TO-16785", summary: "Insight Agent Entry Points", priority: "Medium", status: "In Preparation", source: "JIRA",
    description: null
  },
  {
    key: "TO-16775", summary: "Bug Reporting MCP", priority: "Medium", status: "In Preparation", source: "JIRA",
    description: null
  },
  // ─── SYNTHETIC EDGE CASE TICKETS ───
  {
    key: "SYN-001", summary: "Fix login", priority: "High", status: "To Do", source: "Synthetic",
    description: `Fix the login issue. It should work properly.`
  },
  {
    key: "SYN-002", summary: "User Profile Edit with Gherkin", priority: "Medium", status: "To Do", source: "Synthetic",
    description: `As a registered user, I want to edit my profile information so that I can keep my details up to date.

Given I am logged in as a registered user
When I navigate to the profile settings page
Then I should see my current profile information displayed

Given I am on the profile settings page
When I update my display name to "John Doe" and click Save
Then the system should display a success message "Profile updated"
And my display name should be updated to "John Doe"

Given I am on the profile settings page
When I enter an invalid email format like "notanemail"
Then the system should display an error message "Invalid email format"
And the Save button should be disabled

Notes:
- Profile photo upload is out of scope for this sprint
- Consider mobile responsiveness`
  },
  {
    key: "SYN-003", summary: "Dashboard analytics improvements", priority: "Low", status: "To Do", source: "Synthetic",
    description: `We need to improve the dashboard. It should be faster and more user-friendly. The analytics should be better and the charts should look nice. Users should be able to see various metrics and the data should be displayed in a reasonable time.

The dashboard should support several types of charts and the filtering should be intuitive. Performance should be optimal and the UI should be modern and responsive.

Some improvements needed:
- Better loading times
- Improved chart rendering
- Enhanced filtering capabilities
- More intuitive navigation
- Cleaner data visualization`
  },
  {
    key: "SYN-004", summary: "API Rate Limiting for External Integrations", priority: "High", status: "To Do", source: "Synthetic",
    description: `As an API consumer, I want rate limiting enforced on external API endpoints so that the system remains stable under high load.

Acceptance Criteria:
- Rate limit of 100 requests per minute per API key
- When limit exceeded, return HTTP 429 with header "Retry-After: <seconds>"
- Rate limit counter resets every 60 seconds
- Admin users have a higher limit of 500 requests per minute
- Rate limit status visible in response headers: X-RateLimit-Remaining, X-RateLimit-Reset
- If API key is missing, return 401 Unauthorized
- If API key is invalid, return 403 Forbidden
- Rate limiting applies per-endpoint, not globally
- Burst allowance: up to 20 requests in 1 second, then throttle

Definition of Done:
- [ ] Unit tests for rate limiter
- [ ] Integration tests with external service
- [ ] Load test confirms behavior at 2x expected traffic`
  },
  {
    key: "SYN-005", summary: "Refactor authentication module", priority: "Medium", status: "To Do", source: "Synthetic",
    description: `Refactor the authentication module to use the new OAuth 2.0 library. Clean up technical debt and improve code quality. Implement proper error handling and ensure the module is maintainable.

Tasks:
- Replace legacy auth library with modern OAuth 2.0
- Clean up unused code
- Add proper TypeScript types
- Improve test coverage`
  },
];


// ═══════════════════════════════════════════════════════════════
// UI COMPONENTS (v2: updated for issue consolidation)
// ═══════════════════════════════════════════════════════════════

const SEVERITY_COLORS = {
  critical: { bg: '#2d0a0a', border: '#991b1b', text: '#fca5a5', dot: '#ef4444' },
  major: { bg: '#2d1a00', border: '#92400e', text: '#fbbf24', dot: '#f59e0b' },
  minor: { bg: '#0a1628', border: '#1e40af', text: '#93c5fd', dot: '#3b82f6' },
  info: { bg: '#0a1a1a', border: '#065f46', text: '#6ee7b7', dot: '#10b981' },
};

const READINESS_BADGES = {
  ready: { label: 'Ready to Generate', color: '#10b981', bg: '#052e16' },
  needs_refinement: { label: 'Needs Refinement', color: '#f59e0b', bg: '#2d1a00' },
  insufficient: { label: 'Insufficient Detail', color: '#ef4444', bg: '#2d0a0a' },
};

const BLOCK_TYPE_LABELS = {
  single_line: '1 line',
  parent_with_children: 'block',
  gherkin_scenario: 'gherkin',
  table_row: 'table',
};

function ScoreGauge({ score, size = 80 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#f59e0b' : score >= 35 ? '#f97316' : '#ef4444';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: size * 0.3, fontWeight: 700, fill: color, fontFamily: 'JetBrains Mono, monospace' }}>
        {score}
      </text>
    </svg>
  );
}

function DimensionBar({ name, score, weight }) {
  const pct = score;
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : pct >= 40 ? '#f97316' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <div style={{ width: 130, fontSize: 11, color: '#94a3b8', textTransform: 'capitalize', fontFamily: 'JetBrains Mono, monospace' }}>
        {name.replace(/([A-Z])/g, ' $1').trim()} <span style={{ color: '#475569', fontSize: 10 }}>({(weight * 100).toFixed(0)}%)</span>
      </div>
      <div style={{ flex: 1, height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ width: 30, fontSize: 11, color, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{pct}</div>
    </div>
  );
}

function IssueCard({ issue }) {
  const c = SEVERITY_COLORS[issue.severity];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#64748b', textTransform: 'uppercase' }}>{issue.rule}</span>
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: c.text, textTransform: 'uppercase', fontWeight: 600 }}>{issue.severity}</span>
        {issue.affected !== 'requirement' && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>→ {issue.affected}</span>}
        {issue.group && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: '#1e293b', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{issue.group}</span>}
      </div>
      <div style={{ fontSize: 12, color: c.text, lineHeight: 1.5, wordBreak: 'break-word' }}>{issue.message}</div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>💡 {issue.suggestion}</div>
    </div>
  );
}

function ACCard({ ac, index }) {
  const confColor = ac.confidence === 'high' ? '#10b981' : ac.confidence === 'medium' ? '#f59e0b' : '#ef4444';
  const srcColors = { explicit_header: '#818cf8', gherkin_scenario: '#34d399', numbered_list: '#60a5fa', bullet_inferred: '#fbbf24', sub_section: '#c084fc', table_row: '#f472b6' };
  const srcColor = srcColors[ac.source] || '#94a3b8';
  const blockColor = '#475569';
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px', marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>{ac.id}</span>
        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${confColor}20`, color: confColor, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textTransform: 'uppercase' }}>{ac.confidence}</span>
        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${srcColor}15`, color: srcColor, fontFamily: 'JetBrains Mono, monospace' }}>{ac.source.replace(/_/g, ' ')}</span>
        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#1e293b', color: blockColor, fontFamily: 'JetBrains Mono, monospace' }}>{BLOCK_TYPE_LABELS[ac.blockType] || ac.blockType}</span>
      </div>
      {ac.parentContext && (
        <div style={{ fontSize: 10, color: '#a78bfa', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4, padding: '2px 6px', background: '#1e1045', borderRadius: 4, display: 'inline-block' }}>
          📂 {ac.parentContext}
        </div>
      )}
      <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{ac.text}</div>
      {ac.children.length > 0 && (
        <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: '2px solid #334155' }}>
          {ac.children.map((child, ci) => (
            <div key={ci} style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, marginBottom: 2 }}>• {child}</div>
          ))}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function RequirementScoringVerifier() {
  const [selectedKey, setSelectedKey] = useState(TEST_TICKETS[0].key);
  const [customDesc, setCustomDesc] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [activeTab, setActiveTab] = useState('extraction');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showAdditional, setShowAdditional] = useState(false);

  const ticket = TEST_TICKETS.find(t => t.key === selectedKey) || TEST_TICKETS[0];

  const result = useMemo(() => {
    const req = useCustom
      ? { summary: customTitle || 'Custom Ticket', description: customDesc }
      : { summary: ticket.summary, description: ticket.description };
    const extracted = extractStructure(req.description);
    const scored = scoreRequirement(req, extracted);
    return { req, extracted, scored };
  }, [selectedKey, customDesc, customTitle, useCustom, ticket]);

  const issueCounts = result.scored.issues.reduce((acc, i) => { acc[i.severity] = (acc[i.severity] || 0) + 1; return acc; }, {});

  const badge = READINESS_BADGES[result.scored.generationReadiness];

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ borderBottom: '1px solid #1e293b', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, background: '#0f172a' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #818cf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>Requirement Scoring Pipeline Verifier</div>
          <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>v2.1 — Block-level extraction · Recalibrated scoring · Issue consolidation · Table/bullet fixes</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#1e293b', color: '#818cf8', fontFamily: 'JetBrains Mono, monospace' }}>WEIGHTS: S15 C20 Co15 T20 Sp10 A5 Con5 RR10</span>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 69px)' }}>
        {/* LEFT SIDEBAR */}
        <div style={{ width: 300, borderRight: '1px solid #1e293b', overflowY: 'auto', flexShrink: 0, background: '#0f172a' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: 8 }}>Test Tickets</div>
            <button onClick={() => setUseCustom(!useCustom)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${useCustom ? '#6366f1' : '#334155'}`, background: useCustom ? '#6366f120' : 'transparent', color: useCustom ? '#a5b4fc' : '#94a3b8', fontSize: 12, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', textAlign: 'left' }}>
              {useCustom ? '✏️ Custom Input Active' : '✏️ Try Custom Input'}
            </button>
          </div>

          {useCustom && (
            <div style={{ padding: 16, borderBottom: '1px solid #1e293b' }}>
              <input value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="Ticket Title / Summary"
                style={{ width: '100%', padding: 8, marginBottom: 8, borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box' }} />
              <textarea value={customDesc} onChange={e => setCustomDesc(e.target.value)} placeholder="Paste JIRA description here..."
                style={{ width: '100%', height: 200, padding: 8, borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
          )}

          {TEST_TICKETS.map(t => {
            const miniReq = { summary: t.summary, description: t.description };
            const miniExtracted = extractStructure(t.description);
            const miniScore = Math.round(Object.values({
              structure: scoreStructure(miniReq, miniExtracted),
              clarity: scoreClarity(miniExtracted),
              completeness: scoreCompleteness(miniExtracted),
              testability: scoreTestability(miniExtracted),
              specificity: scoreSpecificity(miniExtracted),
              atomicity: scoreAtomicity(miniExtracted),
              consistency: scoreConsistency(miniExtracted),
              runnerReadiness: scoreRunnerReadiness(miniExtracted),
            }).reduce((s, d) => s + d.score * d.weight, 0));
            const scColor = miniScore >= 80 ? '#10b981' : miniScore >= 65 ? '#f59e0b' : miniScore >= 35 ? '#f97316' : '#ef4444';
            const isActive = !useCustom && selectedKey === t.key;
            return (
              <div key={t.key} onClick={() => { setSelectedKey(t.key); setUseCustom(false); setActiveTab('extraction'); }}
                style={{ padding: '10px 16px', borderBottom: '1px solid #0f172a', cursor: 'pointer', background: isActive ? '#1e293b' : 'transparent', borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent', transition: 'all 0.15s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>{t.key}</span>
                  <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: t.source === 'JIRA' ? '#1e3a5f' : '#2d1a00', color: t.source === 'JIRA' ? '#60a5fa' : '#fbbf24', fontFamily: 'JetBrains Mono, monospace' }}>{t.source}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: scColor, fontFamily: 'JetBrains Mono, monospace' }}>{miniScore}</span>
                </div>
                <div style={{ fontSize: 11, color: isActive ? '#e2e8f0' : '#94a3b8', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.summary}</div>
              </div>
            );
          })}
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Score Overview */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
            <ScoreGauge score={result.scored.overall} size={90} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: badge.bg, color: badge.color, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', border: `1px solid ${badge.color}30` }}>{badge.label}</span>
                {result.scored.needsLLM && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#1e1b4b', color: '#a78bfa', fontFamily: 'JetBrains Mono, monospace' }}>LLM enrichable</span>}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>
                {result.extracted.extractedACs.length} ACs extracted · Format: {result.extracted.detectedFormat} · {result.scored.primaryIssues.length} primary issues{result.scored.additionalSuggestions.length > 0 ? ` · ${result.scored.additionalSuggestions.length} more suggestions` : ''}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {['critical','major','minor','info'].map(sev => (
                  <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLORS[sev].dot }} />
                    <span style={{ fontSize: 18, fontWeight: 700, color: SEVERITY_COLORS[sev].text, fontFamily: 'JetBrains Mono, monospace' }}>{issueCounts[sev] || 0}</span>
                    <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase' }}>{sev}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dimension Scores */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: 12 }}>Dimension Breakdown (v2 weights)</div>
            {Object.entries(result.scored.dimensions).map(([name, dim]) => (
              <DimensionBar key={name} name={name} score={dim.score} weight={dim.weight} />
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: '#1e293b', borderRadius: 8, padding: 3 }}>
            {[
              { id: 'extraction', label: `Extracted ACs (${result.extracted.extractedACs.length})` },
              { id: 'issues', label: `Issues (${result.scored.primaryIssues.length}${result.scored.additionalSuggestions.length > 0 ? `+${result.scored.additionalSuggestions.length}` : ''})` },
              { id: 'raw', label: 'Raw Description' },
              { id: 'json', label: 'Full JSON Output' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: activeTab === tab.id ? 600 : 400,
                  background: activeTab === tab.id ? '#334155' : 'transparent',
                  color: activeTab === tab.id ? '#e2e8f0' : '#64748b' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'extraction' && (
            <div>
              {result.extracted.userStory.detected && (
                <div style={{ background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>USER STORY DETECTED</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <span style={{ color: '#64748b' }}>As a</span> <span style={{ color: '#818cf8', fontWeight: 600 }}>{result.extracted.userStory.persona}</span>
                    <span style={{ color: '#64748b' }}>, I want </span><span style={{ color: '#e2e8f0' }}>{result.extracted.userStory.goal}</span>
                    {result.extracted.userStory.benefit && (<><span style={{ color: '#64748b' }}>, so that </span><span style={{ color: '#10b981' }}>{result.extracted.userStory.benefit}</span></>)}
                  </div>
                </div>
              )}
              {result.extracted.extractedACs.length > 0 ? (
                result.extracted.extractedACs.map((ac, i) => <ACCard key={ac.id} ac={ac} index={i} />)
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ fontSize: 14 }}>No acceptance criteria could be extracted</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>This ticket has no description or no parseable ACs.</div>
                </div>
              )}
              {/* Tasks section (v2 NEW) */}
              {result.extracted.sections.tasks.length > 0 && (
                <div style={{ marginTop: 16, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 11, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>🔧 TASKS (excluded from ACs)</div>
                  {result.extracted.sections.tasks.map((t, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>• {t}</div>)}
                </div>
              )}
              {result.extracted.sections.notes.length > 0 && (
                <div style={{ marginTop: 12, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>📝 NOTES (separated from ACs)</div>
                  {result.extracted.sections.notes.map((n, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>• {n}</div>)}
                </div>
              )}
              {result.extracted.sections.technicalNotes.length > 0 && (
                <div style={{ marginTop: 12, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>⚙️ TECHNICAL NOTES</div>
                  {result.extracted.sections.technicalNotes.map((n, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>• {n}</div>)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'issues' && (
            <div>
              {/* Primary Issues */}
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: 8 }}>
                Primary Issues ({result.scored.primaryIssues.length})
              </div>
              {result.scored.primaryIssues.length > 0 ? (
                result.scored.primaryIssues.map((issue, i) => <IssueCard key={`p-${i}`} issue={issue} />)
              ) : (
                <div style={{ textAlign: 'center', padding: 30, color: '#10b981', background: '#0f172a', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>✨</div>
                  <div style={{ fontSize: 13 }}>No primary issues found</div>
                </div>
              )}

              {/* Additional Suggestions (expandable) */}
              {result.scored.additionalSuggestions.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <button onClick={() => setShowAdditional(!showAdditional)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1e293b', background: '#0f172a', color: '#64748b', fontSize: 12, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>More Suggestions ({result.scored.additionalSuggestions.length})</span>
                    <span style={{ fontSize: 14 }}>{showAdditional ? '▼' : '▶'}</span>
                  </button>
                  {showAdditional && (
                    <div style={{ marginTop: 8 }}>
                      {result.scored.additionalSuggestions.map((issue, i) => <IssueCard key={`a-${i}`} issue={issue} />)}
                    </div>
                  )}
                </div>
              )}

              {/* All issues (severity filter) */}
              <div style={{ marginTop: 24, borderTop: '1px solid #1e293b', paddingTop: 16 }}>
                <div style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: 8 }}>All Raw Issues (pre-consolidation)</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {['all','critical','major','minor','info'].map(sev => (
                    <button key={sev} onClick={() => setFilterSeverity(sev)}
                      style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase',
                        background: filterSeverity === sev ? '#334155' : '#1e293b',
                        color: sev === 'all' ? '#e2e8f0' : (SEVERITY_COLORS[sev]?.text || '#e2e8f0') }}>
                      {sev} {sev !== 'all' ? `(${issueCounts[sev] || 0})` : `(${result.scored.issues.length})`}
                    </button>
                  ))}
                </div>
                {result.scored.issues.filter(i => filterSeverity === 'all' || i.severity === filterSeverity).map((issue, i) => (
                  <IssueCard key={`raw-${i}`} issue={issue} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <pre style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 20, fontSize: 12, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6, overflow: 'auto', maxHeight: 600 }}>
              {useCustom ? (customDesc || '(empty)') : (ticket.description || '(null — no description)')}
            </pre>
          )}

          {activeTab === 'json' && (
            <pre style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 20, fontSize: 11, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5, overflow: 'auto', maxHeight: 600 }}>
              {JSON.stringify({
                _version: 'v2.1',
                ticket: { key: useCustom ? 'CUSTOM' : ticket.key, summary: result.req.summary },
                extraction: {
                  userStory: result.extracted.userStory,
                  extractedACs: result.extracted.extractedACs.map(ac => ({
                    id: ac.id, text: ac.text, children: ac.children, parentContext: ac.parentContext,
                    source: ac.source, confidence: ac.confidence, blockType: ac.blockType,
                  })),
                  format: result.extracted.detectedFormat,
                  descriptionLength: result.extracted.descriptionLength,
                  notes: result.extracted.sections.notes,
                  technicalNotes: result.extracted.sections.technicalNotes,
                  tasks: result.extracted.sections.tasks,
                },
                scoring: {
                  overall: result.scored.overall,
                  generationReadiness: result.scored.generationReadiness,
                  needsLLM: result.scored.needsLLM,
                  dimensions: Object.fromEntries(Object.entries(result.scored.dimensions).map(([k, v]) => [k, { score: v.score, weight: v.weight, issueCount: v.issues.length }])),
                  primaryIssues: result.scored.primaryIssues.length,
                  additionalSuggestions: result.scored.additionalSuggestions.length,
                  totalRawIssues: result.scored.issues.length,
                },
              }, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
