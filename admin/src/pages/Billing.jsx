import { useEffect, useMemo, useState } from "react";

export default function Billing() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/admin/billing", {
      headers: {
        "x-api-key": "demo",
        "x-tenant-id": "demo"
      }
    })
      .then((response) => response.json())
      .then(setData);
  }, []);

  const totalAmount = useMemo(() => data.reduce((sum, item) => sum + Number(item.amount || 0), 0), [data]);

  return (
    <section>
      <h2 className="section-title">Billing & Invoices</h2>
      <div className="card" style={{ marginBottom: 12 }}>
        Total invoice amount: <strong>{totalAmount.toLocaleString()} THB</strong>
      </div>
      <table>
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{Number(item.amount || 0).toLocaleString()} THB</td>
              <td>
                <span className={`badge ${item.status === "paid" ? "success" : "pending"}`}>{item.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
