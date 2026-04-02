import { useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Trigger: TikTok Message" },
    position: { x: 120, y: 100 }
  },
  {
    id: "2",
    type: "action",
    data: { label: "Action: AI Reply", action: "ai_reply" },
    position: { x: 380, y: 100 }
  }
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export default function Builder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  async function saveFlow() {
    const flow = { nodes, edges };

    await fetch("/automation", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trigger: "tiktok.message",
        config: flow
      })
    });
  }

  return (
    <div className="builder-wrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <button type="button" onClick={saveFlow} className="builder-save-btn">
        Save
      </button>
    </div>
  );
}
