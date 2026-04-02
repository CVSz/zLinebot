import { useState } from "react";

export default function Automations() {
  const [steps, setSteps] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  function addAction() {
    setSteps([...steps, { type: "action", action: "auto_reply", message: "" }]);
  }

  async function saveAutomation() {
    setStatus("Saving...");
    try {
      const res = await fetch("/automation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger: "tiktok.message",
          config: { steps }
        })
      });
      setStatus(res.ok ? "Saved" : "Save failed");
    } catch (_err) {
      setStatus("Save failed");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Automation Builder</h1>

      {steps.map((step, i) => (
        <div key={i} className="mb-2">
          <input
            placeholder="Reply message"
            onChange={e => {
              const newSteps = [...steps];
              newSteps[i].message = e.target.value;
              setSteps(newSteps);
            }}
            className="border p-2"
          />
        </div>
      ))}

      <button onClick={addAction} className="bg-blue-500 text-white p-2">
        Add Action
      </button>

      <button onClick={saveAutomation} className="bg-green-500 text-white p-2 ml-2">
        Save
      </button>
      <span className="ml-2">{status}</span>
    </div>
  );
}
