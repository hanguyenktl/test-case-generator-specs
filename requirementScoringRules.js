/**
 * Requirement Scoring Rules — Deterministic Layer Implementation
 * Version: v3 (aligned with Requirement_Analyzer_Prompt_v4.2)
 * 
 * This file contains all regex constants, signal computation, scoring functions,
 * and the adequacy gate. Copy-paste ready for integration or prototyping.
 * 
 * Architecture:
 *   - computeExtractionHints()  → consumed by Call A (LLM extraction)
 *   - computeQualitySignals()   → consumed by Call B (LLM analysis) + deterministic scoring
 *   - scoreDeterministic()      → instant score for UI (fast path)
 *   - computeAdequacyGate()     → post-LLM gate for Generate button
 *   - computeWeightedScore()    → composite from 7 dimensions (no runner readiness)
 */

// ============================================================================
// CONSTANTS — Regex patterns for signal detection
// ============================================================================

// ─── Clarity: Ambiguous Terms ───

const ALWAYS_AMBIGUOUS = [
  'good', 'bad', 'nice', 'proper', 'appropriate',
  'adequate', 'sufficient', 'reasonable', 'acceptable', 'suitable',
  'beautiful', 'elegant', 'smart',
  'better', 'improved', 'enhanced', 'optimized',  // comparative without baseline
  'major', 'minor', 'significant',                 // subjective scale
];

const CONTEXTUAL_AMBIGUOUS = [
  'fast', 'slow', 'quick',
  'simple', 'complex', 'easy',
  'intuitive', 'user-friendly', 'clean', 'modern',
  'secure', 'reliable', 'stable', 'performant', 'robust', 'scalable',
  'efficient', 'effective', 'optimal',
  'responsive', 'seamless', 'smooth',
  'clear', 'obvious', 'straightforward',
  'consistent', 'similar',
  'large', 'small',
];

const VAGUE_QUANTIFIERS = [
  'some', 'few', 'many', 'several', 'most', 'various',
  'a lot', 'lots of', 'numerous',
  'frequently', 'occasionally', 'sometimes', 'often', 'rarely',
  'quickly', 'slowly', 'briefly', 'shortly',
  'etc', 'and so on', 'and more', 'and others',
  'as needed', 'as appropriate', 'as required', 'as necessary',
  'if possible', 'if applicable', 'where appropriate',
  'in a timely manner', 'in a reasonable time',
];

const UNDEFINED_REFERENCES = [
  /\bit should\b/i,
  /\bthey should\b/i,
  /\bthis should\b/i,
  /\bsame as before\b/i,
  /\bexisting behavior\b/i,
  /\bcurrent functionality\b/i,
  /\bstandard (?:way|approach|method)\b/i,
];

// ─── Completeness: Coverage Signals ───

const COVERAGE_SIGNALS = {
  error_handling: {
    patterns: [
      /\b(?:error|fail|invalid|incorrect|wrong|bad|reject|denied|unauthorized|forbidden|timeout|unavailable)\b/i,
      /\b(?:exception|crash|500|404|403|401)\b/i,
      /\b(?:what happens (?:if|when))\b/i,
    ],
    category: 'core',
    bonus: 15,
  },
  boundary_conditions: {
    patterns: [
      /\b(?:maximum|minimum|max|min|limit|boundary|at least|at most|up to|no more than|between)\b/i,
      /\b(?:first|last|empty|zero|one|single|multiple|overflow|truncat)\b/i,
      /\d+\s*(?:characters?|items?|rows?|records?|entries|users?|ms|seconds?|minutes?|%|percent)/i,
    ],
    category: 'contextual',
    bonus: 10,
  },
  user_roles: {
    patterns: [
      /\b(?:admin|manager|editor|viewer|owner|member|guest|anonymous|public)\b/i,
      /\b(?:role|permission|access|authorize|authenticate|login|privilege)\b/i,
    ],
    category: 'contextual',
    bonus: 8,
  },
  empty_null_states: {
    patterns: [
      /\b(?:empty|no (?:data|results?|items?)|blank|null|none|zero results?|nothing)\b/i,
      /\b(?:first time|new user|fresh|initial state|default)\b/i,
    ],
    category: 'contextual',
    bonus: 6,
  },
  data_validation: {
    patterns: [
      /\b(?:valid|invalid|format|required|optional|mandatory|allowed|accepted)\b/i,
      /\b(?:email|phone|date|number|url)\b/i,
    ],
    category: 'contextual',
    bonus: 6,
  },
  concurrency_state: {
    patterns: [
      /\b(?:concurrent|simultaneous|multiple users?|at the same time|race|lock|conflict)\b/i,
      /\b(?:real-?time|live update|refresh|sync|stale|cache)\b/i,
    ],
    category: 'contextual',
    bonus: 4,
  },
  loading_performance: {
    patterns: [
      /\b(?:load(?:ing)?|performance|speed|latency|response time)\b/i,
      /\b(?:within\s+\d+\s*(?:ms|seconds?|s\b)|spinner|progress|skeleton)\b/i,
    ],
    category: 'contextual',
    bonus: 4,
  },
  navigation_flow: {
    patterns: [
      /\b(?:redirect|navigate|back button|cancel|breadcrumb|deep link|route)\b/i,
      /\b(?:flow|sequence|step \d|workflow|process)\b/i,
    ],
    category: 'contextual',
    bonus: 4,
  },
};

