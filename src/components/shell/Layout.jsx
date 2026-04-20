import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { T, F } from '../../utils/design-system';

const Bread = ({ path }) => (
  <div className="px-5 py-1.5 flex items-center gap-1.5 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}`, fontSize: 12 }}>
    {path.map((p, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i > 0 && <span style={{ color: T.t4, fontSize: 10 }}>/</span>}
        <span style={{ color: i === path.length - 1 ? T.t1 : T.t3, fontWeight: i === path.length - 1 ? 500 : 400, cursor: "pointer" }}
          onMouseEnter={e => { if (i < path.length - 1) e.currentTarget.style.color = T.accent; }}
          onMouseLeave={e => { if (i < path.length - 1) e.currentTarget.style.color = T.t3; }}>
          {p}
        </span>
      </span>
    ))}
  </div>
);

export default function Layout({ children, breadcrumbs = [], activeSidebarId, customTopBarContent }) {
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ ...F, background: T.bg, color: T.t2 }}>
      <Sidebar activeOverride={activeSidebarId} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar customContent={customTopBarContent} />
        {breadcrumbs.length > 0 && <Bread path={breadcrumbs} />}
        {children}
      </div>
    </div>
  );
}
