import { useEffect, useState } from "react";

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

  return (
    <div>
      <h2>Invoices</h2>
      {data.map((item) => (
        <div key={item.id}>
          {item.amount} THB - {item.status}
        </div>
      ))}
    </div>
  );
}