// ─── Testability: Positive & Negative Signals ───

const TESTABILITY_POSITIVE = [
  /\b(?:displays?|shows?|returns?|redirects?\s+to|navigates?\s+to)\b/i,
  /\b(?:enabled?|disabled?|visible|hidden|active|inactive|checked|unchecked)\b/i,
  /\b(?:equals?|matches?|contains?|includes?)\b/i,
  /\b(?:increases?|decreases?|changes?\s+(?:to|from))\b/i,
  /\b(?:exists?|appears?|disappears?|opens?|closes?|expands?|collapses?)\b/i,
  /\b(?:triggers?|starts?|stops?|completes?|finishes?)\b/i,
  /\b(?:creates?|removes?|deletes?|updates?|saves?|adds?)\b/i,
  /\b(?:sends?|receives?|accepts?|rejects?|validates?)\b/i,
  /\b(?:filters?|sorts?|searches?|exports?|imports?|uploads?|downloads?)\b/i,
  /\b(?:selects?|enters?|submits?|confirms?|denies?|blocks?)\b/i,
  /\b(?:lists?|renders?|populates?|highlights?|indicates?)\b/i,
  /\b(?:success(?:fully)?|error|warning|info)\s+(?:message|notification|toast|banner|alert)\b/i,
  /\b(?:status\s+(?:changes?\s+to|becomes?|updates?\s+to))\b/i,
  /\b\d+\s*(?:%|percent|items?|records?|rows?|seconds?|ms|minutes?|px|results?)\b/i,
  /\b(?:logged (?:in|out)|authenticated|authorized|granted|revoked)\b/i,
  /→|->|>>|then\s/i,
];

const TESTABILITY_NEGATIVE = [
  /\b(?:user[- ]friendly|intuitive|easy to use|clean|modern|nice)\b/i,
  /\b(?:looks? good|feels? right|works? (?:well|properly|correctly))\b/i,
  /\b(?:refactor|clean up|technical debt|code quality)\b/i,
  /\b(?:implement|build|develop|create)\s+(?:a\s+)?(?:service|module|component|class|function|endpoint)\b/i,
];

const TESTABILITY_VERIFIABLE = /\b(?:should|must|shall|will|can|displays?|shows?|returns?|is\s+(?:displayed|shown|visible|enabled|disabled)|exists?|appears?|opens?|loads?|creates?|allows?|enables?|indicates?|provides?|supports?)\b/i;

// ─── Runner Readiness (downstream only — NOT in scoring weights) ───

const UI_OBSERVABLE_PATTERN = /\b(?:display|show|click|navigate|page|button|field|form|modal|input|dropdown|table|list|menu|tab|screen|dialog|toast|banner|notification|message|ui|upload|entry.?point)\b/i;
const UNSUPPORTED_PATTERN = /\b(?:captcha|biometric|fingerprint|face.?id|scan|camera|microphone|drag.?and.?drop|native app|desktop app|mobile app)\b/i;

// ─── Section Headers ───

