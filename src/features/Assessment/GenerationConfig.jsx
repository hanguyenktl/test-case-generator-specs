import React, { useState } from 'react';
import { Settings2, ChevronDown, ChevronUp, FileUp, X } from 'lucide-react';
import { TO } from '../../utils/theme';

export const GenerationConfig = ({
  additionalContext = '', onContextChange,
  documents = [], onUpload, onRemoveDoc,
}) => {
  const [expanded, setExpanded] = useState(false);

  const hasContent = additionalContext.length > 0 || documents.length > 0;

  return (
    <div className="px-3 pb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-1.5 py-1.5 text-[10px] font-medium text-slate-500 hover:text-violet-600 transition-colors rounded"
      >
        <Settings2 size={11} />
        <span>Generation Options</span>
        {hasContent && !expanded && (
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
        )}
        <span className="ml-auto">
          {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </span>
      </button>

      {expanded && (
        <div className="space-y-2 pb-1 animate-in slide-in-from-top-1">
          <textarea
            value={additionalContext}
            onChange={(e) => onContextChange(e.target.value)}
            placeholder="Add context for the AI: related features, design docs, constraints..."
            className="w-full text-[11px] rounded-lg border p-2 focus:outline-none focus:ring-1 focus:ring-violet-200 transition-all resize-none min-h-[48px]"
            style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: TO.textBody }}
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            {documents.map(d => (
              <div key={d.id} className="flex items-center gap-1 px-2 py-0.5 text-[9px] bg-violet-50 rounded text-violet-700 font-medium border border-violet-100">
                <span className="truncate max-w-[80px]">{d.name}</span>
                <button onClick={() => onRemoveDoc(d.id)} className="text-violet-400 hover:text-red-500"><X size={8} /></button>
              </div>
            ))}
            <label className="px-2 py-0.5 text-[9px] border border-dashed rounded text-slate-400 hover:text-violet-600 hover:border-violet-300 cursor-pointer transition-all font-medium"
              style={{ borderColor: '#D1D5DB' }}>
              <FileUp size={9} className="inline mr-0.5" />Upload
              <input type="file" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload({ id: Date.now(), name: f.name, type: f.type });
              }} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
