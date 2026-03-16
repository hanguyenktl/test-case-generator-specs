import React, { useState, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { TO } from '../../utils/theme';
import { mockRequirement } from '../../data/mockData';

export const KaiPanel = ({ isOpen, onClose, initialPrompt }) => {
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState('');
  
  useEffect(() => { 
    if (isOpen) {
      setMsgs([{ 
        role: 'assistant', 
        content: initialPrompt ? `I see: "${initialPrompt}". Let me analyze ${mockRequirement.id}.` : `Hi! Context loaded for ${mockRequirement.id}.`, 
        suggestions: ['Coverage strategy', 'Edge case review', 'Compare with similar'] 
      }]); 
    }
  }, [isOpen, initialPrompt]);
  
  const send = () => { 
    if (!inp.trim()) return; 
    setMsgs(p => [...p, { role: 'user', content: inp }]); 
    setInp(''); 
    setTimeout(() => setMsgs(p => [...p, { role: 'assistant', content: `Analyzing...`, suggestions: [] }]), 800); 
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed right-0 top-0 bottom-0 w-[340px] bg-white border-l shadow-2xl z-50 flex flex-col" style={{ borderColor: TO.cardBd }}>
      <div className="px-4 py-3" style={{ backgroundColor: TO.aiAccent }}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center"><Bot size={16} /></div>
            <div><h2 className="font-semibold text-sm">Kai</h2><p className="text-[10px] text-white/70">{mockRequirement.id}</p></div>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded"><X size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">{msgs.map((m, i) => (
        <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
          {m.role === 'assistant' && <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"><Bot size={12} style={{ color: TO.aiAccent }} /></div>}
          <div className="max-w-[230px] p-2.5 rounded-xl text-sm" style={{ backgroundColor: m.role === 'user' ? TO.aiAccent : '#F3F4F6', color: m.role === 'user' ? 'white' : TO.textBody }}>
            {m.content}
            {m.suggestions?.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{m.suggestions.map((s, j) => <button key={j} onClick={() => setInp(s)} className="px-1.5 py-0.5 text-[10px] rounded border bg-white" style={{ color: TO.aiAccent, borderColor: '#DDD6FE' }}>{s}</button>)}</div>}
          </div>
        </div>
      ))}</div>
      <div className="p-3 border-t" style={{ borderColor: TO.cardBd, backgroundColor: '#FAFAFA' }}>
        <div className="flex gap-1.5 p-1.5 border rounded-lg bg-white" style={{ borderColor: TO.cardBd }}>
          <input type="text" value={inp} onChange={(e) => setInp(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask Kai..." className="flex-1 text-sm bg-transparent focus:outline-none" />
          <button onClick={send} disabled={!inp.trim()} className="p-1.5 rounded-lg text-white" style={{ backgroundColor: inp.trim() ? TO.aiAccent : TO.textMuted }}><Send size={14} /></button>
        </div>
      </div>
    </div>
  );
};