const SECTION_HEADERS = {
  ac: [
    /^#{0,4}\s*\**(?:acceptance\s+criteria|ac|acs|expected\s+(?:behavior|outcome)s?)\**\s*:?\s*$/i,
    /^#{0,4}\s*\**(?:requirements?|criteria|specifications?)\**\s*:?\s*$/i,
    /^#{0,4}\s*\**(?:scenarios?|test\s+scenarios?|use\s+cases?)\**\s*:?\s*$/i,
  ],
  notes: [/^#{0,4}\s*\**(?:notes?|comments?|additional\s+(?:info|context|notes?))\**\s*:?\s*$/i],
  dod: [/^#{0,4}\s*\**(?:definition\s+of\s+done|dod|done\s+criteria)\**\s*:?\s*$/i],
  tech: [/^#{0,4}\s*\**(?:technical?\s+(?:notes?|details?|context|requirements?|spec))\**\s*:?\s*$/i],
  description: [/^#{0,4}\s*\**(?:description|summary|overview|background)\**\s*:?\s*$/i],
  task: [
    /^#{0,4}\s*\**(?:tasks?|sub-?tasks?|action\s+items?|implementation(?:\s+(?:details?|notes?|steps?))?)\**\s*:?\s*$/i,
    /^#{0,4}\s*\**(?:todo|work\s+items?)\**\s*:?\s*$/i,
  ],
};

const SUB_SECTION_PATTERNS = [
  /^#{1,4}\s+(.+)/,
  /^\*\*([^*]+)\*\*\s*$/,
  /^(?:AC|Acceptance Criteria?)\s*\d+\s*[:.]?\s*(.+)/i,
  /^(?:Scenario)\s*\d*\s*[:.]?\s*(.+)/i,
];

// ─── Scoring Weights (v4.2 — no runner readiness) ───

const DIMENSION_WEIGHTS = {
  clarity:       0.15,
  completeness:  0.25,
  testability:   0.25,
  specificity:   0.10,
  structure:     0.10,
  atomicity:     0.10,
  consistency:   0.05,
};

const SCORE_BANDS = {
  ready:            { min: 80, max: 100, label: 'Ready', color: 'green' },
  good:             { min: 65, max: 79,  label: 'Good', color: 'blue' },
  needs_refinement: { min: 35, max: 64,  label: 'Needs Refinement', color: 'yellow' },
  insufficient:     { min: 0,  max: 34,  label: 'Insufficient', color: 'red' },
};

// ============================================================================
// EXTRACTION HINTS — Consumed by Call A
// ============================================================================

function extractUserStory(text) {
  const patterns = [
    /as\s+(?:a|an)\s+(.+?),?\s+i\s+want\s+(?:to\s+)?(.+?)(?:,?\s+so\s+that\s+(.+))?$/im,
    /as\s+(?:a|an)\s+(.+?)\s+i\s+(?:want|need|should be able)\s+(?:to\s+)?(.+)/im,
  ];
  for (const line of text.split('\n')) {
    for (const p of patterns) {
      const m = line.trim().match(p);
      if (m) return { detected: true, persona: (m[1] || '').trim() || null, goal: (m[2] || '').trim() || null, benefit: (m[3] || '').trim() || null };
    }
  }
  return { detected: false, persona: null, goal: null, benefit: null };
}

function detectFormat(description) {
  const lines = description.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const hasGherkin = lines.some(l => /^\s*(?:Given|When|Then|And|But|Scenario|Feature)\b/i.test(l));
  const hasTable = lines.some(l => /^\|.+\|/.test(l));
  const hasBullets = lines.some(l => /^[-*•]\s/.test(l));
  const hasNumbered = lines.some(l => /^\d+[.)]\s/.test(l));
  const hasSubBullets = lines.some(l => /^\s{2,}[-*•]\s/.test(l) || /^\*\*\s/.test(l));

  const formats = [];
  if (hasGherkin) formats.push('gherkin');
  if (hasTable) formats.push('table');
  if (hasBullets && hasSubBullets) formats.push('bullet_hierarchical');
  else if (hasBullets || hasNumbered) formats.push('bullet_flat');

  if (formats.length === 0) return 'prose';
  if (formats.length === 1) return formats[0];
  return 'mixed';
}

function detectRequirementType(title, description) {
  const combined = ((title || '') + ' ' + (description || '')).toLowerCase();
  if (/\b(fix|bug|inconsisten|incorrect|wrong|broken|displays? incorrectly|should be .+ instead of|mismatch)\b/i.test(combined)) return 'bug_fix';
  if (/\b(migrate|upgrade|refactor|cleanup|remove|deprecate)\b/i.test(combined)) return 'task';
  if (/acceptance criteria|ac:/i.test(description || '')) return 'feature';
  return 'enhancement';
}

function detectSectionLabels(description) {
  const labels = [];
  for (const line of description.split('\n')) {
    const trimmed = line.trim().replace(/\*\*/g, '');
    for (const pat of SUB_SECTION_PATTERNS) {
      const m = trimmed.match(pat);
      if (m && m[1] && m[1].length > 2 && m[1].length < 80) {
        labels.push(m[1].trim());
        break;
      }
    }
  }
  return labels;
}

function estimateACCount(description) {
  const lines = description.split('\n');
  let inAC = false;
  let count = 0;

  for (const line of lines) {
    const trimmed = line.trim().replace(/\*\*/g, '');
    // Check for AC header
    if (SECTION_HEADERS.ac.some(p => p.test(trimmed))) { inAC = true; continue; }
    // Check for non-AC section header → stop counting
    if ([...SECTION_HEADERS.notes, ...SECTION_HEADERS.dod, ...SECTION_HEADERS.tech, ...SECTION_HEADERS.task].some(p => p.test(trimmed))) { inAC = false; continue; }

    if (inAC) {
      // Top-level bullets only (not indented sub-bullets)
      if (/^[-*•]\s/.test(trimmed) && !/^\s{2,}/.test(line)) count++;
      if (/^\d+[.)]\s/.test(trimmed)) count++;
      if (/^Scenario\b/i.test(trimmed)) count++;
      // Table data rows
      if (/^\|/.test(trimmed)) {
        const cells = trimmed.split('|').map(c => c.trim()).filter(c => c.length > 0);
        const isSep = cells.every(c => /^[-:\s]+$/.test(c));
        if (!isSep && cells.some(c => c.length > 5)) count++;
      }
    }
  }

  // Fallback: if no AC section header found, count all top-level bullets
  if (count === 0 && !inAC) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[-*•]\s/.test(trimmed) && !/^\s{2,}/.test(line)) count++;
      if (/^\d+[.)]\s/.test(trimmed)) count++;
    }
  }
  return count;
}

