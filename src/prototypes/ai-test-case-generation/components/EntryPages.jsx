import React, { useState } from 'react';
import { Badge, PriBadge, Button, ListToolbar, TestCaseTable, TCTableRenderers, IBtn } from '../../../components/shared';
import { QUALITY_DIMS, LINKED_TCS_FULL, TC_LIST_DATA, TC_FOLDERS } from '../data/mockData';
import { MiniEditor, ReqQualityPopover } from './SharedComponents';
import { MoreHorizontal, Play, BookOpen, Link2, ExternalLink, ChevronDown, ShieldCheck, FileText, File, Plus, Search, Hash, Users, Clock, Zap, Globe, Target, Sparkles, FolderOpen, Upload } from 'lucide-react';
import { T } from '../../../utils/design-system';

/* ═══════════════════════════════════════════════════════════════
   ENTRY PAGE: J1 — REQUIREMENT DETAILS
   ═══════════════════════════════════════════════════════════════ */
export const ReqDetailPage = ({ onGenerate, onExecute }) => {
  const [qualOpen, setQualOpen] = useState(false);
  const overallQuality = 72;
  const qualColor = overallQuality >= 80 ? T.green : overallQuality >= 60 ? T.amber : T.red;

  const qualityData = {
    overall: 72,
    color: T.amber,
    dims: { completeness: 85, clarity: 78, ambiguity: 42, testability: 65 }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Premium Header — PERFECTLY UNIFIED with Authoring */}
      <div className="shrink-0 px-5 py-3 border-b" style={{ background: T.card, borderColor: T.bd }}>
        {/* Row 1: Metadata & Badges */}
        <div className="flex items-center gap-2 mb-2">
          <Badge color={T.purple} bg="rgba(124,58,237,0.06)" border="rgba(124,58,237,0.15)">JIRA</Badge>
          <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.t4 }}>TO-8526</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border" style={{ borderColor: T.bd, background: "transparent" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: T.t2 }}>Approved</span>
          </div>
          <div style={{ width: 1, height: 12, background: T.bd, margin: "0 4px" }} />
          <div className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: 11, fontWeight: 500 }}>
            <BookOpen size={12} /> Story &middot; Sprint 14
          </div>
        </div>

        {/* Row 2: Title & Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="flex-1 min-w-0 truncate"
              style={{ fontSize: 16, fontWeight: 600, color: T.t1, letterSpacing: -0.2 }}>
              User authentication flow
            </h1>

            {/* Quality Shield — Styled like Authoring */}
            <div className="relative shrink-0">
              <button onClick={() => setQualOpen(!qualOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
                style={{ border: `1px solid rgba(217,119,6,0.2)`, background: qualOpen ? "rgba(217,119,6,0.06)" : "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(217,119,6,0.06)"}
                onMouseLeave={e => { if (!qualOpen) e.currentTarget.style.background = "transparent"; }}>
                <ShieldCheck size={12} style={{ color: T.amber }} strokeWidth={1.6} />
                <span style={{ fontSize: 11, fontWeight: 600, color: T.amber, fontVariantNumeric: "tabular-nums" }}>{overallQuality}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: T.t3 }}>Quality</span>
                <ChevronDown size={10} style={{ color: T.t4 }} />
              </button>
              {qualOpen && <ReqQualityPopover quality={qualityData} onClose={() => setQualOpen(false)} />}
            </div>

            <div style={{ width: 1, height: 16, background: T.bd }} />

            <div className="flex items-center gap-1.5 text-gray-500">
              <Users size={12} />
              <span style={{ fontSize: 11, fontWeight: 500 }}>Huy Dao</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-gray-500">
              <Link2 size={12} />
              <span style={{ fontSize: 11, fontWeight: 500 }}>7 linked tests</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button icon={Play} onClick={onExecute} style={{ background: T.green, color: "#fff", borderColor: T.green }}>
              Execute
            </Button>
            <Button variant="secondary" icon={Sparkles} onClick={onGenerate} style={{ color: T.purple }}>
              Generate Tests
            </Button>
            <IBtn title="More"><MoreHorizontal size={14} /></IBtn>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Requirement Details */}
        <div className="flex-1 overflow-y-auto p-6" style={{ background: T.bg }}>
          <div className="max-w-4xl mx-auto space-y-6">
            <section>
              <label style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6, display: "block", marginBottom: 8 }}>
                Description
              </label>
              <div className="bg-white rounded-lg border shadow-sm p-2" style={{ borderColor: T.bd }}>
                <MiniEditor readOnly value={`The system shall support login with email and password. Session tokens expire after 30 minutes of inactivity. Failed login attempts are tracked, and accounts are locked after 5 consecutive failures. Password reset is available via email link. Users should be notified of suspicious login activity.

The authentication module must support Single Sign-On (SSO) integration with SAML 2.0 and OAuth 2.0 providers. Multi-factor authentication (MFA) should be available as an optional security layer.`} />
              </div>
            </section>

            <section>
              <label style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6, display: "block", marginBottom: 8 }}>
                Acceptance Criteria
              </label>
              <div className="bg-white rounded-lg border shadow-sm p-2" style={{ borderColor: T.bd }}>
                <MiniEditor readOnly value={`1. User can log in with valid email/password and is redirected to dashboard
2. Invalid credentials show inline error without page reload
3. Account locks after 5 failed attempts with 15-minute cooldown
4. Password reset link is valid for 24 hours
5. SSO login creates a local session with same timeout rules`} />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <label style={{ fontSize: 10, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6 }}>
                  Attachments (2)
                </label>
                <button className="text-indigo-600 hover:text-indigo-700 transition-colors"><Plus size={14} /></button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: "auth-flow-spec.pdf", size: "1.2 MB", icon: FileText, color: "#ef4444", type: "pdf" },
                  { name: "login-wireframe.png", size: "340 KB", icon: File, color: T.brand, type: "image", thumb: true },
                ].map((f, i) => (
                  <div key={i} className="group flex flex-col gap-2 cursor-pointer">
                    <div className="aspect-[4/3] rounded-lg border flex items-center justify-center transition-all bg-white hover:border-indigo-300 hover:shadow-md relative overflow-hidden" 
                      style={{ borderColor: T.bd }}>
                      {f.type === "image" ? (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                          <img src={`https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=150&fit=crop`} alt="thumb" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-indigo-500 transition-colors">
                          <f.icon size={24} style={{ color: f.color }} strokeWidth={1.5} />
                          <span style={{ fontSize: 9, fontWeight: 600 }}>{f.type.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IBtn variant="secondary" style={{ background: "white", padding: 4 }}><ExternalLink size={10} /></IBtn>
                      </div>
                    </div>
                    <div className="px-0.5">
                      <div style={{ fontSize: 11, fontWeight: 500, color: T.t1 }} className="truncate">{f.name}</div>
                      <div style={{ fontSize: 9, color: T.t4 }}>{f.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT — Linked Test Cases (Overhauled to TCTable) */}
        <div className="flex flex-col border-l bg-white" style={{ width: 420, borderColor: T.bd }}>
          <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 11, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.6 }}>Linked Test Cases</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px]">{LINKED_TCS_FULL.length}</span>
            </div>
            <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-[11px] transition-colors">
              <Plus size={14} /> Link Test Case
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <TestCaseTable 
              data={LINKED_TCS_FULL}
              columns={[
                { label: "TC", width: 44, render: (r) => <span style={{ fontSize: 10, fontFamily: "monospace", color: T.brand }}>{r.id.split('-')[1]}</span> },
                { label: "Name", render: (r) => (
                  <div className="py-1">
                    <div style={{ fontSize: 12, fontWeight: 500, color: T.t1, lineHeight: 1.3 }}>{r.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <PriBadge level={r.priority} />
                      <span style={{ fontSize: 9, color: T.t4 }}>{r.updated}</span>
                    </div>
                  </div>
                )},
                { label: "Status", width: 90, render: (r) => (
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${r.lastRun === "Passed" ? "bg-emerald-500" : r.lastRun === "Failed" ? "bg-rose-500" : "bg-gray-400"}`} />
                    <span style={{ fontSize: 11, color: r.lastRun === "Passed" ? T.green : r.lastRun === "Failed" ? T.red : T.t4 }}>{r.lastRun || "Never"}</span>
                  </div>
                )}
              ]}
            />
          </div>
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
