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
    position: { x: 100, y: 100 }
  }
];

export default function Builder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  function onConnect(params: any) {
    setEdges(eds => addEdge(params, eds));
  }

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
    <div className="h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background />
        <Controls />
      </ReactFlow>

      <button onClick={saveFlow} className="absolute top-4 right-4 bg-green-500 text-white p-2">
        Save
      </button>
    </div>
  );
}
