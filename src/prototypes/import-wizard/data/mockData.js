export const STEPS = [
  { id: 1, label: "Upload file" },
  { id: 2, label: "Map fields" },
  { id: 3, label: "Review & import" },
];

export const TARGETS = [
  { id: "__skip__", label: "Don't import this column", group: "" },
  // Required
  { id: "name", label: "Test Case Name", required: true, group: "Required" },
  // Core
  { id: "description", label: "Description", group: "Core" },
  { id: "preconditions", label: "Preconditions", group: "Core" },
  { id: "steps", label: "Test Steps", group: "Core" },
  { id: "expected", label: "Expected Result", group: "Core" },
  { id: "priority", label: "Priority", group: "Core", hasValueMap: true },
  { id: "status", label: "Status", group: "Core", hasValueMap: true },
  { id: "folder", label: "Folder / Location", group: "Core" },
  { id: "tags", label: "Tags", group: "Core" },
  { id: "owner", label: "Assigned to", group: "Core" },
  // Custom (existing)
  { id: "cf_reqId", label: "Requirement ID", group: "Custom field" },
  { id: "cf_feature", label: "Feature Area", group: "Custom field" },
];

export const BUILD_ROWS = () => ([
  { id: 1, csv: "Title",            sample: "Verify user can log in with valid credentials",    target: "name",       auto: "alias" },
  { id: 2, csv: "ID",               sample: "C2104",                                            target: "__skip__",   auto: null },
  { id: 3, csv: "Section",          sample: "Authentication > Login",                           target: "folder",     auto: "alias" },
  { id: 4, csv: "Preconditions",    sample: "User has a verified account",                      target: "preconditions", auto: "exact" },
  { id: 5, csv: "Steps",            sample: "1. Navigate to login page\n2. Enter credentials",  target: "steps",      auto: "alias" },
  { id: 6, csv: "Expected Result",  sample: "User lands on dashboard",                          target: "expected",   auto: "exact" },
  { id: 7, csv: "Priority",         sample: "High",                                             target: "priority",   auto: "exact", needsValueMap: true },
  { id: 8, csv: "Type",             sample: "Functional",                                       target: "tags",       auto: "alias" },
  { id: 9, csv: "Status",           sample: "Active",                                           target: "status",     auto: "exact", needsValueMap: true, valueMapDone: false },
  { id: 10, csv: "References",      sample: "JIRA-8821, JIRA-9003",                             target: "cf_reqId",   auto: "alias" },
  { id: 11, csv: "Sprint",          sample: "Sprint 21",                                        target: null,         auto: null, customFieldCandidate: true },
  { id: 12, csv: "Estimate (hrs)",  sample: "0.5",                                              target: null,         auto: null, customFieldCandidate: true },
  { id: 13, csv: "Created By",      sample: "alex.nguyen@acme.com",                             target: "__skip__",   auto: null },
  { id: 14, csv: "Last Modified",   sample: "2026-03-14",                                       target: "__skip__",   auto: null },
]);
