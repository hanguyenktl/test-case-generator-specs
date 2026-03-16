import React, { useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { FileText, ShieldCheck, PlayCircle, AlertCircle, Zap, Link as LinkIcon, BookOpen, Sparkles } from 'lucide-react';
import { citableSegments, existingLinkedTests, mockCoreTests, mockRequirement } from '../../data/mockData';
import { TO, CITATION_COLORS } from '../../utils/theme';

// Custom Node for Requirement
const RequirementNode = ({ data }) => (
  <div className="bg-white border rounded shadow-md w-64">
    <div className="bg-indigo-50 border-b px-3 py-2 flex items-center gap-2 rounded-t">
      <FileText size={14} className="text-indigo-600" />
      <span className="font-semibold text-xs text-indigo-900">{data.id}</span>
    </div>
    <div className="p-3 text-xs text-slate-700 leading-relaxed font-serif line-clamp-4">
      {data.label}
    </div>
    <Handle type="source" position={Position.Right} id="a" className="w-2 h-2 bg-indigo-400" />
  </div>
);

// Custom Node for Extracted Behavior
const BehaviorNode = ({ data }) => {
  const c = CITATION_COLORS[data.type] || { bg: '#F3F4F6', border: '#D1D5DB', text: '#374151' };
  return (
    <div className="bg-white border rounded shadow-sm w-48 relative" style={{ borderColor: c.border }}>
      <Handle type="target" position={Position.Left} id="target" className="w-2 h-2" style={{ backgroundColor: c.border }} />
      <div className="px-3 py-2 text-xs font-medium border-b flex items-center gap-1.5" style={{ backgroundColor: c.bg, color: c.text }}>
        {data.badgeName}
      </div>
      <div className="p-2 text-[10px] text-slate-600 leading-relaxed line-clamp-3">
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} id="source" className="w-2 h-2" style={{ backgroundColor: c.border }} />
    </div>
  );
};

// Custom Node for Test Case
const TestCaseNode = ({ data }) => {
  const isAi = data.isAi;
  return (
    <div className={`bg-white border ${isAi ? 'border-purple-300 shadow-purple-100' : 'border-slate-300'} shadow-sm rounded flex items-center w-56 relative`}>
      <Handle type="target" position={Position.Left} id="target" className={`w-2 h-2 ${isAi ? 'bg-purple-400' : 'bg-slate-400'}`} />
      <div className={`px-2 py-2 border-r flex items-center justify-center ${isAi ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-500'}`}>
        {isAi ? <Sparkles size={14} /> : <BookOpen size={14} />}
      </div>
      <div className="px-3 py-2 flex-1 min-w-0">
         <div className="flex items-center gap-1.5 mb-0.5">
           <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1 rounded">{data.id}</span>
           <span className="text-[9px] uppercase text-slate-400">{data.type}</span>
         </div>
         <p className="text-[10px] font-semibold text-slate-800 line-clamp-2 leading-tight">{data.label}</p>
      </div>
    </div>
  );
};

const nodeTypes = {
  requirement: RequirementNode,
  behavior: BehaviorNode,
  testcase: TestCaseNode,
};

// Helper mapping formatting Segment Type to Badge title
const formatBadge = (type) => {
  switch (type) {
    case 'requirement': return 'Requirement';
    case 'acceptance': return 'Acceptance';
    case 'happy_path': return 'Happy Path';
    case 'constraint': return 'Constraint';
    case 'edge_case': return 'Edge Case';
    case 'error_handling': return 'Error Handling';
    default: return 'Detail';
  }
};

export const TraceMapCanvas = () => {
  // Compute Nodes and Edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    
    // 1. Root Node (Requirement)
    nodes.push({
      id: 'req-root',
      type: 'requirement',
      position: { x: 50, y: 300 },
      data: { id: mockRequirement.id, label: mockRequirement.title }
    });

    // 2. Extracted Behavior Nodes (We only render ones that are actually cited by the tests to keep layout clean)
    const citedSegments = new Set();
    const testCases = [...existingLinkedTests.map(t => ({...t, isAi: false})), ...mockCoreTests.map(t => ({...t, isAi: true}))];
    
    testCases.forEach(tc => {
      // For mock purposes, assume existing tests also cite some things randomly, or just AI tests.
      // Since existingLinkedTests don't have citations in mockData yet, we will just map AI tests.
      if (tc.citations) {
        tc.citations.forEach(c => citedSegments.add(c));
      }
    });

    const behaviors = citableSegments.filter(s => citedSegments.has(s.id));
    
    behaviors.forEach((beh, idx) => {
      const yPos = 50 + (idx * 110);
      nodes.push({
        id: `beh-${beh.id}`,
        type: 'behavior',
        position: { x: 400, y: yPos },
        data: { id: beh.id, type: beh.type, label: beh.text, badgeName: formatBadge(beh.type) }
      });

      edges.push({
        id: `edge-req-${beh.id}`,
        source: 'req-root',
        target: `beh-${beh.id}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#CBD5E1', strokeWidth: 1.5 },
      });
    });

    // 3. Test Case Nodes
    testCases.forEach((tc, idx) => {
      const yPos = 100 + (idx * 85);
      nodes.push({
        id: `tc-${tc.id}`,
        type: 'testcase',
        position: { x: 750, y: yPos },
        data: { id: tc.id, label: tc.name, type: tc.type, isAi: tc.isAi }
      });

      if (tc.citations) {
        tc.citations.forEach((citId) => {
           edges.push({
             id: `edge-tc-${tc.id}-${citId}`,
             source: `beh-${citId}`,
             target: `tc-${tc.id}`,
             type: 'default',
             markerEnd: { type: MarkerType.ArrowClosed, color: tc.isAi ? '#C4B5FD' : '#94A3B8' },
             style: { stroke: tc.isAi ? '#C4B5FD' : '#94A3B8', strokeWidth: 1.5, opacity: 0.6 },
           });
        });
      } else {
        // If an existing test has no citations in mock, link it to root directly to show it's unmapped
        edges.push({
           id: `edge-req-tc-${tc.id}`,
           source: 'req-root',
           target: `tc-${tc.id}`,
           type: 'smoothstep',
           style: { stroke: '#94A3B8', strokeWidth: 1.5, strokeDasharray: '5,5', opacity: 0.4 },
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, []);

  return (
    <div className="h-full w-full bg-[#FAFAFA] rounded-md border" style={{ borderColor: TO.cardBd }}>
      <ReactFlow 
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
      >
        <Background gap={16} color="#E2E8F0" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
