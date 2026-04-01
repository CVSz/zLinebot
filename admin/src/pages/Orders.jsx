import { useMemo, useState } from "react";

const demoOrders = [
  { id: "ORD-1001", customer: "Nina", total: 1250, status: "success" },
  { id: "ORD-1002", customer: "Peak", total: 820, status: "pending" },
  { id: "ORD-1003", customer: "Mali", total: 2410, status: "success" },
  { id: "ORD-1004", customer: "Korn", total: 930, status: "failed" }
];

export default function Orders() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () =>
      demoOrders.filter(
        (order) =>
          (status === "all" || order.status === status) &&
          `${order.id} ${order.customer}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, status]
  );

  return (
    <section>
      <h2 className="section-title">Order Management</h2>
      <div className="toolbar">
        <input placeholder="Search order/customer" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total (THB)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.total.toLocaleString()}</td>
              <td>
                <span className={`badge ${order.status}`}>{order.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
