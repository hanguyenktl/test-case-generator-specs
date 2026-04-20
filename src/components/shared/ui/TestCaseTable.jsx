import React from 'react';
import { Badge, PriBadge } from '../index';
import { FolderOpen } from 'lucide-react';
import { T } from '../../../utils/design-system';

/**
 * Unified TestCaseTable
 * 
 * Supports two modes:
 *   - Flat: pass `data` (array of rows)
 *   - Grouped: pass `groups` (array of { name, items, rightAction? })
 * 
 * Uses native <table> with auto layout for natural column sizing.
 */
export const TestCaseTable = ({ data, groups, columns, onRowClick, selectedId, renderRowActions, getRowStyle }) => {
  const totalCols = columns.length + (renderRowActions ? 1 : 0);
  const hasHeaders = columns.some(c => c.label);

  const Row = ({ row, rowIndex }) => {
    const isSelected = selectedId === row.id;
    const customStyle = getRowStyle ? getRowStyle(row) : {};
    return (
      <tr 
        className="group transition-colors cursor-pointer"
        onClick={() => onRowClick?.(row)}
        style={{ 
          background: isSelected ? T.accentLight : "transparent",
          ...customStyle
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.hover; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? T.accentLight : "transparent"; }}
      >
        {columns.map((col, i) => (
          <td 
            key={col.key || col.label || i} 
            className="align-middle"
            style={{ 
              padding: "10px 12px",
              paddingLeft: i === 0 ? 16 : 12,
              width: col.width,
              whiteSpace: col.noWrap ? "nowrap" : undefined,
              borderBottom: `1px solid ${T.bdLight}`,
            }}
          >
            {col.render ? col.render(row) : (
              <span style={{ fontSize: 12, color: T.t2 }}>{row[col.key]}</span>
            )}
          </td>
        ))}
        {renderRowActions && (
          <td className="align-middle text-right" style={{ padding: "10px 12px", width: 56, borderBottom: `1px solid ${T.bdLight}` }}>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-0.5">
              {renderRowActions(row)}
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto w-full" style={{ background: T.card }}>
      <table className="w-full border-collapse" style={{ tableLayout: "auto" }}>
        {hasHeaders && (
          <thead className="sticky top-0 z-10" style={{ background: T.bg }}>
            <tr>
              {columns.map((col, i) => (
                <th 
                  key={col.key || col.label || i} 
                  className="align-middle text-left font-semibold"
                  style={{ 
                    padding: "7px 12px",
                    paddingLeft: i === 0 ? 16 : 12,
                    width: col.width,
                    fontSize: 10, 
                    fontWeight: 600, 
                    color: T.t4, 
                    textTransform: "uppercase", 
                    letterSpacing: "0.04em",
                    borderBottom: `1px solid ${T.bd}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </th>
              ))}
              {renderRowActions && (
                <th className="align-middle" style={{ padding: "7px 12px", width: 56, borderBottom: `1px solid ${T.bd}` }} />
              )}
            </tr>
          </thead>
        )}

        {groups ? (
          groups.map((group, gi) => (
            <tbody key={group.name || gi}>
              <tr>
                <td 
                  colSpan={totalCols} 
                  style={{ 
                    padding: "6px 16px", 
                    background: T.bg,
                    borderBottom: `1px solid ${T.bdLight}`,
                    borderTop: gi > 0 ? `1px solid ${T.bd}` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={11} style={{ color: T.brand }} strokeWidth={1.5} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.t2 }}>{group.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 500, color: T.t4, background: T.muted, padding: "1px 6px", borderRadius: 3 }}>
                        {group.count || group.items?.length || 0}
                      </span>
                    </div>
                    {group.rightAction && group.rightAction()}
                  </div>
                </td>
              </tr>
              {group.items?.map((row, ri) => (
                <Row key={row.id || ri} row={row} rowIndex={ri} />
              ))}
            </tbody>
          ))
        ) : (
          <tbody>
            {data?.map((row, ri) => (
              <Row key={row.id || ri} row={row} rowIndex={ri} />
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════
   Column Renderers — TestOps design system compliant
   fontSize 11-12 range, muted metadata, clean badges
   ═══════════════════════════════════════════════════════ */
export const TCTableRenderers = {
  // Monospace ID — muted, not the focus
  id: (row) => (
    <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: T.t3, whiteSpace: "nowrap" }}>
      {row.id}
    </span>
  ),

  // Name with optional tags below — this is the primary column
  nameWithTags: (row) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: T.t1, lineHeight: 1.4 }}>{row.name}</div>
      {(row.chain || (row.tags && row.tags.length > 0)) && (
        <div className="flex items-center flex-wrap gap-1" style={{ marginTop: 3 }}>
          {row.chain && (
            <span style={{ fontSize: 10, color: T.t4 }}>Chain: {row.chain}</span>
          )}
          {row.tags?.map(tag => (
            <span key={tag} style={{ 
              fontSize: 9, fontWeight: 500, color: T.t4, 
              background: T.muted, padding: "1px 5px", borderRadius: 3,
              border: `1px solid ${T.bdLight}` 
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  ),

  // Type badge
  typeBadge: (row) => (
    <Badge color={row.type === "MANUAL" ? T.purple : T.brand}
      bg={row.type === "MANUAL" ? "rgba(124,58,237,0.06)" : T.accentLight}
      border={row.type === "MANUAL" ? "rgba(124,58,237,0.12)" : T.accentBorder}>
      {row.type === "MANUAL" ? "Manual" : "Auto"}
    </Badge>
  ),

  // Status with dot
  statusDot: (row) => (
    <div className="flex items-center gap-1.5" style={{ whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: row.status === "Published" ? T.green : T.t4, display: "inline-block" }} />
      <span style={{ fontSize: 11, color: T.t3 }}>{row.status}</span>
    </div>
  ),

  // Priority
  priority: (row) => <PriBadge level={row.priority} />,

  // Last run result
  lastRun: (row) => {
    const color = row.lastRun === "Passed" ? T.green : row.lastRun === "Failed" ? T.red : T.t4;
    return (
      <div className="flex items-center gap-1" style={{ whiteSpace: "nowrap" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: color, display: "inline-block" }} />
        <span style={{ fontSize: 10, color }}>{row.lastRun || '—'}</span>
      </div>
    );
  },

  // Generic small text
  textSmall: (val) => <span style={{ fontSize: 11, color: T.t4, whiteSpace: "nowrap" }}>{val}</span>,
};
