import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    fetch("/analytics/stats", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(setData)
      .catch(() => setData({}));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white shadow">Automations: {data.automations ?? 0}</div>

        <div className="p-4 bg-white shadow">Usage: {data.usage ?? 0}</div>
      </div>
    </div>
  );
}
