import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { T } from '../../../utils/design-system';
import { Button } from './Button';

export const ListToolbar = ({ 
  searchPlaceholder = "Search...", 
  searchValue, 
  onSearchChange,
  filters = [], // { label: "All Types", options: ["All Types", "Manual", "Automated"], value, onChange }
  primaryAction, // { label: "Create", icon: Plus, onClick, dropdownMenu: [] }
  children // For custom elements
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ background: T.card, borderBottom: `1px solid ${T.bd}` }}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md" style={{ background: T.bg, border: `1px solid ${T.bd}` }}>
          <Search size={12} style={{ color: T.t4 }} />
          <input 
            placeholder={searchPlaceholder} 
            value={searchValue}
            onChange={e => onSearchChange?.(e.target.value)}
            className="outline-none w-44" 
            style={{ fontSize: 12, color: T.t2, background: "transparent" }} 
          />
        </div>
        
        {filters.map((filter, i) => (
          <select 
            key={i}
            value={filter.value}
            onChange={e => filter.onChange?.(e.target.value)}
            style={{ fontSize: 11, fontWeight: 400, color: T.t3, background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 5, padding: "5px 8px", cursor: "pointer", outline: "none" }}
          >
            {filter.options.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        {children}
        
        {primaryAction && (
          <div className="relative">
            <Button 
              variant="primary" 
              icon={primaryAction.icon} 
              onClick={() => {
                if (primaryAction.dropdownMenu) setDropdownOpen(!dropdownOpen);
                else primaryAction.onClick?.();
              }}
            >
              {primaryAction.label}
              {primaryAction.dropdownMenu && <ChevronDown size={10} />}
            </Button>
            
            {primaryAction.dropdownMenu && dropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 rounded-md overflow-hidden z-20" style={{ background: T.card, border: `1px solid ${T.bd}`, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                {primaryAction.dropdownMenu.map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => { setDropdownOpen(false); item.onClick?.(); }}
                    className="w-full text-left px-3 py-2.5 transition-colors flex items-center gap-2"
                    style={{ 
                      fontSize: 12, 
                      color: item.highlight ? T.brand : T.t2, 
                      borderBottom: i < primaryAction.dropdownMenu.length - 1 ? `1px solid ${T.bdLight}` : 'none',
                      background: item.highlight ? "rgba(94,106,210,0.02)" : "transparent",
                      fontWeight: item.highlight ? 500 : 400
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = item.highlight ? T.accentLight : T.hover}
                    onMouseLeave={e => e.currentTarget.style.background = item.highlight ? "rgba(94,106,210,0.02)" : "transparent"}
                  >
                    {item.icon && <item.icon size={12} style={{ color: item.iconColor || T.t4 }} />}
                    {item.label}
                    {item.badge && <span className="ml-1">{item.badge}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
