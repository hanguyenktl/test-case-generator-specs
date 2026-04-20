import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ClipboardList, Clock, ExternalLink, File, FileText, FolderOpen, Info, Link2, Pencil, Plus, Search, ShieldCheck, Sparkles, Target, Upload, Users, Zap, BookOpen, Globe, Hash } from 'lucide-react';
import { T } from '../../../utils/design-system';
import { Badge, PriBadge, Button, ListToolbar, TestCaseTable, TCTableRenderers } from '../../../components/shared';
import { QUALITY_DIMS, LINKED_TCS_FULL, TC_LIST_DATA, TC_FOLDERS } from '../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   ENTRY PAGE: J1 — REQUIREMENT DETAILS
   ═══════════════════════════════════════════════════════════════ */
export const ReqDetailPage = ({ onGenerate }) => {
  const [propsOpen, setPropsOpen] = useState(false);
  const [qualOpen, setQualOpen] = useState(false);
  const overallQuality = 72;
  const qualColor = overallQuality >= 80 ? T.green : overallQuality >= 60 ? T.amber : T.red;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Req header — sticky */}
      <div className="shrink-0 px-5 py-3" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-1.5">
            <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>TO-8526</span>
            <Badge color={T.green} bg="rgba(22,163,74,0.06)" border="rgba(22,163,74,0.15)">Approved</Badge>
            <Badge color={T.purple} bg="rgba(124,58,237,0.06)" border="rgba(124,58,237,0.15)">Jira</Badge>
            <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
            <span style={{ fontSize: 10, color: T.t4 }}>Story</span>
            <span style={{ fontSize: 10, color: T.t4 }}>&middot;</span>
            <span style={{ fontSize: 10, color: T.t4 }}>Sprint 14</span>
          </div>
          <button onClick={() => setPropsOpen(!propsOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
            style={{ fontSize: 10, color: propsOpen ? T.brand : T.t3, border: `1px solid ${propsOpen ? T.accentBorder : T.bd}`, background: propsOpen ? T.accentLight : "transparent" }}
            onMouseEnter={e => { if (!propsOpen) e.currentTarget.style.background = T.muted; }}
            onMouseLeave={e => { if (!propsOpen) e.currentTarget.style.background = "transparent"; }}>
            <Info size={10} /> Properties {propsOpen ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
          </button>
        </div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: T.t1, margin: "0 0 6px" }}>User authentication flow</h2>
        <div className="flex items-center gap-4">
          {/* Quality badge — clickable to expand breakdown */}
          <button onClick={() => setQualOpen(!qualOpen)} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors"
            style={{ background: qualOpen ? `${qualColor}08` : "transparent", border: qualOpen ? `1px solid ${qualColor}20` : "1px solid transparent" }}
            onMouseEnter={e => { if (!qualOpen) e.currentTarget.style.background = T.muted; }}
            onMouseLeave={e => { if (!qualOpen) e.currentTarget.style.background = qualOpen ? `${qualColor}08` : "transparent"; }}>
            <span style={{ fontSize: 11, color: T.t4 }}>Req Quality</span>
            <span className="w-2 h-2 rounded-full" style={{ background: qualColor }} />
            <span style={{ fontSize: 11, color: qualColor, fontWeight: 600 }}>{overallQuality}%</span>
            {qualOpen ? <ChevronUp size={9} style={{ color: T.t4 }} /> : <ChevronDown size={9} style={{ color: T.t4 }} />}
          </button>
          <div className="flex items-center gap-1.5">
            <ClipboardList size={11} style={{ color: T.t4 }} strokeWidth={1.4} />
            <span style={{ fontSize: 11, color: T.t4 }}>Linked TCs:</span>
            <span style={{ fontSize: 11, color: T.t2, fontWeight: 500 }}>7</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={11} style={{ color: T.t4 }} strokeWidth={1.4} />
            <span style={{ fontSize: 11, color: T.t4 }}>Assignee:</span>
            <span style={{ fontSize: 11, color: T.t2 }}>Huy Dao</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} style={{ color: T.t4 }} strokeWidth={1.4} />
            <span style={{ fontSize: 11, color: T.t4 }}>Updated:</span>
            <span style={{ fontSize: 11, color: T.t2 }}>Apr 14, 2026</span>
          </div>
        </div>

        {/* Quality breakdown — expandable */}
        {qualOpen && (
          <div className="mt-3 rounded-lg p-3" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
            <div className="flex items-center gap-2 mb-2.5">
              <ShieldCheck size={12} style={{ color: qualColor }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: T.t3, textTransform: "uppercase", letterSpacing: 0.4 }}>Quality Breakdown</span>
              <span className="ml-auto" style={{ fontSize: 10, color: T.t4 }}>AI-assessed &middot; semantic analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUALITY_DIMS.map(d => {
                const dc = d.score >= 80 ? T.green : d.score >= 60 ? T.amber : T.red;
                return (
                  <div key={d.label} className="flex items-center gap-2 px-2.5 py-2 rounded-md" style={{ background: T.card, border: `1px solid ${T.bdLight}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: 10, fontWeight: 500, color: T.t2 }}>{d.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: dc }}>{d.score}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full" style={{ background: T.muted }}>
                        <div className="h-1 rounded-full transition-all" style={{ width: `${d.score}%`, background: dc }} />
                      </div>
                      <div style={{ fontSize: 9, color: T.t4, marginTop: 3, lineHeight: 1.3 }}>{d.tip}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Properties drawer — expandable */}
        {propsOpen && (
          <div className="mt-3 rounded-lg p-3" style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}>
            <div className="grid grid-cols-4 gap-x-6 gap-y-2">
              {[
                { label: "Source", value: "Jira", icon: Globe },
                { label: "Key", value: "TO-8526", icon: Hash },
                { label: "Type", value: "Story", icon: BookOpen },
                { label: "Sprint", value: "Sprint 14", icon: Target },
                { label: "Assignee", value: "Huy Dao", icon: Users },
                { label: "Reporter", value: "Anh Le", icon: Users },
                { label: "Created", value: "Apr 8, 2026", icon: Clock },
                { label: "Updated", value: "Apr 14, 2026", icon: Clock },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-2">
                  <p.icon size={10} style={{ color: T.t4, flexShrink: 0 }} strokeWidth={1.4} />
                  <span style={{ fontSize: 10, color: T.t4 }}>{p.label}:</span>
                  <span style={{ fontSize: 10, color: T.t2, fontWeight: 500 }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2 mt-3">
          <Button variant="primary" icon={Sparkles} onClick={onGenerate}>
            Generate Tests
          </Button>
          <Button variant="secondary" icon={Link2}>
            Link Test Cases
          </Button>
          <Button variant="secondary" icon={ExternalLink}>
            View in Jira
          </Button>
          <div className="flex-1" />
          <Button variant="secondary">
            ...
          </Button>
        </div>
      </div>

      {/* Split body: LEFT description+attachments  |  RIGHT linked TCs */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {/* LEFT PANEL — Requirement content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ background: T.bg }}>
          {/* Description */}
          <div className="rounded-lg p-4 mb-3" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</span>
              <button className="flex items-center gap-1" style={{ fontSize: 10, color: T.brand }}>
                <Pencil size={9} /> Edit
              </button>
            </div>
            <div style={{ fontSize: 12, color: T.t2, lineHeight: 1.75 }}>
              <p style={{ marginBottom: 10 }}>
                The system shall support login with email and password. Session tokens expire after 30 minutes of inactivity.
                Failed login attempts are tracked, and accounts are locked after 5 consecutive failures.
                Password reset is available via email link. Users should be notified of suspicious login activity.
              </p>
              <p style={{ marginBottom: 10 }}>
                The authentication module must support Single Sign-On (SSO) integration with SAML 2.0 and OAuth 2.0 providers.
                Multi-factor authentication (MFA) should be available as an optional security layer.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Acceptance criteria:</strong>
              </p>
              <div style={{ paddingLeft: 12, marginTop: 4 }}>
                <div style={{ fontSize: 12, color: T.t2, lineHeight: 1.8 }}>
                  1. User can log in with valid email/password and is redirected to dashboard<br />
                  2. Invalid credentials show inline error without page reload<br />
                  3. Account locks after 5 failed attempts with 15-minute cooldown<br />
                  4. Password reset link is valid for 24 hours<br />
                  5. SSO login creates a local session with same timeout rules
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-lg p-4 mb-3" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Attachments (2)</div>
            {[
              { name: "auth-flow-spec.pdf", size: "1.2 MB", icon: FileText, color: "#dc2626" },
              { name: "login-wireframe.png", size: "340 KB", icon: File, color: T.brand },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-md mb-1.5 transition-colors cursor-pointer"
                style={{ background: T.bg, border: `1px solid ${T.bdLight}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.accentLight; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdLight; e.currentTarget.style.background = T.bg; }}>
                <f.icon size={14} style={{ color: f.color }} strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <span style={{ fontSize: 12, color: T.t1, fontWeight: 500 }}>{f.name}</span>
                </div>
                <span style={{ fontSize: 10, color: T.t4 }}>{f.size}</span>
                <button style={{ fontSize: 10, color: T.brand, fontWeight: 500 }}>Preview</button>
              </div>
            ))}
          </div>

          {/* Activity / Comments — adds realism */}
          <div className="rounded-lg p-4" style={{ background: T.card, border: `1px solid ${T.bd}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Activity</div>
            {[
              { user: "Anh Le", avatar: "A", time: "Apr 14", text: "Updated acceptance criteria for SSO login behavior" },
              { user: "Huy Dao", avatar: "H", time: "Apr 12", text: "Linked 3 additional test cases from Sprint 13 regression suite" },
              { user: "System", avatar: "K", time: "Apr 10", text: "Quality score updated: 68% → 72% after description edit", system: true },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 mb-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: a.system ? T.accentLight : T.muted, color: a.system ? T.brand : T.t3, fontSize: 8, fontWeight: 700, marginTop: 1 }}>{a.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 11, fontWeight: 500, color: a.system ? T.brand : T.t1 }}>{a.user}</span>
                    <span style={{ fontSize: 9, color: T.t4 }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.t3, lineHeight: 1.4, marginTop: 1 }}>{a.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Linked Test Cases */}
        <div className="overflow-y-auto" style={{ flex: "0 0 380px", background: T.card, borderLeft: `1px solid ${T.bd}` }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: `1px solid ${T.bd}`, background: T.card, position: "sticky", top: 0, zIndex: 2 }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Linked Test Cases</span>
              <span className="px-1.5 rounded" style={{ fontSize: 10, fontWeight: 600, color: T.brand, background: T.accentLight }}>{LINKED_TCS_FULL.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors"
                style={{ fontSize: 10, color: T.brand, fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.background = T.accentLight}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Plus size={9} /> Link
              </button>
            </div>
          </div>

          {/* Coverage summary */}
          <div className="px-4 py-2" style={{ background: T.bg, borderBottom: `1px solid ${T.bdLight}` }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />
                <span style={{ fontSize: 10, color: T.t3 }}>4 Published</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.t4 }} />
                <span style={{ fontSize: 10, color: T.t3 }}>2 Draft</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.red }} />
                <span style={{ fontSize: 10, color: T.t3 }}>1 Failed</span>
              </div>
            </div>
          </div>

          {/* TC rows */}
          {LINKED_TCS_FULL.map(tc => (
            <div key={tc.id} className="px-4 py-2.5 transition-colors cursor-pointer"
              style={{ borderBottom: `1px solid ${T.bdLight}` }}
              onMouseEnter={e => e.currentTarget.style.background = T.hover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>{tc.id}</span>
                <Badge color={tc.type === "MANUAL" ? T.purple : T.brand}
                  bg={tc.type === "MANUAL" ? "rgba(124,58,237,0.06)" : T.accentLight}
                  border={tc.type === "MANUAL" ? "rgba(124,58,237,0.12)" : T.accentBorder}>
                  {tc.type === "MANUAL" ? "Manual" : "Auto"}
                </Badge>
                <div className="flex-1" />
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tc.lastRun === "Passed" ? T.green : tc.lastRun === "Failed" ? T.red : T.t4 }} />
                  <span style={{ fontSize: 9, color: tc.lastRun === "Passed" ? T.green : tc.lastRun === "Failed" ? T.red : T.t4 }}>{tc.lastRun}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: T.t1, fontWeight: 400, lineHeight: 1.4 }}>{tc.name}</div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tc.status === "Published" ? T.green : T.t4 }} />
                  <span style={{ fontSize: 10, color: T.t4 }}>{tc.status}</span>
                </div>
                <PriBadge level={tc.priority} />
                <span style={{ fontSize: 9, color: T.t4 }}>Updated {tc.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ENTRY PAGE: J2 — TEST CASE LIST (polished)
   ═══════════════════════════════════════════════════════════════ */
export const TestCaseListPage = ({ onCreateWithAI }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [selFolder, setSelFolder] = useState("All Test Cases");
  const published = TC_LIST_DATA.filter(t => t.status === "Published").length;
  const draft = TC_LIST_DATA.filter(t => t.status === "Draft").length;
  const auto = TC_LIST_DATA.filter(t => t.type === "AUTOMATED").length;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* LEFT — Folder tree sidebar */}
      <div className="overflow-y-auto shrink-0" style={{ width: 200, background: T.card, borderRight: `1px solid ${T.bd}` }}>
        <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5 }}>Folders</span>
        </div>
        {TC_FOLDERS.map(f => (
          <button key={f.name} onClick={() => setSelFolder(f.name)}
            className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
            style={{
              paddingLeft: f.indent ? 20 : 12,
              background: selFolder === f.name ? T.accentLight : "transparent",
              borderLeft: selFolder === f.name ? `2px solid ${T.brand}` : "2px solid transparent",
            }}
            onMouseEnter={e => { if (selFolder !== f.name) e.currentTarget.style.background = T.hover; }}
            onMouseLeave={e => { if (selFolder !== f.name) e.currentTarget.style.background = "transparent"; }}>
            <FolderOpen size={11} style={{ color: selFolder === f.name ? T.brand : T.t4, flexShrink: 0 }} strokeWidth={1.4} />
            <span className="truncate" style={{ fontSize: 11, color: selFolder === f.name ? T.brand : T.t2, fontWeight: selFolder === f.name ? 500 : 400 }}>{f.name}</span>
            <span className="ml-auto" style={{ fontSize: 9, color: T.t4, fontWeight: 500 }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* RIGHT — Table area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <ListToolbar 
          searchPlaceholder="Search test cases..."
          filters={[
            { options: ["All Types", "Manual", "Automated"] },
            { options: ["All Statuses", "Published", "Draft"] },
            { options: ["All Priorities", "High", "Medium", "Low"] }
          ]}
          primaryAction={{
            label: "Create",
            icon: Plus,
            dropdownMenu: [
              { label: "Create manually", icon: Plus },
              { label: "Import from file", icon: Upload },
              { label: "Create with AI", icon: Sparkles, iconColor: T.purple, highlight: true, badge: <Badge color={T.purple} bg="rgba(124,58,237,0.06)" border="rgba(124,58,237,0.15)">New</Badge>, onClick: onCreateWithAI }
            ]
          }}
        />

        {/* Stats bar */}
        <div className="flex items-center gap-4 px-4 py-1.5 shrink-0" style={{ background: T.bg, borderBottom: `1px solid ${T.bdLight}` }}>
          <span style={{ fontSize: 10, color: T.t3 }}>{TC_LIST_DATA.length} test cases</span>
          <span style={{ color: T.bd }}>|</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />
            <span style={{ fontSize: 10, color: T.t3 }}>{published} Published</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.t4 }} />
            <span style={{ fontSize: 10, color: T.t3 }}>{draft} Draft</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={9} style={{ color: T.brand }} />
            <span style={{ fontSize: 10, color: T.t3 }}>{auto} Automated</span>
          </div>
        </div>

        {/* Table */}
        <TestCaseTable 
          data={TC_LIST_DATA}
          columns={[
            { label: "ID", width: 110, render: TCTableRenderers.id },
            { label: "Name", render: TCTableRenderers.nameWithTags },
            { label: "Type", width: 72, render: TCTableRenderers.typeBadge },
            { label: "Status", width: 90, render: TCTableRenderers.statusDot },
            { label: "Pri", width: 50, render: TCTableRenderers.priority },
            { label: "Last Run", width: 72, render: TCTableRenderers.lastRun },
            { label: "Assignee", width: 80, render: (r) => TCTableRenderers.textSmall(r.assignee) },
            { label: "Updated", width: 64, render: (r) => TCTableRenderers.textSmall(r.updated) }
          ]}
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-1.5 shrink-0" style={{ background: T.card, borderTop: `1px solid ${T.bd}` }}>
          <span style={{ fontSize: 10, color: T.t4 }}>Showing {TC_LIST_DATA.length} of 128 test cases</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-0.5 rounded" style={{ fontSize: 10, color: T.brand, fontWeight: 500, background: T.accentLight }}>1</button>
            <button className="px-2 py-0.5 rounded transition-colors" style={{ fontSize: 10, color: T.t3 }}
              onMouseEnter={e => e.currentTarget.style.background = T.muted}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>2</button>
            <button className="px-2 py-0.5 rounded transition-colors" style={{ fontSize: 10, color: T.t3 }}
              onMouseEnter={e => e.currentTarget.style.background = T.muted}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>3</button>
            <span style={{ fontSize: 10, color: T.t4 }}>...</span>
            <button className="px-2 py-0.5 rounded transition-colors" style={{ fontSize: 10, color: T.t3 }}
              onMouseEnter={e => e.currentTarget.style.background = T.muted}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>16</button>
          </div>
        </div>
      </div>
    </div>
  );
};
