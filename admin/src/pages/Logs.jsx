import { useEffect, useState } from "react";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/logs", { credentials: "include" })
      .then((res) => res.json())
      .then(setLogs);
  }, []);

  return (
    <div className="card">
      <h1 className="section-title">Logs</h1>
      {logs.map((log) => (
        <div key={log.id} className="log-row">
          {log.message}
        </div>
      ))}
    </div>
  );
}
