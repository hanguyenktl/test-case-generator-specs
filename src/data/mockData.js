// --- Real-life Requirement ---
export const mockRequirement = {
  id: 'TO-9201',
  title: 'View Test Script Code from Test Result Details',
  tester: 'Vuong Thien Phu',
  testCases: 3,
  issueType: 'Story',
  sprint: 23,
};

export const mockRequirementText = `As a QA Engineer investigating a test failure, I want to view the test script code directly from the test result details, so that I can quickly understand what the test does and identify where it might be failing without leaving TestOps.

DETAILS — ACCESS & ENTRY POINTS
- "View Script" entry point available in Test Result Details page.

DETAILS — CONTENT DISPLAY
- Shows full script content with syntax highlighting based on file type (.groovy, .java, .py, .ts). Line numbers are displayed.
- Automatically scrolls to failing line if available from execution logs.
- Shows file path relative to repository root. Displays last commit info (SHA, author, message, timestamp).

DETAILS — USER INTERACTIONS
- Can copy code to clipboard (full script or selected lines). Can scroll through the entire script smoothly.
- Handles scripts up to 10,000 lines without performance degradation. Script loads within 2 seconds. Syntax highlighting renders progressively. Line numbers displayed correctly.

SCENARIOS — ALLOW VIEW SCRIPT
1. Git repository is no longer connected to the project → Should still display the script version used for execution with indicators.
2. Script file was deleted from Git repo → Should still display the script version used for execution with indicators.
3. Script file contains invalid characters or encoding issues → Display content with best-effort rendering.
4. Script was moved to another folder/branch that user have authorized to view → Display with updated metadata/path.

SCENARIOS — NOT ALLOW VIEW SCRIPT
- User doesn't have read permission to the Git repository → Access denied & show permission error.
- Git access token has expired or been revoked → Authentication Failed & guide user to set up PAT.
- Script File Exceeds Size Limit → Link to the original file.
- Binary file or unsupported format → Show unsupported format message.
- Script moved to unauthorized branch → Show error message.
- Test case has no Git repository link (uploaded scripts in zip repo).
- File exists in Git but has no content.
- Git API returns file content but fails to fetch commit details.`;

// Paragraph indices for highlighting (0-indexed, split by double newline)
// Each test references which paragraph(s) it was derived from
// This is the lightweight traceability: hover test → highlight paragraph

// Historical Tests from DB
export const existingLinkedTests = [
  { id: 'TC-142', name: 'Verify basic UI rendering of View Script button', type: 'manual', priority: 'medium', steps: ['Navigate to test result', 'Verify button exists'], status: 'draft' },
  { id: 'TC-145', name: 'Check authentication token expiry banner', type: 'automation', priority: 'high', steps: ['Expire token', 'Load page', 'Check banner'], status: 'active' },
  { id: 'TC-188', name: 'Test 5000 lines scrolling limit', type: 'manual', priority: 'low', steps: ['Load 5000 lines', 'Scroll down'], status: 'active' },
];

