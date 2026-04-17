import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, ChevronRight, ChevronDown, Check, X, FileText, 
  AlertCircle, Lightbulb, Send, Bot,
  Target, CheckCircle2, Circle, Eye, Edit3, Loader2, 
  ThumbsUp, ThumbsDown, Upload, 
  AlertTriangle, BookOpen, Layers,
  File, Image, ChevronUp, Wand2, RotateCcw, Save,
  Bell, Home, ClipboardList,
  TestTube2, Package, Play, BarChart3, Cloud, Cog,
  PlusCircle, Link2, ExternalLink, Hash, ArrowRight
} from 'lucide-react';

// ============================================
// Test Case Generator: Ambient AI Prototype v8
//
// KEY CHANGES (J1 demo feedback + citation brainstorm):
// 1. Real-life free-form requirement (View Script)
// 2. "Acceptance Criteria" → "Test Scenarios" (all UI)
// 3. Citable segments parsed from requirement text
// 4. Citation badges on test scenarios → hover highlights source
// 5. Document upload clearly optional
// 6. Generate button not gated behind clarifications
// 7. Depth toggle (Quick / Thorough)
// 8. "Generate More" post-generation
// 9. Thumbs up/down on every test
// 10. TestOps design system
// ============================================

const TEST_STATUS = { PENDING: 'pending', ACCEPTED: 'accepted', REJECTED: 'rejected', MODIFIED: 'modified', REGENERATING: 'regenerating' };

// --- TestOps Design Tokens ---
const TO = {
  sidebar: '#1a1642', sidebarHover: '#2d2b55', sidebarActive: '#3B82F6',
  primary: '#4318FF', aiAccent: '#7C3AED',
  passed: '#22C55E', failed: '#EF4444', warning: '#F59E0B',
  pageBg: '#F8F9FC', cardBg: '#FFFFFF', cardBd: '#E5E7EB',
  textPrimary: '#111827', textBody: '#374151', textSecondary: '#6B7280', textMuted: '#9CA3AF',
  link: '#3B82F6',
};

