import { useEffect, useState } from "react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ messages: 0, orders: 0, payments: 0 });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "metrics") {
        setMetrics(data.data);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      <h2>Realtime</h2>
      <div>Messages: {metrics.messages}</div>
      <div>Orders: {metrics.orders}</div>
      <div>Payments: {metrics.payments}</div>
    </div>
  );
}