function computeExtractionHints(title, description) {
  return {
    detectedFormat: detectFormat(description || ''),
    requirementType: detectRequirementType(title, description),
    estimatedACCount: estimateACCount(description || ''),
    sectionLabels: detectSectionLabels(description || ''),
    userStory: extractUserStory(description || ''),
  };
}

// ============================================================================
// QUALITY SIGNALS — Consumed by Call B + deterministic scoring
// ============================================================================

function computeClaritySignals(description) {
  const ambiguousTerms = [];
  const sentences = description.split(/[.\n]+/).filter(s => s.trim().length > 0);

  for (const sentence of sentences) {
    const words = sentence.toLowerCase().split(/\s+/);

    for (const term of ALWAYS_AMBIGUOUS) {
      if (words.includes(term)) {
        ambiguousTerms.push({ term, tier: 1, context: sentence.trim(), qualified: false });
      }
    }

    for (const term of CONTEXTUAL_AMBIGUOUS) {
      if (words.includes(term)) {
        const hasQualifier = /\(.*\d.*\)/.test(sentence)
          || /\d+\s*(?:ms|sec|min|%|px)/.test(sentence)
          || /(?:than|compared to|relative to|per)\b/i.test(sentence);
        ambiguousTerms.push({ term, tier: 2, context: sentence.trim(), qualified: hasQualifier });
      }
    }
  }

  const vagueQuantifiers = VAGUE_QUANTIFIERS.filter(vq =>
    new RegExp(`\\b${vq.replace(/\s+/g, '\\s+')}\\b`, 'i').test(description)
  );

  const undefinedReferences = UNDEFINED_REFERENCES
    .filter(p => p.test(description))
    .map(p => { const m = description.match(p); return m ? m[0] : ''; })
    .filter(Boolean);

  return { ambiguousTerms, vagueQuantifiers, undefinedReferences };
}

function computeCompletenessSignals(description) {
  return Object.entries(COVERAGE_SIGNALS).map(([type, config]) => ({
    type,
    category: config.category,
    detected: config.patterns.some(p => p.test(description)),
  }));
}

function computeSpecificitySignals(description) {
  const indicators = [];

  const numericMatches = description.match(
    /\b\d+\s*(?:%|percent|items?|records?|rows?|seconds?|ms|minutes?|hours?|days?|px|mb|gb|characters?|digits?|attempts?|retries?|results?)\b/gi
  );
  indicators.push({ type: 'numeric_thresholds', detected: !!numericMatches, examples: (numericMatches || []).slice(0, 3) });

  const uiMatches = description.match(/["'][\w\s&]+["']/g);
  indicators.push({ type: 'named_ui_elements', detected: !!uiMatches, examples: (uiMatches || []).slice(0, 3) });

  const urlMatches = description.match(/(?:https?:\/\/|\/[\w-]+\/|page\s*:\s*\w|screen\s*:\s*\w)/gi);
  indicators.push({ type: 'urls_paths', detected: !!urlMatches, examples: (urlMatches || []).slice(0, 3) });

  const dataMatches = description.match(/\b(?:e\.?g\.?|example|such as|for instance|like)\s[^.]+/gi);
  indicators.push({ type: 'data_examples', detected: !!dataMatches, examples: (dataMatches || []).slice(0, 3) });

  const roleMatches = description.match(/\b(?:admin(?:istrator)?|manager|editor|viewer|owner|member|guest|operator|analyst|lead|director)\b/gi);
  indicators.push({ type: 'named_roles', detected: !!roleMatches, examples: [...new Set((roleMatches || []).map(r => r.toLowerCase()))].slice(0, 3) });

  const errorMatches = description.match(/\b(?:error\s*(?:message|code|text)\s*[:=]|"[^"]*error[^"]*"|status\s*(?:code)?\s*(?:4|5)\d{2})\b/gi);
  indicators.push({ type: 'error_details', detected: !!errorMatches, examples: (errorMatches || []).slice(0, 3) });

  return indicators;
}

function computeAtomicitySignals(description) {
  const issues = [];
  for (const line of description.split('\n')) {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/) || trimmed.match(/^\d+[.)]\s+(.+)/);
    if (!bulletMatch) continue;
    const text = bulletMatch[1];
    const compounds = [];
    if (/\band\s+also\b/i.test(text)) compounds.push('and also');
    if (/\badditionally\b/i.test(text)) compounds.push('additionally');
    if (/;\s*(?:also|and|then)\b/i.test(text)) compounds.push('; also/and/then');
    const verbs = text.match(/\b(?:should|must|shall|will|can)\b/gi);
    if (verbs && verbs.length >= 3) compounds.push(`${verbs.length} modal verbs`);
    if (compounds.length > 0) {
      issues.push({ acText: text, compoundPatterns: compounds });
    }
  }
  return issues;
}

