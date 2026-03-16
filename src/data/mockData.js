// --- Real-life Requirement ---
export const mockRequirement = {
  id: 'TO-9201',
  title: 'View Test Script Code from Test Result Details',
  tester: 'Vuong Thien Phu',
  testCases: 0,
  issueType: 'Feature',
  sprint: 23,
};

// Citable segments parsed from the requirement text
export const citableSegments = [
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

export const requirementSections = [
  { title: 'User Story', segments: ['SEG-1'] },
  { title: 'Details — Access & Entry Points', segments: ['SEG-2'] },
  { title: 'Details — Content Display', segments: ['SEG-3', 'SEG-4', 'SEG-5'] },
  { title: 'Details — User Interactions', segments: ['SEG-6', 'SEG-7'] },
  { title: 'Scenarios — Allow view script', segments: ['SEG-8', 'SEG-9', 'SEG-10', 'SEG-11'] },
  { title: 'Scenarios — Not allow view script', segments: ['SEG-12', 'SEG-13', 'SEG-14', 'SEG-15', 'SEG-16', 'SEG-17', 'SEG-18', 'SEG-19'] },
];

// Generated test scenarios with citations
export const mockCoreTests = [
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

export const mockAdditionalTests = [
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