// --- Citation Type Colors ---
const CITATION_COLORS = {
  requirement:    { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD', label: 'Requirement' },
  happy_path:     { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', label: 'Happy Path' },
  edge_case:      { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', label: 'Edge Case' },
  error_handling: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', label: 'Error Handling' },
  constraint:     { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC', label: 'Constraint' },
  assumption:     { bg: '#F3E8FF', text: '#6B21A8', border: '#C4B5FD', label: 'Assumption' },
  acceptance:     { bg: '#CCFBF1', text: '#134E4A', border: '#5EEAD4', label: 'Acceptance Criteria' },
};

// --- Real-life Requirement ---
const mockRequirement = {
  id: 'TO-9201',
  title: 'View Test Script Code from Test Result Details',
  tester: 'Vuong Thien Phu',
  testCases: 0,
  issueType: 'Feature',
  sprint: 23,
};

// Citable segments parsed from the requirement text
const citableSegments = [
  { id: 'SEG-1', type: 'requirement', text: 'As a QA Engineer investigating a test failure, I want to view the test script code directly from the test result details, so that I can quickly understand what the test does and identify where it might be failing without leaving TestOps.' },
  { id: 'SEG-2', type: 'requirement', text: '"View Script" entry point available in Test Result Details page.' },
  { id: 'SEG-3', type: 'acceptance', text: 'Shows full script content with syntax highlighting based on file type (.groovy, .java, .py, .ts). Line numbers are displayed.' },
  { id: 'SEG-4', type: 'happy_path', text: 'Automatically scrolls to failing line if available from execution logs.' },
  { id: 'SEG-5', type: 'acceptance', text: 'Shows file path relative to repository root. Displays last commit info (SHA, author, message, timestamp).' },
  { id: 'SEG-6', type: 'acceptance', text: 'Can copy code to clipboard (full script or selected lines). Can scroll through the entire script smoothly.' },
  { id: 'SEG-7', type: 'constraint', text: 'Handles scripts up to 10,000 lines without performance degradation. Script loads within 2 seconds. Syntax highlighting renders progressively. Line numbers displayed correctly.' },
  { id: 'SEG-8', type: 'edge_case', text: 'Git repository is no longer connected to the project → Should still display the script version used for execution with indicators.' },
  { id: 'SEG-9', type: 'edge_case', text: 'Script file was deleted from Git repo → Should still display the script version used for execution with indicators.' },
  { id: 'SEG-10', type: 'edge_case', text: 'Script file contains invalid characters or encoding issues → Display content with best-effort rendering.' },
  { id: 'SEG-11', type: 'edge_case', text: 'Script was moved to another folder/branch that user have authorized to view → Display with updated metadata/path.' },
  { id: 'SEG-12', type: 'error_handling', text: 'User doesn\'t have read permission to the Git repository → Access denied & show permission error.' },
  { id: 'SEG-13', type: 'error_handling', text: 'Git access token has expired or been revoked → Authentication Failed & guide user to set up PAT.' },
  { id: 'SEG-14', type: 'error_handling', text: 'Script File Exceeds Size Limit → Link to the original file.' },
  { id: 'SEG-15', type: 'error_handling', text: 'Binary file or unsupported format → Show unsupported format message.' },
  { id: 'SEG-16', type: 'error_handling', text: 'Script moved to unauthorized branch → Show error message.' },
  { id: 'SEG-17', type: 'error_handling', text: 'Test case has no Git repository link (uploaded scripts in zip repo).' },
  { id: 'SEG-18', type: 'edge_case', text: 'File exists in Git but has no content.' },
  { id: 'SEG-19', type: 'edge_case', text: 'Git API returns file content but fails to fetch commit details.' },
];

const requirementSections = [
  { title: 'User Story', segments: ['SEG-1'] },
  { title: 'Details — Access & Entry Points', segments: ['SEG-2'] },
  { title: 'Details — Content Display', segments: ['SEG-3', 'SEG-4', 'SEG-5'] },
  { title: 'Details — User Interactions', segments: ['SEG-6', 'SEG-7'] },
  { title: 'Scenarios — Allow view script', segments: ['SEG-8', 'SEG-9', 'SEG-10', 'SEG-11'] },
  { title: 'Scenarios — Not allow view script', segments: ['SEG-12', 'SEG-13', 'SEG-14', 'SEG-15', 'SEG-16', 'SEG-17', 'SEG-18', 'SEG-19'] },
];

// Generated test scenarios with citations
const mockCoreTests = [
  { id: 'TC-001', name: 'Verify View Script Button Present on Test Result Details', type: 'positive', priority: 'high', citations: ['SEG-1', 'SEG-2'], citationTypes: ['requirement', 'requirement'],
    steps: ['Navigate to a completed test execution result', 'Locate the Test Result Details page', 'Verify "View Script" entry point is visible and clickable'], feedback: null },
  { id: 'TC-002', name: 'Verify Syntax Highlighting For Groovy Script File', type: 'positive', priority: 'high', citations: ['SEG-3'], citationTypes: ['acceptance'],
    steps: ['Open test result linked to a .groovy script', 'Click "View Script"', 'Verify syntax highlighting renders correctly for Groovy keywords', 'Verify line numbers displayed alongside code'], feedback: null },
  { id: 'TC-003', name: 'Verify Auto-Scroll to Failing Line from Execution Log', type: 'positive', priority: 'high', citations: ['SEG-4'], citationTypes: ['happy_path'],
    steps: ['Open a failed test result with execution log containing line reference', 'Click "View Script"', 'Verify viewport auto-scrolls to the failing line', 'Verify failing line is visually highlighted'], feedback: null },
  { id: 'TC-004', name: 'Verify Commit Metadata and File Path Display', type: 'positive', priority: 'medium', citations: ['SEG-5'], citationTypes: ['acceptance'],
    steps: ['Open test result linked to a Git-tracked script', 'Click "View Script"', 'Verify file path shown relative to repository root', 'Verify last commit SHA, author, message, and timestamp displayed'], feedback: null },
  { id: 'TC-005', name: 'Verify Copy to Clipboard for Full Script and Selection', type: 'positive', priority: 'medium', citations: ['SEG-6'], citationTypes: ['acceptance'],
    steps: ['Open script viewer', 'Click "Copy" button — verify full script copied', 'Select lines 10-20 — click "Copy Selected" — verify only selected lines copied'], feedback: null },
  { id: 'TC-006', name: 'Verify Performance with 10,000 Line Script', type: 'boundary', priority: 'high', citations: ['SEG-7'], citationTypes: ['constraint'],
    steps: ['Open test result linked to a 10,000-line script', 'Measure time from click to full render', 'Verify load completes within 2 seconds', 'Verify syntax highlighting renders progressively'], feedback: null },
  { id: 'TC-007', name: 'Verify Script Display When Git Repo Disconnected', type: 'edge_case', priority: 'high', citations: ['SEG-8'], citationTypes: ['edge_case'],
    steps: ['Complete test execution while Git repo is connected', 'Disconnect Git repository from project', 'Open the test result and click "View Script"', 'Verify cached script version displays with info indicator'], feedback: null },
  { id: 'TC-008', name: 'Verify Script Display When File Deleted from Git', type: 'edge_case', priority: 'high', citations: ['SEG-9'], citationTypes: ['edge_case'],
    steps: ['Complete test execution', 'Delete the script file from Git repository', 'Open test result and click "View Script"', 'Verify cached script version displays with deletion indicator'], feedback: null },
  { id: 'TC-009', name: 'Verify Permission Denied When User Lacks Git Read Access', type: 'negative', priority: 'high', citations: ['SEG-12'], citationTypes: ['error_handling'],
    steps: ['Log in as user without Git repository read permission', 'Navigate to test result', 'Click "View Script"', 'Verify access denied message displayed'], feedback: null },
  { id: 'TC-010', name: 'Verify Expired Token Shows Auth Error with PAT Guide', type: 'negative', priority: 'high', citations: ['SEG-13'], citationTypes: ['error_handling'],
    steps: ['Revoke or expire the Git access token', 'Navigate to test result and click "View Script"', 'Verify "Authentication Failed" message', 'Verify guidance to set up PAT in Git & TestOps'], feedback: null },
];

const mockAdditionalTests = [
  { id: 'TC-011', name: 'Verify Invalid Character Handling in Script Content', type: 'edge_case', priority: 'medium', citations: ['SEG-10'], citationTypes: ['edge_case'],
    steps: ['Upload script with invalid UTF-8 characters', 'Execute test and open result', 'Verify content renders with best-effort replacement'], feedback: null },
  { id: 'TC-012', name: 'Verify Script Path Update When File Moved', type: 'edge_case', priority: 'medium', citations: ['SEG-11'], citationTypes: ['edge_case'],
    steps: ['Complete test execution', 'Move script to different folder in authorized branch', 'Verify script displays with updated metadata/path'], feedback: null },
  { id: 'TC-013', name: 'Verify Size Limit Shows Link to Original', type: 'negative', priority: 'medium', citations: ['SEG-14'], citationTypes: ['error_handling'],
    steps: ['Create test linked to oversized script file', 'Click "View Script"', 'Verify size limit message with link to original file'], feedback: null },
  { id: 'TC-014', name: 'Verify Binary File Shows Unsupported Message', type: 'negative', priority: 'medium', citations: ['SEG-15'], citationTypes: ['error_handling'],
    steps: ['Create test referencing a .class binary file', 'Click "View Script"', 'Verify "Unsupported format" message'], feedback: null },
  { id: 'TC-015', name: 'Verify Unauthorized Branch Access Shows Error', type: 'negative', priority: 'medium', citations: ['SEG-16'], citationTypes: ['error_handling'],
    steps: ['Move script to unauthorized branch', 'Click "View Script"', 'Verify error message about insufficient permissions'], feedback: null },
  { id: 'TC-016', name: 'Verify No Git Link Shows Appropriate Message', type: 'negative', priority: 'low', citations: ['SEG-17'], citationTypes: ['error_handling'],
    steps: ['Create test from uploaded zip repo (no Git link)', 'Click "View Script"', 'Verify message indicating no Git repository linked'], feedback: null },
  { id: 'TC-017', name: 'Verify Empty File Handled Gracefully', type: 'edge_case', priority: 'low', citations: ['SEG-18'], citationTypes: ['edge_case'],
    steps: ['Create Git-tracked script with zero content', 'Click "View Script"', 'Verify empty state message shown'], feedback: null },
  { id: 'TC-018', name: 'Verify Partial Git API Failure Shows Content Without Commit', type: 'edge_case', priority: 'low', citations: ['SEG-19'], citationTypes: ['edge_case'],
    steps: ['Simulate Git API returning content but failing commit endpoint', 'Click "View Script"', 'Verify script displays with "Unable to load commit details"'], feedback: null },
];

// ========== SHELL ==========
const SidebarItem = ({ icon: Icon, active, label }) => (
  <div className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${active ? 'bg-blue-500/20' : 'hover:bg-white/10'}`} title={label}>
    <Icon size={18} className={active ? 'text-blue-400' : 'text-gray-400'} />
  </div>
);

const SidebarNav = () => (
  <div className="w-14 flex-shrink-0 flex flex-col items-center py-3 gap-1" style={{ backgroundColor: TO.sidebar }}>
    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-3">
      <span className="text-white font-bold text-sm">K</span>
    </div>
    <SidebarItem icon={Home} label="Home" />
    <SidebarItem icon={ClipboardList} active label="Plans" />
    <SidebarItem icon={TestTube2} label="Tests" />
    <SidebarItem icon={Package} label="Assets" />
    <SidebarItem icon={Play} label="Executions" />
    <SidebarItem icon={BarChart3} label="Reports" />
    <SidebarItem icon={Cloud} label="TestCloud" />
    <div className="flex-1" />
    <SidebarItem icon={Cog} label="Settings" />
  </div>
);

// ========== CITATION BADGE ==========
const CitationBadge = ({ segmentId, type, isActive, onHover, onLeave, small }) => {
  const c = CITATION_COLORS[type] || CITATION_COLORS.requirement;
  return (
    <span onMouseEnter={() => onHover?.(segmentId)} onMouseLeave={() => onLeave?.()}
      className={`inline-flex items-center gap-0.5 rounded font-medium cursor-default transition-all ${small ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'} ${isActive ? 'ring-2 ring-offset-1 scale-105' : ''}`}
      style={{ backgroundColor: c.bg, color: c.text }} title={`${c.label}: ${segmentId}`}>
      <Link2 size={small ? 8 : 9} />{segmentId}
    </span>
  );
};

// ========== REQUIREMENT PANEL ==========
const RequirementPanel = ({ highlightedSegments, onSegmentHover, onSegmentLeave }) => (
  <div className="bg-white rounded-lg border p-4 space-y-3" style={{ borderColor: TO.cardBd }}>
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-xs font-semibold" style={{ color: TO.textPrimary }}>Requirement</h3>
      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: '#F5F3FF', color: TO.aiAccent }}>
        {citableSegments.length} segments parsed
      </span>
    </div>
    {requirementSections.map((section, si) => (
      <div key={si}>
        <h4 className="text-[11px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: TO.textMuted }}>{section.title}</h4>
        <div className="space-y-1.5">
          {section.segments.map(segId => {
            const seg = citableSegments.find(s => s.id === segId);
            if (!seg) return null;
            const hl = highlightedSegments.includes(segId);
            const c = CITATION_COLORS[seg.type];
            return (
              <div key={segId} id={`seg-${segId}`}
                onMouseEnter={() => onSegmentHover(segId)} onMouseLeave={onSegmentLeave}
                className="p-2 rounded-md border-l-[3px] transition-all text-xs leading-relaxed"
                style={{ borderLeftColor: hl ? c.border : 'transparent', backgroundColor: hl ? c.bg : 'transparent', color: TO.textSecondary, boxShadow: hl ? `0 0 0 1px ${c.border}40` : 'none' }}>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5"><CitationBadge segmentId={segId} type={seg.type} isActive={hl} small /></span>
                  <span>{seg.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

// ========== CLARIFICATION ==========
const ClarificationItem = ({ item, onResolve }) => {
  const [ci, setCi] = useState('');
  const [sc, setSc] = useState(false);
  if (item.resolved) {
    return (
      <div className="p-2.5 rounded-lg border" style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
        <div className="flex items-start gap-2">
          <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" style={{ color: TO.passed }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: '#065F46' }}>{item.question}</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#047857' }}>✓ {item.resolvedAnswer}</p>
          </div>
          <button onClick={() => onResolve(item.id, null)} className="text-[10px] hover:underline" style={{ color: '#047857' }}>Change</button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-2.5 rounded-lg border" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
      <div className="flex items-start gap-2 mb-2">
        <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: TO.warning }} />
        <p className="text-xs font-medium" style={{ color: '#92400E' }}>{item.question}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {item.suggestions.map((s, i) => (
          <button key={i} onClick={() => onResolve(item.id, s)} className="px-2 py-1 text-[11px] bg-white rounded-md border font-medium hover:bg-amber-50 transition-colors" style={{ color: '#92400E', borderColor: '#FCD34D' }}>{s}</button>
        ))}
      </div>
      {!sc ? <button onClick={() => setSc(true)} className="text-[10px] hover:underline" style={{ color: '#B45309' }}>+ Custom</button> : (
        <div className="flex gap-1.5 mt-1.5">
          <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} placeholder="Your answer..."
            className="flex-1 px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white" style={{ borderColor: '#FCD34D' }}
            onKeyDown={(e) => { if (e.key === 'Enter' && ci.trim()) onResolve(item.id, ci); }} autoFocus />
          <button onClick={() => { if (ci.trim()) onResolve(item.id, ci); }} disabled={!ci.trim()} className="px-2 py-1 text-xs text-white rounded-md font-medium disabled:opacity-50" style={{ backgroundColor: TO.warning }}>Apply</button>
        </div>
      )}
    </div>
  );
};

// ========== DOC UPLOAD ==========
const DocUpload = ({ documents, onUpload, onRemove }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const handle = (e) => { Array.from(e.target.files || []).forEach(f => { const d = { id: Date.now() + Math.random(), name: f.name, status: 'processing' }; onUpload(d); setTimeout(() => onUpload({ ...d, status: 'done' }), 1500); }); };
  return (
    <div className="border rounded-lg" style={{ borderColor: TO.cardBd }}>
      <input ref={ref} type="file" multiple onChange={handle} className="hidden" accept=".pdf,.doc,.docx,.txt,.md" />
      <button onClick={() => setOpen(!open)} className="w-full px-3 py-2 flex items-center justify-between text-xs hover:bg-gray-50 rounded-lg">
        <span className="flex items-center gap-2" style={{ color: TO.textSecondary }}>
          <Upload size={12} />Add documents
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100" style={{ color: TO.textMuted }}>Optional</span>
          {documents.length > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>{documents.length}</span>}
        </span>
        {open ? <ChevronUp size={13} style={{ color: TO.textMuted }} /> : <ChevronDown size={13} style={{ color: TO.textMuted }} />}
      </button>
      {open && (
        <div className="px-3 pb-2.5 space-y-1.5">
          {documents.map(d => (
            <div key={d.id} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded border text-xs" style={{ borderColor: TO.cardBd }}>
              <File size={12} className="text-red-500" /><span className="flex-1 truncate" style={{ color: TO.textBody }}>{d.name}</span>
              {d.status === 'processing' ? <Loader2 size={12} className="animate-spin" style={{ color: TO.primary }} /> : <CheckCircle2 size={12} style={{ color: TO.passed }} />}
              <button onClick={() => onRemove(d.id)} className="p-0.5 hover:bg-gray-200 rounded"><X size={10} style={{ color: TO.textMuted }} /></button>
            </div>
          ))}
          <button onClick={() => ref.current?.click()} className="w-full py-2 border-2 border-dashed rounded-lg text-xs flex items-center justify-center gap-1.5 hover:border-indigo-400 hover:text-indigo-600 transition-colors" style={{ borderColor: '#D1D5DB', color: TO.textSecondary }}>
            <Upload size={12} />Upload PDF, Word, TXT, Markdown
          </button>
        </div>
      )}
    </div>
  );
};

// ========== AI GENERATION SECTION ==========
const AIGenSection = ({ clarifications, onResolve, documents, onUpload, onRemoveDoc, onGenerate, isGenerating, hasGenerated, depth, onDepthChange, onAskKai }) => {
  const [expanded, setExpanded] = useState(true);
  const resolved = clarifications.filter(c => c.resolved).length;
  const total = clarifications.length;
  let score = 65 + resolved * 10 + (resolved === total ? 5 : 0) + (documents.length > 0 ? 10 : 0);
  score = Math.min(score, 98);
  const color = score >= 85 ? TO.passed : score >= 70 ? TO.warning : '#F97316';

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#C4B5FD', background: 'linear-gradient(to bottom, #F5F3FF, #FFFFFF)' }}>
      <div className="px-4 py-3 cursor-pointer hover:bg-purple-50/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: TO.aiAccent }}><Sparkles size={15} className="text-white" /></div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: TO.textPrimary }}>AI Test Generation</h3>
              <p className="text-[11px]" style={{ color: TO.textSecondary }}>{hasGenerated ? '✓ Tests generated — review on right' : `${total - resolved} clarification${total - resolved !== 1 ? 's' : ''} to improve results`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} /></div>
              <span className="text-xs font-bold" style={{ color }}>{score}%</span>
            </div>
            {expanded ? <ChevronUp size={15} style={{ color: TO.textMuted }} /> : <ChevronDown size={15} style={{ color: TO.textMuted }} />}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color: TO.textSecondary }}>Depth:</span>
              <div className="flex rounded-md border overflow-hidden" style={{ borderColor: TO.cardBd }}>
                {['quick', 'thorough'].map(d => (
                  <button key={d} onClick={() => onDepthChange(d)} className="px-2.5 py-1 text-[11px] font-medium transition-colors"
                    style={{ backgroundColor: depth === d ? TO.aiAccent : 'white', color: depth === d ? 'white' : TO.textSecondary }}>
                    {d === 'quick' ? '⚡ Quick' : '🔍 Thorough'}
                  </button>
                ))}
              </div>
              <span className="text-[10px]" style={{ color: TO.textMuted }}>{depth === 'quick' ? 'Core scenarios' : 'All scenarios + edge cases'}</span>
            </div>
            <button onClick={() => onGenerate('initial')} disabled={isGenerating || hasGenerated}
              className="w-full py-2.5 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ backgroundColor: isGenerating || hasGenerated ? TO.textMuted : TO.aiAccent }}>
              {isGenerating ? <><Loader2 size={15} className="animate-spin" />Generating...</> : hasGenerated ? <><CheckCircle2 size={15} />Generated — Review on Right</> : <><Wand2 size={15} />Generate Test Cases</>}
            </button>
          </div>
          {total > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-medium flex items-center gap-1" style={{ color: TO.textBody }}><Lightbulb size={11} style={{ color: TO.warning }} />Resolve to improve results</h4>
                <span className="text-[10px]" style={{ color: TO.textMuted }}>{resolved}/{total}</span>
              </div>
              <div className="space-y-1.5">{clarifications.map(i => <ClarificationItem key={i.id} item={i} onResolve={onResolve} />)}</div>
            </div>
          )}
          <DocUpload documents={documents} onUpload={onUpload} onRemove={onRemoveDoc} />
          <button onClick={() => onAskKai('Help me understand the test coverage needs for this requirement')}
            className="w-full py-1.5 text-xs rounded-lg flex items-center justify-center gap-1.5 hover:bg-purple-50 transition-colors"
            style={{ color: TO.aiAccent, border: '1px dashed #C4B5FD' }}><Bot size={12} />Ask Kai for help</button>
        </div>
      )}
    </div>
  );
};

// ========== TEST REVIEW CARD ==========
const TestCard = ({ test, status, isEditing, editForm, setEditForm, onAccept, onReject, onEdit, onSaveEdit, onCancelEdit, onRegenerate, onFeedback, onCitHover, onCitLeave }) => {
  if (!test?.id) return null;
  const stMap = { [TEST_STATUS.ACCEPTED]: { bg: '#ECFDF5', bd: '#A7F3D0' }, [TEST_STATUS.MODIFIED]: { bg: '#EFF6FF', bd: '#BFDBFE' }, [TEST_STATUS.REJECTED]: { bg: '#FEF2F2', bd: '#FECACA' }, [TEST_STATUS.REGENERATING]: { bg: '#FFFBEB', bd: '#FDE68A' } };
  const st = stMap[status] || { bg: TO.cardBg, bd: TO.cardBd };

  if (status === TEST_STATUS.REGENERATING) return <div className="p-3 rounded-lg border" style={{ backgroundColor: st.bg, borderColor: st.bd }}><div className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" style={{ color: TO.warning }} /><span className="text-sm" style={{ color: '#92400E' }}>Regenerating...</span></div></div>;

  if (isEditing) return (
    <div className="p-3 rounded-lg border space-y-2" style={{ backgroundColor: st.bg, borderColor: st.bd }}>
      <div><label className="text-[11px] mb-1 block" style={{ color: TO.textSecondary }}>Test Name</label>
        <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-2.5 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400" style={{ borderColor: TO.cardBd }} /></div>
      <div><label className="text-[11px] mb-1 block" style={{ color: TO.textSecondary }}>Steps</label>
        <textarea value={editForm.steps || ''} onChange={(e) => setEditForm(f => ({ ...f, steps: e.target.value }))} rows={3} className="w-full px-2.5 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400" style={{ borderColor: TO.cardBd }} /></div>
      <div className="flex gap-1.5"><button onClick={onSaveEdit} className="px-3 py-1 text-white text-xs font-medium rounded-md" style={{ backgroundColor: TO.aiAccent }}>Save</button><button onClick={onCancelEdit} className="px-3 py-1 text-xs font-medium rounded-md border" style={{ color: TO.textSecondary, borderColor: TO.cardBd }}>Cancel</button></div>
    </div>
  );

  return (
    <div className={`p-3 rounded-lg border transition-all ${status === TEST_STATUS.REJECTED ? 'opacity-40' : ''}`} style={{ backgroundColor: st.bg, borderColor: st.bd }}
      onMouseEnter={() => onCitHover(test.citations || [])} onMouseLeave={onCitLeave}>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono" style={{ color: TO.textMuted }}>{test.id}</span>
          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${test.type === 'positive' ? 'bg-green-100 text-green-700' : test.type === 'negative' ? 'bg-red-100 text-red-700' : test.type === 'boundary' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>{test.type}</span>
          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${test.priority === 'high' ? 'bg-red-50 text-red-600' : test.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{test.priority}</span>
          {status === TEST_STATUS.ACCEPTED && <CheckCircle2 size={12} style={{ color: TO.passed }} />}
          {status === TEST_STATUS.MODIFIED && <span className="text-[10px] font-medium" style={{ color: TO.link }}>(edited)</span>}
        </div>
      </div>
      <p className="text-[13px] font-medium mb-1.5" style={{ color: TO.textBody }}>{test.name}</p>
      {/* Citations */}
      <div className="flex flex-wrap gap-1 mb-2">
        {(test.citations || []).map((segId, i) => <CitationBadge key={segId} segmentId={segId} type={test.citationTypes?.[i] || 'requirement'} onHover={() => onCitHover([segId])} onLeave={onCitLeave} />)}
      </div>
      {test.steps?.length > 0 && <div className="mb-2"><ol className="text-xs space-y-0.5 pl-4" style={{ color: TO.textSecondary }}>{test.steps.slice(0, 2).map((s, i) => <li key={i} className="list-decimal">{s}</li>)}{test.steps.length > 2 && <li className="list-none" style={{ color: TO.textMuted }}>+{test.steps.length - 2} more</li>}</ol></div>}
      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: `${st.bd}80` }}>
        <div className="flex gap-1">
          {status === TEST_STATUS.PENDING && <><button onClick={onAccept} className="px-2 py-1 text-white text-[11px] font-medium rounded-md flex items-center gap-0.5" style={{ backgroundColor: TO.passed }}><Check size={10} />Accept</button><button onClick={onReject} className="px-2 py-1 text-white text-[11px] font-medium rounded-md flex items-center gap-0.5" style={{ backgroundColor: TO.failed }}><X size={10} />Reject</button></>}
          {status !== TEST_STATUS.REJECTED && <><button onClick={onEdit} className="px-2 py-1 text-[11px] font-medium rounded-md flex items-center gap-0.5 border" style={{ color: TO.textSecondary, borderColor: TO.cardBd }}><Edit3 size={10} />Edit</button><button onClick={onRegenerate} className="px-2 py-1 text-[11px] font-medium rounded-md flex items-center gap-0.5" style={{ color: '#92400E', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}><RotateCcw size={10} />Regen</button></>}
        </div>
        <div className="flex gap-0.5">
          <button onClick={() => onFeedback(test.id, 'up')} className={`p-1 rounded ${test.feedback === 'up' ? 'bg-green-100' : 'hover:bg-gray-100'}`}><ThumbsUp size={12} style={{ color: test.feedback === 'up' ? TO.passed : TO.textMuted }} /></button>
          <button onClick={() => onFeedback(test.id, 'down')} className={`p-1 rounded ${test.feedback === 'down' ? 'bg-red-100' : 'hover:bg-gray-100'}`}><ThumbsDown size={12} style={{ color: test.feedback === 'down' ? TO.failed : TO.textMuted }} /></button>
        </div>
      </div>
    </div>
  );
};

// ========== REVIEW PANEL ==========
const ReviewPanel = ({ tests, statuses, editingId, editForm, setEditForm, handlers, stats, onCitHover, onCitLeave }) => {
  const safe = (tests || []).filter(t => t?.id);
  const s = stats || { accepted: 0, rejected: 0, pending: 0 };
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#C4B5FD', backgroundColor: TO.cardBg }}>
      <div className="px-4 py-2.5 border-b" style={{ background: 'linear-gradient(to right, #F5F3FF, #EDE9FE)', borderColor: '#DDD6FE' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Eye size={14} style={{ color: TO.aiAccent }} /><span className="text-sm font-semibold" style={{ color: TO.textPrimary }}>Review Generated Tests</span></div>
          <div className="flex items-center gap-2.5 text-xs"><span className="font-medium" style={{ color: TO.passed }}>✓ {s.accepted}</span><span className="font-medium" style={{ color: TO.failed }}>✗ {s.rejected}</span><span style={{ color: TO.textMuted }}>○ {s.pending}</span></div>
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: TO.textSecondary }}>Hover a test to highlight its source requirement segment on the left.</p>
      </div>
      <div className="px-4 py-2 border-b flex items-center gap-2" style={{ backgroundColor: '#FAFAFA', borderColor: TO.cardBd }}>
        <button onClick={handlers.onAcceptAll} disabled={s.pending === 0} className="px-3 py-1.5 text-white text-xs font-medium rounded-md flex items-center gap-1 disabled:opacity-40" style={{ backgroundColor: s.pending > 0 ? TO.passed : TO.textMuted }}><CheckCircle2 size={12} />Accept All ({s.pending})</button>
      </div>
      <div className="p-3 space-y-2.5 max-h-[460px] overflow-auto">
        {safe.map((t, i) => <TestCard key={t.id || i} test={t} status={statuses[t.id] || TEST_STATUS.PENDING} isEditing={editingId === t.id} editForm={editForm} setEditForm={setEditForm}
          onAccept={() => handlers.onAccept(t.id)} onReject={() => handlers.onReject(t.id)} onEdit={() => handlers.onEdit(t)} onSaveEdit={handlers.onSaveEdit} onCancelEdit={handlers.onCancelEdit}
          onRegenerate={() => handlers.onRegenerate(t.id)} onFeedback={handlers.onFeedback} onCitHover={onCitHover} onCitLeave={onCitLeave} />)}
      </div>
      <div className="px-4 py-3 border-t" style={{ backgroundColor: '#FAFAFA', borderColor: TO.cardBd }}>
        <button onClick={handlers.onFinalize} disabled={s.pending > 0} className="w-full py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 text-white transition-all"
          style={{ backgroundColor: s.pending === 0 ? TO.passed : TO.textMuted, opacity: s.pending === 0 ? 1 : 0.5 }}>
          {s.pending === 0 ? <><Save size={15} />Save {s.accepted} Tests to Requirement</> : <><AlertCircle size={15} />{s.pending} remaining</>}
        </button>
      </div>
    </div>
  );
};

// ========== TRACEABILITY COVERAGE ==========
const TraceabilityCoverage = ({ savedTests, canMore, onGenMore, onCitHover, onCitLeave }) => {
  const segCov = {};
  citableSegments.forEach(s => { segCov[s.id] = { ...s, tests: [] }; });
  savedTests.forEach(tc => (tc.citations || []).forEach(sid => { if (segCov[sid]) segCov[sid].tests.push(tc.id); }));
  const covered = Object.values(segCov).filter(s => s.tests.length > 0).length;
  const total = citableSegments.length;
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: covered < total ? '#FDE68A' : '#A7F3D0', backgroundColor: TO.cardBg }}>
      <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ backgroundColor: covered < total ? '#FFFBEB' : '#ECFDF5', borderColor: covered < total ? '#FDE68A' : '#A7F3D0' }}>
        <div className="flex items-center gap-2"><Target size={14} style={{ color: covered < total ? TO.warning : TO.passed }} /><span className="text-sm font-semibold" style={{ color: TO.textPrimary }}>Requirement Traceability</span></div>
        <span className="text-xs font-bold" style={{ color: covered < total ? '#B45309' : '#047857' }}>{covered}/{total} segments ({Math.round(covered / total * 100)}%)</span>
      </div>
      <div className="p-3 space-y-0.5 max-h-[250px] overflow-auto">
        {Object.values(segCov).map(seg => (
          <div key={seg.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50 transition-colors" onMouseEnter={() => onCitHover([seg.id])} onMouseLeave={onCitLeave}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {seg.tests.length > 0 ? <CheckCircle2 size={11} style={{ color: TO.passed }} /> : <Circle size={11} style={{ color: TO.textMuted }} />}
              <CitationBadge segmentId={seg.id} type={seg.type} small />
              <span className="text-[11px] truncate" style={{ color: TO.textSecondary }}>{seg.text.substring(0, 55)}...</span>
            </div>
            <span className="text-[11px] font-medium flex-shrink-0 ml-2" style={{ color: seg.tests.length > 0 ? TO.textMuted : '#B45309' }}>{seg.tests.length > 0 ? `${seg.tests.length} TC` : 'uncovered'}</span>
          </div>
        ))}
      </div>
      {canMore && <div className="px-4 py-2 border-t" style={{ borderColor: TO.cardBd }}>
        <button onClick={onGenMore} className="w-full py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 border hover:bg-purple-50 transition-colors" style={{ color: TO.aiAccent, borderColor: '#C4B5FD' }}><PlusCircle size={12} />Generate More Tests (cover remaining segments)</button>
      </div>}
    </div>
  );
};

