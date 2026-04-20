export const INIT = [
  { id: 1, step: "Navigate to the login page at /auth/login", exp: "Login page loads with email and password fields visible", data: "URL: https://app.example.com/auth/login" },
  { id: 2, step: "Verify the login form UI elements are displayed correctly", exp: "Email field, Password field, 'Sign In' button, 'Forgot Password' link, and 'Remember Me' checkbox are all visible", data: "" },
  { id: 3, step: "Enter valid email in the email field", exp: "Email is accepted and displayed in the input field", data: "Email: qa.tester@katalon.io" },
  { id: 4, step: "Enter valid password in the password field", exp: "Password is masked with dots", data: "Password: Test@2026!" },
  { id: 5, step: 'Click the "Sign In" button', exp: "", data: "" },
  { id: 6, step: "Wait for redirect", exp: "", data: "" },
  { id: 7, step: "Verify the dashboard page loads with the correct welcome message", exp: 'Welcome banner shows "Welcome back, QA Tester" with today\'s date', data: "" },
  { id: 8, step: "Check session", exp: "Browser cookie contains valid auth token", data: "" },
  { id: 9, step: 'Click the user avatar in the top-right corner and select "Profile"', exp: "Profile page opens displaying the logged-in user's details", data: "Expected name: QA Tester" },
  { id: 10, step: "Verify logout", exp: "", data: "" },
];

export const AI_STEPS = [
  { id: 101, step: 'Click "Sign In" with empty email and password fields', exp: 'Validation errors: "Email is required" and "Password is required"', data: "Email: (empty) · Password: (empty)" },
  { id: 102, step: "Enter an invalid email format and attempt sign in", exp: 'Validation error: "Please enter a valid email address"', data: "Email: not-an-email" },
  { id: 103, step: "Enter valid email with incorrect password", exp: 'Error: "Invalid email or password. 4 attempts remaining."', data: "Password: WrongPass123" },
  { id: 104, step: 'Verify "Remember Me" checkbox is present and unchecked by default', exp: "Checkbox is visible and not selected", data: "" },
];

export const ATTACHMENTS = [
  { name: "login-spec-v2.pdf", size: "2.4 MB", type: "pdf", date: "Apr 8", thumb: null },
  { name: "login-flow-screenshot.png", size: "348 KB", type: "image", date: "Apr 10", thumb: true },
  { name: "error-state-mockup.png", size: "215 KB", type: "image", date: "Apr 12", thumb: true },
];
