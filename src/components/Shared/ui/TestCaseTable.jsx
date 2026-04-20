import React from 'react';
import { Badge, PriBadge } from '../index';
import { T } from '../../../utils/design-system';

export const TestCaseTable = ({ data, columns, onRowClick, selectedId, renderRowActions, getRowStyle }) => {
  return (
    <div className="flex-1 overflow-y-auto w-full">
      <table className="w-full" style={{ background: T.card }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${T.bd}`, position: "sticky", top: 0, background: T.card, zIndex: 1 }}>
            {columns.map((col, i) => (
              <th 
                key={col.key || i} 
                className={`text-left py-2.5 ${i === 0 ? 'pl-4 pr-3' : 'px-3'}`} 
                style={{ fontSize: 9, fontWeight: 600, color: T.t4, textTransform: "uppercase", letterSpacing: 0.5, width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {renderRowActions && <th className="py-2.5 px-3" style={{ width: 40 }}></th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const isSelected = selectedId === row.id;
            const customStyle = getRowStyle ? getRowStyle(row) : {};
            
            return (
              <tr 
                key={row.id || rowIndex} 
                className="transition-colors cursor-pointer group"
                onClick={() => onRowClick?.(row)}
                style={{ 
                  borderBottom: `1px solid ${T.bdLight}`, 
                  background: isSelected ? T.accentLight : "transparent",
                  ...customStyle
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.hover; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                {columns.map((col, i) => (
                  <td key={col.key || i} className={`py-2.5 ${i === 0 ? 'pl-4 pr-3' : 'px-3'}`}>
                    {col.render ? col.render(row) : (
                      <span style={{ fontSize: 12, color: T.t1 }}>{row[col.key]}</span>
                    )}
                  </td>
                ))}
                {renderRowActions && (
                  <td className="py-2.5 px-3 text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {renderRowActions(row)}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Preset renderers for common test case columns to reuse across prototypes
export const TCTableRenderers = {
  id: (row) => <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.brand, fontWeight: 500 }}>{row.id}</span>,
  nameWithTags: (row) => (
    <div>
      <div style={{ fontSize: 12, color: T.t1, marginBottom: row.tags?.length ? 2 : 0 }}>{row.name}</div>
      {row.tags && row.tags.length > 0 && (
        <div className="flex items-center gap-1">
          {row.tags.map(tag => (
            <span key={tag} className="px-1.5 py-px rounded" style={{ fontSize: 8, fontWeight: 500, color: T.t4, background: T.muted, border: `1px solid ${T.bdLight}` }}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  ),
  typeBadge: (row) => (
    <Badge color={row.type === "MANUAL" ? T.purple : T.brand}
      bg={row.type === "MANUAL" ? "rgba(124,58,237,0.06)" : T.accentLight}
      border={row.type === "MANUAL" ? "rgba(124,58,237,0.12)" : T.accentBorder}>
      {row.type === "MANUAL" ? "Manual" : "Auto"}
    </Badge>
  ),
  statusDot: (row) => (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: row.status === "Published" ? T.green : T.t4 }} />
      <span style={{ fontSize: 11, color: T.t3 }}>{row.status}</span>
    </div>
  ),
  priority: (row) => <PriBadge level={row.priority} />,
  lastRun: (row) => (
    <div className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: row.lastRun === "Passed" ? T.green : row.lastRun === "Failed" ? T.red : T.t4 }} />
      <span style={{ fontSize: 10, color: row.lastRun === "Passed" ? T.green : row.lastRun === "Failed" ? T.red : T.t4 }}>{row.lastRun || '-'}</span>
    </div>
  ),
  textSmall: (val) => <span style={{ fontSize: 10, color: T.t3 }}>{val}</span>
};
