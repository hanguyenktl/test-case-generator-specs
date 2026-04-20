import React from 'react';
import { Layout as LayoutIcon, Wand2, ArrowRight } from 'lucide-react';
import { T } from '../utils/design-system';
import { Link } from 'react-router-dom';

const prototypes = [
  {
    id: 'manual-test-authoring',
    name: 'Manual Test Authoring',
    description: 'Legacy manual test authoring prototype with AI quality scoring and AI Runner confidence.',
    icon: LayoutIcon,
    status: 'Legacy',
    path: '/prototypes/manual-test-authoring',
    color: T.t3
  },
  {
    id: 'ai-test-case-generation',
    name: 'AI Test Case Generation',
    description: 'AI-powered manual to automated test case generation with dual-scoring verification.',
    icon: Wand2,
    status: 'Active',
    path: '/prototypes/ai-test-case-generation',
    color: T.brand
  },
];

export default function Directory() {
  return (
    <div className="p-10 max-w-6xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: T.t1 }}>Prototype Hub</h1>
        <p className="text-lg" style={{ color: T.t3 }}>
          Central collection of TestOps & True interactive prototypes for experimentation and feedback.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prototypes.map((p) => (
          <Link 
            key={p.id}
            to={p.path}
            className="group flex flex-col p-6 rounded-xl border bg-white transition-all hover:shadow-lg hover:border-indigo-200"
            style={{ borderColor: T.border }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${p.color}15`, color: p.color }}
            >
              <p.icon size={24} />
            </div>
            
            <h3 className="text-lg font-semibold mb-2" style={{ color: T.t1 }}>{p.name}</h3>
            <p className="text-[13px] leading-relaxed mb-6 flex-1" style={{ color: T.t3 }}>
              {p.description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: T.border }}>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                {p.status}
              </span>
              <div className="flex items-center gap-1 text-[13px] font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Open</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}

        {/* Placeholder for new trial */}
        <div className="flex flex-col p-6 rounded-xl border border-dashed flex-center items-center justify-center min-h-[200px]" style={{ borderColor: T.border }}>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <LayoutIcon size={20} className="text-gray-400" />
            </div>
            <p className="text-[13px] font-medium text-gray-400">Waiting for next monolith...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