function computeConsistencySignals(description) {
  const flags = [];
  const termPairs = [
    [/\buser\b/gi, /\bcustomer\b/gi, 'user', 'customer'],
    [/\bdashboard\b/gi, /\bscreen\b/gi, 'dashboard', 'screen'],
    [/\bclick\b/gi, /\btap\b/gi, 'click', 'tap'],
    [/\bpopup\b/gi, /\bmodal\b/gi, 'popup', 'modal'],
  ];
  for (const [a, b, nameA, nameB] of termPairs) {
    if (a.test(description) && b.test(description)) {
      flags.push({ type: 'terminology_conflict', description: `Both "${nameA}" and "${nameB}" used — intentional or inconsistent?` });
    }
  }
  const timeoutMatches = description.match(/\b(\d+)\s*(?:seconds?|minutes?|ms)\b/gi) || [];
  if (timeoutMatches.length >= 2) {
    flags.push({ type: 'contradictory_acs', description: `Multiple time values found: ${timeoutMatches.join(', ')} — verify they refer to different thresholds.` });
  }
  return flags;
}

function computeRunnerReadinessSignals(description) {
  const lines = description.split('\n').map(l => l.trim()).filter(l => /^[-*•]\s|^\d+[.)]\s/.test(l));
  const uiLines = lines.filter(l => UI_OBSERVABLE_PATTERN.test(l));
  const uiObservableRatio = lines.length > 0 ? Math.round((uiLines.length / lines.length) * 100) / 100 : 0;
  const unsupportedMatches = description.match(UNSUPPORTED_PATTERN) || [];
  return {
    uiObservableRatio,
    unsupportedActions: [...new Set(unsupportedMatches.map(m => m.toLowerCase()))],
  };
}

function computeQualitySignals(description) {
  const desc = description || '';
  const clarity = computeClaritySignals(desc);
  return {
    ambiguousTerms: clarity.ambiguousTerms,
    vagueQuantifiers: clarity.vagueQuantifiers,
    undefinedReferences: clarity.undefinedReferences,
    missingScenarios: computeCompletenessSignals(desc),
    specificityIndicators: computeSpecificitySignals(desc),
    atomicityIssues: computeAtomicitySignals(desc),
    consistencyFlags: computeConsistencySignals(desc),
    runnerReadiness: computeRunnerReadinessSignals(desc),
  };
}

// ============================================================================
// DETERMINISTIC SCORING — 7 dimensions, instant fast-path
// ============================================================================

function scoreStructure(description, extractionHints) {
  let score = 0;
  const issues = [];
  const desc = (description || '').trim();

  // S-01: Description exists
  if (!desc || desc.length < 20) {
    issues.push({ rule: 'S-01', severity: 'critical', message: 'No description or too brief to analyze.' });
    return { score: 0, issues, cascadeSuppressAll: true };
  } else if (desc.length < 80) {
    score += 5;
    issues.push({ rule: 'S-01', severity: 'major', message: 'Description is very short.' });
  } else if (desc.length < 200) {
    score += 12;
  } else {
    score += 18;
  }

  // S-02: Has ACs
  const acCount = extractionHints.estimatedACCount;
  if (acCount === 0) {
    issues.push({ rule: 'S-02', severity: 'critical', message: 'No acceptance criteria could be identified.' });
    return { score, issues, cascadeSuppressScoring: true };
  } else if (acCount <= 2) {
    score += 15;
    issues.push({ rule: 'S-02', severity: 'info', message: `${acCount} AC(s) found — fine for focused ticket.` });
  } else if (acCount <= 5) {
    score += 20;
  } else if (acCount <= 10) {
    score += 25;
  } else {
    score += 22;
  }

  // S-03: User story
  if (!extractionHints.userStory.detected) {
    issues.push({ rule: 'S-03', severity: 'info', message: 'No user story format detected.' });
  } else {
    score += 10;
  }

  // S-05: Explicit AC header
  if (SECTION_HEADERS.ac.some(p => desc.split('\n').some(l => p.test(l.trim())))) {
    score += 5;
  }

  // S-06: Mixed format
  if (extractionHints.detectedFormat === 'mixed') {
    issues.push({ rule: 'S-06', severity: 'info', message: 'Mixed format detected — consider standardizing.' });
  }

  return { score: Math.min(score, 100), issues };
}

