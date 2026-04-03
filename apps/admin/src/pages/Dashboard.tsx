import { useEffect, useMemo, useState } from "react";

type PortfolioItem = {
  symbol: string;
  notional: number;
  pnl: number;
};

export default function Dashboard() {
  const [data, setData] = useState<any>({});
  const portfolio = (data.portfolio ?? []) as PortfolioItem[];

  useEffect(() => {
    fetch("/analytics/stats", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(setData)
      .catch(() => setData({}));
  }, []);

  const portfolioSummary = useMemo(() => {
    const exposure = portfolio.reduce((sum, item) => sum + (item.notional ?? 0), 0);
    const pnl = portfolio.reduce((sum, item) => sum + (item.pnl ?? 0), 0);
    return { exposure, pnl };
  }, [portfolio]);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white shadow">Automations: {data.automations ?? 0}</div>

        <div className="p-4 bg-white shadow">Usage: {data.usage ?? 0}</div>

        <div className="p-4 bg-white shadow">Portfolio Exposure: {portfolioSummary.exposure.toFixed(2)}</div>

        <div className="p-4 bg-white shadow">Portfolio PnL: {portfolioSummary.pnl.toFixed(2)}</div>
      </div>

      <div className="mt-6 bg-white shadow p-4">
        <h2 className="text-lg mb-3">Portfolio View</h2>
        <div className="space-y-2">
          {portfolio.length === 0 && <p className="text-sm text-gray-500">No positions yet.</p>}

          {portfolio.map((item) => (
            <div key={item.symbol} className="flex items-center justify-between border-b pb-2">
              <div className="font-medium">{item.symbol}</div>
              <div className="text-sm">Notional: {item.notional.toFixed(2)}</div>
              <div className={`text-sm ${item.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                PnL: {item.pnl.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
