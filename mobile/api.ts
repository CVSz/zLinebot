export async function triggerRetrain() {
  await fetch("/api/admin/retrain", { method: "POST" });
}

export async function toggleExperiment(id: string) {
  await fetch(`/api/admin/experiment/${id}/toggle`, { method: "POST" });
}
