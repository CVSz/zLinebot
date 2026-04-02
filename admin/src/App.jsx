import { useMemo, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import TikTokShopPanel from "./pages/TikTokShopPanel";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Builder from "./pages/Builder";
import Automations from "./pages/Automations";
import Logs from "./pages/Logs";

const pages = {
  dashboard: { label: "Dashboard", component: Dashboard },
  orders: { label: "Orders", component: Orders },
  products: { label: "Products", component: Products },
  billing: { label: "Billing", component: Billing },
  tiktok: { label: "TikTok Shop", component: TikTokShopPanel },
  builder: { label: "Builder", component: Builder },
  automations: { label: "Automations", component: Automations },
  logs: { label: "Logs", component: Logs }
};

export default function App() {
  const [active, setActive] = useState("dashboard");
  const ActiveComponent = useMemo(() => pages[active].component, [active]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">zLinebot Admin</div>
        {Object.entries(pages).map(([key, page]) => (
          <button
            key={key}
            type="button"
            className={`nav-btn ${active === key ? "active" : ""}`}
            onClick={() => setActive(key)}
          >
            {page.label}
          </button>
        ))}
      </aside>
      <main className="content">
        <div className="topbar">
          <strong>{pages[active].label}</strong>
          <span>Tenant: demo • API key: demo</span>
        </div>
        <ActiveComponent />
      </main>
    </div>
  );
}
