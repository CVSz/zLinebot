import { useState } from "react";

export default function Automations() {
  const [steps, setSteps] = useState([]);
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
    <div style={{ padding: 16 }}>
      <h2>Automation Builder</h2>

      {steps.map((step, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <input
            placeholder="Reply message"
            value={step.message}
            onChange={e => {
              const newSteps = [...steps];
              newSteps[i].message = e.target.value;
              setSteps(newSteps);
            }}
          />
        </div>
      ))}

      <button type="button" onClick={addAction}>
        Add Action
      </button>

      <button type="button" onClick={saveAutomation} style={{ marginLeft: 8 }}>
        Save
      </button>
      <span style={{ marginLeft: 8 }}>{status}</span>
    </div>
  );
}
