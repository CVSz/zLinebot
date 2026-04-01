import { useEffect, useState } from "react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ messages: 0, orders: 0, payments: 0 });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "metrics") setMetrics(data.data);
    };

    return () => ws.close();
  }, []);

  return (
    <section>
      <h2 className="section-title">Realtime Overview</h2>
      <div className="grid-3">
        <div className="card">
          <div>Messages</div>
          <div className="metric">{metrics.messages.toLocaleString()}</div>
        </div>
        <div className="card">
          <div>Orders</div>
          <div className="metric">{metrics.orders.toLocaleString()}</div>
        </div>
        <div className="card">
          <div>Payments</div>
          <div className="metric">{metrics.payments.toLocaleString()}</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        WebSocket status: <span className={`badge ${connected ? "success" : "pending"}`}>{connected ? "connected" : "connecting"}</span>
      </div>
    </section>
  );
}
