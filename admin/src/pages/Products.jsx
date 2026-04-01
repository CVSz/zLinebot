import { useMemo, useState } from "react";

const inventory = [
  { id: "P-101", title: "Smart Lamp", stock: 37, price: 990 },
  { id: "P-102", title: "Desk Fan", stock: 14, price: 590 },
  { id: "P-103", title: "Wireless Earbuds", stock: 8, price: 1590 },
  { id: "P-104", title: "Mini Camera", stock: 5, price: 1890 }
];

export default function Products() {
  const [sortBy, setSortBy] = useState("stock");

  const rows = useMemo(() => {
    const copy = [...inventory];
    copy.sort((a, b) => b[sortBy] - a[sortBy]);
    return copy;
  }, [sortBy]);

  return (
    <section>
      <h2 className="section-title">Product Catalog</h2>
      <div className="toolbar">
        <label>
          Sort by:&nbsp;
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="stock">Stock</option>
            <option value="price">Price</option>
          </select>
        </label>
        <button type="button" className="secondary">
          Add Product
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Stock</th>
            <th>Price (THB)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.title}</td>
              <td>{item.stock}</td>
              <td>{item.price.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
