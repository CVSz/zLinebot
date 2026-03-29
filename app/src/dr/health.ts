export async function checkPrimary(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:3000/health");
    return res.ok;
  } catch {
    return false;
  }
}
