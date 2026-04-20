import React from 'react';
import { Home, ClipboardList, FlaskConical, Package, Play, BarChart3, Cloud, Settings } from 'lucide-react';
import { T } from '../../utils/design-system';
import { Link, useLocation } from 'react-router-dom';

const NAV = [
  { icon: Home, id: "home", path: "/" }, 
  { icon: ClipboardList, id: "plans", path: "/plans" },
  { icon: FlaskConical, id: "tests", path: "/prototypes/test-case-generator" }, 
  { icon: Package, id: "assets", path: "/assets" },
  { icon: Play, id: "executions", path: "/executions" }, 
  { icon: BarChart3, id: "reports", path: "/reports" },
  { icon: Cloud, id: "testcloud", path: "/testcloud" }, 
  { icon: Settings, id: "settings", path: "/settings" },
];

export default function Sidebar({ activeOverride }) {
  const location = useLocation();

  return (
    <div className="w-12 flex flex-col items-center py-3 gap-0.5 shrink-0 h-screen overflow-y-auto"
      style={{ background: T.sidebar, borderRight: `1px solid ${T.sidebarBd}` }}>
      <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold mb-4"
        style={{ background: T.sidebarActive }}>K</div>
      {NAV.map(({ icon: Icon, id, path }) => {
        // Match either by activeOverride prop (if passed by prototype) or route matching
        const a = activeOverride === id || location.pathname === path;
        return (
          <Link key={id} to={path} className="w-9 h-9 rounded-md flex items-center justify-center transition-all duration-100"
            style={{ background: a ? T.accentLight : "transparent", color: a ? T.sidebarActive : T.sidebarIcon }}
            onMouseEnter={e => { if (!a) { e.currentTarget.style.color = T.sidebarIconHover; e.currentTarget.style.background = T.hover; }}}
            onMouseLeave={e => { if (!a) { e.currentTarget.style.color = T.sidebarIcon; e.currentTarget.style.background = "transparent"; }}}>
            <Icon size={17} strokeWidth={1.6} />
          </Link>
        );
      })}
    </div>
  );
}
