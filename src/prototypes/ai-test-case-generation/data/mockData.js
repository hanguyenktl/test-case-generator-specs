export const MOCK_FOLDERS = ["Authentication Tests", "Checkout Flow", "Report Module", "User Management"];

export const PIPELINE_STEPS = [
  { key: "reading", label: "Reading requirement", sub: "Parsing auth-flow-spec.pdf (page 4/12)" },
  { key: "analyzing", label: "Analyzing scenarios", sub: "Identifying feature areas and test boundaries..." },
  { key: "clarifying", label: "Clarifying", sub: "Checking for ambiguity and gaps..." },
  { key: "generating", label: "Generating", sub: "Creating test steps and expected results..." },
];

export const CLARS = [
  { id: 1, q: "What is the expected behavior when a user enters an expired session token?", opts: ["Show error & redirect to login", "Auto-refresh token silently", "Show warning with retry option"], resolved: null },
  { id: 2, q: "Should password reset require email verification before allowing a new password?", opts: ["Yes, always", "Only for new devices"], resolved: null },
];

export const FEATURE_GROUPS = [
  {
    area: "Login & Authentication",
    cases: [
      { id: 1, name: "Verify successful login with valid credentials", chain: "credential validation → redirect → session creation", confidence: "high", steps: 5, priority: "High", tags: ["smoke", "happy-path"],
        objective: "Validates that a user with correct email and password can log in successfully and has an active session.",
        preconditions: "User account exists with verified email.",
        stepsData: [
          { action: "Navigate to the login page", expected: "Login form displays email and password fields", data: "URL: /auth/login" },
          { action: "Enter valid email 'testuser@example.com'", expected: "Email accepted without validation errors", data: "user: testuser@example.com" },
          { action: "Enter valid password 'SecureP@ss123'", expected: "Password field masks input", data: "pass: SecureP@ss123" },
          { action: "Click 'Sign In'", expected: "Loading indicator, form disabled" },
          { action: "Observe redirect", expected: "Dashboard loads with welcome message" },
        ],
        confExplanation: "Clear requirement mapping. Well-defined steps matching known auth patterns.",
      },
      { id: 2, name: "Verify login fails with empty credentials", chain: "empty field validation → error display → no redirect", confidence: "high", steps: 3, priority: "High", tags: ["negative", "validation"],
        objective: "Ensures the system prevents login when fields are empty.",
        preconditions: "Application is accessible.",
        stepsData: [
          { action: "Navigate to the login page", expected: "Login form displayed" },
          { action: "Leave fields empty, click 'Sign In'", expected: "Validation errors for both fields" },
          { action: "Verify page state", expected: "User stays on login page" },
        ],
        confExplanation: "Standard validation pattern. High certainty.",
      },
      { id: 3, name: "Verify account lockout after 5 failed attempts", chain: "attempt tracking → lockout trigger → unlock mechanism", confidence: "medium", steps: 7, priority: "High", tags: ["security", "edge-case"],
        objective: "Tests brute-force protection by verifying account locks after configured failures.",
        preconditions: "User account exists. Lockout threshold configured to 5.",
        stepsData: [
          { action: "Navigate to login page", expected: "Login form displayed" },
          { action: "Enter valid email, incorrect password, click 'Sign In'", expected: "Error: 'Invalid credentials'" },
          { action: "Repeat 4 more times", expected: "Warning after attempt 3: '2 attempts remaining'" },
          { action: "Attempt 6th login with correct password", expected: "'Account locked. Try again in 15 minutes.'" },
          { action: "Verify lockout duration", expected: "Account locked for 15 minutes" },
          { action: "Wait or admin unlock", expected: "Account accessible again" },
          { action: "Login with correct credentials", expected: "Success. Counter resets." },
        ],
        confExplanation: "AI assumed lockout threshold is 5 (not specified). Lockout duration assumed 15 min. Verify steps 4-6.",
      },
    ],
  },
  {
    area: "Session Management",
    cases: [
      { id: 4, name: "Verify session expires after inactivity timeout", chain: "idle detection → expiry trigger → redirect", confidence: "medium", steps: 4, priority: "Medium", tags: ["timeout", "session"],
        objective: "Validates sessions expire after the configured inactivity period.",
        preconditions: "User logged in. Timeout = 30 min.",
        stepsData: [
          { action: "Log in and note session start", expected: "Dashboard loads. Session active." },
          { action: "Idle for 30+ minutes", expected: "No change during idle" },
          { action: "Attempt any action", expected: "'Session expired. Please log in again.'" },
          { action: "Click 'Log in'", expected: "Redirect to login page" },
        ],
        confExplanation: "AI assumed timeout is 30 minutes (not specified). Verify exact value.",
      },
      { id: 5, name: "Verify concurrent session limit enforcement", chain: "multi-device login → eviction policy → notification", confidence: "low", steps: 3, priority: "Low", tags: ["edge-case", "multi-device"],
        objective: "Tests concurrent session limits and conflict handling.",
        preconditions: "User account exists. Session policy configured.",
        stepsData: [
          { action: "Log in on Device A (desktop)", expected: "Login succeeds. Session A active." },
          { action: "Log in same account on Device B (mobile)", expected: "Login succeeds. Behavior depends on policy." },
          { action: "Return to Device A, perform action", expected: "Either still active OR 'Signed out: new session detected'" },
        ],
        confExplanation: "Concurrent session handling not described. Steps are speculative. Needs judgment.",
      },
    ],
  },
  {
    area: "Password Recovery",
    cases: [
      { id: 6, name: "Verify password reset email is sent", chain: "reset request → email delivery → token validity", confidence: "high", steps: 5, priority: "Medium", tags: ["smoke", "recovery"],
        objective: "Validates forgot-password flow from request to successful change.",
        preconditions: "User with verified email exists. Email service functional.",
        stepsData: [
          { action: "Click 'Forgot password?' on login page", expected: "Reset form appears" },
          { action: "Enter email, click 'Send reset link'", expected: "'Reset link sent to your email'" },
          { action: "Check email inbox", expected: "Email received within 2 minutes" },
          { action: "Click reset link", expected: "New password form appears" },
          { action: "Enter and confirm new password", expected: "'Password updated'. Redirect to login." },
        ],
        confExplanation: "Well-defined flow. Token expiry assumed 24 hours.",
      },
    ],
  },
];

