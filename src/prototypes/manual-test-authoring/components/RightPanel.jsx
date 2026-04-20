import React, { useState, useCallback, useRef } from 'react';
import { ChevronDown, ChevronRight, FileText, Tag, GitBranch, Clock, Plus, ExternalLink, X, PanelRightOpen, PanelRightClose, Paperclip, File, ImageIcon, FileSpreadsheet, Flag, User, PlayCircle, Timer, Box, Layers, Monitor, Server } from 'lucide-react';
import { T } from '../../../utils/design-system';
import { ATTACHMENTS } from '../data/mockData';

import { Badge, RightDrawer, DrawerSection } from '../../../components/shared';

export const Sel = ({ label, value, opts, onChange, required, icon: Icon }) => (
  <div className="mb-2.5">
    <label style={{ fontSize: 11, color: T.t4, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
      {Icon && <Icon size={11} />}
      {label}{required && <span style={{ color: T.red }}> *</span>}
    </label>
    <select value={value} onChange={e => onChange?.(e.target.value)} className="w-full outline-none cursor-pointer"
      style={{ fontSize: 12, fontWeight: 400, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 5, padding: "4px 6px", lineHeight: 1.4 }}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export const RPanel = ({ meta, setMeta, open, toggle, width, onResize }) => {
  const dragRef = useRef(null);
  const startResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    const onMove = (ev) => { const delta = startX - ev.clientX; onResize(Math.max(220, Math.min(420, startW + delta))); };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [width, onResize]);

  const fileIcon = (type) => type === "pdf" ? File : type === "image" ? ImageIcon : FileSpreadsheet;


  if (!open) return (
    <div className="shrink-0 flex flex-col items-center pt-2" style={{ borderLeft: `1px solid ${T.bd}`, background: T.card }}>
      <button onClick={toggle} className="p-1.5 rounded-md transition-colors" style={{ color: T.t3 }}
        onMouseEnter={e => { e.currentTarget.style.background = T.muted; e.currentTarget.style.color = T.t1; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.t3; }}>
        <PanelRightOpen size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
  return (
    <RightDrawer title="Details" onClose={toggle} width={width}>
      {/* Resize handle */}
      <div onMouseDown={startResize}
        style={{ position: "absolute", left: -3, top: 0, bottom: 0, width: 6, cursor: "col-resize", zIndex: 10 }}
        onMouseEnter={e => e.currentTarget.style.background = T.accentBorder}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"} />
      <div className="flex-1 overflow-y-auto">
        <DrawerSection title="Properties" icon={FileText}>
          <div className="mb-2.5">
            <label style={{ fontSize: 11, color: T.t4, fontWeight: 500, display: "block", marginBottom: 3 }}>Status</label>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.status === "Published" ? T.green : meta.status === "Draft" ? T.t4 : T.amber }} />
              <span style={{ fontSize: 12, color: T.t2 }}>{meta.status}</span>
            </div>
          </div>
          <Sel label="Priority" icon={Flag} value={meta.priority} opts={["Critical", "High", "Medium", "Low"]} onChange={v => setMeta("priority", v)} />
          <Sel label="Assignee" icon={User} value={meta.assignee} opts={["Huy Dao", "Anh Le", "Vuong Thien Phu", "Unassigned"]} onChange={v => setMeta("assignee", v)} />
          <Sel label="Reviewer" icon={User} value={meta.reviewer || "Anh Le"} opts={["Anh Le", "Huy Dao", "Vuong Thien Phu", "Unassigned"]} onChange={v => setMeta("reviewer", v)} />
          <Sel label="Execution Type" icon={PlayCircle} value={meta.execType || "Manual"} opts={["Manual", "Automated", "Semi-automated"]} onChange={v => setMeta("execType", v)} />
          <Sel label="Estimated Duration" icon={Timer} value={meta.duration || "5 min"} opts={["1 min", "2 min", "5 min", "10 min", "15 min", "30 min", "60 min"]} onChange={v => setMeta("duration", v)} />
        </DrawerSection>


        <DrawerSection title="Classification" icon={Tag}>
          <Sel label="Module" icon={Box} value="Authentication" opts={["Authentication", "Dashboard", "Reports", "User Management", "API", "Settings"]} />
          <Sel label="Test Type" icon={Layers} value="Functional" opts={["Functional", "Regression", "Smoke", "Integration", "E2E", "UAT"]} />
          <Sel label="Environment" icon={Server} value={meta.env || "Staging"} opts={["Production", "Staging", "QA", "Dev", "All"]} onChange={v => setMeta("env", v)} />
          <Sel label="Platform" icon={Monitor} value={meta.platform || "Web — Chrome"} opts={["Web — Chrome", "Web — Firefox", "Web — Safari", "iOS — Mobile", "Android — Mobile", "API"]} onChange={v => setMeta("platform", v)} />
          <div className="mb-2">
            <label style={{ fontSize: 11, color: T.t4, fontWeight: 500, display: "block", marginBottom: 3 }}>Tags</label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {["login", "P0", "auth", "sprint-42"].map(t => (
                <span key={t} className="flex items-center gap-0.5 px-1.5 py-px rounded"
                  style={{ fontSize: 10, fontWeight: 500, color: T.t2, background: T.muted, border: `1px solid ${T.bd}` }}>
                  {t} <X size={9} className="cursor-pointer" style={{ color: T.t4 }}
                    onMouseEnter={e => e.currentTarget.style.color = T.red} onMouseLeave={e => e.currentTarget.style.color = T.t4} />
                </span>
              ))}
            </div>
            <input placeholder="Add tag..." className="w-full outline-none" style={{ fontSize: 11, color: T.t2, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 5, padding: "3px 6px" }} />
          </div>
        </DrawerSection>

        <DrawerSection title="Linkages" icon={GitBranch}>
          {[
            { l: "Requirement", v: "REQ-1042", sub: "User login flow" },
            { l: "User Story", v: "US-3187", sub: "As a user, I can log in" },
            { l: "Defects", v: "None", sub: null },
            { l: "Last Execution", v: "EX-9401", sub: "Passed · Apr 14" },
            { l: "Execution History", v: "3 runs", sub: "2 passed, 1 failed" },
          ].map(x => (
            <div key={x.l} className="py-1.5" style={{ borderBottom: `1px solid ${T.bdLight}` }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 11, color: T.t3 }}>{x.l}</span>
                <span className="flex items-center gap-0.5" style={{ fontSize: 11, fontWeight: 500, color: x.v === "None" ? T.t4 : T.brand, cursor: x.v !== "None" ? "pointer" : "default" }}
                  onMouseEnter={e => { if (x.v !== "None") e.currentTarget.style.color = T.accent; }}
                  onMouseLeave={e => { if (x.v !== "None") e.currentTarget.style.color = T.brand; }}>
                  {x.v} {x.v !== "None" && <ExternalLink size={9} />}
                </span>
              </div>
              {x.sub && <div style={{ fontSize: 10, color: T.t4, marginTop: 1 }}>{x.sub}</div>}
            </div>
          ))}
          <button className="flex items-center gap-1 mt-2 transition-colors"
            style={{ fontSize: 11, fontWeight: 500, color: T.brand }}
            onMouseEnter={e => e.currentTarget.style.color = T.accent}
            onMouseLeave={e => e.currentTarget.style.color = T.brand}>
            <Plus size={11} /> Add link
          </button>
        </DrawerSection>

        <DrawerSection title="Activity" icon={Clock} initOpen={false}>
          <div className="space-y-2.5">
            {[
              { who: "Huy Dao", action: "updated steps 5–7", when: "2 hours ago" },
              { who: "Anh Le", action: "changed status to Published", when: "Apr 14" },
              { who: "Huy Dao", action: "created this test case", when: "Apr 10" },
            ].map((ev, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: T.muted, fontSize: 8, fontWeight: 700, color: T.t3 }}>
                  {ev.who.split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  <span style={{ fontSize: 11, color: T.t2 }}><strong style={{ fontWeight: 600 }}>{ev.who}</strong> {ev.action}</span>
                  <div style={{ fontSize: 10, color: T.t4 }}>{ev.when}</div>
                </div>
              </div>
            ))}
          </div>
        </DrawerSection>
      </div>
    </RightDrawer>
  );
};