function scoreClarity(qualitySignals, estimatedACCount) {
  if (estimatedACCount === 0) return { score: 50, issues: [] };

  let score = 100;
  const issues = [];

  // C-01: Ambiguous terms (two-tier)
  let tier1Deduct = 0, tier2Deduct = 0;
  for (const at of qualitySignals.ambiguousTerms) {
    if (at.tier === 1) {
      tier1Deduct = Math.min(tier1Deduct + 5, 12);
      issues.push({ rule: 'C-01', severity: 'major', message: `"${at.context.substring(0, 60)}…" uses vague language: "${at.term}"` });
    } else if (!at.qualified) {
      tier2Deduct = Math.min(tier2Deduct + 3, 8);
      issues.push({ rule: 'C-01', severity: 'minor', message: `"${at.term}" is ambiguous without a qualifier.` });
    }
  }
  score -= Math.min(tier1Deduct + tier2Deduct, 20);

  // C-02: Vague quantifiers
  const vqDeduct = Math.min(qualitySignals.vagueQuantifiers.length * 4, 12);
  score -= vqDeduct;
  if (qualitySignals.vagueQuantifiers.length > 0) {
    issues.push({ rule: 'C-02', severity: 'minor', message: `Vague quantifiers found: ${qualitySignals.vagueQuantifiers.slice(0, 3).join(', ')}` });
  }

  // C-03: Undefined references
  const urDeduct = Math.min(qualitySignals.undefinedReferences.length * 5, 15);
  score -= urDeduct;
  if (qualitySignals.undefinedReferences.length > 0) {
    issues.push({ rule: 'C-03', severity: 'minor', message: `Undefined references: ${qualitySignals.undefinedReferences.join(', ')}` });
  }

  return { score: Math.max(score, 0), issues };
}

function scoreCompleteness(description, qualitySignals, estimatedACCount) {
  // Base score from AC count
  let score;
  if (estimatedACCount === 0) score = 0;
  else if (estimatedACCount <= 2) score = 30;
  else if (estimatedACCount <= 5) score = 45;
  else if (estimatedACCount <= 10) score = 55;
  else score = 50;

  const issues = [];

  // Positive path bonus
  const hasPositivePath = TESTABILITY_POSITIVE.some(p => p.test(description || ''));
  if (hasPositivePath) score += 10;

  // Coverage signal bonuses + core check
  const missedContextual = [];
  for (const signal of qualitySignals.missingScenarios) {
    if (signal.detected) {
      const config = COVERAGE_SIGNALS[signal.type];
      if (config) score += config.bonus;
    } else if (signal.category === 'core') {
      issues.push({ rule: `COMP-${signal.type}`, severity: 'minor', message: `No ${signal.type.replace(/_/g, ' ')} scenarios mentioned.` });
    } else {
      missedContextual.push(signal.type.replace(/_/g, ' '));
    }
  }

  // Group missed contextual into one info issue
  if (missedContextual.length > 0) {
    issues.push({ rule: 'COMP-COVERAGE', severity: 'info', message: `Coverage opportunities: ${missedContextual.join(', ')}` });
  }

  // COMP-RATIO
  const descWords = (description || '').split(/\s+/).length;
  if (descWords > 100 && estimatedACCount < 3) {
    score -= 10;
    issues.push({ rule: 'COMP-RATIO', severity: 'minor', message: `Description is substantial (${descWords} words) but only ${estimatedACCount} ACs.` });
  }

  return { score: Math.min(score, 100), issues };
}

function scoreTestability(description, estimatedACCount) {
  if (estimatedACCount === 0) return { score: 0, issues: [] };

  const issues = [];
  // Extract bullet-like lines from description for per-AC analysis
  const acLines = (description || '').split('\n')
    .map(l => l.trim())
    .filter(l => /^[-*•]\s/.test(l) || /^\d+[.)]\s/.test(l));

  if (acLines.length === 0) {
    // No structured ACs to analyze — use description-level signals
    const posHits = TESTABILITY_POSITIVE.filter(p => p.test(description || ''));
    const negHits = TESTABILITY_NEGATIVE.filter(p => p.test(description || ''));
    let score = 50 + Math.min(posHits.length * 10, 40) - Math.min(negHits.length * 15, 40);
    return { score: Math.max(Math.min(score, 100), 0), issues };
  }

  let totalScore = 0;
  for (const line of acLines) {
    const text = line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '');
    let acScore = 50;

    const posHits = TESTABILITY_POSITIVE.filter(p => p.test(text));
    acScore += Math.min(posHits.length * 10, 40);

    const negHits = TESTABILITY_NEGATIVE.filter(p => p.test(text));
    acScore -= Math.min(negHits.length * 15, 40);

    // T-01: Too brief
    if (text.split(/\s+/).length < 4) {
      acScore -= 30;
      issues.push({ rule: 'T-01', severity: 'major', message: `"${text}" is too brief to define a testable behavior.` });
    }

    // T-02: Implementation-only
    if (negHits.length > 0 && posHits.length === 0) {
      issues.push({ rule: 'T-02', severity: 'major', message: `"${text.substring(0, 80)}…" describes implementation, not observable behavior.` });
    }

    // T-03: No verifiable outcome
    if (!TESTABILITY_VERIFIABLE.test(text) && !/→|->|>>/.test(text)) {
      acScore -= 5;
      issues.push({ rule: 'T-03', severity: 'info', message: `"${text.substring(0, 80)}…" — consider adding an explicit expected outcome.` });
    }

    totalScore += Math.max(Math.min(acScore, 100), 0);
  }

  return { score: Math.round(totalScore / acLines.length), issues };
}