export const ALL_CASES = FEATURE_GROUPS.flatMap(g => g.cases.map(c => ({ ...c, area: g.area })));

export const EXISTING_TCS = [
  { id: "TC-516324", name: "Verify user login functionality", type: "MANUAL", status: "Published", priority: "High" },
  { id: "TC-516340", name: "Verify forgot password flow", type: "MANUAL", status: "Published", priority: "Medium" },
  { id: "TC-516358", name: "Verify user registration with valid data", type: "MANUAL", status: "Draft", priority: "High" },
  { id: "AC-FA049536", name: "Verify UI of report dashboard", type: "AUTOMATED", status: "Published", priority: "Low" },
  { id: "TC-516382", name: "Verify session timeout behavior", type: "MANUAL", status: "Published", priority: "Medium" },
];

export const GEN_MORE_OPTS = ["Edge cases & boundary values", "Negative tests", "Security tests", "API / integration tests", "Performance considerations"];

export const QUALITY_DIMS = [
  { label: "Completeness", score: 65, tip: "Missing error handling scenarios, no mention of rate limits" },
  { label: "Clarity", score: 82, tip: "Clear language, well-structured requirements" },
  { label: "Testability", score: 70, tip: "Most requirements are verifiable, but MFA criteria are vague" },
  { label: "Consistency", score: 78, tip: "Minor conflicts between session timeout and SSO behavior" },
];

export const LINKED_TCS_FULL = [
  { id: "TC-516324", name: "Verify user login functionality", type: "MANUAL", status: "Published", priority: "High", lastRun: "Passed", updated: "Apr 12" },
  { id: "TC-516340", name: "Verify forgot password flow", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", updated: "Apr 10" },
  { id: "TC-516358", name: "Verify user registration with valid data", type: "MANUAL", status: "Draft", priority: "High", lastRun: "—", updated: "Apr 14" },
  { id: "AC-FA049536", name: "Verify UI of report dashboard", type: "AUTOMATED", status: "Published", priority: "Low", lastRun: "Failed", updated: "Apr 11" },
  { id: "TC-516382", name: "Verify session timeout behavior", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", updated: "Apr 9" },
  { id: "TC-516401", name: "Verify SSO login via SAML 2.0", type: "MANUAL", status: "Draft", priority: "High", lastRun: "—", updated: "Apr 15" },
  { id: "TC-516415", name: "Verify account lockout notification email", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", updated: "Apr 8" },
];

export const TC_LIST_DATA = [
  { id: "TC-516324", name: "Verify user login functionality", type: "MANUAL", status: "Published", priority: "High", lastRun: "Passed", assignee: "Huy Dao", updated: "Apr 12", tags: ["smoke"] },
  { id: "TC-516340", name: "Verify forgot password flow", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", assignee: "Anh Le", updated: "Apr 10", tags: ["recovery"] },
  { id: "TC-516358", name: "Verify user registration with valid data", type: "MANUAL", status: "Draft", priority: "High", lastRun: "—", assignee: "Huy Dao", updated: "Apr 14", tags: ["happy-path"] },
  { id: "AC-FA049536", name: "Verify UI of report dashboard", type: "AUTOMATED", status: "Published", priority: "Low", lastRun: "Failed", assignee: "Minh Tran", updated: "Apr 11", tags: ["ui"] },
  { id: "TC-516382", name: "Verify session timeout behavior", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", assignee: "Huy Dao", updated: "Apr 9", tags: ["session"] },
  { id: "AC-FA049550", name: "Verify checkout calculates tax correctly", type: "AUTOMATED", status: "Published", priority: "High", lastRun: "Passed", assignee: "Minh Tran", updated: "Apr 13", tags: ["calculation"] },
  { id: "TC-516401", name: "Verify SSO login via SAML 2.0", type: "MANUAL", status: "Draft", priority: "High", lastRun: "—", assignee: "Anh Le", updated: "Apr 15", tags: ["sso", "security"] },
  { id: "TC-516415", name: "Verify account lockout notification email", type: "MANUAL", status: "Published", priority: "Medium", lastRun: "Passed", assignee: "Huy Dao", updated: "Apr 8", tags: ["email"] },
];

export const TC_FOLDERS = [
  { name: "All Test Cases", count: 128, active: true },
  { name: "Authentication Tests", count: 24, indent: 1 },
  { name: "Checkout Flow", count: 18, indent: 1 },
  { name: "Report Module", count: 31, indent: 1 },
  { name: "User Management", count: 22, indent: 1 },
  { name: "API Tests", count: 33, indent: 1 },
];
