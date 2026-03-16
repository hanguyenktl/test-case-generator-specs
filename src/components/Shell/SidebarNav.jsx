import React from 'react';
import { Home, ClipboardList, TestTube2, Package, Play, BarChart3, Cloud, Cog } from 'lucide-react';
import { TO } from '../../utils/theme';

const SidebarItem = ({ icon: Icon, active, label }) => (
  <div className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${active ? 'bg-blue-500/20' : 'hover:bg-white/10'}`} title={label}>
    <Icon size={18} className={active ? 'text-blue-400' : 'text-gray-400'} />
  </div>
);

export const SidebarNav = () => (
  <div className="w-14 flex-shrink-0 flex flex-col items-center py-3 gap-1" style={{ backgroundColor: TO.sidebar }}>
    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-3">
      <span className="text-white font-bold text-sm">K</span>
    </div>
    <SidebarItem icon={Home} label="Home" />
    <SidebarItem icon={ClipboardList} active label="Plans" />
    <SidebarItem icon={TestTube2} label="Tests" />
    <SidebarItem icon={Package} label="Assets" />
    <SidebarItem icon={Play} label="Executions" />
    <SidebarItem icon={BarChart3} label="Reports" />
    <SidebarItem icon={Cloud} label="TestCloud" />
    <div className="flex-1" />
    <SidebarItem icon={Cog} label="Settings" />
  </div>
);
