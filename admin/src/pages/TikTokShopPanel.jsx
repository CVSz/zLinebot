import { useEffect, useMemo, useState } from "react";

const apiHeaders = {
  "x-api-key": "demo",
  "x-tenant-id": "demo",
  "Content-Type": "application/json"
};

export default function TikTokShopPanel() {
  const [overview, setOverview] = useState({
    showcaseProducts: [],
    jobs: [],
    showcaseCount: 0,
    userProfiles: [],
    userProfilesCount: 0
  });
  const [insight, setInsight] = useState("");
  const [tone, setTone] = useState("energetic");
  const [durationSec, setDurationSec] = useState(25);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCount = useMemo(() => selectedProductIds.length, [selectedProductIds]);
  const filteredProducts = useMemo(
    () => overview.showcaseProducts.filter((product) => product.title.toLowerCase().includes(search.toLowerCase())),
    [overview.showcaseProducts, search]
  );

  async function loadOverview() {
    const response = await fetch("/api/admin/tiktok-shop/overview", { headers: apiHeaders });
    const payload = await response.json();
    setOverview(payload);
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  async function syncShowcase() {
    setLoading(true);
    try {
      await fetch("/api/admin/tiktok-shop/sync-showcase", {
        method: "POST",
        headers: apiHeaders
      });
      await loadOverview();
    } finally {
      setLoading(false);
    }
  }

  async function loadIntelligence() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tiktok-shop/intelligence", { headers: apiHeaders });
      const payload = await response.json();
      setInsight(payload.aiSummary || "");
    } finally {
      setLoading(false);
    }
  }

  async function downloadExcel() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tiktok-shop/export", { headers: apiHeaders });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "tiktok_shop_report.csv";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  async function generateVideos() {
    setLoading(true);
    try {
      await fetch("/api/admin/tiktok-shop/auto-video", {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          productIds: selectedProductIds,
          tone,
          durationSec
        })
      });
      await loadOverview();
    } finally {
      setLoading(false);
    }
  }

  function toggleProduct(productId) {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((item) => item !== productId) : [...current, productId]
    );
  }

  return (
    <section>
      <h2 className="section-title">TikTok Shop Automation</h2>
      <div className="toolbar">
        <button type="button" onClick={syncShowcase} disabled={loading}>
          Sync Showcase
        </button>
        <button type="button" onClick={generateVideos} disabled={loading}>
          Generate Drafts ({selectedCount || "All"})
        </button>
        <button type="button" onClick={loadIntelligence} disabled={loading}>
          AI Analyze
        </button>
        <button type="button" onClick={downloadExcel} disabled={loading}>
          Export Excel
        </button>
        <input placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} />
        <input value={tone} onChange={(event) => setTone(event.target.value)} placeholder="Tone" />
        <input
          type="number"
          min={10}
          max={90}
          value={durationSec}
          onChange={(event) => setDurationSec(Number(event.target.value) || 25)}
        />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <strong>Showcase Products ({overview.showcaseCount})</strong>
        {filteredProducts.map((product) => (
          <label key={product.id} style={{ display: "block", marginTop: 8 }}>
            <input
              type="checkbox"
              checked={selectedProductIds.includes(product.id)}
              onChange={() => toggleProduct(product.id)}
            />{" "}
            {product.title} — ฿{product.price} ({product.source})
          </label>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <strong>User Profiles ({overview.userProfilesCount})</strong>
        {overview.userProfiles.map((profile) => (
          <div key={profile.id} style={{ marginTop: 8 }}>
            <strong>{profile.username}</strong> ({profile.source}) • orders: {profile.orderCount} • spent: ฿{profile.totalSpent}
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              nickname: {profile.nickname || "-"} | email: {profile.email || "-"} | phone: {profile.phone || "-"}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <strong>AI Insight</strong>
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{insight || "Click AI Analyze to generate insight."}</pre>
      </div>

      <div>
        <h3 className="section-title">Automation Jobs</h3>
        {overview.jobs.map((job) => (
          <div key={job.id} className="card" style={{ marginBottom: 8 }}>
            <strong>{job.id}</strong> • {job.status} • {job.durationSec}s • tone: {job.tone}
            {job.drafts.map((draft) => (
              <details key={draft.productId}>
                <summary>{draft.productId}</summary>
                <pre style={{ whiteSpace: "pre-wrap" }}>{draft.script}</pre>
              </details>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
