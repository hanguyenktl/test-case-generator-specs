import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { T, F } from '../../utils/design-system';

export default function Layout({ children, breadcrumbs = [] }) {
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ ...F, backgroundColor: T.bg, color: T.t2 }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        {/* Breadcrumb Row */}
        {breadcrumbs.length > 0 && (
          <div className="h-9 px-4 flex items-center gap-2 text-[12px] border-b" style={{ backgroundColor: T.card, borderColor: T.border }}>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className={idx === breadcrumbs.length - 1 ? 'font-medium' : 'text-gray-500 hover:underline cursor-pointer'} style={{ color: idx === breadcrumbs.length - 1 ? T.t1 : T.t3 }}>
                  {crumb}
                </span>
                {idx < breadcrumbs.length - 1 && <span className="text-gray-300">/</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
