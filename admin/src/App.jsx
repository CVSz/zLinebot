import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";

export default function App() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <Dashboard />
      <hr />
      <Billing />
    </div>
  );
}