function scoreSpecificity(description, qualitySignals) {
  let score = 0;
  const issues = [];

  for (const indicator of qualitySignals.specificityIndicators) {
    if (indicator.detected) {
      switch (indicator.type) {
        case 'numeric_thresholds': score += 25; break;
        case 'named_ui_elements': score += 25; break;
        case 'urls_paths': score += 10; break;
        case 'data_examples': score += 15; break;
        case 'named_roles': score += 15; break;
        case 'error_details': score += 10; break;
      }
    } else if (indicator.type === 'numeric_thresholds') {
      issues.push({ rule: 'SP-01', severity: 'info', message: 'No specific numeric thresholds found.' });
    } else if (indicator.type === 'data_examples') {
      issues.push({ rule: 'SP-04', severity: 'info', message: 'No concrete data examples provided.' });
    }
  }

  // User story persona fallback for roles
  const rolesIndicator = qualitySignals.specificityIndicators.find(i => i.type === 'named_roles');
  if (!rolesIndicator?.detected) {
    const userStory = extractUserStory(description || '');
    if (userStory.detected && userStory.persona) score += 10;
    else if (/\buser\b/i.test(description || '')) score += 5;
  }

  return { score: Math.min(score, 100), issues };
}

function scoreAtomicity(qualitySignals, estimatedACCount) {
  if (estimatedACCount === 0) return { score: 100, issues: [] };
  let score = 100;
  const issues = [];

  for (const issue of qualitySignals.atomicityIssues) {
    score -= 10;
    issues.push({ rule: 'A-01', severity: 'minor', message: `"${issue.acText.substring(0, 60)}…" may be compound: ${issue.compoundPatterns.join(', ')}` });
  }

  return { score: Math.max(score, 0), issues };
}

function scoreConsistency(qualitySignals) {
  let score = 100;
  const issues = [];

  for (const flag of qualitySignals.consistencyFlags) {
    if (flag.type === 'terminology_conflict') {
      score -= 5;
      issues.push({ rule: 'CON-01', severity: 'info', message: flag.description });
    } else if (flag.type === 'contradictory_acs') {
      score -= 10;
      issues.push({ rule: 'CON-02', severity: 'minor', message: flag.description });
    }
  }

  return { score: Math.max(Math.min(score, 100), 0), issues };
}

// ============================================================================
// COMPOSITE SCORE — Weighted sum of 7 dimensions
// ============================================================================

function computeWeightedScore(dimensions) {
  // runnerReadiness removed in v4.2. Weight redistributed to completeness and testability.
  return Math.round(
    dimensions.clarity       * 0.15 +
    dimensions.completeness  * 0.25 +
    dimensions.testability   * 0.25 +
    dimensions.specificity   * 0.10 +
    dimensions.structure     * 0.10 +
    dimensions.atomicity     * 0.10 +
    dimensions.consistency   * 0.05
  );  // total = 1.00
}

function getScoreBand(score) {
  if (score >= 80) return SCORE_BANDS.ready;
  if (score >= 65) return SCORE_BANDS.good;
  if (score >= 35) return SCORE_BANDS.needs_refinement;
  return SCORE_BANDS.insufficient;
}

// ============================================================================
// FULL DETERMINISTIC SCORING — Runs all dimensions
// ============================================================================

