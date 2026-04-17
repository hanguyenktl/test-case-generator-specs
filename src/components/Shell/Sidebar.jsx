import React from 'react';
import { Home, ClipboardList, FlaskConical, Box, PlayCircle, BarChart3, Cloud, Settings, ChevronRight } from 'lucide-react';
import { T } from '../../utils/design-system';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'plans', icon: ClipboardList, label: 'Plans', path: '/plans' },
  { id: 'tests', icon: FlaskConical, label: 'Tests', path: '/tests' },
  { id: 'assets', icon: Box, label: 'Assets', path: '/assets' },
  { id: 'exec', icon: PlayCircle, label: 'Executions', path: '/executions' },
  { id: 'reports', icon: BarChart3, label: 'Reports', path: '/reports' },
  { id: 'cloud', icon: Cloud, label: 'TestCloud', path: '/testcloud' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside 
      className="w-12 h-screen flex flex-col items-center py-4 border-r overflow-y-auto"
      style={{ backgroundColor: T.sidebar, borderColor: T.border }}
    >
      <div className="mb-6">
        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
          K
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className="group relative flex items-center justify-center p-2 rounded-md transition-colors"
              style={{ 
                backgroundColor: isActive ? T.aiLight : 'transparent' 
              }}
              title={item.label}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2 : 1.6}
                style={{ color: isActive ? T.brand : T.t3 }}
              />
              {isActive && (
                <div 
                  className="absolute left-0 w-1 h-4 rounded-r-full"
                  style={{ backgroundColor: T.brand }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
