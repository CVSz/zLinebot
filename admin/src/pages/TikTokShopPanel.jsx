import { useEffect, useMemo, useState } from "react";

const apiHeaders = {
  "x-api-key": "demo",
  "x-tenant-id": "demo",
  "Content-Type": "application/json"
};

export default function TikTokShopPanel() {
  const [overview, setOverview] = useState({ showcaseProducts: [], jobs: [], showcaseCount: 0 });
  const [tone, setTone] = useState("energetic");
  const [durationSec, setDurationSec] = useState(25);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedCount = useMemo(() => selectedProductIds.length, [selectedProductIds]);

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
      <h2>TikTok Shop Control Panel</h2>
      <p>Sync showcase products and auto-generate TikTok video drafts from selected items.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={syncShowcase} disabled={loading}>
          Sync Showcase
        </button>
        <button type="button" onClick={generateVideos} disabled={loading}>
          Generate Video Drafts ({selectedCount || "All"})
        </button>
        <label>
          Tone:
          <input value={tone} onChange={(event) => setTone(event.target.value)} />
        </label>
        <label>
          Duration (sec):
          <input
            type="number"
            min={10}
            max={90}
            value={durationSec}
            onChange={(event) => setDurationSec(Number(event.target.value) || 25)}
          />
        </label>
      </div>

      <h3>Showcase Products ({overview.showcaseCount})</h3>
      {overview.showcaseProducts.map((product) => (
        <label key={product.id} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selectedProductIds.includes(product.id)}
            onChange={() => toggleProduct(product.id)}
          />
          {product.title} — ฿{product.price} ({product.source})
        </label>
      ))}

      <h3>Automation Jobs</h3>
      {overview.jobs.map((job) => (
        <div key={job.id} style={{ border: "1px solid #ddd", padding: 8, marginBottom: 8 }}>
          <strong>{job.id}</strong> • {job.status} • {job.durationSec}s • tone: {job.tone}
          {job.drafts.map((draft) => (
            <details key={draft.productId}>
              <summary>{draft.productId}</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{draft.script}</pre>
            </details>
          ))}
        </div>
      ))}
    </section>
  );
}