// Generated test cases — simplified, no citation types, just paragraph references
export const mockCoreTests = [
  { id: 'TC-001', name: 'Verify View Script Button Present on Test Result Details', type: 'positive', priority: 'high',
    paragraphs: [0, 1], // "As a QA Engineer..." + "ACCESS & ENTRY POINTS"
    steps: ['Navigate to a completed test execution result', 'Locate the Test Result Details page', 'Verify "View Script" entry point is visible and clickable'] },
  { id: 'TC-002', name: 'Verify Syntax Highlighting For Groovy Script File', type: 'positive', priority: 'high',
    paragraphs: [2], // "CONTENT DISPLAY"
    steps: ['Open test result linked to a .groovy script', 'Click "View Script"', 'Verify syntax highlighting renders correctly for Groovy keywords', 'Verify line numbers displayed alongside code'] },
  { id: 'TC-003', name: 'Verify Auto-Scroll to Failing Line from Execution Log', type: 'positive', priority: 'high',
    paragraphs: [2], // "CONTENT DISPLAY" — auto-scroll
    steps: ['Open a failed test result with execution log containing line reference', 'Click "View Script"', 'Verify viewport auto-scrolls to the failing line', 'Verify failing line is visually highlighted'] },
  { id: 'TC-004', name: 'Verify Commit Metadata and File Path Display', type: 'positive', priority: 'medium',
    paragraphs: [2], // "CONTENT DISPLAY" — commit info
    steps: ['Open test result linked to a Git-tracked script', 'Click "View Script"', 'Verify file path shown relative to repository root', 'Verify last commit SHA, author, message, and timestamp displayed'] },
  { id: 'TC-005', name: 'Verify Copy to Clipboard for Full Script and Selection', type: 'positive', priority: 'medium',
    paragraphs: [3], // "USER INTERACTIONS"
    steps: ['Open script viewer', 'Click "Copy" button — verify full script copied', 'Select lines 10-20 — click "Copy Selected" — verify only selected lines copied'] },
  { id: 'TC-006', name: 'Verify Performance with 10,000 Line Script', type: 'boundary', priority: 'high',
    paragraphs: [3], // "USER INTERACTIONS" — performance
    steps: ['Open test result linked to a 10,000-line script', 'Measure time from click to full render', 'Verify load completes within 2 seconds', 'Verify syntax highlighting renders progressively'] },
  { id: 'TC-007', name: 'Verify Script Display When Git Repo Disconnected', type: 'edge_case', priority: 'high',
    paragraphs: [4], // "ALLOW VIEW SCRIPT" scenarios
    steps: ['Complete test execution while Git repo is connected', 'Disconnect Git repository from project', 'Open the test result and click "View Script"', 'Verify cached script version displays with info indicator'] },
  { id: 'TC-008', name: 'Verify Script Display When File Deleted from Git', type: 'edge_case', priority: 'high',
    paragraphs: [4], // "ALLOW VIEW SCRIPT"
    steps: ['Complete test execution', 'Delete the script file from Git repository', 'Open test result and click "View Script"', 'Verify cached script version displays with deletion indicator'] },
  { id: 'TC-009', name: 'Verify Permission Denied When User Lacks Git Read Access', type: 'negative', priority: 'high',
    paragraphs: [5], // "NOT ALLOW VIEW SCRIPT"
    steps: ['Log in as user without Git repository read permission', 'Navigate to test result', 'Click "View Script"', 'Verify access denied message displayed'] },
  { id: 'TC-010', name: 'Verify Expired Token Shows Auth Error with PAT Guide', type: 'negative', priority: 'high',
    paragraphs: [5], // "NOT ALLOW VIEW SCRIPT"
    steps: ['Revoke or expire the Git access token', 'Navigate to test result and click "View Script"', 'Verify "Authentication Failed" message', 'Verify guidance to set up PAT in Git & TestOps'] },
];

export const mockAdditionalTests = [
  { id: 'TC-011', name: 'Verify Invalid Character Handling in Script Content', type: 'edge_case', priority: 'medium',
    paragraphs: [4],
    steps: ['Upload script with invalid UTF-8 characters', 'Execute test and open result', 'Verify content renders with best-effort replacement'] },
  { id: 'TC-012', name: 'Verify Script Path Update When File Moved', type: 'edge_case', priority: 'medium',
    paragraphs: [4],
    steps: ['Complete test execution', 'Move script to different folder in authorized branch', 'Verify script displays with updated metadata/path'] },
  { id: 'TC-013', name: 'Verify Size Limit Shows Link to Original', type: 'negative', priority: 'medium',
    paragraphs: [5],
    steps: ['Create test linked to oversized script file', 'Click "View Script"', 'Verify size limit message with link to original file'] },
  { id: 'TC-014', name: 'Verify Binary File Shows Unsupported Message', type: 'negative', priority: 'medium',
    paragraphs: [5],
    steps: ['Create test referencing a .class binary file', 'Click "View Script"', 'Verify "Unsupported format" message'] },
  { id: 'TC-015', name: 'Verify Unauthorized Branch Access Shows Error', type: 'negative', priority: 'medium',
    paragraphs: [5],
    steps: ['Move script to unauthorized branch', 'Click "View Script"', 'Verify error message about insufficient permissions'] },
];

// Simple clarifications — optional, one-click resolve
export const mockClarifications = [
  { id: 1, question: 'What Git hosting services should be supported?', suggestions: ['GitHub only', 'GitHub + GitLab', 'GitHub + GitLab + Bitbucket'] },
  { id: 2, question: 'Should script caching persist across sessions?', suggestions: ['Per-view (always fetch)', 'Cache for 24h', 'Cache until next execution'] },
];
