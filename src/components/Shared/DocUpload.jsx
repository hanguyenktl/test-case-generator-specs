import React, { useState, useRef } from 'react';
import { Upload, ChevronUp, ChevronDown, File, Loader2, CheckCircle2, X } from 'lucide-react';
import { TO } from '../../utils/theme';

export const DocUpload = ({ documents, onUpload, onRemove }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  const handle = (e) => { 
    Array.from(e.target.files || []).forEach(f => { 
      const d = { id: Date.now() + Math.random(), name: f.name, status: 'processing' }; 
      onUpload(d); 
      setTimeout(() => onUpload({ ...d, status: 'done' }), 1500); 
    }); 
  };

  return (
    <div className="border rounded-lg" style={{ borderColor: TO.cardBd }}>
      <input ref={ref} type="file" multiple onChange={handle} className="hidden" accept=".pdf,.doc,.docx,.txt,.md" />
      <button onClick={() => setOpen(!open)} className="w-full px-3 py-2 flex items-center justify-between text-xs hover:bg-gray-50 rounded-lg">
        <span className="flex items-center gap-2" style={{ color: TO.textSecondary }}>
          <Upload size={12} />Add documents
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100" style={{ color: TO.textMuted }}>Optional</span>
          {documents.length > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>{documents.length}</span>}
        </span>
        {open ? <ChevronUp size={13} style={{ color: TO.textMuted }} /> : <ChevronDown size={13} style={{ color: TO.textMuted }} />}
      </button>
      {open && (
        <div className="px-3 pb-2.5 space-y-1.5">
          {documents.map(d => (
            <div key={d.id} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded border text-xs" style={{ borderColor: TO.cardBd }}>
              <File size={12} className="text-red-500" /><span className="flex-1 truncate" style={{ color: TO.textBody }}>{d.name}</span>
              {d.status === 'processing' ? <Loader2 size={12} className="animate-spin" style={{ color: TO.primary }} /> : <CheckCircle2 size={12} style={{ color: TO.passed }} />}
              <button onClick={() => onRemove(d.id)} className="p-0.5 hover:bg-gray-200 rounded"><X size={10} style={{ color: TO.textMuted }} /></button>
            </div>
          ))}
          <button onClick={() => ref.current?.click()} className="w-full py-2 border-2 border-dashed rounded-lg text-xs flex items-center justify-center gap-1.5 hover:border-indigo-400 hover:text-indigo-600 transition-colors" style={{ borderColor: '#D1D5DB', color: TO.textSecondary }}>
            <Upload size={12} />Upload PDF, Word, TXT, Markdown
          </button>
        </div>
      )}
    </div>
  );
};