// ========== KAI ==========
const KaiPanel = ({ isOpen, onClose, initialPrompt }) => {
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState('');
  useEffect(() => { if (isOpen) setMsgs([{ role: 'assistant', content: initialPrompt ? `I see: "${initialPrompt}". Let me analyze ${mockRequirement.id}.` : `Hi! Context loaded for ${mockRequirement.id}.`, suggestions: ['Coverage strategy', 'Edge case review', 'Compare with similar'] }]); }, [isOpen, initialPrompt]);
  const send = () => { if (!inp.trim()) return; setMsgs(p => [...p, { role: 'user', content: inp }]); setInp(''); setTimeout(() => setMsgs(p => [...p, { role: 'assistant', content: `Analyzing...`, suggestions: [] }]), 800); };
  if (!isOpen) return null;
  return (
    <div className="fixed right-0 top-0 bottom-0 w-[340px] bg-white border-l shadow-2xl z-50 flex flex-col" style={{ borderColor: TO.cardBd }}>
      <div className="px-4 py-3" style={{ backgroundColor: TO.aiAccent }}>
        <div className="flex items-center justify-between text-white"><div className="flex items-center gap-2"><div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center"><Bot size={16} /></div><div><h2 className="font-semibold text-sm">Kai</h2><p className="text-[10px] text-white/70">{mockRequirement.id}</p></div></div><button onClick={onClose} className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded"><X size={16} /></button></div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">{msgs.map((m, i) => (
        <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
          {m.role === 'assistant' && <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"><Bot size={12} style={{ color: TO.aiAccent }} /></div>}
          <div className="max-w-[230px] p-2.5 rounded-xl text-sm" style={{ backgroundColor: m.role === 'user' ? TO.aiAccent : '#F3F4F6', color: m.role === 'user' ? 'white' : TO.textBody }}>
            {m.content}{m.suggestions?.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{m.suggestions.map((s, j) => <button key={j} onClick={() => setInp(s)} className="px-1.5 py-0.5 text-[10px] rounded border bg-white" style={{ color: TO.aiAccent, borderColor: '#DDD6FE' }}>{s}</button>)}</div>}
          </div>
        </div>
      ))}</div>
      <div className="p-3 border-t" style={{ borderColor: TO.cardBd, backgroundColor: '#FAFAFA' }}>
        <div className="flex gap-1.5 p-1.5 border rounded-lg bg-white" style={{ borderColor: TO.cardBd }}>
          <input type="text" value={inp} onChange={(e) => setInp(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask Kai..." className="flex-1 text-sm bg-transparent focus:outline-none" />
          <button onClick={send} disabled={!inp.trim()} className="p-1.5 rounded-lg text-white" style={{ backgroundColor: inp.trim() ? TO.aiAccent : TO.textMuted }}><Send size={14} /></button>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN ==========
export default function AmbientAITestGeneratorV8() {
  const [docs, setDocs] = useState([]);
  const [showKai, setShowKai] = useState(false);
  const [kaiP, setKaiP] = useState('');
  const [gen, setGen] = useState(false);
  const [genProg, setGenProg] = useState(0);
  const [hasGen, setHasGen] = useState(false);
  const [genMode, setGenMode] = useState('initial');
  const [depth, setDepth] = useState('quick');
  const [hlSegs, setHlSegs] = useState([]);

  const [clarifs, setClarifs] = useState([
    { id: 1, question: 'What Git hosting services should be supported?', suggestions: ['GitHub only', 'GitHub + GitLab', 'GitHub + GitLab + Bitbucket'], resolved: false, resolvedAnswer: null },
    { id: 2, question: 'Should script caching persist across sessions or be per-view?', suggestions: ['Per-view (always fetch)', 'Cache for 24h', 'Cache until next execution'], resolved: false, resolvedAnswer: null },
  ]);

  const [tcs, setTcs] = useState([]);
  const [sts, setSts] = useState({});
  const [review, setReview] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editF, setEditF] = useState({ name: '', steps: '' });
  const [saved, setSaved] = useState([]);
  const [canMore, setCanMore] = useState(false);

  const citHover = useCallback((ids) => { const arr = Array.isArray(ids) ? ids : [ids]; setHlSegs(arr); const el = document.getElementById(`seg-${arr[0]}`); el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, []);
  const citLeave = useCallback(() => setHlSegs([]), []);

  const doGen = (mode = 'initial') => {
    const src = mode === 'additional' ? mockAdditionalTests : mockCoreTests;
    setGen(true); setGenProg(0); setGenMode(mode);
    if (mode === 'initial') { setTcs([]); setSts({}); }
    src.forEach((tc, i) => {
      setTimeout(() => {
        setTcs(p => [...p, { ...tc }]); setSts(p => ({ ...p, [tc.id]: TEST_STATUS.PENDING })); setGenProg(((i + 1) / src.length) * 100);
        if (i === src.length - 1) setTimeout(() => { setGen(false); setHasGen(true); setReview(true); setCanMore(mode === 'initial'); }, 300);
      }, 200 * (i + 1));
    });
  };

  const fb = (id, type) => setTcs(p => p.map(t => t.id === id ? { ...t, feedback: t.feedback === type ? null : type } : t));
  const finalize = () => { setSaved(tcs.filter(t => t?.id && (sts[t.id] === TEST_STATUS.ACCEPTED || sts[t.id] === TEST_STATUS.MODIFIED))); setReview(false); };
  const getStats = () => { const safe = tcs.filter(t => t?.id); return { accepted: safe.filter(t => sts[t.id] === TEST_STATUS.ACCEPTED || sts[t.id] === TEST_STATUS.MODIFIED).length, rejected: safe.filter(t => sts[t.id] === TEST_STATUS.REJECTED).length, pending: safe.filter(t => !sts[t.id] || sts[t.id] === TEST_STATUS.PENDING || sts[t.id] === TEST_STATUS.REGENERATING).length, total: safe.length }; };

  const handlers = {
    onAccept: (id) => setSts(p => ({ ...p, [id]: TEST_STATUS.ACCEPTED })),
    onReject: (id) => setSts(p => ({ ...p, [id]: TEST_STATUS.REJECTED })),
    onAcceptAll: () => { const u = { ...sts }; tcs.filter(t => t?.id).forEach(t => { if (!u[t.id] || u[t.id] === TEST_STATUS.PENDING) u[t.id] = TEST_STATUS.ACCEPTED; }); setSts(u); },
    onEdit: (t) => { if (!t?.id) return; setEditId(t.id); setEditF({ name: t.name || '', steps: (t.steps || []).join('\n') }); },
    onSaveEdit: () => { if (!editId) return; setTcs(p => p.map(t => t.id === editId ? { ...t, name: editF.name, steps: editF.steps.split('\n').filter(Boolean) } : t)); setSts(p => ({ ...p, [editId]: TEST_STATUS.MODIFIED })); setEditId(null); },
    onCancelEdit: () => { setEditId(null); setEditF({ name: '', steps: '' }); },
    onRegenerate: (id) => { setSts(p => ({ ...p, [id]: TEST_STATUS.REGENERATING })); setTimeout(() => { setTcs(p => p.map(t => t.id === id ? { ...t, name: t.name + ' (v2)' } : t)); setSts(p => ({ ...p, [id]: TEST_STATUS.PENDING })); }, 1500); },
    onFeedback: fb,
    onFinalize: finalize,
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: TO.pageBg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-11 bg-white border-b flex items-center justify-between px-4" style={{ borderColor: TO.cardBd }}>
          <div className="flex items-center gap-2"><span className="text-sm font-medium" style={{ color: TO.textBody }}>TestOps - RA</span><ChevronDown size={13} style={{ color: TO.textMuted }} /></div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setKaiP(''); setShowKai(true); }} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg flex items-center gap-1.5" style={{ backgroundColor: TO.aiAccent }}><Sparkles size={13} />Ask Kai</button>
            <Bell size={16} style={{ color: TO.textSecondary }} />
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center"><span className="text-[11px] font-medium text-indigo-700">VP</span></div>
          </div>
        </div>
        {/* Breadcrumb */}
        <div className="px-5 py-1.5 bg-white border-b flex items-center text-xs" style={{ borderColor: TO.cardBd, color: TO.textSecondary }}>Plans<ChevronRight size={11} className="mx-1" /><span className="font-medium" style={{ color: TO.textBody }}>{mockRequirement.id}</span></div>
        {/* Page header */}
        <div className="bg-white border-b px-5 py-3" style={{ borderColor: TO.cardBd }}>
          <h1 className="text-base font-semibold" style={{ color: TO.textPrimary }}>{mockRequirement.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: TO.textSecondary }}>
            <span>Tester: {mockRequirement.tester}</span><span>•</span><span>{saved.length || mockRequirement.testCases} Tests</span><span>•</span>
            <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#EFF6FF', color: TO.link }}>{mockRequirement.issueType}</span>
          </div>
        </div>
        {/* Main */}
        <main className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* LEFT */}
            <div className="w-[400px] flex-shrink-0 overflow-y-auto p-4 space-y-3 border-r" style={{ borderColor: TO.cardBd }}>
              <AIGenSection clarifications={clarifs} onResolve={(id, ans) => setClarifs(p => p.map(c => c.id === id ? { ...c, resolved: ans !== null, resolvedAnswer: ans } : c))}
                documents={docs} onUpload={(d) => setDocs(p => { const e = p.find(x => x.id === d.id); return e ? p.map(x => x.id === d.id ? d : x) : [...p, d]; })} onRemoveDoc={(id) => setDocs(p => p.filter(d => d.id !== id))}
                onGenerate={doGen} isGenerating={gen} hasGenerated={hasGen} depth={depth} onDepthChange={setDepth}
                onAskKai={(p) => { setKaiP(p); setShowKai(true); }} />
              {/* Legend */}
              <div className="px-3 py-2 rounded-lg border" style={{ borderColor: TO.cardBd, backgroundColor: '#FAFAFA' }}>
                <div className="text-[10px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: TO.textMuted }}>Citation Types</div>
                <div className="flex flex-wrap gap-1">{Object.entries(CITATION_COLORS).map(([k, c]) => <span key={k} className="px-1.5 py-0.5 text-[9px] font-medium rounded" style={{ backgroundColor: c.bg, color: c.text }}>{c.label}</span>)}</div>
              </div>
              <RequirementPanel highlightedSegments={hlSegs} onSegmentHover={(id) => setHlSegs([id])} onSegmentLeave={() => setHlSegs([])} />
            </div>
            {/* RIGHT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {gen && <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#C4B5FD', backgroundColor: '#F5F3FF' }}>
                <div className="px-4 py-2.5 flex items-center justify-between"><div className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" style={{ color: TO.aiAccent }} /><span className="text-sm font-medium" style={{ color: '#5B21B6' }}>{genMode === 'additional' ? 'Generating additional...' : 'Generating test cases...'}</span></div><span className="text-sm font-semibold" style={{ color: TO.aiAccent }}>{tcs.length}/{genMode === 'additional' ? mockAdditionalTests.length : mockCoreTests.length}</span></div>
                <div className="h-1.5" style={{ backgroundColor: '#DDD6FE' }}><div className="h-full transition-all" style={{ width: `${genProg}%`, backgroundColor: TO.aiAccent }} /></div>
              </div>}

              {review && <ReviewPanel tests={tcs} statuses={sts} editingId={editId} editForm={editF} setEditForm={setEditF} handlers={handlers} stats={getStats()} onCitHover={citHover} onCitLeave={citLeave} />}

              {saved.length > 0 && !review && <TraceabilityCoverage savedTests={saved} canMore={canMore} onGenMore={() => doGen('additional')} onCitHover={citHover} onCitLeave={citLeave} />}

              {saved.length > 0 && !review && (
                <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: TO.cardBd }}>
                  <div className="px-4 py-2 border-b flex items-center justify-between" style={{ backgroundColor: '#FAFAFA', borderColor: TO.cardBd }}>
                    <h2 className="text-sm font-semibold" style={{ color: TO.textPrimary }}>Saved Test Cases</h2>
                    <span className="text-xs" style={{ color: TO.textSecondary }}>{saved.length} items</span>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto">
                    {saved.map((tc, i) => (
                      <div key={tc.id} className="flex items-center gap-2.5 px-4 py-2 border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: '#F3F4F6' }}
                        onMouseEnter={() => citHover(tc.citations || [])} onMouseLeave={citLeave}>
                        <span className="text-[11px] w-4" style={{ color: TO.textMuted }}>{i + 1}</span>
                        <BookOpen size={12} style={{ color: TO.textMuted }} />
                        <span className="text-[11px] font-mono font-medium" style={{ color: TO.link }}>{tc.id}</span>
                        <span className="text-xs flex-1 truncate" style={{ color: TO.textBody }}>{tc.name}</span>
                        <div className="flex gap-0.5 flex-shrink-0">{(tc.citations || []).map((s, j) => <CitationBadge key={s} segmentId={s} type={tc.citationTypes?.[j] || 'requirement'} small />)}</div>
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-purple-100 text-purple-700 rounded">MANUAL</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!gen && !hasGen && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#F5F3FF' }}><Wand2 size={28} style={{ color: TO.aiAccent }} /></div>
                    <p className="text-sm font-medium" style={{ color: TO.textBody }}>Generate test cases from the requirement</p>
                    <p className="text-xs mt-1" style={{ color: TO.textMuted }}>Click "Generate Test Cases" on the left to start</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <KaiPanel isOpen={showKai} onClose={() => { setShowKai(false); setKaiP(''); }} initialPrompt={kaiP} />
      {!showKai && <button onClick={() => { setKaiP(''); setShowKai(true); }} className="fixed bottom-5 right-5 w-11 h-11 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center z-40" style={{ backgroundColor: TO.aiAccent }} title="Ask Kai"><Bot size={20} /></button>}
    </div>
  );
}
