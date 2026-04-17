import React from 'react';
import { Sparkles, Bell, ChevronDown, Search } from 'lucide-react';
import { T } from '../../utils/design-system';

export default function TopBar() {
  return (
    <header 
      className="h-11 border-b flex items-center justify-between px-4"
      style={{ backgroundColor: T.card, borderColor: T.border }}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer transition-colors text-[13px] font-medium" style={{ color: T.t2 }}>
          <span>TestOps</span>
          <span className="text-gray-300">/</span>
          <span>RA Project</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative group">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..."
            className="h-7 w-48 pl-8 pr-2 rounded bg-gray-50 border border-transparent focus:border-indigo-300 focus:bg-white transition-all text-[12px] outline-none"
          />
        </div>

        {/* Ask Kai Button */}
        <button 
          className="flex items-center gap-1.5 px-3 py-1 rounded text-white text-[12px] font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: T.brand }}
        >
          <Sparkles size={14} />
          <span>Ask Kai</span>
        </button>

        <div className="flex items-center gap-3 border-l pl-4 ml-1" style={{ borderColor: T.border }}>
          <button className="text-gray-500 hover:text-gray-700">
            <Bell size={18} strokeWidth={1.6} />
          </button>
          <div className="w-7 h-7 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-[11px] font-semibold overflow-hidden">
            <img 
              src="https://ui-avatars.com/api/?name=Huy+Dao&background=5e6ad2&color=fff" 
              alt="User" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
