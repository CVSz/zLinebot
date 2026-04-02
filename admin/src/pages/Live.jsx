import { useEffect, useMemo, useState } from "react";

const wsUrl = import.meta.env.VITE_EVENTS_WS_URL ?? "wss://zlinebot.zeabur.app/ws";

export default function Live() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setEvents((prev) => [payload, ...prev].slice(0, 100));
      } catch {
        // ignore malformed frames
      }
    };

    return () => ws.close();
  }, []);

  const statusClass = useMemo(() => (connected ? "badge success" : "badge failed"), [connected]);

  return (
    <div className="card">
      <h2 className="section-title">Live Events</h2>
      <div className="toolbar" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <span className={statusClass}>{connected ? "Connected" : "Disconnected"}</span>
        <small>{wsUrl}</small>
      </div>

      <div className="live-feed">
        {events.length === 0 && <div className="live-empty">No events yet.</div>}
        {events.map((evt, index) => (
          <div className="live-row" key={`${evt.id ?? evt.type ?? "evt"}-${index}`}>
            <strong>{evt.type ?? "unknown"}</strong>
            <code>{JSON.stringify(evt)}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