function scoreDeterministic(title, description) {
  const hints = computeExtractionHints(title, description);
  const signals = computeQualitySignals(description);

  const structureResult = scoreStructure(description, hints);

  // Cascade suppression
  if (structureResult.cascadeSuppressAll) {
    return {
      overall: 0,
      band: SCORE_BANDS.insufficient,
      dimensions: {
        structure: 0, clarity: 0, completeness: 0, testability: 0,
        specificity: 0, atomicity: 0, consistency: 0,
      },
      issues: structureResult.issues,
      extractionHints: hints,
      qualitySignals: signals,
    };
  }

  const clarityResult = structureResult.cascadeSuppressScoring
    ? { score: 50, issues: [] }
    : scoreClarity(signals, hints.estimatedACCount);
  const completenessResult = structureResult.cascadeSuppressScoring
    ? { score: 0, issues: [] }
    : scoreCompleteness(description, signals, hints.estimatedACCount);
  const testabilityResult = structureResult.cascadeSuppressScoring
    ? { score: 0, issues: [] }
    : scoreTestability(description, hints.estimatedACCount);
  const specificityResult = structureResult.cascadeSuppressScoring
    ? { score: 0, issues: [] }
    : scoreSpecificity(description, signals);
  const atomicityResult = structureResult.cascadeSuppressScoring
    ? { score: 100, issues: [] }
    : scoreAtomicity(signals, hints.estimatedACCount);
  const consistencyResult = structureResult.cascadeSuppressScoring
    ? { score: 100, issues: [] }
    : scoreConsistency(signals);

  const dimensions = {
    structure: structureResult.score,
    clarity: clarityResult.score,
    completeness: completenessResult.score,
    testability: testabilityResult.score,
    specificity: specificityResult.score,
    atomicity: atomicityResult.score,
    consistency: consistencyResult.score,
  };

  const overall = computeWeightedScore(dimensions);

  const allIssues = [
    ...structureResult.issues,
    ...clarityResult.issues,
    ...completenessResult.issues,
    ...testabilityResult.issues,
    ...specificityResult.issues,
    ...atomicityResult.issues,
    ...consistencyResult.issues,
  ];

  return {
    overall,
    band: getScoreBand(overall),
    dimensions,
    issues: allIssues,
    extractionHints: hints,
    qualitySignals: signals,
  };
}

// ============================================================================
// ADEQUACY GATE — Post-LLM deterministic gate for Generate button
// ============================================================================

function computeAdequacyGate(callAOutput, callBOutput, qualitySignals) {
  const coreTier = {
    clearIntent: callAOutput.clearIntent !== null,
    basicScope: (callAOutput.extractedACs || []).filter(ac => ac.confidence !== 'low').length >= 2,
    testableActions: (callAOutput.extractedACs || []).some(ac =>
      ac.acType === 'behavior' || ac.acType === 'error_scenario'
    ),
  };

  const corePass = coreTier.clearIntent && coreTier.basicScope && coreTier.testableActions;

  const enhancementTier = {
    userContext: (qualitySignals.userStory && qualitySignals.userStory.detected)
      || (callAOutput.extractedACs || []).some(ac => /\b(?:user|admin|manager)\b/i.test(ac.text)),
    expectedOutcomes: callBOutput.qualityScore.dimensions.testability >= 50,
    keyScenarios: (qualitySignals.missingScenarios || [])
      .filter(s => s.category === 'core')
      .every(s => s.detected),
    componentAwareness: (qualitySignals.specificityIndicators || [])
      .some(s => s.type === 'named_ui_elements' && s.detected),
  };

  const enhancementCount = Object.values(enhancementTier).filter(Boolean).length;

  let status, generateButtonState;
  if (!corePass) {
    status = 'NOT_ADEQUATE';
    generateButtonState = 'disabled';
  } else if (enhancementCount >= 3) {
    status = 'ADEQUATE';
    generateButtonState = 'enabled';
  } else {
    status = 'MARGINAL';
    generateButtonState = 'warning';
  }

  return { status, generateButtonState, coreTier, enhancementTier, enhancementCount };
}

// ============================================================================
// EXPORTS
// ============================================================================

// For Node.js / CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Constants
    ALWAYS_AMBIGUOUS, CONTEXTUAL_AMBIGUOUS, VAGUE_QUANTIFIERS, UNDEFINED_REFERENCES,
    COVERAGE_SIGNALS, TESTABILITY_POSITIVE, TESTABILITY_NEGATIVE, TESTABILITY_VERIFIABLE,
    UI_OBSERVABLE_PATTERN, UNSUPPORTED_PATTERN,
    SECTION_HEADERS, SUB_SECTION_PATTERNS,
    DIMENSION_WEIGHTS, SCORE_BANDS,
    // Extraction hints
    computeExtractionHints, extractUserStory, detectFormat, detectRequirementType,
    detectSectionLabels, estimateACCount,
    // Quality signals
    computeQualitySignals, computeClaritySignals, computeCompletenessSignals,
    computeSpecificitySignals, computeAtomicitySignals, computeConsistencySignals,
    computeRunnerReadinessSignals,
    // Scoring
    scoreDeterministic, computeWeightedScore, getScoreBand,
    scoreStructure, scoreClarity, scoreCompleteness, scoreTestability,
    scoreSpecificity, scoreAtomicity, scoreConsistency,
    // Adequacy gate
    computeAdequacyGate,
  };
}
