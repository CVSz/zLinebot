import { useEffect, useState } from "react";

const fallbackPortfolio = [
  { symbol: "LINE_COMMERCE", allocation: 32, value: 128400, pnl: 6420, risk: "medium" },
  { symbol: "TIKTOK_SHOP", allocation: 24, value: 96200, pnl: 3180, risk: "low" },
  { symbol: "CRM_AUTOMATION", allocation: 28, value: 111900, pnl: -1260, risk: "medium" },
  { symbol: "LOYALTY_TOKEN", allocation: 16, value: 64200, pnl: 4570, risk: "high" }
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ messages: 0, orders: 0, payments: 0 });
  const [portfolio, setPortfolio] = useState(fallbackPortfolio);
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

  useEffect(() => {
    fetch("/analytics/stats", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : {}))
      .then((payload) => {
        if (Array.isArray(payload?.portfolio) && payload.portfolio.length > 0) {
          setPortfolio(
            payload.portfolio.map((item) => ({
              symbol: item.symbol ?? "UNKNOWN",
              allocation: Number(item.allocation ?? 0),
              value: Number(item.value ?? item.notional ?? 0),
              pnl: Number(item.pnl ?? 0),
              risk: item.risk ?? "medium"
            }))
          );
        }
      })
      .catch(() => undefined);
  }, []);

  const portfolioValue = portfolio.reduce((sum, row) => sum + row.value, 0);
  const portfolioPnl = portfolio.reduce((sum, row) => sum + row.pnl, 0);
  const topHolding = portfolio.reduce(
    (max, row) => (row.allocation > max.allocation ? row : max),
    portfolio[0] ?? { symbol: "-", allocation: 0 }
  );

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

      <h3 className="section-title" style={{ marginTop: 18 }}>CRM Portfolio View</h3>
      <div className="grid-3">
        <div className="card">
          <div>Total Portfolio Value</div>
          <div className="metric">${portfolioValue.toLocaleString()}</div>
        </div>
        <div className="card">
          <div>Portfolio PnL</div>
          <div className={`metric ${portfolioPnl >= 0 ? "positive" : "negative"}`}>
            {portfolioPnl >= 0 ? "+" : ""}${portfolioPnl.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div>Top Allocation</div>
          <div className="metric">{topHolding.symbol}</div>
          <small>{topHolding.allocation}% of portfolio</small>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Segment</th>
              <th>Allocation</th>
              <th>Value</th>
              <th>PnL</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((position) => (
              <tr key={position.symbol}>
                <td>{position.symbol}</td>
                <td>{position.allocation}%</td>
                <td>${position.value.toLocaleString()}</td>
                <td className={position.pnl >= 0 ? "positive" : "negative"}>
                  {position.pnl >= 0 ? "+" : ""}${position.pnl.toLocaleString()}
                </td>
                <td>
                  <span className={`badge ${position.risk === "low" ? "success" : position.risk === "high" ? "failed" : "pending"}`}>
                    {position.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
