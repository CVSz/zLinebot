import { useEffect, useState } from "react";

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/logs", { credentials: "include" })
      .then(res => res.json())
      .then(setLogs);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Logs</h1>

      {logs.map(log => (
        <div key={log.id} className="border-b py-2">
          {log.message}
        </div>
      ))}
    </div>
  );
}
